/* 「어제 몇 병이나 마신 거야?」 — 앱 로직
   ─────────────────────────────────────────────
   1. 술 종류 · 아이콘        DRINKS, ICONS
   2. 얼굴 표정 기준          faceFor()
   3. 저장 (localStorage)    STORE_KEY, load(), persist()
   4. 달력 그리기            renderCalendar()
   5. 기록 영역              renderRecord(), saveDrinks(), saveSober(), deleteRecord()
   6. 얼굴 컬렉션            renderFaces()
   7. 목표 · 보상            renderGoals(), 목표 설정 창
   8. 얼굴 리액션 애니메이션   playFace()
*/
(() => {
  'use strict';

  /* ===== 1. 술 종류 · 아이콘 ===== */
  // id는 저장 키로 쓰이니 한번 정하면 바꾸지 마세요. name/unit은 자유롭게 바꿔도 됩니다.
  const DRINKS = [
    { id: 'beerGlass',  name: '맥주(잔)', unit: '잔' },
    { id: 'beerBottle', name: '맥주(병)', unit: '병' },
    { id: 'soju',       name: '소주',     unit: '병' },
    { id: 'makgeolli',  name: '막걸리',   unit: '병' },
    { id: 'wine',       name: '와인',     unit: '잔' },
    { id: 'whisky',     name: '위스키',   unit: '잔' },
    { id: 'other',      name: '기타',     unit: '잔' }
  ];

  const LINE = '#5A4030';
  const ICONS = {
    beerGlass: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15.2 10h2a1.9 1.9 0 0 1 1.9 1.9v3.2a1.9 1.9 0 0 1-1.9 1.9h-2" fill="none" stroke="${LINE}" stroke-width="1.5"/>
      <path d="M5 8h10.2v11.6A1.9 1.9 0 0 1 13.3 21.5H6.9A1.9 1.9 0 0 1 5 19.6z" fill="#D9A441" stroke="${LINE}" stroke-width="1.3"/>
      <path d="M4.3 8.6c0-1.9 1.4-3 2.9-3 .6-1.1 1.7-1.7 2.9-1.7 1.5 0 2.7.9 3.1 2.1 1.5 0 2.7 1.1 2.7 2.6z" fill="#FBF3E2" stroke="${LINE}" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M8 12v6M11.5 12v6" stroke="#B9822A" stroke-width="1.1" stroke-linecap="round"/>
    </svg>`,
    beerBottle: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.2 2.5h3.6v4.2c0 1 2.4 2 2.4 4.7v8.6a1.8 1.8 0 0 1-1.8 1.8H9.6a1.8 1.8 0 0 1-1.8-1.8v-8.6c0-2.7 2.4-3.7 2.4-4.7z" fill="#8A5530" stroke="${LINE}" stroke-width="1.3" stroke-linejoin="round"/>
      <rect x="8.6" y="12.6" width="6.8" height="4.4" rx=".6" fill="#F3EAD7"/>
      <rect x="9.8" y="1.6" width="4.4" height="1.8" rx=".5" fill="${LINE}"/>
    </svg>`,
    soju: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.6 3.4h2.8v2.6c0 .9 3.3 1.7 3.3 4.4v9.9a1.6 1.6 0 0 1-1.6 1.6H8.9a1.6 1.6 0 0 1-1.6-1.6v-9.9c0-2.7 3.3-3.5 3.3-4.4z" fill="#8DB89A" stroke="${LINE}" stroke-width="1.3" stroke-linejoin="round"/>
      <rect x="10.3" y="1.6" width="3.4" height="2.4" rx=".5" fill="#4E6B52"/>
      <path d="M9.3 11.5v7" stroke="#D8EBDD" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`,
    makgeolli: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.8 10.2h18.4c0 5.1-4.1 8.8-9.2 8.8S2.8 15.3 2.8 10.2z" fill="#C9A77E" stroke="${LINE}" stroke-width="1.3" stroke-linejoin="round"/>
      <ellipse cx="12" cy="10.2" rx="9.2" ry="2" fill="#F7F1E3" stroke="${LINE}" stroke-width="1.3"/>
      <path d="M9 19h6l-.6 2.2H9.6z" fill="#A9845C" stroke="${LINE}" stroke-width="1.1" stroke-linejoin="round"/>
    </svg>`,
    wine: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.4 6.4h9.2c-.3 3.4-2.1 5.6-4.6 5.6S7.7 9.8 7.4 6.4z" fill="#8E3442"/>
      <path d="M7 2.6h10c0 5.3-2 9.4-5 9.4S7 7.9 7 2.6z" fill="none" stroke="${LINE}" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M12 12v8M8.6 20.7h6.8" stroke="${LINE}" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`,
    whisky: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.6 13h12.8l-.7 7a1.7 1.7 0 0 1-1.7 1.5H8a1.7 1.7 0 0 1-1.7-1.5z" fill="#C7792E"/>
      <rect x="8.4" y="10.4" width="5" height="5" rx=".8" transform="rotate(-12 10.9 12.9)" fill="#EEF2EF" stroke="${LINE}" stroke-width="1"/>
      <path d="M4.8 6.5h14.4l-1.5 13.6a1.7 1.7 0 0 1-1.7 1.5H8a1.7 1.7 0 0 1-1.7-1.5z" fill="none" stroke="${LINE}" stroke-width="1.3" stroke-linejoin="round"/>
    </svg>`,
    other: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.2 6.6h11.6L12 12.4z" fill="#C98A8A"/>
      <path d="M3.8 4.2h16.4L12 12.6z" fill="none" stroke="${LINE}" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M12 12.6v7.4M8.6 20.7h6.8" stroke="${LINE}" stroke-width="1.4" stroke-linecap="round"/>
      <circle cx="17.6" cy="3.6" r="1.8" fill="#9DB27A" stroke="${LINE}" stroke-width="1"/>
    </svg>`
  };

  /* ===== 2. 얼굴 표정 기준 =====
     앱이 '과음'을 정하지 않고, 사용자가 정한 하루 목표(dailyMax)와 비교합니다.
     하루 목표가 없으면 마신 날은 항상 🙂 입니다. */
  function faceFor(rec) {
    if (!rec) return null;
    if (rec.kind === 'sober') return { emoji: '😆', msg: '최고예요!' };
    const total = totalOf(rec.drinks);
    const max = state.goals.dailyMax;
    if (!max) return { emoji: '🙂', msg: '기록했어요' };
    if (total <= max * 0.5) return { emoji: '😄', msg: '목표보다 한참 적게!' };
    if (total < max)        return { emoji: '😊', msg: '목표 안에서 마셨어요' };
    if (total === max)      return { emoji: '🙂', msg: '딱 목표만큼' };
    if (total <= Math.max(max * 1.5, max + 1)) return { emoji: '😮', msg: '목표보다 조금 더' };
    return { emoji: '😱', msg: '목표보다 꽤 많이' };
  }

  /* ===== 3. 저장 ===== */
  const STORE_KEY = 'drink-calendar:v1';
  const EMPTY = () => ({ version: 1, records: {}, goals: { dailyMax: null, soberTarget: null, rewards: [] } });

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return EMPTY();
      const data = JSON.parse(raw);
      const base = EMPTY();
      return { version: 1, records: data.records || {}, goals: Object.assign(base.goals, data.goals || {}) };
    } catch (e) {
      console.warn('기록을 읽지 못했어요', e);
      return EMPTY();
    }
  }
  function persist() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      toast('저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요');
      return false;
    }
  }

  /* ===== 공통 도우미 ===== */
  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const totalOf = (drinks) => Object.values(drinks || {}).reduce((a, b) => a + b, 0);
  const WEEK = ['일', '월', '화', '수', '목', '금', '토'];
  const drinkById = Object.fromEntries(DRINKS.map((d) => [d.id, d]));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const today = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };
  const yesterday = () => { const t = today(); t.setDate(t.getDate() - 1); return t; };
  const escapeHTML = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ===== 상태 ===== */
  let state = load();
  let selected = ymd(yesterday());          // 기본 선택: 어제
  let view = { y: yesterday().getFullYear(), m: yesterday().getMonth() };
  let draft = {};                           // 아직 저장 안 한 술 { id: 수량 }
  let active = null;                        // 수량을 조절 중인 술 id

  /* ===== 4. 달력 ===== */
  function marksHTML(drinks) {
    return DRINKS.filter((d) => drinks[d.id] > 0).map((d) => {
      const n = drinks[d.id];
      const icons = ICONS[d.id].repeat(Math.min(n, 3));
      const boom = n >= 4 ? '<span class="boom">+💥</span>' : '';
      return `<span class="mark-row">${icons}${boom}</span>`;
    }).join('');
  }

  function renderCalendar() {
    $('monthTitle').innerHTML = `<small>${view.y}</small>${view.m + 1}월`;
    const first = new Date(view.y, view.m, 1);
    const days = new Date(view.y, view.m + 1, 0).getDate();
    const tKey = ymd(today());
    const tTime = today().getTime();
    let html = '';
    for (let i = 0; i < first.getDay(); i++) html += '<span class="day blank" aria-hidden="true"></span>';
    for (let d = 1; d <= days; d++) {
      const date = new Date(view.y, view.m, d);
      const key = ymd(date);
      const rec = state.records[key];
      const future = date.getTime() > tTime;
      const cls = ['day'];
      if (date.getDay() === 0) cls.push('sun');
      if (date.getDay() === 6) cls.push('sat');
      if (key === tKey) cls.push('today');
      if (key === selected) cls.push('selected');
      if (future) cls.push('future');
      if (rec && rec.kind === 'sober') cls.push('sober');
      let label = `${view.m + 1}월 ${d}일`;
      if (rec && rec.kind === 'sober') label += ', 금주';
      if (rec && rec.kind === 'drink') {
        label += ', ' + DRINKS.filter((x) => rec.drinks[x.id]).map((x) => `${x.name} ${rec.drinks[x.id]}${x.unit}`).join(', ');
      }
      html += `<button type="button" class="${cls.join(' ')}" data-date="${key}" aria-label="${label}"${future ? ' disabled' : ''}${key === selected ? ' aria-current="date"' : ''}>
        <span class="num">${d}</span>
        <span class="marks">${rec && rec.kind === 'drink' ? marksHTML(rec.drinks) : ''}</span>
      </button>`;
    }
    $('grid').innerHTML = html;

    // 다음 달 버튼: 이번 달보다 미래로는 가지 않음
    const t = today();
    const atLatest = view.y > t.getFullYear() || (view.y === t.getFullYear() && view.m >= t.getMonth());
    $('nextMonth').disabled = atLatest;
    $('nextMonth').style.visibility = atLatest ? 'hidden' : 'visible';
  }

  $('grid').addEventListener('click', (e) => {
    const btn = e.target.closest('.day[data-date]');
    if (!btn || btn.disabled) return;
    selectDate(btn.dataset.date);
  });
  $('prevMonth').addEventListener('click', () => moveMonth(-1));
  $('nextMonth').addEventListener('click', () => moveMonth(1));

  // 달력을 좌우로 밀어서 달 이동
  (() => {
    let sx = 0, sy = 0;
    const el = document.querySelector('.calendar');
    el.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    el.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0 && !$('nextMonth').disabled) moveMonth(1);
        if (dx > 0) moveMonth(-1);
      }
    }, { passive: true });
  })();

  function moveMonth(step) {
    const d = new Date(view.y, view.m + step, 1);
    view = { y: d.getFullYear(), m: d.getMonth() };
    renderCalendar();
    renderFaces();
    renderGoals();
  }

  function selectDate(key) {
    selected = key;
    const d = parse(key);
    view = { y: d.getFullYear(), m: d.getMonth() };
    const rec = state.records[key];
    draft = rec && rec.kind === 'drink' ? { ...rec.drinks } : {};
    active = null;
    renderAll();
  }

  /* ===== 5. 기록 영역 ===== */
  function normalize(obj) {
    const out = {};
    DRINKS.forEach((x) => { if (obj[x.id] > 0) out[x.id] = obj[x.id]; });
    return out;
  }

  function renderRecord() {
    const d = parse(selected);
    $('recordTitle').textContent = `${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEK[d.getDay()]}요일`;
    const rec = state.records[selected];
    const rel = selected === ymd(yesterday()) ? '어제' : selected === ymd(today()) ? '오늘' : '';
    const status = rec ? (rec.kind === 'sober' ? '금주로 기록됨' : '기록됨') : '';
    $('recordTag').textContent = [rel, status].filter(Boolean).join(' · ');

    $('soberBtn').setAttribute('aria-pressed', rec && rec.kind === 'sober' ? 'true' : 'false');

    $('drinks').innerHTML = DRINKS.map((x) => {
      const n = draft[x.id] || 0;
      return `<button type="button" class="drink" data-id="${x.id}" aria-pressed="${active === x.id}" aria-label="${x.name}${n ? ` ${n}${x.unit}` : ''}">
        ${ICONS[x.id]}<span>${x.name}</span>${n ? `<span class="count">${n}</span>` : ''}
      </button>`;
    }).join('');

    if (active) {
      const x = drinkById[active];
      $('stepper').hidden = false;
      $('stepperName').textContent = x.name;
      $('stepperUnit').textContent = x.unit;
      $('qty').textContent = draft[active] || 0;
      $('minus').disabled = !(draft[active] > 0);
    } else {
      $('stepper').hidden = true;
    }

    const parts = DRINKS.filter((x) => draft[x.id] > 0).map((x) => `${x.name} ${draft[x.id]}${x.unit}`);
    $('draftSummary').textContent = parts.join(' + ');

    const saved = rec && rec.kind === 'drink' ? normalize(rec.drinks) : {};
    const changed = JSON.stringify(normalize(draft)) !== JSON.stringify(saved);
    $('saveBtn').disabled = totalOf(draft) === 0 || !changed;
    $('saveBtn').textContent = rec && rec.kind === 'drink' ? '수정하기' : '기록하기';
    $('deleteBtn').hidden = !rec;
    resetDeleteConfirm();
  }

  $('drinks').addEventListener('click', (e) => {
    const btn = e.target.closest('.drink');
    if (!btn) return;
    const id = btn.dataset.id;
    if (active === id) {
      draft[id] = Math.min((draft[id] || 0) + 1, 99);   // 이미 고른 술을 한 번 더 누르면 +1
    } else {
      active = id;
      if (!draft[id]) draft[id] = 1;                     // 처음 고르면 1로 시작
    }
    renderRecord();
  });
  $('plus').addEventListener('click', () => { if (!active) return; draft[active] = Math.min((draft[active] || 0) + 1, 99); renderRecord(); });
  $('minus').addEventListener('click', () => { if (!active) return; draft[active] = Math.max((draft[active] || 0) - 1, 0); renderRecord(); });

  $('saveBtn').addEventListener('click', saveDrinks);
  $('soberBtn').addEventListener('click', saveSober);
  $('deleteBtn').addEventListener('click', deleteRecord);

  function saveDrinks() {
    const drinks = normalize(draft);
    if (!totalOf(drinks)) return;
    state.records[selected] = { kind: 'drink', drinks, savedAt: new Date().toISOString() };
    if (!persist()) return;
    active = null;
    draft = { ...drinks };
    renderAll(selected);
    playFace(selected);
  }

  function saveSober() {
    const rec = state.records[selected];
    if (rec && rec.kind === 'sober') return;
    state.records[selected] = { kind: 'sober', savedAt: new Date().toISOString() };
    if (!persist()) return;
    draft = {};
    active = null;
    renderAll(selected);
    playFace(selected);
  }

  let deleteTimer = null;
  function resetDeleteConfirm() {
    clearTimeout(deleteTimer);
    $('deleteBtn').classList.remove('confirm');
    $('deleteBtn').textContent = '이 날 기록 지우기';
  }
  function deleteRecord() {
    const btn = $('deleteBtn');
    if (!btn.classList.contains('confirm')) {
      btn.classList.add('confirm');
      btn.textContent = '한 번 더 누르면 지워져요';
      deleteTimer = setTimeout(resetDeleteConfirm, 3000);
      return;
    }
    delete state.records[selected];
    if (!persist()) return;
    draft = {};
    active = null;
    renderAll();
    toast('기록을 지웠어요');
  }

  /* ===== 6. 얼굴 컬렉션 ===== */
  function renderFaces(arrivingKey) {
    const prefix = `${view.y}-${pad(view.m + 1)}-`;
    const keys = Object.keys(state.records).filter((k) => k.startsWith(prefix)).sort();
    const html = keys.length
      ? keys.map((k) => {
          const f = faceFor(state.records[k]);
          const d = parse(k);
          const cls = ['face-chip'];
          if (k === selected) cls.push('current');
          if (k === arrivingKey) cls.push('arriving');
          return `<button type="button" class="${cls.join(' ')}" data-face-date="${k}" aria-label="${d.getMonth() + 1}월 ${d.getDate()}일 ${f.msg}">
            <span class="emoji">${f.emoji}</span><span class="d">${d.getMonth() + 1}/${d.getDate()}</span>
          </button>`;
        }).join('')
      : '<p class="face-empty">기록하면 그날의 얼굴이 여기 모여요</p>';
    document.querySelectorAll('[data-face-list]').forEach((el) => { el.innerHTML = html; });
  }

  document.addEventListener('click', (e) => {
    const chip = e.target.closest('.face-chip');
    if (!chip) return;
    const key = chip.dataset.faceDate;
    selectDate(key);
    const cell = document.querySelector(`.day[data-date="${key}"]`);
    if (cell) {
      cell.scrollIntoView({ block: 'center', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      cell.classList.remove('flash'); void cell.offsetWidth; cell.classList.add('flash');
    }
  });

  /* ===== 7. 목표 · 보상 ===== */
  function soberDaysInView() {
    const prefix = `${view.y}-${pad(view.m + 1)}-`;
    return Object.entries(state.records).filter(([k, r]) => k.startsWith(prefix) && r.kind === 'sober').length;
  }

  function renderGoals() {
    const g = state.goals;
    const sober = soberDaysInView();
    const hasAny = g.dailyMax || g.soberTarget || g.rewards.length;
    let html = `<h3>${view.m + 1}월의 목표</h3>`;
    html += `<p class="big">금주 ${sober}일${g.soberTarget ? ` <span class="suffix">/ ${g.soberTarget}일</span>` : ''}</p>`;
    if (g.soberTarget) {
      const pct = Math.min(100, Math.round((sober / g.soberTarget) * 100));
      html += `<div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="금주 목표 진행"><i style="width:${pct}%"></i></div>`;
    }
    if (g.dailyMax) html += `<p>하루 ${g.dailyMax}잔·병 이하</p>`;
    if (g.rewards.length) {
      html += '<ul>' + [...g.rewards].sort((a, b) => a.days - b.days).map((r) => {
        const done = sober >= r.days;
        return `<li class="${done ? 'done' : ''}">${done ? '✓ ' : ''}금주 ${r.days}일 → ${escapeHTML(r.text)}</li>`;
      }).join('') + '</ul>';
    }
    html += `<button type="button" class="link" data-open-goals>${hasAny ? '목표 바꾸기' : '목표와 보상 정하기'}</button>`;
    $('goalSummary').innerHTML = html;
  }

  const dialog = $('goalDialog');
  function rewardRow(r = { days: '', text: '' }) {
    return `<div class="reward-row">
      <span>금주</span>
      <input class="rd" type="number" inputmode="numeric" min="1" max="31" value="${r.days || ''}" placeholder="10" aria-label="금주 일수">
      <span>일 →</span>
      <input class="rt" type="text" maxlength="40" value="${escapeHTML(r.text || '')}" placeholder="요가 스트랩" aria-label="보상">
      <button type="button" class="rm" aria-label="이 보상 지우기">×</button>
    </div>`;
  }
  function openGoals() {
    const g = state.goals;
    $('dailyMax').value = g.dailyMax || '';
    $('soberTarget').value = g.soberTarget || '';
    $('rewardRows').innerHTML = (g.rewards.length ? g.rewards : [{}]).map(rewardRow).join('');
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
  }
  function closeGoals() {
    if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open');
  }

  document.addEventListener('click', (e) => { if (e.target.closest('[data-open-goals]')) openGoals(); });
  $('goalCancel').addEventListener('click', closeGoals);
  $('addReward').addEventListener('click', () => {
    $('rewardRows').insertAdjacentHTML('beforeend', rewardRow());
    $('rewardRows').lastElementChild.querySelector('.rd').focus();
  });
  $('rewardRows').addEventListener('click', (e) => {
    if (e.target.closest('.rm')) e.target.closest('.reward-row').remove();
  });
  $('goalForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const num = (v, max) => { const n = parseInt(v, 10); return n > 0 ? Math.min(n, max) : null; };
    state.goals.dailyMax = num($('dailyMax').value, 99);
    state.goals.soberTarget = num($('soberTarget').value, 31);
    state.goals.rewards = [...$('rewardRows').querySelectorAll('.reward-row')].map((row) => ({
      days: num(row.querySelector('.rd').value, 31),
      text: row.querySelector('.rt').value.trim()
    })).filter((r) => r.days && r.text);
    if (!persist()) return;
    closeGoals();
    renderAll();
    toast('✓ 목표를 저장했어요');
  });

  /* ===== 8. 얼굴 리액션 애니메이션 =====
     큰 얼굴이 화면 가운데 나타났다가 → 작아지며 얼굴 컬렉션의 그 날짜 자리로 날아갑니다. */
  let popBusy = false;
  let popRun = 0;
  const cancelAnims = (els) => els.forEach((el) => el.getAnimations && el.getAnimations().forEach((a) => a.cancel()));

  async function playFace(key) {
    const f = faceFor(state.records[key]);
    if (!f) return;
    const run = ++popRun;
    const pop = $('facePop'), emoji = $('facePopEmoji'), msg = $('facePopMsg');
    cancelAnims([emoji, msg, pop]);
    emoji.textContent = f.emoji;
    msg.textContent = f.msg;
    pop.classList.add('show');
    popBusy = true;

    const finish = () => {
      if (run !== popRun) return;          // 더 새 리액션이 시작됐으면 무시
      cancelAnims([emoji, msg, pop]);
      pop.classList.remove('show');
      document.querySelectorAll(`.face-chip[data-face-date="${key}"]`).forEach((c) => {
        c.classList.remove('arriving');
        c.classList.add('landed');
      });
      popBusy = false;
      toast('✓ 저장됐어요');
    };

    if (reduceMotion.matches || !emoji.animate) { setTimeout(finish, 900); return; }

    try {
      await emoji.animate(
        [{ transform: 'scale(.3)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: 0.7 }, { transform: 'scale(1)', opacity: 1 }],
        { duration: 380, easing: 'cubic-bezier(.2,.8,.3,1.2)' }
      ).finished;
      await new Promise((r) => setTimeout(r, 650));
      if (run !== popRun) return;

      // 화면에 보이는 컬렉션 안의 목적지 찾기
      const target = [...document.querySelectorAll(`.face-chip[data-face-date="${key}"] .emoji`)]
        .find((el) => el.offsetParent !== null);
      if (target) {
        target.closest('.face-chip').scrollIntoView({ block: 'nearest', inline: 'center' });
        const from = emoji.getBoundingClientRect();
        const to = target.getBoundingClientRect();
        const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
        const dy = (to.top + to.height / 2) - (from.top + from.height / 2);
        const s = to.height / from.height;
        msg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' });
        pop.animate([{ backgroundColor: 'rgba(251,246,234,.82)' }, { backgroundColor: 'rgba(251,246,234,0)' }], { duration: 560, fill: 'forwards' });
        await emoji.animate(
          [{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${dx}px, ${dy}px) scale(${s})` }],
          { duration: 600, easing: 'cubic-bezier(.5,0,.25,1)', fill: 'forwards' }
        ).finished;
      } else {
        await pop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).finished;
      }
    } catch (e) { /* 애니메이션이 끊겨도 기록은 이미 저장됨 */ }
    finish();
  }

  /* ===== 짧은 알림 ===== */
  let toastTimer = null;
  function toast(text) {
    const el = $('toast');
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1600);
  }

  /* ===== 전체 그리기 ===== */
  function renderAll(arrivingKey) {
    renderCalendar();
    renderRecord();
    renderFaces(arrivingKey);
    renderGoals();
  }

  // 시작: 어제를 선택한 상태로 열기
  selectDate(selected);

  // 다른 탭에서 바뀐 기록 반영
  window.addEventListener('storage', (e) => {
    if (e.key === STORE_KEY && !popBusy) { state = load(); selectDate(selected); }
  });

  /* ===== PWA: 서비스 워커 등록 ===== */
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((e) => console.warn('서비스 워커 등록 실패', e));
    });
  }
})();
