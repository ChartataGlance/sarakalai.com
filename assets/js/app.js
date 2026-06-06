
const DAY_ORDER_TA=["ஞாயிறு","திங்கள்","செவ்வாய்","புதன்","வியாழன்","வெள்ளி","சனி"];
const DAY_EN={"ஞாயிறு":"Sunday","திங்கள்":"Monday","செவ்வாய்":"Tuesday","புதன்":"Wednesday","வியாழன்":"Thursday","வெள்ளி":"Friday","சனி":"Saturday"};
const CLS={Eat:'eat',Walk:'walk',Rule:'rule',Sleep:'sleep',Death:'death'};
const TITHI=["","சுக்ல. பிரதமி","சுக்ல. த்விதியை","சுக்ல. த்ரிதியை","சுக்ல. சதுர்த்தி","சுக்ல. பஞ்சமி","சுக்ல. சக்தி","சுக்ல. சப்தமி","சுக்ல. அஷ்டமி","சுக்ல. நவமி","சுக்ல. தசமி","சுக்ல. ஒன்று","சுக்ல. இரண்டு","சுக்ல. மூன்று","சுக்ல. நான்கு","சுக்ல. ஐந்தாம்","சுக்ல. அறுபது","சுக்ல. எழுபது","சுக்ல. எட்டாம்","சுக்ல. ஒன்பது","சுக்ல. இருபத்து","பூர்ணமி","கிருஷ்ண. பிரதமி","கிருஷ்ண. த்விதியை","கிருஷ்ண. த்ரிதியை","கிருஷ்ண. சதுர்த்தி","கிருஷ்ண. பஞ்சமி","கிருஷ்ண. சக்தி","கிருஷ்ண. சப்தமி","கிருஷ்ண. அஷ்டமி"];
const NAKSHATRAS=[["அஸ்வினி","Ashvini"],["பரணி","Bharani"],["கார்த்திகை","Krittika"],["ரோகிணி","Rohini"],["மிருகசீரிடம்","Mrigashirsha"],["திருவாதிரை","Ardra"],["புனர்பூசம்","Punarvasu"],["பூசம்","Pushya"],["ஆயில்யம்","Ashlesha"],[" மகம்","Magha"],["பூரம்","Purva Phalguni"],["உத்தரம்","Uttara Phalguni"],["ஹஸ்தம்","Hasta"],["சித்தம்","Chitra"],["சுவாதி","Swati"],["விசாகம்","Vishakha"],["அனுராதா","Anuradha"],["ஜேதா","Jyeshtha"],["மூலம்","Mula"],["பூரட்டாதி","Purva Ashadha"],["உத்திராதி","Uttara Ashadha"],["சதயம்","Shatabhisha"],["பூர்வபூதபம்","Purva Bhadrapada"],["உத்திரபூதபம்","Uttara Bhadrapada"],["ரேவதி","Revati"],["பூசம்2","Pushya2"],["பாதம்","Pada"]];
const LORDS=["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury","Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury","Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury","Ketu"];
const RASI=[["மேஷம்","Aries"],["ரிஷபம்","Taurus"],["மிதுனம்","Gemini"],["கடகம்","Cancer"],["சிம்மம்","Leo"],["கன்னி","Virgo"],["துலாம்","Libra"],["விருச்சிகம்","Scorpio"],["தனுசு","Sagittarius"],["மகரம்","Capricorn"],["கும்பம்","Aquarius"],["மீனம்","Pisces"]];
const $=id=>document.getElementById(id);let APP,state={mode:'fallback',lat:null,lon:null,timeline:[],current:null};
const STORAGE_KEY='sarakalai_timing_v1';
function saveTiming(mode, extra={}){
  localStorage.setItem(STORAGE_KEY, JSON.stringify({mode, savedAt:Date.now(), ...extra}));
}
function loadSavedTiming(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'null')}catch(e){return null}
}
function clearSavedTiming(){localStorage.removeItem(STORAGE_KEY)}
function showTimingChoices(show){
  const choices=$('timingChoice'), saved=$('savedTimingControls');
  if(choices) choices.style.display=show?'flex':'none';
  if(saved) saved.style.display=show?'none':'flex';
}
function pad(n){return String(n).padStart(2,'0')}function fmt(d){return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`}function hms(ms){const s=Math.max(0,Math.round(ms/1000)),h=[Math.floor(s/3600),Math.floor(s/60)%60,s%60];return `${pad(h[0])}:${pad(h[1])}:${pad(h[2])}`}function mmss(ms){const s=Math.max(0,Math.round(ms/1000));const m=Math.floor(s/60);const sec=s%60;return `${pad(m)}:${pad(sec)}`}function addDays(d,n){return new Date(d.getFullYear(),d.getMonth(),d.getDate()+n,d.getHours(),d.getMinutes(),d.getSeconds())}
function moonInfo(date=new Date()){
 const syn=29.530588853,new0=Date.UTC(2000,0,6,18,14,0);
 let age=((date-new0)/86400000)%syn;if(age<0)age+=syn;
 const deg=age/syn*360,phase=deg<180?'Rising Moon':'Waning Moon',half=phase==='Rising Moon'?deg:deg-180,block=Math.min(15,Math.floor(half/12)+1);
 const tithiIndex=Math.min(30,Math.floor(deg/12)+1);
 const sid=((deg+13.176358*(date.getTime()/86400000))%360+360)%360;
 const nakSize=360/27,padaSize=nakSize/4,nakIndex=Math.floor(sid/nakSize),pada=Math.floor((sid%nakSize)/padaSize)+1,rasiIndex=Math.floor(sid/30);
 return{deg,phase,block,tithiIndex,tithi:TITHI[tithiIndex],siderealDeg:sid,nakTamil:NAKSHATRAS[nakIndex][0],nakEnglish:NAKSHATRAS[nakIndex][1],pada,lord:LORDS[nakIndex],rasiTamil:RASI[rasiIndex][0],rasiEnglish:RASI[rasiIndex][1],moonDeg:deg}
}
function key(phase,period){if(phase==='Rising Moon'&&period==='Day')return'rising_day';if(phase==='Rising Moon'&&period==='Night')return'rising_night';if(phase==='Waning Moon'&&period==='Day')return'waning_day';if(phase==='Waning Moon'&&period==='Night')return'waning_night';}
function sunEvent(date,lat,lon,rise){const d=new Date(date),zen=90.8333,N=Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(d.getFullYear(),0,0))/86400000),lng=lon/15,t=N+(((rise?6:18)-lng)/24),M=(357.5291+0.98560028*t)%360,e=Math.sin(M*Math.PI/180)*1.9148+Math.sin(2*M*Math.PI/180)*0.0200+Math.sin(3*M*Math.PI/180)*0.0003,lambda=(M+102.9372+e+180)%360,delta=Math.asin(Math.sin(lambda*Math.PI/180)*Math.sin(23.44*Math.PI/180))*180/Math.PI,h=Math.acos(Math.cos(zen*Math.PI/180)/(Math.cos(delta*Math.PI/180)*Math.cos(lat*Math.PI/180))-Math.tan(delta*Math.PI/180)*Math.tan(lat*Math.PI/180))*180/Math.PI;const UT=(12 - ((longitudeOffset=null,0)) - (h/15));return new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate(),Math.floor((12-(h/15))|0),Math.floor((((12-(h/15))%1)*60)|0),0));}
function fallback(date,rise){const d=new Date(date);return new Date(d.getFullYear(),d.getMonth(),d.getDate(),rise?6:18,0,0)}
function getSun(date,rise){if(state.mode==='location')return sunEvent(date,state.lat,state.lon,rise);if(state.mode==='manual'){let v=rise?$('manualSunrise')?.value:$('manualSunset')?.value,p=(v||(rise? '06:00:00':'18:00:00')).split(":");return new Date(date.getFullYear(),date.getMonth(),date.getDate(),parseInt(p[0]),parseInt(p[1]),parseInt(p[2]||0))}return fallback(date,rise)}
function adhi(phase,day,period){let rows=APP.cycles[key(phase,period)][day]||[];return{adhi:rows[0]?.bird||{icon:'❔',name:'Unknown'},padu:rows[1]?.bird||{icon:'❔',name:'Unknown'}}}
function build(){const now=new Date(),end=new Date(now.getTime()+7*864e5),all=[];for(let i=-1;i<=8;i++){let d=addDays(now,i),nd=addDays(d,1),sr=getSun(d,true),ss=getSun(d,false),nsr=getSun(nd,true);if(ss<=sr) ss=new Date(ss.getTime()+24*3600*1000);let dayTa=tamilDay(d),dayEn=DAY_EN[dayTa];let periods=[{from:sr,to:ss,period:'Day'},{from:ss,to:nsr,period:'Night'}];for(let p of periods){let phase=moonInfo(p.from).phase;let cycles=APP.cycles[key(phase,p.period)][dayTa]||[];for(let r of cycles){let item={from:new Date(p.from.getTime()+r.from*1000),to:new Date(p.from.getTime()+r.to*1000),activity_en:r.activity,activity_ta:r.activity_ta,bird:r.bird,phase:phase,dayTa:dayTa,dayEn:dayEn,period:p.period,duration:(r.to-r.from)*1000};item.adhi=adhi(phase,dayTa,p.period).adhi;item.padu=adhi(phase,dayTa,p.period).padu;item.samam=r.samam||1;all.push(item)}}}
 all.sort((a,b)=>a.from-b.from);state.timeline=all;const now2=new Date();state.current=all.find(x=>now2>=x.from&&now2<x.to)||all[0];state.sunrise=getSun(new Date(),true);state.sunset=getSun(new Date(),false)}
function renderMoon(){
 const c=state.current;if(!c)return;
 if($('moonPhaseTitle')) $('moonPhaseTitle').textContent=c.phase==='Rising Moon'?'வளர்பிறை':'தேய்பிறை';
 if($('rasiText')) $('rasiText').textContent=c.rasiTamil || '--';
 if($('nakText')) $('nakText').textContent=c.nakTamil || '--';
 if($('padaText')) $('padaText').textContent=c.pada || '--';
 if($('lordText')) $('lordText').textContent=c.lord || '--';

 const strip=$('tithiStrip');
 if(strip){
   const rising=c.phase==='Rising Moon';
   const start=rising?'0° 🌑':'180° 🌕';
   const end=rising?'180° 🌕':'360° 🌑';
   const halfIndex=rising ? c.tithiIndex : c.tithiIndex-15;
   const pos=Math.max(1,Math.min(13,Math.ceil(halfIndex/1.25)));
   let marks='';
   for(let i=1;i<=13;i++){
     const cls=i<pos?'passed':(i===pos?'active':'');
     marks+=`<span class="arc-mark m${i} ${cls}"></span>`;
   }
   strip.className='v033-lunar-curve';
   strip.innerHTML = `
  <div class="lunar-top">
    <span>${rising ? "0°" : "180°"}</span>
    <span>${rising ? "180°" : "360°"}</span>
  </div>

  <div class="lunar-arc-fixed">
    ${marks}
  </div>

  <div class="lunar-bottom">
    <span>${rising ? "🌑" : "🌕"}</span>
    <span>${rising ? "🌕" : "🌑"}</span>
  </div>
`;
 }
 if($('tithiCaption')){
   $('tithiCaption').innerHTML=`${c.tithi || 'Active Tithi'}<div class="v034-lunar-small">${Math.round(c.moonDeg)}°</div>`;
 }
}
function renderMicro(c){
 if(!c)return;
 const now=new Date(),part=c.duration/5,act=Math.min(4,Math.max(0,Math.floor((now-c.from)/part)));
 const dots=$('innerDots');
 if(dots){dots.innerHTML='';for(let i=0;i<5;i++){const d=document.createElement('span');d.className='inner-dot '+(i<act?'done':(i===act?'active':''));dots.appendChild(d)}}
 if($('innerText')) $('innerText').textContent=`Inner Part ${act+1} / 5`;
}
function renderSamamDots(c){
 const root=$('samamDots');if(!root||!c)return;
 root.innerHTML='';
 for(let i=1;i<=5;i++){
   const d=document.createElement('span');
   d.className='samam-dot '+(i<c.samam?'done':(i===c.samam?'active':''));
   d.textContent=i===c.samam?'🟡':'●';
   root.appendChild(d);
 }
}
function activityMeta(activity){
 const map={
  Rule:{emoji:'👑',ta:'அரசு',en:'Rule',good:'EXCELLENT TIME'},
  Eat:{emoji:'🍚',ta:'ஊண்',en:'Eat',good:'GOOD TIME'},
  Walk:{emoji:'🚶',ta:'நடை',en:'Walk',good:'AVERAGE TIME'},
  Sleep:{emoji:'🛏',ta:'துயில்',en:'Sleep',good:'WEAK TIME'},
  Death:{emoji:'☠',ta:'சாவு',en:'Death',good:'AVOID TIME'}
 };
 return map[activity]||{emoji:'',ta:activity,en:activity,good:''};
}
function qualityForActivity(activity){
 const map={
  Rule:{stars:'⭐⭐⭐⭐⭐',label:'Excellent'},
  Eat:{stars:'⭐⭐⭐⭐',label:'Good'},
  Walk:{stars:'⭐⭐⭐',label:'Average'},
  Sleep:{stars:'⭐⭐',label:'Weak'},
  Death:{stars:'⭐',label:'Avoid'}
 };
 return map[activity]||{stars:'',label:''};
}
function renderTwelveParts(c){
 const root=$('twelveRow');if(!root||!c)return;
 const now=new Date();
 const progress=Math.min(1,Math.max(0,(now-c.from)/c.duration));
 const active=Math.min(12,Math.max(1,Math.floor(progress*12)+1));
 root.innerHTML='';
 for(let i=1;i<=12;i++){
   const b=document.createElement('span');
   b.className='twelve-bubble '+(i<=5?'big':'small')+' p'+i+' '+(i<active?'passed':(i===active?'active':''));
   b.textContent=i<=5?String(i):'';
   root.appendChild(b);
 }
 if($('twelveCaption')) $('twelveCaption').textContent=`Part ${active} / 12`;
 const q=qualityForActivity(c.activity_en);
 if($('qualityText')) $('qualityText').textContent=`${q.stars} ${q.label}`;
}
function renderCurrent(){
 let c=state.current;if(!c)return;
 let now=new Date(),remain=c.to-now,prog=Math.min(100,Math.max(0,((now-c.from)/c.duration)*100));
 const meta=activityMeta(c.activity_en);
 const q=qualityForActivity(c.activity_en);
 if($('currentTitle')) $('currentTitle').innerHTML=`<span class="current-bird-hero">${c.bird.icon}</span><span><span class="current-bird-name">${c.bird.name}</span><span class="current-activity-line">${c.activity_ta} · ${c.activity_en}</span></span>`;
 if($('countdownText')) $('countdownText').textContent=`⏳ ${mmss(remain)}`;
 if($('activityDurationText')) $('activityDurationText').textContent=`${mmss(c.duration)} total · ends ${fmt(c.to)}`;
 if($('activityBar')) $('activityBar').style.width=`0%`;
 if($('activityPercentText')) $('activityPercentText').textContent='';
 if($('sunText')) $('sunText').textContent=`${fmt(state.sunrise)} / ${fmt(state.sunset)}`;
 if($('periodText')) $('periodText').textContent=c.period;
 if($('samamText')) $('samamText').textContent=`${c.period.toLowerCase()} samam`;
 if($('currentPath')) $('currentPath').textContent=`${fmt(c.from)} → ${fmt(c.to)}`;
 if($('todayText')) $('todayText').textContent=c.dayTa || c.dayEn;
 if($('adhiEmoji')) $('adhiEmoji').textContent=c.adhi.icon;
 if($('paduEmoji')) $('paduEmoji').textContent=c.padu.icon;
 if($('adhiText')) $('adhiText').textContent=c.adhi.name;
 if($('paduText')) $('paduText').textContent=c.padu.name;
 renderSamamDots(c);renderTwelveParts(c);renderMoon();
}
function card(c,active=false){return `<article class="timeline-card ${active?'active':''}"><div class="topline"><span>${fmtDate(c.from)} · ${c.phase==='Rising Moon'?'வளர்பிறை':'தேய்பிறை'}</span><span class="right">${fmt(c.from)}</span></div><div class="card-body"><div class="bird-row"><div class="bird-ico">${c.bird.icon}</div><div class="bird-text"><b>${c.bird.name}</b><div class="act">${c.activity_ta} · ${c.activity_en}</div></div></div><div class="card-meta">${c.period} · ${c.dayTa}</div></div></article>`}
function renderCards(){let r=$('cardList');if(!r)return;let now=new Date();r.innerHTML=state.timeline.slice(0,120).map(c=>card(c,now>=c.from&&now<c.to)).join('')}
function refresh(){build();renderCurrent();renderCards()}
function setMode(m, save=true){
 state.mode=m;
 if(m==='manual'){$('manualPanel').style.display='block';showTimingChoices(true);return}
 if(m==='fallback'){
   if(save) saveTiming('fallback');
   showTimingChoices(false);
   if($('manualPanel')) $('manualPanel').style.display='none';
   $('statusText').textContent='Traditional fallback active';
   $('statusDetails').textContent='06:00 sunrise / 18:00 sunset';
   refresh();
 }
}
function useManual(){
 state.mode='manual';
 const sunrise=$('manualSunrise').value||'06:00:00';
 const sunset=$('manualSunset').value||'18:00:00';
 saveTiming('manual',{sunrise,sunset});
 showTimingChoices(false);
 if($('manualPanel')) $('manualPanel').style.display='none';
 $('statusText').textContent='Manual timing active';
 $('statusDetails').textContent=`Sunrise ${sunrise} / Sunset ${sunset}`;
 refresh();
}
function useLocation(){
 $('statusText').textContent='Requesting location...';
 $('statusDetails').textContent='Checking GPS';
 if(!navigator.geolocation){setMode('manual');return}
 navigator.geolocation.getCurrentPosition(p=>{
   state.lat=p.coords.latitude;
   state.lon=p.coords.longitude;
   state.mode='location';
   saveTiming('location',{lat:state.lat,lon:state.lon});
   showTimingChoices(false);
   if($('manualPanel')) $('manualPanel').style.display='none';
   refresh();
   $('statusText').textContent='Local timing active';
   $('statusDetails').textContent=`Saved location · Sunrise ${fmt(state.sunrise)} / Sunset ${fmt(state.sunset)}`;
 },e=>{
   console.warn(e);
   $('statusText').textContent='Location unavailable';
   $('statusDetails').textContent='Choose manual timing or traditional fallback.';
   showTimingChoices(true);
 },{enableHighAccuracy:false,timeout:12000,maximumAge:300000})
}
function renderWeek(phase,id){let root=$(id);if(!root)return;root.innerHTML=DAY_ORDER_TA.map(day=>{let a=adhi(phase,day,'Day');return `<article class="day-card"><div class="day-head"><b>${DAY_EN[day]}</b><span class="day-ta">${day}</span></div><div class="day-body"><div class="bird-box"><div class="bird">${a.adhi.icon}</div><div class="bird-name">${a.adhi.name}</div></div></div></article>`}).join('')}
function mini(r){return `<article class="mini-card ${CLS[r.activity_en]||''}"><div class="bird-img">${r.bird.icon}</div><div class="activity">${r.bird.name} · ${r.activity_en}</div><div class="units">${mmss(r.duration)}</div></article>`}
function renderTree(phase,id){let root=$(id);if(!root)return;root.innerHTML=DAY_ORDER_TA.map(day=>`<details><summary>${DAY_EN[day]} · ${day}</summary>${['Day','Night'].map(period=>{let rows=APP.cycles[key(phase,period)][day]||[];return `<div class="tree-period"><b>${period}</b>${rows.map(r=>mini(r)).join('')}</div>`}).join('')}</details>`).join('')}
async function init(){
 APP=await fetch('data/panchapatchi-data.json').then(r=>r.json());
 renderWeek('Rising Moon','risingWeek');
 renderWeek('Waning Moon','waningWeek');
 renderTree('Rising Moon','risingTree');
 renderTree('Waning Moon','waningTree');

 if(!$('locateBtn') && !$('currentTitle')){return;}
 if($('locateBtn')) $('locateBtn').onclick=useLocation;
 if($('manualBtn')) $('manualBtn').onclick=()=>{$('manualPanel').style.display='block'};
 if($('fallbackBtn')) $('fallbackBtn').onclick=()=>setMode('fallback');
 if($('setManualBtn')) $('setManualBtn').onclick=useManual;
 if($('changeTimingBtn')) $('changeTimingBtn').onclick=()=>{
   clearSavedTiming();
   showTimingChoices(true);
   if($('manualPanel')) $('manualPanel').style.display='none';
   $('statusText').textContent='Choose timing method';
   $('statusDetails').textContent='Use location, manual sunrise/sunset, or traditional 6am/6pm.';
 };

 const saved=loadSavedTiming();
 if(saved && saved.mode==='location' && typeof saved.lat==='number' && typeof saved.lon==='number'){
   state.mode='location'; state.lat=saved.lat; state.lon=saved.lon;
   showTimingChoices(false); refresh();
   $('statusText').textContent='Local timing active';
   $('statusDetails').textContent=`Saved location · Sunrise ${fmt(state.sunrise)} / Sunset ${fmt(state.sunset)}`;
 }else if(saved && saved.mode==='manual'){
   if($('manualSunrise')) $('manualSunrise').value=saved.sunrise||'06:00:00';
   if($('manualSunset')) $('manualSunset').value=saved.sunset||'18:00:00';
   state.mode='manual'; showTimingChoices(false); refresh();
   $('statusText').textContent='Manual timing active';
   $('statusDetails').textContent=`Saved manual timing · Sunrise ${$('manualSunrise').value} / Sunset ${$('manualSunset').value}`;
 }else if(saved && saved.mode==='fallback'){
   setMode('fallback', false);
 }else{
   showTimingChoices(true);
   if($('statusText')){
     setMode('fallback', false);
     showTimingChoices(true);
     $('statusText').textContent='Choose timing method';
     $('statusDetails').textContent='Use location for local timing, or choose another method.';
   }
 }
 setInterval(()=>{if(APP){build();renderCurrent()}},1000)
}
init();
