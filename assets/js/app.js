
const DAY_ORDER_TA=["ஞாயிறு","திங்கள்","செவ்வாய்","புதன்","வியாழன்","வெள்ளி","சனி"];
const DAY_EN={"ஞாயிறு":"Sunday","திங்கள்":"Monday","செவ்வாய்":"Tuesday","புதன்":"Wednesday","வியாழன்":"Thursday","வெள்ளி":"Friday","சனி":"Saturday"};
const CLS={Eat:'eat',Walk:'walk',Rule:'rule',Sleep:'sleep',Death:'death'};
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
function pad(n){return String(n).padStart(2,'0')}function fmt(d){return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`}function hms(ms){const s=Math.max(0,Math.round(ms/1000)),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),x=s%60;return `${pad(h)}:${pad(m)}:${pad(x)}`}function addDays(d,n){let x=new Date(d);x.setDate(x.getDate()+n);return x}function dayTa(d){return DAY_ORDER_TA[d.getDay()]}function fmtDate(d){return d.toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'})}
function moonInfo(date=new Date()){const syn=29.530588853,new0=Date.UTC(2000,0,6,18,14,0);let age=((date-new0)/86400000)%syn;if(age<0)age+=syn;const deg=age/syn*360,phase=deg<180?'Rising Moon':'Waning Moon',half=phase==='Rising Moon'?deg:deg-180,block=Math.min(15,Math.floor(half/12)+1);return{deg,phase,block}}
function key(phase,period){if(phase==='Rising Moon'&&period==='Day')return'rising_day';if(phase==='Rising Moon'&&period==='Night')return'rising_night';if(phase==='Waning Moon'&&period==='Day')return'waning_day';return'waning_night'}
function sunEvent(date,lat,lon,rise){const d=new Date(date),zen=90.8333,N=Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(d.getFullYear(),0,0))/86400000),lng=lon/15,t=N+(((rise?6:18)-lng)/24),M=.9856*t-3.289;let L=M+1.916*Math.sin(M*Math.PI/180)+.020*Math.sin(2*M*Math.PI/180)+282.634;L=(L+360)%360;let RA=Math.atan(.91764*Math.tan(L*Math.PI/180))*180/Math.PI;RA=(RA+360)%360;RA=(RA+(Math.floor(L/90)*90-Math.floor(RA/90)*90))/15;const sd=.39782*Math.sin(L*Math.PI/180),cd=Math.cos(Math.asin(sd)),ch=(Math.cos(zen*Math.PI/180)-sd*Math.sin(lat*Math.PI/180))/(cd*Math.cos(lat*Math.PI/180));if(ch>1||ch<-1)return fallback(date,rise);let H=rise?360-Math.acos(ch)*180/Math.PI:Math.acos(ch)*180/Math.PI;H/=15;const T=H+RA-.06571*t-6.622,UT=(T-lng+24)%24,utc=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate(),0,0,0));utc.setUTCMinutes(Math.round(UT*60));return utc}
function fallback(date,rise){const d=new Date(date);return new Date(d.getFullYear(),d.getMonth(),d.getDate(),rise?6:18,0,0)}
function getSun(date,rise){if(state.mode==='location')return sunEvent(date,state.lat,state.lon,rise);if(state.mode==='manual'){let v=rise?$('manualSunrise')?.value:$('manualSunset')?.value,p=(v||(rise?'06:00:00':'18:00:00')).split(':').map(Number),d=new Date(date);return new Date(d.getFullYear(),d.getMonth(),d.getDate(),p[0]||0,p[1]||0,p[2]||0)}return fallback(date,rise)}
function adhi(phase,day,period){let rows=APP.cycles[key(phase,period)][day]||[];return{adhi:rows[0]?.bird||{icon:'❔',name:'Unknown'},padu:rows[1]?.bird||{icon:'❔',name:'Unknown'}}}
function build(){const now=new Date(),end=new Date(now.getTime()+7*864e5),all=[];for(let i=-1;i<=8;i++){let d=addDays(now,i),nd=addDays(d,1),sr=getSun(d,true),ss=getSun(d,false),nsr=getSun(nd,true);if(i===0){state.sunrise=sr;state.sunset=ss}for(const [period,start,finish] of [['Day',sr,ss],['Night',ss,nsr]]){let mp=moonInfo(start),k=key(mp.phase,period),dt=dayTa(start),rows=APP.cycles[k][dt]||[],a=adhi(mp.phase,dt,period),samMs=(finish-start)/5;for(let s=1;s<=5;s++){let s0=new Date(start.getTime()+samMs*(s-1)),s1=new Date(start.getTime()+samMs*s),cur=s0;rows.filter(r=>r.samam_en===`Samam ${s}`).forEach((r,idx)=>{let dur=samMs*r.minutes/144,from=new Date(cur),to=new Date(cur.getTime()+dur);all.push({...r,index:idx+1,from,to,duration:dur,phase:mp.phase,moonDeg:mp.deg,moonBlock:mp.block,period,dayTa:dt,dayEn:DAY_EN[dt],samam:s,adhi:a.adhi,padu:a.padu});cur=to})}}}state.timeline=all.filter(c=>c.to>now&&c.from<end).sort((a,b)=>a.from-b.from);state.current=state.timeline.find(c=>now>=c.from&&now<c.to)||state.timeline[0]}
function renderMoon(){let root=$('moonWheel'),c=state.current;if(!root||!c)return;root.innerHTML=`<div class="moon-center"><div class="moon">${c.phase==='Rising Moon'?'🌔':'🌘'}</div><b>${c.phase}</b><span class="lead">Block ${c.moonBlock}/15<br>${c.moonDeg.toFixed(1)}°</span></div>`;for(let i=1;i<=15;i++){let a=(i-1)/15*2*Math.PI-Math.PI/2,x=50+42*Math.cos(a),y=50+42*Math.sin(a),d=document.createElement('div');d.className='moon-dot '+(i===c.moonBlock?'active':'');d.style.left=`calc(${x}% - 18px)`;d.style.top=`calc(${y}% - 18px)`;d.textContent=i;root.appendChild(d)}}
function renderMicro(c){let g=$('microGrid');if(!g||!c)return;let now=new Date(),part=c.duration/5,act=Math.min(4,Math.max(0,Math.floor((now-c.from)/part)));g.innerHTML='';for(let i=0;i<5;i++){let f=new Date(c.from.getTime()+part*i),t=new Date(c.from.getTime()+part*(i+1));g.innerHTML+=`<div class="micro ${i===act?'active':''}">Inner ${i+1}<small>${fmt(f)} → ${fmt(t)}</small></div>`}$('innerText').textContent=`${act+1}/5`}
function renderCurrent(){let c=state.current;if(!c)return;let now=new Date(),remain=c.to-now,prog=((now-c.from)/c.duration)*100;$('currentIcon').textContent=c.bird.icon;$('currentTitle').textContent=`${c.bird.name} · ${c.activity_en}`;$('currentPath').textContent=`${c.phase} · Block ${c.moonBlock}/15 → ${c.dayEn} → ${c.period} → Samam ${c.samam}`;$('countdownText').textContent=`${hms(remain)} remaining`;$('activityBar').style.width=`${Math.min(100,Math.max(0,prog))}%`;$('sunText').textContent=`${fmt(state.sunrise)} / ${fmt(state.sunset)}`;$('moonText').textContent=`${c.phase.replace(' Moon','')} ${c.moonBlock}/15`;$('periodText').textContent=c.period;renderMicro(c);renderMoon()}
function card(c,active=false){return `<article class="timeline-card ${active?'active':''}"><div class="topline"><span>${fmtDate(c.from)} · ${c.phase} · Block ${c.moonBlock}/15</span><span>${c.period} · Samam ${c.samam}</span></div><div class="body"><div class="birdbig">${c.bird.icon}</div><div><div class="name">${c.bird.name} · ${c.activity_en}</div><div class="time">${fmt(c.from)} → ${fmt(c.to)} · ${hms(c.duration)}</div></div></div><div class="context"><div><small>Adhikara</small><b>${c.adhi.icon} ${c.adhi.name}</b></div><div><small>Padupatchi</small><b>${c.padu.icon} ${c.padu.name}</b></div><div><small>Units</small><b>${c.minutes}/144</b></div><div><small>Inner</small><b>${hms(c.duration/5)}</b></div></div></article>`}
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
function renderWeek(phase,id){let root=$(id);if(!root)return;root.innerHTML=DAY_ORDER_TA.map(day=>{let a=adhi(phase,day,'Day');return `<article class="day-card"><div class="day-head"><b>${DAY_EN[day]}</b><span>${day}</span></div><div class="birdpair"><div class="role-card adhi"><div class="emoji">${a.adhi.icon}</div><div class="role">Adhikara</div><div class="bname">${a.adhi.name}</div></div><div class="role-card padu"><div class="emoji">${a.padu.icon}</div><div class="role">Padupatchi</div><div class="bname">${a.padu.name}</div></div></div></article>`}).join('')}
function mini(r){return `<article class="mini-card ${CLS[r.activity_en]||''}"><div class="bird-img">${r.bird.icon}</div><div class="activity">${r.bird.name} · ${r.activity_en}</div><div class="units">${r.minutes} units</div><div class="lead">${r.activity_ta}</div></article>`}
function renderTree(phase,id){let root=$(id);if(!root)return;root.innerHTML=DAY_ORDER_TA.map(day=>`<details><summary>${DAY_EN[day]} · ${day}</summary>${['Day','Night'].map(period=>{let rows=APP.cycles[key(phase,period)][day]||[];return `<details><summary>${period}</summary>${[1,2,3,4,5].map(s=>{let items=rows.filter(r=>r.samam_en===`Samam ${s}`);return `<div class="samam"><div class="samam-title"><b>Samam ${s}</b><span>${items.reduce((a,b)=>a+b.minutes,0)} units</span></div><div class="card-row">${items.map(mini).join('')}</div></div>`}).join('')}</details>`}).join('')}</details>`).join('')}
async function init(){
 APP=await fetch('data/panchapatchi-data.json').then(r=>r.json());
 renderWeek('Rising Moon','risingWeek');
 renderWeek('Waning Moon','waningWeek');
 renderTree('Rising Moon','risingTree');
 renderTree('Waning Moon','waningTree');

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
   setMode('fallback', false);
   showTimingChoices(true);
   $('statusText').textContent='Choose timing method';
   $('statusDetails').textContent='Use location for local timing, or choose another method.';
 }
 setInterval(()=>{if(APP){build();renderCurrent()}},1000)
}
init();
