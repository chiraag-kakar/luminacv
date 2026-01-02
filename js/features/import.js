// Import functionality - Markdown parser
const importFunctions = {
  importFromMarkdown: async function(file) {
    try {
      const text = await file.text();
      const parsed = this._parseMarkdown(text);
      Modal.alert('Resume imported successfully!');
      return parsed;
    } catch (error) {
      Modal.alert(`Import failed: ${error.message}`);
      return null;
    }
  },

  // Simple markdown parser
  _parseMarkdown: function(md) {
    const cvData = JSON.parse(JSON.stringify(defaults.cvData));
    const lines = md.split('\n');
    let currentSection = null;
    let currentEntry = null;

    lines.forEach(line => {
      line = line.trim();

      if (line.startsWith('# ')) {
        cvData.personalInfo.fullName = line.replace('# ', '');
      } else if (line.startsWith('## ')) {
        currentSection = line.replace('## ', '').toLowerCase();
      } else if (line.startsWith('### ')) {
        if (currentSection === 'experience') {
          currentEntry = {
            id: genId(),
            jobTitle: line.replace('### ', ''),
            company: '',
            bullets: []
          };
          cvData.experience.push(currentEntry);
        } else if (currentSection === 'education') {
          currentEntry = {
            id: genId(),
            degree: line.replace('### ', ''),
            school: ''
          };
          cvData.education.push(currentEntry);
        } else if (currentSection === 'projects') {
          currentEntry = {
            id: genId(),
            name: line.replace('### ', ''),
            bullets: []
          };
          cvData.projects.push(currentEntry);
        }
      } else if (line.startsWith('- ')) {
        if (currentEntry) {
          currentEntry.bullets.push(line.replace('- ', ''));
        }
      } else if (line.startsWith('**') && line.includes(':')) {
        const [key, value] = line.split(':').map(s => s.replace(/\*\*/g, '').trim());
        if (currentEntry && currentEntry.hasOwnProperty(key.toLowerCase())) {
          currentEntry[key.toLowerCase()] = value;
        } else if (key === 'Email') {
          cvData.personalInfo.email = value;
        } else if (key === 'Phone') {
          cvData.personalInfo.phone = value;
        }
      }
    });

    return cvData;
  }
};
