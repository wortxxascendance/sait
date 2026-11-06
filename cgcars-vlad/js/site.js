/* CG Cars: сценарий страницы. Без библиотек. Анимации только transform, opacity, clip-path. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, v)); };
  var RM = document.documentElement.classList.contains('rm');
  var isDesk = function () { return innerWidth > 900; };
  var rub = function (v) { return Math.round(v).toLocaleString('ru-RU').replace(/,/g, ' ') + ' ₽'; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var WA = 'https://wa.me/79502998808', TG = 'https://t.me/VitaliySemkin';
  var waLink = function (t) { return WA + '?text=' + encodeURIComponent(t); };
  var tgLink = function (t) { return TG + '?text=' + encodeURIComponent(t); };
  var noop = function () {};
  var CARS = window.CARS, RV = window.RV;
  var byId = {}; CARS.forEach(function (c) { byId[c.id] = c; });

  /* заставка: стрелка компаса встаёт на курс Харбин → Владивосток */
  var intro = $('#intro');
  if (intro) {
    var seen = false; try { seen = sessionStorage.getItem('cg-i') === '1'; sessionStorage.setItem('cg-i', '1'); } catch (e) {}
    if (seen || RM) intro.remove();
    else {
      setTimeout(function () { intro.classList.add('out'); }, 1350);
      setTimeout(function () { intro.remove(); }, 2200);
    }
  }

  /* бегущие цифры */
  function odo(el, text) {
    if (RM) { el.textContent = text; return; }
    var chars = String(text).split('');
    var old = el._chars || [];
    if (old.length !== chars.length || chars.some(function (c, i) { return /\d/.test(c) !== /\d/.test(old[i] || ''); })) {
      el.innerHTML = '';
      el.setAttribute('aria-label', text);
      el._cols = chars.map(function (c) {
        var o = document.createElement('span');
        if (/\d/.test(c)) {
          o.style.cssText = 'display:inline-block;height:1.1em;line-height:1.1;overflow:hidden;vertical-align:bottom';
          var s = document.createElement('span');
          s.style.cssText = 'display:block;transition:transform .75s cubic-bezier(.2,.8,.2,1);transform:translateY(0)';
          s.innerHTML = '0123456789'.split('').map(function (d) { return '<span style="display:block;height:1.1em">' + d + '</span>'; }).join('');
          o.appendChild(s); o._s = s;
          o.setAttribute('aria-hidden', 'true');
        } else { o.textContent = c === ' ' ? ' ' : c; o.setAttribute('aria-hidden', 'true'); o.style.whiteSpace = 'pre'; }
        el.appendChild(o);
        return o;
      });
      void el.offsetWidth;
    }
    chars.forEach(function (c, i) { var o = el._cols[i]; if (o && o._s) o._s.style.transform = 'translateY(' + (-1.1 * +c) + 'em)'; });
    el.setAttribute('aria-label', text);
    el._chars = chars;
  }

  /* заголовки по словам, появление блоков */
  $$('[data-split]').forEach(function (h) {
    var words = h.textContent.trim().split(/\s+/);
    h.setAttribute('aria-label', h.textContent.trim());
    h.innerHTML = words.map(function (w, i) { return '<span class="w" aria-hidden="true"><span style="--d:' + i * 55 + 'ms">' + esc(w) + '</span></span>'; }).join(' ');
  });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px', threshold: .05 }) : null;
  var watch = function (el) { if (io) io.observe(el); else el.classList.add('in'); };
  $$('[data-split],.rise,#bars').forEach(watch);

  /* счётчики на стартовой полосе */
  $$('[data-count]').forEach(function (el) {
    if (RM || !io) return;
    var to = +el.dataset.count; el.textContent = '0';
    var ob = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; ob.disconnect();
      var t0 = performance.now();
      (function tick(t) { var k = clamp((t - t0) / 900); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); })(t0);
    }, { threshold: .4 });
    ob.observe(el);
  });

  /* двигатель прокрутки */
  var scrubs = [];
  function scrub(el, fn) { if (el) scrubs.push({ el: el, fn: fn }); }
  var ticking = false, cpN = $('#cpN'), mb = $('#mb');
  function frame() {
    ticking = false;
    var vh = innerHeight;
    scrubs.forEach(function (s) {
      var r = s.el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) return;
      s.fn(clamp(-r.top / Math.max(1, r.height - vh)), r, vh);
    });
    var de = document.documentElement, pr = clamp(scrollY / Math.max(1, de.scrollHeight - vh));
    if (cpN) cpN.style.transform = 'rotate(' + pr * 360 + 'deg)';
    if (mb) mb.classList.toggle('on', scrollY > vh * .6 && !sheetOpen);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  /* 1. обход машины */
  (function () {
    var sec = $('#walk'); if (!sec || RM) return;
    var fr = $$('#wIm > img'), pn = $$('.w-p'), bar = $('#wBar'), dot = $('#dDot'), sc = $('#wSc');
    var N = fr.length, M = pn.length, price = $('#wPrice'), priced = false;
    // порядок кадров задаёт угол камеры вокруг машины
    var ang = [-40, -140, -180, 140, 0];
    scrub(sec, function (p) {
      var f = p * (N - 1);
      fr.forEach(function (im, i) {
        var d = f - i, o = clamp(1 - Math.abs(d) * 2.1);
        if (i === 0 && f <= 0) o = 1;
        im.style.opacity = o;
        im.style.transform = 'translate3d(' + (-d * 3.2) + '%,0,0) scale(' + (1.07 - Math.abs(d) * .02 + (i === 0 ? -.02 * (1 - clamp(p * 6)) : 0)) + ')';
      });
      var a0 = Math.floor(f), a1 = Math.min(N - 1, a0 + 1), k = f - a0;
      var A = ang[a0], B = ang[a1], dl = ((B - A + 540) % 360) - 180, a = (A + dl * k) * Math.PI / 180;
      dot.setAttribute('cx', 37 + 28 * Math.sin(a)); dot.setAttribute('cy', 37 - 28 * Math.cos(a));
      var g = p * (M - 1);
      pn.forEach(function (el, j) {
        var d = g - j, o = clamp(1.25 - Math.abs(d) * 3.1);
        if (j === 0 && g <= 0) o = 1;
        if (j === M - 1 && g >= M - 1) o = 1;
        el.style.opacity = o;
        var y = -d * 26;
        el.style.transform = isDesk() ? 'translate3d(0,calc(-50% + ' + y + 'px),0)' : 'translate3d(0,' + y + 'px,0)';
        el.classList.toggle('on', o > .55);
        el.style.visibility = o < .01 ? 'hidden' : 'visible';
      });
      bar.style.transform = 'scaleX(' + p + ')';
      sc.style.opacity = p > .96 ? 0 : 1;
      if (g > M - 1.45 && !priced) { priced = true; odo(price, '1 860 000 ₽'); }
    });
  })();

  /* 2. каталог */
  var grid = $('#grid'), chipsEl = $('#chips'), bud = $('#bud'), budV = $('#budV'), cnt = $('#cnt');
  var makes = {}; CARS.forEach(function (c) { makes[c.mk] = (makes[c.mk] || 0) + 1; });
  var TOP = Object.keys(makes).filter(function (m) { return makes[m] >= 4; }).sort(function (a, b) { return makes[b] - makes[a]; });
  var FILT = [['all', 'Все']].concat(TOP.map(function (m) { return [m, m]; }), [['other', 'Другие марки'], ['new', 'Новые, без пробега']]);
  var cur = 'all', maxP = +bud.max;
  chipsEl.innerHTML = FILT.map(function (f) { return '<button class="chip" type="button" data-f="' + f[0] + '" aria-pressed="' + (f[0] === 'all') + '">' + f[1] + '</button>'; }).join('');
  var carTitle = function (c) { return c.mk + ' ' + c.md; };
  var kmTxt = function (c) { return c.km <= 10 ? 'без пробега' : c.km.toLocaleString('ru-RU').replace(/,/g, ' ') + ' км'; };
  var engTxt = function (c) { return c.f === 'электро' ? 'электро, ' + c.hp + ' л.с.' : c.v + ' л, ' + c.hp + ' л.с.'; };
  grid.innerHTML = CARS.map(function (c, i) {
    return '<button class="car rise" type="button" data-car="' + c.id + '" style="--d:' + (i % 3) * 70 + 'ms" aria-label="' + esc(carTitle(c) + ', ' + c.y + ', ' + rub(c.p)) + '">' +
      '<span class="ph"><img class="a" src="img/car/' + c.id + '_a.jpg" alt="" width="720" height="540" loading="lazy" decoding="async"><img class="b" data-src="img/car/' + c.id + '_b.jpg" alt="" width="720" height="540">' + (c.km <= 10 ? '<span class="mk">Новый</span>' : '') + '</span>' +
      '<span class="bd"><span class="h3">' + esc(carTitle(c)) + '</span><span class="tr">' + esc(c.tr) + '</span><span class="me num">' + c.y + ' · ' + kmTxt(c) + ' · ' + engTxt(c) + '</span>' +
      '<span class="pr"><b class="num">' + rub(c.p) + '</b><span>под ключ</span></span></span></button>';
  }).join('');
  var cards = $$('.car', grid);
  cards.forEach(function (el) {
    watch(el);
    // на наведении машина поворачивается: левая половина спереди, правая сзади
    var b = $('img.b', el), loaded = false;
    el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse' && !loaded) { loaded = true; b.src = b.dataset.src; } });
    el.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = el.getBoundingClientRect(); b.classList.toggle('on', e.clientX - r.left > r.width / 2); });
    el.addEventListener('pointerleave', function () { b.classList.remove('on'); });
  });
  var wordCars = function (n) { var a = n % 10, b = n % 100; return n + (a === 1 && b !== 11 ? ' машина' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? ' машины' : ' машин'); };
  function pass(c) {
    if (c.p > maxP) return false;
    if (cur === 'all') return true;
    if (cur === 'new') return c.km <= 10;
    if (cur === 'other') return TOP.indexOf(c.mk) < 0;
    return c.mk === cur;
  }
  var emptyEl = null;
  function applyFilter(first) {
    var before = new Map();
    if (!first && !RM) cards.forEach(function (el) { if (!el.hidden) before.set(el, el.getBoundingClientRect()); });
    var shown = 0;
    cards.forEach(function (el) { var ok = pass(byId[el.dataset.car]); el.hidden = !ok; el.style.display = ok ? '' : 'none'; if (ok) { shown++; el.classList.add('in'); } });
    cnt.textContent = wordCars(shown);
    if (!shown) { if (!emptyEl) { emptyEl = document.createElement('div'); emptyEl.className = 'empty'; emptyEl.innerHTML = 'В этом бюджете сейчас нет машин. <a href="#pick">Напишите, что ищете</a>, подберём под заказ.'; grid.appendChild(emptyEl); } emptyEl.style.display = ''; }
    else if (emptyEl) emptyEl.style.display = 'none';
    if (first || RM) return;
    cards.forEach(function (el) {
      if (el.hidden) return;
      var a = before.get(el), z = el.getBoundingClientRect();
      if (a) {
        var dx = a.left - z.left, dy = a.top - z.top;
        if (dx || dy) el.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.2,.8,.2,1)' });
      } else el.animate([{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
    });
  }
  chipsEl.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    cur = b.dataset.f; $$('.chip', chipsEl).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    applyFilter();
  });
  function setBud() {
    maxP = +bud.value;
    bud.style.setProperty('--v', (maxP - +bud.min) / (+bud.max - +bud.min) * 100 + '%');
    budV.textContent = (maxP / 1e6).toFixed(2).replace('.', ',') + ' млн ₽';
  }
  var budT; bud.addEventListener('input', function () { setBud(); clearTimeout(budT); budT = setTimeout(applyFilter, 90); });
  setBud(); applyFilter(true);

  /* 3. карточка машины: обход перетаскиванием */
  var sheet = $('#sheet'), sheetOpen = false, lastFocus = null, lastCover = null;
  var INCL = ['Оплата авто в Китае (инвойс)', 'Доставка во Владивосток', 'Услуги таможенного брокера', 'Таможенная пошлина', 'Утилизационный сбор', 'Испытательная лаборатория', 'Комиссия банка при оплате инвойса', 'ЭПТС, машина готова к постановке на учёт в ГАИ'];
  var tick = function (i) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path style="--i:' + i + '" d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#d3121d" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'; };
  function sheetHtml(c) {
    var msg = 'Здравствуйте! Интересует ' + carTitle(c) + ' ' + c.y + ' за ' + rub(c.p) + '. Актуальна ли цена?';
    var n = c.e + c.i, imgs = '', ths = '';
    for (var k = 0; k < n; k++) {
      imgs += '<img ' + (k === 0 ? 'class="on" ' : '') + 'data-i="' + k + '" ' + (k === 0 ? 'src' : 'data-src') + '="img/car/' + c.id + '_' + k + '.jpg" alt="' + esc(carTitle(c)) + ', фото ' + (k + 1) + '" width="1000" height="750">';
      ths += '<button type="button" data-t="' + k + '" aria-label="Фото ' + (k + 1) + '"' + (k === 0 ? ' aria-current="true"' : '') + '><img src="img/car/' + c.id + '_' + k + '.jpg" alt="" loading="lazy" width="74" height="56"></button>';
    }
    var specs = [['Год', c.y], ['Пробег', kmTxt(c)], ['Дата выпуска', c.made], ['Двигатель', engTxt(c)], ['Коробка', c.g], ['Привод', c.dr], ['Цвет', c.c], ['Топливо', c.f]].filter(function (x) { return x[1]; });
    return '<div class="sh-top"><button type="button" data-close><svg width="20" height="20" style="transform:rotate(180deg)" aria-hidden="true"><use href="#ar"/></svg>Все машины</button><span class="t">CG Cars · Владивосток</span></div>' +
      '<div class="sh-g"><div class="gal"><div class="stagew" id="stg" aria-label="Обход автомобиля. Перетащите влево или вправо">' + imgs + '<span class="hint" id="hnt">Потяните, чтобы обойти машину</span></div><div class="ths" id="ths">' + ths + '</div></div>' +
      '<div class="det"><h2 id="shT">' + esc(carTitle(c)) + ', ' + c.y + '</h2><div class="tr">' + esc(c.tr) + '</div>' +
      '<div class="p num" id="shP">' + rub(c.p) + '</div><div class="ps">Под ключ во Владивостоке с ЭПТС. Цена рассчитана по курсу на день публикации, итоговую уточним при обращении.</div>' +
      '<div class="acts"><a class="btn" href="' + waLink(msg) + '" target="_blank" rel="noopener">Написать в WhatsApp</a><a class="btn line" href="' + tgLink(msg) + '" target="_blank" rel="noopener">Telegram</a></div>' +
      '<dl class="sp num">' + specs.map(function (s) { return '<div><dt>' + s[0] + '</dt><dd>' + esc(s[1]) + '</dd></div>'; }).join('') + '</dl>' +
      '<h3>В цену уже входит</h3><ul class="ck">' + INCL.map(function (t, i) { return '<li>' + tick(i) + '<span>' + t + '</span></li>'; }).join('') + '</ul>' +
      (c.state.length ? '<h3>Состояние</h3><ul class="ck">' + c.state.map(function (t, i) { return '<li>' + tick(i + 8) + '<span>' + esc(t) + '</span></li>'; }).join('') + '</ul>' : '') +
      (c.opts.length ? '<h3>Комплектация</h3><ul class="opts" id="opts">' + c.opts.slice(0, 8).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' + (c.opts.length > 8 ? '<button class="more" type="button" id="more">Показать всё, ' + c.opts.length + '</button>' : '') : '') +
      '<div class="ln">' + (c.video ? '<a href="' + esc(c.video) + '" target="_blank" rel="noopener">Видеообзор этой машины</a>' : '') + '<a href="' + esc(c.u) + '" target="_blank" rel="noopener">Объявление на Дроме</a></div>' +
      (c.vin ? '<p class="ps num" style="margin-top:14px">VIN ' + esc(c.vin) + '</p>' : '') +
      '</div></div><div class="sh-cta"><a class="btn line" href="tel:+79502998808">Позвонить</a><a class="btn" href="' + waLink(msg) + '" target="_blank" rel="noopener">WhatsApp</a></div>';
  }
  function bindSheet(c) {
    var stg = $('#stg'), fr = $$('img', stg), ths = $$('#ths button'), cur = 0, hnt = $('#hnt');
    var load = function (i) { var im = fr[i]; if (im && im.dataset.src) { im.src = im.dataset.src; delete im.dataset.src; } };
    for (var k = 0; k < c.e; k++) load(k);
    var show = function (i) {
      cur = i; load(i); load(i + 1);
      fr.forEach(function (im, j) { im.classList.toggle('on', j === i); });
      ths.forEach(function (b, j) { if (j === i) { b.setAttribute('aria-current', 'true'); var tw = b.parentNode; tw.scrollTo({ left: b.offsetLeft - tw.clientWidth / 2 + 37, behavior: 'smooth' }); } else b.removeAttribute('aria-current'); });
    };
    $('#ths').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) show(+b.dataset.t); });
    var sx = 0, base = 0, dragging = false, ax = 0;
    stg.addEventListener('pointerdown', function (e) { dragging = true; sx = e.clientX; ax = sx; base = cur < c.e ? cur : 0; stg.setPointerCapture(e.pointerId); stg.classList.add('drag'); if (hnt) hnt.style.opacity = 0; stopAuto(); });
    stg.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var step = Math.max(38, stg.clientWidth / (c.e * 1.6));
      var i = ((base - Math.round((e.clientX - sx) / step)) % c.e + c.e) % c.e;
      if (i !== cur) show(i);
    });
    var end = function () { dragging = false; stg.classList.remove('drag'); };
    stg.addEventListener('pointerup', end); stg.addEventListener('pointercancel', end);
    stg.tabIndex = 0;
    stg.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') show((cur + 1) % fr.length); if (e.key === 'ArrowLeft') show((cur - 1 + fr.length) % fr.length); });
    // машина сама делает один круг, чтобы было понятно, что её можно крутить
    var autoT = null, stopAuto = function () { clearTimeout(autoT); autoT = null; };
    if (!RM && c.e > 2) {
      var seq = []; for (var q = 1; q < c.e; q++) seq.push(q); seq.push(0);
      var step = function () { if (!seq.length) return; show(seq.shift()); autoT = setTimeout(step, 210); };
      autoT = setTimeout(step, 650);
    }
    var mo = $('#more');
    if (mo) mo.addEventListener('click', function () { $('#opts').innerHTML = c.opts.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join(''); mo.remove(); });
    if (!RM) { var P = $('#shP'), T = rub(c.p); var zero = T.replace(/\d/g, '0'); odo(P, zero); requestAnimationFrame(function () { setTimeout(function () { odo(P, T); }, 60); }); }
  }
  function openCar(id, from, noPush) {
    var c = byId[id]; if (!c) return;
    lastFocus = from || document.activeElement;
    var cover = from && from.classList && from.classList.contains('car') ? $('.ph', from) : null;
    var render = function () {
      sheet.innerHTML = sheetHtml(c);
      sheet.classList.add('open');
      sheet.scrollTop = 0;
      document.documentElement.style.overflow = 'hidden';
      sheetOpen = true;
      if (cover) cover.style.viewTransitionName = '';
      bindSheet(c);
      sheet.focus({ preventScroll: true });
      if (mb) mb.classList.remove('on');
    };
    if (!noPush) history.pushState({ car: id }, '', '#car-' + id);
    if (document.startViewTransition && !RM && cover) {
      cover.style.viewTransitionName = 'car'; lastCover = cover;
      var vt = document.startViewTransition(render); vt.ready.catch(noop); vt.finished.catch(noop);
    } else { sheet.classList.add('anim'); render(); }
  }
  function closeCar(noBack) {
    if (!sheetOpen) return;
    var fin = function () {
      sheet.classList.remove('open', 'anim'); sheet.innerHTML = '';
      document.documentElement.style.overflow = ''; sheetOpen = false;
      if (lastCover && document.startViewTransition && !RM) lastCover.style.viewTransitionName = 'car';
    };
    if (document.startViewTransition && !RM && lastCover) {
      var t = document.startViewTransition(fin);
      t.ready.catch(noop);
      t.finished.catch(noop).then(function () { if (lastCover) lastCover.style.viewTransitionName = ''; lastCover = null; });
    } else fin();
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    if (!noBack && /^#car-/.test(location.hash)) history.back();
    onScroll();
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-car]');
    if (a) { e.preventDefault(); openCar(a.dataset.car, a); return; }
    if (e.target.closest('[data-close]')) closeCar();
  });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCar(); });
  addEventListener('popstate', function () {
    var m = /^#car-(\d+)/.exec(location.hash);
    if (m && !sheetOpen) openCar(m[1], null, true);
    else if (!m) closeCar(true);
  });
  var hm = /^#car-(\d+)/.exec(location.hash);
  if (hm) openCar(hm[1], null, true);

  /* 4. маршрут */
  (function () {
    var st = [['Оплата авто в Китае (инвойс)'], ['Комиссия банка при оплате инвойса'], ['Доставка во Владивосток'], ['Услуги таможенного брокера'], ['Таможенная пошлина'], ['Утилизационный сбор'], ['Испытательная лаборатория'], ['ЭПТС']];
    var ul = $('#stps');
    ul.innerHTML = st.map(function (s) { return '<li><svg viewBox="0 0 18 18" aria-hidden="true"><circle class="o" cx="9" cy="9" r="8" fill="none" stroke-width="1.4"/><path class="c" d="M5 9.4l2.8 2.8L13 6.6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span>' + s[0] + '</span></li>'; }).join('');
    var lis = $$('li', ul), P = $('#rP'), car = $('#rCar'), L = P.getTotalLength(), end = $('#rEnd'), vd = $('#vDot'), vr = $('#vRing'), vt = $('#vTxt'), vt2 = $('#vTxt2');
    P.style.strokeDasharray = L; P.style.strokeDashoffset = L;
    var svg = $('#rSvg'), setMap = function () {
      var m = !isDesk(), a = function (id, o) { var e = $(id); Object.keys(o).forEach(function (k) { e.setAttribute(k, o[k]); }); };
      svg.setAttribute('viewBox', m ? '195 90 570 440' : '150 70 800 500');
      a('#mBg', m ? { x: 195, y: 90, width: 570, height: 440 } : { x: 150, y: 70, width: 800, height: 500 });
      a('#mCl', m ? { x: 195, y: 90, width: 570, height: 440 } : { x: 150, y: 70, width: 800, height: 500 });
      a('#vTxt', m ? { x: 750, y: 470, 'text-anchor': 'end' } : { x: 684, y: 404, 'text-anchor': 'start' });
      a('#vTxt2', m ? { x: 750, y: 498, 'text-anchor': 'end' } : { x: 684, y: 384, 'text-anchor': 'start' });
      a('#mRu', m ? { x: 660, y: 165 } : { x: 790, y: 300 });
      carScale = m ? 1.45 : 1;
    }, carScale = 1;
    setMap(); addEventListener('resize', setMap);
    var place = function (k) {
      var q = P.getPointAtLength(L * k), a = P.getPointAtLength(Math.min(L, L * k + 2)), b = P.getPointAtLength(Math.max(0, L * k - 2));
      car.setAttribute('transform', 'translate(' + q.x + ' ' + q.y + ') rotate(' + Math.atan2(a.y - b.y, a.x - b.x) * 180 / Math.PI + ') scale(' + carScale + ')');
      P.style.strokeDashoffset = L * (1 - k);
    };
    if (RM) { place(1); lis.forEach(function (l) { l.classList.add('on'); }); end.classList.add('on'); vd.setAttribute('fill', '#f0414c'); vt.setAttribute('opacity', 1); vt2.setAttribute('opacity', 1); return; }
    place(0);
    scrub($('#way'), function (p) {
      var k = clamp((p - .03) / .86); place(k);
      lis.forEach(function (l, i) { l.classList.toggle('on', k >= (i + .35) / lis.length); });
      var done = k >= .995;
      end.classList.toggle('on', done);
      vd.setAttribute('fill', done ? '#f0414c' : '#6c727c');
      vt.setAttribute('opacity', done ? 1 : .55); vt2.setAttribute('opacity', done ? 1 : 0);
      vr.setAttribute('opacity', done ? clamp((1 - p) * 8) : 0); vr.setAttribute('r', 8 + clamp((p - .89) * 12) * 16);
    });
  })();

  /* 5. цитата по словам */
  (function () {
    var q = $('#qt'); if (!q) return;
    var ws = q.textContent.trim().split(/\s+/);
    q.setAttribute('aria-label', q.textContent.trim());
    q.innerHTML = ws.map(function (w) { return '<span aria-hidden="true">' + esc(w) + '</span>'; }).join(' ');
    var sp = $$('span', q);
    if (RM) { sp.forEach(function (s) { s.classList.add('on'); }); return; }
    scrub(q.parentNode, function (_, r, vh) {
      var k = clamp((vh * .92 - r.top - 40) / (vh * .55));
      var n = k * sp.length;
      sp.forEach(function (s, i) { s.classList.toggle('on', i < n); });
    });
  })();

  /* 6. сканер */
  (function () {
    var sec = $('.scan'), col = $('#sCol'), ln = $('#sLn'), box = $('#sIm'), pins = $$('.pin', box), li = $$('#sList li');
    var set = function (k) {
      col.style.clipPath = 'inset(0 ' + (100 - k * 100) + '% 0 0)';
      ln.style.transform = 'translate3d(' + k * box.clientWidth + 'px,0,0)';
      pins.forEach(function (p, i) { var on = k >= +p.dataset.at; p.classList.toggle('on', on); li[i].classList.toggle('on', on); });
    };
    if (RM) { set(1); ln.style.display = 'none'; return; }
    scrub(sec, function (p) { set(clamp((p - .06) / .84)); });
    set(0);
  })();

  /* 7. калькулятор */
  (function () {
    var R = window.RATES, CONFIG = { costs: { CN: { cur: 'CNY', abroad: 100000, delivery: 40000 } }, service: 60000, broker: 90000, freightInCustomsValue: false };
    var FX = { date: R.fx.date, rub: R.fx.rub, live: false };
    var seg = function (id, name, list, val) {
      $(id).innerHTML = list.map(function (o) { return '<label><input type="radio" name="' + name + '" value="' + o[0] + '"' + (o[0] === val ? ' checked' : '') + '><span>' + o[1] + '</span></label>'; }).join('');
    };
    seg('#sA', 'age', [['lt3', 'до 3 лет'], ['3to5', '3–5 лет'], ['5to7', '5–7 лет'], ['gt7', 'старше 7']], '3to5');
    seg('#sE', 'eng', [['ice', 'Бензин'], ['hyb', 'Гибрид'], ['ev', 'Электро']], 'ice');
    seg('#sW', 'who', [['fiz', 'Физлицо для себя'], ['yur', 'Юрлицо или ИП']], 'fiz');
    var cP = $('#cP'), cR = $('#cR'), cC = $('#cC'), cH = $('#cH'), T = $('#cT'), S = $('#cS'), Rw = $('#cRows'), send = $('#cSend'), fine = $('#cFine'), fC = $('#fC');
    var num = function (s) { var v = parseFloat(String(s).replace(/\s/g, '').replace(',', '.')); return isFinite(v) ? v : NaN; };
    var radio = function (n) { var x = $('input[name="' + n + '"]:checked'); return x && x.value; };
    var fmt = function (v) { return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
    var lastEng = 'ice', hint = $('#cHh');
    var COL = { car: '#ffffff', china: '#8a909b', del: '#5f656f', cus: '#f0414c', util: '#ff9aa0', srv: '#c0c5cd' };
    var checks = [[cP, $('#cPe'), function (v) { return v > 0; }, 'Введите цену цифрами, например 100 000'], [cC, $('#cCe'), function (v) { return v >= 600 && v <= 8000; }, 'Объём от 600 до 8000 см³'], [cH, $('#cHe'), function (v) { return v >= 30 && v <= 1000; }, 'Мощность от 30 до 1000 л.с.']];
    function valid() {
      var ev = radio('eng') === 'ev';
      return num(cP.value) > 0 && (ev || (num(cC.value) >= 600 && num(cC.value) <= 8000)) && num(cH.value) >= 30 && num(cH.value) <= 1000;
    }
    function render() {
      var eng = radio('eng');
      fC.style.display = eng === 'ev' ? 'none' : '';
      if (eng !== lastEng) {
        if (eng === 'ev' && cH.value === '124') cH.value = '70';
        if (eng !== 'ev' && lastEng === 'ev' && cH.value === '70') cH.value = '124';
        lastEng = eng;
      }
      var hh = eng === 'ev' ? 'Для электромобиля считается 30-минутная мощность из документов, она намного ниже пиковой.' : eng === 'hyb' ? (R.util.hybridHint || '') : '';
      hint.hidden = !hh; hint.textContent = hh;
      if (!valid()) { send.setAttribute('aria-disabled', 'true'); return; }
      send.removeAttribute('aria-disabled');
      var i = { country: 'CN', cur: 'CNY', price: num(cP.value), age: radio('age'), engine: eng, serial: eng === 'hyb' && !!R.util.hybridSerialDefault, cc: eng === 'ev' ? 0 : num(cC.value), hp: num(cH.value), who: radio('who') };
      var o = window.calcTotal(i, R, CONFIG, FX.rub);
      var cus = o.duty + o.excise + o.vat + o.fee, srv = CONFIG.service + CONFIG.broker;
      var parts = [['car', 'Машина в Китае', o.carRub, 0], ['china', 'Расходы в Китае', o.abroad, 1], ['del', 'Доставка', o.delivery, 1], ['cus', 'Таможня', cus, 0], ['util', 'Утильсбор', o.util, 0], ['srv', 'Услуги и брокер', srv, 1]];
      odo(T, rub(o.total));
      var tot = parts.reduce(function (n, p) { return n + p[2]; }, 0);
      if (!S.children.length) S.innerHTML = parts.map(function (p) { return '<i style="background:' + COL[p[0]] + ';width:0"></i>'; }).join('');
      parts.forEach(function (p, k) { S.children[k].style.width = 'calc((100% - 10px)*' + (p[2] / tot).toFixed(4) + ')'; });
      Rw.innerHTML = parts.map(function (p) { return '<div><s style="background:' + COL[p[0]] + '"></s><span>' + p[1] + (p[3] ? '<span class="ex">Пример</span>' : '') + '</span><span>' + rub(p[2]) + '</span></div>'; }).join('');
      var d = FX.date ? new Date(FX.date + 'T00:00:00').toLocaleDateString('ru-RU') : '';
      fine.textContent = 'Ориентировочный расчёт, не оферта. Курс ЦБ ' + (FX.rub.CNY.toFixed(2).replace('.', ',')) + ' ₽ за юань на ' + d + ', ставки сверены ' + new Date(R.checked + 'T00:00:00').toLocaleDateString('ru-RU') + '. Строки «Пример» в рабочей версии заменим на ваши цифры.';
      var who = i.who === 'fiz' ? 'физлицо' : 'юрлицо или ИП';
      send.href = waLink('Здравствуйте! Посчитал на сайте машину из Китая за ' + fmt(i.price) + ' ¥, ' + $('input[name="age"]:checked + span').textContent + ', ' + (eng === 'ev' ? 'электро' : i.cc + ' см³') + ', ' + i.hp + ' л.с., ' + who + '. Вышло примерно ' + rub(o.total) + '. Можете посчитать точно?');
    }
    cP.addEventListener('input', function () { var v = cP.value.replace(/\D/g, ''); cP.value = fmt(v); if (+v >= +cR.min && +v <= +cR.max) { cR.value = v; paint(); } render(); });
    function paint() { cR.style.setProperty('--v', (cR.value - cR.min) / (cR.max - cR.min) * 100 + '%'); }
    cR.addEventListener('input', function () { cP.value = fmt(cR.value); paint(); render(); });
    [cC, cH].forEach(function (x) { x.addEventListener('input', function () { x.value = x.value.replace(/\D/g, ''); render(); }); });
    checks.forEach(function (c) {
      c[0].addEventListener('blur', function () { var bad = c[0].value.trim() !== '' && !c[2](num(c[0].value)); c[1].hidden = !bad; c[1].textContent = bad ? c[3] : ''; });
      c[0].addEventListener('focus', function () { c[1].hidden = true; });
    });
    $('#cf').addEventListener('change', render);
    send.addEventListener('click', function (e) { if (send.getAttribute('aria-disabled') === 'true') e.preventDefault(); });
    paint(); render();
    fetch(R.fx.url, { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) {
      var out = {}; Object.keys(FX.rub).forEach(function (k) { var v = j.Valute && j.Valute[k]; if (v) out[k] = v.Value / v.Nominal; });
      if (Object.keys(out).length === Object.keys(FX.rub).length) { FX = { date: String(j.Date).slice(0, 10), rub: out, live: true }; render(); }
    }).catch(function () {});
  })();

  /* 8. подбор */
  (function () {
    var box = $('#pB'), BUD = ['до 1,5 млн', '1,5–2 млн', '2–3 млн', 'от 3 млн'], picked = '';
    box.innerHTML = BUD.map(function (b) { return '<button class="chip" type="button" aria-pressed="false">' + b + ' ₽</button>'; }).join('');
    var t = $('#pT'), w = $('#pW'), g = $('#pG');
    function upd() {
      var txt = t.value.trim(), msg = 'Здравствуйте! Нужен подбор автомобиля из Китая.' + (txt ? ' ' + txt + '.' : '') + (picked ? ' Бюджет: ' + picked + '.' : '');
      w.href = waLink(msg); g.href = tgLink(msg);
    }
    box.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      var was = b.getAttribute('aria-pressed') === 'true';
      $$('.chip', box).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', was ? 'false' : 'true'); picked = was ? '' : b.textContent; upd();
    });
    t.addEventListener('input', upd); upd();
  })();

  /* 9. отзывы: едут вбок при прокрутке */
  (function () {
    var tr = $('#track'), sec = $('#reviews');
    tr.innerHTML = RV.map(function (r, i) {
      var sent = (r.t.split(/(?<=[.!?…])\s+|\n+/).filter(function (s) { return s.indexOf(r.hl) >= 0; })[0] || r.hl).trim();
      return '<article class="rc">' + (r.img ? '<div class="im"><img src="img/rv/' + r.img + '.jpg" alt="Автомобиль клиента" loading="lazy" width="880" height="660"></div>' : '') +
        '<div class="tx"><blockquote>«' + esc(sent) + '»</blockquote><div class="au">' + esc(r.a) + (r.m ? ', ' + esc(r.m) : '') + '</div>' +
        (r.t.length > sent.length + 8 ? '<button class="tg" type="button" data-rv="' + i + '" aria-expanded="false">Читать весь отзыв</button><div class="full" hidden></div>' : '') + '</div></article>';
    }).join('');
    tr.addEventListener('click', function (e) {
      var b = e.target.closest('.tg'); if (!b) return;
      var f = b.nextElementSibling, open = f.hidden; f.hidden = !open;
      if (open) f.textContent = RV[+b.dataset.rv].t;
      b.textContent = open ? 'Свернуть' : 'Читать весь отзыв'; b.setAttribute('aria-expanded', open);
    });
    if (RM) { sec.style.height = 'auto'; $('.rv-st').style.position = 'static'; $('.rv-st').style.height = 'auto'; tr.style.overflowX = 'auto'; tr.style.width = 'auto'; return; }
    var last = -1;
    scrub(sec, function (p) {
      if (!isDesk()) { if (last !== -2) { tr.style.transform = ''; last = -2; } return; }
      var d = Math.max(0, tr.scrollWidth - innerWidth);
      tr.style.transform = 'translate3d(' + (-d * clamp((p - .04) / .92)) + 'px,0,0)'; last = p;
    });
  })();

  /* 10. сейчас во Владивостоке */
  (function () {
    var el = $('#now'); if (!el) return;
    function up() {
      try {
        var parts = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Asia/Vladivostok', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
        var v = {}; parts.forEach(function (p) { v[p.type] = p.value; });
        var h = +v.hour, open = !/сб|вс/i.test(v.weekday) && h >= 10 && h < 19;
        el.className = 'now num' + (open ? ' op' : '');
        el.innerHTML = '<i></i>Во Владивостоке ' + v.hour + ':' + v.minute + '. ' + (open ? 'Офис работает.' : 'Офис закрыт, напишите в мессенджер.');
      } catch (e) { el.hidden = true; }
    }
    up(); setInterval(up, 30000);
  })();

  frame();
})();
