# 🦁 Brave Browser — Advanced Desktop Privacy Browser

A complete, end-to-end, privacy-first desktop web browser engineered from the ground up to replicate the look, feel, and core capabilities of **Brave Browser**. Built with modern **Electron**, standard **Chromium engine**, **Node.js**, and vanilla web technologies with zero bloated UI frameworks.

---

## 📸 Key Features at a Glance

### 1. 🛡️ Brave Shields (Core Privacy & Ad-Blocking Engine)
* **Real Network Request Interception**: Intercepts requests at the session level before network dispatch using Electron `webRequest` APIs.
* **Curated Blocklists**: Built-in rules covering known ad networks (`doubleclick`, `googleadservices`, `adnxs`, `criteo`, etc.), surveillance analytics & telemetry (`google-analytics`, `mixpanel`, `segment`, `hotjar`, etc.), and crypto-miners (`coinhive`, `crypto-loot`, etc.).
* **HTTPS Everywhere Upgrade**: Automatically redirects insecure HTTP URLs to encrypted HTTPS.
* **Fingerprinting Defense**: Injected guest preload scripts introduce microscopic randomization to `HTMLCanvasElement.toDataURL`, `CanvasRenderingContext2D.getImageData`, `AudioBuffer`, and spoof WebGL vendor strings to thwart canvas/audio hardware fingerprinting.
* **Interactive Shields Popover**: Click the signature **Brave Lion** icon in the address bar to toggle:
  * Master Shields UP / DOWN per domain
  * Trackers & Ads blocking (Standard / Aggressive / Off)
  * HTTPS Upgrade toggle
  * Script blocking toggle
  * Live blocked request counter and expandable drill-down drawer listing blocked URLs.
* **De-AMP & Canonical URL Unwrapping**: Automatically bypasses Google AMP wrappers and navigates directly to publisher canonical URLs.
* **Brave Clean URLs & Debouncing**: Automatically strips surveillance query parameters (`fbclid`, `gclid`, `utm_source`, `utm_medium`, `igshid`, etc.) from URLs on navigation and via the "Copy Clean Link" button.
* **Forgetful Browsing**: Domain-level setting that purges cookies, localStorage, IndexedDB, and cache partitions the moment the tab is closed.
* **Cookie Consent & Annoyance Blocker**: Cosmetic filters suppress GDPR and consent modals automatically.
* **Brave Farbling & WebRTC IP Defense**: Spoofs Canvas, AudioBuffer, WebGL, Battery API, and filters WebRTC ICE candidates to prevent private local IP leakages.
* **Custom Filter Rules Engine (`brave://shields`)**: Full AdBlock Plus syntax support (`||domain^`, `##selector`) with custom editor and rule compilation.
* **Shields Stat Tracking**: Counts blocked ads/trackers, estimated bandwidth saved (in MB), and estimated load time saved (in seconds).

### 2. 🤖 Brave Leo (Built-in AI Assistant Sidebar)
* **Docked Slide-out Assistant**: Toggleable with one click or shortcut from the browser chrome.
* **Instant Page Summarization**: Extracts clean readable text from the active webpage, discards boilerplate, and produces structured executive summaries with key takeaways.
* **Grounded Page Q&A**: Ask Leo specific questions regarding definitions, data, or arguments presented on the current page.
* **Quick Action Prompt Chips**:
  * ✨ *Summarize Page*
  * 💡 *Key Points*
  * ❓ *Explain in simple terms (ELIF5)*
* **Model Switcher**: Simulated support for Llama 3 8B, Claude 3.5 Sonnet, and Mixtral 8x7B.

### 3. 🌐 Brave Web3 Crypto Wallet (`brave://wallet`)
* **Multi-Chain Portfolio**: Real-time asset balances for Ethereum (ETH), Solana (SOL), Bitcoin (BTC), Basic Attention Token (BAT), and USD Coin (USDC).
* **Interactive Send & Receive**:
  * Send modal with destination address validation and network gas fee estimation.
  * Receive modal with visual QR code and one-click address clipboard copier.
* **DEX Swap Aggregator**: Real-time swap simulator with slippage routing between tokens (e.g. USDC to BAT).
* **NFT Gallery**: Visual cards displaying digital collectibles and token IDs.
* **Transaction History Ledger**: Chronological audit trail of Sent, Received, and Swapped transactions with status confirmations.

### 4. 🔺 Brave Rewards & BAT Ecosystem (`brave://rewards`)
* **Private Ads Opt-in**: Earn simulated Basic Attention Tokens based on page engagement.
* **Attention Score & Earnings Estimator**: Displays monthly accrual, BAT balance, and USD value.
* **Verified Creator Tipping**: One-click direct tipping interface for verified entities (Wikipedia, Electronic Frontier Foundation, GitHub repositories).

### 5. 🧅 Private Window with Tor Mode (`brave://tor`)
* **Isolated Ephemeral Partitions**: History, storage, and cookies are never written to disk.
* **Onion Routing Circuit Visualizer**: Displays relay hops:
  $$\text{This Computer} \longrightarrow \text{Guard Relay (DE)} \longrightarrow \text{Middle Relay (IS)} \longrightarrow \text{Exit Node (NL)} \longrightarrow \text{Destination}$$
* **Circuit Regeneration**: Button to rebuild and rotate relay circuits on demand.

### 6. 🚀 Signature Brave New Tab Dashboard (`brave://newtab`)
* **High-Definition Wallpapers**: Multiple scenic backdrops with photographer credits and seamless image rotation.
* **Dynamic Clock & Greeting**: Real-time 24h clock with contextual greeting.
* **Shields Live Stats Banner**: Animated counters for Trackers Blocked, Bandwidth Saved, and Time Saved.
* **Top Sites Speed Dial**: Customizable quick launch tiles with one-click navigation and "+ Add Site" modal.
* **Brave News Feed**: Curated privacy, technology, security, and open source news cards.
* **Customize Drawer**: Toggle widgets (Wallpaper, Clock, Stats, Top Sites, News).

### 7. 📖 Brave SpeedReader (Distraction-Free Reading Mode)
* **One-Click Distraction Removal**: Click the book icon (`📖`) in the Omnibox on any article or blog post.
* **Clean Typography & Layout**: Strips ads, navbars, sidebars, and trackers, displaying pure article text with estimated read times and word counts.

### 8. 📑 Vertical Tabs Layout
* **Brave Signature Vertical Tabs**: Switch between top horizontal tab strip and left-hand vertical tabs sidebar with a single click.
* **Space-Efficient Multi-Tasking**: Tabs stack vertically with title, favicon, audio indicators, and close buttons.

### 9. 🎵 Brave Playlist / Reading List (`brave://playlist`)
* **Save for Later**: Keep articles and videos in your local offline playlist for focused reading without interruptions.

### 10. 🔎 Smart Omnibox & Navigation
* **Smart URL / Search Engine Dispatcher**: Auto-detects URLs, domains, and keywords; queries Brave Search by default.
* **Autocomplete & Search Suggestions**: Real-time dropdown showing search suggestions, matching bookmarks, and history entries.
* **Copy Clean Link Button (`🔗`)**: Copies URLs with tracking tokens automatically stripped.
* **Connection Security Badges**:
  * 🔒 Green Lock for encrypted HTTPS
  * 🦁 Orange Lion for internal `brave://` protocols
  * 🧅 Purple Onion for Tor Private sessions
  * ⚠️ Warning for unencrypted HTTP
* **Bookmark Star Button**: One-click save to bookmarks bar.

### 11. ⚙️ Desktop Controls & Shortcuts
* **Fast Tab Strip**: Add tab (`Ctrl+T`), close tab (`Ctrl+W`), duplicate, and middle-click to close.
* **Audio Indicators**: Displays speaker icon on tabs playing media; click to mute/unmute.
* **Find in Page (`Ctrl+F`)**: Floating bar with search input, match counter (e.g. `1/14`), and previous/next navigation.
* **Zoom Controls**: Zoom in (`Ctrl++`), zoom out (`Ctrl+-`), and zoom reset (`Ctrl+0`).
* **Frameless Sleek Titlebar**: Custom Brave dark mode titlebar with window controls (Minimize, Maximize, Close).

---

## 📁 Folder Structure

```
brave/
├── package.json                          # Package config & npm start script
├── README.md                             # Exhaustive documentation
│
├── assets/
│   └── icons/
│       └── brave-lion.png                # Window app icon
│
├── src/
│   ├── main/
│   │   ├── index.js                      # Electron Main process entry point & window lifecycle
│   │   ├── ipc-handlers.js               # IPC bridge handlers (tabs, shields, bookmarks, wallet, etc.)
│   │   │
│   │   ├── shields/
│   │   │   ├── shields-engine.js         # Core network blocker, HTTPS upgrade & privacy headers
│   │   │   └── blocklists.js             # Curated lists of ad domains, trackers, telemetry, miners
│   │   │
│   │   ├── ai/
│   │   │   └── leo-service.js            # Brave Leo AI processing (summarizer, context Q&A)
│   │   │
│   │   ├── tor/
│   │   │   └── tor-session.js            # Tor circuit visualizer & session partition manager
│   │   │
│   │   ├── storage/
│   │   │   └── store.js                  # Persistent JSON storage for history, bookmarks, shields, wallet
│   │   │
│   │   └── protocols/
│   │       └── brave-protocol.js         # Custom brave:// protocol handler serving internal pages
│   │
│   ├── preload/
│   │   ├── browser-preload.js            # ContextBridge exposing window.braveAPI to browser chrome
│   │   └── webview-preload.js            # Injected into webviews for anti-fingerprinting & text extraction
│   │
│   ├── renderer/
│   │   ├── index.html                    # Main browser window structure (tab strip, omnibox, sidebar)
│   │   │
│   │   ├── styles/
│   │   │   ├── browser.css               # Main chrome UI styling (tabs, nav bar, find bar, dropdown)
│   │   │   ├── shields-popup.css         # Brave Shields lion popup & blocked drawer styling
│   │   │   ├── leo-sidebar.css           # Brave Leo AI slide-out sidebar styling
│   │   │   └── omnibox.css               # Autocomplete search suggestions dropdown styling
│   │   │
│   │   └── js/
│   │       ├── icons.js                  # Crisp vector SVG icons (Lion, Shields, Leo, BAT, Wallet)
│   │       ├── app.js                    # Main UI orchestrator, window controls & keyboard shortcuts
│   │       ├── tab-manager.js            # Multi-tab lifecycle, webview management & audio controls
│   │       ├── omnibox.js                # URL bar logic, search autocomplete, security badges
│   │       ├── shields-ui.js             # Shields popup controller & per-domain settings
│   │       ├── leo-ui.js                 # Brave Leo AI assistant frontend controller
│   │       └── bookmarks-bar.js          # Bookmarks quick bar below omnibox
│   │
│   └── internal-pages/
│       ├── newtab/                       # brave://newtab
│       │   ├── newtab.html
│       │   ├── newtab.css
│       │   └── newtab.js
│       ├── settings/                     # brave://settings
│       │   ├── settings.html
│       │   ├── settings.css
│       │   └── settings.js
│       ├── wallet/                       # brave://wallet
│       │   ├── wallet.html
│       │   ├── wallet.css
│       │   └── wallet.js
│       ├── rewards/                      # brave://rewards
│       │   ├── rewards.html
│       │   ├── rewards.css
│       │   └── rewards.js
│       ├── history/                      # brave://history
│       │   ├── history.html
│       │   ├── history.css
│       │   └── history.js
│       ├── bookmarks/                    # brave://bookmarks
│       │   ├── bookmarks.html
│       │   ├── bookmarks.css
│       │   └── bookmarks.js
│       ├── downloads/                    # brave://downloads
│       │   ├── downloads.html
│       │   ├── downloads.css
│       │   └── downloads.js
│       ├── tor/                          # brave://tor
│       │   ├── tor.html
│       │   ├── tor.css
│       │   └── tor.js
│       ├── shields/                      # brave://shields
│       │   ├── shields.html
│       │   ├── shields.css
│       │   └── shields.js
│       └── playlist/                     # brave://playlist
│           ├── playlist.html
│           ├── playlist.css
│           └── playlist.js
```

---

## 🛠️ Architecture & Security Model

```
 ┌─────────────────────────────────────────────────────────┐
 │                   Electron Main Process                 │
 │  ┌─────────────────┐ ┌───────────────┐ ┌──────────────┐ │
 │  │ Shields Engine  │ │  Data Store   │ │  Tor Session │ │
 │  │ (webRequest API)│ │(brave_data.js)│ │  (Partition) │ │
 │  └────────┬────────┘ └───────┬───────┘ └──────┬───────┘ │
 └───────────┼──────────────────┼────────────────┼─────────┘
             │                  │                │
             │           IPC Bridge              │
             │      (browser-preload.js)         │
             ▼                  ▼                ▼
 ┌─────────────────────────────────────────────────────────┐
 │                 Browser Chrome Window                   │
 │   [ Tab Strip ]   [ Omnibox ]   [ Shields Lion Badge ]  │
 │   [ Bookmarks ]   [ Leo AI ]    [ Web3 Crypto Wallet ]  │
 └──────────────────────────────┬──────────────────────────┘
                                │
                        Webview Sandboxing
                                │
     ┌──────────────────────────┴──────────────────────────┐
     ▼                                                     ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│       Guest Tab 1 Webview     │   │       Guest Tab 2 Webview     │
│   - Context Isolation: YES    │   │   - Context Isolation: YES    │
│   - Node Integration: NO      │   │   - Node Integration: NO      │
│   - Anti-Fingerprinting Hook  │   │   - Anti-Fingerprinting Hook  │
└───────────────────────────────┘   └───────────────────────────────┘
```

1. **Context Isolation & Sandboxing**:
   - Guest web content has zero access to Node.js APIs (`nodeIntegration: false`, `contextIsolation: true`).
   - The Chrome UI connects to the main process strictly via a type-safe `contextBridge` (`window.braveAPI`).
2. **Network Level Privacy**:
   - Every outgoing request is vetted against `blocklists.js`. Trackers and ads are dropped before leaving the device.
   - Headers automatically inject `DNT: 1` (Do Not Track) and `Sec-GPC: 1` (Global Privacy Control).
3. **Internal Scheme Security**:
   - The custom scheme `brave://` is registered with Electron's `registerSchemesAsPrivileged` as standard, secure, and CORS-enabled, allowing internal pages to fetch assets locally and securely without file URL vulnerabilities.

---

## ⌨️ Global Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + T` | Open a new tab |
| `Ctrl + W` | Close the current active tab |
| `Ctrl + R` / `F5` | Reload the active page |
| `Ctrl + L` / `Alt + D` | Focus and select the Omnibox / address bar |
| `Ctrl + H` | Open Browsing History (`brave://history`) |
| `Ctrl + B` | Open Bookmarks Manager (`brave://bookmarks`) |
| `Ctrl + J` | Open Downloads (`brave://downloads`) |
| `Ctrl + Shift + N` | Open New Private Window with Tor (`brave://tor`) |
| `Ctrl + F` | Find text in the current page |
| `Ctrl + +` | Zoom in webpage |
| `Ctrl + -` | Zoom out webpage |
| `Ctrl + 0` | Reset webpage zoom to 100% |
| `Escape` | Close find bar, dropdown menus, or active modals |

---

## 🚀 Getting Started & Running Locally

### Prerequisites
* [Node.js](https://nodejs.org/) v18 or higher (tested with Node v24).
* Windows, macOS, or Linux.

### Installation

1. Clone or navigate into the project directory:
   ```bash
   cd brave
   ```

2. Install dependencies (Electron):
   ```bash
   npm install
   ```

3. Launch the browser:
   ```bash
   npm start
   ```

---

## 🧪 Testing Features Inside the Browser

1. **Test Web Browsing**:
   - In the Omnibox, type `https://wikipedia.org` or `https://github.com` and press Enter.
   - The page loads using Chromium with JavaScript, CSS, HTML5, and full navigation.
2. **Test Brave Shields**:
   - Visit an ad/tracker-heavy website or tech blog.
   - Observe the live badge counter on the Lion icon in the address bar incrementing (e.g. `7` or `14`).
   - Click the **Lion icon** to open the Shields popover, inspect the list of blocked trackers, or toggle Shields OFF/ON.
3. **Test Brave Leo AI**:
   - Click the **Leo** button on the top right toolbar.
   - Click **✨ Summarize Page**. Leo will extract the article contents and generate a concise summary.
   - Type questions like *"What are the key points?"* to converse with Leo.
4. **Test Web3 Crypto Wallet**:
   - Click the **Wallet** icon in the toolbar or navigate to `brave://wallet`.
   - Inspect multi-chain balances (ETH, SOL, BAT, USDC).
   - Test the **Swap** modal (e.g. swap USDC to BAT) or view the **NFT Gallery**.
5. **Test Brave Rewards**:
   - Navigate to `brave://rewards`.
   - Test tipping a verified creator (e.g., Wikipedia Foundation or EFF) with simulated BAT.
6. **Test Tor Private Mode**:
   - Press `Ctrl + Shift + N` or select **New Private Window with Tor** from the menu.
   - Inspect the 3-relay onion circuit visualizer and click **New Tor Circuit** to cycle relays.
7. **Test New Tab Dashboard**:
   - Press `Ctrl + T` to open a new tab.
   - Change wallpapers with the bottom **Change Image** button, click speed dial tiles, or use the **Customize** drawer.

---

## 📄 License
MIT License. Created for education, exploration, and privacy empowerment.
