/* ==========================================================================
   STUDIO SEQUENCER 16 (script.js)
   Mimari Yapı: DESIGN -> state -> input -> rule -> output
   Arayüz metinleri İngilizce, kod yorumları ve kurulum notları Türkçedir.
   ========================================================================== */

'use strict';

/* ==========================================================================
   1. DESIGN (TASARIM VE KURAL AYARLARI)
   Bu nesne içerisindeki her parametre, 16 adımlı sıralayıcının (sequencer)
   davranışını, zamanlamasını ve geri bildirim (feedback) döngüsünü kontrol eder.
   ========================================================================== */
const DESIGN = {
  // Tempo (Dakikadaki vuruş sayısı).
  // Davranış etkisi: Artırıldığında 16 adımın geçiş süresi kısalır; azaltıldığında
  // her adım arasındaki milisaniye aralığı uzar.
  BPM: 120,

  // Yatay müzik portesindeki toplam zaman adımı (sütun) sayısı (16 adım = 4 vuruşluk tam ölçü).
  // Davranış etkisi: (step + 1) % STEPS kuralındaki döngü uzunluğunu belirler.
  // CODE sekmesinden 16, 12 veya 8 olarak canlı değiştirilebilir.
  MAX_STEPS: 16,
  STEPS: 16,

  // Dikey nota satırı sayısı (C5'ten C4'e tam 1 oktav, 8 diyatonik nota).
  // Davranış etkisi: Portedeki ses yüksekliği (pitch) çeşitliliğini belirler.
  ROWS: 8,

  // Sentezleyici dalga biçimi ('triangle', 'sine', 'square', 'sawtooth').
  // Davranış etkisi: Çalınan notaların tınısını değiştirir.
  WAVEFORM: 'triangle',

  // Nota süresi (saniye).
  // Davranış etkisi: Her bir nota tetiklendiğinde sesin sönümlenme süresini belirler.
  NOTE_DURATION: 0.24,

  // Nota yerleştirildiğinde anında önizleme sesi çalınsın mı?
  // Davranış etkisi: true olduğunda kullanıcı nota koyduğu anda o satırın sesini
  // duyar (anlık eylem onayı / action acknowledgement).
  PREVIEW_ON_PLACE: true,

  // Okuma sırasında ("CODE" veya "NOTES" sekmesine geçildiğinde) otomatik duraklatma.
  // Davranış etkisi: true olduğunda kullanıcı kodu veya notları incelerken
  // sekans otomatik olarak duraklatılır.
  PAUSE_WHILE_READING: true,

  // Karşılaştırma Modu ('FULL' veya 'BLIND_STEP').
  // Davranış etkisi: 'FULL' modunda hareketli çalma çubuğu (playhead) ve adım
  // sayacı görünür. 'BLIND_STEP' modunda ise ses çalmaya devam eder ancak
  // hangi adımda (1..16) olunduğu gizlenir (A/B testi için).
  FEEDBACK_MODE: 'FULL',

  // 8 satırın nota isimleri, frekansları (Hz) ve erişilebilirlik sembolleri.
  // Renk tek başına sinyal olarak kullanılmaz; her satırın kendine özgü şekli vardır.
  PITCHES: [
    { row: 0, name: 'C5', freq: 523.25, symbol: '●', ledger: true  },
    { row: 1, name: 'B4', freq: 493.88, symbol: '◆', ledger: false },
    { row: 2, name: 'A4', freq: 440.00, symbol: '▲', ledger: false },
    { row: 3, name: 'G4', freq: 392.00, symbol: '■', ledger: false },
    { row: 4, name: 'F4', freq: 349.23, symbol: '★', ledger: false },
    { row: 5, name: 'E4', freq: 329.63, symbol: '◆', ledger: false },
    { row: 6, name: 'D4', freq: 293.66, symbol: '▲', ledger: false },
    { row: 7, name: 'C4', freq: 261.63, symbol: '●', ledger: true  }
  ],

  // Sınıf arkadaşıyla yapılacak 16 adımlı A/B karşılaştırma testi için örnek melodi.
  // 14. adımda (stepIndex: 13) kasıtlı olarak uyumsuz bir nota içerir.
  TEST_MELODY_PEGS: [
    [7, 0],  // C4 - Adım 1
    [5, 2],  // E4 - Adım 3
    [3, 4],  // G4 - Adım 5
    [0, 6],  // C5 - Adım 7
    [1, 8],  // B4 - Adım 9
    [2, 10], // A4 - Adım 11
    [3, 12], // G4 - Adım 13
    [1, 13], // B4 - Adım 14 (Kasıtlı şaşırtmalı nota - kullanıcının bulup düzeltmesi beklenir)
    [5, 14], // E4 - Adım 15
    [7, 15]  // C4 - Adım 16
  ]
};

/* ==========================================================================
   2. STATE (UYGULAMA DURUM MODELİ)
   Sistemin o andaki tüm iç durumunu tek bir nesnede toplar.
   ========================================================================== */
const state = {
  // 8 satır x 16 sütunluk boolean matrisi (true = nota var, false = boş)
  grid: Array.from({ length: DESIGN.ROWS }, () => Array(DESIGN.MAX_STEPS).fill(false)),
  currentStep: -1,            // Aktif çalma adımı (-1: durduruldu, 0..15: aktif adım)
  isPlaying: false,           // Çalma durumu (true = oynatılıyor, false = duraklatıldı)
  wasPlayingBeforeTab: false, // Sekme değişiminden önce çalıyor muydu?
  activeTab: 'PLAY',          // Aktif görünüm sekmesi ('PLAY' | 'CODE' | 'NOTES')
  nightMode: false,           // Koyu stüdyo teması aktif mi?
  cursorRow: 3,               // Klavye gezinme imleci satırı (0..7)
  cursorCol: 0,               // Klavye gezinme imleci sütunu (0..15)
  activeStage: 'STATE',       // Alt diyagramda vurgulanan aşama ('INPUT' | 'RULE' | 'STATE' | 'OUTPUT')
  lastInputLabel: 'click · space',
  timerId: null,              // setInterval referansı
  audioCtx: null              // Web Audio API bağlamı
};

/* ==========================================================================
   3. INPUT (GİRDİ YÖNETİMİ: FARE, DOKUNMATİK VE KLAVYE)
   Kullanıcı etkileşimlerini yakalar ve kural fonksiyonlarına iletir.
   ========================================================================== */
function initInput() {
  // Üst bar butonları
  document.getElementById('restart-btn').addEventListener('click', () => handleRestart('click restart'));
  document.getElementById('pause-btn').addEventListener('click', () => handleTogglePlay('click play/pause'));
  document.getElementById('rewind-btn').addEventListener('click', () => handleRewind('click rewind'));
  document.getElementById('demo-btn').addEventListener('click', () => handleLoadTestMelody());
  document.getElementById('night-btn').addEventListener('click', () => handleToggleNight());

  // Sekme (PLAY | CODE | NOTES) geçişleri
  document.getElementById('tab-play').addEventListener('click', () => handleSwitchTab('PLAY'));
  document.getElementById('tab-code').addEventListener('click', () => handleSwitchTab('CODE'));
  document.getElementById('tab-notes').addEventListener('click', () => handleSwitchTab('NOTES'));

  // "Pause while reading" onay kutusu
  const pauseReadingCheck = document.getElementById('pause-reading-checkbox');
  pauseReadingCheck.addEventListener('change', (e) => {
    DESIGN.PAUSE_WHILE_READING = e.target.checked;
    renderLiveCodeBlock();
  });

  // CODE panelindeki canlı parametre kontrolleri
  const bpmInput = document.getElementById('input-bpm');
  bpmInput.addEventListener('input', (e) => {
    handleUpdateBpm(Number(e.target.value));
  });

  const stepsSelect = document.getElementById('select-steps');
  stepsSelect.addEventListener('change', (e) => {
    handleUpdateSteps(Number(e.target.value));
  });

  const waveSelect = document.getElementById('select-waveform');
  waveSelect.addEventListener('change', (e) => {
    DESIGN.WAVEFORM = e.target.value;
    setHighlightedStage('RULE', `wave = ${DESIGN.WAVEFORM}`);
    renderAll();
  });

  const feedbackSelect = document.getElementById('select-feedback-mode');
  feedbackSelect.addEventListener('change', (e) => {
    DESIGN.FEEDBACK_MODE = e.target.value;
    setHighlightedStage('STATE', `mode = ${DESIGN.FEEDBACK_MODE}`);
    renderAll();
  });

  const previewCheck = document.getElementById('checkbox-preview-sound');
  previewCheck.addEventListener('change', (e) => {
    DESIGN.PREVIEW_ON_PLACE = e.target.checked;
    renderLiveCodeBlock();
  });

  // Alt bar KEYBOARD SHORTCUTS açılır penceresi
  const controlsBtn = document.getElementById('controls-toggle-btn');
  const closeControlsBtn = document.getElementById('close-controls-btn');
  controlsBtn.addEventListener('click', toggleControlsPopover);
  closeControlsBtn.addEventListener('click', toggleControlsPopover);

  // Klavye kısayolları ve erişilebilir 8x16 ızgara gezinmesi
  window.addEventListener('keydown', (e) => {
    const tag = document.activeElement ? document.activeElement.tagName : '';
    if (tag === 'INPUT' || tag === 'SELECT') {
      if (e.key === 'Escape') document.activeElement.blur();
      return;
    }

    const key = e.key.toLowerCase();

    if (e.key === ' ') {
      e.preventDefault();
      handleTogglePlay('key space');
    } else if (key === 'p') {
      e.preventDefault();
      handleTogglePlay('key P');
    } else if (key === 'r') {
      e.preventDefault();
      handleRestart('key R');
    } else if (key === 'w') {
      e.preventDefault();
      handleRewind('key W');
    } else if (key === 'c') {
      e.preventDefault();
      handleSwitchTab(state.activeTab === 'CODE' ? 'PLAY' : 'CODE');
    } else if (key === 'd' || key === 'n') {
      e.preventDefault();
      handleToggleNight();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveCursor(-1, 0);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveCursor(1, 0);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      moveCursor(0, -1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      moveCursor(0, 1);
    } else if (e.key === 'Enter') {
      if (!document.activeElement || !document.activeElement.classList.contains('peg-cell')) {
        e.preventDefault();
        handleTogglePeg(state.cursorRow, state.cursorCol, 'key enter');
      }
    } else if (e.key === 'Escape') {
      const pop = document.getElementById('controls-popover');
      if (!pop.classList.contains('hidden')) toggleControlsPopover();
    }
  });
}

// Nota noktası ekleme/çıkarma girdisi
function handleTogglePeg(row, col, sourceLabel) {
  if (col >= DESIGN.STEPS) return;
  ensureAudioContext();
  state.cursorRow = row;
  state.cursorCol = col;

  const isNowActive = ruleToggleGridCell(row, col);
  const pitchObj = DESIGN.PITCHES[row];

  setHighlightedStage('INPUT', sourceLabel || `note[${row}][${col}]`);

  // Nota eklendiğinde anında önizleme sesi çal (Action Acknowledgement)
  if (isNowActive && DESIGN.PREVIEW_ON_PLACE) {
    playSynthesizedNote(pitchObj.freq, DESIGN.NOTE_DURATION * 0.85);
  }

  renderAll();
  announceScreenReader(`${pitchObj.name} at step ${col + 1} ${isNowActive ? 'added' : 'removed'}. Total active notes: ${ruleCountActivePegs()}.`);
}

// Oynat / Duraklat girdisi
function handleTogglePlay(sourceLabel) {
  ensureAudioContext();
  state.isPlaying = !state.isPlaying;
  setHighlightedStage('INPUT', sourceLabel);

  if (state.isPlaying) {
    startSequencerClock();
    announceScreenReader(`Playback started at ${DESIGN.BPM} BPM across ${DESIGN.STEPS} steps.`);
  } else {
    stopSequencerClock();
    announceScreenReader(`Playback paused at step ${state.currentStep + 1}.`);
  }
  renderAll();
}

// Başa Sarma (Rewind): Notaları silmeden çalma çubuğunu 1. adıma döndürür
function handleRewind(sourceLabel) {
  ensureAudioContext();
  state.currentStep = 0;
  setHighlightedStage('INPUT', sourceLabel);

  if (state.isPlaying) {
    startSequencerClock(true);
  }
  renderAll();
  announceScreenReader('Playhead rewound to step 1. All notes preserved.');
}

// Sıfırlama (Restart): Tüm notaları temizler ve çalma çubuğunu başlangıç durumuna alır
function handleRestart(sourceLabel) {
  stopSequencerClock();
  state.isPlaying = false;
  state.currentStep = -1;
  ruleClearGrid();
  setHighlightedStage('STATE', `reset grid[${DESIGN.ROWS}][${DESIGN.STEPS}]`);
  renderAll();
  announceScreenReader('Sequencer restarted. All 16 steps cleared.');
}

// 16 Adımlı Test Melodisi Yükleme (A/B karşılaştırma deneyi için)
function handleLoadTestMelody() {
  ensureAudioContext();
  DESIGN.STEPS = 16;
  const stepsSelect = document.getElementById('select-steps');
  if (stepsSelect) stepsSelect.value = '16';

  ruleLoadPreset(DESIGN.TEST_MELODY_PEGS);
  state.currentStep = 0;
  setHighlightedStage('STATE', '16-step preset');
  if (!state.isPlaying) {
    state.isPlaying = true;
    startSequencerClock(true);
  }
  renderAll();
  announceScreenReader('Loaded 16-step test melody. Step 14 contains an off-pitch note to locate and fix.');
}

// BPM Güncelleme
function handleUpdateBpm(newBpm) {
  DESIGN.BPM = ruleClampBpm(newBpm);
  setHighlightedStage('RULE', `bpm = ${DESIGN.BPM}`);
  if (state.isPlaying) {
    startSequencerClock(false);
  }
  renderAll();
}

// Aktif Adım Sayısını (16, 12, 8) Güncelleme
function handleUpdateSteps(newSteps) {
  DESIGN.STEPS = newSteps;
  if (state.currentStep >= DESIGN.STEPS) {
    state.currentStep = 0;
  }
  if (state.cursorCol >= DESIGN.STEPS) {
    state.cursorCol = DESIGN.STEPS - 1;
  }
  setHighlightedStage('RULE', `step = (step + 1) % ${DESIGN.STEPS}`);
  renderAll();
}

// Sekme Değiştirme (PLAY | CODE | NOTES)
function handleSwitchTab(tabName) {
  if (DESIGN.PAUSE_WHILE_READING) {
    if (tabName !== 'PLAY' && state.activeTab === 'PLAY') {
      state.wasPlayingBeforeTab = state.isPlaying;
      if (state.isPlaying) {
        state.isPlaying = false;
        stopSequencerClock();
      }
    } else if (tabName === 'PLAY' && state.activeTab !== 'PLAY' && state.wasPlayingBeforeTab) {
      state.isPlaying = true;
      startSequencerClock(false);
      state.wasPlayingBeforeTab = false;
    }
  }

  state.activeTab = tabName;
  renderAll();
}

// Koyu / Açık Stüdyo Teması Değiştirme
function handleToggleNight() {
  state.nightMode = !state.nightMode;
  document.body.classList.toggle('night-mode', state.nightMode);
  const nightBtn = document.getElementById('night-btn');
  nightBtn.setAttribute('aria-pressed', state.nightMode ? 'true' : 'false');
  nightBtn.textContent = state.nightMode ? 'LIGHT' : 'DARK';
}

// Klavye İmleci Hareketi
function moveCursor(dRow, dCol) {
  state.cursorRow = (state.cursorRow + dRow + DESIGN.ROWS) % DESIGN.ROWS;
  state.cursorCol = (state.cursorCol + dCol + DESIGN.STEPS) % DESIGN.STEPS;
  renderGridFocus();
  const cell = document.querySelector(`.peg-cell[data-row="${state.cursorRow}"][data-col="${state.cursorCol}"]`);
  if (cell) cell.focus();
}

function toggleControlsPopover() {
  const pop = document.getElementById('controls-popover');
  const btn = document.getElementById('controls-toggle-btn');
  const isHidden = pop.classList.toggle('hidden');
  btn.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
}

/* ==========================================================================
   4. RULE (SAF KURAL VE DURUM HESAPLAMA FONKSİYONLARI)
   DOM veya görsel çizimden tamamen bağımsız karar mekanizmaları.
   ========================================================================== */

// Bir sonraki adımı modulo aritmetiği ile hesaplar: step = (step + 1) % STEPS
function ruleNextStep(currentStep) {
  if (currentStep < 0) return 0;
  return (currentStep + 1) % DESIGN.STEPS;
}

// BPM değerinden 16'lık nota (1/16 step) milisaniye süresini hesaplar
function ruleStepIntervalMs(bpm) {
  return Math.round(60000 / (bpm * 4));
}

// BPM sınırlarını korur
function ruleClampBpm(val) {
  return Math.max(60, Math.min(240, val));
}

// Izgaradaki bir hücreyi tersine çevirir ve yeni durumu döndürür
function ruleToggleGridCell(row, col) {
  state.grid[row][col] = !state.grid[row][col];
  return state.grid[row][col];
}

// Izgarayı tamamen temizler
function ruleClearGrid() {
  for (let r = 0; r < DESIGN.ROWS; r++) {
    for (let c = 0; c < DESIGN.MAX_STEPS; c++) {
      state.grid[r][c] = false;
    }
  }
}

// Örnek melodi koordinatlarını ızgaraya yükler
function ruleLoadPreset(coordsList) {
  ruleClearGrid();
  coordsList.forEach(([r, c]) => {
    if (r >= 0 && r < DESIGN.ROWS && c >= 0 && c < DESIGN.MAX_STEPS) {
      state.grid[r][c] = true;
    }
  });
}

// Aktif döngü sınırları içindeki toplam yerleştirilmiş nota sayısını hesaplar
function ruleCountActivePegs() {
  let count = 0;
  for (let r = 0; r < DESIGN.ROWS; r++) {
    for (let c = 0; c < DESIGN.STEPS; c++) {
      if (state.grid[r][c]) count++;
    }
  }
  return count;
}

// Belirli bir adımda (sütunda) aktif olan tüm satırların frekans bilgilerini döndürür
function ruleGetActivePitchesForStep(stepIndex) {
  if (stepIndex < 0 || stepIndex >= DESIGN.STEPS) return [];
  const active = [];
  for (let r = 0; r < DESIGN.ROWS; r++) {
    if (state.grid[r][stepIndex]) {
      active.push(DESIGN.PITCHES[r]);
    }
  }
  return active;
}

/* ==========================================================================
   ZAMANLAYICI (SEQUENCER CLOCK) VE WEB AUDIO SENTEZLEYİCİ
   ========================================================================== */
function startSequencerClock(triggerImmediateFirstStep = false) {
  stopSequencerClock();
  const intervalMs = ruleStepIntervalMs(DESIGN.BPM);

  if (triggerImmediateFirstStep) {
    executeStepTick();
  }

  state.timerId = setInterval(() => {
    executeStepTick();
  }, intervalMs);
}

function stopSequencerClock() {
  if (state.timerId !== null) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

// Her saat vuruşunda (tick) çalışan adım ilerletme ve ses tetikleme döngüsü
function executeStepTick() {
  state.currentStep = ruleNextStep(state.currentStep);
  const activePitches = ruleGetActivePitchesForStep(state.currentStep);

  if (activePitches.length > 0) {
    activePitches.forEach((p) => {
      playSynthesizedNote(p.freq, DESIGN.NOTE_DURATION);
    });
    setHighlightedStage('OUTPUT', `synth (${activePitches.map(p => p.name).join('+')})`);
  } else {
    setHighlightedStage('RULE', `step = (${state.currentStep} + 1) % ${DESIGN.STEPS}`);
  }

  renderAll();
}

function ensureAudioContext() {
  if (!state.audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      state.audioCtx = new AudioContextClass();
    }
  }
  if (state.audioCtx && state.audioCtx.state === 'suspended') {
    state.audioCtx.resume();
  }
}

// Web Audio API ile harici ses dosyasına ihtiyaç duymadan temiz nota sentezi
function playSynthesizedNote(frequency, durationSec) {
  if (!state.audioCtx) return;

  const now = state.audioCtx.currentTime;
  const osc = state.audioCtx.createOscillator();
  const gain = state.audioCtx.createGain();

  osc.type = DESIGN.WAVEFORM;
  osc.frequency.setValueAtTime(frequency, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.2, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0008, now + durationSec);

  osc.connect(gain);
  gain.connect(state.audioCtx.destination);

  osc.start(now);
  osc.stop(now + durationSec + 0.02);
}

/* ==========================================================================
   5. OUTPUT (GÖRSEL SUNUM, DOM GÜNCELLEME VE GERİ BİLDİRİM)
   Durumu (state) okur ve tüm arayüz bileşenlerini senkronize çizer.
   ========================================================================== */

// İlk yüklemede yatay porte ızgarasını (8x16) ve adım başlıklarını oluşturur
function buildInitialStaffDOM() {
  const headersRow = document.getElementById('step-headers-row');
  headersRow.innerHTML = '';
  for (let c = 0; c < DESIGN.MAX_STEPS; c++) {
    const span = document.createElement('span');
    // Her 4 adımda bir (1, 5, 9, 13) ölçü başı vurgusu ekle
    const isBeatAnchor = (c % 4 === 0);
    span.className = `step-col-num${isBeatAnchor ? ' beat-anchor' : ''}`;
    span.id = `step-header-${c}`;
    span.textContent = String(c + 1);
    headersRow.appendChild(span);
  }

  const gridContainer = document.getElementById('sequencer-grid');
  gridContainer.innerHTML = '';

  DESIGN.PITCHES.forEach((pitchInfo) => {
    const rowEl = document.createElement('div');
    rowEl.className = `staff-row${pitchInfo.ledger ? ' ledger-row' : ''}`;
    rowEl.setAttribute('data-row', String(pitchInfo.row));
    rowEl.setAttribute('role', 'row');

    // Sol Nota İsmi ve Sembolü
    const labelEl = document.createElement('div');
    labelEl.className = 'pitch-label';
    labelEl.innerHTML = `
      <span class="pitch-shape-key" aria-hidden="true">${pitchInfo.symbol}</span>
      <span>${pitchInfo.name}</span>
    `;
    rowEl.appendChild(labelEl);

    // 16 Adım Hücresi
    const cellsWrap = document.createElement('div');
    cellsWrap.className = 'row-cells';

    for (let c = 0; c < DESIGN.MAX_STEPS; c++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isMeasureStart = (c % 4 === 0);
      const isAltBeatGroup = (Math.floor(c / 4) % 2 === 1);
      btn.className = `peg-cell${isMeasureStart ? ' measure-start' : ''}${isAltBeatGroup ? ' beat-group-alt' : ''}`;
      btn.setAttribute('data-row', String(pitchInfo.row));
      btn.setAttribute('data-col', String(c));
      btn.setAttribute('role', 'gridcell');
      btn.setAttribute('aria-label', `${pitchInfo.name}, Step ${c + 1}, empty`);
      btn.setAttribute('aria-pressed', 'false');

      const dot = document.createElement('span');
      dot.className = 'peg-dot';
      dot.setAttribute('aria-hidden', 'true');
      btn.appendChild(dot);

      btn.addEventListener('click', () => {
        handleTogglePeg(pitchInfo.row, c, `click [${pitchInfo.name}, S${c + 1}]`);
      });

      cellsWrap.appendChild(btn);
    }

    rowEl.appendChild(cellsWrap);
    gridContainer.appendChild(rowEl);
  });
}

function setHighlightedStage(stageName, customInputText) {
  state.activeStage = stageName;
  if (customInputText && stageName === 'INPUT') {
    state.lastInputLabel = customInputText;
  }
}

function renderAll() {
  renderTopTelemetryAndControls();
  renderTabs();
  renderStaffAndPlayhead();
  renderIrsoStrip();
  renderLiveCodeBlock();
}

// Üst bar sayaçlarını (BPM | STEP | NOTES) ve Play/Pause butonunu günceller
function renderTopTelemetryAndControls() {
  const bpmEl = document.getElementById('telemetry-bpm');
  const stepEl = document.getElementById('telemetry-step');
  const pegsEl = document.getElementById('telemetry-pegs');

  bpmEl.textContent = String(DESIGN.BPM);

  // Karşılaştırma Modu B (BLIND_STEP) ise adım sayacını gizle
  if (DESIGN.FEEDBACK_MODE === 'BLIND_STEP' && state.isPlaying) {
    stepEl.textContent = `? / ${DESIGN.STEPS}`;
  } else {
    stepEl.textContent = state.currentStep >= 0
      ? `${state.currentStep + 1} / ${DESIGN.STEPS}`
      : `- / ${DESIGN.STEPS}`;
  }

  pegsEl.textContent = String(ruleCountActivePegs());

  // Play / Pause butonu görünümü
  const pauseBtn = document.getElementById('pause-btn');
  const pauseIcon = document.getElementById('pause-btn-icon');
  const pauseText = document.getElementById('pause-btn-text');

  pauseBtn.classList.toggle('playing', state.isPlaying);
  pauseIcon.textContent = state.isPlaying ? '⏸' : '▶';
  pauseText.textContent = state.isPlaying ? 'PAUSE' : 'PLAY';

  // Koşul rozeti (Condition A / B)
  const badge = document.getElementById('feedback-condition-badge');
  if (DESIGN.FEEDBACK_MODE === 'FULL') {
    badge.textContent = 'Condition A: Full Playhead Feedback';
  } else {
    badge.textContent = 'Condition B: Hidden Playhead (Audio Only)';
  }
}

// Sekme görünürlüğünü günceller
function renderTabs() {
  const tabs = [
    { id: 'PLAY', btn: 'tab-play', panel: 'panel-play' },
    { id: 'CODE', btn: 'tab-code', panel: 'panel-code' },
    { id: 'NOTES', btn: 'tab-notes', panel: 'panel-notes' }
  ];

  tabs.forEach((t) => {
    const isSelected = state.activeTab === t.id;
    const btnEl = document.getElementById(t.btn);
    const panelEl = document.getElementById(t.panel);
    btnEl.classList.toggle('active', isSelected);
    btnEl.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    panelEl.classList.toggle('hidden', !isSelected);
  });
}

// Yatay müzik portesindeki 16 adımı ve hareketli çalma çubuğunu (playhead) günceller
function renderStaffAndPlayhead() {
  const showVisualPlayhead = (DESIGN.FEEDBACK_MODE === 'FULL') && (state.currentStep >= 0);

  // Adım başlıkları (1..16)
  for (let c = 0; c < DESIGN.MAX_STEPS; c++) {
    const headerEl = document.getElementById(`step-header-${c}`);
    if (headerEl) {
      headerEl.classList.toggle('active-step-header', showVisualPlayhead && state.currentStep === c);
      headerEl.classList.toggle('inactive-step-col', c >= DESIGN.STEPS);
    }
  }

  // Dikey çalma çubuğu (Playhead Bar) konumu
  const playheadBar = document.getElementById('playhead-bar');
  if (showVisualPlayhead) {
    playheadBar.classList.add('visible');
    playheadBar.style.transform = `translateX(${state.currentStep * 100}%)`;
  } else {
    playheadBar.classList.remove('visible');
  }

  // 8x16 hücrelerin aktiflik ve tetiklenme durumları
  const cells = document.querySelectorAll('.peg-cell');
  cells.forEach((cell) => {
    const r = Number(cell.getAttribute('data-row'));
    const c = Number(cell.getAttribute('data-col'));
    const isDisabledCol = (c >= DESIGN.STEPS);
    const isActive = state.grid[r][c] && !isDisabledCol;
    const isTriggered = isActive && showVisualPlayhead && (state.currentStep === c) && state.isPlaying;
    const pitchInfo = DESIGN.PITCHES[r];

    cell.classList.toggle('disabled-step', isDisabledCol);
    cell.classList.toggle('active', isActive);
    cell.classList.toggle('triggered', isTriggered);
    cell.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    cell.setAttribute(
      'aria-label',
      `${pitchInfo.name}, Step ${c + 1}, ${isActive ? 'active note' : 'empty'}`
    );

    const dot = cell.querySelector('.peg-dot');
    dot.textContent = isActive ? pitchInfo.symbol : '';
  });

  renderGridFocus();
}

function renderGridFocus() {
  const cells = document.querySelectorAll('.peg-cell');
  cells.forEach((cell) => {
    const r = Number(cell.getAttribute('data-row'));
    const c = Number(cell.getAttribute('data-col'));
    cell.classList.toggle('kb-focused', r === state.cursorRow && c === state.cursorCol);
  });
}

// Sol alttaki INPUT -> RULE -> STATE -> OUTPUT diyagramını günceller
function renderIrsoStrip() {
  const cells = {
    INPUT: document.getElementById('irso-input'),
    RULE: document.getElementById('irso-rule'),
    STATE: document.getElementById('irso-state'),
    OUTPUT: document.getElementById('irso-output')
  };

  Object.keys(cells).forEach((k) => {
    cells[k].classList.toggle('active-stage', state.activeStage === k);
  });

  document.getElementById('irso-input-val').textContent = state.lastInputLabel;
  document.getElementById('irso-rule-val').textContent = `step = (step + 1) % ${DESIGN.STEPS}`;
  document.getElementById('irso-state-val').textContent =
    `grid[${DESIGN.ROWS}][${DESIGN.STEPS}] · s:${state.currentStep >= 0 ? state.currentStep + 1 : '-'}`;
  document.getElementById('irso-output-val').textContent =
    DESIGN.FEEDBACK_MODE === 'FULL' ? 'notes · bar · synth' : 'notes · [hidden] · synth';
}

// CODE sekmesindeki canlı yapılandırma metnini günceller
function renderLiveCodeBlock() {
  const bpmLabel = document.getElementById('label-bpm-val');
  if (bpmLabel) bpmLabel.textContent = `${DESIGN.BPM} BPM`;

  const pre = document.getElementById('live-code-pre');
  if (!pre) return;

  const intervalMs = ruleStepIntervalMs(DESIGN.BPM);
  pre.textContent = `const DESIGN = {
  BPM: ${DESIGN.BPM},               // 1/16 step interval: ${intervalMs} ms
  STEPS: ${DESIGN.STEPS},              // Active loop rule: step = (step + 1) % ${DESIGN.STEPS}
  ROWS: ${DESIGN.ROWS},                // Full octave: C5 down to C4
  WAVEFORM: "${DESIGN.WAVEFORM}",    // Synth timbre
  PREVIEW_ON_PLACE: ${DESIGN.PREVIEW_ON_PLACE}, // Immediate action acknowledgement
  FEEDBACK_MODE: "${DESIGN.FEEDBACK_MODE}"    // State visibility mode
};`;
}

function announceScreenReader(text) {
  const region = document.getElementById('sr-announcer');
  if (region) region.textContent = text;
}

// Başlangıçta 16 adımlı hoş bir melodi dizisi yerleştir
function seedInitialPegs() {
  state.grid[7][0]  = true; // C4, Adım 1
  state.grid[5][2]  = true; // E4, Adım 3
  state.grid[3][4]  = true; // G4, Adım 5
  state.grid[0][6]  = true; // C5, Adım 7
  state.grid[2][8]  = true; // A4, Adım 9
  state.grid[3][10] = true; // G4, Adım 11
  state.grid[5][12] = true; // E4, Adım 13
  state.grid[6][14] = true; // D4, Adım 15
}

// Sayfa yüklendiğinde başlat
window.addEventListener('DOMContentLoaded', () => {
  buildInitialStaffDOM();
  seedInitialPegs();
  initInput();
  renderAll();
});