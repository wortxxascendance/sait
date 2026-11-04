/* Автозаказ28: каталог с Дрома, отзывы 2ГИС, сроки, заявка в WhatsApp. Данные — js/data.js (собирает custom-wip/avtozakaz28-blag/build.py) */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var num = function (n) { return Number(n).toLocaleString('ru-RU'); };
  var rub = function (n) { return num(n) + ' ₽'; };
  var WA = '79246780806';
  var waUrl = function (t) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t); };
  var CARS = window.CARS, RV = window.RV, TH = window.TH, TERMS = window.TERMS;
  var active = CARS.filter(function (c) { return !c.s; });
  var isMob = function () { return window.innerWidth < 641; };

  /* появление */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px' }) : null;
  $$('[data-rv]').forEach(function (el) { if (io) io.observe(el); else el.classList.add('on'); });

  /* счётчики */
  var N = { all: active.length, here: active.filter(function (c) { return c.w === 'here'; }).length, abroad: active.filter(function (c) { return c.w !== 'here'; }).length };
  $$('[data-n]').forEach(function (el) { el.textContent = N[el.dataset.n]; });

  /* открыто сейчас: время Благовещенска, UTC+9 */
  function paintStatus() {
    var n = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Yakutsk' })), h = n.getHours() + n.getMinutes() / 60;
    var on = h >= 9 && h < 18, t = on ? 'Открыто до 18:00' : (h < 9 ? 'Откроемся сегодня в 9:00' : 'Откроемся завтра в 9:00');
    $$('[data-status]').forEach(function (el) { el.textContent = t; el.classList.toggle('on', on); el.hidden = false; });
  }
  paintStatus(); setInterval(paintStatus, 60000);

  /* ---------- каталог ---------- */
  var name = function (c) { return c.mk + ' ' + c.md; };
  var COLORS = { 'черный': 'чёрный', 'зеленый': 'зелёный' };
  var km = function (c) { return c.nw ? 'новый' : num(c.km) + ' км'; };
  var spec = function (c) { return [km(c), (c.v ? c.v.replace('.', ',') + ' л' : '') + (c.hp ? ', ' + c.hp + ' л.с.' : ''), c.g, c.dr].filter(Boolean).join(' · '); };
  var whereTag = function (c) { return c.s ? 'Продана' : c.w === 'here' ? 'В Благовещенске' : c.w === 'cn' ? 'В Китае' : 'В Японии'; };
  var priceSub = function (c) {
    if (c.s) return 'Цена при продаже';
    if (c.w === 'here') return 'Цена в Благовещенске';
    if (c.w === 'cn') return 'Под ключ: Владивосток или Благовещенск';
    return 'Под ключ с доставкой до Владивостока';
  };
  var askText = function (c) { return 'Здравствуйте! Интересует ' + name(c) + ' ' + c.y + ' года за ' + num(c.p).replace(/ /g, ' ') + ' ₽ (с сайта). ' + (c.s ? 'Можете подобрать такую же?' : 'Она ещё в продаже?'); };
  var WA_I = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>';
  function card(c) {
    var i = CARS.indexOf(c);
    return '<article class="car"><button class="car-ph" type="button" data-open="' + i + '" aria-label="Подробнее: ' + esc(name(c)) + ' ' + c.y + '"><img src="img/car/' + c.id + '_m.jpg" alt="' + esc(name(c) + ' ' + c.y) + '" loading="lazy" width="640" height="480">'
      + '<span class="tag' + (c.s ? ' sold' : c.w !== 'here' ? ' jp' : '') + '">' + whereTag(c) + '</span>' + (c.gr ? '<span class="grd">' + esc(c.gr) + ' балла</span>' : '') + '</button>'
      + '<div class="car-b"><h3><button type="button" data-open="' + i + '">' + esc(name(c)) + ' <span>' + c.y + '</span></button></h3><p class="sp">' + esc(spec(c)) + '</p>'
      + '<div class="pr"><b>' + rub(c.p) + '</b><small>' + priceSub(c) + '</small></div>'
      + '<div class="car-a"><button class="btn" type="button" data-open="' + i + '">Подробнее</button><a class="btn btn-p" href="' + waUrl(askText(c)) + '" target="_blank" rel="noopener">' + WA_I + (c.s ? 'Хочу такую' : 'Спросить') + '</a></div></div></article>';
  }
  var fW = 'all', page = 0;
  var perPage = function () { return isMob() ? 6 : window.innerWidth < 1001 ? 8 : 12; };
  var WISH = '<div class="wish"><h3>Не нашли нужную?</h3><p>Подберём на аукционе под ваш бюджет и покажем аукционный лист.</p><a class="btn btn-p" href="#contacts">Подобрать машину</a><a class="btn" href="#calc">Посчитать под ключ</a></div>';
  function filtered() {
    var b = $('#fB').value, pv = $('#fP').value, p = pv.split('-').map(Number), s = $('#fS').value;
    var list = CARS.filter(function (c) {
      if (fW === 'here' && (c.w !== 'here' || c.s)) return false;
      if (fW === 'abroad' && (c.w === 'here' || c.s)) return false;
      if (b && c.b !== b) return false;
      if (pv && (c.p < p[0] || c.p > p[1])) return false;
      return true;
    });
    var cmp = { cheap: function (a, c) { return a.p - c.p; }, exp: function (a, c) { return c.p - a.p; }, 'new': function (a, c) { return c.y - a.y; }, km: function (a, c) { return a.km - c.km; } }[s];
    if (cmp) list = list.slice().sort(function (a, c) { return (a.s - c.s) || cmp(a, c); });
    return list;
  }
  function renderCars() {
    var list = filtered(), show = list.slice(0, (page + 1) * perPage());
    $('#carGrid').innerHTML = list.length ? show.map(card).join('') + (show.length === list.length ? WISH : '')
      : '<div class="empty"><p>С такими условиями машин сейчас нет, но мы можем привезти под заказ.</p><p style="margin-top:12px"><button class="btn" type="button" id="fReset">Сбросить фильтры</button> <a class="btn btn-p" href="#contacts">Подобрать машину</a></p></div>';
    var left = list.length - show.length, m = $('#carMore');
    m.hidden = left <= 0; m.textContent = 'Показать ещё ' + Math.min(left, perPage());
  }
  function setW(w) { fW = w; page = 0; $$('#fW .chip').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.w === w); }); renderCars(); }
  $('#fW').addEventListener('click', function (e) { var b = e.target.closest('[data-w]'); if (b) setW(b.dataset.w); });
  ['#fB', '#fP', '#fS'].forEach(function (s) { $(s).addEventListener('change', function () { page = 0; renderCars(); }); });
  $('#carMore').addEventListener('click', function () { page++; renderCars(); });
  renderCars();
  var lastW = window.innerWidth;
  addEventListener('resize', function () { if (Math.abs(window.innerWidth - lastW) > 80) { lastW = window.innerWidth; renderCars(); } });

  /* ---------- окно машины ---------- */
  var gal = { c: null, i: 0 };
  var galSrc = function (c, k) { return 'img/car/' + c.id + '_' + k + '.jpg'; };
  function showPhoto(k) {
    var c = gal.c; gal.i = (k + c.n) % c.n;
    var im = $('#galM'); im.src = galSrc(c, gal.i);
    im.alt = gal.i === c.sh ? 'Аукционный лист ' + name(c) : name(c) + ', фото ' + (gal.i + 1);
    $$('#galT button').forEach(function (b, j) { b.setAttribute('aria-current', j === gal.i); });
  }
  function openCar(c) {
    gal.c = c; gal.i = 0;
    var thumbs = '';
    for (var k = 0; k < c.n; k++) thumbs += '<button type="button" data-g="' + k + '" aria-label="' + (k === c.sh ? 'Аукционный лист' : 'Фото ' + (k + 1)) + '"><img src="' + galSrc(c, k) + '" alt="" loading="lazy">' + (k === c.sh ? '<span>Лист</span>' : '') + '</button>';
    var rows = [['Пробег', km(c) + (c.bp ? ', без пробега по РФ' : '')], ['Двигатель', [c.f, c.v ? c.v.replace('.', ',') + ' л' : '', c.hp ? c.hp + ' л.с.' : ''].filter(Boolean).join(', ')], ['Коробка', c.g], ['Привод', c.dr], ['Цвет', COLORS[c.c] || c.c], ['Руль', c.wh], ['Комплектация', c.tr], ['Оценка аукциона', c.gr ? c.gr + ' балла' : '']].filter(function (r) { return r[1]; });
    var call = '';
    if (!c.s && c.w !== 'here') call = '<p class="call"><b>' + (c.w === 'cn' ? 'Итоговая стоимость под ключ с доставкой во Владивосток или Благовещенск.' : 'Итоговая стоимость под ключ с доставкой до Владивостока.') + '</b> Цена конечная и не изменится, подпишем договор.' + (c.pk ? ' ' + esc(c.pk) + '.' : '') + '</p>';
    if (c.s) call = '<p class="call"><b>Эта машина уже продана.</b> Можем привезти такую же под заказ.</p>';
    $('#carB').innerHTML = '<div class="d-g"><div class="gal"><div class="gal-m"><img id="galM" src="' + galSrc(c, 0) + '" alt="' + esc(name(c)) + '">'
      + (c.n > 1 ? '<button class="p" type="button" data-step="-1" aria-label="Предыдущее фото">‹</button><button class="n" type="button" data-step="1" aria-label="Следующее фото">›</button>' : '') + '</div>'
      + '<div class="gal-t" id="galT">' + thumbs + '</div></div>'
      + '<div class="d-i"><h3>' + esc(name(c)) + ' ' + c.y + '</h3><div class="pr"><b>' + rub(c.p) + '</b><small>' + priceSub(c) + '</small></div>' + call
      + '<dl class="dl">' + rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl>'
      + (c.note.length ? '<ul class="d-n">' + c.note.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '')
      + '<div class="d-a"><a class="btn btn-p" href="' + waUrl(askText(c)) + '" target="_blank" rel="noopener">' + WA_I + (c.s ? 'Хочу такую же' : 'Спросить про эту машину') + '</a><a class="btn" href="tel:+79246780806">Позвонить: +7 924 678-08-06</a></div>'
      + '<p class="d-s"><a href="' + esc(c.url) + '" target="_blank" rel="noopener">Объявление на Дроме</a> от ' + esc(c.dt) + '</p></div></div>';
    showPhoto(0);
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

  /* ---------- сроки ---------- */
  var BK = [['до 3 недель', 0, 21], ['3–4 недели', 22, 29], ['месяц', 30, 32], ['1,5 месяца', 33, 47], ['2 месяца', 48, 60], ['3 месяца', 61, 90], ['3,5 месяца', 91, 120]];
  var DUR = { 14: '2 недели', 20: '20 дней', 21: '21 день', 26: '26 дней', 28: '4 недели', 29: 'меньше месяца', 30: 'месяц', 31: '31 день', 32: '32 дня', 39: '39 дней', 43: '43 дня', 45: '1,5 месяца', 55: 'почти 2 месяца', 58: 'меньше 2 месяцев', 60: '2 месяца', 90: '3 месяца', 105: '3,5 месяца' };
  var uTxt = function (t) { return (t[2] ? t[2] + ': ' : '') + t[3] + ' (отзыв ' + t[4] + ')'; };
  $('#chart').innerHTML = BK.map(function (b) {
    var rows = TERMS.map(function (t, i) { return [t, i]; }).filter(function (x) { return x[0][0] >= b[1] && x[0][0] <= b[2]; }).sort(function (a, c) { return a[0][1] - c[0][1]; });
    return '<div class="col"><div class="n">' + rows.length + '</div><div class="stack">' + rows.map(function (x) { return '<button type="button" class="u' + (x[0][1] ? ' s' : '') + '" data-u="' + x[1] + '" aria-label="' + esc(uTxt(x[0])) + '"></button>'; }).join('') + '</div></div>';
  }).join('');
  $('#chartX').innerHTML = BK.map(function (b) { return '<span>' + b[0] + '</span>'; }).join('');
  function pickU(el) { $$('.u.on').forEach(function (u) { u.classList.remove('on'); }); el.classList.add('on'); $('#tCap').textContent = uTxt(TERMS[+el.dataset.u]); }
  ['mouseover', 'focusin', 'click'].forEach(function (ev) { $('#chart').addEventListener(ev, function (e) { var u = e.target.closest('.u'); if (u) pickU(u); }); });
  $('#tBody').innerHTML = TERMS.slice().sort(function (a, c) { return a[0] - c[0]; }).map(function (t) { return '<tr><td>' + DUR[t[0]] + (t[1] ? ', санкц.' : '') + '</td><td>' + esc(t[2] || '—') + '</td><td>' + esc(t[3]) + '</td><td>' + t[4] + '</td></tr>'; }).join('');

  /* ---------- клиенты ---------- */
  var MON = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
  var when = function (d) { return MON[+d.slice(5) - 1] + ' ' + d.slice(0, 4); };
  var withPh = RV.map(function (r, i) { return i; }).filter(function (i) { return RV[i].img; }).sort(function (a, c) { return (RV[c].bo - RV[a].bo) || (a - c); });
  $('#wall').innerHTML = withPh.slice(0, 32).map(function (i) {
    var r = RV[i];
    return '<button type="button" data-rv-open="' + i + '" aria-label="Отзыв: ' + esc(r.a) + (r.m ? ', ' + esc(r.m) : '') + '"><img src="img/rv/' + r.img + '_t.jpg" alt="' + esc(r.m ? 'Машина клиента: ' + r.m : 'Машина клиента Автозаказ28') + '" loading="lazy" width="440" height="330"></button>';
  }).join('');
  var rvTh = 'all', rvPage = 0;
  var rvPer = function () { return isMob() ? 4 : window.innerWidth < 1001 ? 6 : 9; };
  $('#rvF').innerHTML = '<button class="chip" type="button" data-th="all" aria-pressed="true">Все<small>' + RV.length + '</small></button>' + TH.map(function (t) { return '<button class="chip" type="button" data-th="' + t[0] + '" aria-pressed="false">' + esc(t[1]) + '<small>' + t[2] + '</small></button>'; }).join('');
  function rvList() {
    var l = RV.map(function (r, i) { return i; });
    if (rvTh !== 'all') l = l.filter(function (i) { return RV[i].th.indexOf(rvTh) >= 0; });
    // сначала содержательные: длинный текст и фото
    return l.sort(function (a, c) { return ((RV[c].x.length > 60) - (RV[a].x.length > 60)) || ((RV[c].img ? 1 : 0) - (RV[a].img ? 1 : 0)) || (a - c); });
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
    $('#rvB').innerHTML = (r.img ? '<img src="img/rv/' + r.img + '.jpg" alt="' + esc(r.m ? 'Машина клиента: ' + r.m : 'Машина клиента') + '">' : '') + '<div class="rv-d"><small><b style="color:var(--ink)">' + esc(r.a) + '</b>, ' + when(r.d) + (r.m ? ', ' + esc(r.m) : '') + ' · отзыв в 2ГИС</small><p>' + esc(r.t) + '</p></div>';
    openDlg($('#rvD'));
  }

  /* ---------- общие клики ---------- */
  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-open]'); if (o) { openCar(CARS[+o.dataset.open]); return; }
    var g = e.target.closest('[data-g]'); if (g) { showPhoto(+g.dataset.g); return; }
    var st = e.target.closest('[data-step]'); if (st) { showPhoto(gal.i + +st.dataset.step); return; }
    var r = e.target.closest('[data-rv-open]'); if (r) { openRv(+r.dataset.rvOpen); return; }
    var go = e.target.closest('[data-go]'); if (go) { setW(go.dataset.go); return; }
    if (e.target.id === 'fReset') { $('#fB').value = ''; $('#fP').value = ''; $('#fS').value = ''; setW('all'); }
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
  $('#lOk').addEventListener('change', function () { bad('lOk', ''); });
  $('#leadForm').addEventListener('submit', function (e) {
    e.preventDefault();
    $('#sent').hidden = true;
    var first = null;
    Object.keys(F).forEach(function (id) { var el = $('#' + id); if (!el.value.trim()) { bad(id, F[id]); first = first || el; } });
    if (!$('#lOk').checked) { bad('lOk', 'Нужно согласие, чтобы отправить заявку'); first = first || $('#lOk'); }
    if (first) { first.focus(); return; }
    var t = 'Здравствуйте! Меня зовут ' + $('#lName').value.trim() + '.\nИщу: ' + $('#lWhat').value.trim() + ($('#lTrade').checked ? '\nЕсть машина, хочу сдать её в зачёт.' : '') + '\nПодскажите варианты, пожалуйста.';
    var url = waUrl(t);
    $('#sentA').href = url; $('#sent').hidden = false;
    window.open(url, '_blank', 'noopener');
  });
})();
