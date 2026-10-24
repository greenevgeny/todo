'use strict';

// Civil dates stay in UTC containers; all clock labels use Austin's real zone.
const ZONE = 'America/Chicago', LAT = 30.2672, LON = -97.7431;
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fullMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const dateOf = iso => new Date(iso + 'T12:00:00Z');
const isoOf = d => d.toISOString().slice(0, 10);
const addDays = (d, n) => { const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x; };
const civil = (y, m, d) => new Date(Date.UTC(y, m, d, 12));
const yearDays = y => Math.round((Date.UTC(y + 1, 0, 1) - Date.UTC(y, 0, 1)) / 864e5);
const dayOfYear = d => Math.round((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - Date.UTC(d.getUTCFullYear(), 0, 1)) / 864e5);
const fmtDate = d => new Intl.DateTimeFormat('en-US', {month:'short',day:'numeric',timeZone:'UTC'}).format(d);
const esc = text => String(text).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function zoneParts(d) {
  const p = new Intl.DateTimeFormat('en-US',{timeZone:ZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(d);
  return Object.fromEntries(p.filter(x => x.type !== 'literal').map(x => [x.type, +x.value]));
}
function today() { const p = zoneParts(new Date()); return civil(p.year,p.month-1,p.day); }
function utcOffset(d) {
  const t = Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate(),18);
  const p = zoneParts(new Date(t));
  return (Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second)-t)/36e5;
}
function solar(d) {
  const n = dayOfYear(d) + 1;
  const decl = rad(23.44) * Math.sin(2*Math.PI*(284+n)/365);
  const B = 2*Math.PI*(n-81)/364, eot = 9.87*Math.sin(2*B)-7.53*Math.cos(B)-1.5*Math.sin(B);
  const noon = 720 + (utcOffset(d)*15-LON)*4 - eot;
  const span = angle => {
    const c = (Math.sin(rad(angle))-Math.sin(rad(LAT))*Math.sin(decl))/(Math.cos(rad(LAT))*Math.cos(decl));
    return c >= 1 ? 0 : c <= -1 ? 24 : 2*deg(Math.acos(c))/15;
  };
  const hours = span(-.833);
  return {hours,noon,decl,rise:noon-hours*30,set:noon+hours*30,dark:24-span(-6)};
}
function altitude(s,m) {
  const H = rad((m-s.noon)/4);
  return deg(Math.asin(Math.sin(rad(LAT))*Math.sin(s.decl)+Math.cos(rad(LAT))*Math.cos(s.decl)*Math.cos(H)));
}
function duration(h) {
  const total = Math.round(h*60);
  return Math.floor(total/60)+'h '+String(total%60).padStart(2,'0')+'m';
}
function clock(m) {
  const n = (Math.round(m)%1440+1440)%1440, h = Math.floor(n/60);
  return (h%12||12)+':'+String(n%60).padStart(2,'0')+' '+(h<12?'AM':'PM');
}
function season(d) {
  const m = d.getUTCMonth();
  if (m >= 5 && m <= 8) return ['Make room for shade','Long days are not the same as comfortable days. Start outside early, pause indoors, and check actual heat and storm alerts.'];
  if (m >= 2 && m <= 4) return ['A little more time outdoors','A useful starting point for waterside walks and city exploring. Spring weather still changes; keep your plans flexible.'];
  if (m === 9 || m === 10) return ['A slower kind of golden hour','Build a day around the lake, a cultural stop and an evening performance. Warm spells can linger; check the forecast.'];
  return ['Short days, good stories','Mix the waterfront with galleries, the Capitol and live music. Bring layers and allow for occasional cold weather.'];
}
const state = {date:today(),pick:null,step:0,route:'water',skyProgress:0};
const plan = {date:today(),days:4,goals:new Set(['water','food','music']),transport:'local',pace:'easy'};
const goals = [
  {id:'water',name:'Waterfront walks',group:'A little outside'},
  {id:'swim',name:'Springs & swimming',group:'A little outside'},
  {id:'hills',name:'Hill Country',group:'A little outside'},
  {id:'culture',name:'Culture & history',group:'A little city'},
  {id:'food',name:'Food & slow mornings',group:'A little city'},
  {id:'music',name:'Live music',group:'After the sun'},
  {id:'bats',name:'An evening with bats',group:'After the sun'},
  {id:'photo',name:'Golden-hour photos',group:'After the sun'}
];
const pictures = {
  skyline:'assets/images/skyline.svg',night:'assets/images/night.svg',bridge:'assets/images/bridge.svg',
  springs:'assets/images/springs.svg',capitol:'assets/images/capitol.svg',hills:'assets/images/hills.svg',
  music:'assets/images/music.svg',congress:'assets/images/congress.svg'
};
const places = [
  ['Lady Bird Lake','Start with the city reflected in water. A short section of the Butler Trail is enough to trade downtown pace for something quieter.','skyline','Walk beside the lake; choose a designated pool for swimming.'],
  ['Barton Springs','A different kind of Austin blue. Build time around a pool visit, and check the operator’s access information before you go.','springs','Pool closures and access rules can change.'],
  ['Congress Avenue Bridge','Stay for the skyline; watch for bats if the season and conditions line up. Wildlife does not follow a ticketed schedule.','bridge','Seasonal possibility, never a guaranteed emergence.'],
  ['Texas State Capitol','Limestone-colored light, civic history and a pause from the street. Check visitor access and tour information when planning.','capitol','A cultural stop rather than another outdoor mile.'],
  ['South Congress','A walk that can turn into a whole afternoon: shops, coffee, food and people watching. Give yourself permission to wander.','congress','Leave room between the stops.'],
  ['A live-music evening','Choose a show for its sound, not just its address. Check the lineup, ticket requirements and age policy directly with the venue.','music','Shows, prices and entry rules are not supplied live.'],
  ['Beyond the skyline','Out west, the landscape begins to breathe differently. Choose one Hill Country park and let it have the day.','hills','Plan transport and check access before setting out.']
];
const routeData = {
  water:{title:'Water & skyline',sub:'Find the city at the water’s edge',image:'skyline',from:'Lady Bird Lake',to:'A slower evening',meta:'City route · walking plus a short local ride',desc:'An early walk, a cooling pause, and the moment the lights begin to double in the water.',stops:[
    ['Start by the lake','Walk a manageable section of the Butler Trail. The whole loop is not required to get the feeling.','skyline','Morning'],
    ['Change into spring time','If pool access works for your date, make Barton Springs your main stop. Otherwise choose a shaded or indoor break.','springs','Late morning'],
    ['Let lunch take its time','A meal and a proper break are part of the route. In hot weather, resist the urge to fill every hour outdoors.','congress','Afternoon'],
    ['Watch the city switch on','Return to the waterfront for evening light. In the usual bat season, check guidance and decide whether to stay near the bridge.','bridge','Evening']
  ]},
  culture:{title:'Streets & sound',sub:'From a quiet detail to a live room',image:'congress',from:'The Capitol',to:'The last song',meta:'City route · check transit or rideshare between districts',desc:'Civic history, a street with its own personality, food worth lingering over, and a show you chose on purpose.',stops:[
    ['Begin with a little history','Check visiting information for the Texas State Capitol. Take time for the building and its context.','capitol','Morning'],
    ['Walk with no shopping list','Explore a short stretch of South Congress. The pleasure is in looking, stopping, and letting the street set your pace.','congress','Afternoon'],
    ['Give dinner its own chapter','Choose one place that suits your appetite and budget. This guide does not invent reservations or rank the best restaurant.','skyline','Early evening'],
    ['Follow the sound','Pick a real performance from a current venue calendar. Check tickets, age restrictions and the way home before the first set.','music','After dark']
  ]},
  hills:{title:'Into the Hill Country',sub:'A whole day for a little more space',image:'hills',from:'Austin',to:'Pedernales Falls area',meta:'Regional day trip · car needed · reserve and check conditions',desc:'A slower alternative to city hopping. Choose one destination, check its access rules, and keep the drive part of the plan.',stops:[
    ['Make the morning unhurried','Check park alerts and reservations before leaving. Leave extra driving time instead of promising an exact arrival.','hills','Before departure'],
    ['Read the landscape','At Pedernales Falls State Park, follow current trail and river guidance. This route does not recommend swimming in the falls area.','hills','Morning'],
    ['A pause, not another park','Find a permitted picnic or rest area. Respect closures and do not enter the river when conditions are unsafe.','springs','Midday'],
    ['Bring the quiet back','Return to Austin with enough time for the park’s closing rules. Keep an indoor city alternative if heat or storms change the day.','night','Before closing']
  ]}
};
let S = solar(state.date), skyScene, nightScene, reelScene, triggers=[];
function markSVG(hours) {
  const f = hours/24, R=34, a=Math.PI*f;
  return '<circle cx="60" cy="58" r="34" fill="none" stroke="currentColor" stroke-opacity=".25" stroke-width="5"/>'+
    '<path d="M'+(60-R*Math.sin(a))+' '+(58-R*Math.cos(a))+' A34 34 0 '+(f>.5?1:0)+' 1 '+(60+R*Math.sin(a))+' '+(58-R*Math.cos(a))+'" fill="none" stroke="#f2a541" stroke-width="5" stroke-linecap="round"/>'+
    '<path d="M9 84H29V70H41V48H51V37H61V48H73V62H84V77H110V88H9Z" fill="currentColor"/><path d="M9 98H110" stroke="currentColor" stroke-width="2" opacity=".5"/>';
}
function notify(message) {
  const t=$('#toast');t.textContent=message;t.classList.add('on');
  clearTimeout(notify.timer);notify.timer=setTimeout(()=>t.classList.remove('on'),4200);
}
function setDate(d, syncPlan=true) {
  state.date=d;state.pick=null;S=solar(d);
  document.documentElement.dataset.theme=S.hours>=13.5?'day':'dusk';
  $('[data-date-label]').textContent=fmtDate(d)+(isoOf(d)===isoOf(today())?' · today':'');
  $('[data-hours]').textContent=duration(S.hours);
  $('[data-countdown]').textContent='Sunrise '+clock(S.rise)+' · sunset '+clock(S.set);
  $('[data-mark]').innerHTML=markSVG(S.hours);
  $$('.chip').forEach(b=>b.classList.toggle('on',b.dataset.d==='today'&&isoOf(d)===isoOf(today())));
  if(syncPlan){plan.date=new Date(d);$('#pDate').value=isoOf(d);}
  drawRing();drawNight();drawDiary();drawPacking();renderPlan();refreshRoutes();
}
function applyDate(d) {setDate(d);notify('Your Austin is set to '+fmtDate(d)+'. The planner follows.');}
function drawRing() {
  const n=yearDays(state.date.getUTCFullYear()), start=civil(state.date.getUTCFullYear(),0,1), R0=169, R1=329;
  const P=(a,r)=>[Math.cos(a)*r,Math.sin(a)*r];
  let out='<circle r="155" fill="none" stroke="var(--line)"/><circle r="353" fill="none" stroke="var(--line)" stroke-dasharray="2 6"/>';
  for(let i=0;i<n;i++){
    const d=addDays(start,i),h=solar(d).hours,a=i/n*Math.PI*2-Math.PI/2;
    const p=P(a,R0),q=P(a,R0+6+(R1-R0)*h/24);
    const col=h>13?'#d9933b':h>11?'#8a9b77':'#668b9a';
    out+='<line x1="'+p[0]+'" y1="'+p[1]+'" x2="'+q[0]+'" y2="'+q[1]+'" stroke="'+col+'" stroke-width="2.4" stroke-linecap="round"/>';
  }
  months.forEach((m,i)=>{
    const a=dayOfYear(civil(state.date.getUTCFullYear(),i,15))/n*Math.PI*2-Math.PI/2,p=P(a,134);
    out+='<text x="'+p[0]+'" y="'+(p[1]+4)+'" text-anchor="middle" font-family="Inter" font-size="14" fill="var(--muted)">'+m+'</text>';
  });
  const a=dayOfYear(state.date)/n*Math.PI*2-Math.PI/2,p=P(a,160),q=P(a,344);
  out+='<line x1="'+p[0]+'" y1="'+p[1]+'" x2="'+q[0]+'" y2="'+q[1]+'" stroke="var(--text)" stroke-width="3"/><g id="ringPick"></g>';
  $('#ringSvg').innerHTML=out;
  $('#ringSvg').setAttribute('aria-valuemax',n);
  const strip=$('#yearStrip');strip.setAttribute('viewBox','0 0 '+n*2+' 90');
  strip.innerHTML=Array.from({length:n},(_,i)=>{
    const h=solar(addDays(start,i)).hours,hh=h/24*80;
    return '<rect x="'+i*2+'" y="'+(86-hh)+'" width="1.6" height="'+hh+'" fill="'+(h>13?'#d9933b':h>11?'#8a9b77':'#668b9a')+'"/>';
  }).join('')+'<rect id="stripPick" y="0" width="3" height="90" rx="1.5" fill="#1e2235"/>';
  showRing(state.date);
  const [title,copy]=season(state.date);$('[data-season-title]').textContent=title;$('[data-season-copy]').textContent=copy;
  const y=state.date.getUTCFullYear();
  const events=[[2,20,'Spring equinox'],[5,21,'Summer solstice'],[8,22,'Fall equinox'],[11,21,'Winter solstice']]
    .flatMap(([m,d,t])=>[y,y+1].map(yy=>({d:civil(yy,m,d),t}))).filter(e=>e.d>=state.date).sort((a,b)=>a.d-b.d).slice(0,2);
  $('[data-events]').innerHTML=events.map(e=>'<li><button data-event="'+isoOf(e.d)+'"><em>Seasonal marker · approximate date</em><b>'+e.t+'</b><span>'+fmtDate(e.d)+'</span></button></li>').join('');
  $$('[data-event]').forEach(b=>b.onclick=()=>applyDate(dateOf(b.dataset.event)));
}
function showRing(d) {
  const s=solar(d),n=yearDays(d.getUTCFullYear()),i=dayOfYear(d),a=i/n*Math.PI*2-Math.PI/2;
  $('[data-ring-date]').textContent=fmtDate(d)+' · '+d.getUTCFullYear();
  $('[data-ring-hours]').textContent=duration(s.hours);
  $('[data-ring-state]').textContent='Sunrise '+clock(s.rise)+' · sunset '+clock(s.set)+' (approx.)';
  $('[data-ring-ico]').innerHTML='<svg viewBox="0 0 120 120" aria-hidden="true" style="color:#1e2235">'+markSVG(s.hours)+'</svg>';
  $('#ringPick').innerHTML='<circle cx="'+Math.cos(a)*354+'" cy="'+Math.sin(a)*354+'" r="10" fill="#e08a1e" stroke="#eee8dc" stroke-width="3"/>';
  $('#stripPick').setAttribute('x',i*2);
  $('#ringSvg').setAttribute('aria-valuenow',i+1);$('#ringSvg').setAttribute('aria-valuetext',fmtDate(d)+', '+duration(s.hours)+' daylight');
}
function ringPoint(e) {
  const r=$('#ringSvg').getBoundingClientRect();let a=Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2)+Math.PI/2;if(a<0)a+=Math.PI*2;
  return addDays(civil(state.date.getUTCFullYear(),0,1),Math.min(yearDays(state.date.getUTCFullYear())-1,Math.floor(a/(Math.PI*2)*yearDays(state.date.getUTCFullYear()))));
}
$('#ringSvg').addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){state.pick=ringPoint(e);showRing(state.pick);}});
$('#ringSvg').addEventListener('pointerleave',()=>{state.pick=null;showRing(state.date);});
$('#ringSvg').addEventListener('click',e=>applyDate(ringPoint(e)));
$('#ringSvg').addEventListener('keydown',e=>{
  const delta={ArrowRight:1,ArrowUp:1,ArrowLeft:-1,ArrowDown:-1}[e.key];
  if(delta){e.preventDefault();const next=addDays(state.pick||state.date,delta*(e.shiftKey?7:1));if(next.getUTCFullYear()!==state.date.getUTCFullYear()){setDate(next);}state.pick=next;showRing(next);}
  if(e.key==='Enter'||e.key===' '){e.preventDefault();applyDate(state.pick||state.date);}
  if(e.key==='Home'){e.preventDefault();applyDate(civil(state.date.getUTCFullYear(),0,1));}
});
$('#yearStrip').addEventListener('click',e=>{
  const r=e.currentTarget.getBoundingClientRect(),n=yearDays(state.date.getUTCFullYear());
  applyDate(addDays(civil(state.date.getUTCFullYear(),0,1),clamp(Math.floor((e.clientX-r.left)/r.width*n),0,n-1)));
});
$('[data-apply]').onclick=()=>applyDate(state.pick||state.date);
$('[data-today]').onclick=()=>applyDate(today());
$$('[data-d]').forEach(b=>b.onclick=()=>{
  const iso=b.dataset.d==='today'?isoOf(today()):today().getUTCFullYear()+'-'+b.dataset.d;
  applyDate(dateOf(iso));$$('[data-d]').forEach(x=>x.classList.toggle('on',x===b));
});
$$('[data-month-axis]').forEach(el=>el.innerHTML=months.map(m=>'<span>'+m+'</span>').join(''));

// Itinerary suggestions use conservative seasonal rules, never live availability.
function batSeason(d){const m=d.getUTCMonth();return m>=2&&m<=9;}
function warmSeason(d){return d.getUTCMonth()>=5&&d.getUTCMonth()<=8;}
function fitGoal(id,dates) {
  if(id==='bats')return dates.some(batSeason)?['maybe','Bats are a seasonal possibility. Check local guidance; emergence is never guaranteed.']:['maybe','Outside the usual spring-to-fall viewing period. Use city lights or a show as your evening plan.'];
  if(id==='hills')return plan.transport==='car'?['maybe','A car, access checks and possibly a park reservation are needed. Weather can change the plan.']:['maybe','This city itinerary will use a local alternative. Add a car or book suitable transport for a regional day trip.'];
  if(id==='swim')return ['maybe','Check pool access, closures and current conditions. No swimming stop is a confirmed booking.'];
  if(id==='music')return ['maybe','Select a performance from a current venue calendar. Check tickets, age policy and transport home.'];
  if(id==='water'&&dates.some(warmSeason))return ['maybe','Favor a short morning walk. Keep shade, water and an indoor break in the plan.'];
  return ['ok','A flexible city idea. Check current access, opening information and your exact route.'];
}
function buildPlan() {
  const dates=Array.from({length:plan.days},(_,i)=>addDays(plan.date,i));
  const days=dates.map(d=>({date:d,items:[]}));
  const notes=new Set(),g=plan.goals;
  const add=(i,time,text)=>days[i]&&days[i].items.push({time,text});
  add(0,'Arrive','Arrive, settle in, and leave time for airport traffic.');
  add(0,'Later',g.has('water')||g.has('photo')?'A short waterfront walk if your arrival time and conditions allow.':'A gentle first look around your neighborhood.');
  if(g.has('food'))add(0,'Dinner','Choose a nearby meal; save the cross-city food expedition for another day.');
  let slots=Array.from({length:Math.max(0,plan.days-2)},(_,i)=>i+1);
  if(plan.days===2){notes.add('Two days leave limited time after arrival and before departure. For a Hill Country trip or more city exploring, add a day.');}
  const reserve=(fn)=>{if(!slots.length)return false;fn(slots.shift());return true;};
  if(g.has('hills')){
    if(plan.transport==='car'&&slots.length){reserve(i=>{
      add(i,'Early','Check the reservation, park alerts and weather before driving toward Pedernales Falls.');
      add(i,'Daytime','Choose one permitted trail or overlook. Follow current river guidance; do not swim in the falls area.');
      add(i,'Return','Leave within park access hours. Keep a city alternative if heat, storms or closures change the day.');
    });notes.add('Day-trip entry is not reserved. Allow for traffic and check the park operator directly.');}
    else notes.add(plan.transport==='car'?'A regional day trip needs a full day between arrival and departure. Add days to include it.':'Hill Country was requested, but no car is selected. This plan stays in the city; arrange suitable transport separately if you want to go.');
  }
  if(g.has('swim')&&slots.length)reserve(i=>{
    add(i,'Morning','Check Barton Springs Pool access and closures before heading out.');
    add(i,'Main stop','If access and conditions work, enjoy the pool. Otherwise switch to a cultural stop and a shaded break.');
    if(plan.pace==='full')add(i,'Later','Explore a short nearby street or stop for food, with a local ride if needed.');
  });
  if(g.has('culture')&&slots.length)reserve(i=>{
    add(i,'Morning','Visit the Texas State Capitol if visitor access works for the day.');
    add(i,'Afternoon','Leave time for a museum or gallery chosen from current opening information.');
    if(plan.pace==='full')add(i,'Later','A short South Congress stroll; use transit or a ride between districts.');
  });
  slots.forEach((i,j)=>{
    add(i,'Morning',g.has('water')?'A manageable Butler Trail walk by Lady Bird Lake.':'Coffee and a slow neighborhood morning.');
    add(i,'Afternoon',g.has('food')?'Choose a food stop you want to linger over; keep an indoor break.':'Explore a cultural stop or South Congress at your own pace.');
    if(plan.pace==='full')add(i,'Later',j%2?'Return to the waterfront if conditions suit.':'A second short neighborhood walk, with transport between districts.');
  });
  add(plan.days-1,'Morning','Keep the final morning local: breakfast and a short look around if departure time allows.');
  add(plan.days-1,'Depart','Allow time to collect bags and reach your airport or onward connection.');
  if(g.has('swim')&&!days.some(d=>d.items.some(x=>x.text.includes('Barton Springs'))))notes.add('Pool time needs a usable half day. Check access and fit it around your arrival or extend the trip.');
  if(g.has('culture')&&!days.some(d=>d.items.some(x=>x.text.includes('Capitol'))))notes.add('Culture was requested; choose a short local stop only if your arrival or departure leaves time.');
  const nightIndex=plan.days>2?Math.min(1,plan.days-2):0;
  if(g.has('bats')){
    if(batSeason(days[nightIndex].date))add(nightIndex,'Dusk','Optional Congress Avenue Bridge bat viewing after checking local guidance. A skyline evening is the fallback.');
    else notes.add('Your dates are outside the usual spring-to-fall bat-viewing period. Choose a skyline evening instead.');
  }
  if(g.has('music')){
    const i=plan.days>3?plan.days-2:nightIndex;
    add(i,'Evening','Optional live performance. Check a real venue calendar, tickets and age restrictions, and plan a way home.');
  }
  if(g.has('photo')){
    const i=plan.days>2?plan.days-2:0;
    add(i,'Sunset','If the schedule and weather allow, waterfront light around '+clock(solar(days[i].date).set-35)+' (approximate).');
  }
  if(dates.some(warmSeason))notes.add('Summer-minded plan: shorten outdoor time if it is hot, choose shade, and check current heat and thunderstorm alerts.');
  notes.add('No live weather, opening hours, ticket inventory or reservations are checked by this planner.');
  return {days,notes:[...notes]};
}
function renderPlan() {
  const {days,notes}=buildPlan(),last=days[days.length-1],hs=days.map(d=>solar(d.date).hours);
  $('[data-fit]').innerHTML=[...plan.goals].map(id=>{
    const [c,text]=fitGoal(id,days.map(x=>x.date)),name=goals.find(g=>g.id===id).name;
    return '<li class="'+c+'"><b>'+name+'</b> — '+text+'</li>';
  }).join('')||'<li class="ok">No interests selected. Your plan leaves room for a general city visit.</li>';
  $('[data-date-src]').textContent=season(plan.date)[1];
  const bars=Array.from({length:34},(_,i)=>'<i style="width:'+(1+(i*7)%4)+'px"></i>').join('');
  $('[data-result]').innerHTML='<div class="ticket"><div class="t-main"><div class="t-head"><span class="mono">Your Austin · suggested itinerary</span><span class="mono">'+isoOf(plan.date)+'</span></div>'+
    '<div class="t-route"><div><div class="t-code">YOU</div><div class="t-city">A little curiosity</div></div><div class="t-arc"><svg viewBox="0 0 120 30" aria-hidden="true"><path d="M4 26Q60 -6 116 26" fill="none" stroke="currentColor" stroke-dasharray="3 4"/><circle cx="60" cy="10" r="5" fill="#e08a1e"/></svg></div><div class="t-right"><div class="t-code">ATX</div><div class="t-city">Austin, Texas</div></div></div>'+
    '<div class="t-meta"><div><span class="mono">Your dates</span><b>'+fmtDate(plan.date)+' – '+fmtDate(last.date)+'</b></div><div><span class="mono">Days</span><b>'+plan.days+'</b></div><div><span class="mono">Daily daylight</span><b>'+duration(Math.min(...hs))+(Math.round(Math.min(...hs)*60)!==Math.round(Math.max(...hs)*60)?' – '+duration(Math.max(...hs)):'')+'</b></div></div>'+
    '<ol class="t-days">'+days.map((d,i)=>'<li style="--dc:'+(warmSeason(d.date)?'#e08a1e':'#668b9a')+'"><div class="t-day-h"><b>Day '+(i+1)+'</b><span>'+fmtDate(d.date)+'</span></div><ul>'+d.items.map(x=>'<li><span class="tm">'+x.time+'</span><span>'+esc(x.text)+'</span></li>').join('')+'</ul></li>').join('')+'</ol></div>'+
    '<div class="t-stub"><div class="mono">Keep this feeling</div><div class="t-code sm">ATX</div><div class="mono">'+plan.days+' days</div><div class="mono">'+(plan.transport==='car'?'Car available':'City connections')+'</div><div class="t-bar" aria-hidden="true">'+bars+'</div><div class="mono">Not a booking</div></div></div>'+
    '<div class="r-actions"><button class="btn" data-copy-link>Copy your trip link</button><button class="btn ghost" data-copy-text>Copy itinerary</button><button class="btn ghost" data-download>Save as text ↓</button></div><div class="r-toast" data-copy-status role="status"></div>'+
    '<ul class="ticket-notes">'+notes.map(n=>'<li>'+n+'</li>').join('')+'</ul>';
  $('[data-copy-link]').onclick=()=>copyText(tripLink());
  $('[data-copy-text]').onclick=()=>copyText(tripText());
  $('[data-download]').onclick=downloadTrip;
}
function tripLink() {
  const u=new URL(location.href);u.hash='plan';
  u.searchParams.set('date',isoOf(plan.date));u.searchParams.set('days',plan.days);u.searchParams.set('goals',[...plan.goals].join(','));
  u.searchParams.set('transport',plan.transport);u.searchParams.set('pace',plan.pace);return u.href;
}
function tripText() {
  const p=buildPlan();
  return 'YOUR AUSTIN — suggested itinerary\n'+isoOf(plan.date)+' · '+plan.days+' days\n\n'+p.days.map((d,i)=>'Day '+(i+1)+' · '+fmtDate(d.date)+'\n'+d.items.map(x=>x.time+': '+x.text).join('\n')).join('\n\n')+'\n\nKeep in mind\n'+p.notes.map(x=>'• '+x).join('\n')+'\n\n'+tripLink();
}
async function copyText(text) {
  try{if(!navigator.clipboard)throw new Error('Unavailable');await navigator.clipboard.writeText(text);$('[data-copy-status]').textContent='Copied. Keep it, share it, make it your own.';}
  catch{const area=document.createElement('textarea');area.value=text;area.style.cssText='position:fixed;left:-10000px;top:0';document.body.append(area);area.select();let ok=false;try{ok=document.execCommand('copy');}catch{}area.remove();$('[data-copy-status]').textContent=ok?'Copied. Your trip is ready to share.':'Clipboard unavailable here. Use “Save as text” to keep your plan.';}
}
function downloadTrip() {
  const blob=new Blob([tripText()],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='Austin-'+isoOf(plan.date)+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  $('[data-copy-status]').textContent='Your itinerary has been saved as a text file.';
}
function readTrip() {
  const p=new URLSearchParams(location.search),d=p.get('date');
  if(d&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!isNaN(+dateOf(d))&&isoOf(dateOf(d))===d){plan.date=dateOf(d);state.date=dateOf(d);}
  if(p.has('days'))plan.days=clamp(Math.round(+p.get('days'))||4,2,7);
  if(p.has('goals'))plan.goals=new Set(p.get('goals').split(',').filter(x=>goals.some(g=>g.id===x)));
  if(p.get('transport')==='car')plan.transport='car';
  if(p.get('pace')==='full')plan.pace='full';
}
function initPlanner() {
  const groups=[...new Set(goals.map(g=>g.group))];
  $('[data-goals-opts]').innerHTML=groups.map(group=>'<div class="q-group"><div class="mono">'+group+'</div><div class="opts">'+goals.filter(g=>g.group===group).map(g=>'<button class="opt" data-goal="'+g.id+'" aria-pressed="'+plan.goals.has(g.id)+'">'+g.name+'</button>').join('')+'</div></div>').join('');
  function syncGoals(){$$('[data-goal]').forEach(b=>{const on=plan.goals.has(b.dataset.goal);b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);});}
  $$('[data-goal]').forEach(b=>b.onclick=()=>{plan.goals.has(b.dataset.goal)?plan.goals.delete(b.dataset.goal):plan.goals.add(b.dataset.goal);syncGoals();renderPlan();});
  syncGoals();$('#pDate').value=isoOf(plan.date);$('#pDays').value=plan.days;$('#pTransport').value=plan.transport;$('#pPace').value=plan.pace;$('[data-days-num]').textContent=plan.days;
  $('#pDate').onchange=e=>{const v=e.target.value;if(v&&!isNaN(+dateOf(v)))setDate(dateOf(v));};
  $('#pDays').oninput=e=>{plan.days=+e.target.value;$('[data-days-num]').textContent=plan.days;renderPlan();};
  $('#pTransport').onchange=e=>{plan.transport=e.target.value;renderPlan();};
  $('#pPace').onchange=e=>{plan.pace=e.target.value;renderPlan();};
  $('[data-best]').onclick=()=>{const now=today();let d=civil(now.getUTCFullYear(),3,15);if(d<now)d=civil(now.getUTCFullYear()+1,3,15);setDate(d);notify('April 15 is an editorial starting point, not a weather guarantee.');};
  function showStep(n){
    state.step=clamp(n,0,2);$$('[data-q]').forEach(el=>el.hidden=+el.dataset.q!==state.step);
    $$('[data-go]').forEach(b=>{b.classList.toggle('on',+b.dataset.go===state.step);b.classList.toggle('done',+b.dataset.go<state.step);b.setAttribute('aria-current',+b.dataset.go===state.step?'step':'false');});
    $('[data-prev]').style.visibility=state.step===0?'hidden':'visible';$('[data-next]').textContent=state.step===2?'See your itinerary ↓':'Next →';
  }
  $$('[data-go]').forEach(b=>b.onclick=()=>showStep(+b.dataset.go));
  $('[data-prev]').onclick=()=>showStep(state.step-1);
  $('[data-next]').onclick=()=>{if(state.step<2)showStep(state.step+1);else{$('#result').scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});$('#result').focus({preventScroll:true});}};
  showStep(0);
}

function renderPlaces() {
  $('#cityTrack').innerHTML=places.map(([title,text,img,note],i)=>'<article class="place-card"><div class="ph" style="background-image:url('+pictures[img]+')"><span class="n num">'+String(i+1).padStart(2,'0')+'</span><span class="art-label">Illustrated preview</span></div><h3>'+title+'</h3><p>'+text+'</p><p class="place-note">'+note+'</p></article>').join('');
  $$('[data-city-go]').forEach(b=>b.onclick=()=>{
    const track=$('#cityTrack'),amount=$('.place-card',track).getBoundingClientRect().width+32;
    track.scrollBy({left:+b.dataset.cityGo*amount,behavior:reduce?'auto':'smooth'});
  });
  const ribbon=[['skyline','springs','congress','bridge','hills','capitol'],['music','hills','bridge','skyline','springs','congress']];
  $('#strips').innerHTML=ribbon.map((row,i)=>'<div class="strip" data-row="'+i+'">'+[...row,...row].map(k=>'<img src="'+pictures[k]+'" alt="" loading="lazy" width="1200" height="800">').join('')+'</div>').join('');
}
function renderRoutes() {
  $$('[data-route]').forEach(el=>{
    const key=el.dataset.route,r=routeData[key];
    el.innerHTML='<div class="route-hero"><div class="bg" style="background-image:url('+pictures[r.image]+')"></div><div class="wrap route-head"><div class="eyebrow">A day, not a checklist</div><h2>'+r.title+'</h2><div class="sub">'+r.sub+'</div><p class="desc">'+r.desc+'</p><div class="meta">'+r.meta+'</div><div class="route-dist"><b>'+r.from+'</b><span class="line"></span><b>'+r.to+'</b></div></div></div>'+
      '<div class="route-body"><svg class="route-path" aria-hidden="true"><path class="rp-base" fill="none" stroke="#f5f2ea" stroke-opacity=".3" stroke-width="2" stroke-dasharray="1 7" stroke-linecap="round"/><path class="rp-line" fill="none" stroke="#e6b775" stroke-width="3" stroke-linecap="round"/><g class="rp-dots"></g></svg>'+
      r.stops.map(([title,text,img,time],i)=>'<div class="stop"><div class="bg" style="background-image:url('+pictures[img]+')"></div><div class="shade"></div><div class="txt"><div class="n">'+String(i+1).padStart(2,'0')+' <span>/ 04</span></div><div class="lt" data-lt="'+i+'">'+time+'</div><h3>'+title+'</h3><p>'+text+'</p><div class="dash"></div></div><div class="credit">Stylized illustration · not a photograph</div></div>').join('')+'</div>'+
      '<div class="route-next"><div class="bg" style="background-image:url('+pictures.night+')"></div><div class="txt"><div class="eyebrow">Your next chapter</div><h3>There is still a little music left in the day.</h3><a href="#plan">Make it your trip →</a></div></div>';
  });
  function show(key){
    state.route=key;$$('[data-tab]').forEach(b=>{const on=b.dataset.tab===key;b.classList.toggle('on',on);b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1;});
    $$('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==key);
    layoutRoute($('.route[data-route="'+key+'"]'));window.ScrollTrigger?.refresh();
  }
  $$('[data-tab]').forEach((b,i,arr)=>{
    b.onclick=()=>show(b.dataset.tab);
    b.onkeydown=e=>{const delta=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(delta){e.preventDefault();const next=arr[(i+delta+arr.length)%arr.length];show(next.dataset.tab);next.focus();}};
  });
  show('water');
}
function layoutRoute(el) {
  if(!el||el.closest('[hidden]'))return;
  const body=$('.route-body',el),rect=body.getBoundingClientRect(),W=rect.width,H=rect.height;
  if(!W||!H)return;
  const small=W<700,points=$$('.stop',el).map((s,i)=>{
    const text=$('.txt',s),r=text.getBoundingClientRect(),x=small?24:W*[.10,.18,.12,.20][i];
    text.style.setProperty('--tx',(x+28)+'px');
    return [x,r.top-rect.top+10];
  });
  let d='M'+points[0][0]+' 0';
  points.forEach(([x,y],i)=>{if(!i)d+=' L'+x+' '+y;else{const [px,py]=points[i-1],mid=(py+y)/2;d+=' C'+px+' '+mid+' '+x+' '+mid+' '+x+' '+y;}});
  d+=' L'+points[points.length-1][0]+' '+H;
  const svg=$('.route-path',el);svg.setAttribute('viewBox','0 0 '+W+' '+H);
  $$('path',svg).forEach(p=>p.setAttribute('d',d));
  $('.rp-dots',svg).innerHTML=points.map(([x,y])=>'<g class="dot on" transform="translate('+x+' '+y+')" style="--c:#e6b775"><circle class="sun-glow" r="16"/><circle class="sun" r="7"/></g>').join('');
  const line=$('.rp-line',el);el._route={line,L:line.getTotalLength()};routeProgress(el,el._progress||0);
}
function routeProgress(el,p){el._progress=p;if(el._route){el._route.line.style.strokeDasharray=el._route.L;el._route.line.style.strokeDashoffset=el._route.L*(1-(reduce?1:p));}}
function refreshRoutes(){
  $$('[data-route]').forEach(el=>{
    const r=routeData[el.dataset.route],times=[Math.max(S.rise+50,8*60),11*60,15*60,S.set-30];
    $$('[data-lt]',el).forEach((label,i)=>{label.textContent=r.stops[i][3]+' · '+clock(times[i])+' light reference';});
  });
}
function drawNight() {
  $('[data-chance]').innerHTML=months.map((m,i)=>{
    const dark=solar(civil(state.date.getUTCFullYear(),i,15)).dark;
    return '<div class="'+(i===state.date.getUTCMonth()?'cur':'')+'" style="height:'+dark/24*100+'%" title="'+m+': '+duration(dark)+' below civil twilight"></div>';
  }).join('');
}
function drawPacking(){
  const warm=warmSeason(state.date);
  const items=['Refillable water bottle','Comfortable walking shoes','Sun protection','A charged phone & return route',warm?'A plan for shade & indoor breaks':'Layers for changing conditions','Pool gear only if access is confirmed','Any park or show confirmations','Current weather & access checks'];
  $('[data-pack]').innerHTML=items.map(t=>'<li>'+t+'</li>').join('');
}
function drawDiary(){
  const prev=solar(addDays(state.date,-1)).hours,diff=Math.round((S.hours-prev)*60);
  $('[data-diary-title]').textContent=diff>0?'A little more day, every day.':diff<0?'The evenings draw a little closer.':'A pause in the turning year.';
  $('[data-reel]').textContent=duration(S.hours);$('[data-reel-sub]').textContent=fmtDate(state.date)+' · calculated daylight';
  $('[data-stories]').innerHTML=Array.from({length:6},(_,i)=>{
    const d=addDays(state.date,i+1),s=solar(d),delta=Math.round((s.hours-S.hours)*60);
    return '<div class="story" style="--sc:#e6b775;--sh:'+s.hours/24*100+'%"><div class="mono">'+fmtDate(d)+'</div><div class="st-bar"><i></i></div><b>'+duration(s.hours)+'</b><span>'+(delta>0?'+':'')+delta+' min from your selected day</span></div>';
  }).join('');
}

// The original site's sky idea, redrawn for a Texas skyline and river.
function makeSky(canvas,{word=false,night=false}={}) {
  const ctx=canvas.getContext('2d');let W=0,H=0,dpr=1,mask=null;
  const image=new Image();image.src=pictures.skyline;image.onload=()=>{mask=null;};
  function resize(){W=canvas.clientWidth;H=canvas.clientHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);mask=null;}
  function buildMask() {
    if(!word||!W||!image.complete||!image.naturalWidth)return;
    const off=document.createElement('canvas');off.width=W*dpr;off.height=H*dpr;const c=off.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);
    c.font='400 100px "Dela Gothic One"';
    const fs=Math.min(100*(W*.92)/c.measureText('AUSTIN').width,H*.28);c.font='400 '+fs+'px "Dela Gothic One"';c.textAlign='center';c.textBaseline='alphabetic';
    const y=H*(W<700?.43:.46);c.fillStyle='#fff';c.fillText('AUSTIN',W/2,y);
    c.globalCompositeOperation='source-in';c.drawImage(image,0,y-fs*.9,W,fs*1.1);
    c.globalCompositeOperation='source-atop';c.fillStyle='rgba(249,211,170,.22)';c.fillRect(0,0,W,H);
    c.globalCompositeOperation='source-over';c.strokeStyle='rgba(245,242,234,.7)';c.lineWidth=.8;c.strokeText('AUSTIN',W/2,y);mask=off;
  }
  function draw(m,t) {
    if(!W||!H)return;
    const alt=night?-18:altitude(S,m),dark=clamp((-alt+3)/15,0,1),sun=clamp((alt+6)/30,0,1);
    const mix=(a,b,k)=>a.map((x,i)=>Math.round(x+(b[i]-x)*k));
    const rgb=a=>'rgb('+a.join(',')+')';
    const g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,rgb(mix([6,13,32],[70,123,163],sun)));
    g.addColorStop(.53,rgb(mix([31,35,64],[221,169,137],sun)));
    g.addColorStop(1,rgb(mix([9,20,36],[119,141,151],sun)));
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    if(dark>.01){ctx.fillStyle='#eff3f7';for(let i=0;i<85;i++){ctx.globalAlpha=dark*(.2+.5*(.5+.5*Math.sin(t/1400+i)));ctx.fillRect(((i*173.1)%997)/997*W,((i*71.7)%541)/541*H*.55,1.2,1.2);}ctx.globalAlpha=1;}
    const hz=H*(word?.56:.69);
    if(alt>-6){const x=W*.5+(m-S.noon)/720*W*.7,y=hz-alt/70*H*.6;const halo=ctx.createRadialGradient(x,y,0,x,y,H*.28);halo.addColorStop(0,'rgba(255,216,164,.48)');halo.addColorStop(1,'rgba(255,216,164,0)');ctx.fillStyle=halo;ctx.fillRect(0,0,W,H);if(alt>-.8){ctx.fillStyle='#ffe5b4';ctx.beginPath();ctx.arc(x,y,Math.max(8,H*.014),0,Math.PI*2);ctx.fill();}}
    if(word){if(!mask)buildMask();if(mask)ctx.drawImage(mask,0,0,W,H);else{ctx.font='400 '+Math.min(W*.195,H*.28)+'px "Dela Gothic One"';ctx.textAlign='center';ctx.fillStyle='#d0d8de';ctx.fillText('AUSTIN',W/2,H*(W<700?.43:.46));}}
    // Low hills and stylized buildings; not a geographically exact panorama.
    ctx.fillStyle=rgb(mix([24,35,58],[79,108,119],sun));ctx.beginPath();ctx.moveTo(0,H);for(let x=0;x<=W+8;x+=8)ctx.lineTo(x,hz-H*.025-Math.sin(x/W*8)*H*.025);ctx.lineTo(W,H);ctx.fill();
    const base=hz+H*.06;ctx.fillStyle=rgb(mix([9,18,35],[36,58,73],sun));
    const count=28;
    for(let i=0;i<count;i++){
      const x=i*W/count,bw=W/count*.83,bh=H*(.025+((i*43)%89)/890);
      ctx.fillRect(x,base-bh,bw,bh);
      if(i===14||i===17){ctx.fillRect(x+bw*.3,base-bh-H*.025,bw*.4,H*.025);}
      if(dark>.1){ctx.fillStyle='rgba(255,204,135,'+dark*.6+')';for(let k=0;k<4;k++)ctx.fillRect(x+bw*.22,base-bh+10+k*11,2,3);ctx.fillStyle=rgb(mix([9,18,35],[36,58,73],sun));}
    }
    const water=ctx.createLinearGradient(0,base,0,H);water.addColorStop(0,rgb(mix([10,29,45],[53,94,112],sun)));water.addColorStop(1,'#071321');ctx.fillStyle=water;ctx.fillRect(0,base,W,H-base);
    ctx.strokeStyle='rgba(205,197,169,'+(.08+dark*.08)+')';ctx.lineWidth=1;
    for(let i=0;i<32;i++){const yy=base+(H-base)*(i/32),xx=((i*157)%997)/997*W+Math.sin(t/1800+i)*8;ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx+12+i%5*10,yy);ctx.stroke();}
    if(night){ctx.fillStyle='rgba(7,12,26,.8)';ctx.fillRect(0,H*.78,W,H*.018);ctx.strokeStyle='#33435d';ctx.lineWidth=5;for(let i=0;i<6;i++){ctx.beginPath();ctx.arc(i*W/5,H*.91,W/10,Math.PI,0);ctx.stroke();}}
  }
  resize();return{draw,resize,invalidate:()=>{mask=null;}};
}
function skyCaption(m) {
  const alt=altitude(S,m);
  if(alt< -6)return 'City lights, a late meal, one more song.';
  if(alt<0)return 'The light changes. The city changes key.';
  if(m<S.noon-120)return 'Start on the water. Keep a little morning to yourself.';
  if(m<S.noon+150)return 'A long lunch. A little shade. No need to hurry.';
  return 'Find the waterfront before the evening finds you.';
}
function setupMotion() {
  skyScene=makeSky($('#skyCanvas'),{word:true});nightScene=makeSky($('#nightCanvas'),{night:true});reelScene=makeSky($('#reelSky'));
  document.fonts.ready.then(()=>{skyScene.invalidate();window.ScrollTrigger?.refresh();});
  const hasMotion=!!window.gsap&&!!window.ScrollTrigger;
  if(hasMotion){
    gsap.registerPlugin(ScrollTrigger);ScrollTrigger.config({ignoreMobileResize:true});
    ScrollTrigger.create({trigger:'#sky',start:'top top',end:reduce?'+=0':'+=130%',pin:!reduce,scrub:true,onUpdate:t=>{state.skyProgress=t.progress;}});
    if(!reduce){
      const man=$('#manifest');man.innerHTML=man.innerHTML.split(/(\s+|<em>|<\/em>)/).map(p=>/^\s+$/.test(p)||p==='<em>'||p==='</em>'||!p?p:'<span class="w">'+p+'</span>').join('');
      gsap.fromTo('#manifest .w',{opacity:.14},{opacity:1,stagger:.06,ease:'none',scrollTrigger:{trigger:'.manifest',start:'top 78%',end:'bottom 45%',scrub:true}});
      $$('.strip').forEach((s,i)=>gsap.fromTo(s,{xPercent:i%2?-24:0},{xPercent:i%2?0:-24,ease:'none',scrollTrigger:{trigger:'.strips',start:'top bottom',end:'bottom top',scrub:true}}));
    }
    $$('[data-route]').forEach(el=>{
      layoutRoute(el);
      ScrollTrigger.create({trigger:$('.route-body',el),start:'top 70%',end:'bottom 65%',scrub:true,onUpdate:t=>routeProgress(el,t.progress),onRefresh:()=>layoutRoute(el)});
    });
  }else{$('#intro').remove();}
  let seen=false;try{seen=sessionStorage.getItem('austin-intro')==='1';sessionStorage.setItem('austin-intro','1');}catch{}
  const intro=$('#intro');
  if(intro){
    $('#introMark').innerHTML=markSVG(S.hours);
    if(reduce||seen||!hasMotion)intro.remove();
    else{
      const tl=gsap.timeline({onComplete:()=>intro.remove()}).from('#introMark',{opacity:0,scale:.88,duration:.65}).to('#introCap',{opacity:1,duration:.4},'-.3').to(intro,{opacity:0,duration:.5,delay:.3});
      intro.onclick=()=>tl.progress(1);const skip=()=>{if(intro.isConnected)tl.progress(1);};addEventListener('keydown',skip,{once:true});addEventListener('wheel',skip,{once:true,passive:true});
    }
  }
  let w=innerWidth;
  addEventListener('resize',()=>{
    if(matchMedia('(pointer:coarse)').matches&&innerWidth===w)return;w=innerWidth;
    [skyScene,nightScene,reelScene].forEach(s=>s.resize());$$('[data-route]').forEach(layoutRoute);
  });
  const visible=new Set(['skyCanvas']),observer=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?visible.add(e.target.id):visible.delete(e.target.id)),{rootMargin:'150px'});
  ['skyCanvas','nightCanvas','reelSky'].forEach(id=>observer.observe($('#'+id)));
  let lastFrame=0,lastMinute=-1;
  function loop(t){
    if(!document.hidden&&t-lastFrame>=(reduce?200:32)){
      lastFrame=t;const m=(7*60+state.skyProgress*1440)%1440;
      if(visible.has('skyCanvas'))skyScene.draw(m,reduce?0:t);
      if(visible.has('nightCanvas'))nightScene.draw(22*60,reduce?0:t);
      if(visible.has('reelSky'))reelScene.draw(S.set-20,reduce?0:t);
      if(Math.floor(m)!==lastMinute){lastMinute=Math.floor(m);$('[data-clock]').textContent=clock(m);$('[data-sky-state]').textContent=skyCaption(m);}
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
function initNavigation(){
  const burger=$('.burger'),nav=$('#mnav');
  function close(){nav.hidden=true;burger.setAttribute('aria-expanded','false');burger.setAttribute('aria-label','Open navigation');}
  burger.onclick=()=>{nav.hidden=!nav.hidden;burger.setAttribute('aria-expanded',!nav.hidden);burger.setAttribute('aria-label',nav.hidden?'Open navigation':'Close navigation');};
  $$('a',nav).forEach(a=>a.onclick=close);
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!nav.hidden){close();burger.focus();}});
  addEventListener('resize',()=>{if(innerWidth>1100)close();});
  const update=()=>{const r=$('#plan').getBoundingClientRect(),inPlan=r.top<innerHeight&&r.bottom>0;$('#top').classList.toggle('solid',scrollY>innerHeight*.6);$('#fab').classList.toggle('on',scrollY>innerHeight&&!inPlan);};
  addEventListener('scroll',update,{passive:true});update();
}
function localClock(){
  $('[data-board-clock]').textContent=new Intl.DateTimeFormat('en-US',{timeZone:ZONE,hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(new Date())+' · AUSTIN NOW';
}
readTrip();initPlanner();renderPlaces();renderRoutes();setDate(state.date);initNavigation();localClock();setInterval(localClock,30000);setupMotion();
