import './style.css';
import { DokployAPI } from './api';
import type {
  Project,
  Environment,
  Application,
  Compose,
  Domain,
} from './types';

// Toast notification
function showToast(message: string) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }
}

// Copy to clipboard
function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Copied ${label} to clipboard!`);
  }).catch(err => {
    console.error('Failed to copy:', err);
    showToast('Failed to copy to clipboard');
  });
}

// Create copyable ID element
function createCopyableId(id: string, label: string, className: string = 'resource-id'): HTMLElement {
  const idEl = document.createElement('span');
  idEl.className = className;
  idEl.innerHTML = `
    <span class="copy-icon">📋</span>
    <span>${id}</span>
  `;
  idEl.title = `Click to copy ${label}`;
  idEl.onclick = () => copyToClipboard(id, label);
  return idEl;
}

// Render domains
function renderDomains(domains: Domain[] | undefined): string {
  if (!domains || domains.length === 0) return '';

  const domainItems = domains.map(domain => `
    <div class="domain-item">
      <span class="domain-badge ${domain.https ? 'https' : 'http'}">
        ${domain.https ? 'HTTPS' : 'HTTP'}
      </span>
      <span>${domain.host}${domain.path !== '/' ? domain.path : ''}</span>
      ${domain.port ? `<span style="color: var(--text-muted);">:${domain.port}</span>` : ''}
    </div>
  `).join('');

  return `
    <div class="domains-list">
      <div class="detail-label" style="margin-bottom: 0.5rem;">Domains:</div>
      ${domainItems}
    </div>
  `;
}

// Render detail row
function renderDetail(label: string, value: string | undefined): string {
  if (!value) return '';
  return `
    <div class="detail-row">
      <span class="detail-label">${label}:</span>
      <span class="detail-value" title="${value}">${value}</span>
    </div>
  `;
}

// Render applications
function renderApplications(apps: Application[] | undefined, container: HTMLElement) {
  if (!apps || apps.length === 0) return;

  const section = document.createElement('div');
  section.className = 'resource-section';
  section.innerHTML = `
    <div class="resource-header">
      <span class="resource-title">🚀 Applications</span>
      <span class="resource-count">${apps.length}</span>
    </div>
    <div class="resource-grid" id="apps-grid"></div>
  `;

  const grid = section.querySelector('#apps-grid');
  if (grid) {
    apps.forEach(app => {
      const item = document.createElement('div');
      item.className = 'resource-item';

      const header = document.createElement('div');
      header.className = 'resource-item-header';

      const nameDiv = document.createElement('div');
      nameDiv.innerHTML = `
        <div class="resource-name">${app.name}</div>
        <div class="resource-app-name">${app.appName}</div>
      `;

      header.appendChild(nameDiv);
      header.appendChild(createCopyableId(app.applicationId, 'Application ID'));
      item.appendChild(header);

      const details = document.createElement('div');
      details.className = 'resource-details';
      details.innerHTML = `
        ${renderDetail('Build Type', app.buildType)}
        ${renderDetail('Source Type', app.sourceType)}
        ${renderDetail('Repository', app.repository)}
        ${renderDetail('Branch', app.branch)}
        ${renderDetail('Docker Image', app.dockerImage)}
        ${renderDetail('Build Path', app.buildPath)}
        ${renderDomains(app.domains)}
      `;
      item.appendChild(details);

      grid.appendChild(item);
    });
  }

  container.appendChild(section);
}

// Render compose services
function renderCompose(compose: Compose[] | undefined, container: HTMLElement) {
  if (!compose || compose.length === 0) return;

  const section = document.createElement('div');
  section.className = 'resource-section';
  section.innerHTML = `
    <div class="resource-header">
      <span class="resource-title">🐳 Docker Compose</span>
      <span class="resource-count">${compose.length}</span>
    </div>
    <div class="resource-grid" id="compose-grid"></div>
  `;

  const grid = section.querySelector('#compose-grid');
  if (grid) {
    compose.forEach(comp => {
      const item = document.createElement('div');
      item.className = 'resource-item';

      const header = document.createElement('div');
      header.className = 'resource-item-header';

      const nameDiv = document.createElement('div');
      nameDiv.innerHTML = `
        <div class="resource-name">${comp.name}</div>
        <div class="resource-app-name">${comp.appName}</div>
      `;

      header.appendChild(nameDiv);
      header.appendChild(createCopyableId(comp.composeId, 'Compose ID'));
      item.appendChild(header);

      const details = document.createElement('div');
      details.className = 'resource-details';
      details.innerHTML = `
        ${renderDetail('Source Type', comp.sourceType)}
        ${renderDetail('Repository', comp.repository)}
        ${renderDetail('Branch', comp.branch)}
        ${renderDomains(comp.domains)}
      `;
      item.appendChild(details);

      grid.appendChild(item);
    });
  }

  container.appendChild(section);
}

// Render databases
function renderDatabases(env: Environment, container: HTMLElement) {
  const databases: { type: string; items: any[] }[] = [];

  if (env.postgres && env.postgres.length > 0) {
    databases.push({ type: '🐘 PostgreSQL', items: env.postgres });
  }
  if (env.mysql && env.mysql.length > 0) {
    databases.push({ type: '🐬 MySQL', items: env.mysql });
  }
  if (env.mariadb && env.mariadb.length > 0) {
    databases.push({ type: '🗄️ MariaDB', items: env.mariadb });
  }
  if (env.mongo && env.mongo.length > 0) {
    databases.push({ type: '🍃 MongoDB', items: env.mongo });
  }
  if (env.redis && env.redis.length > 0) {
    databases.push({ type: '🔴 Redis', items: env.redis });
  }

  databases.forEach(({ type, items }) => {
    const section = document.createElement('div');
    section.className = 'resource-section';
    section.innerHTML = `
      <div class="resource-header">
        <span class="resource-title">${type}</span>
        <span class="resource-count">${items.length}</span>
      </div>
      <div class="resource-grid" id="db-grid-${type}"></div>
    `;

    const grid = section.querySelector(`#db-grid-${type}`);
    if (grid) {
      items.forEach(db => {
        const item = document.createElement('div');
        item.className = 'resource-item';

        const header = document.createElement('div');
        header.className = 'resource-item-header';

        const nameDiv = document.createElement('div');
        nameDiv.innerHTML = `
          <div class="resource-name">${db.name}</div>
          <div class="resource-app-name">${db.appName}</div>
        `;

        // Get the correct ID field based on database type
        const idField = db.postgresId || db.mysqlId || db.mariadbId || db.mongoId || db.redisId;
        const idLabel = type.includes('PostgreSQL') ? 'Postgres ID' :
                       type.includes('MySQL') ? 'MySQL ID' :
                       type.includes('MariaDB') ? 'MariaDB ID' :
                       type.includes('MongoDB') ? 'Mongo ID' :
                       'Redis ID';

        header.appendChild(nameDiv);
        header.appendChild(createCopyableId(idField, idLabel));
        item.appendChild(header);

        const details = document.createElement('div');
        details.className = 'resource-details';
        details.innerHTML = `
          ${renderDetail('Database Name', db.databaseName)}
          ${renderDetail('Docker Image', db.dockerImage)}
          ${renderDetail('User', db.databaseUser)}
        `;
        item.appendChild(details);

        grid.appendChild(item);
      });
    }

    container.appendChild(section);
  });
}

// Render environment
function renderEnvironment(env: Environment): HTMLElement {
  const envEl = document.createElement('div');
  envEl.className = 'environment';

  const header = document.createElement('div');
  header.className = 'environment-header';

  const nameEl = document.createElement('div');
  nameEl.className = 'environment-name';
  nameEl.textContent = `📦 ${env.name}`;

  header.appendChild(nameEl);
  header.appendChild(createCopyableId(env.environmentId, 'Environment ID', 'env-id'));
  envEl.appendChild(header);

  // Render all resources
  renderApplications(env.applications, envEl);
  renderCompose(env.compose, envEl);
  renderDatabases(env, envEl);

  return envEl;
}

// Render project
function renderProject(project: Project): HTMLElement {
  const card = document.createElement('div');
  card.className = 'card project-card';

  const header = document.createElement('div');
  header.className = 'project-header';

  const titleDiv = document.createElement('div');
  const titleEl = document.createElement('h2');
  titleEl.className = 'project-title';
  titleEl.textContent = project.name;
  titleDiv.appendChild(titleEl);

  if (project.description) {
    const descEl = document.createElement('p');
    descEl.style.color = 'var(--text-secondary)';
    descEl.textContent = project.description;
    titleDiv.appendChild(descEl);
  }

  header.appendChild(titleDiv);
  header.appendChild(createCopyableId(project.projectId, 'Project ID', 'project-id'));
  card.appendChild(header);

  // Render environments
  const envsContainer = document.createElement('div');
  envsContainer.className = 'environments';

  project.environments.forEach(env => {
    envsContainer.appendChild(renderEnvironment(env));
  });

  card.appendChild(envsContainer);

  return card;
}

// Display data
function displayData(projects: Project[]) {
  const projectsContainer = document.getElementById('projects-container');
  if (!projectsContainer) return;

  // Clear existing content
  projectsContainer.innerHTML = '';

  // Update stats
  let totalApplications = 0;
  let totalDatabases = 0;
  let totalCompose = 0;

  projects.forEach(project => {
    project.environments.forEach(env => {
      totalApplications += env.applications?.length || 0;
      totalCompose += env.compose?.length || 0;
      totalDatabases += (env.postgres?.length || 0) +
                       (env.mysql?.length || 0) +
                       (env.mariadb?.length || 0) +
                       (env.mongo?.length || 0) +
                       (env.redis?.length || 0);
    });
  });

  const totalProjectsEl = document.getElementById('total-projects');
  const totalAppsEl = document.getElementById('total-applications');
  const totalDbEl = document.getElementById('total-databases');
  const totalComposeEl = document.getElementById('total-compose');

  if (totalProjectsEl) totalProjectsEl.textContent = projects.length.toString();
  if (totalAppsEl) totalAppsEl.textContent = totalApplications.toString();
  if (totalDbEl) totalDbEl.textContent = totalDatabases.toString();
  if (totalComposeEl) totalComposeEl.textContent = totalCompose.toString();

  // Render projects
  projects.forEach(project => {
    projectsContainer.appendChild(renderProject(project));
  });
}

// Show/hide sections
function showSection(sectionId: string) {
  const sections = ['config-section', 'loading-section', 'error-section', 'data-section'];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = id === sectionId ? 'block' : 'none';
    }
  });
}

// Show error
function showError(message: string) {
  const errorMessageEl = document.getElementById('error-message');
  if (errorMessageEl) {
    errorMessageEl.textContent = message;
  }
  showSection('error-section');
}

// Load data
async function loadData(apiUrl: string, apiKey: string) {
  showSection('loading-section');

  try {
    const api = new DokployAPI(apiUrl, apiKey);
    const projects = await api.fetchProjects();

    displayData(projects);
    showSection('data-section');
  } catch (error) {
    console.error('Error loading data:', error);
    showError(error instanceof Error ? error.message : 'Failed to load data from Dokploy server');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const configForm = document.getElementById('config-form') as HTMLFormElement;
  const retryBtn = document.getElementById('retry-btn');

  if (configForm) {
    configForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const apiUrlInput = document.getElementById('api-url') as HTMLInputElement;
      const apiKeyInput = document.getElementById('api-key') as HTMLInputElement;

      if (apiUrlInput && apiKeyInput) {
        const apiUrl = apiUrlInput.value.trim();
        const apiKey = apiKeyInput.value.trim();

        if (apiUrl && apiKey) {
          loadData(apiUrl, apiKey);
        }
      }
    });
  }

  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      showSection('config-section');
    });
  }
});
