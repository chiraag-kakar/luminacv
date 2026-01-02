// LuminaCV - Professional Resume Builder
// Pure Vanilla JavaScript Implementation

(function() {
  'use strict';

  const STORAGE_KEY = 'luminacv_data';
  
  // Check if we're in shared/view-only mode
  let isViewMode = false;
  let sharedCVData = null;
  
  // Floating formatter state
  let floatingFormatter = null;
  let activeTextarea = null;
  
  // Custom Modal System
  const Modal = {
    container: null,
    
    init() {
      if (this.container) return;
      this.container = document.createElement('div');
      this.container.className = 'modal-overlay';
      this.container.innerHTML = `
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title"></h3>
            <button class="modal-close" aria-label="Close">&times;</button>
          </div>
          <div class="modal-body"></div>
          <div class="modal-footer"></div>
        </div>
      `;
      document.body.appendChild(this.container);
      
      // Close handlers
      this.container.querySelector('.modal-close').addEventListener('click', () => this.close());
      this.container.addEventListener('click', (e) => {
        if (e.target === this.container) this.close();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.container.classList.contains('open')) this.close();
      });
    },
    
    open({ title = '', content = '', buttons = [], type = 'default' }) {
      this.init();
      this.container.querySelector('.modal-title').textContent = title;
      this.container.querySelector('.modal-body').innerHTML = content;
      this.container.querySelector('.modal-container').className = `modal-container modal-${type}`;
      
      const footer = this.container.querySelector('.modal-footer');
      footer.innerHTML = '';
      buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = `modal-btn ${btn.primary ? 'modal-btn-primary' : 'modal-btn-secondary'}`;
        button.textContent = btn.text;
        button.addEventListener('click', () => {
          if (btn.action) btn.action();
          if (btn.close !== false) this.close();
        });
        footer.appendChild(button);
      });
      
      this.container.classList.add('open');
      document.body.style.overflow = 'hidden';
    },
    
    close() {
      if (this.container) {
        this.container.classList.remove('open');
        document.body.style.overflow = '';
      }
    },
    
    confirm({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, danger = false }) {
      this.open({
        title,
        content: `<p>${message}</p>`,
        type: danger ? 'danger' : 'default',
        buttons: [
          { text: cancelText, primary: false },
          { text: confirmText, primary: true, action: onConfirm }
        ]
      });
    },
    
    alert({ title, message, buttonText = 'OK' }) {
      this.open({
        title,
        content: `<p>${message}</p>`,
        buttons: [{ text: buttonText, primary: true }]
      });
    },
    
    prompt({ title, message, placeholder = '', defaultValue = '', onSubmit }) {
      const inputId = 'modal-prompt-input';
      this.open({
        title,
        content: `<p>${message}</p><input type="text" id="${inputId}" class="modal-input" placeholder="${placeholder}" value="${defaultValue}">`,
        buttons: [
          { text: 'Cancel', primary: false },
          { text: 'Submit', primary: true, action: () => {
            const value = document.getElementById(inputId).value;
            if (onSubmit) onSubmit(value);
          }}
        ]
      });
      setTimeout(() => document.getElementById(inputId)?.focus(), 100);
    }
  };
  
  // Generate short share ID from CV data
  function generateShareId(data) {
    const name = (data.personalInfo?.fullName || 'cv').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'cv';
    const expYears = data.experience?.length || 0;
    const timestamp = Date.now().toString(36).slice(-6);
    return `${name}_${expYears}y_${timestamp}`;
  }
  
  // Simple LZ-based compression for URL sharing
  const LZString = {
    compress: function(str) {
      if (!str) return '';
      try {
        // Use built-in compression via btoa with URI encoding
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode('0x' + p1)));
      } catch (e) {
        return '';
      }
    },
    decompress: function(str) {
      if (!str) return '';
      try {
        return decodeURIComponent(atob(str).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      } catch (e) {
        return '';
      }
    }
  };
  
  // Check URL for shared CV data on load
  function checkForSharedCV() {
    const urlParams = new URLSearchParams(window.location.search);
    // Support both new 'r' format and legacy 'cv' format
    const sharedData = urlParams.get('r') || urlParams.get('cv');
    if (sharedData) {
      try {
        const jsonStr = LZString.decompress(sharedData);
        const data = JSON.parse(jsonStr);
        if (data && data.personalInfo) {
          isViewMode = true;
          sharedCVData = data;
          return data;
        }
      } catch (e) {
        console.error('Failed to parse shared CV:', e);
      }
    }
    return null;
  }

  const defaultData = {
    personalInfo: { fullName: '', phone: '', email: '', linkedin: '', github: '' },
    experience: [],
    education: [],
    skills: { languages: '', frameworks: '', tools: '' },
    projects: []
  };

  // Sample resume data for demonstration
  const sampleData = {
    personalInfo: {
      fullName: 'Alex Johnson',
      phone: '+1 (555) 123-4567',
      email: 'alex.johnson@email.com',
      linkedin: 'linkedin.com/in/alexjohnson',
      github: 'github.com/alexjohnson'
    },
    experience: [
      {
        id: 'exp1',
        jobTitle: 'Senior Software Engineer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        startDate: 'Jan 2022',
        endDate: 'Present',
        bullets: [
          '**Architected** microservices infrastructure using *Node.js and Docker*, serving __2M+ monthly__ active users',
          'Led **team of 5 engineers** in redesigning payment processing system, reducing transaction latency by **45%**',
          'Implemented automated testing framework with __92% code coverage__ using Jest and Selenium',
          'Mentored 3 junior developers and established *code review standards* across the organization'
        ],
        techStack: 'Node.js, Express, PostgreSQL, Docker, AWS, Kubernetes',
        expanded: true
      },
      {
        id: 'exp2',
        jobTitle: 'Full Stack Developer',
        company: 'StartupXYZ',
        location: 'Remote',
        startDate: 'Jul 2020',
        endDate: 'Dec 2021',
        bullets: [
          'Built responsive web application using React and TypeScript serving 10K+ daily active users',
          'Designed and deployed scalable REST API using Express and MongoDB handling 1000 requests/second',
          'Optimized database queries reducing page load time from 3.2s to 0.8s (75% improvement)',
          'Implemented real-time notifications using WebSocket and Socket.io'
        ],
        techStack: 'React, TypeScript, Node.js, MongoDB, Redis, AWS',
        expanded: false
      }
    ],
    education: [
      {
        id: 'edu1',
        degree: 'Bachelor of Science in Computer Science',
        school: 'University of California, Berkeley',
        location: 'Berkeley, CA',
        startDate: 'Aug 2016',
        endDate: 'May 2020',
        cgpa: '3.8/4.0',
        expanded: true
      },
      {
        id: 'edu2',
        degree: 'Advanced Certification in Cloud Architecture',
        school: 'AWS Training Academy',
        location: 'Online',
        startDate: 'Jan 2021',
        endDate: 'Apr 2021',
        cgpa: '',
        expanded: false
      }
    ],
    skills: {
      languages: 'JavaScript, TypeScript, Python, Java, Go, SQL',
      frameworks: 'React, Node.js, Express, Next.js, Django, Spring Boot',
      tools: 'Git, Docker, Kubernetes, AWS, PostgreSQL, MongoDB, Redis, CI/CD'
    },
    projects: [
      {
        id: 'proj1',
        name: 'E-Commerce Platform',
        link: 'github.com/alexjohnson/ecommerce-platform',
        liveLink: 'ecommerce-demo.example.com',
        description: 'Full-stack e-commerce platform with real-time inventory management and payment integration supporting 50K+ products',
        technologies: 'React, Node.js, PostgreSQL, Stripe, Docker',
        expanded: true
      },
      {
        id: 'proj2',
        name: 'Data Visualization Dashboard',
        link: 'github.com/alexjohnson/dashboard',
        liveLink: 'dashboard-demo.example.com',
        description: 'Interactive analytics dashboard visualizing 100M+ data points with real-time updates and custom filtering',
        technologies: 'React, D3.js, WebSocket, Node.js, InfluxDB',
        expanded: false
      },
      {
        id: 'proj3',
        name: 'Open Source Contribution',
        link: 'github.com/openproject/core',
        liveLink: '',
        description: 'Contributed 15+ pull requests to popular open-source project with 10K+ GitHub stars',
        technologies: 'TypeScript, Jest, Webpack',
        expanded: false
      }
    ]
  };

  // Template definitions with distinct styling
  const templates = {
    modern: { 
      name: 'Modern', 
      color: '#3b82f6',
      headerStyle: 'centered',
      sectionStyle: 'colored-line',
      description: 'Clean, centered header with blue accents'
    },
    classic: { 
      name: 'Classic', 
      color: '#1f2937',
      headerStyle: 'left-aligned',
      sectionStyle: 'full-underline',
      description: 'Traditional left-aligned professional layout'
    },
    minimal: { 
      name: 'Minimal', 
      color: '#6b7280',
      headerStyle: 'compact',
      sectionStyle: 'simple',
      description: 'Ultra-clean with minimal decoration'
    },
    swe: { 
      name: 'SWE', 
      color: '#000000',
      headerStyle: 'centered',
      sectionStyle: 'full-underline',
      description: 'Software Engineer template (Overleaf-style)'
    }
  };

  // Theme and display settings
  const defaultSettings = {
    template: 'modern',
    accentColor: '#3b82f6',
    font: 'lato',  // NEW: font selection
    bgColor: '#ffffff',  // NEW: background color
    sectionOrder: ['experience', 'education', 'skills', 'projects'],
    customSections: []  // NEW: custom sections
  };

  // NEW: Font options
  const fontOptions = {
    lato: { name: 'Lato', stack: "'Lato', 'Calibri', sans-serif" },
    calibri: { name: 'Calibri', stack: "'Calibri', 'Arial', sans-serif" },
    cambria: { name: 'Cambria', stack: "'Cambria', 'Georgia', serif" },
    georgia: { name: 'Georgia', stack: "'Georgia', serif" },
    arial: { name: 'Arial', stack: "'Arial', 'Helvetica', sans-serif" }
  };

  // NEW: Background color options (light colors only)
  const bgColorOptions = {
    '#ffffff': 'White',
    '#fffbf0': 'Cream',
    '#fef5e7': 'Beige',
    '#f5f5f5': 'Light Grey',
    '#f0fdf4': 'Light Green',
    '#f8f9fa': 'Off-white'
  };

  let cvData = loadFromStorage() || JSON.parse(JSON.stringify(defaultData));
  let settings = loadSettingsFromStorage() || JSON.parse(JSON.stringify(defaultSettings));
  let activeTab = 'personal';
  let splitRatio = 50;
  let isDragging = false;
  let draggedItem = null;

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  function loadSettingsFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_settings');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
      localStorage.setItem(STORAGE_KEY + '_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Save failed:', e);
    }
  }

  function genId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  function escHtml(str) {
    if (!str) return '';
    const el = document.createElement('div');
    el.textContent = str;
    return el.innerHTML;
  }

  // NEW: Format text for HTML display (interprets **bold** *italic* __underline__)
  function formatTextHTML(text) {
    if (!text) return '';
    return escHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>')
      .replace(/__(.+?)__/g, '<u>$1</u>')
      .replace(/\r\n/g, '<br>');
  }

  // NEW: Format text for LaTeX (interprets **bold** *italic* __underline__)
  function formatTextLaTeX(text, esc) {
    if (!text) return '';
    return esc(text)
      .replace(/\*\*(.+?)\*\*/g, '\\textbf{$1}')
      .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '\\textit{$1}')
      .replace(/__(.+?)__/g, '\\underline{$1}');
  }

  // NEW: Extract plain text (removes formatting)
  function plainText(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/__(.+?)__/g, '$1');
  }

  function showNotification(message) {
    // Create notification element
    const notif = document.createElement('div');
    notif.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      animation: slideIn 0.3s ease-out;
    `;
    notif.textContent = message;
    document.body.appendChild(notif);
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `@keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
    document.head.appendChild(style);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notif.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  }

  // SVG Icons
  const icons = {
    file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
    download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>`,
    upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>`,
    reset: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v16m8-8H4"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
    chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 9l-7 7-7-7"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>`,
    code: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>`,
    json: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>`,
    chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
    settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m4.22-15.22l-4.24 4.24M5.02 18.98l4.24-4.24m10.2 0l-4.24 4.24M5.02 5.02l4.24-4.24"/></svg>`,
    grip: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>`,
    phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>`,
    envelope: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"/><path d="M22 6l-10 7L2 6"/></svg>`,
    mapPin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    github: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0020 4c0-1 .3-3-1-4-1 0-2.6 0-4.2.5-1.9-.1-3.7-.1-5.8 0C7.6.5 6 .5 5 4c-1.3 1-1 3-1 4a5.44 5.44 0 01.45 2.64c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>`,
    externalLink: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m-8-3h12m0 0v6m0-6l-9 9"/></svg>`,
    globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    bold: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>`,
    italic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="4" x2="18" y2="4"/><line x1="9" y1="20" x2="21" y2="20"/><polyline points="9 4 5 20"/></svg>`,
    underline: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3M4 21h16"/></svg>`,
    share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
    archive: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/></svg>`,
    markdown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"/><path d="M9 15l2 2 4-4"/></svg>`,
    edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`
  };

  // Render function - handles both normal and view-only mode
  function render() {
    const app = document.getElementById('app');
    
    // VIEW-ONLY MODE: Show just the CV
    if (isViewMode && sharedCVData) {
      cvData = sharedCVData;
      settings = sharedCVData.settings || JSON.parse(JSON.stringify(defaultSettings));
      app.innerHTML = renderViewMode();
      attachViewModeEvents();
      return;
    }
    
    // NORMAL EDIT MODE
    app.innerHTML = `
      <div id="luminacv">
        ${renderHeader()}
        <div class="main">
          <div class="editor" id="editor" style="width:${splitRatio}%">
            ${renderEditorHeader()}
            ${renderTabs()}
            <div class="editor-content">
              ${renderPersonalForm()}
              ${renderExperienceForm()}
              ${renderEducationForm()}
              ${renderSkillsForm()}
              ${renderProjectsForm()}
              ${renderStats()}
            </div>
          </div>
          <div class="resizer" id="resizer"><div class="resizer-handle"></div></div>
          <div class="preview" id="preview" style="width:${100-splitRatio}%">
            ${renderPreviewHeader()}
            <div class="preview-scroll">${renderCVDocument()}</div>
          </div>
        </div>
        ${renderSettingsModal()}
      </div>
    `;
    attachEvents();
  }

  // VIEW-ONLY MODE: Clean CV-only view for shared URLs
  function renderViewMode() {
    const p = cvData.personalInfo;
    return `
      <div id="luminacv-view" class="view-mode">
        <div class="view-header">
          <div class="view-brand">
            <div class="brand-icon">${icons.file}</div>
            <span class="brand-name">LuminaCV</span>
          </div>
          <div class="view-actions">
            <button class="btn btn-primary" id="createOwnBtn">${icons.edit}<span>Create Your Own CV</span></button>
            <button class="btn" id="printViewBtn">${icons.download}<span>Download PDF</span></button>
          </div>
        </div>
        <div class="view-content">
          <div class="view-cv-container">
            ${renderCVDocument()}
          </div>
          <div class="view-info">
            <p>Viewing <strong>${escHtml(p.fullName)}</strong>'s CV</p>
          </div>
        </div>
      </div>
      <style>
        html, body, #app { height: auto !important; overflow: auto !important; }
        .view-mode { min-height: 100vh; background: var(--bg); overflow-y: auto; }
        .view-header { position: sticky; top: 0; z-index: 100; display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; background: var(--surface); border-bottom: 1px solid var(--border); }
        .view-brand { display: flex; align-items: center; gap: 8px; }
        .view-actions { display: flex; gap: 12px; }
        .view-content { padding: 32px; display: flex; flex-direction: column; align-items: center; min-height: calc(100vh - 70px); }
        .view-cv-container { max-width: 850px; width: 100%; background: white; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border-radius: 8px; overflow: visible; }
        .view-info { margin-top: 24px; color: var(--text-muted); font-size: 14px; padding-bottom: 40px; }
        @media (max-width: 768px) {
          .view-header { flex-direction: column; gap: 12px; }
          .view-actions { width: 100%; justify-content: center; }
          .view-content { padding: 16px; }
          .view-actions span { display: none; }
        }
      </style>
    `;
  }
  
  function attachViewModeEvents() {
    document.getElementById('createOwnBtn')?.addEventListener('click', () => {
      window.location.href = window.location.pathname;
    });
    document.getElementById('printViewBtn')?.addEventListener('click', () => window.print());
  }

  function renderHeader() {
    return `
      <header class="header">
        <a href="index.html" class="header-brand">
          <div class="brand-icon-new">
            <svg viewBox="0 0 24 24" fill="white"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8" fill="none" stroke="white" stroke-width="1.5"/><line x1="8" y1="13" x2="16" y2="13" stroke="white" stroke-width="1.5"/><line x1="8" y1="17" x2="14" y2="17" stroke="white" stroke-width="1.5"/></svg>
          </div>
          <span class="brand-name">Lumina<span class="brand-accent">CV</span></span>
        </a>
        <div class="header-actions">
          <div class="autosave">${icons.check}<span>Auto-saved</span></div>
          
          <!-- Template Quick Switch -->
          <div class="template-switch" title="Switch Template">
            ${Object.entries(templates).map(([key, t]) => `
              <button class="template-btn${settings.template === key ? ' active' : ''}" data-template="${key}" title="${t.description}" style="--tpl-color: ${t.color}">
                ${t.name.charAt(0)}
              </button>
            `).join('')}
          </div>
          
          <button class="btn" id="shareBtn" title="Share as URL (data encoded in link)">${icons.share}<span class="btn-text">Share</span></button>
          <button class="btn" id="settingsBtn" title="Settings">${icons.settings}</button>
          <button class="btn" id="sampleBtn" title="Load Sample">${icons.plus}<span class="btn-text">Sample</span></button>
          
          <!-- Export Dropdown -->
          <div class="dropdown" id="exportDropdown">
            <button class="btn" id="exportBtn">${icons.download}<span class="btn-text">Export</span>${icons.chevron}</button>
            <div class="dropdown-menu" id="exportMenu">
              <div class="dropdown-section-title">Documents</div>
              <button class="dropdown-item" data-action="pdf">${icons.file}<span>PDF (Print)</span></button>
              <button class="dropdown-item" data-action="latex">${icons.code}<span>LaTeX (.tex)</span></button>
              <button class="dropdown-item" data-action="latex-zip">${icons.archive}<span>LaTeX Project (ZIP)</span></button>
              <div class="dropdown-section-title">Data</div>
              <button class="dropdown-item" data-action="json">${icons.json}<span>JSON</span></button>
              <button class="dropdown-item" data-action="markdown">${icons.markdown}<span>Markdown (.md)</span></button>
            </div>
          </div>
          
          <!-- Import Dropdown -->
          <div class="dropdown" id="importDropdown">
            <button class="btn" id="importBtn">${icons.upload}<span class="btn-text">Import</span>${icons.chevron}</button>
            <div class="dropdown-menu" id="importMenu">
              <div class="dropdown-section-title">Supported Formats</div>
              <button class="dropdown-item" data-import="json">${icons.json}<span>JSON (.json)</span></button>
              <button class="dropdown-item" data-import="markdown">${icons.markdown}<span>Markdown (.md)</span></button>
            </div>
          </div>
          <input type="file" id="importFile" accept=".json,.md,.markdown" style="display:none">
          
          <button class="btn btn-icon btn-danger" id="resetBtn" title="Reset All">${icons.reset}</button>
        </div>
      </header>
      <style>
        .template-switch { display: flex; gap: 4px; margin-right: 8px; }
        .template-btn { 
          width: 32px; height: 32px; border-radius: 6px; border: 2px solid var(--border);
          background: var(--surface); cursor: pointer; font-weight: 600; font-size: 13px;
          transition: all 0.2s; color: var(--text-muted);
        }
        .template-btn:hover { border-color: var(--tpl-color); color: var(--tpl-color); }
        .template-btn.active { border-color: var(--tpl-color); background: var(--tpl-color); color: white; }
        .dropdown-section-title { padding: 8px 16px 4px; font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        @media (max-width: 768px) {
          .btn-text { display: none; }
          .template-switch { display: none; }
          .autosave span { display: none; }
        }
      </style>
    `;
  }

  function renderEditorHeader() {
    return `<div class="editor-header"><h2>Edit Your CV</h2><p>Fill in your details and watch the preview update in real-time</p></div>`;
  }

  function renderTabs() {
    const tabs = [
      { id: 'personal', label: 'Personal' },
      { id: 'experience', label: 'Experience' },
      { id: 'education', label: 'Education' },
      { id: 'skills', label: 'Skills' },
      { id: 'projects', label: 'Projects' }
    ];
    return `<div class="tabs">${tabs.map(t => `<button class="tab${activeTab===t.id?' active':''}" data-tab="${t.id}">${t.label}</button>`).join('')}</div>`;
  }

  // Sticky Floating Formatter - appears above active textarea
  function renderFloatingFormatter() {
    return `
      <div id="floating-formatter" class="floating-formatter">
        <button type="button" class="fmt-btn" data-format="bold" title="Bold (Ctrl+B)"><strong>B</strong></button>
        <button type="button" class="fmt-btn" data-format="italic" title="Italic (Ctrl+I)"><em>I</em></button>
        <button type="button" class="fmt-btn" data-format="underline" title="Underline (Ctrl+U)"><u>U</u></button>
        <span class="fmt-divider"></span>
        <span class="fmt-hint">Click to toggle format</span>
      </div>
    `;
  }
  
  function positionFloatingFormatter(textarea) {
    if (!floatingFormatter) return;
    const rect = textarea.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    floatingFormatter.style.top = `${rect.top + scrollTop - floatingFormatter.offsetHeight - 8}px`;
    floatingFormatter.style.left = `${rect.left + (rect.width / 2) - (floatingFormatter.offsetWidth / 2)}px`;
    floatingFormatter.classList.add('visible');
  }
  
  function hideFloatingFormatter() {
    if (floatingFormatter) {
      floatingFormatter.classList.remove('visible');
    }
    activeTextarea = null;
  }
  
  // Toggle formatting: if selection already has format, remove it; otherwise add it
  function toggleFormat(textarea, format) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    
    if (!selected) {
      // No selection - insert placeholder
      const markers = { bold: '**', italic: '*', underline: '__' };
      const marker = markers[format];
      const placeholder = `${marker}text${marker}`;
      textarea.value = text.substring(0, start) + placeholder + text.substring(end);
      textarea.setSelectionRange(start + marker.length, start + marker.length + 4);
      textarea.focus();
      return;
    }
    
    const patterns = {
      bold: { regex: /^\*\*(.+)\*\*$/, wrap: '**', unwrap: (m) => m[1] },
      italic: { regex: /^\*([^*]+)\*$/, wrap: '*', unwrap: (m) => m[1] },
      underline: { regex: /^__(.+)__$/, wrap: '__', unwrap: (m) => m[1] }
    };
    
    const pattern = patterns[format];
    const match = selected.match(pattern.regex);
    
    let newText;
    let newStart, newEnd;
    
    if (match) {
      // Already formatted - remove formatting
      newText = pattern.unwrap(match);
      newStart = start;
      newEnd = start + newText.length;
    } else {
      // Not formatted - add formatting
      newText = `${pattern.wrap}${selected}${pattern.wrap}`;
      newStart = start;
      newEnd = start + newText.length;
    }
    
    textarea.value = text.substring(0, start) + newText + text.substring(end);
    textarea.setSelectionRange(newStart, newEnd);
    textarea.focus();
    
    // Trigger input event to update preview
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // Legacy: Render inline formatting toolbar (kept for backwards compatibility, but hidden)
  function renderFormattingToolbar(fieldId) {
    return ''; // Now using floating formatter instead
  }

  function renderPersonalForm() {
    const p = cvData.personalInfo;
    return `
      <div class="form-section${activeTab==='personal'?' active':''}" id="sec-personal">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input class="form-input" data-field="fullName" value="${escHtml(p.fullName)}" placeholder="John Doe">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Phone</label>
            <input class="form-input" data-field="phone" value="${escHtml(p.phone)}" placeholder="+91 9876543210">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-input" data-field="email" value="${escHtml(p.email)}" placeholder="john@email.com">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">LinkedIn</label>
            <input class="form-input" data-field="linkedin" value="${escHtml(p.linkedin)}" placeholder="linkedin.com/in/johndoe">
          </div>
          <div class="form-group">
            <label class="form-label">GitHub</label>
            <input class="form-input" data-field="github" value="${escHtml(p.github)}" placeholder="github.com/johndoe">
          </div>
        </div>
      </div>
    `;
  }

  function renderExperienceForm() {
    return `
      <div class="form-section${activeTab==='experience'?' active':''}" id="sec-experience">
        <div class="section-header">
          <span class="section-title">Work Experience</span>
          <button class="btn" id="addExpBtn">${icons.plus}<span>Add</span></button>
        </div>
        ${cvData.experience.length === 0 ? 
          '<div class="empty-state"><p>No experience added yet</p><button class="btn btn-primary" id="addExpBtn2">Add your first position</button></div>' :
          cvData.experience.map((exp, i) => renderExperienceEntry(exp, i)).join('')
        }
      </div>
    `;
  }

  function renderExperienceEntry(exp, idx) {
    const isExpanded = exp.expanded !== false;
    return `
      <div class="entry-card${isExpanded?' expanded':''}" data-exp-id="${exp.id}">
        <div class="entry-header" data-toggle-exp="${exp.id}">
          <div>
            <div class="entry-title">${escHtml(exp.jobTitle) || `Position ${idx+1}`}</div>
            <div class="entry-subtitle">${escHtml(exp.company) || 'Company'}${exp.startDate ? ' • '+escHtml(exp.startDate) : ''}</div>
          </div>
          <div class="entry-actions">
            <button class="btn btn-icon btn-danger" data-del-exp="${exp.id}">${icons.trash}</button>
            <span class="chevron">${icons.chevron}</span>
          </div>
        </div>
        <div class="entry-content">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Job Title</label>
              <input class="form-input" data-exp="${exp.id}" data-field="jobTitle" value="${escHtml(exp.jobTitle)}" placeholder="Software Engineer">
            </div>
            <div class="form-group">
              <label class="form-label">Company</label>
              <input class="form-input" data-exp="${exp.id}" data-field="company" value="${escHtml(exp.company)}" placeholder="Company Name">
            </div>
          </div>
          <div class="form-row form-row-3">
            <div class="form-group">
              <label class="form-label">Location</label>
              <input class="form-input" data-exp="${exp.id}" data-field="location" value="${escHtml(exp.location)}" placeholder="City, Country">
            </div>
            <div class="form-group">
              <label class="form-label">Start Date</label>
              <input class="form-input" data-exp="${exp.id}" data-field="startDate" value="${escHtml(exp.startDate)}" placeholder="Jan 2022">
            </div>
            <div class="form-group">
              <label class="form-label">End Date</label>
              <input class="form-input" data-exp="${exp.id}" data-field="endDate" value="${escHtml(exp.endDate)}" placeholder="Present">
            </div>
          </div>
          <div class="form-group">
            <div class="section-header">
              <label class="form-label" style="margin-bottom:0">Key Achievements</label>
              <button class="btn btn-sm" data-add-bullet="${exp.id}">${icons.plus}<span>Add Point</span></button>
            </div>
            <div class="bullet-list">
              ${(exp.bullets||[]).map((b, bi) => `
                <div class="bullet-item">
                  ${renderFormattingToolbar(`exp-${exp.id}-bullet-${bi}`)}
                  <div>
                    <span class="bullet-marker">•</span>
                    <textarea class="form-textarea" id="exp-${exp.id}-bullet-${bi}" data-exp="${exp.id}" data-bullet="${bi}" placeholder="Describe your achievement...">${escHtml(b)}</textarea>
                    ${(exp.bullets||[]).length > 1 ? `<button class="btn btn-icon btn-danger btn-sm" data-del-bullet="${exp.id}" data-bullet-idx="${bi}">${icons.trash}</button>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Tech Stack (comma-separated)</label>
            <input class="form-input" data-exp="${exp.id}" data-field="techStack" value="${escHtml(exp.techStack||'')}" placeholder="React, Node.js, PostgreSQL">
          </div>
        </div>
      </div>
    `;
  }

  function renderEducationForm() {
    return `
      <div class="form-section${activeTab==='education'?' active':''}" id="sec-education">
        <div class="section-header">
          <span class="section-title">Education</span>
          <button class="btn" id="addEduBtn">${icons.plus}<span>Add</span></button>
        </div>
        ${cvData.education.length === 0 ?
          '<div class="empty-state"><p>No education added yet</p><button class="btn btn-primary" id="addEduBtn2">Add education</button></div>' :
          cvData.education.map((edu, i) => renderEducationEntry(edu, i)).join('')
        }
      </div>
    `;
  }

  function renderEducationEntry(edu, idx) {
    const isExpanded = edu.expanded !== false;
    return `
      <div class="entry-card${isExpanded?' expanded':''}" data-edu-id="${edu.id}">
        <div class="entry-header" data-toggle-edu="${edu.id}">
          <div>
            <div class="entry-title">${escHtml(edu.degree) || `Education ${idx+1}`}</div>
            <div class="entry-subtitle">${escHtml(edu.school) || 'School'}${edu.endDate ? ' • '+escHtml(edu.endDate) : ''}</div>
          </div>
          <div class="entry-actions">
            <button class="btn btn-icon btn-danger" data-del-edu="${edu.id}">${icons.trash}</button>
            <span class="chevron">${icons.chevron}</span>
          </div>
        </div>
        <div class="entry-content">
          <div class="form-group">
            <label class="form-label">Degree</label>
            <input class="form-input" data-edu="${edu.id}" data-field="degree" value="${escHtml(edu.degree)}" placeholder="Bachelor of Technology in Computer Science">
          </div>
          <div class="form-group">
            <label class="form-label">School / University</label>
            <input class="form-input" data-edu="${edu.id}" data-field="school" value="${escHtml(edu.school)}" placeholder="University Name">
          </div>
          <div class="form-row form-row-3">
            <div class="form-group">
              <label class="form-label">Location</label>
              <input class="form-input" data-edu="${edu.id}" data-field="location" value="${escHtml(edu.location)}" placeholder="City, State">
            </div>
            <div class="form-group">
              <label class="form-label">Start Date</label>
              <input class="form-input" data-edu="${edu.id}" data-field="startDate" value="${escHtml(edu.startDate)}" placeholder="Aug 2018">
            </div>
            <div class="form-group">
              <label class="form-label">End Date</label>
              <input class="form-input" data-edu="${edu.id}" data-field="endDate" value="${escHtml(edu.endDate)}" placeholder="May 2022">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">CGPA (Optional)</label>
            <input class="form-input" data-edu="${edu.id}" data-field="cgpa" value="${escHtml(edu.cgpa||'')}" placeholder="8.5/10.0">
          </div>
        </div>
      </div>
    `;
  }

  function renderSkillsForm() {
    const s = cvData.skills;
    return `
      <div class="form-section${activeTab==='skills'?' active':''}" id="sec-skills">
        <div class="section-header"><span class="section-title">Technical Skills</span></div>
        <div class="form-group">
          <label class="form-label">Languages</label>
          <input class="form-input" data-skill="languages" value="${escHtml(s.languages)}" placeholder="C++, JavaScript, Python, Go">
        </div>
        <div class="form-group">
          <label class="form-label">Frameworks / Libraries</label>
          <input class="form-input" data-skill="frameworks" value="${escHtml(s.frameworks)}" placeholder="React, Node.js, Express">
        </div>
        <div class="form-group">
          <label class="form-label">Developer Tools</label>
          <input class="form-input" data-skill="tools" value="${escHtml(s.tools)}" placeholder="Git, Docker, AWS">
        </div>
        <p class="form-hint">Separate each skill with a comma</p>
      </div>
    `;
  }

  function renderProjectsForm() {
    return `
      <div class="form-section${activeTab==='projects'?' active':''}" id="sec-projects">
        <div class="section-header">
          <span class="section-title">Projects</span>
          <button class="btn" id="addProjBtn">${icons.plus}<span>Add</span></button>
        </div>
        ${cvData.projects.length === 0 ?
          '<div class="empty-state"><p>No projects added yet</p><button class="btn btn-primary" id="addProjBtn2">Add a project</button></div>' :
          cvData.projects.map((p, i) => renderProjectEntry(p, i)).join('')
        }
      </div>
    `;
  }

  function renderProjectEntry(proj, idx) {
    const isExpanded = proj.expanded !== false;
    return `
      <div class="entry-card${isExpanded?' expanded':''}" data-proj-id="${proj.id}">
        <div class="entry-header" data-toggle-proj="${proj.id}">
          <div>
            <div class="entry-title">${escHtml(proj.name) || `Project ${idx+1}`}</div>
            <div class="entry-subtitle">${escHtml(proj.technologies) || 'Technologies'}</div>
          </div>
          <div class="entry-actions">
            <button class="btn btn-icon btn-danger" data-del-proj="${proj.id}">${icons.trash}</button>
            <span class="chevron">${icons.chevron}</span>
          </div>
        </div>
        <div class="entry-content">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Project Name</label>
              <input class="form-input" data-proj="${proj.id}" data-field="name" value="${escHtml(proj.name)}" placeholder="Project Name">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Source Code Link (Optional)</label>
              <input class="form-input" data-proj="${proj.id}" data-field="link" value="${escHtml(proj.link||'')}" placeholder="github.com/user/project">
            </div>
            <div class="form-group">
              <label class="form-label">Live Demo Link (Optional)</label>
              <input class="form-input" data-proj="${proj.id}" data-field="liveLink" value="${escHtml(proj.liveLink||'')}" placeholder="example.com">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            ${renderFormattingToolbar(`proj-${proj.id}-description`)}
            <textarea class="form-textarea" id="proj-${proj.id}-description" data-proj="${proj.id}" data-field="description" placeholder="Brief description...">${escHtml(proj.description||'')}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Technologies (comma-separated)</label>
            <input class="form-input" data-proj="${proj.id}" data-field="technologies" value="${escHtml(proj.technologies||'')}" placeholder="React, Node.js, MongoDB">
          </div>
        </div>
      </div>
    `;
  }

  function renderStats() {
    const stats = calcStats();
    const isGood = stats.words >= 200 && stats.words <= 600;
    return `
      <div class="stats-card">
        <div class="stats-title">${icons.chart}<span>CV Analytics</span></div>
        <div class="stats-grid">
          <div class="stat-item"><div class="stat-label">Words</div><div class="stat-value ${isGood?'good':'warn'}">${stats.words}</div></div>
          <div class="stat-item"><div class="stat-label">Bullet Points</div><div class="stat-value">${stats.bullets}</div></div>
          <div class="stat-item"><div class="stat-label">Sections</div><div class="stat-value">${stats.sections}</div></div>
          <div class="stat-item"><div class="stat-label">Est. Pages</div><div class="stat-value">${stats.pages}</div></div>
        </div>
      </div>
    `;
  }

  function calcStats() {
    let words = 0, bullets = 0, sections = 0;
    const countWords = (t) => t ? t.trim().split(/\s+/).filter(w=>w).length : 0;
    
    words += countWords(cvData.personalInfo.fullName);
    if (cvData.experience.some(e => e.jobTitle || e.company)) {
      sections++;
      cvData.experience.forEach(e => {
        words += countWords(e.jobTitle) + countWords(e.company);
        (e.bullets||[]).forEach(b => { if(b.trim()) { bullets++; words += countWords(b); } });
      });
    }
    if (cvData.education.some(e => e.degree || e.school)) {
      sections++;
      cvData.education.forEach(e => { words += countWords(e.degree) + countWords(e.school); });
    }
    if (cvData.skills.languages || cvData.skills.frameworks || cvData.skills.tools) {
      sections++;
      words += countWords(cvData.skills.languages) + countWords(cvData.skills.frameworks) + countWords(cvData.skills.tools);
    }
    if (cvData.projects.some(p => p.name)) {
      sections++;
      cvData.projects.forEach(p => { words += countWords(p.name) + countWords(p.description); });
    }
    return { words, bullets, sections, pages: Math.max(1, Math.ceil(words/450)) };
  }

  function renderSettingsModal() {
    return `
      <div id="settingsModal" class="modal" style="display:none">
        <div class="modal-backdrop" id="modalBackdrop"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3>CV Settings</h3>
            <button class="btn btn-icon" id="closeSettings">${icons.chevron.replace('M19 9l-7 7-7-7', 'M15 19l-7-7 7-7')}</button>
          </div>
          <div class="modal-body">
            <div class="settings-section">
              <h4>CV Template</h4>
              <div class="template-grid">
                ${Object.entries(templates).map(([key, tpl]) => `
                  <div class="template-option${settings.template === key ? ' active' : ''}" data-template="${key}">
                    <div class="template-preview" style="background:${tpl.color}"></div>
                    <span>${tpl.name}</span>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="settings-section">
              <h4>Accent Color</h4>
              <div class="color-picker-group">
                <input type="color" id="accentColorPicker" value="${settings.accentColor}" class="color-picker">
                <span class="color-value">${settings.accentColor}</span>
              </div>
            </div>
            <div class="settings-section">
              <h4>CV Font</h4>
              <select id="fontSelector" class="settings-select">
                ${Object.entries(fontOptions).map(([key, opt]) => `
                  <option value="${key}" ${settings.font === key ? 'selected' : ''}>${opt.name}</option>
                `).join('')}
              </select>
            </div>
            <div class="settings-section">
              <h4>CV Background Color</h4>
              <div class="color-grid">
                ${Object.entries(bgColorOptions).map(([color, name]) => `
                  <div class="color-option${settings.bgColor === color ? ' selected' : ''}" data-color="${color}" title="${name}" style="background-color:${color}"></div>
                `).join('')}
              </div>
            </div>
            <div class="settings-section">
              <h4>Section Order</h4>
              <p class="settings-hint">Drag to reorder sections in your CV</p>
              <ul class="section-order-list">
                ${settings.sectionOrder.map(section => `
                  <li class="order-item" data-section="${section}" draggable="true">
                    ${icons.grip}
                    <span>${section.charAt(0).toUpperCase() + section.slice(1)}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" id="applySettings">Apply & Close</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderPreviewHeader() {
    return `<div class="preview-header"><h2>Live Preview</h2><p>Your CV as it will appear when printed</p></div>`;
  }

  function renderCVDocument() {
    const p = cvData.personalInfo;
    const hasExp = cvData.experience.some(e => e.jobTitle || e.company);
    const hasEdu = cvData.education.some(e => e.degree || e.school);
    const hasSkills = cvData.skills.languages || cvData.skills.frameworks || cvData.skills.tools;
    const hasProj = cvData.projects.some(pr => pr.name);
    
    // Get current template settings
    const template = templates[settings.template] || templates.modern;
    const templateClass = `template-${settings.template}`;
    
    // Build contact info with icons
    const contactItems = [];
    if (p.phone) contactItems.push(`<div class="cv-contact-item"><span class="cv-icon">${icons.phone}</span><span>${escHtml(p.phone)}</span></div>`);
    if (p.email) contactItems.push(`<div class="cv-contact-item"><span class="cv-icon">${icons.envelope}</span><a href="mailto:${escHtml(p.email)}">${escHtml(p.email)}</a></div>`);
    if (p.linkedin) contactItems.push(`<div class="cv-contact-item"><span class="cv-icon">${icons.linkedin}</span><a href="https://${escHtml(p.linkedin)}" target="_blank" rel="noopener noreferrer">${escHtml(p.linkedin)}</a></div>`);
    if (p.github) contactItems.push(`<div class="cv-contact-item"><span class="cv-icon">${icons.github}</span><a href="https://${escHtml(p.github)}" target="_blank" rel="noopener noreferrer">${escHtml(p.github)}</a></div>`);

    return `
      <div class="cv-doc ${templateClass}" style="font-family: ${fontOptions[settings.font]?.stack || fontOptions.lato.stack}; background-color: ${settings.bgColor}; --template-color: ${template.color};">
        <header class="cv-header">
          <h1 class="cv-name">${escHtml(p.fullName) || 'Your Name'}</h1>
          ${contactItems.length ? `<div class="cv-contact">${contactItems.join('')}</div>` : ''}
        </header>
        ${hasExp ? `
          <section class="cv-section">
            <h2 class="cv-section-title">Experience</h2>
            ${cvData.experience.filter(e=>e.jobTitle||e.company).map(exp => `
              <article class="cv-entry">
                <div class="cv-entry-row"><strong class="cv-entry-title">${escHtml(exp.jobTitle)}</strong><span class="cv-entry-meta">${escHtml(exp.location)}</span></div>
                <div class="cv-entry-row"><span class="cv-entry-subtitle">${escHtml(exp.company)}</span><span class="cv-entry-meta">${escHtml(exp.startDate)}${exp.endDate?' - '+escHtml(exp.endDate):''}</span></div>
                ${(exp.bullets||[]).some(b=>b.trim()) ? `<ul class="cv-bullets">${exp.bullets.filter(b=>b.trim()).map(b=>`<li>${formatTextHTML(b)}</li>`).join('')}</ul>` : ''}
                ${exp.techStack ? `<div class="cv-tech"><strong>Tech:</strong> ${escHtml(exp.techStack)}</div>` : ''}
              </article>
            `).join('')}
          </section>
        ` : ''}
        ${hasEdu ? `
          <section class="cv-section">
            <h2 class="cv-section-title">Education</h2>
            ${cvData.education.filter(e=>e.degree||e.school).map(edu => `
              <article class="cv-entry">
                <div class="cv-entry-row"><strong class="cv-entry-title">${escHtml(edu.degree)}</strong><span class="cv-entry-meta">${escHtml(edu.startDate)}${edu.endDate?' - '+escHtml(edu.endDate):''}</span></div>
                <div class="cv-entry-row"><span class="cv-entry-subtitle">${escHtml(edu.school)}${edu.cgpa?', CGPA: '+escHtml(edu.cgpa):''}</span><span class="cv-entry-meta">${escHtml(edu.location)}</span></div>
              </article>
            `).join('')}
          </section>
        ` : ''}
        ${hasSkills ? `
          <section class="cv-section">
            <h2 class="cv-section-title">Technical Skills</h2>
            ${cvData.skills.languages ? `<div class="cv-skills-row"><strong>Languages:</strong> ${escHtml(cvData.skills.languages)}</div>` : ''}
            ${cvData.skills.frameworks ? `<div class="cv-skills-row"><strong>Frameworks:</strong> ${escHtml(cvData.skills.frameworks)}</div>` : ''}
            ${cvData.skills.tools ? `<div class="cv-skills-row"><strong>Tools:</strong> ${escHtml(cvData.skills.tools)}</div>` : ''}
          </section>
        ` : ''}
        ${hasProj ? `
          <section class="cv-section">
            <h2 class="cv-section-title">Projects</h2>
            ${cvData.projects.filter(pr=>pr.name).map(proj => `
              <article class="cv-entry">
                <div class="cv-entry-row"><strong class="cv-entry-title">${escHtml(proj.name)}</strong></div>
                <div class="cv-links">
                  ${proj.link ? `<a href="https://${escHtml(proj.link)}" target="_blank" rel="noopener noreferrer" class="cv-link"><span class="cv-link-icon">${icons.github}</span>Source</a>` : ''}
                  ${proj.liveLink ? `<a href="https://${escHtml(proj.liveLink)}" target="_blank" rel="noopener noreferrer" class="cv-link"><span class="cv-link-icon">${icons.globe}</span>Live</a>` : ''}
                </div>
                ${proj.description ? `<div class="cv-entry-subtitle">${formatTextHTML(proj.description)}</div>` : ''}
                ${proj.technologies ? `<div class="cv-tech"><strong>Tech:</strong> ${escHtml(proj.technologies)}</div>` : ''}
              </article>
            `).join('')}
          </section>
        ` : ''}
      </div>
      <style>
        /* Template-specific styles */
        .cv-doc.template-modern .cv-header { text-align: center; border-bottom: 3px solid var(--template-color); padding-bottom: 16px; margin-bottom: 20px; }
        .cv-doc.template-modern .cv-contact { justify-content: center; flex-wrap: wrap; }
        .cv-doc.template-modern .cv-section-title { color: var(--template-color); border-bottom: 2px solid var(--template-color); display: inline-block; padding-bottom: 4px; margin-bottom: 12px; }
        
        .cv-doc.template-classic .cv-header { text-align: left; border-bottom: 1px solid #1f2937; padding-bottom: 12px; margin-bottom: 16px; }
        .cv-doc.template-classic .cv-name { font-size: 28px; letter-spacing: 1px; }
        .cv-doc.template-classic .cv-contact { justify-content: flex-start; }
        .cv-doc.template-classic .cv-section-title { color: #1f2937; border-bottom: 1px solid #1f2937; padding-bottom: 4px; margin-bottom: 10px; font-variant: small-caps; letter-spacing: 1px; }
        .cv-doc.template-classic .cv-entry-title { font-weight: 600; }
        
        .cv-doc.template-minimal .cv-header { text-align: left; margin-bottom: 16px; }
        .cv-doc.template-minimal .cv-name { font-size: 24px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; }
        .cv-doc.template-minimal .cv-contact { justify-content: flex-start; font-size: 12px; }
        .cv-doc.template-minimal .cv-contact-item { gap: 4px; }
        .cv-doc.template-minimal .cv-icon { display: none; }
        .cv-doc.template-minimal .cv-section-title { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #6b7280; margin-bottom: 8px; border: none; }
        .cv-doc.template-minimal .cv-entry { padding-left: 0; border-left: none; }
        .cv-doc.template-minimal .cv-bullets { margin-left: 16px; }
        
        /* SWE Template - Matches Overleaf SWE Resume Template */
        .cv-doc.template-swe .cv-header { text-align: center; margin-bottom: 12px; padding-bottom: 0; border: none; }
        .cv-doc.template-swe .cv-name { font-size: 28px; font-weight: 700; font-variant: small-caps; letter-spacing: 0.5px; margin-bottom: 6px; }
        .cv-doc.template-swe .cv-contact { justify-content: center; flex-wrap: wrap; gap: 12px; font-size: 12px; }
        .cv-doc.template-swe .cv-contact-item { gap: 4px; }
        .cv-doc.template-swe .cv-contact-item a { text-decoration: underline; }
        .cv-doc.template-swe .cv-section { margin-bottom: 10px; }
        .cv-doc.template-swe .cv-section-title { font-size: 13px; font-variant: small-caps; font-weight: 700; color: #000; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 8px; letter-spacing: 0.5px; }
        .cv-doc.template-swe .cv-entry { margin-bottom: 8px; padding-left: 0; border: none; }
        .cv-doc.template-swe .cv-entry-row { display: flex; justify-content: space-between; align-items: baseline; }
        .cv-doc.template-swe .cv-entry-title { font-size: 13px; font-weight: 700; }
        .cv-doc.template-swe .cv-entry-subtitle { font-size: 12px; font-style: italic; }
        .cv-doc.template-swe .cv-entry-meta { font-size: 11px; font-style: italic; color: #333; }
        .cv-doc.template-swe .cv-bullets { margin: 4px 0 0 18px; font-size: 11px; }
        .cv-doc.template-swe .cv-bullets li { margin-bottom: 2px; }
        .cv-doc.template-swe .cv-tech { font-size: 11px; margin-top: 4px; }
        .cv-doc.template-swe .cv-skills-row { font-size: 11px; margin-bottom: 2px; }
        .cv-doc.template-swe .cv-links { font-size: 11px; margin-top: 2px; }
        .cv-doc.template-swe .cv-link { margin-right: 8px; }
      </style>
    `;
  }

  function updatePreview() {
    const scroll = document.querySelector('.preview-scroll');
    if (scroll) scroll.innerHTML = renderCVDocument();
  }

  function updateStats() {
    const statsCard = document.querySelector('.stats-card');
    if (statsCard) {
      const temp = document.createElement('div');
      temp.innerHTML = renderStats();
      statsCard.outerHTML = temp.innerHTML;
    }
  }

  function attachEvents() {
    // Initialize floating formatter
    if (!floatingFormatter) {
      const formatterDiv = document.createElement('div');
      formatterDiv.innerHTML = renderFloatingFormatter();
      document.body.appendChild(formatterDiv.firstElementChild);
      floatingFormatter = document.getElementById('floating-formatter');
      
      // Attach format button handlers
      floatingFormatter.querySelectorAll('.fmt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (activeTextarea) {
            toggleFormat(activeTextarea, btn.dataset.format);
          }
        });
      });
    }
    
    // Floating formatter: show on textarea focus
    document.querySelectorAll('.form-textarea').forEach(textarea => {
      textarea.addEventListener('focus', () => {
        activeTextarea = textarea;
        positionFloatingFormatter(textarea);
      });
      
      // Reposition on scroll or resize
      textarea.addEventListener('scroll', () => {
        if (activeTextarea === textarea) {
          positionFloatingFormatter(textarea);
        }
      });
    });
    
    // Hide formatter when clicking outside textareas
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.form-textarea') && !e.target.closest('#floating-formatter')) {
        hideFloatingFormatter();
      }
    });
    
    // Keyboard shortcuts for formatting
    document.addEventListener('keydown', (e) => {
      if (activeTextarea && (e.ctrlKey || e.metaKey)) {
        if (e.key === 'b') {
          e.preventDefault();
          toggleFormat(activeTextarea, 'bold');
        } else if (e.key === 'i') {
          e.preventDefault();
          toggleFormat(activeTextarea, 'italic');
        } else if (e.key === 'u') {
          e.preventDefault();
          toggleFormat(activeTextarea, 'underline');
        }
      }
    });
    
    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeTab = tab.dataset.tab;
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('sec-' + activeTab).classList.add('active');
      });
    });

    // Personal info
    document.querySelectorAll('#sec-personal .form-input').forEach(input => {
      input.addEventListener('input', () => {
        cvData.personalInfo[input.dataset.field] = input.value;
        save();
        updatePreview();
      });
    });

    // Skills
    document.querySelectorAll('[data-skill]').forEach(input => {
      input.addEventListener('input', () => {
        cvData.skills[input.dataset.skill] = input.value;
        save();
        updatePreview();
        updateStats();
      });
    });

    // Experience
    document.getElementById('addExpBtn')?.addEventListener('click', addExperience);
    document.getElementById('addExpBtn2')?.addEventListener('click', addExperience);
    
    document.querySelectorAll('[data-toggle-exp]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-del-exp]')) return;
        const exp = cvData.experience.find(x => x.id === el.dataset.toggleExp);
        if (exp) exp.expanded = !exp.expanded;
        el.closest('.entry-card').classList.toggle('expanded');
      });
    });

    document.querySelectorAll('[data-del-exp]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        cvData.experience = cvData.experience.filter(x => x.id !== btn.dataset.delExp);
        save();
        rerenderSection('experience');
        updatePreview();
        updateStats();
      });
    });

    document.querySelectorAll('[data-exp][data-field]').forEach(input => {
      input.addEventListener('input', () => {
        const exp = cvData.experience.find(x => x.id === input.dataset.exp);
        if (exp) exp[input.dataset.field] = input.value;
        save();
        updatePreview();
        updateStats();
      });
    });

    document.querySelectorAll('[data-exp][data-bullet]').forEach(ta => {
      ta.addEventListener('input', () => {
        const exp = cvData.experience.find(x => x.id === ta.dataset.exp);
        if (exp && exp.bullets) exp.bullets[parseInt(ta.dataset.bullet)] = ta.value;
        save();
        updatePreview();
        updateStats();
      });
    });

    document.querySelectorAll('[data-add-bullet]').forEach(btn => {
      btn.addEventListener('click', () => {
        const exp = cvData.experience.find(x => x.id === btn.dataset.addBullet);
        if (exp) { exp.bullets = exp.bullets || []; exp.bullets.push(''); }
        save();
        rerenderSection('experience');
      });
    });

    document.querySelectorAll('[data-del-bullet]').forEach(btn => {
      btn.addEventListener('click', () => {
        const exp = cvData.experience.find(x => x.id === btn.dataset.delBullet);
        if (exp && exp.bullets && exp.bullets.length > 1) {
          exp.bullets.splice(parseInt(btn.dataset.bulletIdx), 1);
          save();
          rerenderSection('experience');
          updatePreview();
          updateStats();
        }
      });
    });

    // Education
    document.getElementById('addEduBtn')?.addEventListener('click', addEducation);
    document.getElementById('addEduBtn2')?.addEventListener('click', addEducation);

    document.querySelectorAll('[data-toggle-edu]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-del-edu]')) return;
        const edu = cvData.education.find(x => x.id === el.dataset.toggleEdu);
        if (edu) edu.expanded = !edu.expanded;
        el.closest('.entry-card').classList.toggle('expanded');
      });
    });

    document.querySelectorAll('[data-del-edu]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        cvData.education = cvData.education.filter(x => x.id !== btn.dataset.delEdu);
        save();
        rerenderSection('education');
        updatePreview();
        updateStats();
      });
    });

    document.querySelectorAll('[data-edu][data-field]').forEach(input => {
      input.addEventListener('input', () => {
        const edu = cvData.education.find(x => x.id === input.dataset.edu);
        if (edu) edu[input.dataset.field] = input.value;
        save();
        updatePreview();
      });
    });

    // Projects
    document.getElementById('addProjBtn')?.addEventListener('click', addProject);
    document.getElementById('addProjBtn2')?.addEventListener('click', addProject);

    document.querySelectorAll('[data-toggle-proj]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-del-proj]')) return;
        const proj = cvData.projects.find(x => x.id === el.dataset.toggleProj);
        if (proj) proj.expanded = !proj.expanded;
        el.closest('.entry-card').classList.toggle('expanded');
      });
    });

    document.querySelectorAll('[data-del-proj]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        cvData.projects = cvData.projects.filter(x => x.id !== btn.dataset.delProj);
        save();
        rerenderSection('projects');
        updatePreview();
        updateStats();
      });
    });

    document.querySelectorAll('[data-proj][data-field]').forEach(input => {
      const handler = () => {
        const proj = cvData.projects.find(x => x.id === input.dataset.proj);
        if (proj) proj[input.dataset.field] = input.value;
        save();
        updatePreview();
      };
      input.addEventListener('input', handler);
    });

    // Export dropdown
    document.getElementById('exportBtn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('exportMenu').classList.toggle('open');
      document.getElementById('importMenu')?.classList.remove('open');
    });

    document.querySelectorAll('[data-action]').forEach(item => {
      item.addEventListener('click', () => {
        document.getElementById('exportMenu')?.classList.remove('open');
        const action = item.dataset.action;
        if (action === 'pdf') window.print();
        else if (action === 'latex') downloadLaTeX();
        else if (action === 'latex-zip') downloadLaTeXZip();
        else if (action === 'json') downloadJSON();
        else if (action === 'markdown') downloadMarkdown();
      });
    });

    // Share URL button
    document.getElementById('shareBtn')?.addEventListener('click', shareURL);
    
    // Template quick switch
    document.querySelectorAll('.template-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        settings.template = btn.dataset.template;
        settings.accentColor = templates[btn.dataset.template].color;
        document.documentElement.style.setProperty('--accent', settings.accentColor);
        save();
        updatePreview();
        // Update active state
        document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        showNotification(`Template: ${templates[btn.dataset.template].name}`);
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#exportDropdown')) {
        document.getElementById('exportMenu')?.classList.remove('open');
      }
      if (!e.target.closest('#importDropdown')) {
        document.getElementById('importMenu')?.classList.remove('open');
      }
    });

    // Import dropdown
    document.getElementById('importBtn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('importMenu').classList.toggle('open');
      document.getElementById('exportMenu')?.classList.remove('open');
    });
    
    // Import format selection
    document.querySelectorAll('[data-import]').forEach(item => {
      item.addEventListener('click', () => {
        const format = item.dataset.import;
        const fileInput = document.getElementById('importFile');
        fileInput.dataset.format = format;
        fileInput.accept = format === 'json' ? '.json' : '.md,.markdown';
        fileInput.click();
        document.getElementById('importMenu')?.classList.remove('open');
      });
    });

    document.getElementById('importFile')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const format = e.target.dataset.format || (file.name.endsWith('.json') ? 'json' : 'markdown');
      const reader = new FileReader();
      
      reader.onload = (evt) => {
        try {
          if (format === 'json') {
            cvData = JSON.parse(evt.target.result);
          } else {
            // Parse Markdown
            cvData = parseMarkdown(evt.target.result);
          }
          save();
          render();
          showNotification(`Imported from ${format.toUpperCase()}`);
        } catch (err) {
          Modal.alert({
            title: 'Import Error',
            message: `Invalid ${format.toUpperCase()} file: ${err.message}`
          });
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });

    // Reset
    document.getElementById('resetBtn')?.addEventListener('click', () => {
      Modal.confirm({
        title: 'Reset All Data?',
        message: 'This will permanently delete all your resume data. This action cannot be undone.',
        confirmText: 'Reset',
        cancelText: 'Cancel',
        danger: true,
        onConfirm: () => {
          cvData = JSON.parse(JSON.stringify(defaultData));
          localStorage.removeItem(STORAGE_KEY);
          render();
          showNotification('All data has been reset.');
        }
      });
    });

    // Load Sample
    document.getElementById('sampleBtn')?.addEventListener('click', () => {
      const hasData = JSON.stringify(cvData) !== JSON.stringify(defaultData);
      if (hasData) {
        Modal.confirm({
          title: 'Load Sample Data?',
          message: 'This will replace your current resume with sample data. Your existing content will be lost.',
          confirmText: 'Load Sample',
          cancelText: 'Cancel',
          onConfirm: () => {
            cvData = JSON.parse(JSON.stringify(sampleData));
            save();
            render();
            showNotification('Sample resume loaded!');
          }
        });
      } else {
        cvData = JSON.parse(JSON.stringify(sampleData));
        save();
        render();
        showNotification('Sample resume loaded!');
      }
    });

    // Settings modal
    const modal = document.getElementById('settingsModal');
    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettings = document.getElementById('closeSettings');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const applySettings = document.getElementById('applySettings');

    settingsBtn?.addEventListener('click', () => {
      modal.style.display = 'flex';
    });

    closeSettings?.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    modalBackdrop?.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    // Template selection
    document.querySelectorAll('.template-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.template-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        settings.template = opt.dataset.template;
        // Update accent color to match template
        const template = templates[settings.template];
        if (template) {
          settings.accentColor = template.color;
          document.getElementById('accentColorPicker').value = template.color;
          document.querySelector('.color-value').textContent = template.color;
          document.documentElement.style.setProperty('--accent', template.color);
        }
        updatePreview();
      });
    });

    // Accent color picker
    document.getElementById('accentColorPicker')?.addEventListener('input', (e) => {
      settings.accentColor = e.target.value;
      document.querySelector('.color-value').textContent = e.target.value;
      document.documentElement.style.setProperty('--accent', e.target.value);
    });

    // NEW: Font selector
    document.getElementById('fontSelector')?.addEventListener('change', (e) => {
      settings.font = e.target.value;
      const fontOption = fontOptions[settings.font];
      if (fontOption) {
        document.documentElement.style.setProperty('--font-family', fontOption.stack);
        updatePreview();
      }
    });

    // NEW: Background color picker
    document.querySelectorAll('.color-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        settings.bgColor = opt.dataset.color;
        document.querySelector('.cv-doc').style.backgroundColor = settings.bgColor;
      });
    });

    // Section order drag & drop
    const orderList = document.querySelector('.section-order-list');
    let draggedItem = null;

    document.querySelectorAll('.order-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        draggedItem = item;
        item.classList.add('dragging');
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        draggedItem = null;
      });

      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(orderList, e.clientY);
        if (afterElement == null) {
          orderList.appendChild(draggedItem);
        } else {
          orderList.insertBefore(draggedItem, afterElement);
        }
      });
    });

    applySettings?.addEventListener('click', () => {
      // Update section order from DOM
      settings.sectionOrder = Array.from(document.querySelectorAll('.order-item')).map(item => item.dataset.section);
      // Save all settings to localStorage
      save();
      updatePreview();
      modal.style.display = 'none';
      showNotification('Settings applied!');
    });

    // Resizer
    const resizer = document.getElementById('resizer');
    resizer?.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDragging = true;
      resizer.classList.add('dragging');
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const main = document.querySelector('.main');
      const rect = main.getBoundingClientRect();
      splitRatio = Math.min(Math.max(((e.clientX - rect.left) / rect.width) * 100, 25), 75);
      document.getElementById('editor').style.width = splitRatio + '%';
      document.getElementById('preview').style.width = (100 - splitRatio) + '%';
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      document.getElementById('resizer')?.classList.remove('dragging');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        window.print();
      }
    });

    // NEW: Formatting toolbar
    document.querySelectorAll('.format-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const toolbar = btn.closest('.formatting-toolbar');
        const fieldId = toolbar.dataset.field;
        const textarea = document.getElementById(fieldId);
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);
        const format = btn.dataset.format;

        let formatted = selectedText;
        if (format === 'bold') {
          formatted = selectedText ? `**${selectedText}**` : '**bold**';
        } else if (format === 'italic') {
          formatted = selectedText ? `*${selectedText}*` : '*italic*';
        } else if (format === 'underline') {
          formatted = selectedText ? `__${selectedText}__` : '__underline__';
        }

        const newText = text.substring(0, start) + formatted + text.substring(end);
        textarea.value = newText;
        textarea.focus();
        
        // Trigger input event to save changes
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
      });
    });
  }

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.order-item:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  function addExperience() {
    cvData.experience.push({ id: genId(), jobTitle: '', company: '', location: '', startDate: '', endDate: '', bullets: [''], techStack: '', expanded: true });
    save();
    rerenderSection('experience');
  }

  function addEducation() {
    cvData.education.push({ id: genId(), degree: '', school: '', location: '', startDate: '', endDate: '', cgpa: '', expanded: true });
    save();
    rerenderSection('education');
  }

  function addProject() {
    cvData.projects.push({ id: genId(), name: '', link: '', liveLink: '', description: '', technologies: '', expanded: true });
    save();
    rerenderSection('projects');
  }

  function rerenderSection(section) {
    const secEl = document.getElementById('sec-' + section);
    if (secEl) {
      const temp = document.createElement('div');
      if (section === 'experience') temp.innerHTML = renderExperienceForm();
      else if (section === 'education') temp.innerHTML = renderEducationForm();
      else if (section === 'projects') temp.innerHTML = renderProjectsForm();
      secEl.outerHTML = temp.innerHTML;
      attachEvents();
    }
  }

  function downloadLaTeX() {
    const latex = generateLaTeX();
    const blob = new Blob([latex], { type: 'application/x-tex' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.tex';
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadJSON() {
    const json = JSON.stringify(cvData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cv-data.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Download CV as Markdown
  function downloadMarkdown() {
    const p = cvData.personalInfo;
    let md = `# ${p.fullName || 'Your Name'}\n\n`;
    
    // Contact info
    const contact = [p.phone, p.email, p.linkedin, p.github].filter(Boolean);
    if (contact.length) {
      md += contact.join(' | ') + '\n\n';
    }
    
    // Experience
    if (cvData.experience.length) {
      md += `## Experience\n\n`;
      cvData.experience.forEach(exp => {
        md += `### ${exp.jobTitle || 'Position'}`;
        if (exp.company) md += ` at ${exp.company}`;
        md += '\n';
        if (exp.location) md += `*${exp.location}*\n`;
        if (exp.startDate || exp.endDate) {
          md += `${exp.startDate || ''} - ${exp.endDate || ''}\n`;
        }
        if (exp.techStack) md += `**Tech:** ${exp.techStack}\n`;
        md += '\n';
        if (exp.bullets?.length) {
          exp.bullets.forEach(b => md += `- ${b}\n`);
          md += '\n';
        }
      });
    }
    
    // Education
    if (cvData.education.length) {
      md += `## Education\n\n`;
      cvData.education.forEach(edu => {
        md += `### ${edu.degree || 'Degree'}`;
        if (edu.school) md += ` - ${edu.school}`;
        md += '\n';
        if (edu.location) md += `*${edu.location}*\n`;
        if (edu.startDate || edu.endDate) {
          md += `${edu.startDate || ''} - ${edu.endDate || ''}\n`;
        }
        if (edu.gpa) md += `GPA: ${edu.gpa}\n`;
        if (edu.coursework) md += `Coursework: ${edu.coursework}\n`;
        md += '\n';
      });
    }
    
    // Skills
    const skills = cvData.skills;
    if (skills.languages || skills.frameworks || skills.tools) {
      md += `## Skills\n\n`;
      if (skills.languages) md += `**Languages:** ${skills.languages}\n`;
      if (skills.frameworks) md += `**Frameworks:** ${skills.frameworks}\n`;
      if (skills.tools) md += `**Tools:** ${skills.tools}\n`;
      md += '\n';
    }
    
    // Projects
    if (cvData.projects.length) {
      md += `## Projects\n\n`;
      cvData.projects.forEach(proj => {
        md += `### ${proj.name || 'Project'}`;
        if (proj.tech) md += ` (${proj.tech})`;
        md += '\n';
        if (proj.link) md += `[${proj.link}](${proj.link})\n`;
        md += '\n';
        if (proj.bullets?.length) {
          proj.bullets.forEach(b => md += `- ${b}\n`);
          md += '\n';
        }
      });
    }
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.md';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Parse Markdown file into CV data
  function parseMarkdown(mdText) {
    const data = JSON.parse(JSON.stringify(defaultData));
    const lines = mdText.split('\n');
    let currentSection = '';
    let currentItem = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // H1 = Name
      if (line.startsWith('# ') && !currentSection) {
        data.personalInfo.fullName = line.substring(2).trim();
        continue;
      }
      
      // Contact line (contains | separator or common patterns)
      if (!currentSection && (line.includes('|') || line.includes('@') || line.includes('linkedin') || line.includes('github'))) {
        const parts = line.split(/\s*\|\s*/);
        parts.forEach(part => {
          part = part.trim();
          if (part.includes('@') && !part.includes('github')) data.personalInfo.email = part;
          else if (part.match(/^\+?\d[\d\s\-()]+$/)) data.personalInfo.phone = part;
          else if (part.toLowerCase().includes('linkedin')) data.personalInfo.linkedin = part;
          else if (part.toLowerCase().includes('github')) data.personalInfo.github = part;
        });
        continue;
      }
      
      // H2 = Section
      if (line.startsWith('## ')) {
        const sectionName = line.substring(3).trim().toLowerCase();
        if (sectionName.includes('experience') || sectionName.includes('work')) {
          currentSection = 'experience';
        } else if (sectionName.includes('education')) {
          currentSection = 'education';
        } else if (sectionName.includes('skill')) {
          currentSection = 'skills';
        } else if (sectionName.includes('project')) {
          currentSection = 'projects';
        }
        currentItem = null;
        continue;
      }
      
      // H3 = Item within section
      if (line.startsWith('### ')) {
        const title = line.substring(4).trim();
        
        if (currentSection === 'experience') {
          const match = title.match(/^(.+?)\s+at\s+(.+)$/i);
          currentItem = {
            id: 'exp' + Date.now() + Math.random(),
            jobTitle: match ? match[1].trim() : title,
            company: match ? match[2].trim() : '',
            location: '', startDate: '', endDate: '', techStack: '',
            bullets: [], expanded: true
          };
          data.experience.push(currentItem);
        } else if (currentSection === 'education') {
          const match = title.match(/^(.+?)\s+-\s+(.+)$/);
          currentItem = {
            id: 'edu' + Date.now() + Math.random(),
            degree: match ? match[1].trim() : title,
            school: match ? match[2].trim() : '',
            location: '', startDate: '', endDate: '', gpa: '', coursework: '',
            expanded: true
          };
          data.education.push(currentItem);
        } else if (currentSection === 'projects') {
          const match = title.match(/^(.+?)\s+\((.+)\)$/);
          currentItem = {
            id: 'proj' + Date.now() + Math.random(),
            name: match ? match[1].trim() : title,
            tech: match ? match[2].trim() : '',
            link: '', bullets: [], expanded: true
          };
          data.projects.push(currentItem);
        }
        continue;
      }
      
      // Skills section - key: value format
      if (currentSection === 'skills') {
        if (line.toLowerCase().includes('language')) {
          data.skills.languages = line.replace(/\*\*/g, '').replace(/^[^:]+:\s*/, '').trim();
        } else if (line.toLowerCase().includes('framework')) {
          data.skills.frameworks = line.replace(/\*\*/g, '').replace(/^[^:]+:\s*/, '').trim();
        } else if (line.toLowerCase().includes('tool')) {
          data.skills.tools = line.replace(/\*\*/g, '').replace(/^[^:]+:\s*/, '').trim();
        }
        continue;
      }
      
      // Bullet points
      if (line.startsWith('- ') && currentItem) {
        currentItem.bullets = currentItem.bullets || [];
        currentItem.bullets.push(line.substring(2).trim());
        continue;
      }
      
      // Italic = location
      if (line.startsWith('*') && line.endsWith('*') && currentItem && !currentItem.location) {
        currentItem.location = line.replace(/^\*+|\*+$/g, '').trim();
        continue;
      }
      
      // Date range
      if (currentItem && line.match(/\d{4}/) && line.includes('-')) {
        const [start, end] = line.split(/\s*-\s*/);
        currentItem.startDate = start?.trim() || '';
        currentItem.endDate = end?.trim() || '';
        continue;
      }
      
      // Tech stack
      if (currentItem && line.toLowerCase().startsWith('**tech')) {
        currentItem.techStack = line.replace(/\*\*/g, '').replace(/^[^:]+:\s*/, '').trim();
        continue;
      }
      
      // GPA
      if (currentItem && currentSection === 'education' && line.toLowerCase().includes('gpa')) {
        currentItem.gpa = line.replace(/^[^:]+:\s*/, '').trim();
        continue;
      }
      
      // Coursework
      if (currentItem && currentSection === 'education' && line.toLowerCase().includes('coursework')) {
        currentItem.coursework = line.replace(/^[^:]+:\s*/, '').trim();
        continue;
      }
      
      // Link in projects
      if (currentItem && currentSection === 'projects' && line.startsWith('[')) {
        const match = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (match) currentItem.link = match[2] || match[1];
        continue;
      }
    }
    
    return data;
  }

  // Share URL - encodes CV data with a clean, readable ID format
  function shareURL() {
    try {
      // Compress and encode CV data into URL
      const compressed = LZString.compress(JSON.stringify(cvData));
      if (!compressed) {
        showNotification('Error: Could not generate share URL', 'error');
        return;
      }
      
      // Generate a readable share ID
      const shareId = generateShareId(cvData);
      
      // Use 'r' parameter for cleaner URLs (short for 'resume')
      const baseUrl = window.location.origin + window.location.pathname.replace('editor.html', '');
      const shareUrl = `${baseUrl}?id=${shareId}&r=${compressed}`;
      
      // Check URL length - most browsers support ~2000 chars safely
      if (shareUrl.length > 8000) {
        Modal.alert({
          title: 'URL Too Long',
          message: 'Your resume has a lot of content. The share URL was generated but may not work in all browsers. Consider reducing some content for more reliable sharing.'
        });
      }
      
      // Copy to clipboard and show success modal
      navigator.clipboard.writeText(shareUrl).then(() => {
        Modal.open({
          title: 'Share Link Created!',
          content: `
            <p style="margin-bottom: 16px;">Anyone with this link can view your CV:</p>
            <div style="background: var(--bg); padding: 12px; border-radius: 8px; word-break: break-all; font-family: monospace; font-size: 12px; margin-bottom: 16px; max-height: 100px; overflow-y: auto;">
              ${shareUrl}
            </div>
            <p style="font-size: 13px; color: var(--text-muted);">✨ Link copied to clipboard!</p>
          `,
          buttons: [{ text: 'Done', primary: true }]
        });
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.cssText = 'position:fixed;left:-999999px;top:-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Share URL copied!');
      });
    } catch (e) {
      console.error('Share URL error:', e);
      Modal.alert({
        title: 'Error',
        message: 'Could not generate share URL. Please try again.'
      });
    }
  }

  // Download LaTeX as modular ZIP
  async function downloadLaTeXZip() {
    if (!window.JSZip) {
      showNotification('Loading ZIP library...');
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    
    const p = cvData.personalInfo;
    const esc = (s) => s ? s.replace(/[\\&%$#_{}~^]/g, '\\$&') : '';
    
    // Generate modular LaTeX files
    const files = {};
    
    // Custom commands file
    files['src/custom-commands.tex'] = `%-------------------------
% Custom Commands for Resume
%------------------------

% Section formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large\\bfseries
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Subheading commands
\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeItem}[1]{
  \\item\\small{#1 \\vspace{-2pt}}
}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}
`;

    // Heading file
    files['src/heading.tex'] = `%-------------------------
% Heading Section
%------------------------

\\begin{center}
    \\textbf{\\Huge \\scshape ${esc(p.fullName) || 'Your Name'}} \\\\ \\vspace{1pt}
    \\small ${p.phone ? esc(p.phone) + ' $|$ ' : ''}${p.email ? `\\href{mailto:${esc(p.email)}}{\\underline{${esc(p.email)}}}` : ''}${p.linkedin ? ` $|$ \\href{https://${esc(p.linkedin)}}{\\underline{${esc(p.linkedin)}}}` : ''}${p.github ? ` $|$ \\href{https://${esc(p.github)}}{\\underline{${esc(p.github)}}}` : ''}
\\end{center}
`;

    // Experience file
    let expContent = `%-------------------------
% Experience Section
%------------------------

`;
    if (cvData.experience.some(e => e.jobTitle || e.company)) {
      expContent += `\\section{Experience}
\\resumeSubHeadingListStart
`;
      cvData.experience.filter(e => e.jobTitle || e.company).forEach(exp => {
        expContent += `  \\resumeSubheading
    {${esc(exp.jobTitle) || 'Position'}}{${esc(exp.startDate)}${exp.endDate ? ' -- ' + esc(exp.endDate) : ''}}
    {${esc(exp.company) || 'Company'}}{${esc(exp.location)}}
`;
        if (exp.bullets?.some(b => b.trim())) {
          expContent += `    \\resumeItemListStart
`;
          exp.bullets.filter(b => b.trim()).forEach(b => {
            expContent += `      \\resumeItem{${formatTextLaTeX(b, esc)}}
`;
          });
          expContent += `    \\resumeItemListEnd
`;
        }
      });
      expContent += `\\resumeSubHeadingListEnd
`;
    }
    files['src/experience.tex'] = expContent;

    // Education file
    let eduContent = `%-------------------------
% Education Section
%------------------------

`;
    if (cvData.education.some(e => e.degree || e.school)) {
      eduContent += `\\section{Education}
\\resumeSubHeadingListStart
`;
      cvData.education.filter(e => e.degree || e.school).forEach(edu => {
        eduContent += `  \\resumeSubheading
    {${esc(edu.school) || 'School'}}{${esc(edu.location)}}
    {${esc(edu.degree) || 'Degree'}${edu.cgpa ? ', GPA: ' + esc(edu.cgpa) : ''}}{${esc(edu.startDate)}${edu.endDate ? ' -- ' + esc(edu.endDate) : ''}}
`;
      });
      eduContent += `\\resumeSubHeadingListEnd
`;
    }
    files['src/education.tex'] = eduContent;

    // Skills file
    let skillsContent = `%-------------------------
% Skills Section
%------------------------

`;
    if (cvData.skills.languages || cvData.skills.frameworks || cvData.skills.tools) {
      skillsContent += `\\section{Technical Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
`;
      if (cvData.skills.languages) {
        skillsContent += `        \\textbf{Languages}{: ${esc(cvData.skills.languages)}} \\\\
`;
      }
      if (cvData.skills.frameworks) {
        skillsContent += `        \\textbf{Technologies}{: ${esc(cvData.skills.frameworks)}} \\\\
`;
      }
      if (cvData.skills.tools) {
        skillsContent += `        \\textbf{Concepts}{: ${esc(cvData.skills.tools)}}
`;
      }
      skillsContent += `    }}
\\end{itemize}
`;
    }
    files['src/skills.tex'] = skillsContent;

    // Projects file
    let projContent = `%-------------------------
% Projects Section
%------------------------

`;
    if (cvData.projects.some(pr => pr.name)) {
      projContent += `\\section{Projects}
\\resumeSubHeadingListStart
`;
      cvData.projects.filter(pr => pr.name).forEach(proj => {
        const projTitle = `\\textbf{${esc(proj.name)}}${proj.technologies ? ` $|$ \\emph{${esc(proj.technologies)}}` : ''}`;
        projContent += `  \\resumeProjectHeading
    {${projTitle}}{}
`;
        if (proj.description) {
          projContent += `    \\resumeItemListStart
      \\resumeItem{${formatTextLaTeX(proj.description, esc)}}
`;
          const links = [];
          if (proj.link) links.push(`\\href{https://${esc(proj.link)}}{Source Code}`);
          if (proj.liveLink) links.push(`\\href{https://${esc(proj.liveLink)}}{Live Demo}`);
          if (links.length) {
            projContent += `      \\resumeItem{${links.join(' $|$ ')}}
`;
          }
          projContent += `    \\resumeItemListEnd
`;
        }
      });
      projContent += `\\resumeSubHeadingListEnd
`;
    }
    files['src/projects.tex'] = projContent;

    // Main resume.tex file
    files['resume.tex'] = `%-------------------------
% Resume in LaTeX
% Generated by LuminaCV
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

\\usepackage[default]{lato}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\input{src/custom-commands}

\\pdfgentounicode=1

\\begin{document}

\\input{src/heading}
\\input{src/experience}
\\input{src/education}
\\input{src/skills}
\\input{src/projects}

\\end{document}
`;

    // README file
    files['README.md'] = `# Resume - ${p.fullName || 'Your Name'}

Generated by [LuminaCV](https://luminacv.app)

## Compiling

To compile this resume, you need a LaTeX distribution installed:

### Using pdflatex
\`\`\`bash
pdflatex resume.tex
\`\`\`

### Using latexmk
\`\`\`bash
latexmk -pdf resume.tex
\`\`\`

### Using Overleaf
1. Upload all files to Overleaf
2. Set \`resume.tex\` as the main document
3. Click "Recompile"

## Structure

- \`resume.tex\` - Main document
- \`src/custom-commands.tex\` - Custom LaTeX commands
- \`src/heading.tex\` - Name and contact info
- \`src/experience.tex\` - Work experience section
- \`src/education.tex\` - Education section
- \`src/skills.tex\` - Technical skills section
- \`src/projects.tex\` - Projects section
`;

    // Create ZIP
    const zip = new JSZip();
    Object.entries(files).forEach(([path, content]) => {
      zip.file(path, content);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(p.fullName || 'resume').replace(/\s+/g, '-').toLowerCase()}-latex.zip`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('LaTeX ZIP downloaded!');
  }

  function generateLaTeX() {
    const p = cvData.personalInfo;
    const esc = (s) => s ? s.replace(/[\\&%$#_{}~^]/g, '\\$&') : '';
    
    // Main document structure - matches SWE Resume Template from Overleaf
    let tex = `%-------------------------
% Resume in Latex
% Author: Generated by LuminaCV
% Based on: SWE Resume Template by Audric Serador
% License: MIT
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{fontawesome5}
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

% Custom font
\\usepackage[default]{lato}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule\\vspace{-5pt}]

% Ensure that generated pdf is machine readable/ATS parsable
\\pdfgentounicode=1

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\definecolor{Black}{RGB}{0, 0, 0}
\\newcommand{\\seticon}[1]{\\textcolor{Black}{\\csname #1\\endcsname}}

\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape ${esc(p.fullName)}} \\\\ \\vspace{1pt}`;

    // Build contact section with FontAwesome icons
    const contactParts = [];
    if (p.phone) contactParts.push(`\\seticon{faPhone} \\ \\small ${esc(p.phone)}`);
    if (p.email) contactParts.push(`\\href{mailto:${esc(p.email)}}{\\seticon{faEnvelope} \\underline{${esc(p.email)}}}`);
    if (p.linkedin) contactParts.push(`\\href{https://${esc(p.linkedin)}}{\\seticon{faLinkedin} \\underline{${esc(p.linkedin)}}}`);
    if (p.github) contactParts.push(`\\href{https://${esc(p.github)}}{\\seticon{faGithub} \\underline{${esc(p.github)}}}`);
    
    if (contactParts.length) {
      tex += `\n    ${contactParts.join(' \\quad ')}\n`;
    }
    tex += `\\end{center}\n\n`;

    // Experience Section
    if (cvData.experience.some(e => e.jobTitle || e.company)) {
      tex += `%-----------EXPERIENCE-----------
\\section{Experience}
\\resumeSubHeadingListStart\n`;
      cvData.experience.filter(e => e.jobTitle || e.company).forEach(exp => {
        tex += `    \\resumeSubheading
      {${esc(exp.jobTitle) || 'Position'}}{${esc(exp.startDate)}${exp.endDate ? ' -- ' + esc(exp.endDate) : ''}}
      {${esc(exp.company) || 'Company'}}{${esc(exp.location)}}
`;
        if (exp.bullets && exp.bullets.some(b => b.trim())) {
          tex += `      \\resumeItemListStart\n`;
          exp.bullets.filter(b => b.trim()).forEach(b => {
            tex += `        \\resumeItem{${formatTextLaTeX(b, esc)}}\n`;
          });
          tex += `      \\resumeItemListEnd\n`;
        }
        tex += `\n`;
      });
      tex += `\\resumeSubHeadingListEnd\n\n`;
    }

    // Education Section
    if (cvData.education.some(e => e.degree || e.school)) {
      tex += `%-----------EDUCATION-----------
\\section{Education}
\\resumeSubHeadingListStart\n`;
      cvData.education.filter(e => e.degree || e.school).forEach(edu => {
        tex += `    \\resumeSubheading
      {${esc(edu.school) || 'Institution'}}{${esc(edu.startDate)}${edu.endDate ? ' -- ' + esc(edu.endDate) : ''}}
      {${esc(edu.degree) || 'Degree'}${edu.cgpa ? ' (GPA: ' + esc(edu.cgpa) + ')' : ''}}{${esc(edu.location)}}
`;
        tex += `\n`;
      });
      tex += `\\resumeSubHeadingListEnd\n\n`;
    }

    // Projects Section
    if (cvData.projects.some(pr => pr.name)) {
      tex += `%-----------PROJECTS-----------
\\section{Projects}
\\resumeSubHeadingListStart\n`;
      cvData.projects.filter(pr => pr.name).forEach(proj => {
        // Build project title with tech stack
        let projTitle = `\\textbf{${esc(proj.name)}}`;
        if (proj.technologies) {
          projTitle += ` $|$ \\emph{${esc(proj.technologies)}}`;
        }
        // Add source and live links with icons
        const linkParts = [];
        if (proj.link) linkParts.push(`\\href{https://${esc(proj.link)}}{\\seticon{faGithub}}`);
        if (proj.liveLink) linkParts.push(`\\href{https://${esc(proj.liveLink)}}{\\seticon{faExternalLink*}}`);
        const linksStr = linkParts.length ? ` $|$ ${linkParts.join(' ')}` : '';
        
        tex += `    \\resumeProjectHeading
      {${projTitle}${linksStr}}{}
`;
        if (proj.description || (proj.bullets && proj.bullets.length)) {
          tex += `      \\resumeItemListStart\n`;
          if (proj.description) {
            tex += `        \\resumeItem{${formatTextLaTeX(proj.description, esc)}}\n`;
          }
          if (proj.bullets && proj.bullets.length) {
            proj.bullets.filter(b => b.trim()).forEach(b => {
              tex += `        \\resumeItem{${formatTextLaTeX(b, esc)}}\n`;
            });
          }
          tex += `      \\resumeItemListEnd\n`;
        }
        tex += `\n`;
      });
      tex += `\\resumeSubHeadingListEnd\n\n`;
    }

    // Skills Section
    if (cvData.skills.languages || cvData.skills.frameworks || cvData.skills.tools) {
      tex += `%-----------PROGRAMMING SKILLS-----------
\\section{Technical Skills}
    \\begin{itemize}[leftmargin=0.15in, label={}]
        \\small{\\item{\n`;
      
      if (cvData.skills.languages) {
        tex += `                \\textbf{Languages}{: ${esc(cvData.skills.languages)}} \\\\\n`;
      }
      if (cvData.skills.frameworks) {
        tex += `                \\textbf{Technologies}{: ${esc(cvData.skills.frameworks)}} \\\\\n`;
      }
      if (cvData.skills.tools) {
        tex += `                \\textbf{Concepts}{: ${esc(cvData.skills.tools)}}\n`;
      }
      
      tex += `        }}
    \\end{itemize}\n\n`;
    }

    tex += `\\end{document}\n`;
    return tex;
  }

  // Initialize
  // Check for shared CV first (URL viewing mode)
  checkForSharedCV();
  
  // Validate localStorage data structure
  try {
    if (cvData && (!cvData.personalInfo || !cvData.experience || !cvData.education)) {
      console.warn('Invalid data structure detected, resetting to defaults');
      localStorage.removeItem('luminacv_data');
      localStorage.removeItem('luminacv_settings');
      cvData = JSON.parse(JSON.stringify(defaultData));
      settings = JSON.parse(JSON.stringify(defaultSettings));
    }
  } catch (e) {
    console.error('Data validation error:', e);
  }
  
  // Apply font family from settings
  const fontOption = fontOptions[settings.font] || fontOptions.lato;
  document.documentElement.style.setProperty('--font-family', fontOption.stack);
  // Apply accent color from settings
  document.documentElement.style.setProperty('--accent', settings.accentColor);
  render();
})();
