/* Выкуп Авто ДВ: заявка в WhatsApp, галерея из альбома 2ГИС, фильтр отзывов. Подключается из index.html, данных с сервера нет */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var WA = '79143163939';
  var waUrl = function (t) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t); };
  var isMob = function () { return window.innerWidth < 641; };

  /* появление */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px' }) : null;
  $$('[data-rv]').forEach(function (el) { if (io) io.observe(el); else el.classList.add('on'); });

  /* ---------- заявка ---------- */
  var form = $('#leadForm');
  function bad(id, msg) {
    var el = $('#' + id), er = $('#' + id + '-e');
    if (el.tagName === 'INPUT') el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    er.hidden = !msg; er.textContent = msg || '';
  }
  var kindNow = function () { return $('input[name=kind]:checked').value; };
  var stateNow = function () { var x = $('input[name=state]:checked'); return x ? x.value : ''; };
  function checkYear() {
    var v = $('#cYear').value.trim(), n = +v, max = new Date().getFullYear() + 1;
    if (!v) return 'Укажите год выпуска';
    if (!/^\d{4}$/.test(v) || n < 1950 || n > max) return 'Год четырьмя цифрами, например 2008';
    return '';
  }
  var RULES = {
    cModel: function () { return $('#cModel').value.trim().length < 2 ? 'Напишите марку и модель' : ''; },
    cYear: checkYear,
    gPlace: function () { return $('#gPlace').value.trim().length < 2 ? 'Напишите адрес, кооператив или район' : ''; }
  };
  Object.keys(RULES).forEach(function (id) {
    var el = $('#' + id);
    el.addEventListener('blur', function (e) {
      /* переход на вкладку «что продаёте» не считаем ошибкой поля */
      if (e.relatedTarget && e.relatedTarget.name === 'kind') return;
      bad(id, RULES[id]());
    });
    el.addEventListener('input', function () { if (!$('#' + id + '-e').hidden) bad(id, RULES[id]()); });
  });
  $$('input[name=state]').forEach(function (r) { r.addEventListener('change', function () { bad('cState', ''); }); });
  $('#lOk').addEventListener('change', function () { if (this.checked) bad('lOk', ''); });

  function setKind(k) {
    $('input[name=kind][value=' + k + ']').checked = true;
    $('#carF').hidden = k !== 'car'; $('#garF').hidden = k !== 'garage';
    $('#sent').hidden = true;
    ['cModel', 'cYear', 'gPlace', 'cState'].forEach(function (id) { bad(id, ''); });
  }
  $$('input[name=kind]').forEach(function (r) { r.addEventListener('change', function () { setKind(r.value); }); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    $('#sent').hidden = true;
    var first = null, k = kindNow(), t;
    var fail = function (id, msg, el) { bad(id, msg); first = first || el; };
    if (k === 'car') {
      ['cModel', 'cYear'].forEach(function (id) { var m = RULES[id](); bad(id, m); if (m) first = first || $('#' + id); });
      if (!stateNow()) fail('cState', 'Выберите состояние машины', $('input[name=state]'));
    } else {
      var m = RULES.gPlace(); bad('gPlace', m); if (m) first = $('#gPlace');
    }
    if (!$('#lOk').checked) fail('lOk', 'Нужно согласие, чтобы отправить заявку', $('#lOk'));
    if (first) { first.focus(); first.scrollIntoView({ block: 'center' }); return; }
    if (k === 'car') {
      var notes = $$('#cNote input:checked').map(function (c) { return c.value; });
      t = 'Здравствуйте! Хочу продать автомобиль (заявка с сайта).\nМарка и модель: ' + $('#cModel').value.trim() + '\nГод: ' + $('#cYear').value.trim() + '\nСостояние: ' + stateNow() + (notes.length ? '\nОсобенности: ' + notes.join(', ') : '') + '\nФото прикреплю в этот чат.';
      $('#sentT').textContent = 'Прикрепите в чат фото: спереди, сзади, салон, приборная панель с пробегом, повреждения, если есть.';
    } else {
      var size = $('#gSize').value.trim(), docs = $('input[name=gdocs]:checked');
      t = 'Здравствуйте! Хочу продать гаражный бокс (заявка с сайта).\nГде находится: ' + $('#gPlace').value.trim() + (size ? '\nРазмер: ' + size : '') + (docs ? '\nДокументы: ' + docs.value : '') + '\nФото прикреплю в этот чат.';
      $('#sentT').textContent = 'Прикрепите в чат фото бокса снаружи и внутри.';
    }
    var url = waUrl(t);
    $('#sentA').href = url; $('#sent').hidden = false;
    window.open(url, '_blank', 'noopener');
  });

  /* кнопки «оценить» в разделах подставляют случай в форму */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-preset]');
    if (!b) return;
    var p = b.dataset.preset;
    setKind(p === 'garage' ? 'garage' : 'car');
    if (p === 'crash') $('input[name=state][value="после ДТП"]').checked = true;
    var c = $('#cNote input[data-p=' + p + ']'); if (c) c.checked = true;
    var target = p === 'garage' ? $('#gPlace') : $('#cModel');
    form.scrollIntoView({ block: isMob() ? 'start' : 'center' });
    target.focus({ preventScroll: true });
  });

  /* ---------- галерея ---------- */
  var gBtns = $$('#gal .ph'), gMode = 'all', gOpen = false;
  $('#gN1').textContent = gBtns.length; $('#gN2').textContent = gBtns.filter(function (x) { return x.classList.contains('dm'); }).length;
  var gPer = function () { return isMob() ? 6 : window.innerWidth < 1001 ? 9 : 8; };
  function paintGal() {
    var list = gBtns.filter(function (x) { return gMode === 'all' || x.classList.contains('dm'); }), lim = gOpen ? 99 : gPer();
    gBtns.forEach(function (x) { x.hidden = true; });
    list.slice(0, lim).forEach(function (x) { x.hidden = false; });
    var m = $('#gMore'), left = list.length - lim;
    m.hidden = left <= 0; m.textContent = 'Показать ещё ' + left;
  }
  $('#gF').addEventListener('click', function (e) {
    var b = e.target.closest('[data-g]'); if (!b) return;
    gMode = b.dataset.g; gOpen = false;
    $$('#gF .chip').forEach(function (c) { c.setAttribute('aria-pressed', c === b); });
    paintGal();
  });
  $('#gMore').addEventListener('click', function () { gOpen = true; paintGal(); });
  paintGal();

  var dlg = $('#phD'), gI = 0;
  var visible = function () { return gBtns.filter(function (x) { return !x.hidden; }); };
  function showPh(i) {
    var v = visible(); gI = (i + v.length) % v.length;
    var b = v[gI];
    $('#phI').src = 'img/car/' + b.dataset.img + '.jpg'; $('#phI').alt = b.querySelector('img').alt; $('#phC').textContent = b.dataset.c;
  }
  $('#gal').addEventListener('click', function (e) {
    var b = e.target.closest('.ph'); if (!b) return;
    showPh(visible().indexOf(b));
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    document.documentElement.style.overflow = 'hidden';
  });
  dlg.addEventListener('close', function () { document.documentElement.style.overflow = ''; });
  dlg.addEventListener('click', function (e) {
    if (e.target === dlg || e.target.closest('[data-x]')) { dlg.close(); return; }
    var s = e.target.closest('[data-s]'); if (s) showPh(gI + +s.dataset.s);
  });
  addEventListener('keydown', function (e) {
    if (!dlg.open) return;
    if (e.key === 'ArrowLeft') showPh(gI - 1);
    if (e.key === 'ArrowRight') showPh(gI + 1);
  });

  /* ---------- отзывы ---------- */
  var rvs = $$('#rvs .rv'), rTh = 'all', rOpen = false;
  var hasTh = function (r, th) { return th === 'all' || (' ' + r.dataset.th + ' ').indexOf(' ' + th + ' ') >= 0; };
  ['all', 'price', 'money', 'calm'].forEach(function (th) { $('#rN-' + th).textContent = rvs.filter(function (r) { return hasTh(r, th); }).length; });
  var rPer = function () { return isMob() ? 5 : 99; };
  function paintRv() {
    var list = rvs.filter(function (r) { return hasTh(r, rTh); }), lim = rOpen ? 99 : rPer();
    rvs.forEach(function (r) { r.hidden = true; });
    list.slice(0, lim).forEach(function (r) { r.hidden = false; });
    var m = $('#rvMore'), left = list.length - lim;
    m.hidden = left <= 0; m.textContent = 'Показать ещё ' + left;
  }
  $('#rvF').addEventListener('click', function (e) {
    var b = e.target.closest('[data-th]'); if (!b) return;
    rTh = b.dataset.th; rOpen = false;
    $$('#rvF .chip').forEach(function (c) { c.setAttribute('aria-pressed', c === b); });
    paintRv();
  });
  $('#rvMore').addEventListener('click', function () { rOpen = true; paintRv(); });
  paintRv();

  var lastW = window.innerWidth;
  addEventListener('resize', function () { if (Math.abs(window.innerWidth - lastW) > 80) { lastW = window.innerWidth; paintGal(); paintRv(); } });
})();
