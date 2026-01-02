/**
 * LuminaCV - Main Application
 * Browser-based resume builder with live preview
 */

(function() {
  'use strict';

  // ============================================
  // State Management
  // ============================================
  
  let cvData = {
    personalInfo: {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      linkedin: 'linkedin.com/in/johndoe',
      github: 'github.com/johndoe'
    },
    experience: [],
    education: [],
    skills: {
      languages: 'JavaScript, Python, Java',
      frameworks: 'React, Vue, Express',
      tools: 'Git, Docker, AWS'
    },
    projects: []
  };

  let settings = {
    template: 'modern',
    accentColor: '#2563eb',
    font: 'lato'
  };

  // ============================================
  // Initialization
  // ============================================

  document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    renderPreview();
  });

  function initializeApp() {
    const editor = document.getElementById('editor');
    if (editor) {
      editor.addEventListener('input', debounce(function() {
        updateFromEditor();
        renderPreview();
      }, 300));
    }
  }

  // ============================================
  // Utilities
  // ============================================

  function debounce(fn, delay) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }

  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // ============================================
  // Editor Functions
  // ============================================

  function updateFromEditor() {
    const editor = document.getElementById('editor');
    if (!editor) return;
    
    // Parse editor content (simple format)
    const lines = editor.value.split('\n');
    cvData.personalInfo.fullName = lines[0] || 'John Doe';
  }

  function renderPreview() {
    const preview = document.getElementById('preview');
    if (!preview) return;

    const html = `
      <div class="cv-content">
        <div class="cv-header">
          <h1>${escapeHtml(cvData.personalInfo.fullName)}</h1>
          <div class="cv-contact">
            <span>${escapeHtml(cvData.personalInfo.email)}</span>
            <span>${escapeHtml(cvData.personalInfo.phone)}</span>
          </div>
        </div>
        
        <div class="cv-section">
          <h2>Skills</h2>
          <p><strong>Languages:</strong> ${escapeHtml(cvData.skills.languages)}</p>
          <p><strong>Frameworks:</strong> ${escapeHtml(cvData.skills.frameworks)}</p>
          <p><strong>Tools:</strong> ${escapeHtml(cvData.skills.tools)}</p>
        </div>
      </div>
    `;

    preview.innerHTML = html;
  }

  // ============================================
  // Export Functions (Stub)
  // ============================================

  window.exportPDF = function() {
    console.log('Export PDF - Coming soon');
  };

  window.exportJSON = function() {
    console.log('Export JSON:', JSON.stringify(cvData, null, 2));
  };

})();
