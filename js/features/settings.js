// Settings management
const settingsManager = {
  openSettingsModal: function() {
    Modal.open('Resume Settings', this._renderSettingsForm(), [
      { text: 'Cancel', value: false, primary: false },
      { text: 'Save', value: true, primary: true }
    ]).then(saved => {
      if (saved) {
        this._applySettings();
      }
    });
  },

  _renderSettingsForm: function() {
    const settings = state.data.settings;
    return `
      <div class="settings-form">
        <div class="form-group">
          <label>Template</label>
          <select id="settings-template">
            <option value="modern" ${settings.template === 'modern' ? 'selected' : ''}>Modern</option>
            <option value="classic" ${settings.template === 'classic' ? 'selected' : ''}>Classic</option>
            <option value="minimal" ${settings.template === 'minimal' ? 'selected' : ''}>Minimal</option>
            <option value="swe" ${settings.template === 'swe' ? 'selected' : ''}>SWE</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Accent Color</label>
          <div class="color-picker-group">
            <input type="color" id="settings-color" value="${settings.accentColor}" />
            <span class="color-label">${settings.accentColor}</span>
          </div>
        </div>
        
        <div class="form-group">
          <label>Font</label>
          <select id="settings-font">
            <option value="lato" ${settings.font === 'lato' ? 'selected' : ''}>Lato (Modern)</option>
            <option value="calibri" ${settings.font === 'calibri' ? 'selected' : ''}>Calibri (Professional)</option>
            <option value="cambria" ${settings.font === 'cambria' ? 'selected' : ''}>Cambria (Classic)</option>
            <option value="georgia" ${settings.font === 'georgia' ? 'selected' : ''}>Georgia (Elegant)</option>
            <option value="arial" ${settings.font === 'arial' ? 'selected' : ''}>Arial (Universal)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Background Color</label>
          <div class="color-picker-group">
            <input type="color" id="settings-bg" value="${settings.bgColor}" />
            <span class="color-label">${settings.bgColor}</span>
          </div>
        </div>

        <div class="settings-preview">
          <p><strong>Preview:</strong></p>
          <div id="settings-preview-box" class="preview-box"></div>
        </div>
      </div>
    `;
  },

  _applySettings: function() {
    const template = document.getElementById('settings-template')?.value;
    const color = document.getElementById('settings-color')?.value;
    const font = document.getElementById('settings-font')?.value;
    const bgColor = document.getElementById('settings-bg')?.value;

    if (template) state.data.settings.template = template;
    if (color) state.data.settings.accentColor = color;
    if (font) state.data.settings.font = font;
    if (bgColor) state.data.settings.bgColor = bgColor;

    state.saveToStorage();
    this._applyTheme();
    renderPreview();
  },

  _applyTheme: function() {
    const settings = state.data.settings;
    
    // Apply CSS variables
    document.documentElement.style.setProperty('--primary-color', settings.accentColor);
    document.documentElement.style.setProperty('--bg-primary', settings.bgColor);
    
    // Apply template class
    document.body.className = `template-${settings.template}`;
    
    // Apply font
    const fontMap = {
      'lato': '"Lato", sans-serif',
      'calibri': '"Calibri", sans-serif',
      'cambria': '"Cambria", serif',
      'georgia': '"Georgia", serif',
      'arial': '"Arial", sans-serif'
    };
    document.body.style.fontFamily = fontMap[settings.font];
  }
};
