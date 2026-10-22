import electron from 'electron';
const { protocol, net } = (typeof electron === 'object' && electron) ? electron : {};
import path from 'node:path';
import url from 'node:url';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function registerBraveProtocol() {
  protocol.handle('brave', async (request) => {
    try {
      const parsedUrl = new URL(request.url);
      const host = parsedUrl.hostname.toLowerCase();
      const pathname = parsedUrl.pathname;

      const baseInternalDir = path.join(__dirname, '../../internal-pages');
      let targetFilePath = null;

      if (host === 'newtab') {
        if (pathname === '/' || pathname === '' || pathname === '/newtab.html') {
          targetFilePath = path.join(baseInternalDir, 'newtab/newtab.html');
        } else {
          targetFilePath = path.join(baseInternalDir, 'newtab', pathname);
        }
      } else if (host === 'settings') {
        if (pathname === '/' || pathname === '' || pathname === '/settings.html') {
          targetFilePath = path.join(baseInternalDir, 'settings/settings.html');
        } else {
          targetFilePath = path.join(baseInternalDir, 'settings', pathname);
        }
      } else if (host === 'history') {
        if (pathname === '/' || pathname === '' || pathname === '/history.html') {
          targetFilePath = path.join(baseInternalDir, 'history/history.html');
        } else {
          targetFilePath = path.join(baseInternalDir, 'history', pathname);
        }
      } else if (host === 'bookmarks') {
        if (pathname === '/' || pathname === '' || pathname === '/bookmarks.html') {
          targetFilePath = path.join(baseInternalDir, 'bookmarks/bookmarks.html');
        } else {
          targetFilePath = path.join(baseInternalDir, 'bookmarks', pathname);
        }
      } else if (host === 'downloads') {
        if (pathname === '/' || pathname === '' || pathname === '/downloads.html') {
          targetFilePath = path.join(baseInternalDir, 'downloads/downloads.html');
        } else {
          targetFilePath = path.join(baseInternalDir, 'downloads', pathname);
        }
      } else if (host === 'wallet') {
        if (pathname === '/' || pathname === '' || pathname === '/wallet.html') {
          targetFilePath = path.join(baseInternalDir, 'wallet/wallet.html');
        } else {
          targetFilePath = path.join(baseInternalDir, 'wallet', pathname);
        }
      } else if (host === 'rewards') {
        if (pathname === '/' || pathname === '' || pathname === '/rewards.html') {
          targetFilePath = path.join(baseInternalDir, 'rewards/rewards.html');
        } else {
          targetFilePath = path.join(baseInternalDir, 'rewards', pathname);
        }
      } else if (host === 'tor') {
        if (pathname === '/' || pathname === '' || pathname === '/tor.html') {
          targetFilePath = path.join(baseInternalDir, 'tor/tor.html');
        } else {
          targetFilePath = path.join(baseInternalDir, 'tor', pathname);
        }
      } else if (host === 'shields') {
        if (pathname === '/' || pathname === '' || pathname === '/shields.html') {
          targetFilePath = path.join(baseInternalDir, 'shields/shields.html');
        } else {
          targetFilePath = path.join(baseInternalDir, 'shields', pathname);
        }
      } else if (host === 'playlist') {
        if (pathname === '/' || pathname === '' || pathname === '/playlist.html') {
          targetFilePath = path.join(baseInternalDir, 'playlist/playlist.html');
        } else {
          targetFilePath = path.join(baseInternalDir, 'playlist', pathname);
        }
      } else if (host === 'assets') {
        targetFilePath = path.join(__dirname, '../../../assets', pathname);
      } else {
        // Fallback default
        targetFilePath = path.join(baseInternalDir, 'newtab/newtab.html');
      }

      if (targetFilePath && fs.existsSync(targetFilePath)) {
        return net.fetch(url.pathToFileURL(targetFilePath).toString());
      } else {
        return new Response('Not Found', { status: 404 });
      }
    } catch (err) {
      console.error('[BraveProtocol] Error resolving URL:', request.url, err);
      return new Response('Error loading page: ' + err.message, { status: 500 });
    }
  });
}

export { registerBraveProtocol };
export default registerBraveProtocol;
