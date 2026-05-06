const app = document.getElementById("app");

const state = {
  data: [],
  expanded: new Set(),
  selectedFileId: null,
  focusedId: null,
  search: "",
  starred: new Set(loadStarredFiles())
};
