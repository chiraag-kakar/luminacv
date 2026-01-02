// Export functionality
const exportFunctions = {
  // Export to JSON
  exportJSON: function(cvData) {
    const dataStr = JSON.stringify(cvData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    this._downloadFile(dataBlob, 'resume.json');
  },

  // Export to Markdown
  exportMarkdown: function(cvData) {
    let md = `# ${cvData.personalInfo.fullName}\n\n`;
    md += `**Email:** ${cvData.personalInfo.email}  \n`;
    md += `**Phone:** ${cvData.personalInfo.phone}  \n`;
    md += `**LinkedIn:** ${cvData.personalInfo.linkedin}  \n`;
    md += `**GitHub:** ${cvData.personalInfo.github}\n\n`;

    if (cvData.experience.length > 0) {
      md += `## Experience\n\n`;
      cvData.experience.forEach(exp => {
        md += `### ${exp.jobTitle}\n`;
        md += `**${exp.company}** | ${exp.location} | ${exp.startDate} - ${exp.endDate}\n\n`;
        exp.bullets.forEach(bullet => {
          md += `- ${bullet}\n`;
        });
        md += '\n';
      });
    }

    if (cvData.education.length > 0) {
      md += `## Education\n\n`;
      cvData.education.forEach(edu => {
        md += `### ${edu.degree}\n`;
        md += `**${edu.school}** | ${edu.location} | ${edu.startDate} - ${edu.endDate}\n`;
        if (edu.gpa) md += `**GPA:** ${edu.gpa}\n`;
        md += '\n';
      });
    }

    md += `## Skills\n\n`;
    md += `**Languages:** ${cvData.skills.languages}\n\n`;
    md += `**Frameworks:** ${cvData.skills.frameworks}\n\n`;
    md += `**Tools:** ${cvData.skills.tools}\n\n`;

    if (cvData.projects.length > 0) {
      md += `## Projects\n\n`;
      cvData.projects.forEach(proj => {
        md += `### ${proj.name}\n`;
        md += `[Link](${proj.link}) | [Live](${proj.liveLink})  \n`;
        md += `**Tech:** ${proj.tech}\n\n`;
        md += `${proj.description}\n\n`;
        proj.bullets.forEach(bullet => {
          md += `- ${bullet}\n`;
        });
        md += '\n';
      });
    }

    const mdBlob = new Blob([md], { type: 'text/markdown' });
    this._downloadFile(mdBlob, 'resume.md');
  },

  // Export to PDF (via print)
  exportPDF: function(cvData) {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Resume - ${cvData.personalInfo.fullName}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
            h1 { border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
            h2 { margin-top: 20px; color: #2563eb; }
            .contact { margin: 10px 0; }
            .section { margin-bottom: 15px; }
            .entry-header { font-weight: bold; }
            ul { margin: 5px 0; }
          </style>
        </head>
        <body>
          <h1>${escHtml(cvData.personalInfo.fullName)}</h1>
          <div class="contact">
            ${cvData.personalInfo.email} | ${cvData.personalInfo.phone} | ${cvData.personalInfo.linkedin}
          </div>
          <script>
            window.print();
            window.close();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  },

  // Helper: Download file
  _downloadFile: function(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    Modal.alert(`Downloaded: ${filename}`);
  }
};
