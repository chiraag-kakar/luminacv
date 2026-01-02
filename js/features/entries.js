// Entry management for CV sections
const entryManager = {
  // Add new entry to section
  addEntry: function(section, entryData = {}) {
    const id = genId();
    const entry = { id, ...entryData };
    
    if (!state.data.cv[section]) {
      state.data.cv[section] = [];
    }
    state.data.cv[section].push(entry);
    state.saveToStorage();
    return entry;
  },

  // Update existing entry
  updateEntry: function(section, id, updates) {
    const idx = state.data.cv[section].findIndex(e => e.id === id);
    if (idx !== -1) {
      state.data.cv[section][idx] = { ...state.data.cv[section][idx], ...updates };
      state.saveToStorage();
    }
  },

  // Delete entry
  deleteEntry: function(section, id) {
    state.data.cv[section] = state.data.cv[section].filter(e => e.id !== id);
    state.saveToStorage();
  },

  // Get all entries in section
  getEntries: function(section) {
    return state.data.cv[section] || [];
  }
};
