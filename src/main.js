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

function render() {
  const visible = getVisibleNodes();
  const selected = nodeMap.get(state.selectedFileId);

  treeEl.innerHTML = visible.length
    ? visible.map(renderNode).join("")
    : `
      <div class="empty-state">
        <p class="empty-title">No matching files</p>
        <p class="muted-copy">Try another search term.</p>
      </div>
    `;

  resultsSummary.textContent = `${visible.filter(isFolder).length} folders | ${visible.filter(isFile).length} files visible`;
  renderDetails(selected);
  renderFavorites();

  if (document.activeElement !== searchBox) {
    focusItem();
  }
}

function renderNode(node) {
  const isFolderNode = node.type === "folder";
  const isExpanded = state.expanded.has(node.id);
  const isSelected = state.selectedFileId === node.id;
  const isFocused = state.focusedId === node.id;
  const isStarred = state.starred.has(node.id);
  const typeIcon = getNodeIcon(node);
  const classes = [
    "tree-item",
    isSelected ? "is-selected" : "",
    isFocused ? "is-focused" : "",
    isStarred ? "is-starred" : ""
  ].filter(Boolean).join(" ");

  return `
    <div
      id="treeitem-${node.id}"
      class="${classes}"
      role="treeitem"
      tabindex="${isFocused ? "0" : "-1"}"
      ${isFolderNode ? `aria-expanded="${isExpanded}"` : ""}
      data-id="${node.id}"
      style="--depth:${node.depth};"
    >
      <div class="tree-item-main">
        <span class="caret">${isFolderNode ? (isExpanded ? "▼" : "▶") : "•"}</span>
        <span class="node-glyph">${typeIcon}</span>
        <span class="node-name">${highlight(node.name)}</span>
      </div>
      <div class="tree-item-meta">
        <span class="node-badge">${isFolderNode ? `${node.children.length} items` : node.size || "-"}</span>
        ${!isFolderNode ? `
          <button
            class="star-button ${isStarred ? "is-on" : ""}"
            type="button"
            data-star="true"
            data-id="${node.id}"
            aria-label="${isStarred ? "Unstar file" : "Star file"}"
            title="${isStarred ? "Unstar file" : "Star file"}"
          >${isStarred ? "★" : "☆"}</button>
        ` : ""}
      </div>
    </div>
  `;
}

function renderDetails(node) {
  if (!node || node.type !== "file") {
    detailsContent.innerHTML = `
      <div class="empty-state">
        <p class="empty-title">No file selected</p>
        <p class="muted-copy">Click a file to view its details.</p>
      </div>
    `;
    return;
  }
  
detailsContent.innerHTML = `
    <div class="properties-grid">
      <div class="property-block">
        <span class="property-label">Name</span>
        <strong>${node.name}</strong>
      </div>
      <div class="property-block">
        <span class="property-label">Type</span>
        <strong>${getFileType(node.name)}</strong>
      </div>
      <div class="property-block">
        <span class="property-label">Size</span>
        <strong>${node.size || "-"}</strong>
      </div>
      <div class="property-block property-path">
        <span class="property-label">Path</span>
        <strong>${getPath(node.id).join(" / ")}</strong>
      </div>
    </div>
  `;
}

function renderFavorites() {
  const favorites = [...state.starred]
    .map((id) => nodeMap.get(id))
    .filter((node) => node && node.type === "file");

  if (!favorites.length) {
    favoritesList.innerHTML = `
      <div class="empty-state compact">
        <p class="muted-copy">No starred files yet.</p>
      </div>
    `;
    return;
  }

  favoritesList.innerHTML = favorites.map((node) => `
    <button class="favorite-item" type="button" data-favorite="${node.id}">
      <span>★ ${node.name}</span>
      <small>${getPath(node.id).slice(0, -1).join(" / ")}</small>
    </button>
  `).join("");

  favoritesList.querySelectorAll("[data-favorite]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.favorite;
      openParents(id);
      state.focusedId = id;
      state.selectedFileId = id;
      render();
    });
  });
}

function getVisibleNodes(nodes = state.data, depth = 0) {
  let visible = [];

  nodes.forEach((node) => {
    if (!matchesSearch(node)) {
      return;
    }

    visible.push({ ...node, depth, children: node.children || [] });

    if (node.type === "folder" && state.expanded.has(node.id)) {
      visible = visible.concat(getVisibleNodes(node.children || [], depth + 1));
    }
  });

  return visible;
}