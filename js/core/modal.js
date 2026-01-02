// Custom modal dialog system
class Modal {
  constructor(title, content, buttons = []) {
    this.title = title;
    this.content = content;
    this.buttons = buttons;
    this.element = null;
    this.promise = null;
    this.resolve = null;
    this.reject = null;
  }

  static open(title, content, buttons = []) {
    const modal = new Modal(title, content, buttons);
    return modal.show();
  }

  static confirm(message) {
    return Modal.open('Confirm', message, [
      { text: 'Cancel', value: false, primary: false },
      { text: 'Confirm', value: true, primary: true }
    ]);
  }

  static alert(message) {
    return Modal.open('Alert', message, [
      { text: 'OK', value: true, primary: true }
    ]);
  }

  static prompt(message, defaultValue = '') {
    return new Promise((resolve) => {
      const modal = new Modal('Prompt', message, [
        { text: 'Cancel', value: null, primary: false },
        { text: 'OK', value: 'input', primary: true }
      ]);
      modal.hasInput = true;
      modal.inputValue = defaultValue;
      modal.show().then(result => {
        resolve(result === 'input' ? modal.inputValue : null);
      });
    });
  }

  show() {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      this.render();
      this.attachListeners();
    });
  }

  render() {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this.close(null);
    });

    const container = document.createElement('div');
    container.className = 'modal-container';

    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = `
      <h2>${escHtml(this.title)}</h2>
      <button class="modal-close">✕</button>
    `;
    header.querySelector('.modal-close').addEventListener('click', () => this.close(null));

    const body = document.createElement('div');
    body.className = 'modal-body';
    if (this.hasInput) {
      body.innerHTML = `
        <p>${escHtml(this.content)}</p>
        <input type="text" id="modal-input" class="modal-input" value="${escHtml(this.inputValue)}" />
      `;
      setTimeout(() => document.getElementById('modal-input')?.focus(), 0);
    } else {
      body.innerHTML = `<p>${escHtml(this.content)}</p>`;
    }

    const footer = document.createElement('div');
    footer.className = 'modal-footer';
    this.buttons.forEach(btn => {
      const button = document.createElement('button');
      button.textContent = btn.text;
      button.className = `modal-btn ${btn.primary ? 'primary' : ''}`;
      button.addEventListener('click', () => {
        if (this.hasInput && btn.value === 'input') {
          this.inputValue = document.getElementById('modal-input')?.value || '';
        }
        this.close(btn.value);
      });
      footer.appendChild(button);
    });

    container.appendChild(header);
    container.appendChild(body);
    container.appendChild(footer);
    backdrop.appendChild(container);
    document.body.appendChild(backdrop);

    this.element = backdrop;
  }

  close(value) {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
    this.resolve(value);
  }
}
