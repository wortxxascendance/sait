/* Japan Auto Import: линия маршрута, выдачи и отзывы 2ГИС, сроки, заявка в WhatsApp. Данные — js/data.js (собирает custom-wip/japanautoimport-yaku/build.py) */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var WA = '79142949400';
  var waUrl = function (t) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t); };
  var RV = window.RV, SHOW = window.SHOW, TH = window.TH, TERMS = window.TERMS;
  var isMob = function () { return window.innerWidth < 641; };
  var MON = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
  var when = function (d) { return MON[+d.slice(5) - 1] + ' ' + d.slice(0, 4); };
  var byI = {}; RV.forEach(function (r) { byI[r.i] = r; });

  /* готовый текст в ссылках WhatsApp */
  $$('[data-wa]').forEach(function (a) { a.href = waUrl(a.dataset.wa); });

  /* появление */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px' }) : null;
  $$('[data-rv]').forEach(function (el) { if (io) io.observe(el); else el.classList.add('on'); });

  /* открыто сейчас: время Якутска, в воскресенье по записи */
  function paintStatus() {
    var n = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Yakutsk' })), h = n.getHours() + n.getMinutes() / 60, day = n.getDay();
    var on = h >= 10 && h < 19, t;
    if (day === 0) { t = 'Сегодня по предварительной записи'; on = false; }
    else if (on) t = 'Открыто до 19:00';
    else if (h < 10) t = 'Откроемся сегодня в 10:00';
    else t = day === 6 ? 'В воскресенье по предварительной записи' : 'Откроемся завтра в 10:00';
    $$('[data-status]').forEach(function (el) { el.textContent = t; el.classList.toggle('on', on); el.hidden = false; });
  }
  paintStatus(); setInterval(paintStatus, 60000);

  /* ---------- линия ---------- */
  var stops = $$('.stop');
  stops.forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true';
      if (open && !isMob()) return;                 // на широком экране всегда открыта одна остановка
      stops.forEach(function (x) { x.setAttribute('aria-expanded', 'false'); $('#' + x.getAttribute('aria-controls')).hidden = true; });
      if (open) return;                             // на телефоне вторым нажатием сворачивается
      b.setAttribute('aria-expanded', 'true');
      $('#' + b.getAttribute('aria-controls')).hidden = false;
      if (isMob()) b.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
  });

  /* ---------- выдачи ---------- */
  var vAll = false;
  var vPer = function () { return isMob() ? 5 : 9; };
  function renderV() {
    var l = vAll ? SHOW : SHOW.slice(0, vPer());
    $('#vgrid').innerHTML = l.map(function (s, k) {
      var r = byI[s.r];
      return '<article class="v' + (k === 0 ? ' v-big' : '') + '"><button class="v-ph" type="button" data-rv-open="' + s.r + '" aria-label="Отзыв: ' + esc(s.m) + '"><img src="img/v/' + s.p + '_t.jpg" alt="' + esc(s.m) + ', снимок клиента" width="560" height="420" loading="lazy"></button><h3>' + esc(s.m) + '</h3><p>«' + esc(s.q) + '»' + (s.qt ? '<span class="tr">Перевод: ' + esc(s.qt) + '</span>' : '') + '</p><p style="color:var(--mut);font-size:14.5px">' + esc(r.a) + ', ' + when(r.d) + '</p></article>';
    }).join('');
    $('#vMore').hidden = vAll;
    $('#vMore').textContent = 'Показать все выдачи (' + SHOW.length + ')';
  }
  $('#vMore').addEventListener('click', function () { vAll = true; renderV(); });
  renderV();

  /* ---------- сроки ---------- */
  var plural = function (n) { var a = n % 10, b = n % 100; return a === 1 && b !== 11 ? 'день' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'дня' : 'дней'; };
  var dur = function (t) { return t[0] === 30 ? 'месяц' : t[0] === 29 ? 'до месяца' : t[0] + ' ' + plural(t[0]); };
  $('#tlist').innerHTML = TERMS.map(function (t) {
    var r = byI[t[5]], y = t[1] === 'пришла', pct = Math.round(t[0] / 45 * 100);
    return '<li><div class="tn">' + dur(t) + '</div><div><div class="tbar"><i class="' + (y ? 'y' : '') + '" style="width:' + pct + '%"></i></div><div class="tq">' + (t[2] ? '<b>' + esc(t[2]) + '.</b> ' : '') + '«' + esc(t[3]) + '»' + (t[4] ? ' <span>Перевод: ' + esc(t[4]) + '.</span>' : '') + ' <span>' + esc(r.a) + ', ' + when(r.d) + '</span></div></div></li>';
  }).join('');

  /* ---------- махтал ---------- */
  $('#mah').innerHTML = [19, 38, 30, 27, 46, 40].map(function (i) {
    var r = byI[i];
    return '<article class="mh"><p class="o" lang="sah">' + esc(r.t) + '</p><p class="t"><span class="tag-t">Перевод</span>' + esc(r.tr) + '</p><span class="who">' + esc(r.a) + ', ' + when(r.d) + '</span></article>';
  }).join('');

  /* ---------- отзывы ---------- */
  var rvTh = 'all', rvPage = 0;
  var rvPer = function () { return isMob() ? 4 : window.innerWidth < 1001 ? 6 : 9; };
  var cut = function (t) { if (t.length <= 230) return t; return t.slice(0, 226).replace(/\s+\S*$/, '').replace(/[ ,;:—-]+$/, '') + '…'; };
  $('#rvF').innerHTML = '<button class="chip" type="button" data-th="all" aria-pressed="true">Все<small>' + RV.length + '</small></button>' + TH.map(function (t) { return '<button class="chip" type="button" data-th="' + t[0] + '" aria-pressed="false">' + esc(t[1]) + '<small>' + t[2] + '</small></button>'; }).join('');
  function rvList() {
    var l = RV.filter(function (r) { return rvTh === 'all' || r.th.indexOf(rvTh) >= 0; });
    return l.slice().sort(function (a, c) { return ((c.t.length > 45) - (a.t.length > 45)) || (c.d < a.d ? -1 : c.d > a.d ? 1 : 0); });
  }
  function renderRv() {
    var l = rvList(), s = l.slice(0, (rvPage + 1) * rvPer());
    $('#rvs').innerHTML = s.map(function (r) {
      var x = cut(r.t), sa = !!r.tr;
      return '<article class="rv"><div class="rv-w"><b>' + esc(r.a) + '</b>, ' + when(r.d) + '</div><p' + (sa ? ' lang="sah"' : '') + '>' + esc(x) + '</p>' + (sa ? '<p class="tr">' + esc(cut(r.tr)) + '</p>' : '') + (x.length < r.t.length || (sa && r.tr.length > 230) ? '<button type="button" data-rv-open="' + r.i + '">Читать весь отзыв</button>' : '') + '</article>';
    }).join('');
    var left = l.length - s.length, m = $('#rvMore'); m.hidden = left <= 0; m.textContent = 'Показать ещё отзывы (' + left + ')';
  }
  $('#rvF').addEventListener('click', function (e) { var b = e.target.closest('[data-th]'); if (!b) return; rvTh = b.dataset.th; rvPage = 0; $$('#rvF .chip').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); renderRv(); });
  $('#rvMore').addEventListener('click', function () { rvPage++; renderRv(); });
  renderRv();

  /* окно отзыва */
  var dlgFrom = null;
  function openRv(i) {
    var r = byI[i], s = SHOW.filter(function (x) { return x.r === i; })[0];
    $('#rvB').innerHTML = (s ? '<img src="img/v/' + s.p + '.jpg" alt="' + esc(s.m) + ', снимок клиента">' : '') + '<div class="rv-d"><small><b style="color:var(--ink)">' + esc(r.a) + '</b>, ' + when(r.d) + (s ? ', ' + esc(s.m) : '') + ' · отзыв в 2ГИС</small><p' + (r.tr ? ' lang="sah"' : '') + '>' + esc(r.t) + '</p>' + (r.tr ? '<p class="tr"><span class="tag-t">Перевод</span>' + esc(r.tr) + '</p>' : '') + '<a class="btn btn-p" target="_blank" rel="noopener" href="' + waUrl('Здравствуйте! Видел на сайте ' + (s ? esc(s.m) + ' из отзыва' : 'отзыв клиента') + '. Хочу заказать похожую машину.') + '">Хочу так же</a></div>';
    dlgFrom = document.activeElement;
    var d = $('#rvD'); if (d.showModal) d.showModal(); else d.setAttribute('open', '');
  }
  function closeDlg() { var d = $('#rvD'); if (d.close) d.close(); else d.removeAttribute('open'); if (dlgFrom && dlgFrom.focus) dlgFrom.focus(); }
  $('#rvD').addEventListener('click', function (e) { if (e.target === this || e.target.closest('[data-close]')) closeDlg(); });
  document.addEventListener('click', function (e) {
    var r = e.target.closest('[data-rv-open]'); if (r) { openRv(+r.dataset.rvOpen); return; }
    var w = e.target.closest('[data-way]');
    if (w) {
      var x = $('input[name="lWay"][value="' + w.dataset.way + '"]'); if (x) x.checked = true;
      $('#contacts').scrollIntoView();
      setTimeout(function () { $('#lWhat').focus({ preventScroll: true }); }, 500);
    }
  });

  /* ---------- калькулятор: свой пример по стране, пока человек не ввёл своё ---------- */
  var setR = function (n, v) { var x = $('input[name="' + n + '"][value="' + v + '"]'); if (x) x.checked = true; };
  var EX = { JP: ['1 500 000', '1490', '120', 'Пример: 1 500 000 ¥, 1,5 л, 120 л.с. Впишите свою ставку'], CN: ['100 000', '1497', '150', 'Пример: 100 000 юаней, 1,5 л, 150 л.с. Впишите цену продавца'] };
  var exMode = true;
  function example(c) { var e = EX[c]; if (!e) return; setR('age', '3to5'); $('#price').value = e[0]; $('#cc').value = e[1]; $('#hp').value = e[2]; $('#price-h').textContent = e[3]; $('#hp').dispatchEvent(new Event('input', { bubbles: true })); }
  ['#price', '#cc', '#hp'].forEach(function (s) { $(s).addEventListener('input', function (e) { if (e.isTrusted) exMode = false; }); });
  document.addEventListener('change', function (e) { if (e.target.name === 'country' && exMode) example(e.target.value); });
  example('JP');

  /* ---------- заявка: ошибка после ухода из поля, кнопка всегда активна ---------- */
  var F = { lWhat: 'Напишите, какую машину ищете', lName: 'Напишите, как к вам обращаться' };
  function bad(id, msg) { var el = $('#' + id), er = $('#' + id + '-e'); el.setAttribute('aria-invalid', msg ? 'true' : 'false'); er.hidden = !msg; er.textContent = msg || ''; }
  Object.keys(F).forEach(function (id) {
    var el = $('#' + id);
    el.addEventListener('blur', function () { if (el.dataset.touched && !el.value.trim()) bad(id, F[id]); });
    el.addEventListener('input', function () { el.dataset.touched = '1'; bad(id, ''); });
    el.addEventListener('focus', function () { bad(id, ''); });
  });
  $('#lOk').addEventListener('change', function () { bad('lOk', ''); });
  $('#leadForm').addEventListener('submit', function (e) {
    e.preventDefault();
    $('#sent').hidden = true;
    var first = null;
    Object.keys(F).forEach(function (id) { var el = $('#' + id); if (!el.value.trim()) { bad(id, F[id]); first = first || el; } });
    if (!$('#lOk').checked) { bad('lOk', 'Нужно согласие, чтобы отправить заявку'); first = first || $('#lOk'); }
    if (first) { first.focus(); return; }
    var way = ($('input[name="lWay"]:checked') || {}).value || '';
    var t = 'Здравствуйте! Меня зовут ' + $('#lName').value.trim() + '.\nИщу: ' + $('#lWhat').value.trim() + (way ? '\nДоставка из Владивостока: ' + way.toLowerCase() + '.' : '') + '\nПодскажите варианты, пожалуйста.';
    var url = waUrl(t);
    $('#sentA').href = url; $('#sent').hidden = false;
    window.open(url, '_blank', 'noopener');
  });
})();
