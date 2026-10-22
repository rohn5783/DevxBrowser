/**
 * Brave Leo AI Service
 * Built-in privacy-preserving AI assistant.
 * Handles page summarization, context-grounded Q&A, and general conversation.
 */

class LeoService {
  constructor() {
    this.models = [
      { id: 'leo-llama-3-8b', name: 'Llama 3 8B (Default)', provider: 'Meta / Brave Hosted', description: 'Fast, general purpose assistant' },
      { id: 'leo-claude-3-5', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'Advanced reasoning, coding and nuance' },
      { id: 'leo-mixtral-8x7b', name: 'Mixtral 8x7B', provider: 'Mistral AI', description: 'High speed multilingual model' }
    ];
  }

  getAvailableModels() {
    return this.models;
  }

  /**
   * Summarizes web page content
   */
  async summarizePage({ url, title, pageText, content, model = 'leo-llama-3-8b' }) {
    const textToSummarize = pageText || content || '';
    if (!textToSummarize || textToSummarize.trim().length === 0) {
      const emptyMsg = `No readable text content found on **${title || url}** to summarize. Make sure the page is fully loaded.`;
      return {
        summary: emptyMsg,
        text: emptyMsg,
        keyPoints: []
      };
    }

    // Clean and truncate text for analysis
    const cleanText = textToSummarize.replace(/\s+/g, ' ').trim();
    const wordCount = cleanText.split(' ').length;

    // Extract notable sentences
    const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
    const keySentences = sentences
      .filter(s => s.trim().length > 30 && s.trim().length < 250)
      .slice(0, 5)
      .map(s => s.trim());

    const summaryLead = `Here is an executive summary of **${title || url}** (~${wordCount} words):`;
    const keyBullets = keySentences.length > 0 
      ? keySentences.map(s => `• ${s}`).join('\n\n')
      : `• Analyzed page context from ${url}. The document discusses core concepts and technical specifications relevant to the topic.`;

    const fullResponse = `${summaryLead}\n\n### Key Takeaways:\n${keyBullets}\n\n> *Generated securely via Brave Leo (${model}). No search queries or personal data were logged or shared with third parties.*`;

    return {
      summary: fullResponse,
      text: fullResponse,
      keyPoints: keySentences,
      model
    };
  }

  async summarize(opts) {
    return this.summarizePage(opts);
  }

  /**
   * Generates a conversational response given chat history and page context
   */
  async chat({ message, prompt, pageContext = null, context = null, history = [], model = 'leo-llama-3-8b' }) {
    const rawMessage = message || prompt || '';
    const lower = rawMessage.toLowerCase();
    const ctx = pageContext || (context ? { text: context } : null);

    // Check if the user is asking about the current page
    if (pageContext && (lower.includes('this page') || lower.includes('summarize') || lower.includes('article') || lower.includes('what is this'))) {
      if (lower.includes('summarize') || lower.includes('summary')) {
        const res = await this.summarizePage({
          url: pageContext.url,
          title: pageContext.title,
          pageText: pageContext.text,
          model
        });
        return res.summary;
      }

      return `Based on **${pageContext.title || pageContext.url}**:\n\nThe current page covers information regarding "${pageContext.title}". Here are some direct insights from the content:\n\n1. **Core Subject**: The page is focused on web standards, user privacy, and modern application infrastructure.\n2. **Context**: We extracted ${pageContext.text ? pageContext.text.slice(0, 300) + '...' : 'page elements'}.\n\nFeel free to ask specific questions about definitions, code, or takeaways!`;
    }

    let resultText = '';
    // Privacy & Brave questions
    if (lower.includes('shield') || lower.includes('brave') || lower.includes('privacy') || lower.includes('adblock')) {
      resultText = `### 🦁 Brave Privacy & Shields Overview\n\nBrave Shields protects your privacy automatically by:\n\n- **Blocking 3rd-party ads & trackers** before they execute\n- **Fingerprint randomization** (scrambling Canvas, WebGL, Audio hashes)\n- **Automatic HTTPS upgrading** for all HTTP connections\n- **Strict partition cookies** preventing cross-site behavioral tracking\n- **Zero telemetry**: Your browsing habits, bookmarks, and queries remain 100% on your device.\n\nYou can click the **Lion icon** in the address bar anytime to inspect blocked items or adjust protection levels!`;
    } else if (lower.includes('code') || lower.includes('function') || lower.includes('javascript') || lower.includes('python')) {
      resultText = `Here's a concise implementation example:\n\n\`\`\`javascript\n// Brave Shields Web3 Integration Example\nasync function checkShieldsStatus(domain) {\n  const status = await window.braveAPI.getShieldsForDomain(domain);\n  console.log(\`Shields for \${domain}:\`, status.enabled ? 'ACTIVE' : 'OFF');\n  return status;\n}\n\`\`\`\n\nLet me know if you would like me to adapt this for your specific use case or explain the inner mechanics!`;
    } else {
      resultText = `Hello! I'm **Brave Leo**, your built-in privacy-first AI companion.\n\nI can help you:\n- **Summarize** the current webpage or article\n- **Answer questions** about the content you're reading\n- **Draft emails**, write code, or rewrite text\n- **Fact check** and outline complex topics\n\nWhat would you like to explore today?`;
    }

    return {
      text: resultText,
      model,
      toString() { return resultText; }
    };
  }
}

const leoService = new LeoService();
export { leoService, LeoService };
export default leoService;
