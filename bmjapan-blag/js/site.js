/* БМ АВТО: каталог, окно машины, калькулятор (calc-core.js + rates.js, блок 2027 — deadline.js), путь машины по датам, заявка в WhatsApp.
   Данные — js/data.js (собран из Дрома, канала t.me/BMjapan28 и отзывов 2ГИС). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var PHONE = '79145695322', TEL = '+79145695322';
  var RM = document.documentElement.classList.contains('rm');
  var fmt = function (v) { return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
  var rub = function (v) { return fmt(v) + ' ₽'; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var waLink = function (t) { return 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(t); };
  var ruDate = function (d) { return d.split('-').reverse().join('.'); };
  var dm = function (d) { var p = d.split('-'); return p[2] + '.' + p[1]; };
  var pl = function (n, a, b, c) { var m = Math.abs(n) % 100, k = m % 10; if (m > 10 && m < 20) return c; if (k > 1 && k < 5) return b; if (k === 1) return a; return c; };
  var SNAP = ruDate(window.SNAP || '2026-11-10');
  var WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>';

  /* 1. ссылки WhatsApp с готовым текстом */
  $$('[data-wa]').forEach(function (a) { a.href = waLink(a.getAttribute('data-wa')); });

  /* 2. появление при прокрутке и нижняя панель на телефоне */
  if ('IntersectionObserver' in window && !RM) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('.rv').forEach(function (el) { io.observe(el); });
  } else $$('.rv').forEach(function (el) { el.classList.add('in'); });
  var mbar = $('#mbar'), hero = $('.hero');
  var onScroll = function () { mbar.classList.toggle('on', window.scrollY > hero.offsetHeight * 0.75); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* 3. каталог */
  var CARS = window.CARS || [], CN = window.CN || [];
  var grid = $('#grid'), tabs = { jp: $('#tab-jp'), cn: $('#tab-cn') };
  $('#nJp').textContent = CARS.length; $('#nCn').textContent = CN.length;
  var title = function (c) { return c.mk + ' ' + c.md + ' ' + c.y; };
  function cardJp(c, i) {
    var ru = c.where === 'ru';
    return '<article class="car">' +
      '<button class="ph" type="button" data-car="' + i + '" aria-label="Фото и подробности: ' + esc(title(c)) + '"><img src="img/car/' + c.id + '-0s.jpg" width="640" height="480" alt="' + esc(title(c)) + ', ' + esc(c.color) + '" loading="lazy" decoding="async">' +
      '<span class="badge' + (ru ? ' ru' : '') + '"><i></i>' + (ru ? 'В наличии в Свободном' : 'Стоит на стоянке в Японии') + '</span><span class="cnt">' + c.n + ' фото' + (c.sheet ? ' и лист' : '') + '</span></button>' +
      '<div class="cb"><h3>' + esc(c.mk + ' ' + c.md) + ' <span>' + c.y + '</span></h3><p class="tr">' + esc(c.trim) + '</p>' +
      '<ul class="sp"><li>' + fmt(c.km) + ' км</li><li>' + esc(c.eng) + '</li><li>' + esc(c.gear) + ', ' + esc(c.drive) + '</li><li>оценка ' + esc(c.grade) + '</li></ul>' +
      '<div class="price"><b class="num">' + rub(c.p) + '</b><span>на Дроме, ' + SNAP + '</span></div>' +
      '<p class="eta">' + esc(c.eta) + '</p>' +
      '<div class="ac"><a class="btn" href="' + waLink('Здравствуйте! Интересует ' + title(c) + ', ' + fmt(c.p).replace(/ /g, ' ') + ' ₽ — объявление на Дроме. Она ещё свободна?') + '" target="_blank" rel="noopener">Хочу эту</a><button class="btn line" type="button" data-car="' + i + '">Подробнее</button></div></div></article>';
  }
  function cardCn(c) {
    var t = c.mk + ' ' + c.md + ' ' + c.y;
    return '<article class="car"><div class="ph" style="cursor:default"><img src="img/cn/' + c.k + '.jpg" width="800" height="600" alt="' + esc(t) + '" loading="lazy" decoding="async"><span class="badge"><i></i>Под заказ из Китая</span></div>' +
      '<div class="cb"><h3>' + esc(c.mk + ' ' + c.md) + ' <span>' + c.y + '</span></h3>' +
      '<ul class="sp"><li>' + fmt(c.km) + ' км</li><li>' + esc(c.eng) + '</li></ul><p class="tr" style="margin-top:0">' + esc(c.f) + '</p>' +
      '<div class="price"><b class="num">' + rub(c.p) + '</b><span>предварительно, в Уссурийске</span></div>' +
      '<p class="eta">Предложение из канала от ' + ruDate(c.d) + ' — наличие уточните у менеджера</p>' +
      '<div class="ac"><a class="btn" href="' + waLink('Здравствуйте! Видел в канале ' + t + ' за ' + fmt(c.p).replace(/ /g, ' ') + ' ₽ в Уссурийске (пост от ' + ruDate(c.d) + '). Она ещё доступна?') + '" target="_blank" rel="noopener">Узнать</a><a class="btn line" href="tel:' + TEL + '">Позвонить</a></div></div></article>';
  }
  function cta(k) {
    return '<article class="car cta"><div class="cb"><span class="sun2" aria-hidden="true"></span><p class="eye">Под заказ</p><h3>' + (k === 'jp' ? 'Не нашли свою машину?' : 'Нужна другая машина из Китая?') + '</h3>' +
      '<p>Подбор бесплатный: под бюджет и требования, с аукционов Японии, Китая и Кореи. Цену под ключ можно прикинуть в калькуляторе.</p>' +
      '<div class="ac"><a class="btn" href="' + waLink('Здравствуйте! Хочу подобрать машину под заказ. Бюджет и пожелания напишу.') + '" target="_blank" rel="noopener">Подобрать</a><a class="btn line" href="tel:' + TEL + '">Позвонить</a></div></div></article>';
  }
  function showTab(k) {
    tabs.jp.setAttribute('aria-selected', k === 'jp'); tabs.cn.setAttribute('aria-selected', k === 'cn');
    grid.setAttribute('aria-labelledby', 'tab-' + k);
    grid.innerHTML = (k === 'jp' ? CARS.map(cardJp).join('') : CN.map(cardCn).join('')) + cta(k);
    $('#catNote').innerHTML = k === 'jp'
      ? 'Цены и наличие — по объявлениям на Дроме (auto.drom.ru/bm_japan) на ' + SNAP + '. Машину под ваш бюджет подберут бесплатно — <a href="#contacts">оставьте заявку</a>.'
      : 'Предложения из канала t.me/BMjapan28: цена предварительная, в Уссурийске, на дату поста. Похожую подберут под заказ — <a href="#contacts">оставьте заявку</a>.';
  }
  [['jp', tabs.jp], ['cn', tabs.cn]].forEach(function (p) { p[1].addEventListener('click', function () { showTab(p[0]); }); });
  tabs.jp.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { tabs.cn.focus(); showTab('cn'); } });
  tabs.cn.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') { tabs.jp.focus(); showTab('jp'); } });
  showTab('jp');

  /* 4. окно машины с галереей */
  var dlg = $('#dlg'), gImg = $('#gImg'), gTh = $('#gTh'), gLbl = $('#gLbl'), cur = null, gi = 0, opener = null;
  function shot(k) {
    var c = cur;
    gi = (k + c.n) % c.n;
    gImg.src = 'img/car/' + c.id + '-' + gi + '.jpg';
    gImg.alt = (c.sheet && gi === c.n - 1) ? 'Аукционный лист ' + title(c) : title(c) + ', фото ' + (gi + 1);
    gLbl.textContent = (c.sheet && gi === c.n - 1) ? 'Аукционный лист' : (gi + 1) + ' / ' + c.n;
    gImg.parentNode.classList.toggle('sheet', !!(c.sheet && gi === c.n - 1));
    $$('button', gTh).forEach(function (b, j) { b.setAttribute('aria-current', j === gi); });
    var t = gTh.children[gi]; if (t && t.scrollIntoView) { var r = t.getBoundingClientRect(), R = gTh.getBoundingClientRect(); if (r.left < R.left || r.right > R.right) gTh.scrollLeft += r.left - R.left - 40; }
  }
  function openCar(i, from) {
    var c = cur = CARS[i]; opener = from || null;
    gTh.innerHTML = Array.apply(null, Array(c.n)).map(function (_, k) {
      var sh = c.sheet && k === c.n - 1;
      return '<button type="button" data-k="' + k + '" aria-label="' + (sh ? 'Аукционный лист' : 'Фото ' + (k + 1)) + '"><img src="img/car/' + c.id + '-' + k + '.jpg" alt="" loading="lazy" decoding="async" width="76" height="57"></button>';
    }).join('');
    var util = '';
    if (c.where !== 'ru' && window.__deadlineDelta) {
      var d = window.__deadlineDelta({ who: 'fiz', engine: 'ice', age: 'gt3', cc: c.cc, hp: c.hp, serial: false });
      util = '<div class="util">' + (d.d > 0
        ? '<b>Утильсбор для физлица: ' + rub(d.a) + ' сейчас, ' + rub(d.b) + ' с 1 января 2027.</b> Разница — ' + rub(d.d) + '.'
        : '<b>Утильсбор для физлица — ' + rub(d.a) + ' и в 2026, и в 2027 году.</b> Льготная ставка: до 160 л.с., для себя.') + '</div>';
    }
    $('#dlgBody').innerHTML =
      '<p class="eye" style="margin-bottom:10px">' + (c.where === 'ru' ? 'В наличии' : 'Куплена, в Японии') + '</p>' +
      '<h3 id="dlgT" tabindex="-1">' + esc(c.mk + ' ' + c.md) + ' <span style="color:var(--mut);font-weight:500">' + c.y + '</span></h3>' +
      '<p class="tr" style="color:var(--mut);margin-top:-10px">' + esc(c.trim) + '</p>' +
      '<div class="price" style="padding:0"><b class="num">' + rub(c.p) + '</b><span>цена на Дроме на ' + SNAP + '</span></div>' +
      '<p class="eta">' + esc(c.st) + '. ' + esc(c.eta) + '.</p>' +
      '<dl class="kv"><dt>Пробег</dt><dd>' + fmt(c.km) + ' км</dd><dt>Двигатель</dt><dd>' + esc(c.eng) + '</dd><dt>Коробка</dt><dd>' + esc(c.gear) + '</dd><dt>Привод</dt><dd>' + esc(c.drive) + '</dd><dt>Цвет</dt><dd>' + esc(c.color) + '</dd><dt>Руль</dt><dd>правый</dd><dt>Оценка</dt><dd>' + esc(c.grade) + ' балла на аукционе</dd></dl>' +
      '<ul class="ticks">' + c.f.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' + util +
      '<div class="acts"><a class="btn" href="' + waLink('Здравствуйте! Интересует ' + title(c) + ', ' + fmt(c.p).replace(/ /g, ' ') + ' ₽ — объявление на Дроме. Она ещё свободна?') + '" target="_blank" rel="noopener">' + WA_ICON + 'Хочу эту машину</a><a class="btn line" href="tel:' + TEL + '">Позвонить</a></div>' +
      '<p class="src"><a href="' + esc(c.url) + '" target="_blank" rel="noopener">Объявление на Дроме</a>, обновлено ' + esc(c.date) + '.' + (c.where === 'ru' ? '' : ' Порядок оплаты — <a href="#how" data-close>в три этапа</a>.') + '</p>';
    shot(0);
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
    $('#dlgT').focus();
  }
  function closeDlg() { if (dlg.open) { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); } }
  dlg.addEventListener('close', function () { document.body.style.overflow = ''; if (opener && opener.focus) opener.focus(); });
  dlg.addEventListener('click', function (e) {
    if (e.target === dlg) { closeDlg(); return; }
    var t = e.target.closest('[data-k]'); if (t) { shot(+t.getAttribute('data-k')); return; }
    if (e.target.closest('[data-close]')) closeDlg();
  });
  $('#dlgX').addEventListener('click', closeDlg);
  $('#gPrev').addEventListener('click', function () { shot(gi - 1); });
  $('#gNext').addEventListener('click', function () { shot(gi + 1); });
  dlg.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') shot(gi - 1); if (e.key === 'ArrowRight') shot(gi + 1); });
  var sx = null;
  $('.gal .main').addEventListener('pointerdown', function (e) { sx = e.clientX; });
  $('.gal .main').addEventListener('pointerup', function (e) { if (sx === null) return; var d = e.clientX - sx; sx = null; if (Math.abs(d) > 40) shot(gi + (d < 0 ? 1 : -1)); });
  grid.addEventListener('click', function (e) { var b = e.target.closest('[data-car]'); if (b) openCar(+b.getAttribute('data-car'), b); });

  /* 5. калькулятор */
  var R = window.RATES, FX = { date: R.fx.date, rub: R.fx.rub, live: false };
  var CONFIG = { costs: { JP: { abroad: 120000, delivery: 60000 }, KR: { abroad: 150000, delivery: 60000 }, CN: { abroad: 120000, delivery: 50000 } }, service: 50000, broker: 80000, freightInCustomsValue: false };
  var CTRY = { JP: { n: 'Япония', cur: 'JPY', w: 'иен', port: 'во Владивостоке', inv: 'по инвойсу японской стороне', abroad: 'расходы по Японии и фрахт до Владивостока' }, KR: { n: 'Корея', cur: 'KRW', w: 'вон', port: 'во Владивостоке', inv: 'машина и доставка', abroad: 'расходы в Корее и доставка до Владивостока' }, CN: { n: 'Китай', cur: 'CNY', w: 'юаней', port: 'в Уссурийске', inv: 'машина и доставка', abroad: 'расходы в Китае и доставка до Уссурийска' } };
  var seg = function (id, name, list, val) {
    $(id).innerHTML = list.map(function (o) { return '<label><input type="radio" name="' + name + '" value="' + o[0] + '"' + (o[0] === val ? ' checked' : '') + '><span>' + o[1] + '</span></label>'; }).join('');
  };
  seg('#sCountry', 'country', [['JP', 'Япония'], ['KR', 'Корея'], ['CN', 'Китай']], 'JP');
  seg('#sAge', 'age', [['lt3', 'до 3 лет'], ['3to5', '3–5 лет'], ['5to7', '5–7 лет'], ['gt7', 'старше 7']], '3to5');
  seg('#sEng', 'engine', [['ice', 'Бензин, дизель'], ['hyb', 'Гибрид'], ['ev', 'Электро']], 'ice');
  seg('#sWho', 'who', [['fiz', 'Для себя'], ['yur', 'Компания или ИП']], 'fiz');
  seg('#sTo', 'to', [['port', 'Во Владивостоке'], ['blg', 'В Благовещенске, автовозом']], 'port');
  var cP = $('#cP'), cc = $('#cc'), hp = $('#hp'), touched = false, lastCalc = '';
  var radio = function (n) { var x = $('input[name="' + n + '"]:checked'); return x && x.value; };
  var num = function (s) { var v = parseFloat(String(s).replace(/[\s ]/g, '').replace(',', '.')); return isFinite(v) ? v : NaN; };
  var checks = [
    [cP, $('#cPe'), function (v) { return v > 0; }, 'Введите цену цифрами, например 1 500 000'],
    [cc, $('#ccE'), function (v) { return radio('engine') === 'ev' || (v >= 600 && v <= 8000); }, 'Объём от 600 до 8000 см³'],
    [hp, $('#hpE'), function (v) { return v >= 30 && v <= 1000; }, 'Мощность от 30 до 1000 л.с.']
  ];
  var showErr = function (c, on) { c[1].hidden = !on; c[1].textContent = on ? c[3] : ''; c[0].setAttribute('aria-invalid', on ? 'true' : 'false'); };
  var valid = function () { return checks.every(function (c) { return c[2](num(c[0].value)); }); };
  var AGE = { lt3: 'до 3 лет', '3to5': '3–5 лет', '5to7': '5–7 лет', gt7: 'старше 7 лет' };
  function fxLine(k) {
    var v = FX.rub[CTRY[k].cur], d = FX.date ? ruDate(FX.date) : '';
    var s = k === 'KR' ? '1000 вон = ' + (v * 1000).toFixed(2).replace('.', ',') + ' ₽' : k === 'JP' ? '1 иена = ' + v.toFixed(4).replace('.', ',') + ' ₽' : '1 юань = ' + v.toFixed(2).replace('.', ',') + ' ₽';
    return 'Курс ЦБ на ' + d + ': ' + s + (FX.live ? '' : ' (обновится, когда сайт получит свежий курс)') + '. Ставки пошлины и утильсбора сверены ' + ruDate(R.checked) + '.';
  }
  function render() {
    var k = radio('country'), C = CTRY[k], eng = radio('engine'), who = radio('who'), to = radio('to');
    $('#cCur').textContent = C.w;
    $('#ccBox').style.display = eng === 'ev' ? 'none' : '';
    var eh = eng === 'ev' ? 'Объём не нужен. Мощность — 30-минутная, из документов: она ниже пиковой.' : eng === 'hyb' ? (R.util.hybridHint || '') : '';
    $('#cEh').hidden = !eh; $('#cEh').textContent = eh;
    $('#cWh').textContent = who === 'fiz' ? (R.util.personalNote || '') : 'Для компании: пошлина по ЕТТ, акциз и НДС 22%, утильсбор по коммерческой ставке.';
    $('#sTo label:first-child span').textContent = k === 'CN' ? 'В Уссурийске' : 'Во Владивостоке';
    $('#totalLbl').textContent = 'Итого ' + (to === 'blg' ? 'в Благовещенске' : C.port);
    if (!valid()) { $('#total').textContent = '—'; $('#stages').innerHTML = '<p class="hint">Проверьте цену, объём и мощность — и расчёт появится.</p>'; $('#fine').textContent = fxLine(k); return; }
    var cfg = { costs: {}, service: CONFIG.service, broker: CONFIG.broker, freightInCustomsValue: false };
    cfg.costs[k] = { abroad: CONFIG.costs[k].abroad, delivery: to === 'blg' ? CONFIG.costs[k].delivery : 0 };
    var i = { country: k, cur: C.cur, price: num(cP.value), age: radio('age'), engine: eng, serial: eng === 'hyb' && !!R.util.hybridSerialDefault, cc: eng === 'ev' ? 0 : num(cc.value), hp: num(hp.value), who: who };
    var o = window.calcTotal(i, R, cfg, FX.rub);
    var p1 = o.carRub + o.abroad, p2 = o.duty + o.excise + o.vat + o.util + o.fee, p3 = CONFIG.broker + CONFIG.service;
    var EX = '<span class="ex">Пример</span>';
    var rows = [
      ['1', k === 'JP' ? 'Платёж 1 — инвойс японской стороне' : 'Платёж 1 — машина и доставка', p1, 'Машина <s>' + rub(o.carRub) + '</s> · ' + C.abroad + ' <s>' + rub(o.abroad) + '</s>' + EX],
      ['2', 'Платёж 2 — пошлина' + (k === 'JP' ? ', на имя покупателя' : ''), p2, 'Пошлина <s>' + rub(o.duty) + '</s> (' + o.dutyHow.replace('.', ',') + ') · утильсбор <s>' + rub(o.util) + '</s> (' + o.utilHow + ') · таможенный сбор <s>' + rub(o.fee) + '</s>' + (o.excise ? ' · акциз <s>' + rub(o.excise) + '</s>' : '') + (o.vat ? ' · НДС <s>' + rub(o.vat) + '</s>' : '')],
      ['3', 'Платёж 3 — оформление и услуги', p3, 'Оформление ' + C.port + ' <s>' + rub(CONFIG.broker) + '</s>' + EX + ' · услуги БМ АВТО, фиксированные <s>' + rub(CONFIG.service) + '</s>' + EX]
    ];
    if (to === 'blg') rows.push(['+', 'Автовоз до Благовещенска', o.delivery, 'Доставка от ' + (k === 'CN' ? 'Уссурийска' : 'Владивостока') + EX, 1]);
    $('#total').textContent = rub(o.total);
    $('#stages').innerHTML = rows.map(function (r) { return '<div class="stg' + (r[4] ? ' opt' : '') + '"><span class="n">' + r[0] + '</span><div class="t"><span>' + r[1] + '</span><b class="num">' + rub(r[2]) + '</b></div><p class="d">' + r[3] + '</p></div>'; }).join('');
    $('#fine').textContent = fxLine(k) + ' Расчёт ориентировочный, не оферта.';
    lastCalc = C.n + ', ' + fmt(i.price).replace(/ /g, ' ') + ' ' + C.w + ', ' + AGE[i.age] + ', ' + (eng === 'ev' ? 'электро' : (eng === 'hyb' ? 'гибрид, ' : '') + i.cc + ' см³') + ', ' + i.hp + ' л.с., ' + (who === 'fiz' ? 'для себя' : 'на компанию') + ', ' + (to === 'blg' ? 'с автовозом до Благовещенска' : 'забрать ' + C.port) + '. Вышло примерно ' + fmt(o.total).replace(/ /g, ' ') + ' ₽';
    $('#cSend').href = waLink('Здравствуйте! Посчитал на сайте БМ АВТО: ' + lastCalc + '. Посчитаете точно?');
  }
  var mark = function () { if (!touched) { touched = true; $('#fCalcW').hidden = false; } };
  cP.addEventListener('input', function () { var pos = cP.value.replace(/\D/g, ''); cP.value = pos ? fmt(+pos).replace(/ /g, ' ') : ''; mark(); if (checks[0][2](num(cP.value))) showErr(checks[0], false); render(); });
  [cc, hp].forEach(function (x, j) { x.addEventListener('input', function () { x.value = x.value.replace(/\D/g, ''); mark(); if (checks[j + 1][2](num(x.value))) showErr(checks[j + 1], false); render(); }); });
  checks.forEach(function (c) {
    c[0].addEventListener('blur', function () { showErr(c, c[0].value.trim() !== '' && !c[2](num(c[0].value)) || c[0].value.trim() === ''); });
  });
  var lastK = 'JP';
  $('#cf').addEventListener('change', function (e) {
    if (!e.target.name) return;
    if (e.target.name === 'country') { // пересчитать цену в новую валюту, чтобы итог не прыгал в разы
      var k = radio('country'), v = num(cP.value);
      if (v > 0 && k !== lastK) { var nv = v * FX.rub[CTRY[lastK].cur] / FX.rub[CTRY[k].cur], step = nv > 1e6 ? 10000 : 1000; cP.value = fmt(Math.round(nv / step) * step).replace(/ /g, ' '); }
      lastK = k;
    }
    mark(); render();
  });
  $('#cf').addEventListener('submit', function (e) { e.preventDefault(); });
  $('#cSend').addEventListener('click', function (e) {
    if (valid()) return;
    e.preventDefault(); var first = null;
    checks.forEach(function (c) { var bad = !c[2](num(c[0].value)); showErr(c, bad); if (bad && !first) first = c[0]; });
    if (first) first.focus();
  });
  render();
  if (window.fetch) fetch(R.fx.url, { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) {
    var out = {}; Object.keys(FX.rub).forEach(function (k) { var v = j.Valute && j.Valute[k]; if (v) out[k] = v.Value / v.Nominal; });
    if (Object.keys(out).length === Object.keys(FX.rub).length) { FX = { date: String(j.Date).slice(0, 10), rub: out, live: true }; render(); }
  }).catch(function () {});

  /* 6. путь машины по датам */
  var TRK = window.TRK || [], STN = ['Аукцион в Японии', 'Порт Японии', 'Владивосток', 'Город клиента'];
  var deals = $('#deals'), tp = $('#tp');
  deals.innerHTML = TRK.map(function (t, i) {
    return '<button class="deal" type="button" role="tab" id="dl-' + t.k + '" aria-controls="tp" aria-selected="' + (i === 0) + '" data-i="' + i + '"><div><span>' + esc(t.car) + '</span><small>' + (t.post ? 'Канал БМ АВТО' : 'Отзыв в 2ГИС · ' + esc(t.who)) + '</small></div><b class="num">' + t.days + '&nbsp;' + pl(t.days, 'день', 'дня', 'дней') + '</b></button>';
  }).join('');
  function showDeal(i, anim) {
    var t = TRK[i];
    $$('.deal', deals).forEach(function (b, j) { b.setAttribute('aria-selected', j === i); b.tabIndex = j === i ? 0 : -1; });
    tp.setAttribute('aria-labelledby', 'dl-' + t.k);
    var reach = Math.max.apply(null, t.ev.map(function (e) { return e[0]; }));
    var st = STN.map(function (n, s) {
      var es = t.ev.filter(function (e) { return e[0] === s; }), d = es.length ? es[s === 0 ? 0 : es.length - 1][1] : null;
      var dt = d ? '<span class="dt num">' + dm(d) + '</span>' : es.length ? '<span class="dt no">дата не указана</span>' : '<span class="dt no">' + (s < reach ? 'не публиковали' : '—') + '</span>';
      return '<div class="stn" data-s="' + s + '"><span class="dot"></span><span class="nm">' + n + '</span>' + dt + '</div>';
    }).join('');
    var price = t.p ? '<div class="tpr"><b class="num">' + rub(t.p) + '</b>предварительная стоимость во Владивостоке из поста «Куплен на аукционе», по курсу на ' + t.fx + '</div>' : t.note ? '<div class="tpr">' + esc(t.note) + '</div>' : '';
    var more = t.total > t.days ? ' · ' + t.total + ' ' + pl(t.total, 'день', 'дня', 'дней') + ' до города клиента' : '';
    tp.innerHTML =
      '<div class="tp-h"><div><h3>' + esc(t.car) + '</h3><p class="meta">' + esc(t.meta) + '</p></div><div class="days num">' + t.days + '&nbsp;' + pl(t.days, 'день', 'дня', 'дней') + '<small>до Владивостока' + more + '</small></div></div>' +
      '<div class="route" aria-hidden="true"><i class="rd"></i><i class="pg"></i>' + st + '</div>' +
      '<div class="tp-b"><div><ul class="evs">' + t.ev.map(function (e) { return '<li' + (e[1] ? '' : ' class="nd"') + '><time' + (e[1] ? ' datetime="' + e[1] + '"' : '') + ' class="num">' + (e[1] ? ruDate(e[1]) : 'без даты') + '</time><span>' + esc(e[2]) + '</span></li>'; }).join('') + '</ul>' + price + '</div>' +
      '<div class="tph">' + t.img.map(function (m) { return '<figure><div class="im"><img src="img/trk/' + m[0] + '.jpg" width="800" height="600" alt="' + esc(t.car + ': ' + m[1]) + '" loading="lazy" decoding="async"></div><figcaption>' + esc(m[1]) + '</figcaption></figure>'; }).join('') + '</div></div>' +
      '<div class="tp-f"><p class="src">Источник: ' + (t.post ? 'канал БМ АВТО, посты ' + t.post.map(function (n) { return '<a href="https://t.me/BMjapan28/' + n + '" target="_blank" rel="noopener">№' + n + '</a>'; }).join(', ') + '. Дата «готов к выдаче» — из текста поста' : esc(t.src)) + '</p><a class="btn" href="' + waLink('Здравствуйте! Посмотрел на сайте, как ехала ' + t.car + '. Хочу подобрать машину — с чего начнём?') + '" target="_blank" rel="noopener">' + WA_ICON + 'Хочу так же</a></div>';
    var pg = $('.pg', tp), stns = $$('.stn', tp);
    var go = function () {
      pg.style.width = 'calc(75% * ' + (reach / 3) + ')';
      stns.forEach(function (s, j) { if (j <= reach) { s.style.transitionDelay = (RM || !anim ? 0 : j * 0.3) + 's'; $('.dot', s).style.transitionDelay = (RM || !anim ? 0 : j * 0.32) + 's'; s.classList.add('on'); } });
    };
    if (RM || !anim) { pg.style.transition = 'none'; go(); } else requestAnimationFrame(function () { requestAnimationFrame(go); });
  }
  deals.addEventListener('click', function (e) { var b = e.target.closest('.deal'); if (b) showDeal(+b.getAttribute('data-i'), true); });
  deals.addEventListener('keydown', function (e) {
    if (!/Arrow(Up|Down|Left|Right)/.test(e.key)) return;
    var cur = +(document.activeElement.getAttribute('data-i') || 0), n = TRK.length, nx = (cur + (/Down|Right/.test(e.key) ? 1 : -1) + n) % n;
    e.preventDefault(); deals.children[nx].focus(); showDeal(nx, true);
  });
  showDeal(0, false);
  if ('IntersectionObserver' in window && !RM) {
    var seen = false, io2 = new IntersectionObserver(function (es) { if (es[0].isIntersecting && !seen) { seen = true; showDeal(0, true); io2.disconnect(); } }, { threshold: 0.35 });
    io2.observe(tp);
  }
  var ds = TRK.map(function (t) { return t.days; }).sort(function (a, b) { return a - b; });
  if (ds.length) {
    var med = ds.length % 2 ? ds[(ds.length - 1) / 2] : (ds[ds.length / 2 - 1] + ds[ds.length / 2]) / 2;
    var inBand = ds.filter(function (d) { return d >= 19 && d <= 25; }).length;
    $('#bigV').innerHTML = med + '<small>' + pl(med, 'день', 'дня', 'дней') + '</small>';
    $('#bigP').innerHTML = 'медиана от покупки до Владивостока по ' + ds.length + ' сделкам. <b>В ' + inBand + ' из ' + ds.length + ' — от 19 до 25 дней.</b> Самая быстрая — ' + ds[0] + ' ' + pl(ds[0], 'день', 'дня', 'дней') + ', самая долгая — ' + ds[ds.length - 1] + ' ' + pl(ds[ds.length - 1], 'день', 'дня', 'дней') + '.';
  }

  /* 7. заявка */
  var BUD = ['до 1 млн', '1–1,5 млн', '1,5–2 млн', '2–3 млн', 'от 3 млн'], bud = '';
  var fb = $('#fBud');
  fb.innerHTML = BUD.map(function (b) { return '<button class="chip" type="button" aria-pressed="false">' + b + ' ₽</button>'; }).join('');
  fb.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    var was = b.getAttribute('aria-pressed') === 'true';
    $$('.chip', fb).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
    b.setAttribute('aria-pressed', was ? 'false' : 'true'); bud = was ? '' : b.textContent;
  });
  var F = [['fWhat', 'Напишите хотя бы марку или тип машины', function (v) { return v.trim().length >= 2; }], ['fName', 'Как к вам обращаться?', function (v) { return v.trim().length >= 2; }]];
  var setErr = function (id, msg) { var el = $('#' + id), er = $('#' + id + 'E'); er.hidden = !msg; er.textContent = msg || ''; if (el.type !== 'checkbox') el.setAttribute('aria-invalid', msg ? 'true' : 'false'); };
  F.forEach(function (f) {
    var el = $('#' + f[0]);
    el.addEventListener('blur', function () { if (!f[2](el.value)) setErr(f[0], f[1]); });
    el.addEventListener('input', function () { if (f[2](el.value)) setErr(f[0], ''); });
  });
  $('#fOk').addEventListener('change', function () { if (this.checked) setErr('fOk', ''); });
  $('#lf').addEventListener('submit', function (e) {
    e.preventDefault(); $('#sent').hidden = true;
    var first = null;
    F.forEach(function (f) { var el = $('#' + f[0]); if (!f[2](el.value)) { setErr(f[0], f[1]); first = first || el; } });
    if (!$('#fOk').checked) { setErr('fOk', 'Отметьте согласие — без него заявку отправить нельзя'); first = first || $('#fOk'); }
    if (first) { first.focus(); return; }
    var t = 'Здравствуйте! Меня зовут ' + $('#fName').value.trim() + '.\nИщу: ' + $('#fWhat').value.trim() + (bud ? '\nБюджет: ' + bud : '') +
      (touched && $('#fCalc').checked && lastCalc ? '\nМой расчёт на сайте: ' + lastCalc : '') + '\nПодскажите варианты, пожалуйста.';
    var url = waLink(t);
    $('#sentA').href = url; $('#sent').hidden = false;
    window.open(url, '_blank', 'noopener');
  });
})();
