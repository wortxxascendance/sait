/* Авто Босс: подбор по бюджету, журнал машин из канала, отзывы 2ГИС, заявка в WhatsApp. Данные — js/data.js (собирает custom-wip/avtoboss-khab/build.py) */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var num = function (n) { return Number(n).toLocaleString('ru-RU').replace(/\s/g, ' '); };
  var rub = function (n) { return num(n) + ' ₽'; };
  var WA = '79145448788';
  var waUrl = function (t) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t); };
  var CARS = window.CARS, RV = window.RV, TH = window.TH;
  var isMob = function () { return window.innerWidth < 641; };
  var COUNTRY = { jp: 'Япония', cn: 'Китай', kr: 'Корея' };

  /* появление */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px' }) : null;
  $$('[data-rv]').forEach(function (el) { if (io) io.observe(el); else el.classList.add('on'); });

  /* счётчики */
  var N = { all: CARS.length, client: CARS.filter(function (c) { return c.st; }).length, jp: 0, cn: 0, kr: 0 };
  CARS.forEach(function (c) { N[c.w]++; });
  $$('[data-n]').forEach(function (el) { el.textContent = N[el.dataset.n]; });

  /* открыто сейчас: время Хабаровска, UTC+10 */
  function paintStatus() {
    var n = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Vladivostok' })), h = n.getHours() + n.getMinutes() / 60;
    var on = h >= 10 && h < 20, t = on ? 'Открыто до 20:00' : (h < 10 ? 'Откроемся сегодня в 10:00' : 'Откроемся завтра в 10:00');
    $$('[data-status]').forEach(function (el) { el.textContent = t; el.classList.toggle('on', on); el.hidden = false; });
  }
  paintStatus(); setInterval(paintStatus, 60000);

  /* ---------- общее для машин ---------- */
  var name = function (c) { return c.mk + ' ' + c.md; };
  var km = function (c) { return c.nw ? 'новый' : c.km ? num(c.km) + ' км' : ''; };
  var spec = function (c) { return [km(c), c.e, c.g, c.dr ? (c.dr === '2WD' ? '2WD' : c.dr + ' привод') : ''].filter(Boolean).join(' · '); };
  var priceSub = function (c) { return 'Под ключ' + (c.wh ? ' ' + c.wh : '') + ', курс на ' + c.dt; };
  var LOGO = '<svg viewBox="14 20 410 74" aria-hidden="true"><use href="#lg"/></svg>';
  var askText = function (c) { return 'Здравствуйте! На сайте увидел ' + name(c) + ' ' + c.y + ' года за ' + num(c.p) + ' ₽. ' + (c.st ? 'Можете подобрать такую же?' : 'Такая ещё доступна?'); };
  var phSrc = function (c) { return 'img/car/' + c.id + '_m.jpg'; };
  var gradeHtml = function (c) { return c.gr ? '<span class="grade"><small>оценка</small>' + esc(c.gr) + '</span>' : ''; };
  var toText = function (c) { return c.to && c.st.indexOf(c.to.slice(0, 6)) < 0 ? '. Клиент: ' + esc(c.to) : ''; };
  var statusLine = function (c) { return c.st ? '<b>' + esc(c.st) + '</b>' + toText(c) : 'Предложение из поста, ' + monthOf(c.dt); };
  var MONG = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  function monthOf(dt) { return MONG[+dt.slice(3, 5) - 1] + ' ' + dt.slice(6); }
  var byId = {};
  CARS.forEach(function (c, i) { byId[c.id] = i; });

  /* ---------- бюджет: шаги неравномерные, в начале ценовой шкалы машин больше ---------- */
  var STEPS = [];
  (function () { var v; for (v = 500000; v < 2000000; v += 50000) STEPS.push(v); for (v = 2000000; v < 3000000; v += 100000) STEPS.push(v); for (v = 3000000; v <= 4500000; v += 250000) STEPS.push(v); })();
  var rng = $('#bud'), budget = 1500000;
  rng.max = STEPS.length - 1;
  var idxOf = function (v) { var i = STEPS.indexOf(v); return i < 0 ? 0 : i; };
  rng.value = idxOf(budget);
  $('#ticks').innerHTML = [[500000, '0,5 млн'], [1000000, '1'], [1500000, '1,5'], [2000000, '2'], [3000000, '3'], [4500000, '4,5']].map(function (t) {
    return '<button type="button" data-tick="' + t[0] + '" aria-label="Бюджет ' + num(t[0]) + ' рублей" style="left:' + (idxOf(t[0]) / (STEPS.length - 1) * 100).toFixed(2) + '%">' + t[1] + '</button>';
  }).join('');
  var inBudget = function (b) { return CARS.filter(function (c) { return c.p <= b; }).sort(function (a, c) { return (c.p - a.p) || ((c.st ? 1 : 0) - (a.st ? 1 : 0)); }); };
  var plural = function (n) { var a = n % 10, b = n % 100; return a === 1 && b !== 11 ? 'машина' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'машины' : 'машин'; };
  function lotBig(c) {
    var ph = c.n ? '<img src="' + phSrc(c) + '" alt="' + esc(name(c) + ' ' + c.y) + '" width="760" height="456" fetchpriority="high">' : '<span class="noph"><span>' + LOGO + 'Фото и видео в посте канала</span></span>';
    return '<article class="lot"><button class="lot-ph" type="button" data-open="' + byId[c.id] + '" aria-label="Подробнее: ' + esc(name(c)) + ' ' + c.y + '">' + ph + '<span class="tag">' + COUNTRY[c.w] + '</span>' + gradeHtml(c) + '</button>'
      + '<div class="lot-b"><div><h3>' + esc(name(c)) + ' <span>' + c.y + '</span></h3><p class="sp">' + esc(spec(c)) + '</p></div><div><span class="plate">' + rub(c.p) + '</span></div><p class="wh" style="grid-column:1/-1">' + statusLine(c) + '. ' + priceSub(c) + '</p></div></article>';
  }
  function lotSmall(c) {
    return '<button class="lot-s" type="button" data-open="' + byId[c.id] + '"><img src="' + phSrc(c) + '" alt="" width="96" height="72" loading="lazy"><div><b>' + esc(name(c)) + ' ' + c.y + '</b><span>' + rub(c.p) + '</span></div></button>';
  }
  var lastTop = '';
  function paintBudget() {
    var list = inBudget(budget), withPh = list.filter(function (c) { return c.n; });
    $('#budV').textContent = rub(budget);
    rng.setAttribute('aria-valuetext', 'до ' + num(budget) + ' рублей, ' + list.length + ' ' + plural(list.length));
    rng.style.setProperty('--p', (rng.value / rng.max * 100) + '%');
    $('#budN').innerHTML = '<b>' + list.length + ' ' + plural(list.length) + '</b> из ' + CARS.length + ' в пределах этой суммы.';
    var pick = withPh.length ? withPh.slice(0, 3) : list.slice(0, 1);
    var key = pick.map(function (c) { return c.id; }).join();
    if (key !== lastTop) {
      lastTop = key;
      $('#hCar').innerHTML = lotBig(pick[0]);
      $('#hMore').innerHTML = pick.slice(1).map(lotSmall).join('');
    }
    $('#budWa').href = waUrl('Здравствуйте! Мой бюджет до ' + num(budget) + ' ₽. Подберёте варианты?');
    $('#budAll').textContent = 'Смотреть все (' + list.length + ')';
    var lb = $('#lBud'); if (lb && !lb.dataset.touched) lb.value = rub(budget);
  }
  rng.addEventListener('input', function () { budget = STEPS[+rng.value]; paintBudget(); });
  $('#ticks').addEventListener('click', function (e) { var b = e.target.closest('[data-tick]'); if (!b) return; budget = +b.dataset.tick; rng.value = idxOf(budget); paintBudget(); });
  $('#budAll').addEventListener('click', function () { fBud = budget; fW = 'all'; page = 0; $$('#fW .chip[data-w]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.w === 'all'); }); $('#fS').value = 'exp'; renderCars(); });

  /* ---------- журнал ---------- */
  function card(c) {
    var i = byId[c.id];
    var ph = c.n ? '<img src="' + phSrc(c) + '" alt="' + esc(name(c) + ' ' + c.y) + '" loading="lazy" width="640" height="480">' : '<span class="noph"><span>' + LOGO + 'Фото и видео в посте канала</span></span>';
    return '<article class="car"><button class="car-ph" type="button" data-open="' + i + '" aria-label="Подробнее: ' + esc(name(c)) + ' ' + c.y + '">' + ph + '<span class="tag">' + COUNTRY[c.w] + '</span>' + gradeHtml(c) + '</button>'
      + '<div class="car-b"><h3>' + esc(name(c)) + ' <span>' + c.y + '</span></h3><p class="sp">' + esc(spec(c)) + '</p><p class="stt">' + statusLine(c) + '</p>'
      + '<div class="pr"><span class="plate">' + rub(c.p) + '</span><small>' + priceSub(c) + '</small></div>'
      + '<div class="car-a"><button class="btn" type="button" data-open="' + i + '">Подробнее</button><a class="btn btn-p" href="' + waUrl(askText(c)) + '" target="_blank" rel="noopener">Хочу такую</a></div></div></article>';
  }
  var fW = 'all', fBud = 0, page = 0;
  var perPage = function () { return isMob() ? 6 : window.innerWidth < 1041 ? 8 : 12; };
  var WISH = '<div class="wish"><h3>Нужна другая?</h3><p>Напишите бюджет и пожелания. В ответ придут варианты и расчёт.</p><a class="btn btn-p" href="#contacts">Подобрать машину</a><a class="btn btn-d" href="#calc">Посчитать самому</a></div>';
  function filtered() {
    var b = $('#fB').value, s = $('#fS').value;
    var list = CARS.filter(function (c) {
      if (fW !== 'all' && c.w !== fW) return false;
      if (b && c.b !== b) return false;
      if (fBud && c.p > fBud) return false;
      return true;
    });
    var cmp = { cheap: function (a, c) { return a.p - c.p; }, exp: function (a, c) { return c.p - a.p; }, 'new': function (a, c) { return c.y - a.y; }, km: function (a, c) { return (a.km || 1e9) - (c.km || 1e9); } }[s];
    return cmp ? list.slice().sort(cmp) : list;
  }
  function renderCars() {
    var list = filtered(), show = list.slice(0, (page + 1) * perPage());
    $('#carGrid').innerHTML = list.length ? show.map(card).join('') + (show.length === list.length ? WISH : '')
      : '<div class="empty"><p>С такими условиями в списке машин нет, но их можно найти на аукционе.</p><p style="margin-top:12px"><button class="btn" type="button" id="fReset">Сбросить фильтры</button> <a class="btn btn-p" href="#contacts">Подобрать машину</a></p></div>';
    var left = list.length - show.length, m = $('#carMore');
    m.hidden = left <= 0; m.textContent = 'Показать ещё ' + Math.min(left, perPage());
    var x = $('#fBudX'); x.hidden = !fBud; if (fBud) x.textContent = 'До ' + rub(fBud) + ' ×';
  }
  function setW(w) { fW = w; page = 0; $$('#fW .chip[data-w]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.w === w); }); renderCars(); }
  $('#fW').addEventListener('click', function (e) { var b = e.target.closest('[data-w]'); if (b) setW(b.dataset.w); });
  $('#fBudX').addEventListener('click', function () { fBud = 0; page = 0; renderCars(); });
  ['#fB', '#fS'].forEach(function (s) { $(s).addEventListener('change', function () { page = 0; renderCars(); }); });
  $('#carMore').addEventListener('click', function () { page++; renderCars(); });
  renderCars();
  var lastW = window.innerWidth;
  addEventListener('resize', function () { if (Math.abs(window.innerWidth - lastW) > 80) { lastW = window.innerWidth; renderCars(); } });

  /* ---------- окно машины ---------- */
  var gal = { c: null, i: 0 };
  var galSrc = function (c, k) { return 'img/car/' + c.id + '_' + k + '.jpg'; };
  function showPhoto(k) {
    var c = gal.c; if (!c.n) return; gal.i = (k + c.n) % c.n;
    var im = $('#galM'); im.src = galSrc(c, gal.i);
    im.alt = gal.i === c.sh ? 'Аукционный лист ' + name(c) : name(c) + ', фото ' + (gal.i + 1);
    $$('#galT button').forEach(function (b, j) { b.setAttribute('aria-current', j === gal.i); });
  }
  function openCar(c) {
    gal.c = c; gal.i = 0;
    var thumbs = '';
    for (var k = 0; k < c.n; k++) thumbs += '<button type="button" data-g="' + k + '" aria-label="' + (k === c.sh ? 'Аукционный лист' : 'Фото ' + (k + 1)) + '"><img src="' + galSrc(c, k) + '" alt="">' + (k === c.sh ? '<span>Лист</span>' : '') + '</button>';
    var rows = [['Страна', COUNTRY[c.w]], ['Пробег', km(c)], ['Двигатель', c.e], ['Коробка', c.g], ['Привод', c.dr], ['Версия', c.tr], ['Оценка аукциона', c.gr]].filter(function (r) { return r[1]; });
    var call = c.st
      ? '<p class="call"><b>' + esc(c.st) + toText(c) + '.</b> Такую же можно подобрать на аукционе.</p>'
      : '<p class="call"><b>Предложение из поста, ' + monthOf(c.dt) + '.</b> Наличие и цену на сегодня уточните у менеджера.</p>';
    var media = c.n
      ? '<div class="gal"><div class="gal-m"><img id="galM" src="' + galSrc(c, 0) + '" alt="' + esc(name(c)) + '">' + (c.n > 1 ? '<button class="p" type="button" data-step="-1" aria-label="Предыдущее фото">‹</button><button class="n" type="button" data-step="1" aria-label="Следующее фото">›</button>' : '') + '</div><div class="gal-t" id="galT">' + thumbs + '</div></div>'
      : '<div class="gal"><span class="noph"><span>' + LOGO + '<a href="' + esc(c.url) + '" target="_blank" rel="noopener" style="color:#fff">Фото и видео в посте канала</a></span></span></div>';
    $('#carB').innerHTML = '<div class="d-g">' + media
      + '<div class="d-i"><h3>' + esc(name(c)) + ' ' + c.y + '</h3><span class="plate">' + rub(c.p) + '</span><p class="pz">' + priceSub(c) + '</p>' + call
      + '<dl class="dl">' + rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl>'
      + (c.cond.length ? '<p class="d-h">Состояние, как в посте</p><ul class="d-n">' + c.cond.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '')
      + (c.opt.length ? '<p class="d-h">Опции</p><ul class="d-n">' + c.opt.slice(0, 8).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '')
      + '<div class="d-a"><a class="btn btn-p" href="' + waUrl(askText(c)) + '" target="_blank" rel="noopener">Хочу такую</a><a class="btn" href="tel:88007000848">Позвонить: 8 800 700-08-48</a></div>'
      + '<p class="d-s"><a href="' + esc(c.url) + '" target="_blank" rel="noopener">Пост в канале Авто Босс</a></p></div></div>';
    if (c.n) showPhoto(0);
    openDlg($('#carD'));
  }
  function openDlg(d) { if (d.showModal) d.showModal(); else d.setAttribute('open', ''); document.documentElement.style.overflow = 'hidden'; d.scrollTop = 0; }
  $$('dialog').forEach(function (d) {
    d.addEventListener('close', function () { document.documentElement.style.overflow = ''; });
    d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
  });
  addEventListener('keydown', function (e) {
    if (!$('#carD').open || !gal.c) return;
    if (e.key === 'ArrowLeft') showPhoto(gal.i - 1);
    if (e.key === 'ArrowRight') showPhoto(gal.i + 1);
  });

  /* ---------- отзывы ---------- */
  var MON = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
  var when = function (d) { return MON[+d.slice(5) - 1] + ' ' + d.slice(0, 4); };
  var withPh = RV.map(function (r, i) { return i; }).filter(function (i) { return RV[i].img; });
  $('#wall').innerHTML = withPh.map(function (i) {
    var r = RV[i];
    return '<button type="button" data-rv-open="' + i + '" aria-label="Отзыв: ' + esc(r.a) + (r.m ? ', ' + esc(r.m) : '') + '"><img src="img/rv/' + r.img + '_t.jpg" alt="' + esc(r.m ? 'Машина клиента: ' + r.m : 'Машина клиента Авто Босс') + '" loading="lazy" width="480" height="360"></button>';
  }).join('');
  var rvTh = 'all', rvPage = 0;
  var rvPer = function () { return isMob() ? 4 : window.innerWidth < 1041 ? 6 : 9; };
  $('#rvF').innerHTML = '<button class="chip" type="button" data-th="all" aria-pressed="true">Все<small>' + RV.length + '</small></button>' + TH.map(function (t) { return '<button class="chip" type="button" data-th="' + t[0] + '" aria-pressed="false">' + esc(t[1]) + '<small>' + t[2] + '</small></button>'; }).join('');
  function rvList() {
    var l = RV.map(function (r, i) { return i; });
    if (rvTh !== 'all') l = l.filter(function (i) { return RV[i].th.indexOf(rvTh) >= 0; });
    return l.sort(function (a, c) { return ((RV[c].x.length > 60) - (RV[a].x.length > 60)) || (a - c); });
  }
  function renderRv() {
    var l = rvList(), s = l.slice(0, (rvPage + 1) * rvPer());
    $('#rvs').innerHTML = s.map(function (i) {
      var r = RV[i];
      return '<article class="rv"><div class="rv-top">' + (r.img ? '<img src="img/rv/' + r.img + '_t.jpg" alt="" loading="lazy" width="76" height="58">' : '') + '<div><div class="st" aria-label="5 из 5">★★★★★</div><div class="rv-w"><b>' + esc(r.a) + '</b>, ' + when(r.d) + (r.m ? '<br>' + esc(r.m) : '') + '</div></div></div><p>' + esc(r.x) + '</p>' + (r.t.length > r.x.length + 12 ? '<button type="button" data-rv-open="' + i + '">Читать весь отзыв</button>' : '') + '</article>';
    }).join('');
    var left = l.length - s.length, m = $('#rvMore'); m.hidden = left <= 0; m.textContent = 'Показать ещё отзывы (' + left + ')';
  }
  $('#rvF').addEventListener('click', function (e) { var b = e.target.closest('[data-th]'); if (!b) return; rvTh = b.dataset.th; rvPage = 0; $$('#rvF .chip').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); renderRv(); });
  $('#rvMore').addEventListener('click', function () { rvPage++; renderRv(); });
  renderRv();
  function openRv(i) {
    var r = RV[i];
    $('#rvB').innerHTML = (r.img ? '<img src="img/rv/' + r.img + '.jpg" alt="' + esc(r.m ? 'Машина клиента: ' + r.m : 'Машина клиента') + '">' : '') + '<div class="rv-d"><small><b style="color:var(--t)">' + esc(r.a) + '</b>, ' + when(r.d) + (r.m ? ', ' + esc(r.m) : '') + ' · ' + (r.part ? 'отрывок из отзыва в 2ГИС' : 'отзыв в 2ГИС') + '</small><p>' + esc(r.t) + '</p></div>';
    openDlg($('#rvD'));
  }

  /* ---------- общие клики ---------- */
  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-open]'); if (o) { openCar(CARS[+o.dataset.open]); return; }
    var g = e.target.closest('[data-g]'); if (g) { showPhoto(+g.dataset.g); return; }
    var st = e.target.closest('[data-step]'); if (st) { showPhoto(gal.i + +st.dataset.step); return; }
    var r = e.target.closest('[data-rv-open]'); if (r) { openRv(+r.dataset.rvOpen); return; }
    if (e.target.id === 'fReset') { $('#fB').value = ''; $('#fS').value = ''; fBud = 0; setW('all'); }
  });

  /* ---------- калькулятор: свой пример по стране, пока человек не ввёл своё ---------- */
  var setR = function (n, v) { var x = $('input[name="' + n + '"][value="' + v + '"]'); if (x) x.checked = true; };
  var EX = { JP: ['1 500 000', '1490', '120', 'Пример: 1 500 000 ¥, 1,5 л, 120 л.с. Впишите свою ставку'], KR: ['20 000 000', '1598', '123', 'Пример: 20 000 000 вон, 1,6 л, 123 л.с. Впишите цену продавца'], CN: ['100 000', '1497', '150', 'Пример: 100 000 юаней, 1,5 л, 150 л.с. Впишите цену продавца'] };
  var exMode = true;
  function example(c) { var e = EX[c]; if (!e) return; setR('age', '3to5'); $('#price').value = e[0]; $('#cc').value = e[1]; $('#hp').value = e[2]; $('#price-h').textContent = e[3]; $('#hp').dispatchEvent(new Event('input', { bubbles: true })); }
  ['#price', '#cc', '#hp'].forEach(function (s) { $(s).addEventListener('input', function (e) { if (e.isTrusted) exMode = false; }); });
  document.addEventListener('change', function (e) { if (e.target.name === 'country' && exMode) example(e.target.value); });
  example('JP');

  /* ---------- заявка ---------- */
  var F = { lWhat: 'Напишите, какую машину ищете', lName: 'Напишите, как к вам обращаться' };
  function bad(id, msg) { var el = $('#' + id), er = $('#' + id + '-e'); el.setAttribute('aria-invalid', msg ? 'true' : 'false'); er.hidden = !msg; er.textContent = msg || ''; }
  Object.keys(F).forEach(function (id) {
    var el = $('#' + id);
    el.addEventListener('blur', function () { if (el.dataset.touched && !el.value.trim()) bad(id, F[id]); });
    el.addEventListener('input', function () { el.dataset.touched = '1'; bad(id, ''); });
    el.addEventListener('focus', function () { bad(id, ''); });
  });
  $('#lBud').addEventListener('input', function () { this.dataset.touched = '1'; });
  $('#lOk').addEventListener('change', function () { bad('lOk', ''); });
  $('#leadForm').addEventListener('submit', function (e) {
    e.preventDefault();
    $('#sent').hidden = true;
    var first = null;
    Object.keys(F).forEach(function (id) { var el = $('#' + id); if (!el.value.trim()) { bad(id, F[id]); first = first || el; } else bad(id, ''); });
    if (!$('#lOk').checked) { bad('lOk', 'Нужно согласие, чтобы отправить заявку'); first = first || $('#lOk'); } else bad('lOk', '');
    if (first) { first.focus(); return; }
    var b = $('#lBud').value.trim();
    var t = 'Здравствуйте! Меня зовут ' + $('#lName').value.trim() + '.\nИщу: ' + $('#lWhat').value.trim() + (b ? '\nБюджет: ' + b : '') + '\nПодскажите варианты и расчёт, пожалуйста.';
    var url = waUrl(t);
    $('#sentA').href = url; $('#sent').hidden = false;
    window.open(url, '_blank', 'noopener');
  });

  paintBudget();
})();
