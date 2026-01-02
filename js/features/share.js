// URL sharing functionality
const shareFunctions = {
  generateShareURL: function(cvData) {
    try {
      // Compress CV data using simple base64 encoding
      const dataStr = JSON.stringify(cvData);
      const encoded = btoa(encodeURIComponent(dataStr));
      
      const baseURL = window.location.origin + window.location.pathname;
      const shareURL = `${baseURL}?cv=${encoded}`;
      
      // Copy to clipboard
      navigator.clipboard.writeText(shareURL).then(() => {
        Modal.alert('Share link copied to clipboard!');
      }).catch(() => {
        Modal.alert(`Share link: ${shareURL}`);
      });

      return shareURL;
    } catch (error) {
      Modal.alert(`Error generating share link: ${error.message}`);
      return null;
    }
  },

  parseShareURL: function() {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('cv');
    
    if (!encoded) return null;

    try {
      const dataStr = decodeURIComponent(atob(encoded));
      return JSON.parse(dataStr);
    } catch (error) {
      console.error('Failed to parse share URL:', error);
      return null;
    }
  }
};
