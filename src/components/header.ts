/**
 * Header Component
 * Manages the application header with navigation toggle and title
 */

/**
 * Renders the header component
 */
export function renderHeader(): string {
  return `
    <header class="header">
      <div class="header-left">
        <button
          class="menu-toggle"
          id="menuToggle"
          aria-label="Toggle sidebar"
        >
          <span class="hamburger-icon"></span>
        </button>
        <h1 class="app-title">Dokploy Dashboard</h1>
      </div>
      <div class="header-center">
        <h2 class="page-title" id="pageTitle">Dashboard</h2>
      </div>
      <div class="header-right">
        <!-- Additional header controls can go here -->
      </div>
    </header>
  `;
}

/**
 * Updates the page title in the header
 */
export function updatePageTitle(title: string): void {
  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle) {
    pageTitle.textContent = title;
  }
}

/**
 * Updates the document title (browser tab)
 */
export function updateDocumentTitle(title: string): void {
  document.title = `${title} - Dokploy Dashboard`;
}

/**
 * Attaches event listeners to the header
 */
export function attachHeaderListeners(onMenuToggle: () => void): void {
  const menuToggle = document.getElementById('menuToggle');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      onMenuToggle();
    });
  }
}
