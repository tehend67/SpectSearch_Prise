"use strict";

const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const sleep = ms=>new Promise(r=>setTimeout(r,ms));
const esc = s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

setTimeout(()=>{
  const splash=document.getElementById("splash");
  if(splash&&!splash.hidden){
    splash.hidden=true;
    splash.classList.remove("splash--exit","splash--welcome");
    const auth=document.getElementById("auth");
    const app=document.getElementById("app");
    if(auth&&app&&app.hidden&&auth.hidden) auth.hidden=false;
  }
},5000);

const T={
  ru:{
    "auth.tagline":"Контролируйте цены умнее","auth.login":"Вход в аккаунт",
    "auth.loginHint":"Войдите, чтобы продолжить","auth.register":"Регистрация",
    "auth.registerHint":"Создайте аккаунт за минуту","auth.continue":"Продолжить",
    "auth.createAccount":"Создать аккаунт","auth.hasAccount":"Уже есть аккаунт",
    "nav.overview":"Обзор","nav.products":"Мои товары","nav.favorites":"Избранное",
    "nav.alerts":"Уведомления","nav.logs":"Журнал цен","nav.logout":"Выйти",
    "header.welcome":"Добро пожаловать,",
    "action.add":"+ Добавить товар","action.refresh":"↻ Обновить",
    "overview.eyebrow":"АНАЛИТИКА РЫНКА","overview.title":"Цены под контролем",
    "overview.subtitle":"Следите за рынком, находите лучшие предложения и покупайте в нужный момент.",
    "overview.fired":"сработавших алертов","overview.popular":"Популярные товары",
    "overview.popularSub":"Лучшие предложения прямо сейчас","overview.seeAll":"Смотреть все →",
    "stats.products":"ТОВАРОВ","stats.productsSub":"↗ в базе",
    "stats.tracked":"ОТСЛЕЖИВАЮ","stats.trackedSub":"☆ в избранном",
    "stats.alerts":"АЛЕРТОВ","stats.alertsSub":"♧ активных",
    "stats.updates":"ОБНОВЛЕНИЙ","stats.updatesSub":"◷ за 24 часа",
    "products.sub":"Все товары для мониторинга",
    "filters.search":"Поиск по названию…","filters.allCats":"Все категории",
    "favs.sub":"Товары, за которыми вы следите",
    "alerts.sub":"Следите за снижением цен автоматически",
    "logs.sub":"Каждое изменение цены фиксируется здесь",
    "logs.allProducts":"Все товары","logs.allSources":"Все источники",
    "logs.scheduler":"Планировщик","logs.manual":"Вручную","logs.parse":"Парсинг",
    "profile.region":"Регион","profile.uptime":"На сайте","profile.time":"Время",
    "profile.member":"Участник с","profile.language":"Язык интерфейса","profile.regionSelect":"Регион / магазины",
    "card.stores":["магазин","магазина","магазинов"],"card.stable":"стабильно","card.open":"Аналитика →","card.delete":"Удалить",
    "detail.storesCompare":"сравнение магазинов","detail.best":"лучшая",
    "detail.min":"Минимум","detail.avg":"Средняя","detail.max":"Максимум","detail.score":"Buy Score",
    "detail.addPrice":"Добавить цену","detail.store":"Магазин","detail.price":"Цена","detail.link":"Ссылка (необязательно)",
    "detail.refreshMarket":"↻ Обновить рынок","detail.savePrice":"Сохранить","detail.setAlert":"♧ Установить алерт",
    "detail.tab.chart":"График","detail.tab.stores":"Магазины","detail.tab.logs":"Логи",
    "detail.parseBtn":"⟳ Спарсить цену","detail.openPage":"Открыть страницу товара ↗",
    "add.title":"Добавить товар","add.name":"Название товара","add.image":"Ссылка на изображение (необязательно)",
    "add.sourceUrl":"Ссылка на товар (для автообновления цены)","add.parseBtn":"⟳ Проверить цену",
    "add.storesLabel":"Цены в магазинах","add.addStore":"+ Ещё магазин","add.submit":"Добавить в мониторинг",
    "alert.title":"Price Alert","alert.target":"Уведомить при цене ниже",
    "alert.hint":"Алерт сработает автоматически как только цена достигнет цели.",
    "alert.submit":"Создать алерт","alert.active":"Активен","alert.done":"Сработал","alert.del":"Удалить","alert.fired":"🔔 Алерт сработал!",
    "region.ua":"🇺🇦 Украина","region.ru":"🇷🇺 Россия","region.eu":"🇪🇺 Европа","region.us":"🇺🇸 США","region.global":"🌐 Global",
    "confirm.delete":"Удалить этот товар? Действие нельзя отменить.",
    "toast.fav":"Избранное обновлено","toast.pricesSaved":"Цены обновлены","toast.alertDel":"Уведомление удалено",
    "toast.productDel":"Товар удалён","toast.alertCreated":"Алерт создан","toast.regionChanged":"Регион изменён",
    "toast.langChanged":"Язык изменён","toast.parsedOk":"Цена найдена",
    "empty.catalog":"Каталог пуст","empty.catalogHint":"Добавьте первый товар.",
    "empty.search":"Ничего не найдено","empty.searchHint":"Попробуйте другой запрос.",
    "empty.favs":"Пока пусто","empty.favsHint":"Добавляйте товары в избранное.",
    "empty.alerts":"Алертов нет","empty.alertsHint":"Установите цену-цель в карточке товара.",
    "empty.logs":"Журнал пуст","empty.logsHint":"Изменения появятся здесь автоматически.",
    "page.history":"История цен","page.stores":"Магазины","page.backToList":"← Назад к товарам",
    "page.alertSet":"Установить алерт","page.fav":"В избранное","page.favRemove":"Из избранного",
    "splash.welcome":"С возвращением,",
  },
  ua:{
    "auth.tagline":"Контролюйте ціни розумніше","auth.login":"Вхід до акаунту",
    "auth.loginHint":"Увійдіть, щоб продовжити","auth.register":"Реєстрація",
    "auth.registerHint":"Створіть акаунт за хвилину","auth.continue":"Продовжити",
    "auth.createAccount":"Створити акаунт","auth.hasAccount":"Вже є акаунт",
    "nav.overview":"Огляд","nav.products":"Мої товари","nav.favorites":"Обране",
    "nav.alerts":"Сповіщення","nav.logs":"Журнал цін","nav.logout":"Вийти",
    "header.welcome":"Ласкаво просимо,",
    "action.add":"+ Додати товар","action.refresh":"↻ Оновити",
    "overview.eyebrow":"АНАЛІТИКА РИНКУ","overview.title":"Ціни під контролем",
    "overview.subtitle":"Стежте за ринком, знаходьте найкращі пропозиції та купуйте в потрібний момент.",
    "overview.fired":"спрацьованих сповіщень","overview.popular":"Популярні товари",
    "overview.popularSub":"Найкращі пропозиції просто зараз","overview.seeAll":"Дивитись усі →",
    "stats.products":"ТОВАРІВ","stats.productsSub":"↗ у базі",
    "stats.tracked":"ВІДСТЕЖУЮ","stats.trackedSub":"☆ в обраному",
    "stats.alerts":"СПОВІЩЕНЬ","stats.alertsSub":"♧ активних",
    "stats.updates":"ОНОВЛЕНЬ","stats.updatesSub":"◷ за 24 години",
    "products.sub":"Усі товари для моніторингу",
    "filters.search":"Пошук за назвою…","filters.allCats":"Всі категорії",
    "favs.sub":"Товари, за якими ви стежите",
    "alerts.sub":"Стежте за зниженням цін автоматично",
    "logs.sub":"Кожна зміна ціни фіксується тут",
    "logs.allProducts":"Усі товари","logs.allSources":"Усі джерела",
    "logs.scheduler":"Планувальник","logs.manual":"Вручну","logs.parse":"Парсинг",
    "profile.region":"Регіон","profile.uptime":"На сайті","profile.time":"Час",
    "profile.member":"Учасник з","profile.language":"Мова інтерфейсу","profile.regionSelect":"Регіон / магазини",
    "card.stores":["магазин","магазини","магазинів"],"card.stable":"стабільно","card.open":"Аналітика →","card.delete":"Видалити",
    "detail.storesCompare":"порівняння магазинів","detail.best":"найкраща",
    "detail.min":"Мінімум","detail.avg":"Середня","detail.max":"Максимум","detail.score":"Buy Score",
    "detail.addPrice":"Додати ціну","detail.store":"Магазин","detail.price":"Ціна","detail.link":"Посилання (необов'язково)",
    "detail.refreshMarket":"↻ Оновити ринок","detail.savePrice":"Зберегти","detail.setAlert":"♧ Встановити алерт",
    "detail.tab.chart":"Графік","detail.tab.stores":"Магазини","detail.tab.logs":"Логи",
    "detail.parseBtn":"⟳ Спарсити ціну","detail.openPage":"Відкрити сторінку товару ↗",
    "add.title":"Додати товар","add.name":"Назва товару","add.image":"Посилання на зображення (необов'язково)",
    "add.sourceUrl":"Посилання на товар (для автооновлення ціни)","add.parseBtn":"⟳ Перевірити ціну",
    "add.storesLabel":"Ціни в магазинах","add.addStore":"+ Ще магазин","add.submit":"Додати до моніторингу",
    "alert.title":"Price Alert","alert.target":"Сповістити при ціні нижче",
    "alert.hint":"Алерт спрацює автоматично, як тільки ціна досягне мети.",
    "alert.submit":"Створити алерт","alert.active":"Активний","alert.done":"Спрацював","alert.del":"Видалити","alert.fired":"🔔 Алерт спрацював!",
    "region.ua":"🇺🇦 Україна","region.ru":"🇷🇺 Росія","region.eu":"🇪🇺 Європа","region.us":"🇺🇸 США","region.global":"🌐 Global",
    "confirm.delete":"Видалити цей товар? Дію не можна скасувати.",
    "toast.fav":"Обране оновлено","toast.pricesSaved":"Ціни оновлено","toast.alertDel":"Сповіщення видалено",
    "toast.productDel":"Товар видалено","toast.alertCreated":"Алерт створено","toast.regionChanged":"Регіон змінено",
    "toast.langChanged":"Мову змінено","toast.parsedOk":"Ціну знайдено",
    "empty.catalog":"Каталог порожній","empty.catalogHint":"Додайте перший товар.",
    "empty.search":"Нічого не знайдено","empty.searchHint":"Спробуйте інший запит.",
    "empty.favs":"Поки порожньо","empty.favsHint":"Додавайте товари до обраного.",
    "empty.alerts":"Сповіщень немає","empty.alertsHint":"Встановіть ціль у картці товару.",
    "empty.logs":"Журнал порожній","empty.logsHint":"Зміни з'являться тут автоматично.",
    "page.history":"Історія цін","page.stores":"Магазини","page.backToList":"← Назад до товарів",
    "page.alertSet":"Встановити алерт","page.fav":"В обране","page.favRemove":"З обраного",
    "splash.welcome":"З поверненням,",
  },
};

let lang=localStorage.getItem("pm_lang")||"ru";
const t=k=>(T[lang]||T.ru)[k]??T.ru[k]??k;

function applyI18n(){
  document.documentElement.lang=lang==="ua"?"uk":"ru";
  $$("[data-i18n]").forEach(el=>{const v=t(el.dataset.i18n);if(typeof v==="string")el.textContent=v;});
  $$("[data-i18n-ph]").forEach(el=>{el.placeholder=t(el.dataset.i18nPh);});
  const pt=$("#pageTitle");
  if(pt) pt.textContent={overview:t("nav.overview"),products:t("nav.products"),favorites:t("nav.favorites"),alerts:t("nav.alerts"),logs:t("nav.logs")}[currentView]||"";
}

function money(n,region){
  const r=region||currentRegion||"ua";
  const map={ua:["uk-UA","UAH"],eu:["de-DE","EUR"],ru:["ru-RU","RUB"],us:["en-US","USD"],global:["uk-UA","UAH"]};
  const [locale,currency]=map[r]||map.ua;
  try{return new Intl.NumberFormat(locale,{style:"currency",currency,maximumFractionDigits:0}).format(Math.round(n||0));}
  catch{return Math.round(n||0)+" ₴";}
}

function storesLabel(n){
  const f=t("card.stores");
  if(!Array.isArray(f)) return n+" "+f;
  const m=n%10,h=n%100;
  if(m===1&&h!==11) return n+" "+f[0];
  if(m>=2&&m<=4&&(h<10||h>=20)) return n+" "+f[1];
  return n+" "+f[2];
}

const ICONS={"Смартфони":"📱","Навушники":"🎧","Ноутбуки":"💻","Планшети":"📲","Телевізори":"📺","Інше":"📦","Смартфоны":"📱","Наушники":"🎧","Планшеты":"📲","Телевизоры":"📺","Другое":"📦"};
const CAT_KEYS=["Смартфони","Ноутбуки","Навушники","Планшети","Телевізори","Інше"];
const AUTO_REFRESH=25000;

let token=localStorage.getItem("pm_token");
let currentUser=null,products=[],currentView="overview";
let currentRegion=localStorage.getItem("pm_region")||"ua";
let panelBusy=false,prevStats={products:0,tracked:0,alerts:0,updates:0,fired:0};
let refreshTimer=null,sessionStart=Date.now();
let clockTmr=null,uptimeTmr=null,searchTmr=null,prevFiredCount=0;

let audioCtx=null;
function ensureAudioCtx(){
  if(!audioCtx) audioCtx=new(window.AudioContext||window.webkitAudioContext)();
  if(audioCtx.state==="suspended") audioCtx.resume();
  return audioCtx;
}
function playBell(){
  try{
    const ctx=ensureAudioCtx();
    [880,1108,1320,1760].forEach((freq,i)=>{
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.connect(gain);gain.connect(ctx.destination);
      osc.type="sine";osc.frequency.value=freq;
      const s=ctx.currentTime+i*0.08;
      gain.gain.setValueAtTime(0,s);
      gain.gain.linearRampToValueAtTime(0.18/(i+1),s+0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001,s+1.4);
      osc.start(s);osc.stop(s+1.5);
    });
  }catch{}
}

function showAlertFiredBanner(productName,price){
  playBell();
  const banner=document.createElement("div");
  banner.className="alert-fired-banner";
  banner.innerHTML=`<div class="alert-fired-banner__icon">🔔</div><div class="alert-fired-banner__text"><strong>${t("alert.fired")}</strong><span>${esc(productName)} — ${money(price)}</span></div>`;
  document.body.append(banner);
  setTimeout(async()=>{banner.classList.add("alert-fired-banner--exit");await sleep(380);banner.remove();},5000);
}

function showSplashNew(){
  const splash=$("#splash"),tagline=$("#splashTagline");
  tagline.textContent=t("auth.tagline");
  splash.classList.remove("splash--welcome","splash--exit");
  splash.hidden=false;
  setTimeout(()=>{
    splash.classList.add("splash--exit");
    setTimeout(()=>{
      splash.hidden=true;
      splash.classList.remove("splash--exit","splash--welcome");
      $("#auth").hidden=false;
      applyI18n();
    },520);
  },1600);
}

function showSplashWelcome(name,onDone){
  const splash=$("#splash"),tagline=$("#splashTagline"),dots=$("#splashDots");
  splash.classList.add("splash--welcome");
  splash.classList.remove("splash--exit");
  tagline.innerHTML=`${t("splash.welcome")} <span class="splash__name">${esc(name)}</span>`;
  dots.innerHTML=`<div class="splash__dot"></div><div class="splash__dot"></div><div class="splash__dot"></div>`;
  splash.hidden=false;
  setTimeout(()=>{
    splash.classList.add("splash--exit");
    setTimeout(()=>{
      splash.hidden=true;
      splash.classList.remove("splash--exit","splash--welcome");
      if(onDone) onDone();
    },520);
  },1400);
}

function hideSplashNow(){
  const splash=$("#splash");
  if(!splash) return;
  splash.hidden=true;
  splash.classList.remove("splash--exit","splash--welcome");
}

const hdrs=()=>({"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{})});

async function api(url,opt={}){
  const r=await fetch(url,{...opt,headers:{...hdrs(),...(opt.headers||{})}});
  if(r.status===204) return null;
  const d=await r.json().catch(()=>({}));
  if(!r.ok){const det=d.detail;throw Error(typeof det==="string"?det:Array.isArray(det)?det[0]?.msg:"Помилка запиту");}
  return d;
}

function toast(msg,type="info"){
  const el=document.createElement("div");
  el.className="toast"+(type!=="info"?" "+type:"");
  el.textContent=msg;
  $("#toasts").append(el);
  setTimeout(async()=>{el.classList.add("out");await sleep(320);el.remove();},3400);
}

function animNum(el,from,to,dur=700){
  const s=performance.now(),d=to-from;
  if(!d){el.textContent=to;return;}
  const tick=now=>{
    const p=Math.min(1,(now-s)/dur);
    el.textContent=Math.round(from+d*(1-Math.pow(1-p,3)));
    if(p<1) requestAnimationFrame(tick); else el.textContent=to;
  };
  requestAnimationFrame(tick);
}

function drawSparkline(canvas,data,color="#e08a1e"){
  if(!canvas||!data||data.length<2) return;
  const ctx=canvas.getContext("2d"),w=canvas.width,h=canvas.height;
  ctx.clearRect(0,0,w,h);
  const min=Math.min(...data),max=Math.max(...data);
  const padding=(max-min)*0.15||1;
  const rangeMin=min-padding,rangeMax=max+padding;
  const range=rangeMax-rangeMin;
  const step=w/(data.length-1),yOf=v=>h-3-((v-rangeMin)/range)*(h-6);
  const pts=data.map((v,i)=>({x:i*step,y:yOf(v)}));
  ctx.beginPath();
  pts.forEach(({x,y},i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
  ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();
  const g=ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,color+"44");g.addColorStop(1,color+"00");
  ctx.fillStyle=g;ctx.fill();
  ctx.beginPath();
  pts.forEach(({x,y},i)=>{
    if(!i){ctx.moveTo(x,y);return;}
    const p=pts[i-1],cx=(p.x+x)/2;
    ctx.bezierCurveTo(cx,p.y,cx,y,x,y);
  });
  ctx.strokeStyle=color;ctx.lineWidth=2;ctx.lineCap="round";ctx.stroke();
  const last=pts[pts.length-1];
  ctx.beginPath();ctx.arc(last.x,last.y,3,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
}

function drawChart(canvas,data){
  if(!canvas) return;
  const ctx=canvas.getContext("2d"),w=canvas.width,h=canvas.height;
  ctx.clearRect(0,0,w,h);
  if(!data.length){ctx.fillStyle="#b5a99e";ctx.font="13px Manrope,sans-serif";ctx.textAlign="center";ctx.fillText("Нет данных",w/2,h/2);return;}
  const vals=data.map(d=>d.value),min=Math.min(...vals),max=Math.max(...vals);
  const padT=24,padB=32,padL=8,padR=48;
  const yOf=v=>padT+(h-padT-padB)-((v-min)/(max-min||1))*(h-padT-padB);
  const xOf=i=>padL+i*((w-padL-padR)/Math.max(data.length-1,1));
  const pts=vals.map((v,i)=>({x:xOf(i),y:yOf(v)}));
  ctx.strokeStyle="#f5eadb";ctx.lineWidth=1;
  [0,.25,.5,.75,1].forEach(f=>{
    const y=padT+(h-padT-padB)*f;
    ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w-padR+8,y);ctx.stroke();
    ctx.fillStyle="#b5a99e";ctx.font="10px Manrope,sans-serif";ctx.textAlign="right";
    ctx.fillText(Math.round(max-(max-min)*f).toLocaleString(),w-2,y-3);
  });
  ctx.beginPath();
  pts.forEach(({x,y},i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
  ctx.lineTo(pts[pts.length-1].x,h-padB);ctx.lineTo(pts[0].x,h-padB);ctx.closePath();
  const gf=ctx.createLinearGradient(0,padT,0,h);
  gf.addColorStop(0,"rgba(224,138,30,.18)");gf.addColorStop(1,"rgba(224,138,30,0)");
  ctx.fillStyle=gf;ctx.fill();
  ctx.beginPath();
  pts.forEach(({x,y},i)=>{
    if(!i){ctx.moveTo(x,y);return;}
    const p=pts[i-1],cx=(p.x+x)/2;ctx.bezierCurveTo(cx,p.y,cx,y,x,y);
  });
  ctx.strokeStyle="#e08a1e";ctx.lineWidth=2.5;ctx.lineCap="round";ctx.stroke();
  const step=Math.max(1,Math.floor(data.length/6));
  ctx.fillStyle="#b5a99e";ctx.font="10px Manrope,sans-serif";ctx.textAlign="center";
  data.forEach((d,i)=>{if(i%step===0||i===data.length-1) ctx.fillText(d.date,xOf(i),h-8);});
  if(pts.length){
    const last=pts[pts.length-1];
    ctx.beginPath();ctx.arc(last.x,last.y,6,0,Math.PI*2);ctx.fillStyle="#fff";ctx.fill();
    ctx.lineWidth=2.5;ctx.strokeStyle="#e08a1e";ctx.stroke();
    ctx.beginPath();ctx.arc(last.x,last.y,3,0,Math.PI*2);ctx.fillStyle="#e08a1e";ctx.fill();
  }
}

function skeletonCards(n=6){
  return Array.from({length:n}).map(()=>`
    <article class="card skeleton-card" aria-hidden="true">
      <div class="card-top">
        <div style="flex:1">
          <div class="skeleton" style="height:11px;width:42%;margin-bottom:9px"></div>
          <div class="skeleton" style="height:18px;width:78%;margin-bottom:7px"></div>
          <div class="skeleton" style="height:11px;width:30%"></div>
        </div>
        <div class="skeleton" style="width:32px;height:32px;border-radius:9px;flex-shrink:0"></div>
      </div>
      <div class="skeleton card-sparkline"></div>
      <div class="skeleton" style="height:96px;border-radius:14px;margin-bottom:10px"></div>
      <div style="display:flex;justify-content:space-between;margin-bottom:10px;gap:10px">
        <div><div class="skeleton" style="height:9px;width:46px;margin-bottom:6px"></div><div class="skeleton" style="height:18px;width:84px"></div></div>
        <div style="text-align:right"><div class="skeleton" style="height:9px;width:54px;margin-bottom:6px;margin-left:auto"></div><div class="skeleton" style="height:18px;width:58px;margin-left:auto"></div></div>
      </div>
      <div class="skeleton" style="height:40px;border-radius:14px"></div>
    </article>`).join("");
}

function card(p){
  const prices=(p.prices||[]).slice().sort((a,b)=>a.value-b.value);
  const chg=p.change||0,chgCls=chg<0?"down":chg>0?"up":"";
  const chgTxt=chg?`${chg>0?"▲ +":"▼ "}${chg}%`:`— ${t("card.stable")}`;
  const icon=ICONS[p.category]||"📦";
  const scoreCls=p.score>=70?"score-good":p.score>=40?"score-mid":"score-low";
  const imgBlock=p.image
    ?`<div class="card-image"><img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" onerror="this.parentElement.classList.add('no-img');this.remove()"></div>`
    :`<div class="card-image no-img" aria-hidden="true"><span>${icon}</span></div>`;
  const spark=(p.sparkline||[]).length>=2
    ?`<canvas class="card-sparkline" width="260" height="52" data-spark='${JSON.stringify(p.sparkline)}'></canvas>`
    :`<div class="card-sparkline card-sparkline--empty"></div>`;
  const priceRows=prices.slice(0,3).map((x,i)=>`<div class="price-line ${i===0?"best":""}"><span>${esc(x.store)}</span><b>${money(x.value)}</b></div>`).join("");
  return `<article class="card" data-id="${p.id}">
    <div class="card-top">
      <div class="card-meta">
        <span class="card-label">${icon} ${esc(p.category)}</span>
        <h3 title="${esc(p.name)}">${esc(p.name)}</h3>
        <span class="card-stores">${storesLabel(prices.length)}</span>
      </div>
      <button class="star ${p.favorite?"on":""}" type="button" data-act="fav" data-id="${p.id}" aria-label="Обране">${p.favorite?"★":"☆"}</button>
    </div>
    ${spark}
    <div class="price-list">${priceRows||`<p class="price-list__empty">—</p>`}</div>
    <div class="card-foot">
      <div class="card-foot__item"><small>${t("detail.min")}</small><strong>${money(p.current)}</strong></div>
      <div class="card-foot__item card-foot__item--right"><small>${t("detail.score")}</small><strong class="score ${scoreCls}">${p.score}<span class="score-denom">/100</span></strong></div>
    </div>
    <div class="card-change">
      <span class="change ${chgCls}">${chgTxt}</span>
      ${p.source_url?`<span class="live-badge">● live</span>`:""}
    </div>
    <div class="card-actions">
      <button class="btn-main" type="button" data-act="details" data-id="${p.id}">${t("card.open")}</button>
      <button class="btn-page" type="button" data-act="open-page" data-id="${p.id}" title="${t("detail.openPage")}">↗</button>
      <button class="btn-del" type="button" data-act="delete-product" data-id="${p.id}" data-name="${esc(p.name)}">🗑</button>
    </div>
  </article>`;
}

function renderSparklines(container){
  $$(`.card-sparkline[data-spark]`,container).forEach(canvas=>{try{drawSparkline(canvas,JSON.parse(canvas.dataset.spark));}catch{}});
}

function renderCards(target,list,emptyHTML,skeleton=false){
  const el=$(target);if(!el) return;
  if(skeleton&&!list.length){el.innerHTML=skeletonCards(6);return;}
  el.innerHTML=list.length?list.map(card).join(""):emptyHTML;
  $$(".card",el).forEach((c,i)=>{c.classList.add("reveal");c.style.animationDelay=i*40+"ms";});
  renderSparklines(el);
}

function emptyCard(ico,title,hint){
  return `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">${ico}</div><h2>${t(title)}</h2><p>${t(hint)}</p></div>`;
}

async function openProductPage(id){
  const pp=$("#productPage");
  pp.innerHTML=`<div class="product-page__inner">${skeletonCards(1)}</div>`;
  pp.hidden=false;
  history.pushState({productPage:id},"",`/product/${id}`);
  document.title="SpectSearch — товар";
  try{
    const [p,h]=await Promise.all([api(`/api/products/${id}`),api(`/api/products/${id}/history`)]);
    const prices=(p.prices||[]).slice().sort((a,b)=>a.value-b.value);
    const chg=p.change||0,chgCls=chg<0?"down":chg>0?"up":"";
    const chgTxt=chg?`${chg>0?"▲ +":"▼ "}${chg}%`:`— ${t("card.stable")}`;
    const scoreCls=p.score>=70?"score-good":p.score>=40?"score-mid":"score-low";
    const imgBlock=p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}" onerror="this.parentElement.classList.add('no-img');this.remove()">`:`<span>${ICONS[p.category]||"📦"}</span>`;
    const storeRows=prices.map((x,i)=>{
      const diff=prices[0]?Math.round(((x.value-prices[0].value)/prices[0].value)*1000)/10:0;
      const link=x.url?`<a href="${esc(x.url)}" target="_blank" rel="noopener" class="store-link">↗</a>`:"";
      return `<div class="product-page__store-row ${i===0?"best":""}">
        <span class="product-page__store-name">${esc(x.store)} ${link}</span>
        <div style="display:flex;align-items:center;gap:10px">${diff?`<span class="change up" style="font-size:11px">+${diff}%</span>`:""}<span class="product-page__store-price">${money(x.value)}</span></div>
      </div>`;
    }).join("");
    document.title=`SpectSearch — ${p.name}`;
    pp.innerHTML=`<div class="product-page__inner">
      <button class="product-page__back" id="ppBack"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 3L5 8l5 5"/></svg>${t("page.backToList")}</button>
      <div class="product-page__hero">
        <div class="product-page__image">${imgBlock}</div>
        <div class="product-page__info">
          <div><div class="product-page__label">${ICONS[p.category]||"📦"} ${esc(p.category)}</div><h1 class="product-page__name">${esc(p.name)}</h1></div>
          <div class="product-page__price-row"><span class="product-page__price">${money(p.current)}</span><span class="change ${chgCls}">${chgTxt}</span></div>
          <div class="product-page__score-row">
            <span class="product-page__badge">${t("detail.score")}: <b class="score ${scoreCls}">${p.score}/100</b></span>
            <span class="product-page__badge">${t("detail.min")}: ${money(p.minimum)}</span>
            <span class="product-page__badge">${t("detail.avg")}: ${money(p.average)}</span>
            ${p.source_url?`<span class="live-badge product-page__badge">● live</span>`:""}
          </div>
          <div class="product-page__actions">
            <button class="primary" type="button" data-act="alert" data-id="${p.id}" data-name="${esc(p.name)}" data-current="${p.current}">${t("page.alertSet")}</button>
            <button class="ghost" type="button" data-act="fav" data-id="${p.id}">${p.favorite?t("page.favRemove"):t("page.fav")}</button>
            ${p.source_url?`<button class="ghost" type="button" data-act="parse-product" data-id="${p.id}" data-url="${esc(p.source_url)}">${t("detail.parseBtn")}</button>`:""}
          </div>
        </div>
      </div>
      <div class="product-page__chart-wrap"><div class="product-page__chart-head">${t("page.history")}</div><canvas id="ppChart" class="product-page__chart" width="840" height="220"></canvas></div>
      <div class="product-page__stores"><div class="product-page__stores-head">${t("page.stores")} (${prices.length})</div>${storeRows}</div>
    </div>`;
    requestAnimationFrame(()=>{drawChart($("#ppChart"),h);});
    $("#ppBack").onclick=closeProductPage;
  }catch(err){
    pp.innerHTML=`<div class="product-page__inner"><button class="product-page__back" id="ppBack">${t("page.backToList")}</button><p style="color:var(--red);padding:40px 0">${err.message}</p></div>`;
    $("#ppBack").onclick=closeProductPage;
  }
}

async function closeProductPage(){
  const pp=$("#productPage");
  pp.classList.add("product-page--exit");
  await sleep(300);
  pp.hidden=true;pp.classList.remove("product-page--exit");pp.innerHTML="";
  if(location.pathname.startsWith("/product/")) history.pushState(null,"","/");
  document.title="SpectSearch";
}

function checkInitialRoute(){
  const m=location.pathname.match(/^\/product\/(\d+)$/);
  if(m&&token) openProductPage(Number(m[1]));
}

window.addEventListener("popstate",e=>{
  if(e.state?.productPage) openProductPage(e.state.productPage);
  else if(!$("#productPage").hidden) closeProductPage();
});

function openPanel(html){
  const dialog=$("#panel"),sheet=$("#panelSheet");
  sheet.innerHTML=html;stagger(sheet);
  if(!dialog.open) dialog.showModal();
}

async function closePanel(){
  const dialog=$("#panel");
  if(!dialog.open||panelBusy) return;
  panelBusy=true;dialog.classList.add("closing");
  await sleep(280);
  dialog.close();dialog.classList.remove("closing");
  $("#panelSheet").innerHTML="";panelBusy=false;
}

function stagger(root){
  const items=[];
  const walk=el=>{
    if(el.matches("form,.sheet-form,.sheet-body,.stores,.panel-stats,.detail-prices,.sheet-actions,.tab-panels")) return [...el.children].forEach(walk);
    items.push(el);
  };
  [...root.children].forEach(walk);
  items.forEach((el,i)=>{el.classList.add("reveal");el.style.animationDelay=45+i*38+"ms";});
}

function activateTab(tabId){
  const sheet=$("#panelSheet");
  $$(".tab-btn",sheet).forEach(b=>b.classList.toggle("active",b.dataset.tab===tabId));
  $$(".tab-panel",sheet).forEach(p=>{p.hidden=p.dataset.panel!==tabId;});
  if(tabId==="chart"){const canvas=$("#detailChart");if(canvas&&canvas._histData) drawChart(canvas,canvas._histData);}
}

async function details(id){
  const [p,h]=await Promise.all([api(`/api/products/${id}`),api(`/api/products/${id}/history`)]);
  const prices=(p.prices||[]).slice().sort((a,b)=>a.value-b.value);
  const icon=ICONS[p.category]||"📦";
  const imgBlock=p.image?`<div class="detail-image"><img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" onerror="this.parentElement.classList.add('no-img');this.remove()"></div>`:`<div class="detail-image no-img"><span style="font-size:60px">${icon}</span></div>`;
  const storesHTML=prices.map(x=>{
    const diff=prices[0]?Math.round(((x.value-prices[0].value)/prices[0].value)*1000)/10:0;
    const link=x.url?`<a href="${esc(x.url)}" target="_blank" rel="noopener" class="store-link">↗</a>`:"";
    const tag=x===prices[0]?` · ${t("detail.best")}`:diff?` · +${diff}%`:"";
    return `<div class="price-line ${x===prices[0]?"best":""}"><span>${esc(x.store)}${tag} ${link}</span><b>${money(x.value)}</b></div>`;
  }).join("");
  const scoreCls=p.score>=70?"score-good":p.score>=40?"score-mid":"score-low";
  openPanel(`
    <div class="modal-head-with-image">
      <div class="modal-head-with-image__left">${imgBlock}</div>
      <div class="modal-head-with-image__right">
        <span class="card-label">${icon} ${esc(p.category)}</span>
        <h2>${esc(p.name)}</h2>
        <p class="muted-note">${storesLabel(prices.length)} · ${t("detail.storesCompare")}</p>
      </div>
      <button class="close" type="button" data-act="close">×</button>
    </div>
    <div class="panel-stats">
      <div><span>${t("detail.min")}</span><b>${money(p.minimum)}</b></div>
      <div><span>${t("detail.avg")}</span><b>${money(p.average)}</b></div>
      <div><span>${t("detail.max")}</span><b>${money(p.maximum)}</b></div>
      <div><span>${t("detail.score")}</span><b class="score ${scoreCls}">${p.score}<span class="score-denom">/100</span></b></div>
    </div>
    <div class="tabs">
      <button class="tab-btn active" data-tab="chart">${t("detail.tab.chart")}</button>
      <button class="tab-btn" data-tab="stores">${t("detail.tab.stores")}</button>
      <button class="tab-btn" data-tab="add">${t("detail.addPrice")}</button>
      <button class="tab-btn" data-tab="logs">${t("detail.tab.logs")}</button>
    </div>
    <div class="tab-panels">
      <div class="tab-panel" data-panel="chart"><canvas id="detailChart" class="detail-chart" width="540" height="210"></canvas></div>
      <div class="tab-panel" data-panel="stores" hidden>
        <div class="detail-prices">${storesHTML}</div>
        ${p.source_url
          ?`<div class="parse-bar"><span class="parse-bar__url" title="${esc(p.source_url)}">${esc(p.source_url.slice(0,55))}…</span><button class="ghost" type="button" data-act="parse-product" data-id="${p.id}" data-url="${esc(p.source_url)}">${t("detail.parseBtn")}</button></div>`
          :`<form id="parseUrlForm" class="parse-bar" data-id="${p.id}"><input name="url" placeholder="https://rozetka.com.ua/…" style="flex:1"><button class="ghost" type="submit">${t("detail.parseBtn")}</button></form>`}
        <button class="link" style="margin-top:8px;font-size:13px" type="button" data-act="open-page" data-id="${p.id}">${t("detail.openPage")}</button>
      </div>
      <div class="tab-panel" data-panel="add" hidden>
        <form id="priceForm" class="sheet-form" data-id="${p.id}">
          <div class="row">
            <input name="store" placeholder="${t("detail.store")}" required minlength="1">
            <input name="value" type="number" min="1" step="1" placeholder="${t("detail.price")}" required>
          </div>
          <input name="url" placeholder="${t("detail.link")}">
          <div class="sheet-actions">
            <button class="ghost" type="button" data-act="refresh" data-id="${p.id}">${t("detail.refreshMarket")}</button>
            <button class="primary" type="submit">${t("detail.savePrice")}</button>
          </div>
        </form>
      </div>
      <div class="tab-panel" data-panel="logs" hidden>
        <div id="detailLogs" class="detail-logs">
          ${[1,2,3].map(()=>`<div class="log-item"><div><div class="skeleton" style="height:12px;width:55%;margin-bottom:5px"></div><div class="skeleton" style="height:10px;width:38%"></div></div><div class="skeleton" style="height:18px;width:76px;border-radius:999px"></div><div class="skeleton" style="height:14px;width:70px"></div><div class="skeleton" style="height:16px;width:56px;border-radius:7px"></div></div>`).join("")}
        </div>
      </div>
    </div>
    <button class="primary full" type="button" data-act="alert" data-id="${p.id}" data-name="${esc(p.name)}" data-current="${p.current}">${t("detail.setAlert")}</button>`);
  requestAnimationFrame(()=>{const canvas=$("#detailChart");if(canvas){canvas._histData=h;drawChart(canvas,h);}});
  loadDetailLogs(id);
}

async function loadDetailLogs(productId){
  const container=$("#detailLogs");if(!container) return;
  try{
    const logs=await api(`/api/logs?product_id=${productId}&limit=50`);
    if(!logs.length){container.innerHTML=`<p class="muted-note" style="padding:14px 0">${t("empty.logs")}</p>`;return;}
    const sl={scheduler:t("logs.scheduler"),manual:t("logs.manual"),parse:t("logs.parse")};
    container.innerHTML=logs.map(l=>{
      const dc=l.delta>0?"up":l.delta<0?"down":"neutral";
      const ds=l.delta>0?`▲ +${money(Math.abs(l.delta))}`:l.delta<0?`▼ -${money(Math.abs(l.delta))}`:"—";
      const dt=new Date(l.created_at);
      const ts=dt.toLocaleString(lang==="ua"?"uk-UA":"ru-RU",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
      return `<div class="log-item"><div><div class="log-item__name">${esc(l.store)}</div><div class="log-item__time">${ts}</div></div><span class="log-delta ${dc}">${ds}</span><span class="log-item__price">${money(l.new_value)}</span><span class="log-item__source">${sl[l.source]||l.source}</span></div>`;
    }).join("");
  }catch{}
}

function productForm(){
  const catOpts=CAT_KEYS.map(c=>`<option value="${c}">${c}</option>`).join("");
  openPanel(`
    <div class="modal-head">
      <div><span class="card-label">✦ ${t("add.title")}</span><h2>${t("add.title")}</h2></div>
      <button class="close" type="button" data-act="close">×</button>
    </div>
    <form id="productForm" class="sheet-form">
      <input name="name" placeholder="${t("add.name")}" required minlength="2">
      <select name="category">${catOpts}</select>
      <div style="display:flex;gap:12px;align-items:center">
        <input name="image" id="addImageInput" placeholder="${t("add.image")}" style="flex:1">
        <div id="addImagePreview" style="width:48px;height:48px;border-radius:12px;overflow:hidden;background:var(--paper);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0">📦</div>
      </div>
      <div class="parse-row">
        <input name="source_url" id="addParseUrl" placeholder="${t("add.sourceUrl")}">
        <button class="ghost" type="button" id="addParseBtn">${t("add.parseBtn")}</button>
      </div>
      <div id="addParsePreview" class="parse-preview"></div>
      <p class="muted-note">${t("add.storesLabel")}</p>
      <div id="storeRows" class="stores">
        <div class="store-row">
          <input name="store" placeholder="${t("detail.store")}" minlength="1">
          <input name="value" type="number" min="1" placeholder="${t("detail.price")}">
          <input name="url" placeholder="URL" class="store-url">
          <span></span>
        </div>
      </div>
      <button class="link" type="button" data-act="add-store">${t("add.addStore")}</button>
      <button class="primary" type="submit">${t("add.submit")}</button>
    </form>`);
  setTimeout(()=>{
    const inp=$("#addImageInput"),prev=$("#addImagePreview");
    if(!inp||!prev) return;
    inp.addEventListener("input",()=>{
      const url=inp.value.trim();
      if(url&&(url.startsWith("http")||url.startsWith("data:"))){
        prev.innerHTML=`<img src="${esc(url)}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.innerHTML='❌'">`;
      }else{prev.innerHTML="📦";}
    });
  },100);
}

function alertForm(id,name,current){
  openPanel(`
    <div class="modal-head">
      <div><span class="card-label">♧ ${t("alert.title")}</span><h2>${esc(name)}</h2><p class="muted-note">${t("detail.min")}: ${money(current)}</p></div>
      <button class="close" type="button" data-act="close">×</button>
    </div>
    <form id="alertForm" class="sheet-form" data-id="${id}">
      <input name="target" type="number" min="1" step="1" placeholder="${t("alert.target")}" required>
      <p class="muted-note">${t("alert.hint")}</p>
      <button class="primary" type="submit">${t("alert.submit")}</button>
    </form>`);
}

async function renderAlerts(){
  const el=$("#alertList");
  el.innerHTML=Array.from({length:3}).map(()=>`<div class="alert-item" aria-hidden="true"><div class="skeleton" style="width:44px;height:44px;border-radius:14px"></div><div style="flex:1"><div class="skeleton" style="height:14px;width:52%;margin-bottom:8px"></div><div class="skeleton" style="height:12px;width:76%"></div></div><div style="text-align:right"><div class="skeleton" style="height:24px;width:76px;border-radius:999px;margin-left:auto;margin-bottom:8px"></div><div class="skeleton" style="height:12px;width:52px;margin-left:auto"></div></div></div>`).join("");
  const rows=await api("/api/alerts");
  const firedNow=rows.filter(a=>!a.active);
  if(firedNow.length>prevFiredCount&&prevFiredCount>0&&firedNow[0]) showAlertFiredBanner(firedNow[0].product_name,firedNow[0].target);
  prevFiredCount=firedNow.length;
  if(!rows.length){el.innerHTML=`<div class="empty-state">${emptyCard("♧","empty.alerts","empty.alertsHint").replace(`style="grid-column:1/-1"`,"")}</div>`;return;}
  el.innerHTML=rows.map((a,i)=>{
    const pct=a.current&&a.target?Math.round((1-a.target/a.current)*100):0;
    const progress=a.current?Math.min(100,Math.max(0,Math.round((1-(a.current-a.target)/a.current)*100))):0;
    return `<div class="alert-item reveal" style="animation-delay:${i*40}ms">
      <div class="alert-icon">${a.active?"♧":"✓"}</div>
      <div class="alert-body"><b>${esc(a.product_name)}</b><p>${t("detail.min")} ${money(a.target)} · ${lang==="ua"?"Зараз":"Сейчас"} ${money(a.current)}${pct>0?` <span class="change down">−${pct}%</span>`:""}</p>${a.active?`<div class="alert-progress"><div class="alert-progress__bar" style="width:${progress}%"></div></div>`:""}</div>
      <div class="meta"><span class="badge ${a.active?"":"done"}">${a.active?t("alert.active"):t("alert.done")}</span><button class="link" type="button" data-act="del-alert" data-id="${a.id}">${t("alert.del")}</button></div>
    </div>`;
  }).join("");
}

async function renderLogs(){
  const container=$("#logsList");if(!container) return;
  container.innerHTML=Array.from({length:6}).map(()=>`<div class="log-item" aria-hidden="true"><div><div class="skeleton" style="height:13px;width:55%;margin-bottom:5px"></div><div class="skeleton" style="height:10px;width:38%"></div></div><div class="skeleton" style="height:20px;width:80px;border-radius:999px"></div><div class="skeleton" style="height:15px;width:75px"></div><div class="skeleton" style="height:18px;width:60px;border-radius:7px"></div><div class="skeleton" style="height:10px;width:52px"></div></div>`).join("");
  const pf=$("#logsProductFilter")?.value||"",sf=$("#logsSourceFilter")?.value||"";
  const params=new URLSearchParams({limit:"300"});
  if(pf) params.set("product_id",pf);
  if(sf) params.set("source",sf);
  try{
    const logs=await api(`/api/logs?${params}`);
    if(!logs.length){container.innerHTML=`<div class="empty-state">${emptyCard("◎","empty.logs","empty.logsHint").replace(`style="grid-column:1/-1"`,"")}</div>`;return;}
    const sl={scheduler:t("logs.scheduler"),manual:t("logs.manual"),parse:t("logs.parse")};
    container.innerHTML=logs.map((l,i)=>{
      const dc=l.delta>0?"up":l.delta<0?"down":"neutral";
      const ds=l.delta>0?`▲ +${money(Math.abs(l.delta))} (+${Math.abs(l.delta_pct)}%)`:l.delta<0?`▼ −${money(Math.abs(l.delta))} (−${Math.abs(l.delta_pct)})%)`:"—";
      const dt=new Date(l.created_at);
      const ts=dt.toLocaleString(lang==="ua"?"uk-UA":"ru-RU",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
      return `<div class="log-item reveal" style="animation-delay:${i*18}ms"><div><div class="log-item__name">${esc(l.product_name)}</div><div class="log-item__store">${esc(l.store)}</div></div><span class="log-delta ${dc}">${ds}</span><span class="log-item__price">${money(l.new_value)}</span><span class="log-item__source">${sl[l.source]||l.source}</span><span class="log-item__time">${ts}</span></div>`;
    }).join("");
    const sel=$("#logsProductFilter");
    if(sel&&sel.options.length<=1){
      const seen=new Map();
      logs.forEach(l=>{if(!seen.has(l.product_id))seen.set(l.product_id,l.product_name);});
      seen.forEach((name,id)=>{const o=document.createElement("option");o.value=id;o.textContent=name;sel.append(o);});
    }
  }catch(err){container.innerHTML=`<p style="color:var(--red);padding:16px">${err.message}</p>`;}
}

async function loadProducts({skeleton=false}={}){
  const search=$("#search")?.value||"",category=$("#category")?.value||"";
  const region=currentRegion!=="global"?currentRegion:"";
  if(skeleton){renderCards("#popular",[],  "",true);renderCards("#allProducts",[],  "",true);}
  products=await api(`/api/products?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}&region=${encodeURIComponent(region)}`);
  renderCards("#popular",products.slice(0,3),emptyCard("◫","empty.catalog","empty.catalogHint"));
  renderCards("#allProducts",products,emptyCard("⌕","empty.search","empty.searchHint"));
}

async function loadDashboard(){
  const d=await api("/api/dashboard");
  [["products","statProducts"],["tracked","statTracked"],["alerts","statAlerts"],["updates","statUpdates"],["fired","statFired"]]
    .forEach(([k,id])=>{const el=$("#"+id);if(el)animNum(el,prevStats[k]||0,d[k]??0);});
  prevStats=d;
}

async function loadFavorites(){
  $("#favoriteProducts").innerHTML=skeletonCards(4);
  const list=await api("/api/favorites");
  renderCards("#favoriteProducts",list,emptyCard("☆","empty.favs","empty.favsHint"));
}

async function toggleFav(id){
  await api(`/api/products/${id}/favorite`,{method:"POST"});
  await Promise.all([loadProducts(),loadDashboard()]);
  if(currentView==="favorites") await loadFavorites();
  else toast(t("toast.fav"),"success");
}

function switchView(name){
  if(currentView===name) return;
  const all=$$(".view");
  const oldEl=all.find(x=>x.id===currentView);
  const newEl=all.find(x=>x.id===name);
  if(!newEl) return;
  currentView=name;
  $$("nav button").forEach(b=>b.classList.toggle("selected",b.dataset.view===name));
  applyI18n();
  if(name==="favorites") loadFavorites();
  if(name==="alerts")    renderAlerts();
  if(name==="logs")      renderLogs();
  if(oldEl){
    oldEl.classList.add("view-exit");
    setTimeout(()=>{oldEl.hidden=true;oldEl.classList.remove("view-exit");},280);
  }
  setTimeout(()=>{
    newEl.hidden=false;newEl.classList.remove("view-enter");void newEl.offsetWidth;newEl.classList.add("view-enter");
  },oldEl?140:0);
}

function startAutoRefresh(){
  if(refreshTimer) clearInterval(refreshTimer);
  refreshTimer=setInterval(async()=>{
    if(!token) return;
    try{
      const ps=[loadProducts(),loadDashboard()];
      if(currentView==="favorites") ps.push(loadFavorites());
      if(currentView==="alerts")    ps.push(renderAlerts());
      if(currentView==="logs")      ps.push(renderLogs());
      await Promise.all(ps);
    }catch{}
  },AUTO_REFRESH);
}

async function deleteProduct(id,name){
  if(!confirm(`${t("confirm.delete")}\n\n"${name}"`)) return;
  try{
    await api(`/api/products/${id}`,{method:"DELETE"});
    toast(t("toast.productDel"),"success");
    await Promise.all([loadProducts(),loadDashboard()]);
    if(currentView==="favorites") await loadFavorites();
  }catch(err){toast(err.message,"error");}
}

function openProfile(){
  const popup=$("#profilePopup");if(!popup||!currentUser) return;
  $("#profileAvatarLg").textContent=(currentUser.name||"?")[0].toUpperCase();
  $("#profileName").textContent=currentUser.name;
  $("#profileEmail").textContent=currentUser.email;
  $("#profileRegion").textContent=t("region."+(currentUser.region||"ua"));
  if(currentUser.created_at) $("#profileSince").textContent=new Date(currentUser.created_at).toLocaleDateString(lang==="ua"?"uk-UA":"ru-RU",{year:"numeric",month:"long"});
  $$(".lang-btn").forEach(b=>b.classList.toggle("active",b.dataset.lang===lang));
  $$(".region-btn").forEach(b=>b.classList.toggle("active",b.dataset.region===currentRegion));
  popup.hidden=false;$("#profileBackdrop").hidden=false;
  $("#avatarBtn").setAttribute("aria-expanded","true");
  clearInterval(clockTmr);
  const tickClock=()=>{const el=$("#profileClock");if(el)el.textContent=new Date().toLocaleTimeString(lang==="ua"?"uk-UA":"ru-RU");};
  tickClock();clockTmr=setInterval(tickClock,1000);
  clearInterval(uptimeTmr);
  const tickUp=()=>{
    const el=$("#profileUptime");if(!el) return;
    const s=Math.floor((Date.now()-sessionStart)/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),ss=s%60;
    el.textContent=h>0?`${h}г ${m}м`:m>0?`${m}м ${ss}с`:`${ss}с`;
  };
  tickUp();uptimeTmr=setInterval(tickUp,1000);
}

function closeProfile(){
  $("#profilePopup").hidden=true;$("#profileBackdrop").hidden=true;
  $("#avatarBtn")?.setAttribute("aria-expanded","false");
  clearInterval(clockTmr);clearInterval(uptimeTmr);
}

async function changeLang(l){
  lang=l;localStorage.setItem("pm_lang",l);
  try{await api("/api/auth/me",{method:"PATCH",body:JSON.stringify({language:l})});}catch{}
  applyI18n();
  $$(".lang-btn").forEach(b=>b.classList.toggle("active",b.dataset.lang===l));
  toast(t("toast.langChanged"),"success");
  await loadProducts();await loadDashboard();
  if(currentView==="alerts")    await renderAlerts();
  if(currentView==="logs")      await renderLogs();
  if(currentView==="favorites") await loadFavorites();
}

async function changeRegion(r){
  currentRegion=r;localStorage.setItem("pm_region",r);
  try{currentUser=await api("/api/auth/me",{method:"PATCH",body:JSON.stringify({region:r})});}catch{}
  $$(".region-btn").forEach(b=>b.classList.toggle("active",b.dataset.region===r));
  const el=$("#profileRegion");if(el) el.textContent=t("region."+r);
  toast(t("toast.regionChanged"),"success");
  closeProfile();
  await Promise.all([loadProducts({skeleton:true}),loadDashboard()]);
}

async function start(){
  if(!token){showSplashNew();return;}
  try{
    currentUser=await api("/api/auth/me");
    lang=currentUser.language||lang;
    currentRegion=currentUser.region||currentRegion;
    localStorage.setItem("pm_lang",lang);
    localStorage.setItem("pm_region",currentRegion);
    showSplashWelcome(currentUser.name,async()=>{
      $("#app").hidden=false;
      $("#avatar").textContent=(currentUser.name||"?")[0].toUpperCase();
      $("#userName").textContent=currentUser.name;
      $("#overview").classList.add("view-enter");
      applyI18n();
      renderCards("#popular",[],  "",true);
      renderCards("#allProducts",[],  "",true);
      await loadDashboard();
      prevFiredCount=prevStats.fired||0;
      await loadProducts();
      startAutoRefresh();
      checkInitialRoute();
    });
  }catch{hideSplashNow();logout();}
}

function logout(){
  localStorage.removeItem("pm_token");
  token=null;currentUser=null;
  clearInterval(refreshTimer);clearInterval(clockTmr);clearInterval(uptimeTmr);
  closeProfile();
  if(!$("#productPage").hidden) closeProductPage();
  hideSplashNow();
  $("#app").hidden=true;
  $("#auth").hidden=false;
  applyI18n();
}

let isRegister=false;
$("#authSwitch").onclick=()=>{
  isRegister=!isRegister;
  $("#authTitle").textContent=isRegister?t("auth.register"):t("auth.login");
  $("#authMessage").textContent=isRegister?t("auth.registerHint"):t("auth.loginHint");
  $("#authName").hidden=!isRegister;
  $("#authName").required=isRegister;
  $("#authSwitch").textContent=isRegister?t("auth.hasAccount"):t("auth.createAccount");
  $("#authError").textContent="";
};

$("#authForm").onsubmit=async e=>{
  e.preventDefault();
  const btn=$("#authSubmit");btn.disabled=true;btn.classList.add("pulse");
  $("#authError").textContent="";
  const body={email:$("#authEmail").value.trim(),password:$("#authPassword").value,...(isRegister?{name:$("#authName").value.trim()}:{})};
  try{
    const r=await api(`/api/auth/${isRegister?"register":"login"}`,{method:"POST",body:JSON.stringify(body)});
    token=r.token;localStorage.setItem("pm_token",token);
    $("#auth").hidden=true;
    await start();
  }catch(err){$("#authError").textContent=err.message;toast(err.message,"error");}
  finally{btn.disabled=false;btn.classList.remove("pulse");}
};

document.addEventListener("click",async e=>{
  const navBtn=e.target.closest("[data-view]");
  if(navBtn&&!e.target.closest(".panel")&&!e.target.closest(".product-page")){switchView(navBtn.dataset.view);return;}
  if(e.target.closest("#avatarBtn")){$("#profilePopup").hidden?openProfile():closeProfile();return;}
  if(e.target.id==="profileBackdrop"){closeProfile();return;}
  if(e.target.id==="profileClose"){closeProfile();return;}
  if(e.target.id==="profileLogout"){logout();return;}
  const langBtn=e.target.closest(".lang-btn");if(langBtn){await changeLang(langBtn.dataset.lang);return;}
  const regBtn=e.target.closest(".region-btn");if(regBtn){await changeRegion(regBtn.dataset.region);return;}

  if(e.target.id==="addParseBtn"||e.target.closest("#addParseBtn")){
    const btn=$("#addParseBtn"),url=$("#addParseUrl")?.value?.trim();
    if(!url) return;
    btn.disabled=true;btn.classList.add("pulse");
    const prev=$("#addParsePreview");prev.className="parse-preview";prev.textContent="…";
    try{
      const res=await api("/api/parse",{method:"POST",body:JSON.stringify({url})});
      if(res.ok&&res.price>0){
        prev.className="parse-preview visible";
        prev.innerHTML=`<b>${esc(res.store)}</b>: ${money(res.price)}${res.name?`<small> — ${esc(res.name.slice(0,60))}</small>`:""}`;
        const sr=$("#storeRows"),si=$("input[name=store]",sr),vi=$("input[name=value]",sr),ui=$(".store-url",sr);
        if(si&&!si.value) si.value=res.store;
        if(vi&&!vi.value) vi.value=res.price;
        if(ui&&!ui.value) ui.value=url;
        const ni=$("input[name=name]",$("#productForm"));
        if(ni&&!ni.value&&res.name) ni.value=res.name.slice(0,100);
        toast(t("toast.parsedOk"),"success");
      }else{prev.className="parse-preview visible";prev.textContent=lang==="ua"?"Ціну не знайдено. Введіть вручну.":"Цена не найдена. Введите вручную.";}
    }catch(err){prev.className="parse-preview visible";prev.textContent=(lang==="ua"?"Помилка: ":"Ошибка: ")+err.message;}
    finally{btn.disabled=false;btn.classList.remove("pulse");}
    return;
  }

  const tabBtn=e.target.closest(".tab-btn");if(tabBtn&&tabBtn.dataset.tab){activateTab(tabBtn.dataset.tab);return;}
  const act=e.target.closest("[data-act]");if(!act) return;
  const id=Number(act.dataset.id);

  switch(act.dataset.act){
    case "close": await closePanel(); break;
    case "fav":   await toggleFav(id); break;
    case "details": await details(id); break;
    case "open-page": await closePanel();await openProductPage(id); break;
    case "alert": alertForm(id,act.dataset.name,Number(act.dataset.current)); break;
    case "add-store":{
      const row=document.createElement("div");row.className="store-row reveal";
      row.innerHTML=`<input name="store" placeholder="${t("detail.store")}" minlength="1"><input name="value" type="number" min="1" placeholder="${t("detail.price")}"><input name="url" placeholder="URL" class="store-url"><button class="icon-btn" type="button" data-act="rm-store">×</button>`;
      $("#storeRows").append(row);break;
    }
    case "rm-store": act.closest(".store-row")?.remove(); break;
    case "refresh":{
      act.disabled=true;act.classList.add("pulse");
      try{await api(`/api/products/${id}/refresh`,{method:"POST"});toast(t("toast.pricesSaved"),"success");await Promise.all([loadProducts(),loadDashboard()]);await details(id);}
      catch(err){toast(err.message,"error");}
      finally{act.disabled=false;act.classList.remove("pulse");}
      break;
    }
    case "parse-product":{
      act.disabled=true;act.classList.add("pulse");
      try{
        await api(`/api/products/${id}/parse`,{method:"POST",body:JSON.stringify({url:act.dataset.url})});
        toast(t("toast.parsedOk"),"success");
        await Promise.all([loadProducts(),loadDashboard()]);
        if($("#panel").open) await details(id);
        if(!$("#productPage").hidden) await openProductPage(id);
      }catch(err){toast(err.message,"error");}
      finally{act.disabled=false;act.classList.remove("pulse");}
      break;
    }
    case "del-alert":
      await api(`/api/alerts/${id}`,{method:"DELETE"});
      toast(t("toast.alertDel"),"success");
      await Promise.all([renderAlerts(),loadDashboard()]);break;
    case "delete-product":
      await deleteProduct(id,act.dataset.name||"");break;
  }
});

document.addEventListener("submit",async e=>{
  if(e.target.id==="productForm"){
    e.preventDefault();
    const form=e.target,btn=$("button[type=submit]",form);
    btn.disabled=true;btn.classList.add("pulse");
    try{
      const si=$$("input[name=store]",form),vi=$$("input[name=value]",form),ui=$$(".store-url",form);
      const prices=si.map((inp,i)=>({store:inp.value.trim(),value:parseFloat(vi[i]?.value)||0,url:ui[i]?.value.trim()||""})).filter(p=>p.store&&p.value>0);
      const body={name:$("input[name=name]",form).value.trim(),category:$("select[name=category]",form).value,image:$("input[name=image]",form).value.trim(),region:currentRegion,source_url:$("#addParseUrl")?.value?.trim()||"",prices};
      await api("/api/products",{method:"POST",body:JSON.stringify(body)});
      await closePanel();await Promise.all([loadProducts(),loadDashboard()]);
    }catch(err){toast(err.message,"error");}
    finally{btn.disabled=false;btn.classList.remove("pulse");}
  }
  if(e.target.id==="priceForm"){
    e.preventDefault();
    const form=e.target,id=Number(form.dataset.id);
    const body={store:$("input[name=store]",form).value.trim(),value:parseFloat($("input[name=value]",form).value),url:$("input[name=url]",form).value.trim()};
    try{await api(`/api/products/${id}/prices`,{method:"POST",body:JSON.stringify(body)});toast(t("toast.pricesSaved"),"success");await Promise.all([loadProducts(),loadDashboard()]);await details(id);}
    catch(err){toast(err.message,"error");}
  }
  if(e.target.id==="alertForm"){
    e.preventDefault();
    const form=e.target,id=Number(form.dataset.id),target=parseFloat($("input[name=target]",form).value);
    try{await api("/api/alerts",{method:"POST",body:JSON.stringify({product_id:id,target})});toast(t("toast.alertCreated"),"success");await closePanel();await loadDashboard();}
    catch(err){toast(err.message,"error");}
  }
  if(e.target.id==="parseUrlForm"){
    e.preventDefault();
    const form=e.target,id=Number(form.dataset.id),url=$("input[name=url]",form).value.trim();
    const btn=$("button[type=submit]",form);btn.disabled=true;btn.classList.add("pulse");
    try{await api(`/api/products/${id}/parse`,{method:"POST",body:JSON.stringify({url})});toast(t("toast.parsedOk"),"success");await Promise.all([loadProducts(),loadDashboard()]);await details(id);}
    catch(err){toast(err.message,"error");}
    finally{btn.disabled=false;btn.classList.remove("pulse");}
  }
});

document.addEventListener("input",e=>{
  if(e.target.id==="search"){clearTimeout(searchTmr);searchTmr=setTimeout(()=>loadProducts(),300);}
  if(e.target.id==="logsProductFilter"||e.target.id==="logsSourceFilter") renderLogs();
});
document.addEventListener("change",e=>{if(e.target.id==="category") loadProducts();});

$("#logout").onclick=logout;
$("#profileLogout").onclick=logout;
$("#add").onclick=productForm;
$("#add2").onclick=productForm;
$("#refresh").onclick=async()=>{const btn=$("#refresh");btn.classList.add("pulse");try{await Promise.all([loadProducts(),loadDashboard()]);}finally{btn.classList.remove("pulse");}};
$("#logsRefresh").onclick=renderLogs;

document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){
    if(!$("#profilePopup").hidden){closeProfile();return;}
    if(!$("#productPage").hidden){closeProductPage();return;}
    closePanel();
  }
});

$("#panel").addEventListener("click",e=>{if(e.target===e.currentTarget) closePanel();});
document.addEventListener("click",()=>ensureAudioCtx(),{once:true});
document.addEventListener("keydown",()=>ensureAudioCtx(),{once:true});

applyI18n();
start();
