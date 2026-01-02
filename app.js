/**
 * LuminaCV - Main Application
 * Browser-based resume builder with live preview
 */

(function() {
  'use strict';

  // ============================================
  // Initialize Application
  // ============================================

  document.addEventListener('DOMContentLoaded', function() {
    // Load data from storage
    state.loadFromStorage();
    
    // Render initial UI
    renderUI();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load sample data if empty
    if (!state.data.cv.personalInfo.fullName) {
      loadSampleData();
    }
  });

  // ============================================
  // UI Rendering
  // ============================================

  function renderUI() {
    renderPersonalInfo();
    renderExperienceList();
    renderEducationList();
    renderSkills();
    renderProjectsList();
    renderPreview();
  }

  function renderPersonalInfo() {
    document.getElementById('fullName').value = state.data.cv.personalInfo.fullName || '';
    document.getElementById('email').value = state.data.cv.personalInfo.email || '';
    document.getElementById('phone').value = state.data.cv.personalInfo.phone || '';
    document.getElementById('linkedin').value = state.data.cv.personalInfo.linkedin || '';
    document.getElementById('github').value = state.data.cv.personalInfo.github || '';
  }

  function renderExperienceList() {
    const list = document.getElementById('experience-list');
    list.innerHTML = state.data.cv.experience
      .map(entry => renderExperienceEntry(entry))
      .join('');
  }

  function renderEducationList() {
    const list = document.getElementById('education-list');
    list.innerHTML = state.data.cv.education
      .map(entry => renderEducationEntry(entry))
      .join('');
  }

  function renderSkills() {
    document.getElementById('languages').value = state.data.cv.skills.languages || '';
    document.getElementById('frameworks').value = state.data.cv.skills.frameworks || '';
    document.getElementById('tools').value = state.data.cv.skills.tools || '';
  }

  function renderProjectsList() {
    const list = document.getElementById('projects-list');
    list.innerHTML = state.data.cv.projects
      .map(entry => renderProjectEntry(entry))
      .join('');
  }

  function renderPreview() {
    const preview = document.getElementById('preview');
    const cv = state.data.cv;
    
    let html = `
      <div class="cv-content">
        <div class="cv-header">
          <h1>${escHtml(cv.personalInfo.fullName || 'Your Name')}</h1>
          <div class="cv-contact">
            ${cv.personalInfo.email ? `<span>${escHtml(cv.personalInfo.email)}</span>` : ''}
            ${cv.personalInfo.phone ? `<span>${escHtml(cv.personalInfo.phone)}</span>` : ''}
            ${cv.personalInfo.linkedin ? `<span>${escHtml(cv.personalInfo.linkedin)}</span>` : ''}
            ${cv.personalInfo.github ? `<span>${escHtml(cv.personalInfo.github)}</span>` : ''}
          </div>
        </div>
    `;

    if (cv.experience && cv.experience.length > 0) {
      html += `<div class="cv-section">
        <h2>Experience</h2>`;
      cv.experience.forEach(exp => {
        html += `
          <div class="cv-entry">
            <div class="entry-title">${escHtml(exp.jobTitle)} at ${escHtml(exp.company)}</div>
            <div class="entry-subtitle">${escHtml(exp.location)} | ${exp.startDate} to ${exp.endDate}</div>
            <ul>
              ${exp.bullets.map(b => `<li>${formatTextHTML(b)}</li>`).join('')}
            </ul>
          </div>
        `;
      });
      html += `</div>`;
    }

    if (cv.education && cv.education.length > 0) {
      html += `<div class="cv-section">
        <h2>Education</h2>`;
      cv.education.forEach(edu => {
        html += `
          <div class="cv-entry">
            <div class="entry-title">${escHtml(edu.degree)}</div>
            <div class="entry-subtitle">${escHtml(edu.school)} | ${edu.location}</div>
          </div>
        `;
      });
      html += `</div>`;
    }

    if (cv.skills && (cv.skills.languages || cv.skills.frameworks || cv.skills.tools)) {
      html += `<div class="cv-section">
        <h2>Skills</h2>
        ${cv.skills.languages ? `<p><strong>Languages:</strong> ${escHtml(cv.skills.languages)}</p>` : ''}
        ${cv.skills.frameworks ? `<p><strong>Frameworks:</strong> ${escHtml(cv.skills.frameworks)}</p>` : ''}
        ${cv.skills.tools ? `<p><strong>Tools:</strong> ${escHtml(cv.skills.tools)}</p>` : ''}
      </div>`;
    }

    if (cv.projects && cv.projects.length > 0) {
      html += `<div class="cv-section">
        <h2>Projects</h2>`;
      cv.projects.forEach(proj => {
        html += `
          <div class="cv-entry">
            <div class="entry-title">${escHtml(proj.name)}</div>
            ${proj.tech ? `<div class="entry-subtitle">Tech: ${escHtml(proj.tech)}</div>` : ''}
            <p>${escHtml(proj.description)}</p>
          </div>
        `;
      });
      html += `</div>`;
    }

    html += `</div>`;
    preview.innerHTML = html;
  }

  // ============================================
  // Event Listeners
  // ============================================

  function setupEventListeners() {
    // Personal info
    ['fullName', 'email', 'phone', 'linkedin', 'github'].forEach(id => {
      document.getElementById(id).addEventListener('change', function() {
        state.data.cv.personalInfo[id === 'fullName' ? 'fullName' : id] = this.value;
        state.saveToStorage();
        renderPreview();
      });
    });

    // Skills
    ['languages', 'frameworks', 'tools'].forEach(id => {
      document.getElementById(id).addEventListener('change', function() {
        state.data.cv.skills[id] = this.value;
        state.saveToStorage();
        renderPreview();
      });
    });
  }

  // ============================================
  // Sample Data
  // ============================================

  function loadSampleData() {
    state.data.cv = {
      personalInfo: {
        fullName: 'Alex Johnson',
        email: 'alex@example.com',
        phone: '(555) 987-6543',
        linkedin: 'linkedin.com/in/alexjohnson',
        github: 'github.com/alexjohnson'
      },
      experience: [{
        id: genId(),
        jobTitle: 'Senior Software Engineer',
        company: 'Tech Corp',
        location: 'San Francisco, CA',
        startDate: '2022-01',
        endDate: 'present',
        bullets: [
          'Led development of React-based dashboard',
          'Improved API performance by 40%'
        ],
        techStack: 'React, Node.js, PostgreSQL'
      }],
      education: [{
        id: genId(),
        degree: 'B.S. Computer Science',
        school: 'Stanford University',
        location: 'Stanford, CA',
        startDate: '2018-09',
        endDate: '2022-05',
        gpa: '3.8'
      }],
      skills: {
        languages: 'JavaScript, Python, Java',
        frameworks: 'React, Express, Django',
        tools: 'Git, Docker, AWS'
      },
      projects: [{
        id: genId(),
        name: 'LuminaCV',
        tech: 'JavaScript, HTML, CSS',
        link: 'github.com/user/luminacv',
        liveLink: 'luminacv.example.com',
        description: 'Browser-based resume builder with live preview',
        bullets: ['No backend required', 'PDF, JSON exports']
      }]
    };
    state.saveToStorage();
    renderUI();
  }

})();
