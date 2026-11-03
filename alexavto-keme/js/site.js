/* AlexAvto: доска сделок (window.DEALS — посты t.me/alex_avto42), отзывы (window.REVIEWS — 2ГИС), анимации, заявка. */
(function () {
  var $ = function (s) { return document.getElementById(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var D = window.DEALS || [], RV = window.REVIEWS || [];
  var CUR = { JPY: 'иены', CNY: 'юаня', USD: 'доллара', KRW: 'воны', EUR: 'евро' };
  var CTRY = { JP: 'Япония', KR: 'Корея', CN: 'Китай' };
  var rub = function (v) { return Math.round(v).toLocaleString('ru-RU') + ' ₽'; };
  var num = function (v) { return String(v).replace('.', ','); };

  /* шапка и меню (на телефоне и планшете) */
  var hd = $('hd'), mb = $('menuBtn');
  addEventListener('scroll', function () { hd.classList.toggle('sc', scrollY > 20); }, { passive: true });
  var menu = function (on) { hd.classList.toggle('open', on); mb.setAttribute('aria-expanded', on); };
  mb.addEventListener('click', function () { menu(!hd.classList.contains('open')); });
  $('mnav').addEventListener('click', function (e) { if (e.target.closest('a')) menu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && hd.classList.contains('open')) { menu(false); mb.focus(); } });
  $('dealsN').textContent = D.length;

  /* ---------- доска сделок ---------- */
  var BUDGET = [['all', 'Все', function () { return true; }], ['1', 'до 1 млн', function (p) { return p < 1e6; }], ['15', '1–1,5 млн', function (p) { return p >= 1e6 && p < 1.5e6; }],
    ['2', '1,5–2 млн', function (p) { return p >= 1.5e6 && p < 2e6; }], ['2+', 'от 2 млн', function (p) { return p >= 2e6; }]];
  var STATUS = function (d) {
    if (d.status === 'handed') return ['Передан владельцу', 'done'];
    if (d.status === 'customs') return ['Прошёл таможню', ''];
    return [d.port ? 'В порту ' + d.port.charAt(0) + d.port.slice(1).toLowerCase() : 'Куплен на аукционе', ''];
  };
  var where = function (d) { return d.where === 'Уссурийске' ? 'в Уссурийске' : 'во Владивостоке'; };
  // на телефоне сделки — лента со свайпом, показываем все сразу
  var phone = matchMedia('(max-width: 640px)');
  var filter = 'all', showAll = phone.matches, FIRST = 9;
  phone.addEventListener && phone.addEventListener('change', function (e) { showAll = e.matches; renderDeals(); });

  /* последняя сделка на первом экране и бегущая строка */
  if (D[0]) {
    var L = D[0], ls = STATUS(L);
    $('latest').innerHTML = '<img src="' + esc(L.img) + '" alt="' + esc(L.model) + '" width="132" height="100">'
      + '<div><span class="cap"><i></i>Последняя сделка</span><b>' + esc(L.model + ' ' + (L.year || '')) + '</b>'
      + '<span>' + esc(ls[0]) + ' · ' + esc([L.vol ? num(L.vol) + ' л' : '', L.hp ? L.hp + ' л.с.' : ''].filter(Boolean).join(' · ')) + '</span>'
      + '<strong>≈ ' + rub(L.price) + '</strong></div>';
  }
  var tkItem = function (d) { return '<span><i></i><b>' + esc(d.model + ' ' + (d.year || '')) + '</b>' + esc(STATUS(d)[0].toLowerCase()) + ' · ≈ ' + rub(d.price) + '</span>'; };
  var tkRow = D.slice(0, 14).map(tkItem).join('');
  $('tk').innerHTML = tkRow + tkRow; // дважды — для бесшовной прокрутки
  function card(d, k) {
    var st = STATUS(d);
    var spec = [d.year, d.vol ? num(d.vol) + ' л' : '', d.hp ? d.hp + ' л.с.' : '', d.km ? d.km.toLocaleString('ru-RU') + ' км' : '', d.drive, CTRY[d.country]].filter(Boolean);
    var fx = d.rate ? 'курс ' + (CUR[d.cur] || '') + ' ' + num(d.rate) + ' на день оплаты' : '';
    return '<article class="deal" data-rv data-k="' + k + '">'
      + '<div class="ph"><img src="' + esc(d.img) + '" alt="' + esc(d.model + ' ' + (d.year || '')) + '" loading="lazy" width="1000" height="750">'
      + '<span class="pill ' + st[1] + '"><i></i>' + esc(st[0]) + '</span>' + (d.grade ? '<span class="grade">Аукцион ' + num(d.grade) + '</span>' : '') + '</div>'
      + '<div class="deal-b"><h3>' + esc(d.model) + '</h3><div class="trim">' + esc(d.trim || '') + '</div>'
      + '<div class="spec">' + spec.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>'
      + '<div class="price"><small>' + (d.estimate ? 'Ориентир ' : 'Итог ') + where(d) + '</small><b>≈ ' + rub(d.price) + '</b>'
      + '<span class="fx">' + esc([fx, d.city ? 'клиент из ' + d.city : ''].filter(Boolean).join(' · ')) + '</span></div>'
      + '<div class="deal-acts"><button class="btn" type="button" data-calc="' + k + '">Посчитать такую</button><a class="src" href="' + esc(d.post) + '" target="_blank" rel="noopener">Пост</a></div>'
      + '</div></article>';
  }
  function renderDeals() {
    var test = BUDGET.filter(function (b) { return b[0] === filter; })[0][2];
    var list = D.map(function (d, k) { return [d, k]; }).filter(function (x) { return test(x[0].price); });
    var shown = showAll ? list : list.slice(0, FIRST);
    $('dealsList').innerHTML = shown.map(function (x) { return card(x[0], x[1]); }).join('');
    $('more').hidden = showAll || list.length <= FIRST;
    $('moreBtn').textContent = 'Показать все ' + list.length;
    reveal(); tilt();
  }
  $('filters').innerHTML = BUDGET.map(function (b) {
    var n = D.filter(function (d) { return b[2](d.price); }).length;
    return n ? '<button class="chip" type="button" data-f="' + b[0] + '" aria-pressed="' + (b[0] === 'all') + '">' + b[1] + '<small>' + n + '</small></button>' : '';
  }).join('');
  $('filters').addEventListener('click', function (e) {
    var b = e.target.closest('[data-f]'); if (!b) return;
    filter = b.dataset.f; showAll = false;
    this.querySelectorAll('.chip').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    renderDeals();
  });
  $('moreBtn').addEventListener('click', function () { showAll = true; renderDeals(); });

  /* «Посчитать такую»: страна, возраст, объём, мощность — в калькулятор; цену лота клиент вводит сам */
  var ageOf = function (y) { var t = (Date.now() - new Date(y + '-07-01')) / (365.25 * 864e5); return t < 3 ? 'lt3' : t < 5 ? '3to5' : t < 7 ? '5to7' : 'gt7'; };
  $('dealsList').addEventListener('click', function (e) {
    var b = e.target.closest('[data-calc]'); if (!b) return;
    var d = D[+b.dataset.calc];
    var set = function (n, v) { var x = document.querySelector('input[name="' + n + '"][value="' + v + '"]'); if (x) x.checked = true; };
    set('country', d.country || 'JP'); if (d.year) set('age', ageOf(d.year)); set('engine', 'ice'); set('who', 'fiz');
    $('cur').value = d.cur || (window.CONFIG.costs[d.country || 'JP'] || {}).cur || 'JPY';
    if (d.vol) $('cc').value = Math.round(d.vol * 1000);
    if (d.hp) $('hp').value = d.hp;
    $('price').value = '';
    $('price-h').textContent = d.model + ' ' + (d.year || '') + ': введите цену лота — остальное уже подставили';
    $('hp').dispatchEvent(new Event('input', { bubbles: true }));
    $('calc').scrollIntoView({ behavior: still ? 'auto' : 'smooth' });
    setTimeout(function () { try { $('price').focus({ preventScroll: true }); } catch (err) { /* старые браузеры */ } }, still ? 0 : 700);
  });

  /* ---------- отзывы ---------- */
  var dt = function (s) { return new Date(s + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }); };
  var cut = function (t) { return t.length > 260 ? t.slice(0, t.lastIndexOf(' ', 250)) + '…' : t; };
  $('revs').innerHTML = RV.map(function (r) {
    return '<figure class="rev" data-rv><div><div class="stars" aria-label="5 из 5">★★★★★</div><q>' + esc(cut(r.text)) + '</q></div>'
      + '<footer><b>' + esc(r.name) + '</b>' + dt(r.date) + ' · 2ГИС</footer></figure>';
  }).join('');

  /* ---------- появление, линии маршрута и этапов ---------- */
  var io = 'IntersectionObserver' in window && !still ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add(e.target.hasAttribute('data-rv') ? 'in' : 'on'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }) : null;
  function reveal() {
    document.querySelectorAll('[data-rv]:not(.in)').forEach(function (el, i) {
      if (!io) { el.classList.add('in'); return; }
      el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el);
    });
  }
  [$('route'), $('steps')].forEach(function (el) { if (io) io.observe(el); else el.classList.add('on'); });

  /* ---------- параллакс фона первого экрана ---------- */
  if (!still) {
    var bg = $('heroBg'), tick = false;
    addEventListener('scroll', function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () { bg.style.transform = 'translate3d(0,' + Math.min(scrollY, innerHeight) * 0.3 + 'px,0)'; tick = false; });
    }, { passive: true });
  }

  /* ---------- карточки чуть наклоняются за курсором ---------- */
  function tilt() {
    if (still || !matchMedia('(hover: hover)').matches) return;
    document.querySelectorAll('.deal').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateX(' + (-y * 4).toFixed(2) + 'deg) rotateY(' + (x * 5).toFixed(2) + 'deg) translateY(-4px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }
  renderDeals();

  /* калькулятор не пустой: пример — машина из свежей сделки и условная цена лота (помечено как пример) */
  if (!$('price').value && D[0] && D[0].country === 'JP') {
    var x = D[0], pick = function (n, v) { var el = document.querySelector('input[name="' + n + '"][value="' + v + '"]'); if (el) el.checked = true; };
    pick('country', 'JP'); pick('age', ageOf(x.year)); pick('engine', 'ice'); pick('who', 'fiz');
    $('cur').value = 'JPY'; $('cc').value = Math.round(x.vol * 1000); $('hp').value = x.hp; $('price').value = '1500000';
    $('price').dispatchEvent(new Event('input', { bubbles: true }));
    $('price-h').textContent = 'Пример: ' + x.model + ' ' + x.year + ' и цена лота 1 500 000 ¥ — подставьте свою машину';
  }

  /* ---------- заявка на подбор: ошибка после ухода из поля, кнопки всегда активны ---------- */
  var m = $('pModel'), me = $('pModel-e');
  var bad = function (on) { m.setAttribute('aria-invalid', on ? 'true' : 'false'); me.hidden = !on; me.textContent = on ? 'Напишите марку и модель, например Honda Freed' : ''; };
  m.addEventListener('blur', function () { if (m.value.trim() && m.value.trim().length < 2) bad(true); });
  m.addEventListener('focus', function () { bad(false); });
  m.addEventListener('input', function () { bad(false); });
  ['pYear', 'pBudget'].forEach(function (id) {
    $(id).addEventListener('input', function () { var d = this.value.replace(/\D/g, ''); this.value = id === 'pBudget' && d ? (+d).toLocaleString('ru-RU') : d.slice(0, 4); });
  });
  var toast = function (t) { var x = $('toast'); x.textContent = t; x.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { x.classList.remove('on'); }, 3500); };
  $('pick').addEventListener('submit', function (e) {
    e.preventDefault();
    if (m.value.trim().length < 2) { m.focus({ preventScroll: true }); bad(true); m.scrollIntoView({ block: 'center', behavior: still ? 'auto' : 'smooth' }); return; }
    var y = $('pYear').value, b = $('pBudget').value;
    var txt = 'Здравствуйте! Хочу подобрать автомобиль: ' + m.value.trim() + (y ? ', год от ' + y : '') + (b ? ', бюджет под ключ до ' + b + ' ₽' : '') + '.';
    if (e.submitter && e.submitter.dataset.ch === 'tg') {
      var go = function () { window.open('https://t.me/alexavto42', '_blank', 'noopener'); };
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { toast('Текст заявки скопирован — вставьте его в чат'); go(); }, go); else go();
    } else window.open('https://wa.me/79027554040?text=' + encodeURIComponent(txt), '_blank', 'noopener');
  });
})();
