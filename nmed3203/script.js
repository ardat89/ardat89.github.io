/* ==========================================================================
   THE GIFT BENCH - JAVASCRIPT SİSTEMİ (script.js)
   
   Bu dosya, kullanıcı isteğindeki mimari prensiplere uygun olarak 5 ana bölüme
   ayrılmıştır:
   1. DESIGN: Ayarlanabilir parametreler ve kural tanımları
   2. STATE: Bellek ve uygulama durum modeli
   3. INPUT: Kullanıcı girdileri, klavye/dokunma yönetimi
   4. RULE: Karşılıklılık (Reciprocity) mantığı ve saf kural fonksiyonları
   5. OUTPUT: Görsel sunum, animasyon ve ekran okuyucu güncellemeleri
   ========================================================================== */

'use strict';

/* ==========================================================================
   1. DESIGN (TASARIM VE KURAL AYARLARI)
   Her ayarın davranış üzerindeki etkisi Türkçe açıklamalarla belirtilmiştir.
   ========================================================================== */
const DESIGN = {
  // Zamanlama Ayarları (Milisaniye cinsinden)
  // Bu değerler sistemin tepki vermeden önce ne kadar "düşüneceğini" belirler.
  // Gecikme süresi, karşı tarafın tereddüt veya heves durumunu hissettirir.
  TIMINGS: {
    DELIBERATION_ATTUNED: 800,    // Uyumlu durumda dengeli düşünme süresi
    DELIBERATION_GENEROUS: 500,   // Cömert durumda hızlı, hevesli karşılık süresi
    DELIBERATION_GUARDED: 1400,   // Temkinli durumda belirgin tereddüt süresi
    DELIBERATION_WITHDRAWN: 2000, // Çekingen/kırgın durumda uzun sessizlik/bekleme
    ANIMATION_PLACEMENT: 350,     // Hediyenin tepsiye konulma animasyon süresi
    NARRATIVE_FADE: 300           // Açıklama metninin geçiş yumuşaklığı
  },

  // Bellek / Tarihçe Derinliği
  // Sistemin kararlarında geriye dönük kaç hamleyi hatırlayacağını belirler.
  HISTORY_LIMIT: 3,

  // Karşı Tarafın Postür / Durum Tanımları
  // Her postür bir sembol, metin etiketi ve görsel sınıf taşır. Renk tek başına kullanılmaz.
  POSTURES: {
    ATTUNED: {
      id: 'attuned',
      label: 'Attuned',
      icon: '⚖️',
      cssClass: 'posture-attuned',
      description: 'Listening quietly and matching your pace with balanced presence.'
    },
    GENEROUS: {
      id: 'generous',
      label: 'Generous',
      icon: '🌿',
      cssClass: 'posture-generous',
      description: 'Open, warm, and actively offering delicate gifts without hesitation.'
    },
    GUARDED: {
      id: 'guarded',
      label: 'Guarded',
      icon: '🛡️',
      cssClass: 'posture-guarded',
      description: 'Hesitant and watchful. Weighing earlier turns before committing.'
    },
    WITHDRAWN: {
      id: 'withdrawn',
      label: 'Withdrawn',
      icon: '🌑',
      cssClass: 'posture-withdrawn',
      description: 'Distant and cautious. Withholding gifts until trust is restored.'
    }
  },

  // Token (Değişim Simgeleri) Tanımları
  // Her token'ın bir ilişkisel değeri (valence) vardır:
  // +1: Cömert / Uzanan | 0: Dengeli / Tarafsız | -1: Sakınan / Geri Çekilen
  TOKENS: {
    stone: {
      id: 'stone',
      label: 'Stone',
      icon: '🪨',
      valence: 0,
      description: 'Grounded & enduring'
    },
    flower: {
      id: 'flower',
      label: 'Flower',
      icon: '🌸',
      valence: 1,
      description: 'Delicate & generous'
    },
    paper: {
      id: 'paper',
      label: 'Paper',
      icon: '📜',
      valence: 0,
      description: 'Folded & conversational'
    },
    empty: {
      id: 'empty',
      label: 'Empty Hand',
      icon: '🤲',
      valence: -1,
      description: 'Withholding or receptive'
    }
  },

  // Karşılaştırma Kuralları (A/B Test Modları)
  // RULE_A: Son 3 turun ağırlıklı ortalaması (Reciprocity with lingering memory)
  // RULE_B: Sadece son yapılan tek hamleye tepki (Immediate Tit-for-Tat reflex)
  RULES: {
    HISTORY_AWARE: {
      id: 'HISTORY_AWARE',
      name: 'Lagged Memory (N=3)',
      summary: 'Earlier turns linger. Past withholding delays and tempers future generosity.'
    },
    TIT_FOR_TAT: {
      id: 'TIT_FOR_TAT',
      name: 'Immediate Reflex (N=1)',
      summary: 'Only the immediate previous turn matters. No memory of earlier turns.'
    }
  }
};

/* ==========================================================================
   2. STATE (DURUM MODELİ)
   Uygulamanın o andaki durumunu saklayan merkezi nesne.
   ========================================================================== */
const state = {
  posture: DESIGN.POSTURES.ATTUNED.id,
  history: [],                   // [{ turn, participantToken, systemToken, posture, timestamp }]
  activeRule: DESIGN.RULES.HISTORY_AWARE.id,
  status: 'IDLE',                // 'IDLE' | 'DELIBERATING' | 'ANIMATING' | 'PAUSED'
  currentParticipantToken: null,
  currentSystemToken: null,
  isPaused: false,
  turnCount: 0
};

/* ==========================================================================
   3. INPUT (GİRDİ VE ETKİLEŞİM YÖNETİMİ)
   Fare, dokunmatik ve klavye girdilerini yakalar, geçerliliğini denetler.
   ========================================================================== */
function initInputHandlers() {
  // Token butonları (Fare ve Dokunmatik)
  const tokenButtons = document.querySelectorAll('.token-button');
  tokenButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tokenId = btn.getAttribute('data-token');
      handleParticipantAction(tokenId);
    });
  });

  // Sıfırlama Butonu
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', handleReset);
  }

  // Duraklat / Devam Et Butonu
  const pauseBtn = document.getElementById('pause-btn');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', handleTogglePause);
  }

  // Kural Değiştirme Butonu (A/B Karşılaştırma)
  const toggleRuleBtn = document.getElementById('toggle-rule-btn');
  if (toggleRuleBtn) {
    toggleRuleBtn.addEventListener('click', handleToggleRule);
  }

  // Klavye Kontrolleri (Erişilebilirlik ve Hızlı Giriş)
  window.addEventListener('keydown', (event) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    const key = event.key.toLowerCase();

    // 1-4: Token seçimi
    if (key === '1') handleParticipantAction('stone');
    else if (key === '2') handleParticipantAction('flower');
    else if (key === '3') handleParticipantAction('paper');
    else if (key === '4') handleParticipantAction('empty');
    // R: Sıfırlama (Reset)
    else if (key === 'r') handleReset();
    // P: Duraklatma (Pause)
    else if (key === 'p') handleTogglePause();
    // C: Kural Karşılaştırma (Comparison Toggle)
    else if (key === 'c') handleToggleRule();
    // Escape: Tereddütte veya boşta iptal/vazgeçme geri bildirimi
    else if (key === 'escape') handleCancelInput();
  });
}

// Katılımcı teklif yaptığında çağrılan girdi yönlendiricisi
function handleParticipantAction(tokenId) {
  if (state.status !== 'IDLE' || state.isPaused) {
    return;
  }

  const selectedToken = DESIGN.TOKENS[tokenId];
  if (!selectedToken) return;

  state.status = 'DELIBERATING';
  state.currentParticipantToken = selectedToken;
  state.currentSystemToken = null;
  state.turnCount += 1;

  renderState();

  const deliberationTime = ruleGetDeliberationDuration(state.posture, state.activeRule);
  const plannedSystemToken = ruleDecideSystemToken(selectedToken, state.history, state.posture, state.activeRule);

  setTimeout(() => {
    if (state.isPaused) return;

    state.status = 'ANIMATING';
    state.currentSystemToken = plannedSystemToken;
    renderState();

    setTimeout(() => {
      const exchangeRecord = {
        turn: state.turnCount,
        participantToken: selectedToken,
        systemToken: plannedSystemToken,
        postureAtTurn: state.posture,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      
      state.history.push(exchangeRecord);
      if (state.history.length > DESIGN.HISTORY_LIMIT) {
        state.history.shift();
      }

      const nextPosture = ruleCalculateNextPosture(state.history, state.activeRule);
      state.posture = nextPosture;

      state.status = 'IDLE';
      renderState();

      announceExchangeOutcome(exchangeRecord, nextPosture);
    }, DESIGN.TIMINGS.ANIMATION_PLACEMENT);

  }, deliberationTime);
}

// Sıfırlama Eylemi: Tüm belleği ve postürü nötr başlangıç durumuna döndürür
function handleReset() {
  state.posture = DESIGN.POSTURES.ATTUNED.id;
  state.history = [];
  state.status = 'IDLE';
  state.currentParticipantToken = null;
  state.currentSystemToken = null;
  state.turnCount = 0;
  
  renderState();
  announceToScreenReader('The bench has been reset. History cleared, presence attuned.');
}

// Duraklatma / Devam Etme Eylemi
function handleTogglePause() {
  state.isPaused = !state.isPaused;
  if (state.isPaused) {
    state.status = 'PAUSED';
    announceToScreenReader('Interaction paused.');
  } else {
    state.status = 'IDLE';
    announceToScreenReader('Interaction resumed.');
  }
  renderState();
}

// Karşılaştırma Kuralını Değiştirme Eylemi (A/B Testi)
function handleToggleRule() {
  if (state.status !== 'IDLE') return;

  state.activeRule = (state.activeRule === DESIGN.RULES.HISTORY_AWARE.id)
    ? DESIGN.RULES.TIT_FOR_TAT.id
    : DESIGN.RULES.HISTORY_AWARE.id;

  renderState();
  const ruleObj = DESIGN.RULES[state.activeRule];
  announceToScreenReader(`Switched rule to: ${ruleObj.name}`);
}

// Escape ile seçim iptali / temizleme
function handleCancelInput() {
  if (state.status === 'IDLE') {
    state.currentParticipantToken = null;
    state.currentSystemToken = null;
    renderState();
    announceToScreenReader('Current tray cleared.');
  }
}

/* ==========================================================================
   4. RULE (KARŞILIKLILIK MANTIĞI VE SAF KURAL FONKSİYONLARI)
   Bu bölüm tamamen DOM bağımsızdır; girdi ve tarihçeyi alır, yeni postür
   ve karşı yanıtı saf mantıkla hesaplar.
   ========================================================================== */

function ruleGetDeliberationDuration(postureId, ruleMode) {
  if (ruleMode === DESIGN.RULES.TIT_FOR_TAT.id) {
    return 600;
  }

  switch (postureId) {
    case DESIGN.POSTURES.GENEROUS.id:
      return DESIGN.TIMINGS.DELIBERATION_GENEROUS;
    case DESIGN.POSTURES.GUARDED.id:
      return DESIGN.TIMINGS.DELIBERATION_GUARDED;
    case DESIGN.POSTURES.WITHDRAWN.id:
      return DESIGN.TIMINGS.DELIBERATION_WITHDRAWN;
    case DESIGN.POSTURES.ATTUNED.id:
    default:
      return DESIGN.TIMINGS.DELIBERATION_ATTUNED;
  }
}

function ruleDecideSystemToken(participantToken, history, currentPosture, ruleMode) {
  if (ruleMode === DESIGN.RULES.TIT_FOR_TAT.id) {
    if (participantToken.id === 'flower') return DESIGN.TOKENS.flower;
    if (participantToken.id === 'stone') return DESIGN.TOKENS.stone;
    if (participantToken.id === 'paper') return DESIGN.TOKENS.paper;
    return DESIGN.TOKENS.empty;
  }

  if (currentPosture === DESIGN.POSTURES.WITHDRAWN.id) {
    return (participantToken.id === 'flower') ? DESIGN.TOKENS.stone : DESIGN.TOKENS.empty;
  }

  if (currentPosture === DESIGN.POSTURES.GUARDED.id) {
    if (participantToken.id === 'flower') return DESIGN.TOKENS.paper;
    if (participantToken.id === 'empty') return DESIGN.TOKENS.empty;
    return DESIGN.TOKENS.stone;
  }

  if (currentPosture === DESIGN.POSTURES.GENEROUS.id) {
    if (participantToken.id === 'empty') return DESIGN.TOKENS.paper;
    return DESIGN.TOKENS.flower;
  }

  if (participantToken.id === 'flower') return DESIGN.TOKENS.flower;
  if (participantToken.id === 'empty') return DESIGN.TOKENS.empty;
  if (participantToken.id === 'stone') return DESIGN.TOKENS.stone;
  return DESIGN.TOKENS.paper;
}

function ruleCalculateNextPosture(history, ruleMode) {
  if (history.length === 0) {
    return DESIGN.POSTURES.ATTUNED.id;
  }

  if (ruleMode === DESIGN.RULES.TIT_FOR_TAT.id) {
    const lastTurn = history[history.length - 1];
    const val = lastTurn.participantToken.valence;
    if (val > 0) return DESIGN.POSTURES.GENEROUS.id;
    if (val < 0) return DESIGN.POSTURES.WITHDRAWN.id;
    return DESIGN.POSTURES.ATTUNED.id;
  }

  const weights = [0.2, 0.3, 0.5];
  const relevantHistory = history.slice(-3);
  let weightedScore = 0;
  let totalWeight = 0;

  for (let i = 0; i < relevantHistory.length; i++) {
    const w = weights[weights.length - relevantHistory.length + i];
    const val = relevantHistory[i].participantToken.valence;
    weightedScore += val * w;
    totalWeight += w;
  }

  const normalizedScore = totalWeight > 0 ? (weightedScore / totalWeight) : 0;

  if (normalizedScore >= 0.45) {
    return DESIGN.POSTURES.GENEROUS.id;
  } else if (normalizedScore <= -0.45) {
    const recentEmpties = relevantHistory.filter(h => h.participantToken.id === 'empty').length;
    if (recentEmpties >= 2) {
      return DESIGN.POSTURES.WITHDRAWN.id;
    }
    return DESIGN.POSTURES.GUARDED.id;
  } else {
    return DESIGN.POSTURES.ATTUNED.id;
  }
}

/* ==========================================================================
   5. OUTPUT (GÖRSEL SUNUM, RENDERING VE ERİŞİLEBİLİRLİK)
   ========================================================================== */
function renderState() {
  renderHeaderControls();
  renderCounterpartPresence();
  renderSharedTray();
  renderTokenButtons();
  renderHistoryLedger();
  renderNarrativeBox();
}

function renderHeaderControls() {
  const currentRuleObj = DESIGN.RULES[state.activeRule];
  const ruleTag = document.getElementById('current-rule-tag');
  if (ruleTag) {
    ruleTag.textContent = currentRuleObj.name;
  }

  const pauseBtn = document.getElementById('pause-btn');
  if (pauseBtn) {
    pauseBtn.textContent = state.isPaused ? '▶ Resume' : '⏸ Pause';
    pauseBtn.setAttribute('aria-pressed', state.isPaused ? 'true' : 'false');
  }
}

function renderCounterpartPresence() {
  const presenceEl = document.getElementById('counterpart-presence');
  const postureNameEl = document.getElementById('counterpart-posture-name');
  const postureIconEl = document.getElementById('counterpart-posture-icon');
  const pulseEl = document.getElementById('deliberation-pulse');

  const postureObj = DESIGN.POSTURES[state.posture.toUpperCase()] || DESIGN.POSTURES.ATTUNED;

  if (presenceEl) {
    Object.values(DESIGN.POSTURES).forEach(p => presenceEl.classList.remove(p.cssClass));
    presenceEl.classList.add(postureObj.cssClass);
  }

  if (postureNameEl) postureNameEl.textContent = postureObj.label;
  if (postureIconEl) postureIconEl.textContent = postureObj.icon;

  if (pulseEl) {
    if (state.status === 'DELIBERATING') {
      pulseEl.classList.add('active');
      pulseEl.setAttribute('aria-hidden', 'false');
    } else {
      pulseEl.classList.remove('active');
      pulseEl.setAttribute('aria-hidden', 'true');
    }
  }
}

function renderSharedTray() {
  const participantSlot = document.getElementById('participant-tray-slot');
  const systemSlot = document.getElementById('system-tray-slot');

  if (participantSlot) {
    if (state.currentParticipantToken) {
      participantSlot.classList.add('has-token');
      participantSlot.innerHTML = `
        <span class="token-icon" aria-hidden="true">${state.currentParticipantToken.icon}</span>
        <span class="token-name">${state.currentParticipantToken.label}</span>
      `;
    } else {
      participantSlot.classList.remove('has-token');
      participantSlot.innerHTML = `<span class="slot-heading">Your gift</span>`;
    }
  }

  if (systemSlot) {
    if (state.currentSystemToken) {
      systemSlot.classList.add('has-token');
      systemSlot.innerHTML = `
        <span class="token-icon" aria-hidden="true">${state.currentSystemToken.icon}</span>
        <span class="token-name">${state.currentSystemToken.label}</span>
      `;
    } else {
      systemSlot.classList.remove('has-token');
      systemSlot.innerHTML = `
        <span class="slot-heading">${state.status === 'DELIBERATING' ? 'Considering...' : 'Awaiting'}</span>
      `;
    }
  }
}

function renderTokenButtons() {
  const isBusy = (state.status !== 'IDLE' || state.isPaused);
  const tokenButtons = document.querySelectorAll('.token-button');
  
  tokenButtons.forEach(btn => {
    btn.disabled = isBusy;
    if (isBusy) {
      btn.setAttribute('aria-disabled', 'true');
    } else {
      btn.removeAttribute('aria-disabled');
    }
  });
}

function renderHistoryLedger() {
  const slotsContainer = document.getElementById('history-slots-container');
  if (!slotsContainer) return;

  slotsContainer.innerHTML = '';

  for (let i = 0; i < DESIGN.HISTORY_LIMIT; i++) {
    const cardEl = document.createElement('div');
    cardEl.className = 'history-card';

    const turnData = state.history[i];
    if (turnData) {
      const postureObj = DESIGN.POSTURES[turnData.postureAtTurn.toUpperCase()] || DESIGN.POSTURES.ATTUNED;
      cardEl.innerHTML = `
        <div class="history-card-header">
          <span>Turn #${turnData.turn}</span>
          <span>${postureObj.icon} ${postureObj.label}</span>
        </div>
        <div class="history-card-body">
          <span title="You offered ${turnData.participantToken.label}">${turnData.participantToken.icon} ${turnData.participantToken.label}</span>
          <span class="exchange-arrow" aria-hidden="true">⇄</span>
          <span title="Counterpart returned ${turnData.systemToken.label}">${turnData.systemToken.icon} ${turnData.systemToken.label}</span>
        </div>
      `;
    } else {
      cardEl.innerHTML = `
        <div class="history-card-header">
          <span>Turn Slot ${i + 1}</span>
          <span>—</span>
        </div>
        <div class="history-card-empty">Awaiting exchange...</div>
      `;
    }
    slotsContainer.appendChild(cardEl);
  }
}

function renderNarrativeBox() {
  const box = document.getElementById('narrative-text');
  if (!box) return;

  const postureObj = DESIGN.POSTURES[state.posture.toUpperCase()] || DESIGN.POSTURES.ATTUNED;
  const ruleObj = DESIGN.RULES[state.activeRule];

  if (state.isPaused) {
    box.textContent = 'Interaction paused. Press [P] or click Resume to continue dialogue.';
    return;
  }

  if (state.status === 'DELIBERATING') {
    box.textContent = `The counterpart is pausing (${postureObj.label.toLowerCase()} posture), reflecting on recent exchanges before offering a reply...`;
    return;
  }

  if (state.turnCount === 0) {
    box.textContent = `The tray is empty. Offer an initial gift (Stone, Flower, Paper, or Empty Hand) to initiate the dialogue under ${ruleObj.name}.`;
    return;
  }

  const lastExchange = state.history[state.history.length - 1];
  if (lastExchange) {
    box.textContent = `Turn #${lastExchange.turn}: You offered a ${lastExchange.participantToken.label}; the counterpart answered with a ${lastExchange.systemToken.label}. Presence is currently ${postureObj.label}: "${postureObj.description}"`;
  }
}

function announceToScreenReader(message) {
  const liveRegion = document.getElementById('screen-reader-announcer');
  if (liveRegion) {
    liveRegion.textContent = message;
  }
}

function announceExchangeOutcome(record, newPosture) {
  const postureObj = DESIGN.POSTURES[newPosture.toUpperCase()] || DESIGN.POSTURES.ATTUNED;
  const announcement = `Turn ${record.turn} complete. You gave ${record.participantToken.label}. Counterpart replied with ${record.systemToken.label}. Counterpart posture is now ${postureObj.label}.`;
  announceToScreenReader(announcement);
}

window.addEventListener('DOMContentLoaded', () => {
  initInputHandlers();
  renderState();
});