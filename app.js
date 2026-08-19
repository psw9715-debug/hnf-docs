'use strict';

/* ============================================================
   상수 / 시드 데이터
   ============================================================ */
const STORAGE_KEY = 'hnf_docs_data';
const SYNC_KEY = 'hnf_docs_sync';
const GOOGLE_KEY = 'hnf_docs_google';
const GIST_FILENAME = 'hnf_docs_data.json';
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/drive';

const DOC_LABELS = { invoice: '거래명세표', confirm: '납품확인서', quote: '견적서' };

const STAMP_DATA_URL = 'data:image/png;base64,' +
  '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';

const SUPPLIER_DEFAULT = {
  name: '혀니네홈패션',
  bizNo: '242-21-01345',
  ceo: '김수현',
  address: '세종시 대평1길 37 상가2동 131호',
  bizType: '소매업,소매업',
  bizItem: '홈패션,전자상거래',
  phone: '010-7447-0314',
  fax: '',
  bank: '농협 302-1599-6808-11 / 예금주: 김수현',
  rootFolderId: '18Up_qR8xqL8yPWaH4WFAYzMrh_u_Ojak'
};

const CUSTOMERS_SEED = [
  {
    id: 'c_hosan',
    name: '(주)호산비전',
    bizNo: '772-88-02611',
    ceo: '박범호',
    address: '충청북도 옥천군 옥천읍 옥천농공길 53-4',
    managerName: '이승운',
    managerPhone: '010-9273-9485',
    managerEmail: '',
    honorific: '이승운 팀장님',
    driveFolderId: '1175trPZQxXMGps5Yrkci-f0SMsPPTrNO'
  },
  {
    id: 'c_loelize',
    name: '로엘라이즈브레이브',
    bizNo: '',
    ceo: '',
    address: '',
    managerName: '',
    managerPhone: '',
    managerEmail: '',
    honorific: '',
    driveFolderId: '1n_VySswT5VBTAz8CpsXIUOG_OB_vOEsQ'
  },
  {
    id: 'c_inart',
    name: '(주)인아트',
    bizNo: '',
    ceo: '',
    address: '',
    managerName: '',
    managerPhone: '',
    managerEmail: '',
    honorific: '',
    driveFolderId: '1QTLgxm073VR_jVftbluoJIHTjqF7I1Bv'
  }
];

/* ============================================================
   상태 / 저장소
   ============================================================ */
let appData = null;
let syncConfig = { token: '', gistId: '', autoSync: false };
let googleConfig = { clientId: '' };

let currentCustomerId = null;
let currentItems = [];
let selectedDocTypes = new Set();

let googleAccessToken = null;
let googleTokenExpiresAt = 0;
let gisTokenClient = null;

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { console.error(e); }
  return {
    supplier: Object.assign({}, SUPPLIER_DEFAULT),
    customers: CUSTOMERS_SEED.map(c => Object.assign({}, c)),
    transactions: [],
    sends: []
  };
}
function saveData() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(appData)); return true; }
  catch (e) { console.error(e); return false; }
}
function loadSync() {
  try {
    const raw = localStorage.getItem(SYNC_KEY);
    if (raw) return Object.assign({ token: '', gistId: '', autoSync: false }, JSON.parse(raw));
  } catch (e) {}
  return { token: '', gistId: '', autoSync: false };
}
function saveSync() { localStorage.setItem(SYNC_KEY, JSON.stringify(syncConfig)); }
function loadGoogleConfig() {
  try {
    const raw = localStorage.getItem(GOOGLE_KEY);
    if (raw) return Object.assign({ clientId: '' }, JSON.parse(raw));
  } catch (e) {}
  return { clientId: '' };
}
function saveGoogleConfigToStorage() { localStorage.setItem(GOOGLE_KEY, JSON.stringify(googleConfig)); }

/* ============================================================
   내비게이션
   ============================================================ */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

function goToCustomerList() { showScreen('screen-customers'); renderCustomerList(); }
function goToHistory() { showScreen('screen-history'); renderHistory(); }

/* ============================================================
   메인 화면 (업체 선택)
   ============================================================ */
function customerSummaryLine(c) {
  const parts = [];
  if (c.bizNo) parts.push(c.bizNo);
  if (c.managerName) parts.push('담당 ' + c.managerName + (c.managerPhone ? ' · ' + c.managerPhone : ''));
  if (!c.managerEmail) parts.push('⚠️ 이메일 미등록');
  return parts.join(' · ') || '정보를 등록해주세요';
}

function renderMainList() {
  const q = (document.getElementById('main-search').value || '').trim().toLowerCase();
  const list = document.getElementById('main-customer-list');
  const empty = document.getElementById('main-empty');
  const customers = appData.customers.filter(c => !q || c.name.toLowerCase().includes(q));
  if (appData.customers.length === 0) {
    empty.style.display = '';
    list.innerHTML = '';
    updateSyncBars();
    return;
  }
  empty.style.display = 'none';
  list.innerHTML = customers.map(c => `
    <div class="customer-card" onclick="openDocScreen('${c.id}')">
      <div class="customer-card-name">${escapeHtml(c.name)}</div>
      <div class="customer-card-info">${escapeHtml(customerSummaryLine(c))}</div>
    </div>
  `).join('');
  updateSyncBars();
}

/* ============================================================
   주소록
   ============================================================ */
function getCustomerById(id) { return appData.customers.find(c => c.id === id) || null; }

function renderCustomerList() {
  const body = document.getElementById('customer-list-body');
  if (appData.customers.length === 0) {
    body.innerHTML = `<div class="empty"><div class="empty-icon">📇</div><div class="empty-text">등록된 거래처가 없어요</div></div>`;
    return;
  }
  body.innerHTML = appData.customers.map(c => `
    <div class="customer-card" style="cursor:default">
      <div class="customer-card-name">${escapeHtml(c.name)}</div>
      <div class="customer-card-info">${escapeHtml(customerSummaryLine(c))}</div>
      <div class="customer-card-actions">
        <button class="btn-sm btn-edit" onclick="goToCustomerEdit('${c.id}')">수정</button>
        <button class="btn-sm btn-calc" onclick="openDocScreen('${c.id}')">문서 작성</button>
      </div>
    </div>
  `).join('');
}

let editingCustomerId = null;
function goToCustomerEdit(id) {
  editingCustomerId = id;
  const c = id ? getCustomerById(id) : null;
  document.getElementById('customer-edit-title').textContent = c ? '거래처 수정' : '거래처 등록';
  document.getElementById('ce-name').value = c ? c.name : '';
  document.getElementById('ce-bizno').value = c ? c.bizNo : '';
  document.getElementById('ce-ceo').value = c ? c.ceo : '';
  document.getElementById('ce-address').value = c ? c.address : '';
  document.getElementById('ce-manager-name').value = c ? c.managerName : '';
  document.getElementById('ce-manager-phone').value = c ? c.managerPhone : '';
  document.getElementById('ce-manager-email').value = c ? c.managerEmail : '';
  document.getElementById('ce-honorific').value = c ? c.honorific : '';
  document.getElementById('ce-drive-folder').value = c ? (c.driveFolderId || '') : '';
  document.getElementById('ce-delete-wrap').style.display = c ? '' : 'none';
  showScreen('screen-customer-edit');
}

function saveCustomer() {
  const name = document.getElementById('ce-name').value.trim();
  if (!name) { alert('상호명을 입력해주세요'); return; }
  const data = {
    name,
    bizNo: document.getElementById('ce-bizno').value.trim(),
    ceo: document.getElementById('ce-ceo').value.trim(),
    address: document.getElementById('ce-address').value.trim(),
    managerName: document.getElementById('ce-manager-name').value.trim(),
    managerPhone: document.getElementById('ce-manager-phone').value.trim(),
    managerEmail: document.getElementById('ce-manager-email').value.trim(),
    honorific: document.getElementById('ce-honorific').value.trim(),
    driveFolderId: document.getElementById('ce-drive-folder').value.trim()
  };
  if (editingCustomerId) {
    const c = getCustomerById(editingCustomerId);
    Object.assign(c, data);
  } else {
    data.id = 'c_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    appData.customers.push(data);
  }
  saveData();
  maybeAutoSync();
  showScreen('screen-customers');
  renderCustomerList();
}

function deleteCustomer() {
  if (!editingCustomerId) return;
  if (!confirm('이 거래처를 삭제할까요? 거래이력/발송이력은 남아있어요.')) return;
  appData.customers = appData.customers.filter(c => c.id !== editingCustomerId);
  saveData();
  maybeAutoSync();
  showScreen('screen-customers');
  renderCustomerList();
}

/* ============================================================
   문서 작성 화면
   ============================================================ */
function openDocScreen(customerId) {
  currentCustomerId = customerId;
  const c = getCustomerById(customerId);
  if (!c) return;
  document.getElementById('doc-customer-name').textContent = c.name;
  document.getElementById('doc-customer-summary').innerHTML = `
    <div class="card-title">거래처 정보</div>
    <div class="info-text" style="color:var(--text);font-weight:600;line-height:1.9">
      사업자번호: ${escapeHtml(c.bizNo || '-')}<br>
      대표자: ${escapeHtml(c.ceo || '-')}<br>
      주소: ${escapeHtml(c.address || '-')}<br>
      담당자: ${escapeHtml(c.managerName || '-')} ${escapeHtml(c.managerPhone || '')}<br>
      이메일: ${c.managerEmail ? escapeHtml(c.managerEmail) : '<span style="color:var(--danger)">⚠️ 미등록 — 발송 전 주소록에서 입력해주세요</span>'}
    </div>`;
  selectedDocTypes = new Set(['invoice']);
  renderDocTypeChips();
  currentItems = [];
  loadLastItems(true);
  document.getElementById('doc-unpaid').value = '';
  document.getElementById('doc-status-area').innerHTML = '';
  showScreen('screen-doc');
}

function renderDocTypeChips() {
  ['invoice', 'confirm', 'quote'].forEach(dt => {
    const el = document.getElementById('chip-' + dt);
    el.classList.toggle('active', selectedDocTypes.has(dt));
  });
}
function toggleDocType(dt) {
  if (selectedDocTypes.has(dt)) selectedDocTypes.delete(dt); else selectedDocTypes.add(dt);
  renderDocTypeChips();
}

function blankItem() { return { name: '', spec: '', qty: '', price: '' }; }

function addItemRow() {
  currentItems.push(blankItem());
  renderItemList();
}
function removeItemRow(idx) {
  currentItems.splice(idx, 1);
  renderItemList();
}
function moveItemRow(idx, dir) {
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= currentItems.length) return;
  const tmp = currentItems[idx];
  currentItems[idx] = currentItems[newIdx];
  currentItems[newIdx] = tmp;
  renderItemList();
}
function updateItemField(idx, field, value) {
  currentItems[idx][field] = value;
  updateTotalsDisplay();
}

function loadLastItems(silent) {
  const list = appData.transactions.filter(t => t.customerId === currentCustomerId);
  if (list.length === 0) {
    currentItems = currentItems.length ? currentItems : [blankItem()];
    renderItemList();
    if (!silent) showDocStatus('warn', '이 거래처의 이전 거래이력이 없어요.');
    return;
  }
  const last = list[0];
  currentItems = last.items.map(it => Object.assign({}, it));
  if (currentItems.length === 0) currentItems.push(blankItem());
  renderItemList();
  if (!silent) showDocStatus('info', `${formatDateISO(new Date(last.date))} 거래 품목을 불러왔어요.`);
}

function calcRow(it) {
  const qty = Number(it.qty) || 0, price = Number(it.price) || 0;
  const supply = qty * price;
  const vat = Math.round(supply * 0.1);
  return { qty, price, supply, vat };
}

function renderItemList() {
  const wrap = document.getElementById('item-list');
  wrap.innerHTML = currentItems.map((it, idx) => {
    const r = calcRow(it);
    return `
    <div class="item-row">
      <div class="item-row-top">
        <span class="item-badge">${idx + 1}</span>
        <div class="item-actions">
          <button class="icon-sm" onclick="moveItemRow(${idx},-1)">↑</button>
          <button class="icon-sm" onclick="moveItemRow(${idx},1)">↓</button>
          <button class="icon-sm danger" onclick="removeItemRow(${idx})">✕</button>
        </div>
      </div>
      <div class="item-grid">
        <input placeholder="품명" value="${escapeAttr(it.name)}" oninput="updateItemField(${idx},'name',this.value)">
        <input placeholder="규격" value="${escapeAttr(it.spec)}" oninput="updateItemField(${idx},'spec',this.value)">
        <input placeholder="수량" inputmode="decimal" value="${escapeAttr(it.qty)}" oninput="updateItemField(${idx},'qty',this.value)">
        <input placeholder="단가" inputmode="decimal" value="${escapeAttr(it.price)}" oninput="updateItemField(${idx},'price',this.value)">
      </div>
      <div class="item-amount">공급가액 ${fmtNum(r.supply)}원 · 부가세 ${fmtNum(r.vat)}원</div>
    </div>`;
  }).join('');
  updateTotalsDisplay();
}

function updateTotalsDisplay() {
  let supplySum = 0, vatSum = 0;
  currentItems.forEach(it => { const r = calcRow(it); supplySum += r.supply; vatSum += r.vat; });
  document.getElementById('doc-total-display').textContent =
    `공급가액 ${fmtNum(supplySum)}원 + 부가세 ${fmtNum(vatSum)}원 = 합계 ${fmtNum(supplySum + vatSum)}원`;
}

function showDocStatus(kind, msg) {
  document.getElementById('doc-status-area').innerHTML = `<div class="status-box ${kind}">${escapeHtml(msg)}</div>`;
}

/* ============================================================
   PDF 렌더링 (HTML → canvas → jsPDF)
   ============================================================ */
function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
function escapeAttr(s) { return escapeHtml(s); }
function fmtNum(n) { return Math.round(n || 0).toLocaleString('ko-KR'); }
function formatDateISO(d) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function formatDateCompact(d) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}
function formatDateKorean(d) { return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`; }

function buildDocNode(docType, customer, items, unpaid, now) {
  const supplier = appData.supplier;
  const titleMap = { invoice: '거 래 명 세 서', confirm: '납&nbsp;&nbsp;품&nbsp;&nbsp;확&nbsp;&nbsp;인&nbsp;&nbsp;서', quote: '견 적 서' };

  let supplySum = 0, vatSum = 0;
  const rowsHtml = items.map((it, idx) => {
    const r = calcRow(it);
    supplySum += r.supply; vatSum += r.vat;
    return `<tr>
      <td>${idx + 1}</td>
      <td class="tname">${escapeHtml(it.name)}</td>
      <td>${escapeHtml(it.spec)}</td>
      <td>${r.qty ? fmtNum(r.qty) : ''}</td>
      <td class="num">${r.price ? fmtNum(r.price) : ''}</td>
      <td class="num">${r.supply ? fmtNum(r.supply) : ''}</td>
      <td class="num">${r.vat ? fmtNum(r.vat) : ''}</td>
    </tr>`;
  }).join('');
  const total = supplySum + vatSum;

  const stampImg = `<img class="doc-stamp" src="${STAMP_DATA_URL}" style="left:258px;top:38px">`;

  const rightBox = `
    <div class="doc-rightbox">
      <div style="text-align:center;font-weight:800;font-size:13px;padding:6px 0;border-bottom:1px solid #333;background:#F2F0EC">공 급 자</div>
      <div class="doc-row"><div class="doc-cell-label">사업자번호</div><div class="doc-cell-val">${escapeHtml(supplier.bizNo)}</div></div>
      <div class="doc-row">
        <div class="doc-cell-label">업체명</div><div class="doc-cell-val">${escapeHtml(supplier.name)}</div>
        <div class="doc-cell-label" style="width:56px">대 표</div><div class="doc-cell-val">${escapeHtml(supplier.ceo)}</div>
      </div>
      <div class="doc-row"><div class="doc-cell-label">주소</div><div class="doc-cell-val small">${escapeHtml(supplier.address)}</div></div>
      <div class="doc-row">
        <div class="doc-cell-label">업태</div><div class="doc-cell-val small">${escapeHtml(supplier.bizType)}</div>
        <div class="doc-cell-label" style="width:56px">종 목</div><div class="doc-cell-val small">${escapeHtml(supplier.bizItem)}</div>
      </div>
      <div class="doc-row">
        <div class="doc-cell-label">전화</div><div class="doc-cell-val">${escapeHtml(supplier.phone)}</div>
        <div class="doc-cell-label" style="width:56px">팩 스</div><div class="doc-cell-val">${escapeHtml(supplier.fax)}</div>
      </div>
      ${stampImg}
    </div>`;

  let leftRows;
  if (docType === 'confirm') {
    leftRows = `
      <div class="doc-row"><div class="doc-cell-label">거래처명</div><div class="doc-cell-val">${escapeHtml(customer.name)} 귀하</div></div>
      <div class="doc-row"><div class="doc-cell-label">사업자번호</div><div class="doc-cell-val">${escapeHtml(customer.bizNo)}</div></div>
      <div class="doc-row"><div class="doc-cell-label">주소</div><div class="doc-cell-val small">${escapeHtml(customer.address)}</div></div>
      <div class="doc-row"><div class="doc-cell-label">대표자</div><div class="doc-cell-val">${escapeHtml(customer.ceo)}</div></div>
      <div class="doc-row"><div class="doc-cell-label">담당자</div><div class="doc-cell-val">${escapeHtml(customer.managerName)}${customer.managerPhone ? ' / ' + escapeHtml(customer.managerPhone) : ''}</div></div>
    `;
  } else {
    leftRows = `
      <div class="doc-row"><div class="doc-cell-label">발행일자</div><div class="doc-cell-val">${formatDateISO(now)}</div></div>
      <div class="doc-row"><div class="doc-cell-label">거래처명</div><div class="doc-cell-val">${escapeHtml(customer.name)} 귀하</div></div>
      <div class="doc-row"><div class="doc-cell-label">합계금액</div><div class="doc-cell-val" style="font-weight:800">${fmtNum(total)} 원</div></div>
    `;
  }

  const tableHtml = `
    <table class="doc-table">
      <thead><tr><th style="width:32px">No</th><th>품명</th><th style="width:90px">규격</th><th style="width:56px">수량</th><th style="width:76px">단가</th><th style="width:90px">공급가액</th><th style="width:76px">비고(VAT)</th></tr></thead>
      <tbody>${rowsHtml}
        <tr class="doc-total-row"><td colspan="2">합&nbsp;&nbsp;계</td><td colspan="3"></td><td class="num">${fmtNum(supplySum)}</td><td class="num">${fmtNum(vatSum)}</td></tr>
      </tbody>
    </table>`;

  const bank = escapeHtml(supplier.bank);
  let footerHtml = '';
  if (docType === 'invoice') {
    footerHtml = `<div class="doc-footer"><b>* 기타사항</b><br>1. 입금계좌: ${bank}<br>2. 미수금: ${escapeHtml(unpaid || '')}</div>`;
  } else if (docType === 'quote') {
    footerHtml = `<div class="doc-footer"><b>* 기타사항</b><br>1. 입금계좌: ${bank}<br>2. 완료일자 : 착수후 40일<br>3. 현금영수증 발행 견적</div>`;
  } else if (docType === 'confirm') {
    footerHtml = `<div class="doc-footer" style="text-align:center;margin-top:20px">상기 물품을 납품 하였기에 납품확인서를 제출합니다.<br><br>${formatDateKorean(now)}</div>
      <div class="doc-sign-row">인수자 : ${escapeHtml(customer.name)} &nbsp;&nbsp;(인)</div>
      <div class="doc-footer" style="margin-top:24px"><b>* 기타사항</b><br>입금계좌: ${bank}</div>`;
  }

  const wrap = document.createElement('div');
  wrap.className = 'doc-page';
  wrap.innerHTML = `<div class="doc-title">${titleMap[docType]}</div><div class="doc-toprow"><div class="doc-leftbox">${leftRows}</div>${rightBox}</div>${tableHtml}${footerHtml}`;
  return wrap;
}

async function renderDocToPdfBlob(docType, customer, items, unpaid, now) {
  const root = document.getElementById('doc-render-root');
  root.innerHTML = '';
  const node = buildDocNode(docType, customer, items, unpaid, now);
  root.appendChild(node);
  if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) {} }
  const imgs = Array.from(node.querySelectorAll('img'));
  await Promise.all(imgs.map(img => img.complete && img.naturalWidth ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res; })));
  await new Promise(r => setTimeout(r, 60));
  const canvas = await html2canvas(node, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  root.innerHTML = '';
  const imgData = canvas.toDataURL('image/png');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const pageWidth = 210, pageHeight = 297;
  const imgHeightMM = canvas.height * pageWidth / canvas.width;
  if (imgHeightMM <= pageHeight) {
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeightMM, undefined, 'FAST');
  } else {
    const scaleFactor = pageHeight / imgHeightMM;
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth * scaleFactor, pageHeight, undefined, 'FAST');
  }
  return pdf.output('blob');
}

/* ============================================================
   Google 로그인 (GIS)
   ============================================================ */
async function waitForGIS() {
  let tries = 0;
  while (!(window.google && window.google.accounts && window.google.accounts.oauth2)) {
    await new Promise(r => setTimeout(r, 150));
    tries++;
    if (tries > 100) throw new Error('구글 로그인 스크립트를 불러오지 못했어요. 인터넷 연결을 확인해주세요.');
  }
}
function initTokenClientIfNeeded() {
  if (gisTokenClient) return;
  if (!googleConfig.clientId) throw new Error('설정에서 구글 OAuth 클라이언트 ID를 먼저 입력해주세요.');
  gisTokenClient = google.accounts.oauth2.initTokenClient({
    client_id: googleConfig.clientId,
    scope: GOOGLE_SCOPES,
    callback: () => {}
  });
}
function requestGoogleToken(promptMode) {
  return new Promise((resolve, reject) => {
    waitForGIS().then(() => {
      try { initTokenClientIfNeeded(); } catch (e) { reject(e); return; }
      gisTokenClient.callback = (resp) => {
        if (resp.error) { reject(new Error('구글 로그인 실패: ' + resp.error)); return; }
        googleAccessToken = resp.access_token;
        googleTokenExpiresAt = Date.now() + (Number(resp.expires_in) || 3300) * 1000;
        renderGoogleAuthStatus();
        resolve(googleAccessToken);
      };
      gisTokenClient.requestAccessToken({ prompt: promptMode });
    }).catch(reject);
  });
}
async function ensureValidToken() {
  if (googleAccessToken && Date.now() < googleTokenExpiresAt - 60000) return googleAccessToken;
  return requestGoogleToken(googleAccessToken ? '' : 'consent');
}
async function startGoogleLogin() {
  try {
    saveGoogleClientId(true);
    await requestGoogleToken('consent');
    alert('구글 로그인 완료! 이제 문서를 발송할 수 있어요.');
  } catch (e) {
    alert(e && e.message ? e.message : String(e));
  }
}
function renderGoogleAuthStatus() {
  const el = document.getElementById('google-auth-status');
  if (!el) return;
  if (googleAccessToken && Date.now() < googleTokenExpiresAt) {
    const min = Math.max(0, Math.round((googleTokenExpiresAt - Date.now()) / 60000));
    el.textContent = `✅ 로그인됨 (약 ${min}분 후 재로그인 필요)`;
  } else {
    el.textContent = '⏳ 로그인이 필요해요';
  }
}
function saveGoogleClientId(silent) {
  const v = document.getElementById('google-client-id').value.trim();
  googleConfig.clientId = v;
  saveGoogleConfigToStorage();
  gisTokenClient = null;
  if (!silent) alert('저장되었어요');
}

/* ============================================================
   Google API 호출 헬퍼
   ============================================================ */
async function apiFetch(url, opts) {
  const res = await fetch(url, opts);
  let json = null;
  try { json = await res.json(); } catch (e) {}
  if (!res.ok) {
    const err = new Error((json && json.error && json.error.message) || ('요청 실패 (' + res.status + ')'));
    err.status = res.status;
    throw err;
  }
  return json;
}

async function ensureCustomerFolder(customer, token) {
  if (customer.driveFolderId) return customer.driveFolderId;
  if (!appData.supplier.rootFolderId) throw new Error('설정에서 구글드라이브 상위 폴더 ID를 입력해주세요.');
  const json = await apiFetch('https://www.googleapis.com/drive/v3/files?fields=id', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: customer.name, mimeType: 'application/vnd.google-apps.folder', parents: [appData.supplier.rootFolderId] })
  });
  customer.driveFolderId = json.id;
  saveData();
  return json.id;
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function uploadFileToDrive(folderId, filename, blob, token) {
  const base64Data = await blobToBase64(blob);
  const boundary = '-------hnf' + Date.now();
  const delimiter = '\r\n--' + boundary + '\r\n';
  const closeDelim = '\r\n--' + boundary + '--';
  const metadata = { name: filename, parents: [folderId], mimeType: 'application/pdf' };
  const body =
    delimiter + 'Content-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(metadata) +
    delimiter + 'Content-Type: application/pdf\r\nContent-Transfer-Encoding: base64\r\n\r\n' + base64Data +
    closeDelim;
  return apiFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'multipart/related; boundary="' + boundary + '"' },
    body
  });
}

function base64UrlEncode(str) {
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function mimeEncodeSubject(subject) {
  return '=?UTF-8?B?' + btoa(unescape(encodeURIComponent(subject))) + '?=';
}
function buildMimeMessage(to, subject, bodyText, attachments) {
  const boundary = 'hnf_boundary_' + Date.now();
  let msg = '';
  msg += 'To: ' + to + '\r\n';
  msg += 'Subject: ' + mimeEncodeSubject(subject) + '\r\n';
  msg += 'MIME-Version: 1.0\r\n';
  msg += 'Content-Type: multipart/mixed; boundary="' + boundary + '"\r\n\r\n';
  msg += '--' + boundary + '\r\n';
  msg += 'Content-Type: text/plain; charset="UTF-8"\r\n\r\n';
  msg += bodyText + '\r\n\r\n';
  attachments.forEach(att => {
    msg += '--' + boundary + '\r\n';
    msg += 'Content-Type: application/pdf; name="' + att.filename + '"\r\n';
    msg += 'Content-Disposition: attachment; filename="' + att.filename + '"\r\n';
    msg += 'Content-Transfer-Encoding: base64\r\n\r\n';
    msg += att.base64 + '\r\n\r\n';
  });
  msg += '--' + boundary + '--';
  return msg;
}
async function sendGmail(to, subject, bodyText, attachments, token) {
  const raw = buildMimeMessage(to, subject, bodyText, attachments);
  return apiFetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: base64UrlEncode(raw) })
  });
}

/* ============================================================
   생성 및 발송
   ============================================================ */
async function generateAndSend(isRetry) {
  const customer = getCustomerById(currentCustomerId);
  if (!customer) return;
  if (selectedDocTypes.size === 0) { showDocStatus('warn', '문서 종류를 1개 이상 선택해주세요.'); return; }
  const items = currentItems.filter(it => it.name && it.name.trim());
  if (items.length === 0) { showDocStatus('warn', '품목을 1개 이상 입력해주세요.'); return; }
  if (!customer.managerEmail) { showDocStatus('warn', '이 거래처는 담당자 이메일이 없어요. 주소록에서 먼저 입력해주세요.'); return; }
  if (!googleConfig.clientId) { showDocStatus('warn', '설정에서 구글 OAuth 클라이언트 ID를 먼저 등록해주세요.'); return; }

  const sendBtn = document.getElementById('doc-send-btn');
  sendBtn.disabled = true;
  try {
    showDocStatus('info', '구글 로그인 확인 중...');
    const token = await ensureValidToken();

    showDocStatus('info', 'PDF 생성 중...');
    const now = new Date();
    const fileDate = formatDateCompact(now);
    const unpaid = document.getElementById('doc-unpaid').value.trim();

    const docs = [];
    for (const dt of Array.from(selectedDocTypes)) {
      const blob = await renderDocToPdfBlob(dt, customer, items, unpaid, now);
      const filename = `${fileDate}_${customer.name}_${DOC_LABELS[dt]}.pdf`;
      docs.push({ docType: dt, blob, filename });
    }

    showDocStatus('info', '구글드라이브에 백업 중...');
    const folderId = await ensureCustomerFolder(customer, token);
    for (const d of docs) {
      const up = await uploadFileToDrive(folderId, d.filename, d.blob, token);
      d.driveLink = up.webViewLink;
      d.driveFileId = up.id;
    }

    showDocStatus('info', '이메일 발송 중...');
    const greeting = customer.honorific ? customer.honorific : (customer.name + ' 담당자');
    const subject = docs.map(d => d.filename.replace(/\.pdf$/, '')).join(', ');
    const bodyText = `안녕하세요 ${greeting}님,\n\n${docs.map(d => DOC_LABELS[d.docType]).join(', ')} 첨부해드립니다.\n감사합니다.\n\n혀니네홈패션 드림`;
    const attachments = [];
    for (const d of docs) attachments.push({ filename: d.filename, base64: await blobToBase64(d.blob) });
    await sendGmail(customer.managerEmail, subject, bodyText, attachments, token);

    const nowIso = now.toISOString();
    docs.forEach(d => {
      appData.sends.unshift({
        id: 's_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        customerId: customer.id,
        date: nowIso,
        docType: d.docType,
        fileName: d.filename,
        driveLink: d.driveLink,
        sender: 'suhyunfabric'
      });
    });
    appData.transactions.unshift({
      id: 't_' + Date.now(),
      customerId: customer.id,
      date: nowIso,
      items: items.map(it => ({ name: it.name, spec: it.spec, qty: it.qty, price: it.price })),
      docTypes: Array.from(selectedDocTypes)
    });
    saveData();
    maybeAutoSync();

    showDocStatus('success', `✅ 발송 완료! ${docs.map(d => DOC_LABELS[d.docType]).join(', ')} 전송됨`);
  } catch (err) {
    console.error(err);
    if (err && err.status === 401 && !isRetry) {
      googleAccessToken = null;
      showDocStatus('warn', '로그인이 만료되어 다시 로그인합니다...');
      sendBtn.disabled = false;
      return generateAndSend(true);
    }
    showDocStatus('danger', '오류: ' + (err && err.message ? err.message : String(err)));
  } finally {
    sendBtn.disabled = false;
  }
}

/* ============================================================
   발송이력
   ============================================================ */
function renderHistory() {
  const q = (document.getElementById('history-search').value || '').trim().toLowerCase();
  const list = document.getElementById('history-list');
  const empty = document.getElementById('history-empty');
  let sends = appData.sends.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  if (q) {
    sends = sends.filter(s => {
      const c = getCustomerById(s.customerId);
      const name = c ? c.name.toLowerCase() : '';
      const dateCompact = formatDateCompact(new Date(s.date));
      return name.includes(q) || dateCompact.includes(q);
    });
  }
  if (sends.length === 0) {
    empty.style.display = '';
    list.innerHTML = '';
    return;
  }
  empty.style.display = 'none';
  list.innerHTML = sends.map(s => {
    const c = getCustomerById(s.customerId);
    const d = new Date(s.date);
    return `
    <div class="history-item" onclick="openHistoryLink('${s.driveLink || ''}')">
      <div class="history-date">${formatDateISO(d)}</div>
      <div class="history-main">
        <div class="history-doctype">${escapeHtml(c ? c.name : '(삭제된 거래처)')} · ${DOC_LABELS[s.docType] || s.docType}</div>
        <div class="history-filename">${escapeHtml(s.fileName)}</div>
      </div>
      <div>${s.driveLink ? '📄' : ''}</div>
    </div>`;
  }).join('');
}
function openHistoryLink(link) {
  if (link) window.open(link, '_blank');
}

/* ============================================================
   설정 화면
   ============================================================ */
function renderSettings() {
  document.getElementById('google-client-id').value = googleConfig.clientId || '';
  renderGoogleAuthStatus();

  const s = appData.supplier;
  document.getElementById('sup-name').value = s.name || '';
  document.getElementById('sup-bizno').value = s.bizNo || '';
  document.getElementById('sup-ceo').value = s.ceo || '';
  document.getElementById('sup-address').value = s.address || '';
  document.getElementById('sup-biztype').value = s.bizType || '';
  document.getElementById('sup-bizitem').value = s.bizItem || '';
  document.getElementById('sup-phone').value = s.phone || '';
  document.getElementById('sup-fax').value = s.fax || '';
  document.getElementById('sup-bank').value = s.bank || '';
  document.getElementById('sup-root-folder').value = s.rootFolderId || '';

  document.getElementById('github-token').value = syncConfig.token || '';
  const actionCard = document.getElementById('sync-action-card');
  if (syncConfig.token) {
    actionCard.style.display = '';
    document.getElementById('sync-gist-info').textContent = syncConfig.gistId
      ? '✅ Gist 연결됨: ' + syncConfig.gistId.slice(0, 8) + '...'
      : '⏳ 아직 Gist 없음 — 업로드하면 생성됩니다';
    document.getElementById('auto-sync-toggle').classList.toggle('on', !!syncConfig.autoSync);
  } else {
    actionCard.style.display = 'none';
  }
  updateSyncBars();
}

function saveSupplierInfo() {
  appData.supplier.name = document.getElementById('sup-name').value.trim();
  appData.supplier.bizNo = document.getElementById('sup-bizno').value.trim();
  appData.supplier.ceo = document.getElementById('sup-ceo').value.trim();
  appData.supplier.address = document.getElementById('sup-address').value.trim();
  appData.supplier.bizType = document.getElementById('sup-biztype').value.trim();
  appData.supplier.bizItem = document.getElementById('sup-bizitem').value.trim();
  appData.supplier.phone = document.getElementById('sup-phone').value.trim();
  appData.supplier.fax = document.getElementById('sup-fax').value.trim();
  appData.supplier.bank = document.getElementById('sup-bank').value.trim();
  appData.supplier.rootFolderId = document.getElementById('sup-root-folder').value.trim();
  saveData();
  maybeAutoSync();
  alert('저장되었어요');
}

function showGoogleSetupGuide() {
  alert(
    '구글 클라우드 OAuth 클라이언트 발급 방법 (suhyunfabric@gmail.com으로 로그인 후 진행)\n\n' +
    '1. console.cloud.google.com 접속 후 suhyunfabric@gmail.com으로 로그인\n' +
    '2. 상단 "프로젝트 선택" → "새 프로젝트" → 이름 입력(예: hnf-docs) → 만들기\n' +
    '3. 좌측 메뉴 "API 및 서비스" → "라이브러리"에서 다음 2개를 각각 검색해 "사용 설정":\n' +
    '   - Gmail API\n   - Google Drive API\n' +
    '4. "API 및 서비스" → "OAuth 동의화면"\n' +
    '   - User Type: 외부 선택 → 만들기\n' +
    '   - 앱 이름/지원 이메일 등 입력 (테스트 단계로 충분, 게시 필요 없음)\n' +
    '   - 범위(Scopes) 단계에서 추가 안 해도 됨(넘어가도 OK)\n' +
    '   - 테스트 사용자에 suhyunfabric@gmail.com 추가\n' +
    '5. "API 및 서비스" → "사용자 인증 정보" → "+사용자 인증 정보 만들기" → "OAuth 클라이언트 ID"\n' +
    '   - 애플리케이션 유형: 웹 애플리케이션\n' +
    '   - 승인된 자바스크립트 원본에 이 앱 주소 추가\n' +
    '     예) https://psw9715-debug.github.io\n' +
    '   - 만들기 → 발급된 "클라이언트 ID" 복사\n' +
    '6. 이 화면의 "Google OAuth 클라이언트 ID"란에 붙여넣고 저장\n\n' +
    '⚠️ 테스트 모드 앱은 suhyunfabric@gmail.com처럼 테스트 사용자로 등록된 계정만 로그인할 수 있어요.\n' +
    '⚠️ 이 앱은 기존 폴더에 파일을 쓰기 위해 전체 Drive 권한(전체 파일 접근)을 요청합니다 — 테스트 모드에서는 "확인되지 않은 앱" 경고가 뜰 수 있어요. "고급"→"이동(안전하지 않음)"을 눌러 진행하면 됩니다 (본인 계정만 사용하는 테스트 앱이라 안전합니다).'
  );
}

/* ============================================================
   GitHub Gist 동기화
   ============================================================ */
function updateSyncBars() {
  const bar = document.getElementById('sync-status');
  if (!bar) return;
  const icon = document.getElementById('sync-icon');
  const text = document.getElementById('sync-text');
  if (!syncConfig.token) {
    bar.className = 'sync-bar off';
    icon.textContent = '☁️';
    text.textContent = '동기화 설정하기 (여러 기기 공유)';
  } else if (!syncConfig.gistId) {
    bar.className = 'sync-bar warn';
    icon.textContent = '⚠️';
    text.textContent = '동기화 연결됨 — 아직 업로드 안 됨';
  } else {
    bar.className = 'sync-bar';
    icon.textContent = '✅';
    text.textContent = syncConfig.autoSync ? '자동 동기화 켜짐' : '동기화 연결됨 (탭해서 관리)';
  }
}

function showTokenGuide() {
  alert('토큰 발급 방법:\n\n1. github.com 로그인\n2. 우측 상단 프로필 → Settings\n3. 하단 Developer settings\n4. Personal access tokens → Tokens (classic)\n5. Generate new token (classic)\n6. Note: hnf-docs\n7. Expiration: No expiration\n8. ✅ gist 만 체크\n9. Generate token → 복사\n\n⚠️ 토큰은 한 번만 보이니 바로 붙여넣기 하세요!');
}

async function verifyToken() {
  const token = document.getElementById('github-token').value.trim();
  if (!token) { alert('토큰을 입력해주세요'); return; }
  const resultEl = document.getElementById('sync-verify-result');
  resultEl.innerHTML = '<div class="info-text">확인 중...</div>';
  try {
    const res = await fetch('https://api.github.com/user', { headers: { Authorization: 'token ' + token } });
    if (!res.ok) throw new Error('토큰이 유효하지 않아요');
    syncConfig.token = token;

    const gistsRes = await fetch('https://api.github.com/gists', { headers: { Authorization: 'token ' + token } });
    const gists = await gistsRes.json();
    const existing = Array.isArray(gists) ? gists.find(g => g.files && g.files[GIST_FILENAME]) : null;
    if (existing) syncConfig.gistId = existing.id;
    saveSync();

    resultEl.innerHTML = '<div class="status-box success">✅ 연결되었어요!</div>';
    renderSettings();
  } catch (e) {
    resultEl.innerHTML = `<div class="status-box danger">${escapeHtml(e.message || String(e))}</div>`;
  }
}

async function syncPush() {
  if (!syncConfig.token) { alert('토큰을 먼저 설정해주세요'); return; }
  try {
    const url = syncConfig.gistId ? 'https://api.github.com/gists/' + syncConfig.gistId : 'https://api.github.com/gists';
    const method = syncConfig.gistId ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { Authorization: 'token ' + syncConfig.token, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: '혀니네홈패션 거래문서 데이터',
        public: false,
        files: { [GIST_FILENAME]: { content: JSON.stringify(appData, null, 2) } }
      })
    });
    const gist = await res.json();
    if (gist.id) {
      syncConfig.gistId = gist.id;
      saveSync();
      renderSettings();
      alert('업로드 완료!');
    } else {
      alert('업로드 실패: ' + (gist.message || '알 수 없는 오류'));
    }
  } catch (e) { alert('업로드 실패: ' + (e.message || e)); }
}

async function syncPull() {
  if (!syncConfig.token || !syncConfig.gistId) { alert('토큰과 Gist가 설정되지 않았어요'); return; }
  if (!confirm('이 기기의 데이터를 서버 데이터로 덮어씁니다. 계속할까요?')) return;
  try {
    const res = await fetch('https://api.github.com/gists/' + syncConfig.gistId, { headers: { Authorization: 'token ' + syncConfig.token } });
    const gist = await res.json();
    const fileContent = gist.files && gist.files[GIST_FILENAME] ? gist.files[GIST_FILENAME].content : null;
    if (fileContent) {
      appData = JSON.parse(fileContent);
      saveData();
      alert('받아왔어요!');
      renderMainList();
      renderSettings();
    } else {
      alert('Gist에서 파일을 찾을 수 없어요');
    }
  } catch (e) { alert('받아오기 실패: ' + (e.message || e)); }
}

function toggleAutoSync() {
  syncConfig.autoSync = !syncConfig.autoSync;
  saveSync();
  document.getElementById('auto-sync-toggle').classList.toggle('on', syncConfig.autoSync);
  updateSyncBars();
}
function maybeAutoSync() {
  if (syncConfig.autoSync && syncConfig.token && syncConfig.gistId) syncPush();
}

/* ============================================================
   백업 / 복원
   ============================================================ */
function backupFile() {
  const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hnf_docs_backup_' + formatDateCompact(new Date()) + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function restoreFile(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data.customers || !data.supplier) throw new Error('올바른 백업 파일이 아니에요');
      appData = data;
      saveData();
      alert('복원되었어요!');
      renderMainList();
      renderSettings();
    } catch (e) { alert('복원 실패: ' + (e.message || e)); }
  };
  reader.readAsText(file);
  input.value = '';
}

/* ============================================================
   초기화
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
  appData = loadData();
  syncConfig = loadSync();
  googleConfig = loadGoogleConfig();
  saveData();
  renderMainList();
});
