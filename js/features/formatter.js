// Text formatting toolbar
const formatterFunctions = {
  showFormattingToolbar: function(selection) {
    if (!selection || selection.length === 0) return;

    const toolbar = document.createElement('div');
    toolbar.className = 'formatter-toolbar';

    const buttons = [
      { icon: 'B', action: 'bold', title: 'Bold' },
      { icon: 'I', action: 'italic', title: 'Italic' },
      { icon: 'U', action: 'underline', title: 'Underline' },
      { icon: '🔗', action: 'link', title: 'Link' }
    ];

    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.textContent = btn.icon;
      button.title = btn.title;
      button.addEventListener('click', () => {
        this._applyFormatting(selection, btn.action);
      });
      toolbar.appendChild(button);
    });

    document.body.appendChild(toolbar);

    // Position near selection
    const rect = selection.getBoundingClientRect ? selection.getBoundingClientRect() : { top: 0, left: 0 };
    toolbar.style.position = 'fixed';
    toolbar.style.top = (rect.top - 40) + 'px';
    toolbar.style.left = rect.left + 'px';

    // Remove after formatting
    setTimeout(() => toolbar.remove(), 5000);
  },

  _applyFormatting: function(element, action) {
    const start = element.selectionStart;
    const end = element.selectionEnd;
    const text = element.value;
    const selected = text.substring(start, end);

    let formatted = selected;
    switch(action) {
      case 'bold':
        formatted = `**${selected}**`;
        break;
      case 'italic':
        formatted = `*${selected}*`;
        break;
      case 'underline':
        formatted = `__${selected}__`;
        break;
      case 'link':
        formatted = `[${selected}](url)`;
        break;
    }

    const newText = text.substring(0, start) + formatted + text.substring(end);
    element.value = newText;
    element.dispatchEvent(new Event('input'));
  }
};
