const app = document.getElementById("app");

const state = {
  data: [],
  expanded: new Set(),
  selectedFileId: null,
  focusedId: null,
  search: "",
  starred: new Set(loadStarredFiles())
};

const nodeMap = new Map();
const parentMap = new Map();

app.innerHTML = `
  <div class="shell">
    <header class="topbar">
      <div>
        <p class="eyebrow">SecureVault Inc.</p>
        <h1>Vault File Explorer</h1>
      </div>
      <div class="topbar-actions">
        <button class="ghost-button" id="collapseAllButton" type="button">Collapse all</button>
      </div>
    </header>

    <main class="workspace">
      <section class="explorer-panel">
        <div class="panel-head">
          <div>
            <p class="panel-label">Navigator</p>
            <h2>Secure container map</h2>
          </div>
          <div class="status-pill" id="resultsSummary">Loading vault...</div>
        </div>

        <div class="toolbar">
          <label class="search-field">
            <span class="search-icon">Search</span>
            <input id="searchBox" type="search" placeholder="Search files and folders">
          </label>
          <button class="ghost-button" id="clearSearchButton" type="button">Clear</button>
        </div>

        <div class="tree-wrapper">
          <div id="tree" class="tree" role="tree" aria-label="SecureVault file explorer"></div>
        </div>
      </section>

      <aside class="details-panel">
        <div class="details-card">
          <p class="panel-label">Inspection</p>
          <h2>File properties</h2>
          <div id="detailsContent"></div>
        </div>

        <div class="details-card">
          <p class="panel-label">Quick access</p>
          <h2>Starred files</h2>
          <p class="muted-copy">Star important files for quick access, and unstar them any time.</p>
          <div id="favoritesList" class="favorites-list"></div>
        </div>
      </aside>
    </main>
  </div>
`;
