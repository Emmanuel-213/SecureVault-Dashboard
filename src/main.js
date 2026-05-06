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

const treeEl = document.getElementById("tree");
const searchBox = document.getElementById("searchBox");
const detailsContent = document.getElementById("detailsContent");
const favoritesList = document.getElementById("favoritesList");
const resultsSummary = document.getElementById("resultsSummary");
const collapseAllButton = document.getElementById("collapseAllButton");
const clearSearchButton = document.getElementById("clearSearchButton");

fetch("./data.json")
  .then((response) => response.json())
  .then((data) => {
    state.data = data;
    buildMaps(data);

    if (data[0]) {
      state.focusedId = data[0].id;
      if (data[0].type === "folder") {
        state.expanded.add(data[0].id);
      }
    }

    addEvents();
    render();
  })
  .catch(() => {
    detailsContent.innerHTML = `
      <div class="empty-state">
        <p class="empty-title">Vault is unavailable</p>
        <p class="muted-copy">Could not load data.json.</p>
      </div>
    `;
  });

function addEvents() {
  searchBox.addEventListener("input", () => {
    state.search = searchBox.value.trim().toLowerCase();
    autoExpandSearch();
    render();
  });

  clearSearchButton.addEventListener("click", () => {
    state.search = "";
    searchBox.value = "";
    render();
  });

  collapseAllButton.addEventListener("click", () => {
    state.expanded.clear();
    if (state.search) {
      autoExpandSearch();
    }
    render();
  });

  treeEl.addEventListener("click", (event) => {
    const item = event.target.closest("[data-id]");
    if (!item) {
      return;
    }

    const id = item.dataset.id;
    const node = nodeMap.get(id);
    state.focusedId = id;

    if (event.target.closest("[data-star]")) {
      toggleStar(id);
      return;
    }

    if (node.type === "folder") {
      toggleFolder(id);
    } else {
      state.selectedFileId = id;
    }

    render();
});


treeEl.addEventListener("keydown", (event) => {
    const visible = getVisibleNodes();
    const index = visible.findIndex((item) => item.id === state.focusedId);
    if (index === -1) {
    return;
    }

    if (event.key === "ArrowDown" && visible[index + 1]) {
    event.preventDefault();
    state.focusedId = visible[index + 1].id;
    focusItem();
    }

    if (event.key === "ArrowUp" && visible[index - 1]) {
    event.preventDefault();
    state.focusedId = visible[index - 1].id;
    focusItem();
    }

    if (event.key === "ArrowRight") {
    event.preventDefault();
    if (visible[index].type === "folder") {
        state.expanded.add(visible[index].id);
        render();
    }
    }

    
    if (event.key === "ArrowLeft") {
    event.preventDefault();
    if (visible[index].type === "folder" && state.expanded.has(visible[index].id)) {
        state.expanded.delete(visible[index].id);
        render();
    } else {
        const parentId = parentMap.get(visible[index].id);
        if (parentId) {
        state.focusedId = parentId;
        focusItem();
        }
    }
    }

    if (event.key === "Enter") {
    event.preventDefault();
    const current = visible[index];
    if (current.type === "file") {
        state.selectedFileId = current.id;
    } else {
        toggleFolder(current.id);
    }
    render();
    }
});
}
