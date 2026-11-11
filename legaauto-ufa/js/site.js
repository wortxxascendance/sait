/* Lega Auto. Всё, что меняется, лежит в config.json рядом с index.html: переключатели блоков, модели и цены,
   актуальные предложения, результаты, отзывы, тарифы калькулятора, контакты, форма обратной связи, Яндекс Метрика.
   Посмотреть варианты без правки файла: ?calc=0 или ?calc=1, ?prices=1 или ?prices=0. Проверить config.json: ?check */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var $$ = function (s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var Q = new URLSearchParams(location.search);
  var CHECK = Q.has('check');
  var LOCAL = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  var notes = [];                                   // замечания к config.json: консоль и панель ?check
  var note = function (s) { notes.push(s); };

  var rub = function (v) { return Math.round(v).toLocaleString('ru-RU') + ' ₽'; };
  var digits = function (s) { return String(s == null ? '' : s).replace(/\D/g, ''); };
  var waNum = function (s) { var d = digits(s); if (d.length === 11 && d.charAt(0) === '8') d = '7' + d.slice(1); if (d.length === 10) d = '7' + d; return d; };
  var telHref = function (s) { var d = waNum(s); return d ? 'tel:+' + d : ''; };
  var tgHandle = function (s) {
    s = String(s || '').trim().replace(/^https?:\/\/t\.me\//i, '').replace(/^@/, '');
    if (!s) return '';
    return /^\+?[\d\s()-]{7,}$/.test(s) ? '+' + waNum(s) : s;
  };
  var bool = function (v) { return v === true || v === 1 || v === 'true' || v === '1'; };
  var list = function (v, where) { if (v == null) return []; if (Array.isArray(v)) return v; if (where) note(where + ': нужен список в квадратных скобках [ ]'); return []; };
  var money = function (v, where) {
    if (v == null || v === '') return 0;
    var n = typeof v === 'number' ? v : parseFloat(String(v).replace(/\s/g, '').replace(',', '.'));
    if (!isFinite(n) || n < 0) { if (where) note(where + ': «' + v + '» — нужно число без пробелов, например 2450000'); return 0; }
    return n;
  };
  var plural = function (n, a, b, c) { var m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 12 || h > 14) ? b : c; };
  var dt = function (s) { var d = new Date(String(s) + 'T00:00:00'); return isNaN(d) ? '' : d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }); };
  var cap = function (s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); };
  var litres = function (v) { return String(v).replace('.', ','); };

  /* ---------- шапка, меню, появление блоков: работают сразу, не дожидаясь config.json ---------- */
  var hd = $('hd'), mb = $('menuBtn');
  addEventListener('scroll', function () { hd.classList.toggle('sc', scrollY > 20); }, { passive: true });
  var menu = function (on) { hd.classList.toggle('open', on); mb.setAttribute('aria-expanded', on); };
  mb.addEventListener('click', function () { menu(!hd.classList.contains('open')); });
  $('mnav').addEventListener('click', function (e) { if (e.target.closest('a')) menu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && hd.classList.contains('open')) { menu(false); mb.focus(); } });

  var io = 'IntersectionObserver' in window && !still ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }) : null;
  function reveal() {
    $$('[data-rv]:not(.in)').forEach(function (el, i) {
      if (!io) { el.classList.add('in'); return; }
      el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el);
    });
  }
  reveal();

  /* ---------- метки рекламы: сохраняем при входе, прикладываем к заявке ---------- */
  var UTM = (function () {
    var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid'], got = [];
    keys.forEach(function (k) { if (Q.get(k)) got.push(k + '=' + Q.get(k)); });
    try { if (got.length) sessionStorage.setItem('lega-utm', got.join(', ')); return sessionStorage.getItem('lega-utm') || ''; } catch (e) { return got.join(', '); }
  })();

  /* ---------- Яндекс Метрика и цели ---------- */
  var MID = 0;
  function goal(name, params) {
    if (CHECK) console.log('[Метрика] цель', name, params || '');
    if (!MID || typeof window.ym !== 'function') return;
    try { window.ym(MID, 'reachGoal', name, params); } catch (e) { /* счётчик не загрузился */ }
  }
  function initMetrika(m) {
    var raw = String(m.id == null ? '' : m.id).trim(), id = parseInt(digits(raw), 10);
    if (!raw) return;
    if (!id || !/^\d+$/.test(raw)) { note('metrika.id: «' + raw + '» — нужен номер счётчика цифрами, например 98765432'); if (!id) return; }
    MID = id;
    /* официальный код счётчика Яндекс Метрики */
    (function (w, d, t, r, i, k, a) {
      w[i] = w[i] || function () { (w[i].a = w[i].a || []).push(arguments); }; w[i].l = 1 * new Date();
      for (var j = 0; j < d.scripts.length; j++) { if (d.scripts[j].src === r) return; }
      k = d.createElement(t); a = d.getElementsByTagName(t)[0]; k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    window.ym(id, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: m.webvisor !== false && m.webvisor !== 'false' });
    if (m.cookieNotice !== false && m.cookieNotice !== 'false') cookieNotice();
  }
  function cookieNotice() {
    try { if (localStorage.getItem('lega-cookie-ok')) return; } catch (e) { /* без хранилища показываем каждый раз */ }
    var b = document.createElement('div');
    b.className = 'ck'; b.setAttribute('role', 'region'); b.setAttribute('aria-label', 'Уведомление о cookie');
    b.innerHTML = '<p>Сайт использует cookie и Яндекс Метрику, чтобы считать посещения. <a href="politika/#cookie">Подробнее</a></p><button class="btn" type="button">Понятно</button>';
    b.querySelector('button').addEventListener('click', function () { try { localStorage.setItem('lega-cookie-ok', '1'); } catch (e) { /* ничего */ } b.parentNode.removeChild(b); });
    document.body.appendChild(b);
  }
  // переходы в мессенджеры и звонки — тоже цели (после обработчиков кнопок, когда ссылка уже собрана)
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a,button'); if (!a) return;
    var g = a.getAttribute('data-goal'); if (g) goal(g);
    var h = a.getAttribute('href') || '';
    if (/^https:\/\/wa\.me\//.test(h)) goal('click_whatsapp');
    else if (/^https:\/\/t\.me\//.test(h) || a.id === 'tgBtn') goal('click_telegram');
    else if (/^tel:/.test(h)) goal('click_phone');
  });
  var calcGoal = false;
  document.addEventListener('calc:result', function () { if (!calcGoal) { calcGoal = true; goal('calc_result'); } });

  /* ---------- config.json ---------- */
  var DEF = {
    company: { name: '', phone: '', phone2: '', whatsapp: '', telegram: '', address: '', hours: '', legal: '' },
    calculator: { enabled: true, exampleTariffs: true, tariffs: {}, broker: 0, service: 0, freightInCustomsValue: false, example: null, show2027: true },
    catalog: { enabled: true, showPrices: false, subtitle: '', priceNote: '', models: [], images: [] },
    offers: { enabled: true, subtitle: '', items: [] },
    results: { enabled: true, items: [] },
    reviews: { enabled: true, rating: '', count: 0, source: '2ГИС', link: '', items: [] },
    form: { enabled: true, endpoint: '', success: 'Спасибо! Заявка отправлена.' },
    metrika: { id: '', webvisor: true, cookieNotice: true }
  };
  function merge(a, b) {
    if (b === undefined) return a;
    if (!b || typeof b !== 'object' || Array.isArray(b) || !a || typeof a !== 'object' || Array.isArray(a)) return b;
    var o = {};
    Object.keys(a).forEach(function (k) { o[k] = a[k]; });
    Object.keys(b).forEach(function (k) { o[k] = merge(a[k], b[k]); });
    return o;
  }
  function jsonWhere(txt, e) {
    var m = String(e.message), line = 0, col = 0, lc = m.match(/line (\d+) column (\d+)/), p = m.match(/position (\d+)/);
    if (lc) { line = +lc[1]; col = +lc[2]; }
    else if (p) { var before = txt.slice(0, +p[1]).split('\n'); line = before.length; col = before[before.length - 1].length + 1; }
    return 'config.json не читается' + (line ? ': строка ' + line + ', символ ' + col : '') + '. Частые причины: лишняя или пропущенная запятая, кавычки «ёлочки» вместо "прямых". (' + m + ')';
  }
  function loadConfig() {
    if (location.protocol === 'file:') return Promise.reject(new Error('Страница открыта с диска (file://), так config.json не читается. Откройте сайт через веб-сервер.'));
    var ctrl = 'AbortController' in window ? new AbortController() : null;
    var timer = ctrl && setTimeout(function () { ctrl.abort(); }, 10000);
    return fetch('config.json', { cache: 'no-cache', signal: ctrl ? ctrl.signal : undefined }).then(function (r) {
      if (!r.ok) throw new Error('config.json не найден рядом с index.html (ответ сервера ' + r.status + ').');
      return r.text();
    }).then(function (txt) {
      clearTimeout(timer);
      try { return JSON.parse(txt.replace(/^﻿/, '')); } catch (e) { throw new Error(jsonWhere(txt, e)); }
    }, function (e) { clearTimeout(timer); throw e.name === 'AbortError' ? new Error('config.json не загрузился за 10 секунд.') : e; });
  }

  /* ---------- сборка страницы ---------- */
  var CALC = null, WA = '', TEL = '', PHONE = '';
  var waUrl = function (text) { return WA ? 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text) : '#contacts'; };

  function toggles(f) {
    $$('section[data-block]').forEach(function (s) { s.hidden = !f[s.getAttribute('data-block')]; });
    $$('[data-if]').forEach(function (el) { var k = el.getAttribute('data-if'), neg = k.charAt(0) === '!'; if (neg) k = k.slice(1); el.hidden = neg ? !!f[k] : !f[k]; });
    $$('#mnav a[href^="#"]').forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s && s.tagName === 'SECTION') a.hidden = s.hidden; });
  }

  function bindContacts(co) {
    PHONE = co.phone || ''; TEL = telHref(co.phone); WA = waNum(co.whatsapp || co.phone);
    var TG = tgHandle(co.telegram);
    $$('[data-c]').forEach(function (el) {
      var k = el.getAttribute('data-c');
      if (k === 'phone' || k === 'phone2') {
        var v = co[k], h = telHref(v);
        if (!h) { if (k === 'phone2') el.hidden = true; return; }
        el.textContent = v; el.setAttribute('href', h);
      } else if (k === 'call') { if (TEL) el.setAttribute('href', TEL); }
      else if (k === 'wa') { if (WA) el.setAttribute('href', 'https://wa.me/' + WA); else el.hidden = true; }
      else if (k === 'tg') { if (TG) el.setAttribute('href', 'https://t.me/' + TG); else el.hidden = true; }
      else if (k === 'address' || k === 'hours') { if (co[k]) el.textContent = co[k]; }
      else if (k === 'legal') { if (co.legal) { el.textContent = co.legal; el.classList.remove('fill'); el.removeAttribute('data-fill'); } }
    });
    if (!co.legal) note('company.legal пустой: в подвале, политике и согласии стоит пометка «уточняются» — впишите наименование, ИНН и ОГРН');
    return TG;
  }

  function calcConfig(c, TG) {
    var CUR = { CN: 'CNY', KR: 'KRW', JP: 'JPY', EU: 'EUR' }, costs = {};
    Object.keys(c.tariffs || {}).forEach(function (k) {
      var t = c.tariffs[k];
      if (k.charAt(0) === '_' || !t || typeof t !== 'object') return;
      if (!CUR[k]) { note('calculator.tariffs.' + k + ': такой страны нет, можно CN, KR, JP или EU'); return; }
      var cur = String(t.currency || CUR[k]).toUpperCase();
      if (!/^(JPY|KRW|CNY|USD|EUR)$/.test(cur)) { note('calculator.tariffs.' + k + '.currency: «' + t.currency + '» — можно CNY, KRW, JPY, USD или EUR'); cur = CUR[k]; }
      costs[k] = { cur: cur, abroad: money(t.abroad, 'calculator.tariffs.' + k + '.abroad'), delivery: money(t.delivery, 'calculator.tariffs.' + k + '.delivery'), note: t.note || '' };
    });
    var ex = c.example && typeof c.example === 'object' && money(c.example.price) > 0 && costs[c.example.country] ? c.example : null;
    if (bool(c.exampleTariffs)) note('calculator.exampleTariffs: true — расходы и услуги в калькуляторе помечены «Пример». Впишите свои тарифы и поставьте false');
    return {
      demo: bool(c.exampleTariffs), phone: TEL.replace(/^tel:/, ''), whatsapp: WA, telegram: TG, costs: costs,
      service: money(c.service, 'calculator.service'), broker: money(c.broker, 'calculator.broker'), freightInCustomsValue: bool(c.freightInCustomsValue),
      example: ex ? { country: ex.country, price: money(ex.price), currency: String(ex.currency || costs[ex.country].cur).toUpperCase(), cc: ex.cc, hp: ex.hp, age: ex.age, text: ex.text } : null
    };
  }

  function renderOffers(o, f) {
    var items = list(o.items, 'offers.items');
    if (o.subtitle) $('offSub').textContent = o.subtitle;
    $('offersList').innerHTML = items.map(function (x, k) {
      var vars = list(x.variants, 'offers.items[' + k + '].variants').map(function (v) {
        var p = money(v.price, 'offers.items[' + k + '] «' + (v.name || '') + '».price');
        return '<div class="var"><span>' + esc(v.name) + '</span><b>' + (p ? rub(p) : 'по запросу') + '</b></div>';
      }).join('');
      if (!x.photo) note('offers.items[' + k + '] «' + (x.model || '') + '»: нет фото (поле photo)');
      return '<article class="offer" data-rv>'
        + '<div class="o-pic">' + (x.photo ? '<img src="' + esc(x.photo) + '" alt="' + esc(x.model) + '" loading="lazy">' : '') + '</div>'
        + '<div class="o-body">' + (x.note ? '<span class="o-note">' + esc(x.note) + '</span>' : '') + '<h3>' + esc(x.model) + '</h3>'
        + (x.spec ? '<p class="o-spec">' + esc(x.spec) + '</p>' : '')
        + (vars ? '<div class="vars">' + vars + '</div>' : '')
        + (x.term ? '<span class="o-term">' + esc(cap(x.term)) + '</span>' : '')
        + '<div class="o-acts"><a class="btn btn-r" href="' + esc(waUrl('Здравствуйте! Интересует ' + x.model + ' из предложений на сайте.')) + '" target="_blank" rel="noopener" data-goal="offer_request">Узнать о наличии</a>'
        + (f.calc && x.calc ? '<button class="btn" type="button" data-offer="' + k + '">Посчитать такую</button>' : '') + '</div>'
        + (x.source ? '<span class="src-n">' + esc(x.source) + '</span>' : '') + '</div></article>';
    }).join('');
    $('offersList').addEventListener('click', function (e) {
      var b = e.target.closest('[data-offer]'); if (!b || !CALC) return;
      var x = items[+b.getAttribute('data-offer')], c = x.calc || {};
      goal('offer_calc');
      CALC.prefill({ title: x.model, country: c.country, age: c.age, cc: c.cc, hp: c.hp });
    });
  }

  function renderCatalog(c, f) {
    var models = list(c.models, 'catalog.models'), sub = $('catSub');
    sub.textContent = c.subtitle || (f.prices
      ? 'Модели из прайса «Привоз авто под ключ из Китая» с ценами. Нажмите на модель — уточним наличие и сроки.'
      : f.calc ? 'Из прайса «Привоз авто под ключ из Китая». Нажмите на модель — объём и мощность подставятся в калькулятор, останется цена.'
        : 'Из прайса «Привоз авто под ключ из Китая». Нажмите на модель — пришлём цену и сроки.');
    var noPrice = 0;
    $('catList').innerHTML = models.map(function (m, k) {
      var info = [m.year, m.trim].filter(Boolean).join(' ');
      var line = [info, m.volume ? litres(m.volume) + ' л' : '', m.hp ? m.hp + ' л.с.' : ''].filter(Boolean).join(' · ');
      var p = money(m.price, 'catalog.models[' + k + '] «' + (m.name || '') + '».price');
      var head = '<b>' + esc(m.name) + '</b><span>' + esc(line) + '</span>';
      if (!m.name) note('catalog.models[' + k + ']: нет названия (поле name)');
      if (!f.prices && f.calc) return '<button class="ci" type="button" data-cat="' + k + '">' + head + '<i>Посчитать →</i></button>';
      if (f.prices && !p) noPrice++;
      var msg = 'Здравствуйте! Интересует ' + [m.name, info].filter(Boolean).join(' ') + (f.prices && p ? ' за ' + rub(p) : '') + ' из прайса на сайте. Подскажите по наличию и срокам.';
      var tail = f.prices
        ? (p ? '<em class="pr">' + rub(p) + '</em>' + (c.priceNote ? '<small>' + esc(c.priceNote) + '</small>' : '') : '<i>Цена по запросу →</i>')
        : '<i>Узнать цену →</i>';
      return '<a class="ci" href="' + esc(waUrl(msg)) + '" target="_blank" rel="noopener" data-goal="catalog_model">' + head + tail + '</a>';
    }).join('');
    if (noPrice) note('catalog.showPrices включён, но у ' + noPrice + ' из ' + models.length + ' моделей нет цены (price: null) — у них написано «Цена по запросу»');
    $('catList').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-cat]'); if (!b || !CALC) return;
      var m = models[+b.getAttribute('data-cat')], y = parseInt(m.year, 10), age = 'lt3';
      if (y > 1990) { var d = new Date().getFullYear() - y; age = d < 3 ? 'lt3' : d < 5 ? '3to5' : d < 7 ? '5to7' : 'gt7'; }
      goal('catalog_model');
      CALC.prefill({ title: [m.name, m.year, m.trim].filter(Boolean).join(' '), country: m.country || 'CN', age: age, cc: m.cc || (m.volume ? Math.round(m.volume * 1000) : ''), hp: m.hp });
    });
    var imgs = list(c.images, 'catalog.images');
    $('catImgs').innerHTML = imgs.map(function (i) { return '<img src="' + esc(i.src || i) + '" alt="' + esc(i.alt || 'Прайс') + '" loading="lazy">'; }).join('');
    $('catImgs').hidden = !imgs.length;
  }

  function renderResults(r) {
    $('casesList').innerHTML = list(r.items, 'results.items').map(function (c) {
      return '<div class="case"><b>' + esc(c.car) + '</b><p>' + esc(cap(c.text)) + '</p><span>' + esc([c.name, dt(c.date)].filter(Boolean).join(' · ')) + '</span></div>';
    }).join('');
  }

  function renderReviews(r) {
    var items = list(r.items, 'reviews.items'), MAX = 320, count = parseInt(r.count, 10) || 0, src = r.source || '';
    var cut = function (t) { return t.slice(0, t.lastIndexOf(' ', MAX - 10)) + '…'; };
    $('revCap').textContent = 'Отзывы' + (src ? ' · ' + src : '');
    $('revH').innerHTML = r.rating && count ? esc(r.rating) + ' — <em>' + count + ' ' + plural(count, 'отзыв', 'отзыва', 'отзывов') + '</em>' : 'Отзывы <em>клиентов</em>';
    if (r.link) { $('revLink').setAttribute('href', r.link); $('revLink').textContent = 'Все отзывы' + (src ? ' в ' + src : ''); } else $('revLink').hidden = true;
    $$('[data-c="rating"]').forEach(function (el) { if (r.rating) el.textContent = r.rating; });
    $$('[data-c="revline"]').forEach(function (el) { if (count) el.textContent = 'средняя оценка, ' + count + ' ' + plural(count, 'отзыв', 'отзыва', 'отзывов') + (src ? ' в ' + src : ''); });
    $('revs').innerHTML = items.map(function (x, k) {
      var t = String(x.text || '').trim(), s = Math.max(1, Math.min(5, parseInt(x.stars, 10) || 5)), long = t.length > MAX;
      if (!t) note('reviews.items[' + k + '] «' + (x.name || '') + '»: пустой текст');
      if (x.date && !dt(x.date)) note('reviews.items[' + k + '] «' + (x.name || '') + '».date: «' + x.date + '» — нужна дата ГГГГ-ММ-ДД');
      return '<blockquote class="rev" data-rv><span class="st" aria-label="' + s + ' из 5">' + new Array(s + 1).join('★') + '</span>'
        + '<q id="rq' + k + '">' + esc(long ? cut(t) : t) + '</q>'
        + (long ? '<button class="more" type="button" data-more="' + k + '" aria-expanded="false" aria-controls="rq' + k + '">Читать полностью</button>' : '')
        + '<footer><b>' + esc(x.name) + '</b>' + (dt(x.date) ? ' · ' + dt(x.date) : '') + '</footer></blockquote>';
    }).join('');
    $('revs').addEventListener('click', function (e) {
      var b = e.target.closest('[data-more]'); if (!b) return;
      var k = +b.getAttribute('data-more'), open = b.getAttribute('aria-expanded') !== 'true', t = String(items[k].text || '').trim();
      $('rq' + k).textContent = open ? t : cut(t);
      b.setAttribute('aria-expanded', open); b.textContent = open ? 'Свернуть' : 'Читать полностью';
    });
  }

  /* ---------- форма обратной связи ---------- */
  function initForm(fc) {
    var form = $('leadForm'), btn = $('lfBtn'), st = $('lfSt');
    var endpoint = String(fc.endpoint || '').trim(), label = endpoint ? 'Отправить заявку' : 'Отправить в WhatsApp';
    btn.textContent = label;
    var F = {
      lfName: { msg: 'Напишите, как к вам обращаться', ok: function (v) { return v.trim().length >= 2; } },
      lfPhone: { msg: 'Проверьте номер: нужно 10–11 цифр, например +7 900 000-00-00', ok: function (v) { var d = digits(v); return d.length >= 10 && d.length <= 15; } }
    };
    function bad(id, msg) { var el = $(id), e = $(id + '-e'); el.setAttribute('aria-invalid', msg ? 'true' : 'false'); e.hidden = !msg; e.textContent = msg || ''; }
    // ошибка появляется после ухода из заполненного поля и уходит, как только человек начинает исправлять
    Object.keys(F).forEach(function (id) {
      var el = $(id);
      el.addEventListener('blur', function () { if (el.value.trim()) bad(id, F[id].ok(el.value) ? '' : F[id].msg); });
      el.addEventListener('input', function () { bad(id, ''); });
    });
    $('lfOk').addEventListener('change', function () { bad('lfOk', ''); });
    function say(html, kind) { st.innerHTML = html; st.className = 'lf-st' + (kind ? ' ' + kind : ''); st.hidden = false; }
    var phoneLink = function () { return TEL ? ' или позвоните <a href="' + esc(TEL) + '">' + esc(PHONE) + '</a>' : ''; };
    var busy = false;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;
      var first = null;
      Object.keys(F).forEach(function (id) { if (!F[id].ok($(id).value)) { bad(id, F[id].msg); first = first || $(id); } });
      if (!$('lfOk').checked) { bad('lfOk', 'Нужно согласие, чтобы отправить заявку'); first = first || $('lfOk'); }
      if (first) { first.focus(); return; }
      var d = {
        name: $('lfName').value.trim(), phone: $('lfPhone').value.trim(), message: $('lfMsg').value.trim(),
        calc: CALC ? CALC.summary() : '', page: location.href.split('#')[0], utm: UTM, consent: true, website: $('lfWeb').value
      };
      var text = 'Здравствуйте! Меня зовут ' + d.name + ', телефон ' + d.phone + '.' + (d.message ? '\n' + d.message : '') + (d.calc ? '\nМой расчёт на сайте: ' + d.calc : '');
      if (!endpoint) {
        var url = waUrl(text);
        window.open(url, '_blank', 'noopener');
        say('Открыли WhatsApp с готовым сообщением — осталось нажать «Отправить». Не открылся? <a href="' + esc(url) + '" target="_blank" rel="noopener">Открыть ещё раз</a>' + phoneLink() + '.', 'ok');
        goal('lead_form', { channel: 'whatsapp' });
        return;
      }
      busy = true; btn.setAttribute('aria-busy', 'true'); btn.textContent = 'Отправляем…';
      var ctrl = 'AbortController' in window ? new AbortController() : null, timer = ctrl && setTimeout(function () { ctrl.abort(); }, 15000);
      fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d), signal: ctrl ? ctrl.signal : undefined })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j || j.ok !== true) throw new Error((j && j.error) || 'ответ сервера ' + r.status); }); })
        .then(function () {
          form.reset();
          say(esc(fc.success || 'Спасибо! Заявка отправлена.'), 'ok');
          goal('lead_form', { channel: 'server' });
        }, function (err) {
          console.error('[форма] заявка не отправлена:', err);
          say('Не получилось отправить заявку. Напишите нам в <a href="' + esc(waUrl(text)) + '" target="_blank" rel="noopener">WhatsApp</a>' + phoneLink() + ' — ответим так же быстро.', 'bad');
          goal('lead_form_error');
        })
        .then(function () { clearTimeout(timer); busy = false; btn.removeAttribute('aria-busy'); btn.textContent = label; });
    });
  }

  /* ---------- панель проверки config.json (?check) ---------- */
  function panel(error, f, C) {
    var imgs = [];
    if (C) {
      list(C.offers.items).forEach(function (x) { if (x.photo) imgs.push(x.photo); });
      list(C.catalog.images).forEach(function (i) { if (i && (i.src || typeof i === 'string')) imgs.push(i.src || i); });
    }
    var box = document.createElement('div');
    box.className = 'chk-panel'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Проверка config.json');
    var mode = C ? '<p>Калькулятор: <b>' + (f.calc ? 'включён' : 'выключен') + '</b> · модели: <b>' + (f.prices ? 'с ценами' : f.calc ? 'кнопка «Посчитать»' : 'кнопка «Узнать цену»') + '</b><br>'
      + 'Форма: <b>' + (!f.form ? 'выключена' : C.form.endpoint ? 'на сервер, ' + esc(C.form.endpoint) : 'в WhatsApp') + '</b> · Метрика: <b>' + (MID ? 'счётчик ' + MID : 'не подключена') + '</b></p>' : '';
    var items = (error ? ['<li class="e">' + esc(error) + '</li>'] : []).concat(notes.map(function (n) { return '<li>' + esc(n) + '</li>'; }));
    box.innerHTML = '<h3>Проверка config.json</h3>' + mode + '<ul id="chkList">' + items.join('') + '</ul>'
      + '<p id="chkOk"' + (items.length ? ' hidden' : '') + '>Ошибок не найдено.</p><button type="button">Закрыть</button>';
    box.querySelector('button').addEventListener('click', function () { box.parentNode.removeChild(box); });
    document.body.appendChild(box);
    imgs.forEach(function (src) {
      var i = new Image();
      i.onerror = function () { var li = document.createElement('li'); li.className = 'e'; li.textContent = 'Фото не найдено: ' + src; $('chkList').appendChild(li); $('chkOk').hidden = true; };
      i.src = src;
    });
  }

  function apply(cfg) {
    var C = merge(DEF, cfg);
    var calcOn = bool(C.calculator.enabled), pricesOn = bool(C.catalog.showPrices);
    if (/^[01]$/.test(Q.get('calc') || '')) calcOn = Q.get('calc') === '1';        // предпросмотр без правки файла
    if (/^[01]$/.test(Q.get('prices') || '')) pricesOn = Q.get('prices') === '1';
    var f = {
      calc: calcOn,
      offers: bool(C.offers.enabled) && list(C.offers.items).length > 0,
      catalog: bool(C.catalog.enabled) && list(C.catalog.models).length > 0,
      results: bool(C.results.enabled) && list(C.results.items).length > 0,
      reviews: bool(C.reviews.enabled) && list(C.reviews.items).length > 0,
      form: bool(C.form.enabled),
      prices: pricesOn
    };
    var TG = bindContacts(C.company);
    if (f.calc) {
      try { CALC = window.initCalc(calcConfig(C.calculator, TG)); }
      catch (e) { f.calc = false; CALC = null; note('Калькулятор выключен из-за ошибки: ' + e.message); console.error(e); }
    }
    document.documentElement.classList.toggle('no2027', !bool(C.calculator.show2027));
    toggles(f);
    if (f.offers) renderOffers(C.offers, f);
    if (f.catalog) renderCatalog(C.catalog, f);
    if (f.results) renderResults(C.results);
    if (f.reviews) renderReviews(C.reviews);
    if (f.form) initForm(C.form);
    initMetrika(C.metrika);
    reveal();
    // ссылка с #разделом: после отрисовки блоков прокрутить заново, высота страницы изменилась
    if (location.hash.length > 1) { var t = document.getElementById(location.hash.slice(1)); if (t && !t.hidden) t.scrollIntoView(); }
    if (notes.length) console.warn('[config.json] замечания:\n— ' + notes.join('\n— '));
    if (CHECK) panel('', f, C);
  }

  loadConfig().then(apply, function (err) {
    console.error('[config.json] ' + err.message);
    toggles({ calc: false, offers: false, catalog: false, results: false, reviews: false, form: false, prices: false });
    reveal();
    if (CHECK || LOCAL) panel(err.message, {}, null);
  }).catch(function (err) { console.error('[сайт] ошибка при сборке страницы:', err); reveal(); });
})();
