// State management and persistence
class StateManager {
  constructor() {
    this.data = {
      cv: JSON.parse(JSON.stringify(defaults.cvData)),
      settings: JSON.parse(JSON.stringify(defaults.settings))
    };
  }

  getCVData() {
    return this.data.cv;
  }

  getSettings() {
    return this.data.settings;
  }

  updateCVData(newData) {
    this.data.cv = { ...this.data.cv, ...newData };
    this.saveToStorage();
  }

  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.saveToStorage();
  }

  saveToStorage() {
    try {
      localStorage.setItem('luminacv_data', JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('luminacv_data');
      if (stored) {
        this.data = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
  }
}

const state = new StateManager();
