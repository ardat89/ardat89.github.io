/* ==========================================================================
   CHRONO LABYRINTH (script.js)
   Önerme Çifti: 04 Temporality (Zamansallık) × 05 Possibility (Olasılık)
   Mimari Yapı: DESIGN -> state -> input -> rule -> output
   Arayüz metinleri İngilizce, kod yorumları ve kurulum notları Türkçedir.
   ========================================================================== */

'use strict';

/* ==========================================================================
   3 ÖN TANIMLI (PRESET) LABİRENT HARİTASI
   1: Duvar, 0: Açık Koridor, 2: Merkez Krono-Çekirdek (Düşman Doğma Noktası)
   3: Faz A Kapısı (Phase Gate A — t=0 anında AÇIK ⊶)
   4: Faz B Kapısı (Phase Gate B — t=0 anında KİLİTLİ ╬)
   ========================================================================== */
const MAZE_PRESETS = {
  // Harita 1: Klasik Simetrik Labirent (Classic Labyrinth)
  CLASSIC: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,4,0,0,1,0,0,4,0,0,1,0,0,0,0,0,1],
    [1,1,1,0,1,0,1,1,1,0,1,0,0,0,1,0,1,1,1,0,1,0,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,2,0,1,0,0,0,0,0,1,0,0,0,1],
    [0,0,1,0,1,0,1,1,0,0,0,2,2,2,0,0,0,1,1,0,1,0,1,0,0],
    [1,0,0,0,1,0,0,0,0,0,1,0,2,0,1,0,0,0,0,0,1,0,0,0,1],
    [1,1,1,0,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,0,1,1,1],
    [1,0,0,0,0,0,1,0,0,4,0,0,1,0,0,4,0,0,1,0,0,0,0,0,1],
    [1,0,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,3,0,0,0,0,0,3,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ],

  // Harita 2: Eşmerkezli Yörünge Halkaları (Concentric Rings)
  RINGS: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,0,1,1,4,1,1,0,1,1,1,1,1,0,1,0,1],
    [1,0,4,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,4,0,1],
    [1,0,1,0,1,0,1,1,1,1,0,1,0,1,0,1,1,1,1,0,1,0,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,0,1,2,1,0,0,0,0,1,0,0,0,1,0,1],
    [0,0,3,0,1,0,0,0,1,1,0,2,2,2,0,1,1,0,0,0,1,0,3,0,0],
    [1,0,1,0,0,0,1,0,0,0,0,1,2,1,0,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,0,1,0,1,1,1,1,0,1,1,1,0,1,1,1,1,0,1,0,1,0,1],
    [1,0,4,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,4,0,1],
    [1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,3,0,0,0,0,0,3,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ],

  // Harita 3: Dörtyol Odaları (Crossroads Chamber)
  CROSSROADS: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1,0,1,0,1],
    [1,0,0,0,3,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,3,0,0,0,1],
    [1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,1,1],
    [1,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,1,0,1,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,1,0,0,0,1,0,2,0,1,0,0,0,1,0,1,0,0,0,1],
    [0,0,1,0,0,0,0,0,1,0,0,2,2,2,0,0,1,0,0,0,0,0,1,0,0],
    [1,0,0,0,1,0,1,0,0,0,1,0,2,0,1,0,0,0,1,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,1],
    [1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,1,1],
    [1,0,0,0,0,0,0,0,1,0,3,0,0,0,3,0,1,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ]
};

/* ==========================================================================
   1. DESIGN (TASARIM VE KURAL AYARLARI — CANLI DEĞİŞİKLİK İÇİN MERKEZİ NESNE)
   Bu nesne içerisindeki her parametre, 2D kuşbakışı labirentin zamanlama
   kurallarını (Premise 04: Temporality) ve koridor kapılarının açılıp
   kapanma olasılıklarını (Premise 05: Possibility) doğrudan kontrol eder.
   ========================================================================== */
const DESIGN = {
  // [PREMISE 05: POSSIBILITY] Aktif Labirent Haritası ('CLASSIC' | 'RINGS' | 'CROSSROADS' | 'RANDOM').
  MAZE_PRESET: 'CLASSIC',

  // [PREMISE 05: POSSIBILITY] Labirentteki Toplam Faz Kapısı Sayısı (0..16, çift步: yarı Faz A ⊶, yarı Faz B ╬).
  GATE_COUNT: 8,

  // [PREMISE 04: TEMPORALITY] Aktif Oyun Modu ('SPAWN' veya 'SPEED').
  GAME_MODE: 'SPAWN',

  // [PREMISE 04 × 05] Zaman Kırılması ve Kapı Fazı Değişim Süresi (Saniye).
  ESCALATION_INTERVAL_SEC: 10,

  // [PREMISE 04] Başlangıçtaki (t = 0) düşman sayısı.
  INITIAL_ENEMIES: 2,

  // [PREMISE 04] Mod 1'de labirentte aynı anda bulunabilecek maksimum düşman sınırı.
  MAX_ENEMIES: 8,

  // Oyuncunun saniyede katettiği koridor karesi (tile/sec) hızı.
  PLAYER_SPEED: 5.5,

  // Düşmanların başlangıç hızı (tile/sec).
  BASE_ENEMY_SPEED: 4.0,

  // [PREMISE 04] Mod 2'de her zaman diliminde düşman hızına eklenen çarpan.
  ENEMY_SPEED_STEP: 0.15,

  // [PREMISE 04 × 05] Geçmiş Hareket İzi Hafıza Süresi ve Kapı Kilit Süresi (Saniye).
  TRAIL_MEMORY_SEC: 6,

  // Hayatta kalınan her saniye başına verilen puan.
  SCORE_PER_SECOND: 10,

  // Yeni doğan düşmanın aktifleşmeden önceki uyarı süresi (Saniye).
  SPAWN_WARNING_SEC: 1.5,

  // [PREMISE 05: POSSIBILITY] Geçmiş İzin Kapıları Kilitlemesi Kuralı (Boolean).
  TRAIL_SEALS_GATES: true,

  // [PREMISE 05: POSSIBILITY] Manuel Kapı Çevirme (F Tuşu) Bekleme Süresi (Saniye).
  PHASE_FLIP_COOLDOWN_SEC: 6,

  // [PREMISE 04 × 05] Manuel Kapı Çevirmenin Zaman Maliyeti (Saniye).
  PHASE_FLIP_TIME_COST_SEC: 2.0,

  // CODE veya NOTES sekmesine geçildiğinde oyunu otomatik duraklatma.
  PAUSE_WHILE_READING: true,

  // Ekran üstü yön tuşlarının görünürlüğü.
  ALLOW_ON_SCREEN_DPAD: false,

  // 2D Labirent Boyutları (25 sütun x 17 satır, her kare 36x36 piksel = 900x612 tuval)
  GRID_COLS: 25,
  GRID_ROWS: 17,
  TILE_SIZE: 36,

  // 3 Farklı Benzersiz Düşman (Sentinel) Arketipi (Renk + Geometrik Şekil)
  ENEMY_ARCHETYPES: [
    { type: 'STALKER', label: 'Stalker', symbol: '▲', colorDark: '#f43f5e', colorLight: '#e11d48', trailWeight: 1.0 },
    { type: 'DRIFTER', label: 'Drifter', symbol: '⬢', colorDark: '#f59e0b', colorLight: '#d97706', trailWeight: 0.4 },
    { type: 'WRAITH',  label: 'Wraith',  symbol: '✳', colorDark: '#a855f7', colorLight: '#7e22ce', trailWeight: 1.5 }
  ],

  // Aktif 25x17 Kuşbakışı Labirent Haritası (Başlangıçta CLASSIC kopyalanır)
  MAZE_LAYOUT: MAZE_PRESETS.CLASSIC.map(row => [...row]),

  // Düşman doğma noktaları (Merkez ve köşeler)
  SPAWN_POINTS: [
    { col: 12, row: 8 },
    { col: 1,  row: 1 },
    { col: 23, row: 1 },
    { col: 1,  row: 15 },
    { col: 23, row: 15 }
  ]
};

// CODE sekmesindeki "RESET CODE TO DEFAULTS" butonu için fabrika varsayılanları
const DEFAULT_DESIGN = {
  MAZE_PRESET: 'CLASSIC',
  GATE_COUNT: 8,
  GAME_MODE: 'SPAWN',
  ESCALATION_INTERVAL_SEC: 10,
  INITIAL_ENEMIES: 2,
  MAX_ENEMIES: 8,
  PLAYER_SPEED: 5.5,
  BASE_ENEMY_SPEED: 4.0,
  ENEMY_SPEED_STEP: 0.15,
  TRAIL_MEMORY_SEC: 6,
  SCORE_PER_SECOND: 10,
  SPAWN_WARNING_SEC: 1.5,
  TRAIL_SEALS_GATES: true,
  PHASE_FLIP_COOLDOWN_SEC: 6,
  PHASE_FLIP_TIME_COST_SEC: 2.0
};

/* ==========================================================================
   2. STATE (UYGULAMA DURUM MODELİ)
   ========================================================================== */
const state = {
  status: 'READY',            // 'READY' | 'RUNNING' | 'PAUSED' | 'GAME_OVER'
  wasRunningBeforeTab: false,
  activeTab: 'PLAY',          // 'PLAY' | 'CODE' | 'NOTES'
  lightMode: false,
  baseMazeGrid: MAZE_PRESETS.CLASSIC.map(row => [...row]),

  // Zamanlayıcı ve Skor Durumu (Premise 04: Temporality)
  elapsedTime: 0,
  shiftClock: 0,
  score: 0,
  shiftsCompleted: 0,
  speedMultiplier: 1.0,
  lastFrameTimestamp: null,
  shiftFlashTimer: 0,

  // Kapı Olasılık Durumu (Premise 05: Possibility)
  gatePhasePolarity: 'A',     // 'A' | 'B'
  phaseFlipCooldown: 0,
  gates: [],

  // Oyuncu (The Weaver) Durumu
  player: {
    col: 12,
    row: 13,
    x: 12.5,
    y: 13.5,
    dirX: 0,
    dirY: 0,
    queuedDirX: 0,
    queuedDirY: 0,
    facingAngle: Math.PI
  },

  // Geçmiş Durum Hafızası (Memory of Earlier Actions):
  trailHistory: [],
  lastTrailRecordTime: -1,

  // Aktif Düşmanlar (Sentinels) Listesi:
  enemies: [],

  // Alt IRSO Diyagramı Durumu
  activeStage: 'STATE',
  lastInputLabel: 'arrows · swipe · F',
  lastRuleLabel: 'echo seals gates',
  audioCtx: null,

  // Dokunmatik ve Mobil Portre Durumu
  userToggledDpad: false,
  touchSwipe: {
    active: false,
    startX: 0,
    startY: 0
  }
};

/* ==========================================================================
   3. INPUT (GİRDİ YÖNETİMİ: YÖN TUŞLARI, F TUŞU, G TUŞU VE BUTONLAR)
   ========================================================================== */
function initInput() {
  // Üst bar butonları
  document.getElementById('reset-btn').addEventListener('click', () => handleReset('click reset'));
  document.getElementById('play-pause-btn').addEventListener('click', () => handleTogglePlayPause('click play/pause'));
  document.getElementById('overlay-start-btn').addEventListener('click', () => handleStartOrRestartFromOverlay());
  document.getElementById('theme-btn').addEventListener('click', () => handleToggleTheme());

  // Mod değiştirme butonları (Mod 1: Spawn vs Mod 2: Speed)
  document.getElementById('mode-spawn-btn').addEventListener('click', () => handleSelectGameMode('SPAWN', 'click mode 1'));
  document.getElementById('mode-speed-btn').addEventListener('click', () => handleSelectGameMode('SPEED', 'click mode 2'));

  // Üst Bar Labirent Seçici ve Rastgele Labirent Butonu
  const toolbarMazeSelect = document.getElementById('toolbar-maze-select');
  if (toolbarMazeSelect) {
    toolbarMazeSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'RANDOM') {
        handleGenerateRandomMaze('select random');
      } else {
        handleSelectMazePreset(val, `map = ${val}`);
      }
    });
  }

  const randomMazeBtn = document.getElementById('random-maze-btn');
  if (randomMazeBtn) {
    randomMazeBtn.addEventListener('click', () => handleGenerateRandomMaze('click random 🎲'));
  }

  // Başlangıç Ekranı (Start Overlay) Labirent Seçici Butonları
  const overlayMazeBtns = document.querySelectorAll('.overlay-maze-btn[data-maze]');
  overlayMazeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = btn.getAttribute('data-maze');
      handleSelectMazePreset(preset, `overlay ${preset.toLowerCase()}`);
    });
  });

  const overlayRandomBtn = document.getElementById('overlay-random-maze-btn');
  if (overlayRandomBtn) {
    overlayRandomBtn.addEventListener('click', () => handleGenerateRandomMaze('overlay random 🎲'));
  }

  // Premise 05: Manuel Faz Kapısı Çevirme Butonu (FLIP GATES / F)
  const phaseFlipBtn = document.getElementById('phase-flip-btn');
  if (phaseFlipBtn) {
    phaseFlipBtn.addEventListener('click', () => handleManualPhaseFlip('click flip gates'));
  }
  const dpadFlipBtn = document.getElementById('dpad-flip-btn');
  if (dpadFlipBtn) {
    dpadFlipBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      handleManualPhaseFlip('dpad flip ⇄');
    });
  }

  const dpadPauseBtn = document.getElementById('dpad-pause-btn');
  if (dpadPauseBtn) {
    dpadPauseBtn.addEventListener('click', () => handleTogglePlayPause('dpad play/pause'));
  }

  const dpadRandomBtn = document.getElementById('dpad-random-btn');
  if (dpadRandomBtn) {
    dpadRandomBtn.addEventListener('click', () => handleGenerateRandomMaze('dpad random 🎲'));
  }

  // Ekran üstü D-Pad açma/kapama butonu
  const dpadToggleBtn = document.getElementById('toggle-dpad-btn');
  if (dpadToggleBtn) {
    dpadToggleBtn.addEventListener('click', () => {
      state.userToggledDpad = true;
      DESIGN.ALLOW_ON_SCREEN_DPAD = !DESIGN.ALLOW_ON_SCREEN_DPAD;
      syncDpadVisibilityAndButton();
      renderLiveCodeBlock();
    });
  }

  // Sekme (PLAY | CODE | NOTES) butonları
  document.getElementById('tab-play').addEventListener('click', () => handleSwitchTab('PLAY'));
  document.getElementById('tab-code').addEventListener('click', () => handleSwitchTab('CODE'));
  document.getElementById('tab-notes').addEventListener('click', () => handleSwitchTab('NOTES'));

  // "Pause in CODE / NOTES" onay kutusu
  document.getElementById('pause-reading-checkbox').addEventListener('change', (e) => {
    DESIGN.PAUSE_WHILE_READING = e.target.checked;
    renderLiveCodeBlock();
  });

  // CODE sekmesindeki canlı parametre sürgüleri
  initCodePanelInputs();

  // Alt bar CONTROLS açılır penceresi
  document.getElementById('controls-toggle-btn').addEventListener('click', toggleControlsPopover);
  document.getElementById('close-controls-btn').addEventListener('click', toggleControlsPopover);

  // Ekran üstü D-Pad yön butonları (Gecikmesiz dokunmatik tepki için pointerdown + klavye erişimi için click)
  const triggerDpadDir = (dir) => {
    if (dir === 'UP') handleArrowDirection(0, -1, 'dpad ↑');
    if (dir === 'DOWN') handleArrowDirection(0, 1, 'dpad ↓');
    if (dir === 'LEFT') handleArrowDirection(-1, 0, 'dpad ←');
    if (dir === 'RIGHT') handleArrowDirection(1, 0, 'dpad →');
  };

  const dpadBtns = document.querySelectorAll('.dpad-btn[data-dir]');
  dpadBtns.forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      triggerDpadDir(btn.getAttribute('data-dir'));
    });
    btn.addEventListener('click', (e) => {
      if (e.detail === 0) {
        triggerDpadDir(btn.getAttribute('data-dir'));
      }
    });
  });

  // Labirent tuvali üzerinde doğrudan parmak kaydırma (Swipe) ve 2 parmak dokunuşuyla kapı çevirme
  initCanvasTouchSwipe();

  // Ekran boyutu değiştiğinde mobil/dokunmatik D-Pad görünürlüğünü otomatik kontrol et
  window.addEventListener('resize', () => {
    detectMobileOrTouchDefaults();
  });

  // Klavye Kontrolleri
  window.addEventListener('keydown', (e) => {
    const tag = document.activeElement ? document.activeElement.tagName : '';
    if (tag === 'INPUT' || tag === 'SELECT') {
      if (e.key === 'Escape') document.activeElement.blur();
      return;
    }

    const key = e.key.toLowerCase();

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleArrowDirection(0, -1, 'key ↑');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleArrowDirection(0, 1, 'key ↓');
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleArrowDirection(-1, 0, 'key ←');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleArrowDirection(1, 0, 'key →');
    } else if (key === 'f') {
      e.preventDefault();
      handleManualPhaseFlip('key F (flip)');
    } else if (key === 'g') {
      e.preventDefault();
      handleGenerateRandomMaze('key G (random)');
    } else if (key === '1') {
      e.preventDefault();
      handleSelectMazePreset('CLASSIC', 'key 1 (Classic)');
    } else if (key === '2') {
      e.preventDefault();
      handleSelectMazePreset('RINGS', 'key 2 (Rings)');
    } else if (key === '3') {
      e.preventDefault();
      handleSelectMazePreset('CROSSROADS', 'key 3 (Crossroads)');
    } else if (e.key === ' ' || key === 'p') {
      e.preventDefault();
      handleTogglePlayPause(e.key === ' ' ? 'key space' : 'key P');
    } else if (key === 'r') {
      e.preventDefault();
      handleReset('key R');
    } else if (key === 'm') {
      e.preventDefault();
      const nextMode = DESIGN.GAME_MODE === 'SPAWN' ? 'SPEED' : 'SPAWN';
      handleSelectGameMode(nextMode, 'key M');
    } else if (key === 'c') {
      e.preventDefault();
      handleSwitchTab(state.activeTab === 'CODE' ? 'PLAY' : 'CODE');
    } else if (key === 't') {
      e.preventDefault();
      handleToggleTheme();
    } else if (e.key === 'Escape') {
      const pop = document.getElementById('controls-popover');
      if (!pop.classList.contains('hidden')) toggleControlsPopover();
    }
  });

  window.addEventListener('blur', () => {
    if (state.status === 'RUNNING') {
      state.status = 'PAUSED';
      state.lastFrameTimestamp = null;
      renderHUD();
    }
  });
}

// Dokunmatik cihazları ve portre telefon ekranlarını algılayarak D-Pad konsolunu otomatik açar
function detectMobileOrTouchDefaults() {
  if (state.userToggledDpad) return;
  const isCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const isNarrowScreen = window.innerWidth <= 820;
  if (isCoarsePointer || isNarrowScreen) {
    DESIGN.ALLOW_ON_SCREEN_DPAD = true;
    syncDpadVisibilityAndButton();
  }
}

function syncDpadVisibilityAndButton() {
  const dpadToggleBtn = document.getElementById('toggle-dpad-btn');
  if (dpadToggleBtn) {
    dpadToggleBtn.classList.toggle('active', DESIGN.ALLOW_ON_SCREEN_DPAD);
    dpadToggleBtn.setAttribute('aria-pressed', DESIGN.ALLOW_ON_SCREEN_DPAD ? 'true' : 'false');
    dpadToggleBtn.innerHTML = `<span>🎮 DPAD: ${DESIGN.ALLOW_ON_SCREEN_DPAD ? 'ON' : 'OFF'}</span>`;
  }
  const dpadEl = document.getElementById('onscreen-dpad');
  if (dpadEl) {
    dpadEl.classList.toggle('hidden', !DESIGN.ALLOW_ON_SCREEN_DPAD);
  }
}

// Labirent Tuvali Üzerinde Kesintisiz Parmak Kaydırma (Continuous Touch Swipe) ve 2 Parmak Kapı Çevirme
function initCanvasTouchSwipe() {
  const canvas = document.getElementById('maze-canvas');
  if (!canvas) return;

  const SWIPE_THRESHOLD_PX = 18;

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      state.touchSwipe.active = false;
      handleManualPhaseFlip('2-finger tap ⇄');
      return;
    }
    if (e.touches.length === 1) {
      e.preventDefault();
      state.touchSwipe.active = true;
      state.touchSwipe.startX = e.touches[0].clientX;
      state.touchSwipe.startY = e.touches[0].clientY;
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    if (!state.touchSwipe.active || e.touches.length !== 1) return;
    e.preventDefault();

    const curX = e.touches[0].clientX;
    const curY = e.touches[0].clientY;
    const dx = curX - state.touchSwipe.startX;
    const dy = curY - state.touchSwipe.startY;

    if (Math.hypot(dx, dy) >= SWIPE_THRESHOLD_PX) {
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) handleArrowDirection(1, 0, 'swipe →');
        else handleArrowDirection(-1, 0, 'swipe ←');
      } else {
        if (dy > 0) handleArrowDirection(0, 1, 'swipe ↓');
        else handleArrowDirection(0, -1, 'swipe ↑');
      }
      // Parmağı kaldırmadan ardışık dönüşler yapılabilmesi için başlangıç noktasını güncelle
      state.touchSwipe.startX = curX;
      state.touchSwipe.startY = curY;
    }
  }, { passive: false });

  const endSwipe = () => {
    state.touchSwipe.active = false;
  };
  canvas.addEventListener('touchend', endSwipe);
  canvas.addEventListener('touchcancel', endSwipe);
}

function initCodePanelInputs() {
  const resetCodeBtn = document.getElementById('reset-code-btn');
  if (resetCodeBtn) {
    resetCodeBtn.addEventListener('click', () => handleResetCodeDefaults());
  }

  const codeMazeSelect = document.getElementById('select-code-maze');
  if (codeMazeSelect) {
    codeMazeSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'RANDOM') {
        handleGenerateRandomMaze('code random');
      } else {
        handleSelectMazePreset(val, `code ${val}`);
      }
    });
  }

  const codeRandomBtn = document.getElementById('code-random-maze-btn');
  if (codeRandomBtn) {
    codeRandomBtn.addEventListener('click', () => handleGenerateRandomMaze('code reroll 🎲'));
  }

  const modeSelect = document.getElementById('select-code-mode');
  if (modeSelect) {
    modeSelect.addEventListener('change', (e) => {
      handleSelectGameMode(e.target.value, 'code mode');
    });
  }

  const trailSealsSelect = document.getElementById('select-trail-seals');
  if (trailSealsSelect) {
    trailSealsSelect.addEventListener('change', (e) => {
      DESIGN.TRAIL_SEALS_GATES = (e.target.value === 'true');
      ruleUpdatePhaseGates();
      setHighlightedStage('RULE', `TRAIL_SEALS=${DESIGN.TRAIL_SEALS_GATES}`);
      renderHUD();
      renderLiveCodeBlock();
      renderCanvas();
    });
  }

  const bindRange = (id, key, labelId, formatter, resetOnChange = false) => {
    const el = document.getElementById(id);
    const labelEl = document.getElementById(labelId);
    if (!el) return;
    el.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      DESIGN[key] = val;
      if (labelEl) labelEl.textContent = formatter(val);
      if (key === 'TRAIL_MEMORY_SEC') {
        const footerTrail = document.getElementById('footer-trail-sec');
        if (footerTrail) footerTrail.textContent = String(val);
      }
      if (key === 'GATE_COUNT') {
        ruleInitPhaseGates();
      } else if (resetOnChange && state.status === 'READY') {
        ruleResetGameState();
      } else {
        ruleUpdatePhaseGates();
      }
      setHighlightedStage('RULE', `${key}=${val}`);
      renderHUD();
      renderLiveCodeBlock();
      renderCanvas();
    });
  };

  bindRange('input-gate-count', 'GATE_COUNT', 'label-gate-count-val', v => `${v} (${v / 2}A / ${v / 2}B)`);
  bindRange('input-interval', 'ESCALATION_INTERVAL_SEC', 'label-interval-val', v => `${v}s`);
  bindRange('input-trail-memory', 'TRAIL_MEMORY_SEC', 'label-trail-val', v => `${v}s`);
  bindRange('input-flip-cooldown', 'PHASE_FLIP_COOLDOWN_SEC', 'label-flip-cooldown-val', v => `${v}s`);
  bindRange('input-flip-cost', 'PHASE_FLIP_TIME_COST_SEC', 'label-flip-cost-val', v => `+${v.toFixed(1)}s`);
  bindRange('input-initial-enemies', 'INITIAL_ENEMIES', 'label-init-enemies-val', v => `${v}`, true);
  bindRange('input-max-enemies', 'MAX_ENEMIES', 'label-max-enemies-val', v => `${v}`);
  bindRange('input-speed-step', 'ENEMY_SPEED_STEP', 'label-speed-step-val', v => `+${v.toFixed(2)}x`);
  bindRange('input-player-speed', 'PLAYER_SPEED', 'label-player-speed-val', v => `${v.toFixed(1)}`);
}

// CODE sekmesindeki tüm form kontrollerini güncel DESIGN değerleriyle eşitle
function syncCodePanelInputsToDesign() {
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = String(val);
  };
  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };

  setVal('select-code-maze', DESIGN.MAZE_PRESET);
  setVal('select-code-mode', DESIGN.GAME_MODE);
  setVal('select-trail-seals', String(DESIGN.TRAIL_SEALS_GATES));

  setVal('input-gate-count', DESIGN.GATE_COUNT);
  setTxt('label-gate-count-val', `${DESIGN.GATE_COUNT} (${DESIGN.GATE_COUNT / 2}A / ${DESIGN.GATE_COUNT / 2}B)`);

  setVal('input-interval', DESIGN.ESCALATION_INTERVAL_SEC);
  setTxt('label-interval-val', `${DESIGN.ESCALATION_INTERVAL_SEC}s`);

  setVal('input-trail-memory', DESIGN.TRAIL_MEMORY_SEC);
  setTxt('label-trail-val', `${DESIGN.TRAIL_MEMORY_SEC}s`);
  setTxt('footer-trail-sec', String(DESIGN.TRAIL_MEMORY_SEC));

  setVal('input-flip-cooldown', DESIGN.PHASE_FLIP_COOLDOWN_SEC);
  setTxt('label-flip-cooldown-val', `${DESIGN.PHASE_FLIP_COOLDOWN_SEC}s`);

  setVal('input-flip-cost', DESIGN.PHASE_FLIP_TIME_COST_SEC);
  setTxt('label-flip-cost-val', `+${DESIGN.PHASE_FLIP_TIME_COST_SEC.toFixed(1)}s`);

  setVal('input-initial-enemies', DESIGN.INITIAL_ENEMIES);
  setTxt('label-init-enemies-val', `${DESIGN.INITIAL_ENEMIES}`);

  setVal('input-max-enemies', DESIGN.MAX_ENEMIES);
  setTxt('label-max-enemies-val', `${DESIGN.MAX_ENEMIES}`);

  setVal('input-speed-step', DESIGN.ENEMY_SPEED_STEP);
  setTxt('label-speed-step-val', `+${DESIGN.ENEMY_SPEED_STEP.toFixed(2)}x`);

  setVal('input-player-speed', DESIGN.PLAYER_SPEED);
  setTxt('label-player-speed-val', `${DESIGN.PLAYER_SPEED.toFixed(1)}`);
}

// CODE sekmesindeki tüm DESIGN parametrelerini varsayılan değerlere döndürür ve oyunu sıfırlar
function handleResetCodeDefaults() {
  ensureAudioContext();

  Object.keys(DEFAULT_DESIGN).forEach((key) => {
    DESIGN[key] = DEFAULT_DESIGN[key];
  });

  state.baseMazeGrid = MAZE_PRESETS.CLASSIC.map(row => [...row]);
  syncCodePanelInputsToDesign();
  ruleResetGameState();
  playSynthCue('GATE_FLIP');
  setHighlightedStage('RULE', 'reset DESIGN defaults');
  renderHUD();
  renderLiveCodeBlock();
  renderCanvas();
  announceScreenReader('All DESIGN parameters restored to factory defaults and labyrinth reset to 0 seconds.');
}

// Ön Tanımlı (Preset) Labirent Seçici İşleyicisi ('CLASSIC' | 'RINGS' | 'CROSSROADS')
function handleSelectMazePreset(presetKey, label) {
  if (!MAZE_PRESETS[presetKey]) return;
  ensureAudioContext();

  DESIGN.MAZE_PRESET = presetKey;
  state.baseMazeGrid = MAZE_PRESETS[presetKey].map(row => [...row]);

  ruleResetGameState();
  playSynthCue('GATE_FLIP');
  setHighlightedStage('RULE', label || `maze = ${presetKey}`);
  renderHUD();
  renderLiveCodeBlock();
  renderCanvas();
  announceScreenReader(`Maze layout switched to ${presetKey}. Game reset to 0 seconds.`);
}

// Rastgele Simetrik Labirent Üretici İşleyicisi ('RANDOM')
function handleGenerateRandomMaze(label) {
  ensureAudioContext();

  DESIGN.MAZE_PRESET = 'RANDOM';
  state.baseMazeGrid = ruleGenerateRandomMazeGrid();

  ruleResetGameState();
  playSynthCue('GATE_FLIP');
  setHighlightedStage('RULE', label || 'random maze generated');
  renderHUD();
  renderLiveCodeBlock();
  renderCanvas();
  announceScreenReader(`Generated a new symmetric random maze layout with ${DESIGN.GATE_COUNT} balanced Phase Gates. Game reset to 0 seconds.`);
}

// Yön Tuşu Girdisi İşleyicisi
function handleArrowDirection(dx, dy, label) {
  if (state.activeTab !== 'PLAY') return;
  ensureAudioContext();

  if (state.status === 'READY') {
    state.status = 'RUNNING';
    state.lastFrameTimestamp = null;
  }

  if (state.status !== 'RUNNING') return;

  state.player.queuedDirX = dx;
  state.player.queuedDirY = dy;
  setHighlightedStage('INPUT', label);
}

// Premise 05 (Possibility) × Premise 04 (Temporality): Manuel Kapı Fazı Çevirme (F Tuşu)
function handleManualPhaseFlip(label) {
  if (state.activeTab !== 'PLAY') return;
  ensureAudioContext();

  if (state.status === 'READY') {
    state.status = 'RUNNING';
    state.lastFrameTimestamp = null;
  }
  if (state.status !== 'RUNNING') return;

  if (state.phaseFlipCooldown > 0) {
    setHighlightedStage('INPUT', `flip cooldown (${state.phaseFlipCooldown.toFixed(1)}s)`);
    renderHUD();
    return;
  }

  state.gatePhasePolarity = (state.gatePhasePolarity === 'A') ? 'B' : 'A';
  state.phaseFlipCooldown = DESIGN.PHASE_FLIP_COOLDOWN_SEC;
  state.shiftClock += DESIGN.PHASE_FLIP_TIME_COST_SEC;
  state.shiftFlashTimer = 0.55;

  ruleUpdatePhaseGates();
  playSynthCue('GATE_FLIP');
  setHighlightedStage('RULE', `phase ${state.gatePhasePolarity} (+${DESIGN.PHASE_FLIP_TIME_COST_SEC}s shift)`);
  renderHUD();
  renderCanvas();
  announceScreenReader(`Phase Gates inverted to Phase ${state.gatePhasePolarity}. Next Shift Pulse accelerated by ${DESIGN.PHASE_FLIP_TIME_COST_SEC} seconds.`);
}

// Oynat / Duraklat İşleyicisi
function handleTogglePlayPause(label) {
  ensureAudioContext();
  if (state.status === 'GAME_OVER') {
    handleReset(label);
    state.status = 'RUNNING';
    renderHUD();
    return;
  }

  if (state.status === 'RUNNING') {
    state.status = 'PAUSED';
    state.lastFrameTimestamp = null;
    announceScreenReader(`Run paused at ${state.elapsedTime.toFixed(1)} seconds. Score: ${state.score}.`);
  } else {
    state.status = 'RUNNING';
    state.lastFrameTimestamp = null;
    if (state.player.dirX === 0 && state.player.dirY === 0 && state.player.queuedDirX === 0 && state.player.queuedDirY === 0) {
      state.player.queuedDirX = -1;
      state.player.queuedDirY = 0;
    }
    announceScreenReader(`Run started in ${DESIGN.GAME_MODE === 'SPAWN' ? 'Mode 1: Spawn Enemies' : 'Mode 2: Increase Speed'}.`);
  }

  setHighlightedStage('INPUT', label);
  renderHUD();
}

function handleStartOrRestartFromOverlay() {
  ensureAudioContext();
  if (state.status === 'GAME_OVER') {
    ruleResetGameState();
  }
  state.status = 'RUNNING';
  state.lastFrameTimestamp = null;
  if (state.player.dirX === 0 && state.player.dirY === 0) {
    state.player.queuedDirX = -1;
    state.player.queuedDirY = 0;
  }
  renderHUD();
}

// Sıfırlama (Reset) İşleyicisi
function handleReset(label) {
  ruleResetGameState();
  setHighlightedStage('STATE', label || 'reset t=0.0s');
  renderHUD();
  renderCanvas();
  announceScreenReader('Labyrinth reset to 0 seconds. Trail memory, phase gates, and enemies restored to initial state.');
}

// Oyun Modu (Mod 1: Spawn vs Mod 2: Speed) Değiştirici
function handleSelectGameMode(mode, label) {
  if (mode !== 'SPAWN' && mode !== 'SPEED') return;
  DESIGN.GAME_MODE = mode;

  const selectEl = document.getElementById('select-code-mode');
  if (selectEl) selectEl.value = mode;

  ruleResetGameState();
  setHighlightedStage('RULE', label || `mode = ${mode}`);
  renderHUD();
  renderLiveCodeBlock();
  renderCanvas();
  announceScreenReader(`Switched to ${mode === 'SPAWN' ? 'Mode 1: Spawn Enemies over time' : 'Mode 2: Increase Enemy Speed over time'}. Game reset.`);
}

// Sekme Değiştirici (PLAY | CODE | NOTES)
function handleSwitchTab(tabName) {
  if (DESIGN.PAUSE_WHILE_READING) {
    if (tabName !== 'PLAY' && state.activeTab === 'PLAY') {
      state.wasRunningBeforeTab = (state.status === 'RUNNING');
      if (state.status === 'RUNNING') {
        state.status = 'PAUSED';
        state.lastFrameTimestamp = null;
      }
    } else if (tabName === 'PLAY' && state.activeTab !== 'PLAY' && state.wasRunningBeforeTab) {
      state.status = 'RUNNING';
      state.lastFrameTimestamp = null;
      state.wasRunningBeforeTab = false;
    }
  }

  state.activeTab = tabName;
  renderHUD();
  renderLiveCodeBlock();
}

// Açık / Koyu Tema Değiştirici
function handleToggleTheme() {
  state.lightMode = !state.lightMode;
  document.body.classList.toggle('light-mode', state.lightMode);
  const btn = document.getElementById('theme-btn');
  btn.setAttribute('aria-pressed', state.lightMode ? 'true' : 'false');
  btn.textContent = state.lightMode ? 'DARK' : 'LIGHT';
  renderCanvas();
}

function toggleControlsPopover() {
  const pop = document.getElementById('controls-popover');
  const btn = document.getElementById('controls-toggle-btn');
  const isHidden = pop.classList.toggle('hidden');
  btn.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
}

/* ==========================================================================
   4. RULE (ZAMANSAL KURALLAR [04], OLASILIK KAPILARI [05] VE LABİRENT ÜRETİMİ)
   Görsel çizimden tamamen bağımsız oyun fiziği, zaman ve olasılık kuralları.
   ========================================================================== */

// Prosedürel, Yatay Simetrik ve Çıkmaz Sokaksız 25x17 Labirent Üretici
function ruleGenerateRandomMazeGrid() {
  const rows = DESIGN.GRID_ROWS; // 17
  const cols = DESIGN.GRID_COLS; // 25
  const grid = Array.from({ length: rows }, () => Array(cols).fill(1));

  // Yardımcı: Sol yarıda (c) açılan koridoru sağ yarıya (24 - c) simetrik kopyala
  const setSymmetric = (r, c, val) => {
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      grid[r][c] = val;
      grid[r][cols - 1 - c] = val;
    }
  };

  // 1. Dış Çerçeve Koridoru (Satır 1, Satır 15, Sütun 1, Sütun 23)
  for (let c = 1; c <= 12; c++) {
    setSymmetric(1, c, 0);
    setSymmetric(15, c, 0);
  }
  for (let r = 1; r <= 15; r++) {
    setSymmetric(r, 1, 0);
  }

  // 2. Oyuncu Başlangıç Koridoru (Satır 13) ve Üst Simetriği (Satır 3)
  for (let c = 1; c <= 12; c++) {
    setSymmetric(3, c, 0);
    setSymmetric(13, c, 0);
  }

  // 3. Sol/Sağ Işınlanma Tüneli (Satır 8) ve Merkez Krono-Çekirdek Çevresi
  for (let c = 0; c <= 12; c++) {
    setSymmetric(8, c, 0);
  }
  for (let r = 5; r <= 11; r++) {
    setSymmetric(r, 9, 0);
    if (r === 5 || r === 11) {
      for (let c = 7; c <= 12; c++) setSymmetric(r, c, 0);
    }
  }

  // 4. Sol yarıdaki tek sayılı düğümler arasında rastgele koridor bağlantıları aç
  const oddRows = [1, 3, 5, 7, 9, 11, 13, 15];
  const oddCols = [1, 3, 5, 7, 9, 11];

  oddRows.forEach((r) => {
    oddCols.forEach((c) => {
      setSymmetric(r, c, 0);
      // Rastgele sağa veya aşağıya koridor aç
      if (c < 11 && Math.random() < 0.62) {
        setSymmetric(r, c + 1, 0);
      }
      if (r < 15 && Math.random() < 0.58) {
        setSymmetric(r + 1, c, 0);
      }
    });
  });

  // 5. Çıkmaz sokakları (dead-ends) temizle: Her açık karenin en az 2 açık komşusu olsun
  const dirs = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 }
  ];
  for (let pass = 0; pass < 3; pass++) {
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c <= 12; c++) {
        if (grid[r][c] === 1) continue;
        const openNeighbors = dirs.filter(d => grid[r + d.dr][c + d.dc] !== 1);
        if (openNeighbors.length < 2) {
          const closedNeighbors = dirs.filter(d => {
            const nr = r + d.dr;
            const nc = c + d.dc;
            return nr >= 1 && nr < rows - 1 && nc >= 1 && nc <= 12 && grid[nr][nc] === 1;
          });
          if (closedNeighbors.length > 0) {
            const pick = closedNeighbors[Math.floor(Math.random() * closedNeighbors.length)];
            setSymmetric(r + pick.dr, c + pick.dc, 0);
          }
        }
      }
    }
  }

  // 6. Merkez Krono-Çekirdek (Düşman Doğma Alanı: 2) ve Bağlantılarını Sabitle
  setSymmetric(6, 12, 0);
  setSymmetric(7, 12, 2);
  setSymmetric(7, 11, 0);
  setSymmetric(8, 11, 2);
  setSymmetric(8, 12, 2);
  setSymmetric(9, 12, 2);
  setSymmetric(9, 11, 0);

  // Oyuncu başlangıç karesi (12, 13) ve komşularının açık olduğundan emin ol
  setSymmetric(13, 12, 0);
  setSymmetric(13, 11, 0);
  setSymmetric(15, 12, 0);

  // 7. Simetrik 4 Çift (Toplam 8 Adet) Faz Kapısı (4x Faz A = 3, 4x Faz B = 4) Yerleştir
  const gateCandidates = [];
  for (let r = 2; r <= 14; r++) {
    for (let c = 2; c <= 10; c++) {
      if (grid[r][c] !== 0) continue;
      if (r === 8 && c <= 3) continue; // Tünel ağzını kapatma
      // Yatay veya dikey koridor boğazı mı?
      const horizChoke = (grid[r][c - 1] === 0 && grid[r][c + 1] === 0 && grid[r - 1][c] === 1 && grid[r + 1][c] === 1);
      const vertChoke = (grid[r - 1][c] === 0 && grid[r + 1][c] === 0 && grid[r][c - 1] === 1 && grid[r][c + 1] === 1);
      if (horizChoke || vertChoke) {
        gateCandidates.push({ r, c });
      }
    }
  }

  // Adayları karıştır ve birbirine çok yakın olmayan 4 simetrik çift seç
  for (let i = gateCandidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = gateCandidates[i];
    gateCandidates[i] = gateCandidates[j];
    gateCandidates[j] = temp;
  }

  const chosenPairs = [];
  for (let i = 0; i < gateCandidates.length && chosenPairs.length < 4; i++) {
    const cand = gateCandidates[i];
    const tooClose = chosenPairs.some(p => Math.hypot(p.r - cand.r, p.c - cand.c) < 3.2);
    if (!tooClose) {
      chosenPairs.push(cand);
    }
  }

  // Eğer 4 çift bulunamadıysa yedek koordinatları kullan
  const fallbackPairs = [
    { r: 3, c: 6 },
    { r: 5, c: 9 },
    { r: 11, c: 9 },
    { r: 13, c: 9 }
  ];
  for (let i = 0; i < fallbackPairs.length && chosenPairs.length < 4; i++) {
    const fb = fallbackPairs[i];
    setSymmetric(fb.r, fb.c, 0);
    chosenPairs.push(fb);
  }

  // İlk 2 çifte Faz A (3), sonraki 2 çifte Faz B (4) ata
  chosenPairs.forEach((pair, idx) => {
    const gateCode = idx < 2 ? 3 : 4;
    setSymmetric(pair.r, pair.c, gateCode);
  });

  return grid;
}

// Haritadaki Faz Kapılarını DESIGN.GATE_COUNT (0..16, çift步) değerine göre simetrik ve dengeli (A/B) yerleştirir
function ruleInitPhaseGates() {
  const rows = DESIGN.GRID_ROWS;
  const cols = DESIGN.GRID_COLS;
  const baseGrid = state.baseMazeGrid || MAZE_PRESETS.CLASSIC;

  // 1. Temel haritayı kopyala; tüm 3 ve 4 kapı hücrelerini önce 0 (açık koridor) yap
  //    ve sol yarıdaki (c < 12) orijinal kapı çiftlerini öncelikli aday olarak kaydet
  const candidatePairs = [];
  const hasCandidate = (r, c) => candidatePairs.some(p => p.r === r && p.c === c);

  DESIGN.MAZE_LAYOUT = baseGrid.map((rowArr, r) =>
    rowArr.map((cell, c) => {
      if (cell === 3 || cell === 4) {
        if (c < 12 && !hasCandidate(r, c)) {
          candidatePairs.push({ r, c });
        }
        return 0;
      }
      return cell;
    })
  );

  // 2. GATE_COUNT > 8 seçildiğinde kullanılmak üzere ek simetrik koridor boğazlarını (choke points) tara
  const isSafeGateTile = (r, c) => {
    if (r < 1 || r >= rows - 1 || c < 1 || c >= 12) return false;
    if (DESIGN.MAZE_LAYOUT[r][c] !== 0 || DESIGN.MAZE_LAYOUT[r][cols - 1 - c] !== 0) return false;
    if (r === 8 && c <= 2) return false; // Sol/sağ tünel girişlerini kapatma
    if (r === 13 && c >= 10) return false; // Oyuncu başlangıç (12,13) çevresini kapatma
    if (r >= 6 && r <= 10 && c >= 10) return false; // Merkez Krono-Çekirdek ağzını kapatma
    if ((r === 1 || r === 15) && (c <= 2)) return false; // Köşe düşman doğma noktalarını kapatma
    return true;
  };

  // Önce dar koridor boğazlarını (choke points) ekle
  for (let r = 1; r < rows - 1 && candidatePairs.length < 12; r++) {
    for (let c = 1; c < 12 && candidatePairs.length < 12; c++) {
      if (!isSafeGateTile(r, c) || hasCandidate(r, c)) continue;
      const g = DESIGN.MAZE_LAYOUT;
      const horizChoke = (g[r][c - 1] === 0 && g[r][c + 1] === 0 && g[r - 1][c] === 1 && g[r + 1][c] === 1);
      const vertChoke = (g[r - 1][c] === 0 && g[r + 1][c] === 0 && g[r][c - 1] === 1 && g[r][c + 1] === 1);
      const farEnough = candidatePairs.every(p => Math.hypot(p.r - r, p.c - c) >= 2.2);
      if ((horizChoke || vertChoke) && farEnough) {
        candidatePairs.push({ r, c });
      }
    }
  }

  // Hâlâ 8 çiftten (16 kapıdan) az aday varsa güvenli simetrik koridor kareleriyle tamamla
  for (let r = 2; r < rows - 2 && candidatePairs.length < 8; r++) {
    for (let c = 2; c < 11 && candidatePairs.length < 8; c++) {
      if (!isSafeGateTile(r, c) || hasCandidate(r, c)) continue;
      const farEnough = candidatePairs.every(p => Math.hypot(p.r - r, p.c - c) >= 2.0);
      if (farEnough) {
        candidatePairs.push({ r, c });
      }
    }
  }

  // 3. İstenen çift sayısı kadar (DESIGN.GATE_COUNT / 2) simetrik kapıyı (yarı Faz A = 3, yarı Faz B = 4) yerleştir
  const pairCount = Math.max(0, Math.min(8, Math.floor(DESIGN.GATE_COUNT / 2)));
  for (let idx = 0; idx < pairCount && idx < candidatePairs.length; idx++) {
    const { r, c } = candidatePairs[idx];
    const mirrorC = cols - 1 - c;

    if (pairCount % 2 === 1 && idx === pairCount - 1) {
      // Tek sayılı çiftlerde (örn. 2, 6, 10, 14 kapı) son çiftin solu Faz A (3), sağı Faz B (4) olur; böylece A ve B sayısı eşit kalır
      DESIGN.MAZE_LAYOUT[r][c] = 3;
      DESIGN.MAZE_LAYOUT[r][mirrorC] = 4;
    } else {
      const gateCode = (idx % 2 === 0) ? 3 : 4;
      DESIGN.MAZE_LAYOUT[r][c] = gateCode;
      DESIGN.MAZE_LAYOUT[r][mirrorC] = gateCode;
    }
  }

  // 4. Aktif kapı nesnelerini oluştur
  state.gates = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = DESIGN.MAZE_LAYOUT[r][c];
      if (cell === 3 || cell === 4) {
        state.gates.push({
          col: c,
          row: r,
          group: cell === 3 ? 'A' : 'B',
          status: 'OPEN',
          echoDecayRatio: 0
        });
      }
    }
  }
  ruleUpdatePhaseGates();
}

// [PREMISE 04 × PREMISE 05 ETKİLEŞİM KURALI]
function ruleUpdatePhaseGates() {
  const now = state.elapsedTime;
  const pCol = state.player.col;
  const pRow = state.player.row;

  state.gates.forEach((gate) => {
    const prevStatus = gate.status;

    let newestEchoTime = -1;
    if (DESIGN.TRAIL_SEALS_GATES) {
      for (let i = state.trailHistory.length - 1; i >= 0; i--) {
        const tr = state.trailHistory[i];
        if (tr.col === gate.col && tr.row === gate.row) {
          newestEchoTime = tr.timestamp;
          break;
        }
      }
    }

    const playerStandingOnGate = (pCol === gate.col && pRow === gate.row);

    if (newestEchoTime >= 0 && !playerStandingOnGate) {
      const age = now - newestEchoTime;
      const ratio = Math.max(0, 1 - (age / DESIGN.TRAIL_MEMORY_SEC));
      if (ratio > 0) {
        gate.status = 'ECHO_SEALED';
        gate.echoDecayRatio = ratio;
        if (prevStatus === 'OPEN') {
          playSynthCue('ECHO_SEAL');
          setHighlightedStage('RULE', `gate (${gate.col},${gate.row}) echo-sealed ⛌`);
        }
        return;
      }
    }

    gate.echoDecayRatio = 0;
    const isPhaseOpen = (gate.group === state.gatePhasePolarity);
    gate.status = isPhaseOpen ? 'OPEN' : 'PULSE_SEALED';
  });
}

function ruleGetGateAt(col, row) {
  for (let i = 0; i < state.gates.length; i++) {
    const g = state.gates[i];
    if (g.col === col && g.row === row) return g;
  }
  return null;
}

// [PREMISE 05: POSSIBILITY] Belirtilen (col, row) karesinden geçişin mümkün olup olmadığını denetler
function ruleIsWalkableTile(col, row, fromCol = -1, fromRow = -1) {
  if (row === 8 && (col < 0 || col >= DESIGN.GRID_COLS)) {
    return true;
  }
  if (row < 0 || row >= DESIGN.GRID_ROWS || col < 0 || col >= DESIGN.GRID_COLS) {
    return false;
  }
  const cell = DESIGN.MAZE_LAYOUT[row][col];
  if (cell === 1) return false;

  if ((cell === 3 || cell === 4) && !(fromCol === col && fromRow === row)) {
    const gate = ruleGetGateAt(col, row);
    if (gate && gate.status !== 'OPEN') {
      return false;
    }
  }
  return true;
}

// Oyunu başlangıç (t = 0) durumuna sıfırlar
function ruleResetGameState() {
  state.status = 'READY';
  state.elapsedTime = 0;
  state.shiftClock = 0;
  state.score = 0;
  state.shiftsCompleted = 0;
  state.speedMultiplier = 1.0;
  state.lastFrameTimestamp = null;
  state.shiftFlashTimer = 0;
  state.gatePhasePolarity = 'A';
  state.phaseFlipCooldown = 0;

  state.player.col = 12;
  state.player.row = 13;
  state.player.x = 12.5;
  state.player.y = 13.5;
  state.player.dirX = 0;
  state.player.dirY = 0;
  state.player.queuedDirX = 0;
  state.player.queuedDirY = 0;
  state.player.facingAngle = Math.PI;

  state.trailHistory = [];
  state.lastTrailRecordTime = -1;

  ruleInitPhaseGates();

  state.enemies = [];
  const startCount = DESIGN.INITIAL_ENEMIES;
  for (let i = 0; i < startCount; i++) {
    ruleSpawnEnemy(i, false);
  }
}

// Yeni bir Sentinel (düşman) oluşturur
function ruleSpawnEnemy(indexSeed, withWarningDelay = true) {
  const archetype = DESIGN.ENEMY_ARCHETYPES[indexSeed % DESIGN.ENEMY_ARCHETYPES.length];
  let chosenSpawn = DESIGN.SPAWN_POINTS[0];
  let maxDist = -1;

  for (let i = 0; i < DESIGN.SPAWN_POINTS.length; i++) {
    const sp = DESIGN.SPAWN_POINTS[(indexSeed + i) % DESIGN.SPAWN_POINTS.length];
    const dist = Math.hypot((sp.col + 0.5) - state.player.x, (sp.row + 0.5) - state.player.y);
    if (dist > maxDist) {
      maxDist = dist;
      chosenSpawn = sp;
    }
  }

  const dirs = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 }
  ];
  const validDirs = dirs.filter(d => ruleIsWalkableTile(chosenSpawn.col + d.dx, chosenSpawn.row + d.dy, chosenSpawn.col, chosenSpawn.row));
  const initialDir = validDirs.length > 0 ? validDirs[indexSeed % validDirs.length] : { dx: 1, dy: 0 };

  state.enemies.push({
    id: Date.now() + Math.random(),
    x: chosenSpawn.col + 0.5,
    y: chosenSpawn.row + 0.5,
    dirX: initialDir.dx,
    dirY: initialDir.dy,
    archetype: archetype,
    spawnTimer: withWarningDelay ? DESIGN.SPAWN_WARNING_SEC : 0,
    lastDecisionCol: chosenSpawn.col,
    lastDecisionRow: chosenSpawn.row
  });
}

// Her karede (frame) çalışan ana zaman ve olasılık simülasyonu
function ruleUpdateSimulation(dt) {
  if (state.status !== 'RUNNING') return;

  state.elapsedTime += dt;
  state.shiftClock += dt;
  state.score = Math.floor(state.elapsedTime * DESIGN.SCORE_PER_SECOND);

  if (state.shiftFlashTimer > 0) {
    state.shiftFlashTimer = Math.max(0, state.shiftFlashTimer - dt);
  }
  if (state.phaseFlipCooldown > 0) {
    state.phaseFlipCooldown = Math.max(0, state.phaseFlipCooldown - dt);
  }

  const targetShifts = Math.floor(state.shiftClock / DESIGN.ESCALATION_INTERVAL_SEC);
  if (targetShifts > state.shiftsCompleted) {
    state.shiftsCompleted = targetShifts;
    ruleTriggerTemporalShift();
  }

  ruleMovePlayer(dt);
  ruleUpdateTrailMemory();
  ruleUpdatePhaseGates();

  ruleMoveEnemies(dt);
  ruleCheckCollisions();
}

// Zaman Kırılması (Her ESCALATION_INTERVAL_SEC saniyede bir çalışır)
function ruleTriggerTemporalShift() {
  state.shiftFlashTimer = 0.9;
  state.gatePhasePolarity = (state.gatePhasePolarity === 'A') ? 'B' : 'A';
  ruleUpdatePhaseGates();

  if (DESIGN.GAME_MODE === 'SPAWN') {
    if (state.enemies.length < DESIGN.MAX_ENEMIES) {
      ruleSpawnEnemy(state.enemies.length, true);
      playSynthCue('SHIFT_SPAWN');
      setHighlightedStage('RULE', `+1 sentinel & Phase ${state.gatePhasePolarity}`);
      announceScreenReader(`Temporal shift! Phase ${state.gatePhasePolarity} gates opened and a new Sentinel is materializing.`);
    } else {
      playSynthCue('SHIFT_SPEED');
      setHighlightedStage('RULE', `Phase ${state.gatePhasePolarity} flipped`);
    }
  } else {
    state.speedMultiplier = Number((state.speedMultiplier + DESIGN.ENEMY_SPEED_STEP).toFixed(2));
    playSynthCue('SHIFT_SPEED');
    setHighlightedStage('RULE', `speed ${state.speedMultiplier.toFixed(2)}x & Phase ${state.gatePhasePolarity}`);
    announceScreenReader(`Temporal shift! Phase ${state.gatePhasePolarity} gates opened and Sentinel speed increased to ${state.speedMultiplier.toFixed(2)}x.`);
  }
}

// Oyuncunun 2D koridorlardaki akıcı ve kavşak-tamponlu hareketi
function ruleMovePlayer(dt) {
  const p = state.player;
  const speed = DESIGN.PLAYER_SPEED;
  const stepDist = speed * dt;

  const currentCol = Math.floor(p.x);
  const currentRow = Math.floor(p.y);
  const centerX = currentCol + 0.5;
  const centerY = currentRow + 0.5;

  if (p.queuedDirX !== 0 || p.queuedDirY !== 0) {
    if (p.queuedDirX === -p.dirX && p.queuedDirY === -p.dirY && (p.dirX !== 0 || p.dirY !== 0)) {
      p.dirX = p.queuedDirX;
      p.dirY = p.queuedDirY;
      p.facingAngle = Math.atan2(p.dirY, p.dirX);
      p.queuedDirX = 0;
      p.queuedDirY = 0;
    } else if (ruleIsWalkableTile(currentCol + p.queuedDirX, currentRow + p.queuedDirY, currentCol, currentRow)) {
      const distToCenter = Math.hypot(p.x - centerX, p.y - centerY);
      if (distToCenter <= Math.max(0.3, stepDist * 1.8)) {
        p.x = centerX;
        p.y = centerY;
        p.dirX = p.queuedDirX;
        p.dirY = p.queuedDirY;
        p.facingAngle = Math.atan2(p.dirY, p.dirX);
        p.queuedDirX = 0;
        p.queuedDirY = 0;
      }
    }
  }

  let nextX = p.x + p.dirX * stepDist;
  let nextY = p.y + p.dirY * stepDist;

  if (currentRow === 8) {
    if (nextX < 0.1) nextX = DESIGN.GRID_COLS - 0.15;
    else if (nextX > DESIGN.GRID_COLS - 0.1) nextX = 0.15;
  }

  if (p.dirX !== 0) {
    const targetCol = currentCol + p.dirX;
    if (!ruleIsWalkableTile(targetCol, currentRow, currentCol, currentRow)) {
      if ((p.dirX > 0 && nextX > centerX) || (p.dirX < 0 && nextX < centerX)) {
        nextX = centerX;
        p.dirX = 0;
      }
    }
    nextY = centerY;
  } else if (p.dirY !== 0) {
    const targetRow = currentRow + p.dirY;
    if (!ruleIsWalkableTile(currentCol, targetRow, currentCol, currentRow)) {
      if ((p.dirY > 0 && nextY > centerY) || (p.dirY < 0 && nextY < centerY)) {
        nextY = centerY;
        p.dirY = 0;
      }
    }
    nextX = centerX;
  }

  p.x = nextX;
  p.y = nextY;
  p.col = Math.floor(p.x);
  p.row = Math.floor(p.y);
}

// Oyuncunun geçmiş hareket izini (Echo Trail) kaydeder ve süresi dolanları siler
function ruleUpdateTrailMemory() {
  const now = state.elapsedTime;
  const p = state.player;

  const isMoving = (p.dirX !== 0 || p.dirY !== 0);
  const cellType = DESIGN.MAZE_LAYOUT[p.row] ? DESIGN.MAZE_LAYOUT[p.row][p.col] : 0;
  const onPhaseGate = (cellType === 3 || cellType === 4);

  if ((isMoving && now - state.lastTrailRecordTime >= 0.12) || (onPhaseGate && now - state.lastTrailRecordTime >= 0.04)) {
    state.trailHistory.push({
      col: p.col,
      row: p.row,
      x: p.x,
      y: p.y,
      timestamp: now
    });
    state.lastTrailRecordTime = now;
  }

  const cutoff = now - DESIGN.TRAIL_MEMORY_SEC;
  while (state.trailHistory.length > 0 && state.trailHistory[0].timestamp < cutoff) {
    state.trailHistory.shift();
  }
}

// Düşmanların (Sentinels) akıcı kavşak kararları ve açık kapılardan geçerek oyuncuyu takip etmesi
function ruleMoveEnemies(dt) {
  const currentEnemySpeed = DESIGN.BASE_ENEMY_SPEED * state.speedMultiplier;

  state.enemies.forEach((enemy) => {
    if (enemy.spawnTimer > 0) {
      enemy.spawnTimer = Math.max(0, enemy.spawnTimer - dt);
      return;
    }

    const stepDist = currentEnemySpeed * dt;
    const col = Math.floor(enemy.x);
    const row = Math.floor(enemy.y);
    const centerX = col + 0.5;
    const centerY = row + 0.5;

    let crossedCenter = false;
    let overshoot = 0;

    if (enemy.dirX > 0 && enemy.x <= centerX && enemy.x + stepDist >= centerX) {
      crossedCenter = true;
      overshoot = (enemy.x + stepDist) - centerX;
    } else if (enemy.dirX < 0 && enemy.x >= centerX && enemy.x - stepDist <= centerX) {
      crossedCenter = true;
      overshoot = centerX - (enemy.x - stepDist);
    } else if (enemy.dirY > 0 && enemy.y <= centerY && enemy.y + stepDist >= centerY) {
      crossedCenter = true;
      overshoot = (enemy.y + stepDist) - centerY;
    } else if (enemy.dirY < 0 && enemy.y >= centerY && enemy.y - stepDist <= centerY) {
      crossedCenter = true;
      overshoot = centerY - (enemy.y - stepDist);
    }

    const blockedAhead = !ruleIsWalkableTile(col + enemy.dirX, row + enemy.dirY, col, row);
    const isNewDecisionTile = (col !== enemy.lastDecisionCol || row !== enemy.lastDecisionRow);

    if ((crossedCenter && isNewDecisionTile) || blockedAhead) {
      enemy.x = centerX;
      enemy.y = centerY;
      enemy.lastDecisionCol = col;
      enemy.lastDecisionRow = row;

      const chosen = rulePickEnemyDirection(col, row, enemy);
      enemy.dirX = chosen.dx;
      enemy.dirY = chosen.dy;

      enemy.x += enemy.dirX * Math.min(stepDist, overshoot);
      enemy.y += enemy.dirY * Math.min(stepDist, overshoot);
    } else {
      enemy.x += enemy.dirX * stepDist;
      enemy.y += enemy.dirY * stepDist;
    }

    if (row === 8) {
      if (enemy.x < 0.1) enemy.x = DESIGN.GRID_COLS - 0.15;
      else if (enemy.x > DESIGN.GRID_COLS - 0.1) enemy.x = 0.15;
    }
  });
}

// Düşmanın kavşakta açık koridorları (Possibility) ve oyuncunun geçmiş izini (Temporality) tartarak yön seçmesi
function rulePickEnemyDirection(col, row, enemy) {
  const dirs = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 }
  ];

  let candidates = dirs.filter(d => ruleIsWalkableTile(col + d.dx, row + d.dy, col, row));
  const nonReverse = candidates.filter(d => !(d.dx === -enemy.dirX && d.dy === -enemy.dirY));
  if (nonReverse.length > 0) {
    candidates = nonReverse;
  }

  if (candidates.length === 0) {
    return { dx: -enemy.dirX, dy: -enemy.dirY };
  }

  let bestDir = candidates[0];
  let bestScore = -Infinity;

  candidates.forEach((d) => {
    const nCol = col + d.dx;
    const nRow = row + d.dy;

    const distToPlayer = Math.hypot((nCol + 0.5) - state.player.x, (nRow + 0.5) - state.player.y);
    let score = -distToPlayer;

    for (let i = state.trailHistory.length - 1; i >= 0; i--) {
      const tr = state.trailHistory[i];
      if (tr.col === nCol && tr.row === nRow) {
        const age = state.elapsedTime - tr.timestamp;
        const freshness = Math.max(0, 1 - (age / DESIGN.TRAIL_MEMORY_SEC));
        score += freshness * 5.0 * enemy.archetype.trailWeight;
        break;
      }
    }

    score += Math.sin(state.elapsedTime * 1.5 + enemy.id + d.dx * 2) * 0.35;

    if (score > bestScore) {
      bestScore = score;
      bestDir = d;
    }
  });

  return bestDir;
}

// Oyuncu ile aktif düşmanlar arasındaki çarpışmayı denetler
function ruleCheckCollisions() {
  for (let i = 0; i < state.enemies.length; i++) {
    const e = state.enemies[i];
    if (e.spawnTimer > 0) continue;

    const dist = Math.hypot(e.x - state.player.x, e.y - state.player.y);
    if (dist < 0.56) {
      state.status = 'GAME_OVER';
      state.lastFrameTimestamp = null;
      playSynthCue('GAME_OVER');
      setHighlightedStage('OUTPUT', `caught at ${state.elapsedTime.toFixed(1)}s`);
      renderHUD();
      announceScreenReader(`Run ended! Caught by ${e.archetype.label} after ${state.elapsedTime.toFixed(1)} seconds. Final score: ${state.score}.`);
      break;
    }
  }
}

/* ==========================================================================
   WEB AUDIO SENTEZLEYİCİ (SESLİ ZAMAN VE KAPI GERİ BİLDİRİMİ)
   ========================================================================== */
function ensureAudioContext() {
  try {
    if (!state.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) state.audioCtx = new AudioCtx();
    }
    if (state.audioCtx && state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
  } catch (err) {
    // Tarayıcı ses politikası engellerse sessizce devam et
  }
}

function playSynthCue(type) {
  if (!state.audioCtx) return;
  try {
    const now = state.audioCtx.currentTime;
    const osc = state.audioCtx.createOscillator();
    const gain = state.audioCtx.createGain();

    osc.connect(gain);
    gain.connect(state.audioCtx.destination);

    if (type === 'SHIFT_SPAWN') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.22);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'SHIFT_SPEED') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(784, now + 0.2);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.26);
    } else if (type === 'ECHO_SEAL') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(290, now + 0.14);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.11, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === 'GATE_FLIP') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(392, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.18);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'GAME_OVER') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.45);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  } catch (err) {
    // Ses hatası oyunu durdurmaz
  }
}

/* ==========================================================================
   5. OUTPUT (GÖRSEL SUNUM, 2D CANVAS ÇİZİMİ VE HUD GÜNCELLEMESİ)
   ========================================================================== */

function setHighlightedStage(stageName, customText) {
  state.activeStage = stageName;
  if (customText && stageName === 'INPUT') {
    state.lastInputLabel = customText;
  } else if (customText && stageName === 'RULE') {
    state.lastRuleLabel = customText;
  }
}

function getGateCounts() {
  let openCount = 0;
  let echoSealedCount = 0;
  state.gates.forEach((g) => {
    if (g.status === 'OPEN') openCount++;
    else if (g.status === 'ECHO_SEALED') echoSealedCount++;
  });
  return { openCount, echoSealedCount, total: state.gates.length };
}

// Üst telemetri kartlarını, sekmeleri, labirent seçicileri ve durum katmanını günceller
function renderHUD() {
  const timeEl = document.getElementById('telemetry-time');
  const scoreEl = document.getElementById('telemetry-score');
  const shiftEl = document.getElementById('telemetry-shift');
  const enemiesEl = document.getElementById('telemetry-enemies');
  const speedEl = document.getElementById('telemetry-speed');
  const gatesEl = document.getElementById('telemetry-gates');

  if (timeEl) timeEl.textContent = `${state.elapsedTime.toFixed(1)}s`;
  if (scoreEl) scoreEl.textContent = String(state.score);

  const interval = DESIGN.ESCALATION_INTERVAL_SEC;
  const elapsedInCycle = state.shiftClock % interval;
  const remainingToShift = Math.max(0, interval - elapsedInCycle);
  if (shiftEl) shiftEl.textContent = `${remainingToShift.toFixed(1)}s`;
  if (enemiesEl) enemiesEl.textContent = String(state.enemies.length);
  if (speedEl) speedEl.textContent = `${state.speedMultiplier.toFixed(2)}x`;

  const counts = getGateCounts();
  if (gatesEl) {
    gatesEl.textContent = `${counts.openCount}/${counts.total}`;
  }

  // Shift Pulse İlerleme Çubuğu
  const shiftFill = document.getElementById('shift-bar-fill');
  if (shiftFill) {
    const progressPct = Math.min(100, (elapsedInCycle / interval) * 100);
    shiftFill.style.width = `${progressPct}%`;
  }

  // Play / Pause Butonu
  const playBtn = document.getElementById('play-pause-btn');
  const playIcon = document.getElementById('play-pause-icon');
  const playText = document.getElementById('play-pause-text');
  if (playBtn) {
    playBtn.classList.toggle('running', state.status === 'RUNNING');
    if (playIcon) playIcon.textContent = state.status === 'RUNNING' ? '⏸' : '▶';
    if (playText) playText.textContent = state.status === 'RUNNING' ? 'PAUSE' : (state.status === 'PAUSED' ? 'RESUME' : 'START');
  }

  // Labirent Seçici Senkronizasyonu (Toolbar + Overlay + CODE)
  const toolbarMazeSelect = document.getElementById('toolbar-maze-select');
  if (toolbarMazeSelect) toolbarMazeSelect.value = DESIGN.MAZE_PRESET;

  const codeMazeSelect = document.getElementById('select-code-maze');
  if (codeMazeSelect) codeMazeSelect.value = DESIGN.MAZE_PRESET;

  const overlayMazeBtns = document.querySelectorAll('.overlay-maze-btn[data-maze]');
  overlayMazeBtns.forEach((btn) => {
    const m = btn.getAttribute('data-maze');
    btn.classList.toggle('active', DESIGN.MAZE_PRESET === m);
  });
  const overlayRandomBtn = document.getElementById('overlay-random-maze-btn');
  if (overlayRandomBtn) {
    overlayRandomBtn.classList.toggle('active', DESIGN.MAZE_PRESET === 'RANDOM');
  }

  // Manuel Kapı Çevirme (FLIP GATES / F) Butonu ve Mobil D-Pad Aksiyon Butonları
  const onCooldown = state.phaseFlipCooldown > 0;
  const flipBtn = document.getElementById('phase-flip-btn');
  const flipText = document.getElementById('phase-flip-text');
  if (flipBtn && flipText) {
    flipBtn.classList.toggle('cooldown', onCooldown);
    flipText.textContent = onCooldown
      ? `FLIP GATES (F) · ${state.phaseFlipCooldown.toFixed(1)}s`
      : `FLIP GATES (F) · PHASE ${state.gatePhasePolarity}`;
  }

  const dpadFlipBtn = document.getElementById('dpad-flip-btn');
  const dpadFlipLabel = document.getElementById('dpad-flip-label');
  if (dpadFlipBtn && dpadFlipLabel) {
    dpadFlipBtn.classList.toggle('cooldown', onCooldown);
    dpadFlipLabel.textContent = onCooldown
      ? `FLIP · ${state.phaseFlipCooldown.toFixed(1)}s`
      : `FLIP GATES · PHASE ${state.gatePhasePolarity}`;
  }

  const dpadPauseBtn = document.getElementById('dpad-pause-btn');
  if (dpadPauseBtn) {
    dpadPauseBtn.textContent = state.status === 'RUNNING' ? '⏸ PAUSE' : (state.status === 'PAUSED' ? '▶ RESUME' : '▶ START');
  }

  // Mod Butonları
  const spawnBtn = document.getElementById('mode-spawn-btn');
  const speedBtn = document.getElementById('mode-speed-btn');
  if (spawnBtn) spawnBtn.classList.toggle('active', DESIGN.GAME_MODE === 'SPAWN');
  if (speedBtn) speedBtn.classList.toggle('active', DESIGN.GAME_MODE === 'SPEED');

  // Durum Rozeti, Mod Başlığı ve Faz Kapısı Rozeti
  const badgeEl = document.getElementById('game-state-badge');
  if (badgeEl) {
    badgeEl.textContent = state.status === 'RUNNING'
      ? `ACTIVE (${DESIGN.MAZE_PRESET}) — ARROWS STEER · F FLIPS GATES`
      : (state.status === 'PAUSED' ? 'PAUSED — PRESS SPACE TO RESUME' : (state.status === 'GAME_OVER' ? 'RUN ENDED — PICK MAZE OR PRESS START' : `READY (${DESIGN.MAZE_PRESET}) — PRESS ARROWS OR START`));
  }

  const modeBanner = document.getElementById('active-mode-banner');
  if (modeBanner) {
    modeBanner.textContent = DESIGN.GAME_MODE === 'SPAWN'
      ? `Mode 1 (Spawn): +1 Sentinel & Gate Flip every ${DESIGN.ESCALATION_INTERVAL_SEC}s`
      : `Mode 2 (Speed): +${Math.round(DESIGN.ENEMY_SPEED_STEP * 100)}% speed & Gate Flip every ${DESIGN.ESCALATION_INTERVAL_SEC}s`;
  }

  const phaseBadge = document.getElementById('gate-phase-badge');
  if (phaseBadge) {
    phaseBadge.textContent = `PHASE ${state.gatePhasePolarity} OPEN (${counts.openCount}/${counts.total}) · ECHO-SEALED: ${counts.echoSealedCount} (⛌)`;
  }

  // Sekme görünürlüğü
  const tabs = [
    { id: 'PLAY', btn: 'tab-play', panel: 'panel-play' },
    { id: 'CODE', btn: 'tab-code', panel: 'panel-code' },
    { id: 'NOTES', btn: 'tab-notes', panel: 'panel-notes' }
  ];
  tabs.forEach((t) => {
    const btn = document.getElementById(t.btn);
    const panel = document.getElementById(t.panel);
    const active = state.activeTab === t.id;
    if (btn) {
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    }
    if (panel) panel.classList.toggle('hidden', !active);
  });

  // Ekran üstü D-Pad görünürlüğü
  const dpad = document.getElementById('onscreen-dpad');
  if (dpad) {
    dpad.classList.toggle('hidden', !DESIGN.ALLOW_ON_SCREEN_DPAD);
  }

  // Başlangıç / Oyun Bitti Overlay Katmanı
  const overlay = document.getElementById('canvas-overlay');
  const overlayTitle = document.getElementById('overlay-title');
  const overlayDesc = document.getElementById('overlay-desc');
  const overlayBtn = document.getElementById('overlay-start-btn');

  if (overlay && overlayTitle && overlayDesc && overlayBtn) {
    if (state.status === 'READY') {
      overlay.classList.remove('hidden');
      overlayTitle.textContent = 'CHRONO LABYRINTH · 04 × 05';
      overlayDesc.innerHTML = `Steer with <strong>Arrow Keys (↑ ↓ ← →)</strong> or press <strong>F</strong> to invert <strong>Phase Gates</strong>. Crossing an open gate (<strong>⊶</strong>) leaves a ${DESIGN.TRAIL_MEMORY_SEC}s <strong>Echo Trail</strong> that seals the doorway behind you (<strong>⛌</strong>)—blocking Sentinels, but cutting off your own retreat.`;
      overlayBtn.textContent = '▶ START RUN (SPACE / ARROWS)';
    } else if (state.status === 'GAME_OVER') {
      overlay.classList.remove('hidden');
      overlayTitle.textContent = `CAUGHT AT ${state.elapsedTime.toFixed(1)}s`;
      overlayDesc.innerHTML = `Score: <strong>${state.score} pts</strong> · Map: <strong>${DESIGN.MAZE_PRESET}</strong> · Sentinels: <strong>${state.enemies.length}</strong> · Speed: <strong>${state.speedMultiplier.toFixed(2)}x</strong>. Choose a new maze layout below or play again:`;
      overlayBtn.textContent = '↻ PLAY AGAIN (SPACE / R)';
    } else {
      overlay.classList.add('hidden');
    }
  }

  renderIrsoStrip(counts);
}

function renderIrsoStrip(counts) {
  const cells = {
    INPUT: document.getElementById('irso-input'),
    RULE: document.getElementById('irso-rule'),
    STATE: document.getElementById('irso-state'),
    OUTPUT: document.getElementById('irso-output')
  };
  Object.keys(cells).forEach((k) => {
    if (cells[k]) cells[k].classList.toggle('active-stage', state.activeStage === k);
  });

  const inputVal = document.getElementById('irso-input-val');
  const ruleVal = document.getElementById('irso-rule-val');
  const stateVal = document.getElementById('irso-state-val');
  const outputVal = document.getElementById('irso-output-val');

  if (inputVal) inputVal.textContent = state.lastInputLabel;
  if (ruleVal) ruleVal.textContent = state.lastRuleLabel;
  if (stateVal) {
    stateVal.textContent = `t:${state.elapsedTime.toFixed(1)}s · gates:${counts.openCount}/${counts.total}`;
  }
  if (outputVal) {
    outputVal.textContent = `map:${DESIGN.MAZE_PRESET.toLowerCase()} · lock:${counts.echoSealedCount}`;
  }
}

function renderLiveCodeBlock() {
  const pre = document.getElementById('live-code-pre');
  if (!pre) return;
  pre.textContent = `const DESIGN = {
  // PREMISE 05: POSSIBILITY (Maze Topology & Phase Gates)
  MAZE_PRESET: "${DESIGN.MAZE_PRESET}",              // "CLASSIC" | "RINGS" | "CROSSROADS" | "RANDOM"
  GATE_COUNT: ${DESIGN.GATE_COUNT},                     // ${DESIGN.GATE_COUNT / 2} Phase A (⊶A) + ${DESIGN.GATE_COUNT / 2} Phase B (╬B) gates
  TRAIL_SEALS_GATES: ${DESIGN.TRAIL_SEALS_GATES},          // Crossing an open gate Echo-Seals (⛌) it
  PHASE_FLIP_COOLDOWN_SEC: ${DESIGN.PHASE_FLIP_COOLDOWN_SEC},       // Cooldown for manual F-key gate inversion
  PHASE_FLIP_TIME_COST_SEC: ${DESIGN.PHASE_FLIP_TIME_COST_SEC.toFixed(1)},    // Shift clock penalty when flipping gates

  // PREMISE 04: TEMPORALITY (Time & Memory)
  GAME_MODE: "${DESIGN.GAME_MODE}",                 // "SPAWN" (Mode 1) or "SPEED" (Mode 2)
  ESCALATION_INTERVAL_SEC: ${DESIGN.ESCALATION_INTERVAL_SEC},      // Shift pulse & gate flip every ${DESIGN.ESCALATION_INTERVAL_SEC}s
  TRAIL_MEMORY_SEC: ${DESIGN.TRAIL_MEMORY_SEC},              // Echo Trail & Echo-Sealed gate lock duration
  INITIAL_ENEMIES: ${DESIGN.INITIAL_ENEMIES},               // Sentinels at t = 0.0s
  MAX_ENEMIES: ${DESIGN.MAX_ENEMIES},                   // Mode 1 upper cap
  ENEMY_SPEED_STEP: ${DESIGN.ENEMY_SPEED_STEP.toFixed(2)},           // Mode 2 velocity boost per shift
  PLAYER_SPEED: ${DESIGN.PLAYER_SPEED.toFixed(1)}                 // Weaver movement speed (tiles/sec)
};`;
}

// 2D Kuşbakışı Labirenti, Faz Kapılarını (Possibility), Geçmiş İzleri (Echo Trail), Oyuncuyu ve Sentinelleri Çizer
function renderCanvas() {
  const canvas = document.getElementById('maze-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const ts = DESIGN.TILE_SIZE;
  const isLight = state.lightMode;

  // 1. Arka Planı Temizle
  ctx.fillStyle = isLight ? '#e8f0f6' : '#070c12';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Labirent Koridorlarını ve Duvarlarını Çiz
  for (let r = 0; r < DESIGN.GRID_ROWS; r++) {
    for (let c = 0; c < DESIGN.GRID_COLS; c++) {
      const cell = DESIGN.MAZE_LAYOUT[r][c];
      const x = c * ts;
      const y = r * ts;

      if (cell === 1) {
        ctx.fillStyle = isLight ? '#cbd8e3' : '#121f2d';
        ctx.fillRect(x + 1, y + 1, ts - 2, ts - 2);
        ctx.strokeStyle = isLight ? '#98b0c4' : '#233b54';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 2, y + 2, ts - 4, ts - 4);
      } else if (cell === 2) {
        ctx.fillStyle = isLight ? 'rgba(2, 132, 199, 0.14)' : 'rgba(34, 211, 238, 0.09)';
        ctx.fillRect(x, y, ts, ts);
      } else if (cell === 0) {
        ctx.fillStyle = isLight ? 'rgba(16, 32, 48, 0.12)' : 'rgba(142, 164, 184, 0.1)';
        ctx.beginPath();
        ctx.arc(x + ts / 2, y + ts / 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 3. Premise 05 (Possibility): Faz Kapılarını (OPEN ⊶, PULSE_SEALED ╬, ECHO_SEALED ⛌) Çiz
  state.gates.forEach((gate) => {
    const gx = gate.col * ts;
    const gy = gate.row * ts;
    const cx = gx + ts / 2;
    const cy = gy + ts / 2;

    ctx.save();
    if (gate.status === 'OPEN') {
      ctx.fillStyle = isLight ? 'rgba(5, 150, 105, 0.12)' : 'rgba(16, 185, 129, 0.14)';
      ctx.fillRect(gx + 2, gy + 2, ts - 4, ts - 4);

      ctx.strokeStyle = isLight ? '#059669' : '#10b981';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(gx + 3, gy + 3, ts - 6, ts - 6);
      ctx.setLineDash([]);

      ctx.fillStyle = isLight ? '#065f46' : '#6ee7b7';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`⊶${gate.group}`, cx, cy);
    } else if (gate.status === 'PULSE_SEALED') {
      ctx.fillStyle = isLight ? 'rgba(217, 119, 6, 0.22)' : 'rgba(245, 158, 11, 0.22)';
      ctx.fillRect(gx + 2, gy + 2, ts - 4, ts - 4);

      ctx.strokeStyle = isLight ? '#d97706' : '#f59e0b';
      ctx.lineWidth = 2.2;
      ctx.strokeRect(gx + 3, gy + 3, ts - 6, ts - 6);

      ctx.beginPath();
      ctx.moveTo(gx + 4, cy - 4);
      ctx.lineTo(gx + ts - 4, cy - 4);
      ctx.moveTo(gx + 4, cy + 4);
      ctx.lineTo(gx + ts - 4, cy + 4);
      ctx.stroke();

      ctx.fillStyle = isLight ? '#92400e' : '#fde68a';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`╬${gate.group}`, cx, cy);
    } else if (gate.status === 'ECHO_SEALED') {
      ctx.fillStyle = isLight ? 'rgba(225, 29, 72, 0.24)' : 'rgba(244, 63, 94, 0.26)';
      ctx.fillRect(gx + 2, gy + 2, ts - 4, ts - 4);

      ctx.strokeStyle = isLight ? '#e11d48' : '#f43f5e';
      ctx.lineWidth = 2.4;
      ctx.strokeRect(gx + 3, gy + 3, ts - 6, ts - 6);

      ctx.beginPath();
      ctx.arc(cx, cy, ts * 0.36, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * gate.echoDecayRatio));
      ctx.stroke();

      ctx.fillStyle = isLight ? '#881337' : '#ffe4e6';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⛌', cx, cy);
    }
    ctx.restore();
  });

  // Zaman Kırılması (Shift Pulse) Dalga Efekti
  if (state.shiftFlashTimer > 0) {
    const coreX = 12.5 * ts;
    const coreY = 8.5 * ts;
    const progress = 1 - (state.shiftFlashTimer / 0.9);
    const radius = 25 + progress * 380;
    ctx.save();
    ctx.strokeStyle = isLight
      ? `rgba(2, 132, 199, ${state.shiftFlashTimer * 0.6})`
      : `rgba(34, 211, 238, ${state.shiftFlashTimer * 0.6})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(coreX, coreY, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 4. Geçmiş Hareket İzi Hafızasını (Temporal Echo Trail) Çiz
  for (let i = 0; i < state.trailHistory.length; i++) {
    const tr = state.trailHistory[i];
    const age = state.elapsedTime - tr.timestamp;
    const alpha = Math.max(0.08, 1 - (age / DESIGN.TRAIL_MEMORY_SEC));
    const radius = 2.5 + alpha * 4.5;

    ctx.save();
    ctx.fillStyle = isLight
      ? `rgba(2, 132, 199, ${alpha * 0.55})`
      : `rgba(34, 211, 238, ${alpha * 0.6})`;
    ctx.beginPath();
    ctx.arc(tr.x * ts, tr.y * ts, radius, 0, Math.PI * 2);
    ctx.fill();

    if (i % 2 === 0) {
      ctx.strokeStyle = isLight
        ? `rgba(16, 32, 48, ${alpha * 0.45})`
        : `rgba(232, 241, 248, ${alpha * 0.45})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(tr.x * ts, tr.y * ts, radius + 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 5. Düşmanları (Sentinels: ▲ Stalker, ⬢ Drifter, ✳ Wraith) Çiz
  state.enemies.forEach((enemy) => {
    const ex = enemy.x * ts;
    const ey = enemy.y * ts;
    const color = isLight ? enemy.archetype.colorLight : enemy.archetype.colorDark;

    ctx.save();
    ctx.translate(ex, ey);

    if (enemy.spawnTimer > 0) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, ts * 0.45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (state.speedMultiplier > 1.05) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, ts * 0.44, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = color;
    ctx.strokeStyle = isLight ? '#102030' : '#ffffff';
    ctx.lineWidth = 1.8;

    const r = ts * 0.36;
    ctx.beginPath();
    if (enemy.archetype.type === 'STALKER') {
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.92, r * 0.8);
      ctx.lineTo(-r * 0.92, r * 0.8);
      ctx.closePath();
    } else if (enemy.archetype.type === 'DRIFTER') {
      for (let k = 0; k < 6; k++) {
        const ang = (k * Math.PI) / 3 - Math.PI / 6;
        const px = Math.cos(ang) * r;
        const py = Math.sin(ang) * r;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else {
      for (let k = 0; k < 8; k++) {
        const ang = (k * Math.PI) / 4;
        const rad = k % 2 === 0 ? r * 1.08 : r * 0.52;
        const px = Math.cos(ang) * rad;
        const py = Math.sin(ang) * rad;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(enemy.dirX * 3, enemy.dirY * 3, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });

  // 6. Oyuncuyu ("The Weaver" — Elmas/Karo Beacon ◆) Çiz
  const px = state.player.x * ts;
  const py = state.player.y * ts;
  const pr = ts * 0.38;

  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(state.player.facingAngle);

  ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.45)' : 'rgba(34, 211, 238, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, pr + 4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = isLight ? '#0284c7' : '#22d3ee';
  ctx.strokeStyle = isLight ? '#102030' : '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pr * 1.15, 0);
  ctx.lineTo(0, pr * 0.85);
  ctx.lineTo(-pr * 0.9, 0);
  ctx.lineTo(0, -pr * 0.85);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(2, 0, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function announceScreenReader(text) {
  const el = document.getElementById('sr-announcer');
  if (el) el.textContent = text;
}

// Ana Animasyon Döngüsü (requestAnimationFrame)
function animationLoop(timestamp) {
  if (state.status === 'RUNNING') {
    if (state.lastFrameTimestamp === null) {
      state.lastFrameTimestamp = timestamp;
    }
    const dt = Math.min(0.05, (timestamp - state.lastFrameTimestamp) / 1000);
    state.lastFrameTimestamp = timestamp;

    ruleUpdateSimulation(dt);
    renderHUD();
  }

  renderCanvas();
  requestAnimationFrame(animationLoop);
}

// Güvenli Uygulama Başlatıcı
function bootApp() {
  detectMobileOrTouchDefaults();
  ruleResetGameState();
  initInput();
  syncDpadVisibilityAndButton();
  renderHUD();
  renderLiveCodeBlock();
  renderCanvas();
  requestAnimationFrame(animationLoop);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}
