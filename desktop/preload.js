'use strict';
const { contextBridge, ipcRenderer } = require('electron');

// app.js는 이 window.electronAPI 존재 여부로 "데스크톱 앱 안에서 실행 중"임을 판단함.
// (웹/모바일 브라우저에는 이게 없으니 기존 GIS 로그인 방식 그대로 씀)
contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,
  getConfig: () => ipcRenderer.invoke('config:get'),
  setConfig: (partial) => ipcRenderer.invoke('config:set', partial),
  ensureGoogleToken: () => ipcRenderer.invoke('google:ensureToken'),
  forgetGoogleLogin: () => ipcRenderer.invoke('google:forgetLogin'),
  hasStoredGoogleLogin: () => ipcRenderer.invoke('google:hasStoredLogin'),
  savePdfLocal: (customerName, filename, base64) => ipcRenderer.invoke('files:savePdf', { customerName, filename, base64 }),
  openLocalFolder: () => ipcRenderer.invoke('files:openLocalFolder'),
  getLocalRoot: () => ipcRenderer.invoke('files:getLocalRoot')
});
