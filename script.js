/* ===========================
   Application State & DOM References
   =========================== */
let currentData = null;
let availableSets = [];
let currentSetId = 1;

const tiles = document.querySelectorAll('.tile');
const title = document.getElementById('title');
const subtitle = document.getElementById('subtitle');
const main = document.getElementById('main');
const btnReturn = document.getElementById('btnReturn');
const setSelector = document.getElementById('setSelector');
const loadNewSetBtn = document.getElementById('loadNewSet');
const loadingIndicator = document.getElementById('loadingIndicator');

const scoreCard = document.getElementById('scoreCard');
const scoreNumber = document.getElementById('scoreNumber');
const scoreText = document.getElementById('scoreText');
const answersList = document.getElementById('answersList');
const revealBtn = document.getElementById('revealBtn');
const closeScore = document.getElementById('closeScore');

let current = null;
let mcState = { idx: 0, answers: [] };
let gapState = { answers: [], idx: 0 };
let wordState = { answers: [], idx: 0 };
let transState = { answers: [], idx: 0 };

/* ===========================
   Data Loading Functions
   =========================== */
async function loadAvailableSets() {
  try {
    const response = await fetch('data/sets-index.json');
    if (!response.ok) throw new Error('Cannot load sets index');
    
    const setsIndex = await response.json();
    availableSets = setsIndex.sets;
    
    // Populate selector
    setSelector.innerHTML = '';
    availableSets.forEach(set => {
      const option = document.createElement('option');
      option.value = set.id;
      option.textContent = `Set ${set.id} - ${set.name}`;
      setSelector.appendChild(option);
    });
    
    // Load first set by default
    await loadDataSet(1);
  } catch (error) {
    console.error('Error loading sets:', error);
    // Fallback to embedded data if external files fail
    loadFallbackData();
  }
}

async function loadDataSet(setId) {
  try {
    showLoading(true);
    const setInfo = availableSets.find(s => s.id === setId);
    if (!setInfo) throw new Error(`Set ${setId} not found`);
    
    const response = await fetch(`data/${setInfo.filename}`);
    if (!response.ok) throw new Error(`Cannot load set ${setId}`);
    
    currentData = await response.json();
    currentSetId = setId;
    setSelector.value = setId;
    
    // Reset all exercise states
    resetExerciseStates();
    
    showLoading(false);
    console.log(`Loaded Set ${setId}: ${setInfo.name}`);
    
  } catch (error) {
    console.error('Error loading data set:', error);
    showLoading(false);
    
    // Fallback to embedded data
    if (!currentData) {
      loadFallbackData();
    }
  }
}

function showLoading(show) {
  loadingIndicator.style.display = show ? 'block' : 'none';
}

function resetExerciseStates() {
  if (currentData) {
    mcState = { idx: 0, answers: Array(currentData.multipleChoice?.length || 0).fill(null) };
    gapState = { answers: Array(currentData.openCloze?.answers?.length || 0).fill(''), idx: 0 };
    wordState = { answers: Array(currentData.wordFormation?.length || 0).fill(''), idx: 0 };
    transState = { answers: Array(currentData.sentenceTransformation?.length || 0).fill(''), idx: 0 };
  }
}

function loadFallbackData() {
  // Embedded fallback data (original content)
  currentData = {
    multipleChoice: [
      { s:"Although the proposal sounded promising, the board remained ___ about its chances of success.", opts:["optimistic","skeptical","convinced","receptive"], c:1, ex:"'Skeptical' collocates naturally and contrasts with 'sounded promising'." },
      { s:"The researcher's findings appear ___ with earlier studies, which strengthens the theory.", opts:["incompatible","congruent","discrepant","irrelevant"], c:1, ex:"'Congruent with' = in agreement; correct collocation." },
      { s:"The minister's comments were widely ___ as an attempt to deflect criticism.", opts:["interpreted","discouraged","rehearsed","intimated"], c:0, ex:"'Interpreted as' is the required collocation." },
      { s:"If we had known about the delay, we ___ our schedule accordingly.", opts:["would adjust","adjusted","would have adjusted","had adjusted"], c:2, ex:"Third conditional: 'we would have adjusted'." },
      { s:"The committee produced a ___ appraisal of the project's economic viability.", opts:["balanced","partial","favourable","simplistic"], c:0, ex:"'Balanced appraisal' is idiomatic." },
      { s:"She conducted the interview ___ a manner that immediately put the candidate at ease.", opts:["in","into","with","by"], c:0, ex:"'In a manner' (or 'in a way') is correct." },
      { s:"The company has committed to reducing emissions, ___ it may require major investment.", opts:["unless","although","whereas","provided"], c:1, ex:"'Although it may require...' expresses concession." },
      { s:"The manager demanded an explanation, but the employee remained ___.", opts:["contrite","adamant","resigned","eloquent"], c:1, ex:"'Remained adamant' = persisted in the position." },
      { s:"There has been a ___ shift in public attitudes towards remote working.", opts:["marginal","substantial","fractional","superficial"], c:1, ex:"'Substantial shift' is the expected collocation." },
      { s:"Having been warned repeatedly, the team ___ responsibility for the oversight.", opts:["accepted","refused","repudiated","evaded"], c:0, ex:"'Accepted responsibility' collocates naturally." },
      { s:"The theory, while elegant, fails to ___ the empirical evidence now available.", opts:["accommodate","exclude","repel","postpone"], c:0, ex:"'Accommodate the evidence' fits." },
      { s:"There is a danger that short-term politics will influence decisions to the ___ of long-term sustainability.", opts:["benefit","detriment","advantage","rest"], c:1, ex:"'To the detriment of' is idiomatic." }
    ],
    openCloze: {
      text: "For many urban planners, the pandemic was not so much a crisis ___ an opportunity to rethink city life. Commuting patterns changed, and businesses that had ___ relied on office footfall suddenly found their models unsustainable. In response, municipal authorities began to experiment ___ adaptive measures, such as reallocating street space for pedestrians and cyclists. Residents, ___, welcomed quieter streets but also expressed concern about local services. Had planners consulted communities earlier, the rollout might have proceeded ___ friction. Nonetheless, the experience showed that where public will exists, change can happen far more swiftly ___ previously supposed. The challenge now is to consolidate the gains without undermining economic recovery, ___ the temptation to revert to old habits remains strong.",
      answers: [
        ["as","rather than"],
        ["previously","formerly","earlier"],
        ["with"],
        ["however","meanwhile"],
        ["without"],
        ["than"],
        ["where","since"]
      ],
      explanations: [
        "Contrast: 'not so much ... as' intended.",
        "Past perfect context: 'had previously relied'.",
        "'Experiment with' is the correct collocation.",
        "'However' fits the contrast.",
        "'Without friction' = with no friction.",
        "'... more swiftly than previously supposed'.",
        "'Where the temptation remains strong' (conditional)."
      ]
    },
    wordFormation: [
      { sentence:"The new policy led to a dramatic ____ in commuter numbers.", base:"REDUCE", answers:["reduction"], explain:"Noun 'reduction'." },
      { sentence:"Her response was marked by admirable ____ even under pressure.", base:"CALM", answers:["calmness"], explain:"'Calmness' (noun) fits formal register." },
      { sentence:"Their ____ approach to deadlines resulted in missed milestones.", base:"LAX", answers:["laxity"], explain:"'Laxity' (formal noun)." },
      { sentence:"This measure is unlikely to be ____ while funding is restricted.", base:"IMPLEMENT", answers:["implemented"], explain:"Past participle 'implemented'." },
      { sentence:"We must prioritise ____ rather than short-term gains.", base:"SUSTAIN", answers:["sustainability"], explain:"'Sustainability'." },
      { sentence:"A careful ____ of the figures revealed an unexpected trend.", base:"ANALYSE", answers:["analysis"], explain:"'Analysis'." },
      { sentence:"The committee demanded a ____ justification for the expenditure.", base:"CONCRETE", answers:["concrete"], explain:"'Concrete justification' (adj) is idiomatic." },
      { sentence:"The organisation responded ____ to the findings.", base:"SWIFT", answers:["swiftly"], explain:"Adverb 'swiftly' required." }
    ],
    sentenceTransformation: [
      { origin:"She needn't have told him everything; she chose not to.", prompt:"She needn't have ___ the details. (TOLD)", keys:["told him all the details","told him everything","told him all"], explain:"Natural variations using 'told' + object." },
      { origin:"It was only when the results arrived that they realised the scale.", prompt:"Only when the results ___ did they realise the scale. (ARRIVED)", keys:["had arrived","arrived"], explain:"'Only when... did they...' — 'had arrived'/'arrived' accepted." },
      { origin:"All staff were required to comply with procedures strictly.", prompt:"All staff were required to ___ with procedures. (COMPLY)", keys:["comply with procedures","comply fully with procedures","comply strictly with procedures"], explain:"3–5 word variants with 'comply' allowed." },
      { origin:"She regretted accepting the position.", prompt:"She regretted ___ the position. (ACCEPT)", keys:["accepting the position","having accepted the position","accepting the job"], explain:"Gerund / perfect gerund forms accepted." },
      { origin:"They postponed the meeting until the consultant arrived.", prompt:"They waited to ___ the consultant. (MEET)", keys:["meet the consultant","meet with the consultant","see the consultant"], explain:"Accept 'meet' or 'meet with' variants." },
      { origin:"I was surprised how quickly the week had passed.", prompt:"I was surprised ___ how quickly the week had passed. (AT)", keys:["at how quickly the week","at how quickly the week had passed","at how quickly the week had gone"], explain:"'At how quickly...' constructions accepted." }
    ]
  };
  
  resetExerciseStates();
}

/* ===========================
   Utility Functions
   =========================== */
function clearMain() { main.innerHTML = ''; }

function normalize(s) { 
  return (s||'').toString().trim().toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"]/g,"")
    .replace(/\s+/g,' ').trim(); 
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"'`]/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
    "'": '&#39;', '`': '&#96;'
  })[ch]);
}

function showMenu() {
  current = null;
  btnReturn.style.display = 'none';
  hideScore();
  title.textContent = 'Welcome';
  subtitle.textContent = 'Pick a section to begin. Content follows Cambridge C1 patterns.';
  clearMain();
  
  main.innerHTML = `
    <div style="text-align:center; padding:22px;">
      <h3 style="font-family:'Playfair Display', serif; margin:0 0 8px 0;">
        Authentic C1 practice
      </h3>
      <p class="small-muted" style="max-width:72ch; margin:12px auto;">
        Multiple Choice (12), Open Cloze (8 gaps), Word Formation (8), 
        Sentence Transformation (6). One mark per correct answer.<br>
        <strong>Currently using Set ${currentSetId}</strong> - select different sets for variety!
      </p>
    </div>`;
}

/* ===========================
   Multiple Choice Functions
   =========================== */
function startMC() {
  if (!currentData?.multipleChoice) return;
  
  current = 'mc';
  mcState.idx = 0;
  mcState.answers = Array(currentData.multipleChoice.length).fill(null);
  btnReturn.style.display = 'inline-flex';
  title.textContent = 'Multiple Choice — 12 items';
  subtitle.textContent = 'Choose the best option (A–D). 1 mark each.';
  renderMC();
}

function renderMC() {
  const i = mcState.idx;
  const q = currentData.multipleChoice[i];
  clearMain();
  
  const wrap = document.createElement('div');
  wrap.className = 'qcard';
  wrap.innerHTML = `
    <div class="q-idx">Question ${i+1} of ${currentData.multipleChoice.length}</div>
    <div class="sentence">${q.s.replace('___','<strong style="text-decoration:underline">______</strong>')}</div>
    <div class="options" role="list">
      ${q.opts.map((o,idx) => `
        <div class="opt" data-opt="${idx}" tabindex="0">
          <strong>${String.fromCharCode(65+idx)}.</strong> ${o}
        </div>
      `).join('')}
    </div>
    <div class="bottom">
      <div style="display:flex; gap:8px;">
        <button class="btn" id="prevMC" ${i===0?'disabled':''}>Previous</button>
        <button class="btn" id="nextMC">Next</button>
      </div>
      <div class="progress">
        <i style="width:${Math.round((i/currentData.multipleChoice.length)*100)}%"></i>
      </div>
    </div>`;
    
  main.appendChild(wrap);

  // Handle option selection
  const opts = main.querySelectorAll('.opt');
  opts.forEach(el => {
    if (mcState.answers[i] === Number(el.dataset.opt)) {
      el.classList.add('selected');
    }
    
    el.addEventListener('click', () => {
      const sel = Number(el.dataset.opt);
      mcState.answers[i] = sel;
      opts.forEach(x => x.classList.remove('selected'));
      el.classList.add('selected');
    });
    
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  });

  // Navigation buttons
  const prevBtn = document.getElementById('prevMC');
  const nextBtn = document.getElementById('nextMC');
  
  if (prevBtn) {
    prevBtn.onclick = () => {
      if (i > 0) {
        mcState.idx--;
        renderMC();
      }
    };
  }
  
  if (nextBtn) {
    nextBtn.onclick = () => {
      if (i === currentData.multipleChoice.length - 1) {
        finishMC();
      } else {
        mcState.idx++;
        renderMC();
      }
    };
  }
}

function finishMC() {
  const total = currentData.multipleChoice.length;
  let score = 0;
  const items = [];
  
  for (let i = 0; i < total; i++) {
    const user = mcState.answers[i];
    const ok = user === currentData.multipleChoice[i].c;
    if (ok) score++;
    
    items.push({
      q: i + 1,
      user: user === null ? null : String.fromCharCode(65 + user),
      correct: String.fromCharCode(65 + currentData.multipleChoice[i].c),
      explanation: currentData.multipleChoice[i].ex
    });
  }
  
  showScore(score, total, items);
}

/* ===========================
   Open Cloze Functions
   =========================== */
function startGap() {
  if (!currentData?.openCloze) return;
  
  current = 'gap';
  gapState.idx = 0;
  gapState.answers = Array(currentData.openCloze.answers.length).fill('');
  btnReturn.style.display = 'inline-flex';
  title.textContent = 'Open Cloze — grammar-only gaps';
  subtitle.textContent = 'One ~170-word text with 8 grammar blanks.';
  renderGap();
}

function renderGap() {
  clearMain();
  
  const parts = currentData.openCloze.text.split('___');
  const container = document.createElement('div');
  container.className = 'qcard';
  
  let html = `
    <div class="q-idx">Open Cloze — fill all ${currentData.openCloze.answers.length} gaps</div>
    <div style="font-size:15px; line-height:1.6">`;
  
  for (let i = 0; i < parts.length; i++) {
    html += `<span>${parts[i]}</span>`;
    if (i < currentData.openCloze.answers.length) {
      html += `<input id="gap-${i}" data-index="${i}" class="gap" placeholder="____" style="width:140px; display:inline-block; margin:0 6px;">`;
    }
  }
  
  html += `</div>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
      <div class="small-muted">Grammar-only blanks — not general vocabulary.</div>
      <div style="display:flex; gap:8px;">
        <button class="btn" id="submitGap">Submit</button>
        <button class="btn" id="backGap">RETURN TO MENU</button>
      </div>
    </div>`;
    
  container.innerHTML = html;
  main.appendChild(container);

  // Restore previous answers
  for (let i = 0; i < currentData.openCloze.answers.length; i++) {
    const el = document.getElementById(`gap-${i}`);
    if (el) el.value = gapState.answers[i] || '';
  }
  
  document.getElementById('backGap').onclick = showMenu;
  document.getElementById('submitGap').onclick = finishGap;
}

function finishGap() {
  const total = currentData.openCloze.answers.length;
  let score = 0;
  const items = [];
  
  for (let i = 0; i < total; i++) {
    const el = document.getElementById(`gap-${i}`);
    const raw = el ? el.value : '';
    gapState.answers[i] = raw;
    
    const user = normalize(raw);
    const valids = currentData.openCloze.answers[i].map(x => normalize(x));
    const ok = valids.includes(user);
    
    if (ok) score++;
    
    items.push({
      q: i + 1,
      user: raw || null,
      correct: currentData.openCloze.answers[i].join(' / '),
      isCorrect: ok,
      explanation: currentData.openCloze.explanations[i] || ''
    });
  }
  
  showScore(score, total, items);
}

/* ===========================
   Word Formation Functions
   =========================== */
function startWord() {
  if (!currentData?.wordFormation) return;
  
  current = 'word';
  wordState.idx = 0;
  wordState.answers = Array(currentData.wordFormation.length).fill('');
  btnReturn.style.display = 'inline-flex';
  title.textContent = 'Word Formation — contextual sentences';
  subtitle.textContent = 'Derive the correct form from the BASE word shown.';
  renderWord();
}

function renderWord() {
  const i = wordState.idx;
  const item = currentData.wordFormation[i];
  clearMain();
  
  const wrap = document.createElement('div');
  wrap.className = 'qcard';
  wrap.innerHTML = `
    <div class="q-idx">Item ${i+1} of ${currentData.wordFormation.length}</div>
    <div style="display:flex; gap:12px; align-items:flex-start;">
      <div style="min-width:160px; padding:10px; border-radius:10px; background: rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.02)">
        <div style="font-size:14px"><strong>BASE: ${item.base}</strong></div>
      </div>
      <div style="flex:1">
        <div class="sentence">${item.sentence.replace('____','<strong style="text-decoration:underline">______</strong>')}</div>
        <div style="margin-top:8px">
          <input id="wordIn" class="word" placeholder="Type the correct form">
        </div>
      </div>
    </div>
    <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:10px;">
      <button class="btn" id="prevWord" ${i===0?'disabled':''}>Previous</button>
      <button class="btn" id="nextWord">Next</button>
    </div>`;
    
  main.appendChild(wrap);

  const input = document.getElementById('wordIn');
  input.value = wordState.answers[i] || '';
  input.focus();
  
  document.getElementById('prevWord').onclick = () => {
    wordState.answers[i] = input.value;
    if (i > 0) {
      wordState.idx--;
      renderWord();
    }
  };
  
  document.getElementById('nextWord').onclick = () => {
    wordState.answers[i] = input.value;
    if (i === currentData.wordFormation.length - 1) {
      finishWord();
    } else {
      wordState.idx++;
      renderWord();
    }
  };
  
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      document.getElementById('nextWord').click();
    }
  });
}

function finishWord() {
  const total = currentData.wordFormation.length;
  let score = 0;
  const items = [];
  
  for (let i = 0; i < total; i++) {
    const raw = wordState.answers[i] || '';
    const user = normalize(raw);
    const valids = currentData.wordFormation[i].answers.map(x => normalize(x));
    const ok = valids.includes(user);
    
    if (ok) score++;
    
    items.push({
      q: i + 1,
      user: raw || null,
      correct: currentData.wordFormation[i].answers.join(' / '),
      isCorrect: ok,
      explanation: currentData.wordFormation[i].explain
    });
  }
  
  showScore(score, total, items);
}

/* ===========================
   Sentence Transformation Functions
   =========================== */
function startTrans() {
  if (!currentData?.sentenceTransformation) return;
  
  current = 'trans';
  transState.idx = 0;
  transState.answers = Array(currentData.sentenceTransformation.length).fill('');
  btnReturn.style.display = 'inline-flex';
  title.textContent = 'Sentence Transformation — 3–5 word answers';
  subtitle.textContent = 'Use the given word; answers should be 3–5 words.';
  renderTrans();
}

function renderTrans() {
  const i = transState.idx;
  const item = currentData.sentenceTransformation[i];
  clearMain();
  
  const wrap = document.createElement('div');
  wrap.className = 'qcard';
  wrap.innerHTML = `
    <div class="q-idx">Task ${i+1} of ${currentData.sentenceTransformation.length}</div>
    <div style="color:rgba(230,238,246,0.75); font-size:14px">
      Original (for reference): <em>${item.origin}</em>
    </div>
    <div class="sentence" style="margin-top:8px">
      ${item.prompt.replace('___','<strong style="text-decoration:underline">______</strong>')}
    </div>
    <div style="margin-top:8px">
      <input id="transIn" class="trans" placeholder="Type your transformed sentence (3–5 words)">
    </div>
    <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:10px;">
      <button class="btn" id="prevTrans" ${i===0?'disabled':''}>Previous</button>
      <button class="btn" id="nextTrans">Next</button>
    </div>`;
    
  main.appendChild(wrap);

  const input = document.getElementById('transIn');
  input.value = transState.answers[i] || '';
  input.focus();
  
  document.getElementById('prevTrans').onclick = () => {
    transState.answers[i] = input.value;
    if (i > 0) {
      transState.idx--;
      renderTrans();
    }
  };
  
  document.getElementById('nextTrans').onclick = () => {
    transState.answers[i] = input.value;
    if (i === currentData.sentenceTransformation.length - 1) {
      finishTrans();
    } else {
      transState.idx++;
      renderTrans();
    }
  };
  
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      document.getElementById('nextTrans').click();
    }
  });
}

function finishTrans() {
  const total = currentData.sentenceTransformation.length;
  let score = 0;
  const items = [];
  
  for (let i = 0; i < total; i++) {
    const raw = transState.answers[i] || '';
    const user = normalize(raw);
    const words = user.split(' ').filter(Boolean);
    const lenOK = words.length >= 3 && words.length <= 5;
    
    const valids = currentData.sentenceTransformation[i].keys.map(k => normalize(k));
    let ok = valids.some(v => v && (user === v || user.includes(v) || v.includes(user)));
    if (ok && !lenOK) ok = false;
    
    if (ok) score++;
    
    items.push({
      q: i + 1,
      user: raw || null,
      correct: currentData.sentenceTransformation[i].keys.join(' / '),
      isCorrect: ok,
      explanation: currentData.sentenceTransformation[i].explain
    });
  }
  
  showScore(score, total, items);
}

/* ===========================
   Score Display Functions
   =========================== */
function showScore(score, total, items) {
  scoreCard.classList.add('show');
  scoreCard.setAttribute('aria-hidden', 'false');
  
  scoreNumber.textContent = `0 / ${total}`;
  scoreText.textContent = `0% — Great effort!`;
  
  // Animated score counting
  let frames = 30;
  let acc = 0;
  const inc = score / frames;
  let step = 0;
  
  const id = setInterval(() => {
    acc += inc;
    const v = Math.round(acc);
    scoreNumber.textContent = `${v} / ${total}`;
    scoreText.textContent = `${Math.round((v/total)*100)}%`;
    step++;
    
    if (step >= frames) {
      clearInterval(id);
      scoreNumber.textContent = `${score} / ${total}`;
      const pct = Math.round((score/total)*100);
      scoreText.textContent = `${pct}% — ${pct>=85?'Outstanding!':pct>=65?'Very good':'Review the answers'}`;
    }
  }, 12);

  // Prepare answers list
  answersList.style.display = 'none';
  answersList.innerHTML = items.map(item => {
    const user = item.user === null ? '<em>(no answer)</em>' : escapeHtml(item.user);
    const correct = escapeHtml(item.correct || '');
    const tick = item.isCorrect ? '✅' : '❌';
    
    return `
      <div style="padding:8px; border-bottom:1px dashed rgba(255,255,255,0.02)">
        <div>
          <strong>Q${item.q}.</strong> ${tick} Your: <strong>${user}</strong> — Correct: <strong>${correct}</strong>
        </div>
        <div style="color:rgba(230,238,246,0.7); margin-top:6px">
          ${escapeHtml(item.explanation || '')}
        </div>
      </div>`;
  }).join('');

  revealBtn.style.display = 'inline-block';
  revealBtn.onclick = () => {
    answersList.style.display = 'block';
    revealBtn.style.display = 'none';
  };
  
  closeScore.onclick = () => hideScore();
}

function hideScore() {
  scoreCard.classList.remove('show');
  scoreCard.setAttribute('aria-hidden', 'true');
  answersList.style.display = 'none';
  revealBtn.style.display = 'inline-block';
  answersList.innerHTML = '';
}

/* ===========================
   Event Listeners & Initialization
   =========================== */
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize data
  await loadAvailableSets();
  
  // Set up exercise tiles
  tiles.forEach(tile => {
    tile.addEventListener('click', () => {
      const target = tile.dataset.target;
      if (target === 'mc') startMC();
      if (target === 'gap') startGap();
      if (target === 'word') startWord();
      if (target === 'trans') startTrans();
    });
    
    tile.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tile.click();
      }
    });
  });

  // Set up controls
  btnReturn.onclick = showMenu;
  
  loadNewSetBtn.addEventListener('click', async () => {
    const selectedSetId = parseInt(setSelector.value);
    if (selectedSetId !== currentSetId) {
      await loadDataSet(selectedSetId);
      showMenu();
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (scoreCard.classList.contains('show')) {
        hideScore();
      } else {
        showMenu();
      }
    }
  });

  // Show initial menu
  showMenu();
});