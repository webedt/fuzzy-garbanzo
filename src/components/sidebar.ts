/**
 * Sidebar Component
 * Manages the navigation sidebar with collapse functionality
 */

const SIDEBAR_STATE_KEY = 'dokploy-sidebar-collapsed';

interface NavItem {
  id: string;
  icon: string;
  title: string;
  onClick: () => void;
}

let navItems: NavItem[] = [];

/**
 * Gets the sidebar collapsed state from localStorage
 */
export function getSidebarState(): boolean {
  return localStorage.getItem(SIDEBAR_STATE_KEY) === 'true';
}

/**
 * Sets the sidebar collapsed state in localStorage
 */
export function setSidebarState(collapsed: boolean): void {
  localStorage.setItem(SIDEBAR_STATE_KEY, collapsed.toString());
}

/**
 * Toggles the sidebar collapsed state
 */
export function toggleSidebar(): void {
  const sidebar = document.querySelector('.sidebar');
  const appContainer = document.querySelector('.app-container');
  const currentState = getSidebarState();
  const newState = !currentState;

  if (sidebar) {
    if (newState) {
      sidebar.classList.add('collapsed');
    } else {
      sidebar.classList.remove('collapsed');
    }
  }

  if (appContainer) {
    if (newState) {
      appContainer.classList.add('sidebar-collapsed');
    } else {
      appContainer.classList.remove('sidebar-collapsed');
    }
  }

  setSidebarState(newState);
}

/**
 * Renders the sidebar component
 */
export function renderSidebar(items: NavItem[]): string {
  navItems = items;
  const isCollapsed = getSidebarState();

  const navItemsHtml = items
    .map(
      (item) => `
    <li class="nav-item" data-nav-id="${item.id}">
      <a href="#" class="nav-link">
        <span class="nav-icon">${item.icon}</span>
        <span class="nav-title">${item.title}</span>
      </a>
    </li>
  `
    )
    .join('');

  return `
    <aside class="sidebar${isCollapsed ? ' collapsed' : ''}">
      <nav class="sidebar-nav">
        <ul class="nav-list">
          ${navItemsHtml}
        </ul>
      </nav>
    </aside>
  `;
}

/**
 * Updates the active navigation item
 */
export function updateActiveNavItem(activeId: string): void {
  const navItemElements = document.querySelectorAll('.nav-item');

  navItemElements.forEach((item) => {
    const navId = item.getAttribute('data-nav-id');
    if (navId === activeId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

/**
 * Attaches event listeners to the sidebar
 */
export function attachSidebarListeners(): void {
  const navItemElements = document.querySelectorAll('.nav-item');

  navItemElements.forEach((item) => {
    const navId = item.getAttribute('data-nav-id');
    const navItem = navItems.find((i) => i.id === navId);

    if (navItem) {
      const link = item.querySelector('.nav-link');
      if (link) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          navItem.onClick();
          updateActiveNavItem(navItem.id);
        });
      }
    }
  });
}
