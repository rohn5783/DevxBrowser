/**
 * Brave Guest Webview Preload Script
 * - Brave Farbling: Canvas, Audio, WebGL randomization
 * - WebRTC Private IP Leak Defense
 * - Battery Status API Defense
 * - Hardware Concurrency & Memory Normalization
 * - Cookie Notice / GDPR Banner Cosmetic Auto-Blocker
 * - SpeedReader (Reader Mode) Article Extractor
 */

(function () {
  'use strict';

  // --- 1. Brave Farbling: Canvas & Audio Fingerprinting Randomization ---
  try {
    const getNoise = () => (Math.random() - 0.5) * 0.00001;

    // Canvas Protection: Randomize toDataURL and getImageData
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function (type, ...args) {
      try {
        const ctx = this.getContext('2d');
        if (ctx && this.width > 0 && this.height > 0) {
          const imgData = ctx.getImageData(0, 0, Math.min(10, this.width), Math.min(10, this.height));
          for (let i = 0; i < imgData.data.length; i += 4) {
            imgData.data[i] = Math.min(255, Math.max(0, imgData.data[i] + (Math.random() > 0.5 ? 1 : -1)));
          }
          ctx.putImageData(imgData, 0, 0);
        }
      } catch (e) {}
      return originalToDataURL.apply(this, [type, ...args]);
    };

    // AudioContext Fingerprinting Protection
    if (window.AudioBuffer) {
      const origGetChannelData = AudioBuffer.prototype.getChannelData;
      AudioBuffer.prototype.getChannelData = function (channel) {
        const data = origGetChannelData.apply(this, [channel]);
        for (let i = 0; i < Math.min(50, data.length); i++) {
          data[i] += getNoise();
        }
        return data;
      };
    }

    // WebGL Vendor / Renderer Spoofing
    const origGetParameter = window.WebGLRenderingContext ? WebGLRenderingContext.prototype.getParameter : null;
    if (origGetParameter) {
      WebGLRenderingContext.prototype.getParameter = function (param) {
        if (param === 37445) return 'Google Inc. (Brave Shields Protected)';
        if (param === 37446) return 'Brave ANGLE (Generic Hardware Acceleration)';
        return origGetParameter.apply(this, [param]);
      };
    }
  } catch (err) {
    console.debug('[Brave Farbling] init error:', err);
  }

  // --- 2. WebRTC IP Leak Protection (Prevent Local IP Leakage) ---
  try {
    if (window.RTCPeerConnection) {
      const origCreateOffer = RTCPeerConnection.prototype.createOffer;
      RTCPeerConnection.prototype.createOffer = function (options) {
        return origCreateOffer.apply(this, [options]).then(offer => {
          // Filter candidate SDP lines to strip 192.168.x, 10.x, .local private IPs
          if (offer && offer.sdp) {
            offer.sdp = offer.sdp
              .replace(/a=candidate:.*(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|[a-zA-Z0-9-]+\.local).*\r\n/g, '');
          }
          return offer;
        });
      };
    }
  } catch (e) {}

  // --- 3. Battery API & Hardware Concurrency Protection ---
  try {
    if (navigator.getBattery) {
      navigator.getBattery = function () {
        return Promise.resolve({
          charging: true,
          chargingTime: 0,
          dischargingTime: Infinity,
          level: 1.0,
          addEventListener: () => {},
          removeEventListener: () => {}
        });
      };
    }

    // Normalize hardware properties to standard profile
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
  } catch (e) {}

  // --- 4. Cookie Consent / GDPR Banner Auto-Blocker (Cosmetic Filter) ---
  function injectCosmeticAnnoyanceBlocker() {
    try {
      const style = document.createElement('style');
      style.id = 'brave-annoyance-filter';
      style.textContent = `
        #onetrust-consent-sdk,
        #onetrust-banner-sdk,
        .cc-banner,
        .cookie-notice,
        #cookie-law-info-bar,
        .qc-cmp-ui-container,
        #CybotCookiebotDialog,
        div[id*="cookie-consent"],
        div[class*="cookie-banner"],
        div[id*="consent-banner"] {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
          visibility: hidden !important;
        }
      `;
      if (document.head) {
        document.head.appendChild(style);
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          if (document.head) document.head.appendChild(style);
        });
      }
    } catch (e) {}
  }
  injectCosmeticAnnoyanceBlocker();

  // --- 5. Brave SpeedReader (Distraction-Free Reader Mode) ---
  window.__brave_toggle_speedreader = function () {
    try {
      let readerEl = document.getElementById('brave-speedreader-view');
      if (readerEl) {
        readerEl.remove();
        document.body.style.display = '';
        return { active: false };
      }

      // Extract article details
      const title = (document.querySelector('h1') ? document.querySelector('h1').innerText : document.title) || 'Article';
      const paragraphs = Array.from(document.querySelectorAll('article p, main p, p'))
        .filter(p => p.innerText.trim().length > 40)
        .map(p => `<p>${p.innerText}</p>`)
        .join('');

      if (!paragraphs) return { active: false, error: 'No readable text' };

      const wordCount = paragraphs.split(' ').length;
      const readTime = Math.ceil(wordCount / 200);

      readerEl = document.createElement('div');
      readerEl.id = 'brave-speedreader-view';
      readerEl.innerHTML = `
        <style>
          #brave-speedreader-view {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: #14161C;
            color: #E2E4EB;
            z-index: 2147483647;
            overflow-y: auto;
            padding: 50px 20px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Georgia, serif;
          }
          .sr-container {
            max-width: 720px;
            margin: 0 auto;
            line-height: 1.8;
            font-size: 19px;
          }
          .sr-header {
            margin-bottom: 36px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding-bottom: 20px;
          }
          .sr-badge {
            background: #FF7626;
            color: white;
            font-size: 11px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 4px;
            text-transform: uppercase;
            display: inline-block;
            margin-bottom: 12px;
          }
          .sr-title {
            font-size: 36px;
            font-weight: 700;
            line-height: 1.3;
            color: #FFFFFF;
            margin-bottom: 12px;
          }
          .sr-meta {
            font-size: 14px;
            color: #8C92A4;
            display: flex;
            gap: 16px;
          }
          .sr-container p {
            margin-bottom: 24px;
            color: #D2D5E0;
          }
          .sr-close-btn {
            position: fixed;
            top: 20px;
            right: 30px;
            background: #252834;
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            z-index: 2147483648;
          }
          .sr-close-btn:hover {
            background: #FF7626;
          }
        </style>
        <button class="sr-close-btn" onclick="window.__brave_toggle_speedreader()">✕ Exit SpeedReader</button>
        <div class="sr-container">
          <div class="sr-header">
            <span class="sr-badge">⚡ Brave SpeedReader</span>
            <h1 class="sr-title">${title}</h1>
            <div class="sr-meta">
              <span>Estimated Reading Time: ~${readTime} min</span>
              <span>Words: ${wordCount}</span>
            </div>
          </div>
          <div class="sr-body">
            ${paragraphs}
          </div>
        </div>
      `;

      document.documentElement.appendChild(readerEl);
      return { active: true };
    } catch (e) {
      return { active: false, error: e.message };
    }
  };

  // --- 6. Leo Page Content Extractor ---
  window.__brave_extract_page_content = function () {
    try {
      const title = document.title || '';
      const url = window.location.href || '';
      const bodyClone = document.body ? document.body.cloneNode(true) : null;
      if (!bodyClone) return { title, url, text: '' };

      const junkSelectors = ['script', 'style', 'noscript', 'iframe', 'svg', 'header', 'footer', 'nav', '.ad', '.ads', '#sidebar', '#brave-speedreader-view'];
      junkSelectors.forEach(sel => {
        bodyClone.querySelectorAll(sel).forEach(el => el.remove());
      });

      const rawText = bodyClone.innerText || bodyClone.textContent || '';
      const cleanText = rawText.replace(/\s+/g, ' ').slice(0, 15000);

      return { title, url, text: cleanText };
    } catch (e) {
      return { title: document.title, url: window.location.href, text: '' };
    }
  };
})();
