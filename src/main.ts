import './style.css';
import { DokployAPI } from './api';
import type {
  Project,
  Environment,
  Application,
  Compose,
  Domain,
} from './types';
import {
  renderHeader,
  attachHeaderListeners,
  updatePageTitle,
} from './components/header';
import {
  renderSidebar,
  attachSidebarListeners,
  toggleSidebar,
  getSidebarState,
  updateActiveNavItem,
} from './components/sidebar';

// localStorage key for API key
const STORAGE_KEY_API_KEY = 'dokploy_api_key';

// localStorage utility functions
function saveApiKey(apiKey: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_API_KEY, apiKey);
  } catch (error) {
    console.error('Failed to save API key to localStorage:', error);
  }
}

function loadApiKey(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_API_KEY);
  } catch (error) {
    console.error('Failed to load API key from localStorage:', error);
    return null;
  }
}

function clearApiKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_API_KEY);
    showToast('Saved API key cleared');
  } catch (error) {
    console.error('Failed to clear API key from localStorage:', error);
  }
}

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

  const domainItems = domains.map(domain => {
    const protocol = domain.https ? 'https' : 'http';
    const url = `${protocol}://${domain.host}${domain.path !== '/' ? domain.path : ''}`;

    return `
      <div class="domain-item">
        <span class="domain-badge ${domain.https ? 'https' : 'http'}">
          ${domain.https ? 'HTTPS' : 'HTTP'}
        </span>
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="domain-link">
          ${domain.host}${domain.path !== '/' ? domain.path : ''}
        </a>
        ${domain.port ? `<span style="color: var(--text-muted);">:${domain.port}</span>` : ''}
      </div>
    `;
  }).join('');

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
        ${renderDetail('GitHub ID', app.githubId)}
        ${renderDetail('Registry ID', app.registryId)}
        ${renderDetail('Server ID', app.serverId)}
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

// Interface for ID items
interface IdItem {
  id: string;
  name: string;
  project?: string;
  environment?: string;
}

// Extract all IDs from projects data
function extractAllIds(projects: Project[]): Record<string, IdItem[]> {
  const ids: Record<string, IdItem[]> = {
    projects: [],
    environments: [],
    applications: [],
    compose: [],
    postgres: [],
    mysql: [],
    mariadb: [],
    mongo: [],
    redis: [],
    domains: [],
    githubIds: [],
    registryIds: [],
    serverIds: [],
  };

  // Use Sets to track unique IDs we've already added
  const uniqueIds = {
    githubIds: new Set<string>(),
    registryIds: new Set<string>(),
    serverIds: new Set<string>(),
  };

  projects.forEach(project => {
    // Add project ID
    ids.projects.push({
      id: project.projectId,
      name: project.name,
    });

    project.environments.forEach(env => {
      // Add environment ID
      ids.environments.push({
        id: env.environmentId,
        name: env.name,
        project: project.name,
      });

      // Add application IDs
      env.applications?.forEach(app => {
        ids.applications.push({
          id: app.applicationId,
          name: app.name,
          project: project.name,
          environment: env.name,
        });

        // Add GitHub IDs (deduplicated)
        if (app.githubId && !uniqueIds.githubIds.has(app.githubId)) {
          uniqueIds.githubIds.add(app.githubId);
          ids.githubIds.push({
            id: app.githubId,
            name: `GitHub (${app.name})`,
            project: project.name,
            environment: env.name,
          });
        }

        // Add Registry IDs (deduplicated)
        if (app.registryId && !uniqueIds.registryIds.has(app.registryId)) {
          uniqueIds.registryIds.add(app.registryId);
          ids.registryIds.push({
            id: app.registryId,
            name: `Registry (${app.name})`,
            project: project.name,
            environment: env.name,
          });
        }

        // Add Server IDs (deduplicated)
        if (app.serverId && !uniqueIds.serverIds.has(app.serverId)) {
          uniqueIds.serverIds.add(app.serverId);
          ids.serverIds.push({
            id: app.serverId,
            name: `Server (${app.name})`,
            project: project.name,
            environment: env.name,
          });
        }

        // Add domain IDs
        app.domains?.forEach(domain => {
          ids.domains.push({
            id: domain.domainId,
            name: domain.host,
            project: project.name,
            environment: env.name,
          });
        });
      });

      // Add compose IDs
      env.compose?.forEach(comp => {
        ids.compose.push({
          id: comp.composeId,
          name: comp.name,
          project: project.name,
          environment: env.name,
        });

        // Add domain IDs from compose
        comp.domains?.forEach(domain => {
          ids.domains.push({
            id: domain.domainId,
            name: domain.host,
            project: project.name,
            environment: env.name,
          });
        });
      });

      // Add database IDs
      env.postgres?.forEach(db => {
        ids.postgres.push({
          id: db.postgresId,
          name: db.name,
          project: project.name,
          environment: env.name,
        });
      });

      env.mysql?.forEach(db => {
        ids.mysql.push({
          id: db.mysqlId,
          name: db.name,
          project: project.name,
          environment: env.name,
        });
      });

      env.mariadb?.forEach(db => {
        ids.mariadb.push({
          id: db.mariadbId,
          name: db.name,
          project: project.name,
          environment: env.name,
        });
      });

      env.mongo?.forEach(db => {
        ids.mongo.push({
          id: db.mongoId,
          name: db.name,
          project: project.name,
          environment: env.name,
        });
      });

      env.redis?.forEach(db => {
        ids.redis.push({
          id: db.redisId,
          name: db.name,
          project: project.name,
          environment: env.name,
        });
      });
    });
  });

  // Sort all arrays by name (alphabetically)
  Object.keys(ids).forEach(key => {
    ids[key].sort((a, b) => a.name.localeCompare(b.name));
  });

  return ids;
}

// Render a single ID section
function renderIdSection(title: string, icon: string, items: IdItem[], idLabel: string): HTMLElement | null {
  if (items.length === 0) return null;

  const section = document.createElement('div');
  section.className = 'resource-section';

  const header = document.createElement('div');
  header.className = 'resource-header';
  header.innerHTML = `
    <span class="resource-title">${icon} ${title}</span>
    <span class="resource-count">${items.length}</span>
  `;
  section.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'resource-grid';

  items.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'resource-item';

    const itemHeader = document.createElement('div');
    itemHeader.className = 'resource-item-header';

    const nameDiv = document.createElement('div');
    nameDiv.innerHTML = `
      <div class="resource-name">${item.name}</div>
      ${item.project ? `<div class="resource-app-name">${item.project}${item.environment ? ` → ${item.environment}` : ''}</div>` : ''}
    `;

    itemHeader.appendChild(nameDiv);
    itemHeader.appendChild(createCopyableId(item.id, idLabel));
    itemEl.appendChild(itemHeader);

    grid.appendChild(itemEl);
  });

  section.appendChild(grid);
  return section;
}

// Display all IDs
function displayAllIds(projects: Project[]) {
  const idsContainer = document.getElementById('ids-container');
  if (!idsContainer) return;

  // Clear existing content
  idsContainer.innerHTML = '';

  // Extract all IDs
  const allIds = extractAllIds(projects);

  // Define sections to render with their metadata
  const sections = [
    { key: 'projects', title: 'Projects', icon: '📦', label: 'Project ID' },
    { key: 'environments', title: 'Environments', icon: '📦', label: 'Environment ID' },
    { key: 'applications', title: 'Applications', icon: '🚀', label: 'Application ID' },
    { key: 'compose', title: 'Docker Compose', icon: '🐳', label: 'Compose ID' },
    { key: 'postgres', title: 'PostgreSQL Databases', icon: '🐘', label: 'Postgres ID' },
    { key: 'mysql', title: 'MySQL Databases', icon: '🐬', label: 'MySQL ID' },
    { key: 'mariadb', title: 'MariaDB Databases', icon: '🗄️', label: 'MariaDB ID' },
    { key: 'mongo', title: 'MongoDB Databases', icon: '🍃', label: 'Mongo ID' },
    { key: 'redis', title: 'Redis Databases', icon: '🔴', label: 'Redis ID' },
    { key: 'domains', title: 'Domains', icon: '🌐', label: 'Domain ID' },
    { key: 'githubIds', title: 'GitHub IDs', icon: '📁', label: 'GitHub ID' },
    { key: 'registryIds', title: 'Registry IDs', icon: '📦', label: 'Registry ID' },
    { key: 'serverIds', title: 'Server IDs', icon: '🖥️', label: 'Server ID' },
  ];

  // Render each section
  sections.forEach(({ key, title, icon, label }) => {
    const section = renderIdSection(title, icon, allIds[key], label);
    if (section) {
      idsContainer.appendChild(section);
    }
  });

  // If no IDs found, show a message
  if (idsContainer.children.length === 0) {
    const noDataMsg = document.createElement('div');
    noDataMsg.className = 'card';
    noDataMsg.innerHTML = '<p class="info-text">No IDs found. Please connect to Dokploy first.</p>';
    idsContainer.appendChild(noDataMsg);
  }
}

// Show/hide sections
function showSection(sectionId: string) {
  const sections = ['config-section', 'loading-section', 'error-section', 'data-section', 'ids-section'];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === sectionId) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    }
  });

  // Update page title based on section
  const titles: Record<string, string> = {
    'config-section': 'Configuration',
    'loading-section': 'Loading',
    'error-section': 'Error',
    'data-section': 'Dashboard',
    'ids-section': 'All IDs',
  };

  if (titles[sectionId]) {
    updatePageTitle(titles[sectionId]);
  }
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
    displayAllIds(projects);
    showSection('data-section');
  } catch (error) {
    console.error('Error loading data:', error);
    showError(error instanceof Error ? error.message : 'Failed to load data from Dokploy server');
  }
}

// Initialize layout
function initializeLayout() {
  const headerContainer = document.getElementById('header-container');
  const sidebarContainer = document.getElementById('sidebar-container');
  const appContainer = document.querySelector('.app-container');

  if (headerContainer) {
    headerContainer.innerHTML = renderHeader();
    attachHeaderListeners(toggleSidebar);
  }

  const navItems = [
    {
      id: 'dashboard',
      icon: '📊',
      title: 'Dashboard',
      onClick: () => {
        showSection('data-section');
        updateActiveNavItem('dashboard');
      },
    },
    {
      id: 'ids',
      icon: '🔑',
      title: 'All IDs',
      onClick: () => {
        showSection('ids-section');
        updateActiveNavItem('ids');
      },
    },
    {
      id: 'config',
      icon: '⚙️',
      title: 'Configuration',
      onClick: () => {
        showSection('config-section');
        updateActiveNavItem('config');
      },
    },
  ];

  if (sidebarContainer) {
    sidebarContainer.innerHTML = renderSidebar(navItems);
    attachSidebarListeners();
  }

  // Apply initial collapsed state
  if (appContainer && getSidebarState()) {
    appContainer.classList.add('sidebar-collapsed');
  }

  // Set initial active nav item
  updateActiveNavItem('config');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Initialize layout components
  initializeLayout();

  const configForm = document.getElementById('config-form') as HTMLFormElement;
  const retryBtn = document.getElementById('retry-btn');

  if (configForm) {
    configForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const apiKeyInput = document.getElementById('api-key') as HTMLInputElement;

      if (apiKeyInput) {
        const apiKey = apiKeyInput.value.trim();

        if (apiKey) {
          // Save API key to localStorage
          saveApiKey(apiKey);

          // Always use empty string for same-origin proxy endpoint
          loadData('', apiKey);
        }
      }
    });
  }

  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      showSection('config-section');
      updateActiveNavItem('config');
    });
  }

  // Auto-populate API key from localStorage if it exists
  const savedApiKey = loadApiKey();
  if (savedApiKey) {
    const apiKeyInput = document.getElementById('api-key') as HTMLInputElement;
    if (apiKeyInput) {
      apiKeyInput.value = savedApiKey;
      showToast('Saved API key loaded');
    }
  }

  // Handle clear API key button
  const clearBtn = document.getElementById('clear-api-key-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearApiKey();
      const apiKeyInput = document.getElementById('api-key') as HTMLInputElement;
      if (apiKeyInput) {
        apiKeyInput.value = '';
        apiKeyInput.focus();
      }
    });
  }
});
