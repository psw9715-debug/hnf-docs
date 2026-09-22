'use strict';

const { app, BrowserWindow, screen, ipcMain, shell, safeStorage } = require('electron');
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/drive';
const USER_DATA = app.getPath('userData');
const CONFIG_PATH = path.join(USER_DATA, 'desktop-config.json');
const REFRESH_TOKEN_PATH = path.join(USER_DATA, 'google-refresh-token.enc');

// 이 컴퓨터의 실제 로그인 계정(OS/브라우저)과 무관하게, 앱이 보관하는 refresh_token은
// 최초 1회 동의한 구글 계정(suhyunfabric@gmail.com)에 영구히 묶여있음.
// 이후엔 이 refresh_token으로 서버-서버 통신만으로 access_token을 재발급받기 때문에
// 브라우저 로그인 화면이 다시 뜨지 않음 (사파리의 조용한 갱신 실패 문제와 무관한, 진짜 영구 로그인).

function defaultLocalStorageRoot() {
  if (process.platform === 'win32') return 'D:\\hnf-docs-desktop';
  // 윈도우가 아닌 환경(개발/테스트용)에서는 문서 폴더 아래에 만듦
  return path.join(app.getPath('documents'), 'hnf-docs-desktop');
}

function loadConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    return Object.assign({ clientId: '', clientSecret: '', localStorageRoot: defaultLocalStorageRoot() }, JSON.parse(raw));
  } catch (e) {
    return { clientId: '', clientSecret: '', localStorageRoot: defaultLocalStorageRoot() };
  }
}
function saveConfig(cfg) {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), 'utf8');
}

function saveRefreshToken(token) {
  fs.mkdirSync(path.dirname(REFRESH_TOKEN_PATH), { recursive: true });
  if (safeStorage.isEncryptionAvailable()) {
    fs.writeFileSync(REFRESH_TOKEN_PATH, safeStorage.encryptString(token));
  } else {
    // 이 OS엔 OS 레벨 암호화가 없음(드문 경우) — 평문으로라도 저장은 해둠
    fs.writeFileSync(REFRESH_TOKEN_PATH, 'PLAIN:' + token, 'utf8');
  }
}
function loadRefreshToken() {
  try {
    const buf = fs.readFileSync(REFRESH_TOKEN_PATH);
    if (buf.slice(0, 6).toString('utf8') === 'PLAIN:') return buf.toString('utf8').slice(6);
    if (safeStorage.isEncryptionAvailable()) return safeStorage.decryptString(buf);
    return null;
  } catch (e) {
    return null;
  }
}
function clearRefreshToken() {
  try { fs.unlinkSync(REFRESH_TOKEN_PATH); } catch (e) {}
}

function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// PKCE(코드 검증기) 방식의 데스크톱 OAuth 로그인 — 최초 1회만 브라우저가 뜸.
// 여기서 받은 refresh_token을 암호화해서 저장해두고, 이후엔 이걸로 access_token만 조용히 재발급받음.
async function runLoopbackOAuth(clientId, clientSecret) {
  // 테스트 전용: 실제 구글 서버/브라우저를 열지 않고 가짜 토큰을 즉시 돌려줌 (시뮬레이션 테스트에서만 사용)
  if (process.env.HNF_TEST_MODE === '1') {
    return { access_token: 'TEST_ACCESS_TOKEN', refresh_token: 'TEST_REFRESH_TOKEN', expires_in: 3600 };
  }
  const codeVerifier = base64url(crypto.randomBytes(32));
  const codeChallenge = base64url(crypto.createHash('sha256').update(codeVerifier).digest());

  const { redirectUri, code } = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, 'http://127.0.0.1');
      const code = url.searchParams.get('code');
      const errParam = url.searchParams.get('error');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      if (code) {
        res.end('<html><body style="font-family:sans-serif;padding:40px"><h2>로그인 완료!</h2><p>이 창은 닫으셔도 됩니다.</p></body></html>');
      } else {
        res.end('<html><body style="font-family:sans-serif;padding:40px"><h2>로그인 실패</h2><p>' + (errParam || '알 수 없는 오류') + '</p></body></html>');
      }
      server.close();
      if (code) resolve({ redirectUri, code });
      else reject(new Error('구글 로그인 실패: ' + (errParam || 'unknown_error')));
    });
    let redirectUri;
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      redirectUri = `http://127.0.0.1:${port}`;
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', GOOGLE_SCOPES);
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent'); // refresh_token을 확실히 받기 위해 매번 동의화면 강제
      authUrl.searchParams.set('code_challenge', codeChallenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');
      shell.openExternal(authUrl.toString());
    });
    setTimeout(() => { try { server.close(); } catch (e) {} reject(new Error('로그인 시간이 초과됐어요 (5분)')); }, 5 * 60 * 1000);
  });

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    })
  });
  const tokenJson = await tokenRes.json();
  if (!tokenRes.ok) throw new Error('토큰 교환 실패: ' + (tokenJson.error_description || tokenJson.error || tokenRes.status));
  return tokenJson; // { access_token, refresh_token, expires_in, ... }
}

async function refreshAccessToken(clientId, clientSecret, refreshToken) {
  if (process.env.HNF_TEST_MODE === '1') {
    return { access_token: 'TEST_ACCESS_TOKEN_REFRESHED', expires_in: 3600 };
  }
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });
  const json = await res.json();
  if (!res.ok) throw new Error('토큰 갱신 실패: ' + (json.error_description || json.error || res.status));
  return json; // { access_token, expires_in, ... } (refresh_token은 보통 다시 안 내려옴 — 기존 걸 계속 씀)
}

function createWindow() {
  const { workAreaSize } = screen.getPrimaryDisplay();
  const width = Math.max(420, Math.min(520, Math.round(workAreaSize.width * 0.32)));
  const height = Math.max(760, Math.min(960, Math.round(workAreaSize.height * 0.88)));

  const win = new BrowserWindow({
    width,
    height,
    minWidth: 380,
    minHeight: 640,
    title: '혀니네홈패션 거래문서',
    backgroundColor: '#F5F3EE',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.setMenuBarVisibility(false);
  // HNF_INDEX_OVERRIDE: 테스트에서만 씀 (CDN이 막힌 샌드박스에서 로컬 vendor 스크립트로 바꾼 사본을 로드하기 위함).
  // 평소엔 항상 실제 웹앱과 완전히 같은 ../index.html을 그대로 씀.
  win.loadFile(process.env.HNF_INDEX_OVERRIDE || path.join(__dirname, '..', 'index.html'));
  return win;
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

/* ============================================================
   IPC: 설정 (클라이언트 ID/시크릿, 로컬 저장 경로)
   ============================================================ */
ipcMain.handle('config:get', () => loadConfig());
ipcMain.handle('config:set', (evt, partial) => {
  const cfg = Object.assign(loadConfig(), partial);
  saveConfig(cfg);
  return cfg;
});

/* ============================================================
   IPC: 구글 로그인 (데스크톱 OAuth, refresh_token으로 영구 로그인)
   ============================================================ */
ipcMain.handle('google:ensureToken', async () => {
  const cfg = loadConfig();
  if (!cfg.clientId || !cfg.clientSecret) {
    throw new Error('설정에서 데스크톱용 구글 클라이언트 ID/시크릿을 먼저 입력해주세요.');
  }
  const existingRefresh = loadRefreshToken();
  if (existingRefresh) {
    try {
      const tok = await refreshAccessToken(cfg.clientId, cfg.clientSecret, existingRefresh);
      return { access_token: tok.access_token, expires_in: tok.expires_in, viaSilentRefresh: true };
    } catch (e) {
      // refresh_token 자체가 만료/취소된 경우에만 새로 로그인 필요 (거의 안 일어남 — production 상태 기준 무기한)
      clearRefreshToken();
    }
  }
  const tok = await runLoopbackOAuth(cfg.clientId, cfg.clientSecret);
  if (tok.refresh_token) saveRefreshToken(tok.refresh_token);
  return { access_token: tok.access_token, expires_in: tok.expires_in, viaSilentRefresh: false };
});
ipcMain.handle('google:forgetLogin', () => { clearRefreshToken(); return true; });
ipcMain.handle('google:hasStoredLogin', () => !!loadRefreshToken());

/* ============================================================
   IPC: 로컬 PDF 저장 (D:\hnf-docs-desktop\pdf-archive\{거래처}\...)
   ============================================================ */
function sanitizeSegment(s) {
  return String(s || '').replace(/[\/\\:*?"<>|]/g, '_').trim() || 'unknown';
}
ipcMain.handle('files:savePdf', (evt, { customerName, filename, base64 }) => {
  const cfg = loadConfig();
  const dir = path.join(cfg.localStorageRoot, 'pdf-archive', sanitizeSegment(customerName));
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, sanitizeSegment(filename));
  fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
  return filePath;
});
ipcMain.handle('files:openLocalFolder', () => {
  const cfg = loadConfig();
  fs.mkdirSync(cfg.localStorageRoot, { recursive: true });
  shell.openPath(cfg.localStorageRoot);
});
ipcMain.handle('files:getLocalRoot', () => loadConfig().localStorageRoot);
