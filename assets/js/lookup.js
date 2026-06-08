
// lookup.js - selected date/time Panchapatchi lookup using the live-card UI.

const LOOKUP_KEY = 'sarakalai_lookup_time_v1';
let LOOKUP_DATE = new Date();

function lp(n){ return String(n).padStart(2,'0'); }
function dval(d){ return `${d.getFullYear()}-${lp(d.getMonth()+1)}-${lp(d.getDate())}`; }
function tval(d){ return `${lp(d.getHours())}:${lp(d.getMinutes())}:${lp(d.getSeconds())}`; }

function lookupParseTime(baseDate, hhmmss){
  const parts = String(hhmmss || '00:00:00').split(':').map(Number);
  const h = Number.isFinite(parts[0]) ? parts[0] : 0;
  const m = Number.isFinite(parts[1]) ? parts[1] : 0;
  const s = Number.isFinite(parts[2]) ? parts[2] : 0;
  const out = new Date(baseDate);
  out.setHours(h, m, s, 0);
  return out;
}

function setInputs(d){
  if($('lookupDate')) $('lookupDate').value = dval(d);
  if($('lookupTime')) $('lookupTime').value = tval(d);
}

function getInputs(){
  const dateEl = $('lookupDate');
  const timeEl = $('lookupTime');
  if(!dateEl || !timeEl || !dateEl.value || !timeEl.value) return new Date();
  const d = new Date(`${dateEl.value}T${timeEl.value}`);
  return isNaN(d.getTime()) ? new Date() : d;
}

function saveLookup(d){
  localStorage.setItem(LOOKUP_KEY, JSON.stringify({date:dval(d), time:tval(d)}));
}

function loadLookup(){
  try{return JSON.parse(localStorage.getItem(LOOKUP_KEY)||'null')}catch(e){return null}
}

function sunFor(d){
  if(state.mode === 'location' && state.lat != null && state.lon != null && typeof sunriseSunset === 'function'){
    return sunriseSunset(d, state.lat, state.lon);
  }
  return [lookupParseTime(d, '06:00:00'), lookupParseTime(d, '18:00:00')];
}

function buildLookup(){
  if(!APP) return;

  const d = new Date(LOOKUP_DATE);
  const sun = sunFor(d);
  state.sunrise = sun[0];
  state.sunset = sun[1];

  const mp = moonInfo(d);
  const dayEn = DAY_EN[d.getDay()];
  const dayTa = DAY_TA[d.getDay()];
  const period = d >= state.sunrise && d < state.sunset ? 'Day' : 'Night';
  const startBase = period === 'Day' ? state.sunrise : state.sunset;

  let endBase;
  if(period === 'Day'){
    endBase = state.sunset;
  }else{
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate()+1);
    endBase = sunFor(nextDay)[0];
  }

  const samLen = (endBase - startBase) / 5;
  const samam = Math.min(5, Math.max(1, Math.floor((d - startBase) / samLen) + 1));
  const samStart = new Date(startBase.getTime() + samLen * (samam - 1));

  const tableKey = `${mp.phase}|${period}`;
  const table = APP.tables && APP.tables[tableKey] ? APP.tables[tableKey][samam - 1] : null;
  if(!table){
    console.warn('Lookup table missing', tableKey, samam);
    return;
  }

  let cursor = new Date(samStart);
  let current = null;
  const cards = [];

  for(const row of table){
    const dur = samLen * (row.minutes / 144);
    const from = new Date(cursor);
    const to = new Date(cursor.getTime() + dur);
    const bird = APP.birds[row.bird];

    const item = {
      ...row, bird, from, to, duration: dur, samam,
      phase: mp.phase, moonDeg: mp.deg, moonBlock: mp.block,
      tithiIndex: mp.tithiIndex, tithi: mp.tithi,
      siderealDeg: mp.siderealDeg, nakTamil: mp.nakTamil, nakEnglish: mp.nakEnglish,
      pada: mp.pada, lord: mp.lord, rasiTamil: mp.rasiTamil, rasiEnglish: mp.rasiEnglish,
      period, dayEn, dayTa,
      adhi: APP.weekly[mp.phase][dayEn].adhi,
      padu: APP.weekly[mp.phase][dayEn].padu
    };

    cards.push(item);
    if(d >= from && d < to) current = item;
    cursor = to;
  }

  state.current = current || cards[0];
  state.timeline = cards;
  state.renderNow = new Date(LOOKUP_DATE);
}

function renderLookupList(){
  const list = $('cardList');
  if(!list || !state.timeline) return;
  list.innerHTML = '';
  state.timeline.forEach(c => {
    const el = document.createElement('div');
    const isActive = state.current && c.from.getTime() === state.current.from.getTime();
    el.className = 'timeline-card ' + CLS[c.activity_en] + (isActive ? ' active' : '');
    el.innerHTML = `<div class="row"><b>${c.bird.icon} ${c.bird.name}</b><span>${fmt(c.from)} → ${fmt(c.to)}</span></div>
      <p>${c.activity_icon || ''} ${c.activity_ta} • ${c.activity_en}</p>
      <span class="mini">${c.period} · Samam ${c.samam} · அட்சரம் ${c.atcharam || '-'}</span>`;
    list.appendChild(el);
  });
}

function renderLookup(){
  lastTwelveRender = 0;
  buildLookup();
  renderCurrent();
  renderLookupList();

  const live = document.querySelector('.live-card');
  if(live){
    live.classList.add('lookup-refresh');
    setTimeout(() => live.classList.remove('lookup-refresh'), 180);
  }

  if($('currentPath')) $('currentPath').textContent = `Lookup ${dval(LOOKUP_DATE)} ${tval(LOOKUP_DATE)}`;
}

function updateFromInputs(){
  LOOKUP_DATE = getInputs();
  saveLookup(LOOKUP_DATE);
  renderLookup();
}

function initLookup(){
  const saved = loadLookup();
  LOOKUP_DATE = saved && saved.date && saved.time ? new Date(`${saved.date}T${saved.time}`) : new Date();
  if(isNaN(LOOKUP_DATE.getTime())) LOOKUP_DATE = new Date();
  setInputs(LOOKUP_DATE);

  ['lookupDate','lookupTime'].forEach(id => {
    const el = $(id);
    if(!el) return;
    ['input','change','keyup'].forEach(evt => el.addEventListener(evt, updateFromInputs));
  });

  if($('lookupNowBtn')){
    $('lookupNowBtn').onclick = () => {
      LOOKUP_DATE = new Date();
      setInputs(LOOKUP_DATE);
      saveLookup(LOOKUP_DATE);
      renderLookup();
    };
  }

  const wait = setInterval(() => {
    if(APP){
      clearInterval(wait);
      renderLookup();
      setInterval(renderLookup, 1000);
    }
  }, 100);
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initLookup);
}else{
  initLookup();
}
