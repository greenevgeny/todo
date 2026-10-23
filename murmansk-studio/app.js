const months = [
  {name:'Январь', short:'янв', light:1.2, title:'Возвращение солнца', text:'После полярной ночи дневное окно растёт почти на глазах. Планируйте прогулки около полудня.'},
  {name:'Февраль', short:'фев', light:7.1, title:'Синий и золотой', text:'Солнце остаётся низким, а снег отражает свет. Хорошее время для города и зимних дорог.'},
  {name:'Март', short:'мар', light:11.8, title:'Длиннее с каждым днём', text:'Света уже почти как в средней полосе, но Север всё ещё зимний.'},
  {name:'Апрель', short:'апр', light:16.7, title:'Почти без темноты', text:'Поздние закаты оставляют много времени для маршрутов за городом.'},
  {name:'Май', short:'май', light:22.8, title:'Начало полярного дня', text:'Ночь превращается в продолжительные сумерки, а затем исчезает.'},
  {name:'Июнь', short:'июн', light:24, title:'Солнце не садится', text:'Самое светлое время года: часы перестают подсказывать, когда пора отдыхать.'},
  {name:'Июль', short:'июл', light:23.3, title:'Белая северная ночь', text:'В начале месяца солнце всё ещё остаётся над горизонтом круглые сутки.'},
  {name:'Август', short:'авг', light:17.2, title:'Ночь возвращается', text:'К концу месяца вновь можно увидеть первые сияния и настоящие звёзды.'},
  {name:'Сентябрь', short:'сен', light:13, title:'Равновесие', text:'День и ночь делят сутки почти поровну. Тундра окрашивается медью.'},
  {name:'Октябрь', short:'окт', light:8.2, title:'Сумеречный сезон', text:'День быстро убывает, но мягкий низкий свет делает город особенно графичным.'},
  {name:'Ноябрь', short:'ноя', light:3.1, title:'На пороге ночи', text:'Света мало — городские огни становятся частью дневного пейзажа.'},
  {name:'Декабрь', short:'дек', light:0, title:'Полярная ночь', text:'Солнце не появляется над горизонтом, но несколько часов держатся глубокие сумерки.'}
];

const places = [
  ['Атомный ледокол', 'Легенда арктического флота у городского причала. Геометрия палуб и портовые краны задают индустриальный ритм.', ['история','центр','в помещении'], '#315878', '#ffbf56'],
  ['Сопка над заливом', 'Высокая точка, откуда читается весь город: вода, порт, сопки и жилые кварталы на склонах.', ['панорама','ветрено','закат'], '#59637d', '#f4d4a0'],
  ['Порт и причалы', 'Рабочий Мурманск без декораций: буксиры, суда и незамерзающий Кольский залив.', ['архитектура','фото','прогулка'], '#1f4864', '#72e7b2'],
  ['Семёновское озеро', 'Городской маршрут для спокойной прогулки. Зимой здесь лёд и снег, летом — вода и длинный вечер.', ['семья','рядом','круглый год'], '#426f79', '#f8e4a7'],
  ['Маяк-памятник', 'Небольшая вертикаль у воды и тихое место для разговора о море, памяти и северных профессиях.', ['набережная','тихо','история'], '#263b5c', '#ffad42'],
  ['Художественный музей', 'Север в живописи, графике и предметах быта. Хорошая пауза в день с сильным ветром.', ['искусство','центр','тепло'], '#665266', '#d9b8ff'],
  ['Ночной город', 'Фонари, окна и портовый свет собирают отдельную карту города в месяцы, когда солнца мало.', ['вечер','фото','огни'], '#14284a', '#72e7b2']
];

const routes = [
  {id:'teri', name:'Териберка', meta:'≈ 130 км · север', sub:'Дорога к открытому морю', season:'круглый год', time:'2–3 часа', level:'средний', accent:'#72e7b2', stops:['тундровая дорога','берег Баренцева моря','каменные пляжи','водопад']},
  {id:'hib', name:'Хибины', meta:'≈ 210 км · юг', sub:'Горы, снег и озёра', season:'весь год', time:'3–4 часа', level:'активный', accent:'#d1b7ff', stops:['Кировск','горные перевалы','озеро Большой Вудъявр','смотровые точки']},
  {id:'ryb', name:'Рыбачий', meta:'≈ 230 км · запад', sub:'Тундра на краю земли', season:'июнь–сентябрь', time:'от 5 часов', level:'сложный', accent:'#ffad42', stops:['дорога через тундру','берег океана','каменные останцы','мыс на закате']}
];

const interests = [
  ['aurora','Северное сияние'], ['sea','Море'], ['mountains','Горы'], ['city','Город'], ['photo','Фотография'], ['slow','Спокойный темп']
];

const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];
let selectedMonth = new Date().getMonth();
let placeIndex = 0;
let routeIndex = 0;

function daylightForDate(date) {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const day = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - start) / 86400000);
  const estimate = 12 + 13.2 * Math.sin((2 * Math.PI * (day - 80)) / 365);
  return Math.max(0, Math.min(24, estimate));
}

function formatHours(n) {
  if (n <= .05) return '0 часов';
  if (n >= 23.95) return '24 часа';
  const h = Math.floor(n); const m = Math.round((n-h)*60);
  return `${h} ч ${String(m).padStart(2,'0')} мин`;
}

function updateClock() {
  const now = new Date();
  const murmansk = new Intl.DateTimeFormat('ru-RU', {timeZone:'Europe/Moscow', hour:'2-digit', minute:'2-digit'}).format(now);
  $('#clock').textContent = murmansk;
  const light = daylightForDate(new Date(now.toLocaleString('en-US', {timeZone:'Europe/Moscow'})));
  $('#hero-daylight').textContent = formatHours(light);
  $('#hero-season').textContent = light > 21 ? 'полярный день' : light < 2 ? 'полярная ночь' : 'смена света';
}

function buildCalendar() {
  $('#month-list').innerHTML = months.map((m,i) => `<button type="button" role="option" aria-selected="${i===selectedMonth}" data-month="${i}" class="${i===selectedMonth?'active':''}">${m.short}</button>`).join('');
  const ring = $('#day-ring');
  const r = 166, circumference = 2*Math.PI*r;
  let ticks='';
  for(let i=0;i<24;i++) { const a=i*15*Math.PI/180; ticks += `<line x1="${220+Math.cos(a)*188}" y1="${220+Math.sin(a)*188}" x2="${220+Math.cos(a)*201}" y2="${220+Math.sin(a)*201}"/>`; }
  ring.innerHTML = `<circle class="track" cx="220" cy="220" r="${r}"/><circle class="value" cx="220" cy="220" r="${r}" stroke-dasharray="${circumference}"/><g class="ticks">${ticks}</g>`;
  $$('#month-list button').forEach(b => b.addEventListener('click', () => selectMonth(+b.dataset.month)));
  selectMonth(selectedMonth);
}

function selectMonth(i) {
  selectedMonth=i;
  const m=months[i], circle=$('.day-ring .value'), circumference=2*Math.PI*166;
  $$('#month-list button').forEach((b,n) => { b.classList.toggle('active',n===i); b.setAttribute('aria-selected',n===i); });
  circle.style.strokeDashoffset = circumference*(1-m.light/24);
  circle.style.stroke = m.light < 3 ? '#72e7b2' : m.light > 20 ? '#ffad42' : '#dc8338';
  $('#ring-month').textContent=m.name; $('#ring-hours').textContent=formatHours(m.light);
  $('#season-title').textContent=m.title; $('#season-text').textContent=m.text;
}

function renderPlace() {
  const [name,text,tags,bg,accent]=places[placeIndex];
  $('#place-stage').innerHTML = `<div class="place-visual" style="--place-bg:${bg};--place-accent:${accent}"><span class="place-number">${String(placeIndex+1).padStart(2,'0')}</span></div><article class="place-copy"><p class="section-label">Место ${placeIndex+1} из ${places.length}</p><h3>${name}</h3><p>${text}</p><div class="place-meta">${tags.map(t=>`<span>${t}</span>`).join('')}</div></article>`;
  $('#place-dots').innerHTML=places.map((_,i)=>`<button type="button" class="${i===placeIndex?'active':''}" data-place="${i}" aria-label="Место ${i+1}"></button>`).join('');
  $$('#place-dots button').forEach(b=>b.addEventListener('click',()=>{placeIndex=+b.dataset.place;renderPlace();}));
}

function renderRoute() {
  $('#route-tabs').innerHTML=routes.map((r,i)=>`<button type="button" role="tab" aria-selected="${i===routeIndex}" class="${i===routeIndex?'active':''}" data-route="${i}"><strong>${r.name}</strong>${r.meta}</button>`).join('');
  const r=routes[routeIndex];
  $('#route-card').style.setProperty('--route-accent',r.accent);
  $('#route-card').innerHTML=`<p class="section-label">Маршрут ${String(routeIndex+1).padStart(2,'0')}</p><h3>${r.name}</h3><div class="route-sub">${r.sub}</div><div class="route-details"><div><span>Сезон</span><strong>${r.season}</strong></div><div><span>Дорога</span><strong>${r.time}</strong></div><div><span>Темп</span><strong>${r.level}</strong></div></div><div class="route-stops">${r.stops.map(s=>`<span>${s}</span>`).join('')}</div>`;
  $$('#route-tabs button').forEach(b=>b.addEventListener('click',()=>{routeIndex=+b.dataset.route;renderRoute();}));
}

function buildPlanner() {
  $('#interest-choices').innerHTML=interests.map(([id,label])=>`<label><input type="checkbox" name="interest" value="${id}"><span>${label}</span></label>`).join('');
  $('#trip-month').innerHTML=months.map((m,i)=>`<option value="${i}" ${i===selectedMonth?'selected':''}>${m.name}</option>`).join('');
  $('#trip-days').addEventListener('input',e=>{const n=+e.target.value;$('#days-output').textContent=`${n} ${n<5?'дня':'дней'}`;});
  $('#use-month').addEventListener('click',()=>{ $('#trip-month').value=selectedMonth; $('#planner').scrollIntoView(); });
  $('#trip-form').addEventListener('submit', e=>{e.preventDefault(); renderTrip();});
}

function renderTrip() {
  const picked=$$('input[name=interest]:checked').map(x=>x.value);
  const month=months[+$('#trip-month').value], days=+$('#trip-days').value;
  const pool=[];
  if(picked.includes('city')) pool.push('Портовая прогулка и музейный квартал');
  if(picked.includes('sea')) pool.push('Выезд к открытому морю');
  if(picked.includes('mountains')) pool.push('День в Хибинах');
  if(picked.includes('aurora') && month.light<18) pool.push('Ночная охота за сиянием');
  if(picked.includes('photo')) pool.push('Съёмка на сопке в мягком свете');
  if(picked.includes('slow')) pool.push('Свободный день у озера и в центре');
  if(!pool.length) pool.push('Знакомство с центром и Кольским заливом','Поездка по ближайшим сопкам');
  while(pool.length<days) pool.push(['Северная кухня и тёплая пауза','Резервный день на случай погоды','Набережная и вечерние огни'][pool.length%3]);
  $('#trip-result').innerHTML=`<p class="ticket-label">Черновик маршрута · ${month.name.toLowerCase()}</p><h3>${days} дней на Севере</h3><p class="trip-meta">Около ${formatHours(month.light)} света в сутки</p><ol>${pool.slice(0,days).map((x,i)=>`<li><span>${String(i+1).padStart(2,'0')}</span><strong>${x}</strong></li>`).join('')}</ol><p class="ticket-note">Оставьте запас на погоду и проверяйте состояние загородных дорог перед каждым выездом.</p>`;
}

function buildDarknessChart() {
  $('#darkness-chart').innerHTML=months.map(m=>`<div class="darkness-bar"><i style="height:${Math.max(2,(24-m.light)/24*100)}%" title="${m.name}: ${formatHours(24-m.light)} темноты"></i><span>${m.short}</span></div>`).join('');
}

function animateAurora() {
  const canvas=$('#aurora-canvas'), ctx=canvas.getContext('2d'); let t=0;
  function resize(){canvas.width=canvas.clientWidth*devicePixelRatio;canvas.height=canvas.clientHeight*devicePixelRatio;}
  function draw(){
    t+=.007; ctx.clearRect(0,0,canvas.width,canvas.height);
    const w=canvas.width,h=canvas.height;
    for(let band=0;band<3;band++){
      ctx.beginPath();
      for(let x=0;x<=w;x+=12){ const y=h*(.16+band*.08)+Math.sin(x*.004+t*(1+band*.2))*h*.08+Math.sin(x*.009-t*1.4)*h*.03; x?ctx.lineTo(x,y):ctx.moveTo(x,y); }
      ctx.lineTo(w,h*.58);ctx.lineTo(0,h*.58);ctx.closePath();
      const g=ctx.createLinearGradient(0,h*.1,0,h*.6);g.addColorStop(0,'rgba(114,231,178,0)');g.addColorStop(.45,`rgba(${band===1?'116,180,255':'114,231,178'},${.14-band*.025})`);g.addColorStop(1,'rgba(114,231,178,0)');ctx.fillStyle=g;ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  resize();addEventListener('resize',resize);draw();
}

function initNav() {
  const toggle=$('.menu-toggle'),nav=$('#nav');
  toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',open);});
  $$('#nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
  addEventListener('scroll',()=>$('#header').classList.toggle('scrolled',scrollY>30),{passive:true});
}

$('#place-prev').addEventListener('click',()=>{placeIndex=(placeIndex-1+places.length)%places.length;renderPlace();});
$('#place-next').addEventListener('click',()=>{placeIndex=(placeIndex+1)%places.length;renderPlace();});
updateClock(); setInterval(updateClock,30000);
buildCalendar(); renderPlace(); renderRoute(); buildPlanner(); buildDarknessChart(); initNav(); animateAurora();
