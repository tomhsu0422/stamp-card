const API = '/.netlify/functions/stamps';
const peopleOrder = ['huiping', 'yujie'];
const themeIcon = { huiping: '🩷', yujie: '💙' };
let state = null;
let lastVersion = 0;
let busy = false;

const cards = document.getElementById('cards');
const statusEl = document.getElementById('status');
const toastEl = document.getElementById('toast');

function showToast(text) {
  toastEl.textContent = text;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 1500);
}

function setStatus(text, type = '') {
  statusEl.textContent = text;
  statusEl.className = `status ${type}`.trim();
}

function cardInfo(total) {
  return {
    page: Math.floor(total / 10) + 1,
    current: total % 10,
    slot: (total % 10) + 1
  };
}

function render() {
  if (!state) return;
  cards.innerHTML = '';

  for (const id of peopleOrder) {
    const person = state.people[id];
    const total = person.total || 0;
    const info = cardInfo(total);

    document.getElementById(`${id}Total`).textContent = total;

    const card = document.createElement('article');
    card.className = `personCard ${id}`;
    card.innerHTML = `
      <div class="cardTop">
        <div>
          <div class="name">${themeIcon[id]} ${person.name}的集章卡</div>
          <div class="meta">第 ${info.page} 張卡・目前第 ${info.current === 0 ? 1 : info.current} 格</div>
        </div>
        <div class="counter"><strong>${total}</strong><span>個章</span></div>
      </div>
      <div class="stamps" data-person="${id}"></div>
    `;

    const grid = card.querySelector('.stamps');
    for (let i = 0; i < 10; i++) {
      const stamp = document.createElement('button');
      stamp.type = 'button';
      stamp.className = 'stamp';
      stamp.setAttribute('aria-label', `${person.name} 第 ${i + 1} 格`);
      if (i < info.current) stamp.classList.add('done');
      stamp.addEventListener('click', () => handleStampClick(id, i, info.current));
      grid.appendChild(stamp);
    }
    cards.appendChild(card);
  }

  renderHistory();
}

function renderHistory() {
  const historyEl = document.getElementById('history');
  const logs = state.history || [];
  if (!logs.length) {
    historyEl.innerHTML = '<div class="log">目前還沒有紀錄</div>';
    return;
  }
  historyEl.innerHTML = logs.slice(0, 30).map(log => {
    const time = new Date(log.at).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const delta = log.delta > 0 ? '+1' : log.delta < 0 ? '-1' : '';
    return `<div class="log"><span><b>${log.name}</b> ${log.note || ''} ${delta}</span><span>${time}</span></div>`;
  }).join('');
}

async function fetchState(silent = false) {
  try {
    if (!silent) setStatus('同步中…');
    const res = await fetch(API, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const next = await res.json();
    state = next;
    lastVersion = next.version || 0;
    render();
    setStatus('已同步', 'ok');
  } catch (error) {
    console.error(error);
    setStatus('同步失敗：請確認 Netlify Function 是否啟用', 'bad');
  }
}

async function send(action, extra = {}) {
  if (busy) return;
  busy = true;
  try {
    setStatus('儲存中…');
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extra })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state = await res.json();
    lastVersion = state.version || 0;
    render();
    setStatus('已同步', 'ok');
  } catch (error) {
    console.error(error);
    setStatus('同步失敗：請確認 Netlify Function 是否啟用', 'bad');
    showToast('同步失敗');
  } finally {
    busy = false;
  }
}

function handleStampClick(personId, index, current) {
  if (index < current) {
    send('decrement', { personId });
  } else if (index === current) {
    send('increment', { personId });
    if (current === 9) showToast('🎉 集滿一張卡！');
  } else {
    showToast('請依序蓋章喔');
  }
}

document.getElementById('undoBtn').addEventListener('click', () => send('undo'));
document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('確定要把蕙萍和宇杰的章數全部清空嗎？')) send('reset');
});

fetchState();
setInterval(async () => {
  if (busy) return;
  try {
    const res = await fetch(API, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const next = await res.json();
    if ((next.version || 0) !== lastVersion) {
      state = next;
      lastVersion = next.version || 0;
      render();
    }
    setStatus('已同步', 'ok');
  } catch (error) {
    setStatus('同步失敗：請確認 Netlify Function 是否啟用', 'bad');
  }
}, 1200);
