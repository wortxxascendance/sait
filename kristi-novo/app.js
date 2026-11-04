(function () {
  'use strict';
  var PHONE = '79189951508';
  var TZ = 'Europe/Moscow';
  var OPEN = 10, CLOSE = 19;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var cards = $$('.dr');
  var byN = {};
  cards.forEach(function (c) { byN[c.dataset.n] = c; });
  var picked = [];
  var isWide = function () { return matchMedia('(min-width:1000px)').matches; };

  function save() { try { localStorage.setItem('kristi-pl', picked.join(',')); } catch (e) {} }
  function loadSaved() {
    try { return (localStorage.getItem('kristi-pl') || '').split(',').filter(function (n) { return byN[n]; }); } catch (e) { return []; }
  }
  function waUrl(text) { return 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(text); }
  function plUrl() { return location.href.split('#')[0] + '#pl=' + picked.join(','); }
  function isHttp() { return /^https?:/.test(location.protocol); }
  function plural(n, a, b, c) { var d = n % 10, h = n % 100; if (d === 1 && h !== 11) return a; if (d > 1 && d < 5 && (h < 12 || h > 14)) return b; return c; }
  function fmtNum(s) { return String(s).replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

  /* время салона */
  function mskParts() {
    var p = {};
    new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false, minute: '2-digit' })
      .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    return { date: p.year + '-' + p.month + '-' + p.day, hour: (+p.hour) % 24, min: +p.minute };
  }
  (function state() {
    var el = $('#state'); if (!el) return;
    var t = mskParts();
    el.textContent = (t.hour >= OPEN && t.hour < CLOSE) ? 'Сейчас открыто, до 19:00' : 'Сейчас закрыто, откроется в 10:00';
  })();

  /* фильтр и показ */
  var filter = 'all';
  var limit = isWide() ? 16 : 12;
  var moreW = $('#moreW');
  var filBtns = $$('#fil button');
  function matched(c) {
    if (filter === 'all') return true;
    if (filter === 'mine') return picked.indexOf(c.dataset.n) >= 0;
    return c.dataset.t.split(' ').indexOf(filter) >= 0;
  }
  function render() {
    var shown = 0, total = 0;
    cards.forEach(function (c) {
      var m = matched(c);
      if (m) total++;
      var v = m && shown < limit;
      if (v) shown++;
      c.hidden = !v;
    });
    moreW.hidden = total <= shown;
    var mb = $('#moreBtn');
    if (mb) mb.textContent = 'Показать ещё ' + (total - shown);
    $('#empty').hidden = total > 0;
    filBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.f === filter)); });
  }
  filBtns.forEach(function (b) {
    b.addEventListener('click', function () { filter = b.dataset.f; limit = isWide() ? 16 : 12; render(); });
  });
  $('#moreBtn').addEventListener('click', function () { limit += isWide() ? 16 : 12; render(); });

  /* примерка */
  function setPickBtn(b, on) {
    b.setAttribute('aria-pressed', String(on));
    b.textContent = on ? 'В примерке' : 'В примерку';
  }
  function syncPicked() {
    $$('.dr .pick').forEach(function (b) { setPickBtn(b, picked.indexOf(b.dataset.pick) >= 0); });
    if (lbN) setPickBtn($('#lbPick'), picked.indexOf(lbN) >= 0);
    var plChip = $('#filPl');
    plChip.hidden = picked.length === 0;
    $('sup', plChip).textContent = picked.length;
    if (filter === 'mine' && !picked.length) filter = 'all';
    $('#barCount').textContent = picked.length ? 'В примерке: ' + picked.length : '';
    $('#barBtn').textContent = picked.length ? 'Записаться' : 'Записаться на примерку';
    var th = $('#barTh'); th.textContent = '';
    picked.slice(-3).forEach(function (n) { var im = new Image(); im.alt = ''; im.src = thumb(n); th.appendChild(im); });
    drawPl();
    drawMsg();
    save();
    bar();
  }
  function thumb(n) { return 'img/d/' + byN[n].dataset.ph.split(',')[0] + '-s.webp'; }
  function togglePick(n) {
    var i = picked.indexOf(n);
    if (i >= 0) picked.splice(i, 1); else picked.push(n);
    syncPicked();
    if (filter === 'mine') render();
  }
  document.addEventListener('click', function (e) {
    var p = e.target.closest('[data-pick]');
    if (p) togglePick(p.dataset.pick);
    var o = e.target.closest('[data-open]');
    if (o) openLb(o.dataset.open, 0);
    var r = e.target.closest('[data-rm]');
    if (r) togglePick(r.dataset.rm);
  });

  /* подборка в форме */
  function drawPl() {
    var list = $('#plList'), emp = $('#plEmpty'), sh = $('#plShare');
    list.textContent = '';
    picked.forEach(function (n) {
      var li = document.createElement('li');
      var im = new Image(); im.alt = ''; im.src = thumb(n); im.width = 56; im.height = 72;
      var t = document.createElement('span'); t.textContent = '№ ' + n + '. ' + byN[n].dataset.d;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'pl-rm'; b.dataset.rm = n; b.textContent = '×';
      b.setAttribute('aria-label', 'Убрать платье № ' + n);
      li.appendChild(im); li.appendChild(t); li.appendChild(b); list.appendChild(li);
    });
    emp.hidden = picked.length > 0;
    sh.hidden = !picked.length;
    if (picked.length) sh.href = 'https://wa.me/?text=' + encodeURIComponent('Посмотри, какие платья я выбрала в салоне Kristi: ' + plUrl());
  }

  /* панель внизу */
  var pastHero = false, atForm = false;
  function bar() {
    var b = $('#bar'), wide = isWide();
    var on = !atForm && pastHero && (picked.length > 0 || !wide);
    b.classList.toggle('on', on);
    b.classList.toggle('solo', !picked.length);
    if (dlg.open) b.classList.remove('on');
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { pastHero = !es[0].isIntersecting; bar(); }).observe($('#heroCta'));
    new IntersectionObserver(function (es) { atForm = es.some(function (x) { return x.isIntersecting; }); bar(); }, { rootMargin: '-10% 0px -10% 0px' }).observe($('#bookForm'));
  } else { pastHero = true; }

  /* просмотр платья */
  var dlg = $('#lb'), lbN = null, lbI = 0;
  function visibleNs() { return cards.filter(function (c) { return !c.hidden; }).map(function (c) { return c.dataset.n; }); }
  function drawLb() {
    var c = byN[lbN], ph = c.dataset.ph.split(',');
    var img = $('#lbImg');
    img.src = 'img/d/' + ph[lbI] + '-l.webp';
    img.alt = 'Свадебное платье: ' + c.dataset.d;
    $('#lbNo').textContent = '№ ' + lbN;
    $('#lbD').textContent = c.dataset.d;
    var th = $('#lbTh'); th.textContent = ''; th.hidden = ph.length < 2;
    if (ph.length > 1) ph.forEach(function (p, i) {
      var b = document.createElement('button'); b.type = 'button';
      b.setAttribute('aria-label', 'Фото ' + (i + 1) + ' из ' + ph.length);
      if (i === lbI) b.setAttribute('aria-current', 'true');
      var im = new Image(); im.alt = ''; im.src = 'img/d/' + p + '-s.webp'; b.appendChild(im);
      b.addEventListener('click', function () { lbI = i; drawLb(); });
      th.appendChild(b);
    });
    var pb = $('#lbPick'); pb.dataset.pick = lbN; setPickBtn(pb, picked.indexOf(lbN) >= 0);
  }
  function openLb(n, i) { lbN = n; lbI = i || 0; drawLb(); if (!dlg.open) dlg.showModal(); document.documentElement.style.overflow = 'hidden'; bar(); }
  function step(d) {
    var c = byN[lbN], ph = c.dataset.ph.split(',');
    var ni = lbI + d;
    if (ni >= 0 && ni < ph.length) { lbI = ni; drawLb(); return; }
    var v = visibleNs(), at = v.indexOf(lbN), nx = v[(at + d + v.length) % v.length];
    lbN = nx; lbI = d < 0 ? byN[nx].dataset.ph.split(',').length - 1 : 0; drawLb();
  }
  $('#lbX').addEventListener('click', function () { dlg.close(); });
  $('#lbP').addEventListener('click', function () { step(-1); });
  $('#lbN').addEventListener('click', function () { step(1); });
  dlg.addEventListener('close', function () { document.documentElement.style.overflow = ''; lbN = null; bar(); });
  dlg.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });
  (function () {
    var x0 = null;
    var v = $('.lb-v');
    v.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    v.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
    });
  })();

  /* сверка цены */
  var tCap = $('#tCap'), tOth = $('#tOth'), tOut = $('#tOut'), tSend = $('#tSend');
  function toolText() {
    var cap = fmtNum(tCap.value), oth = fmtNum(tOth.value), s = 'Кристина, здравствуйте. ';
    if (cap) s += 'Мой потолок цены на платье: ' + cap + ' ₽. ';
    if (oth) s += 'В другом салоне видела платье за ' + oth + ' ₽, могу прислать фото. ';
    if (cap || oth) s += 'Что у вас есть в этих пределах?';
    else s += 'Подскажите, какие платья и по какой цене у вас есть сейчас?';
    return s;
  }
  function drawTool() { var t = toolText(); $('span', tOut).textContent = t; tSend.href = waUrl(t); }
  [tCap, tOth].forEach(function (i) { i.addEventListener('input', function () { i.value = fmtNum(i.value); drawTool(); }); });
  $('#tAdd').addEventListener('click', function () {
    var c = $('#fCap'), o = $('#fOth');
    if (tCap.value) c.value = tCap.value;
    if (tOth.value) o.value = tOth.value;
    if (c.value || o.value) $('#extra').open = true;
    drawMsg();
    $('#zapis').scrollIntoView();
    $('#fName').focus({ preventScroll: true });
  });

  /* форма */
  var form = $('#bookForm'), fName = $('#fName'), fDate = $('#fDate'), fOk = $('#fOk');
  var today = mskParts().date;
  fDate.min = today;
  $('#fWed').min = today;
  function ruDate(v) {
    var d = new Date(v + 'T12:00:00');
    if (isNaN(d)) return '';
    var s = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    var w = d.toLocaleDateString('ru-RU', { weekday: 'long' });
    return s + ', ' + w;
  }
  function radio(n) { var r = form.querySelector('input[name=' + n + ']:checked'); return r ? r.value : ''; }
  function message() {
    var L = ['Здравствуйте, Кристина. Хочу записаться на примерку.'];
    var name = fName.value.trim();
    if (name) L.push('Имя: ' + name);
    if (fDate.value) L.push('Дата: ' + ruDate(fDate.value));
    L.push('Время: ' + (radio('slot') || 'любое'));
    L.push('Повод: ' + radio('reason'));
    var w = $('#fWed').value, sz = $('#fSize').value.trim(), cap = $('#fCap').value, oth = $('#fOth').value;
    if (w) L.push('Дата свадьбы: ' + new Date(w + 'T12:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }));
    if (sz) L.push('Размер: ' + sz);
    if (cap) L.push('Потолок цены: ' + cap + ' ₽');
    if (oth) L.push('В другом салоне видела за: ' + oth + ' ₽');
    if (picked.length) {
      L.push('Понравились платья с сайта: ' + picked.map(function (n) { return '№ ' + n; }).join(', '));
      if (isHttp()) L.push('Подборка с фото: ' + plUrl());
    }
    return L.join('\n');
  }
  function drawMsg() { $('#msg').textContent = message(); }
  function setErr(el, box, text) {
    $('#' + box).textContent = text || '';
    el.closest('.fld').classList.toggle('bad', !!text);
    el.setAttribute('aria-invalid', text ? 'true' : 'false');
  }
  function vName() { var ok = fName.value.trim().length >= 2; setErr(fName, 'eName', ok ? '' : 'Напишите имя, чтобы салон знал, как к вам обращаться'); return ok; }
  function vDate() {
    var v = fDate.value, t = mskParts(), e = '';
    if (!v) e = 'Выберите день примерки';
    else if (v < t.date) e = 'Эта дата уже прошла';
    else if (v === t.date && t.hour >= CLOSE) e = 'Сегодня салон уже закрыт, выберите другой день';
    setErr(fDate, 'eDate', e); return !e;
  }
  function vOk() { var ok = fOk.checked; $('#eOk').textContent = ok ? '' : 'Без согласия отправить запись нельзя'; fOk.setAttribute('aria-invalid', ok ? 'false' : 'true'); return ok; }
  function slots() {
    var t = mskParts(), isToday = fDate.value === t.date;
    $$('input[name=slot]').forEach(function (r) {
      var end = +r.dataset.end;
      r.disabled = !!end && isToday && t.hour >= end;
      if (r.disabled && r.checked) r.checked = false;
    });
  }
  fName.addEventListener('blur', vName);
  fDate.addEventListener('blur', vDate);
  fOk.addEventListener('blur', function () { if ($('#eOk').textContent) vOk(); });
  fName.addEventListener('input', function () { if ($('#eName').textContent) vName(); });
  fDate.addEventListener('input', function () { if ($('#eDate').textContent) vDate(); slots(); });
  fOk.addEventListener('change', function () { if (fOk.checked) vOk(); });
  form.addEventListener('input', drawMsg);
  form.addEventListener('change', drawMsg);
  ['fCap', 'fOth'].forEach(function (id) { var i = $('#' + id); i.addEventListener('input', function () { i.value = fmtNum(i.value); drawMsg(); }); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var a = vName(), b = vDate(), c = vOk();
    if (!a || !b || !c) { (!a ? fName : !b ? fDate : fOk).focus(); return; }
    var u = waUrl(message());
    window.open(u, '_blank', 'noopener');
    var s = $('#sent'); s.hidden = false; $('#sentLink').href = u;
  });

  /* кнопки с готовым текстом */
  $$('[data-wa]').forEach(function (a) { a.href = waUrl(a.dataset.wa); });

  /* старт */
  var fromHash = (location.hash.match(/^#pl=([\d,]+)/) || [])[1];
  if (fromHash) {
    picked = fromHash.split(',').filter(function (n, i, arr) { return byN[n] && arr.indexOf(n) === i; });
    if (picked.length) filter = 'mine';
  } else picked = loadSaved();
  syncPicked();
  drawTool();
  slots();
  render();
  if (fromHash && picked.length) setTimeout(function () { $('#platya').scrollIntoView(); }, 60);
  addEventListener('resize', bar);
})();
