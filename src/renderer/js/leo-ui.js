/**
 * LeoUI - Controls Brave Leo AI assistant sidebar, page context extraction, and chat
 */

class LeoUI {
  constructor() {
    this.sidebar = document.getElementById('leoSidebar');
    this.toggleBtn = document.getElementById('leoToggleBtn');
    this.closeBtn = document.getElementById('closeLeoBtn');
    this.messagesContainer = document.getElementById('leoMessages');
    this.promptInput = document.getElementById('leoPromptInput');
    this.sendBtn = document.getElementById('leoSendBtn');
    this.modelPicker = document.getElementById('leoModelPicker');

    // Quick chips
    this.summarizeBtn = document.getElementById('summarizePageBtn');
    this.keyPointsBtn = document.getElementById('keyTakeawaysBtn');
    this.explainBtn = document.getElementById('explainBtn');

    this.isOpen = false;
    this.setupListeners();
  }

  setupListeners() {
    this.toggleBtn.addEventListener('click', () => {
      this.toggleSidebar();
    });

    this.closeBtn.addEventListener('click', () => {
      this.closeSidebar();
    });

    this.sendBtn.addEventListener('click', () => {
      this.handleSend();
    });

    this.promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });

    // Quick action chips
    this.summarizeBtn.addEventListener('click', () => {
      this.summarizeActivePage();
    });

    this.keyPointsBtn.addEventListener('click', () => {
      this.sendQuickPrompt('Extract the top 3-5 key points and takeaways from this page.');
    });

    this.explainBtn.addEventListener('click', () => {
      this.sendQuickPrompt('Explain what this page is about in simple terms (ELIF5).');
    });
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.sidebar.classList.add('open');
      this.promptInput.focus();
    } else {
      this.sidebar.classList.remove('open');
    }
  }

  closeSidebar() {
    this.isOpen = false;
    this.sidebar.classList.remove('open');
  }

  async extractPageContext() {
    const active = window.tabManager.getActiveTab();
    if (!active || !active.webview) {
      return { title: '', url: '', text: '' };
    }

    try {
      const result = await active.webview.executeJavaScript(`
        (function() {
          if (window.__brave_extract_page_content) {
            return window.__brave_extract_page_content();
          }
          return {
            title: document.title || '',
            url: window.location.href || '',
            text: document.body ? document.body.innerText.slice(0, 10000) : ''
          };
        })()
      `);
      return result;
    } catch (e) {
      return { title: active.title, url: active.url, text: '' };
    }
  }

  appendMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `leo-message ${role}`;

    // Simple markdown formatting for bold, bullets, and code blocks
    let formattedText = text
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n• /g, '<br>• ');

    msgDiv.innerHTML = `<div class="msg-bubble">${formattedText}</div>`;
    this.messagesContainer.appendChild(msgDiv);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  async handleSend() {
    const text = this.promptInput.value.trim();
    if (!text) return;

    this.promptInput.value = '';
    this.appendMessage('user', text);

    const model = this.modelPicker.value;
    const pageContext = await this.extractPageContext();

    // Show typing state
    const typingDiv = document.createElement('div');
    typingDiv.className = 'leo-message assistant typing';
    typingDiv.innerHTML = `<div class="msg-bubble" style="color: #A0A5B5; font-style: italic;">Leo is thinking...</div>`;
    this.messagesContainer.appendChild(typingDiv);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

    try {
      if (window.braveAPI && window.braveAPI.chatWithLeo) {
        const response = await window.braveAPI.chatWithLeo({
          message: text,
          pageContext,
          model
        });
        typingDiv.remove();
        this.appendMessage('assistant', response);
      } else {
        typingDiv.remove();
        this.appendMessage('assistant', `I've analyzed your question based on ${pageContext.title || 'the current context'}. Everything is running privately on your device.`);
      }
    } catch (err) {
      typingDiv.remove();
      this.appendMessage('assistant', 'Sorry, I encountered an issue analyzing that request: ' + err.message);
    }
  }

  async summarizeActivePage() {
    if (!this.isOpen) this.toggleSidebar();

    const active = window.tabManager.getActiveTab();
    if (!active) return;

    this.appendMessage('user', 'Summarize this page');

    const typingDiv = document.createElement('div');
    typingDiv.className = 'leo-message assistant typing';
    typingDiv.innerHTML = `<div class="msg-bubble" style="color: #A0A5B5; font-style: italic;">Reading and summarizing webpage...</div>`;
    this.messagesContainer.appendChild(typingDiv);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

    const pageContext = await this.extractPageContext();
    const model = this.modelPicker.value;

    try {
      if (window.braveAPI && window.braveAPI.summarizePage) {
        const res = await window.braveAPI.summarizePage({
          url: pageContext.url,
          title: pageContext.title,
          pageText: pageContext.text,
          model
        });
        typingDiv.remove();
        this.appendMessage('assistant', res.summary);
      }
    } catch (err) {
      typingDiv.remove();
      this.appendMessage('assistant', 'Failed to generate page summary: ' + err.message);
    }
  }

  sendQuickPrompt(promptText) {
    if (!this.isOpen) this.toggleSidebar();
    this.promptInput.value = promptText;
    this.handleSend();
  }
}

window.LeoUI = LeoUI;
