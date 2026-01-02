// Editor UI sections
const editorSections = {
  personalInfo: `
    <div class="editor-section" id="personal-section">
      <h3>Personal Information</h3>
      <div class="form-group">
        <label>Full Name</label>
        <input type="text" id="fullName" placeholder="John Doe" />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="email" placeholder="john@example.com" />
      </div>
      <div class="form-group">
        <label>Phone</label>
        <input type="tel" id="phone" placeholder="(555) 123-4567" />
      </div>
      <div class="form-group">
        <label>LinkedIn</label>
        <input type="url" id="linkedin" placeholder="linkedin.com/in/johndoe" />
      </div>
      <div class="form-group">
        <label>GitHub</label>
        <input type="url" id="github" placeholder="github.com/johndoe" />
      </div>
    </div>
  `,

  experience: `
    <div class="editor-section" id="experience-section">
      <div class="section-header">
        <h3>Experience</h3>
        <button class="btn-add" onclick="addExperienceEntry()">+ Add Experience</button>
      </div>
      <div id="experience-list"></div>
    </div>
  `,

  education: `
    <div class="editor-section" id="education-section">
      <div class="section-header">
        <h3>Education</h3>
        <button class="btn-add" onclick="addEducationEntry()">+ Add Education</button>
      </div>
      <div id="education-list"></div>
    </div>
  `,

  skills: `
    <div class="editor-section" id="skills-section">
      <h3>Skills</h3>
      <div class="form-group">
        <label>Languages</label>
        <textarea id="languages" placeholder="JavaScript, Python, Java" rows="2"></textarea>
      </div>
      <div class="form-group">
        <label>Frameworks & Libraries</label>
        <textarea id="frameworks" placeholder="React, Node.js, Django" rows="2"></textarea>
      </div>
      <div class="form-group">
        <label>Tools & Platforms</label>
        <textarea id="tools" placeholder="Git, Docker, AWS" rows="2"></textarea>
      </div>
    </div>
  `,

  projects: `
    <div class="editor-section" id="projects-section">
      <div class="section-header">
        <h3>Projects</h3>
        <button class="btn-add" onclick="addProjectEntry()">+ Add Project</button>
      </div>
      <div id="projects-list"></div>
    </div>
  `
};

function renderExperienceEntry(entry) {
  return `
    <div class="entry-card" data-id="${entry.id}">
      <div class="entry-header">
        <input type="text" class="entry-title" value="${escHtml(entry.jobTitle || '')}" placeholder="Job Title" />
        <button class="btn-delete" onclick="deleteEntry('experience', '${entry.id}')">🗑</button>
      </div>
      <div class="form-row">
        <input type="text" class="entry-input" value="${escHtml(entry.company || '')}" placeholder="Company" />
        <input type="text" class="entry-input" value="${escHtml(entry.location || '')}" placeholder="Location" />
      </div>
      <div class="form-row">
        <input type="month" class="entry-input" value="${entry.startDate || ''}" />
        <span>to</span>
        <input type="month" class="entry-input" value="${entry.endDate || ''}" />
      </div>
      <textarea class="entry-textarea" placeholder="Add bullet points (one per line)" rows="3">${(entry.bullets || []).join('\n')}</textarea>
      <input type="text" class="entry-input" value="${escHtml(entry.techStack || '')}" placeholder="Tech Stack (optional)" />
    </div>
  `;
}

function renderEducationEntry(entry) {
  return `
    <div class="entry-card" data-id="${entry.id}">
      <div class="entry-header">
        <input type="text" class="entry-title" value="${escHtml(entry.degree || '')}" placeholder="Degree" />
        <button class="btn-delete" onclick="deleteEntry('education', '${entry.id}')">🗑</button>
      </div>
      <div class="form-row">
        <input type="text" class="entry-input" value="${escHtml(entry.school || '')}" placeholder="School" />
        <input type="text" class="entry-input" value="${escHtml(entry.location || '')}" placeholder="Location" />
      </div>
      <div class="form-row">
        <input type="month" class="entry-input" value="${entry.startDate || ''}" />
        <span>to</span>
        <input type="month" class="entry-input" value="${entry.endDate || ''}" />
      </div>
      <div class="form-row">
        <input type="text" class="entry-input" value="${escHtml(entry.gpa || '')}" placeholder="GPA" />
        <input type="text" class="entry-input" value="${escHtml(entry.coursework || '')}" placeholder="Coursework" />
      </div>
    </div>
  `;
}

function renderProjectEntry(entry) {
  return `
    <div class="entry-card" data-id="${entry.id}">
      <div class="entry-header">
        <input type="text" class="entry-title" value="${escHtml(entry.name || '')}" placeholder="Project Name" />
        <button class="btn-delete" onclick="deleteEntry('projects', '${entry.id}')">🗑</button>
      </div>
      <div class="form-row">
        <input type="url" class="entry-input" value="${escHtml(entry.link || '')}" placeholder="GitHub Link" />
        <input type="url" class="entry-input" value="${escHtml(entry.liveLink || '')}" placeholder="Live Link" />
      </div>
      <input type="text" class="entry-input" value="${escHtml(entry.tech || '')}" placeholder="Technologies" />
      <textarea class="entry-textarea" placeholder="Description" rows="2">${escHtml(entry.description || '')}</textarea>
      <textarea class="entry-textarea" placeholder="Achievements (one per line)" rows="2">${(entry.bullets || []).join('\n')}</textarea>
    </div>
  `;
}

function addExperienceEntry() {
  entryManager.addEntry('experience', {
    jobTitle: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    bullets: [],
    techStack: ''
  });
  renderUI();
}

function addEducationEntry() {
  entryManager.addEntry('education', {
    degree: '',
    school: '',
    location: '',
    startDate: '',
    endDate: '',
    gpa: '',
    coursework: ''
  });
  renderUI();
}

function addProjectEntry() {
  entryManager.addEntry('projects', {
    name: '',
    tech: '',
    link: '',
    liveLink: '',
    description: '',
    bullets: []
  });
  renderUI();
}

function deleteEntry(section, id) {
  Modal.confirm(`Delete this ${section} entry?`).then(confirmed => {
    if (confirmed) {
      entryManager.deleteEntry(section, id);
      renderUI();
    }
  });
}
