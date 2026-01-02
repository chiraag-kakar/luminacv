// Statistics and keyboard shortcuts
const stats = {
  calculate: function() {
    const cv = state.data.cv;
    let wordCount = 0;
    let characterCount = 0;

    // Count personal info
    const personalText = Object.values(cv.personalInfo).join(' ');
    wordCount += personalText.split(/\s+/).filter(w => w.length > 0).length;
    characterCount += personalText.length;

    // Count experience
    cv.experience.forEach(exp => {
      wordCount += (exp.jobTitle + exp.company + exp.bullets.join(' ')).split(/\s+/).filter(w => w.length > 0).length;
    });

    // Count education
    cv.education.forEach(edu => {
      wordCount += (edu.degree + edu.school).split(/\s+/).filter(w => w.length > 0).length;
    });

    // Count skills
    const skillsText = Object.values(cv.skills).join(' ');
    wordCount += skillsText.split(/\s+/).filter(w => w.length > 0).length;

    // Count projects
    cv.projects.forEach(proj => {
      wordCount += (proj.name + proj.description + proj.bullets.join(' ')).split(/\s+/).filter(w => w.length > 0).length;
    });

    return {
      wordCount,
      characterCount,
      sectionCount: 5,
      entryCount: cv.experience.length + cv.education.length + cv.projects.length
    };
  },

  displayStats: function() {
    const st = this.calculate();
    Modal.alert(`
📊 Resume Statistics:
• Words: ${st.wordCount}
• Characters: ${st.characterCount}
• Entries: ${st.entryCount}
• Sections: ${st.sectionCount}
    `);
  }
};

// Keyboard shortcuts
const shortcuts = {
  init: function() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + E: Export PDF
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportFunctions.exportPDF(state.data.cv);
      }
      // Ctrl/Cmd + S: Save (already auto-saving, show notification)
      else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        Modal.alert('✅ Resume auto-saved to browser storage');
      }
      // Ctrl/Cmd + Shift + E: Export JSON
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        exportFunctions.exportJSON(state.data.cv);
      }
      // Ctrl/Cmd + Shift + S: Share
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        shareFunctions.generateShareURL(state.data.cv);
      }
      // Ctrl/Cmd + ,: Settings
      else if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        settingsManager.openSettingsModal();
      }
      // Ctrl/Cmd + /: Show help
      else if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        this.showHelp();
      }
    });
  },

  showHelp: function() {
    Modal.alert(`
⌨️ Keyboard Shortcuts:

Ctrl/Cmd + E    Export to PDF
Ctrl/Cmd + S    Save (auto-save enabled)
Ctrl/Cmd + Shift + E    Export as JSON
Ctrl/Cmd + Shift + S    Share link
Ctrl/Cmd + ,    Open settings
Ctrl/Cmd + /    Show this help

💡 Tip: Your resume auto-saves every change!
    `);
  }
};
