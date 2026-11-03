/* Асгард Авто: машины с площадки (window.CARS), калькулятор обмена и кредита, кейсы, покупатели и отзывы из 2ГИС, меню, появление блоков. */
(function () {
  var $ = function (s) { return document.getElementById(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CARS = window.CARS || [], CS = window.CASES || [], RV = window.REVIEWS || [];
  var WA = '79133363460';
  var rub = function (v) { return Math.round(v).toLocaleString('ru-RU') + ' ₽'; };
  var wa = function (t) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t); };
  var dt = function (s) { return new Date(s + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }); };

  /* шапка и меню */
  var hd = $('hd'), mb = $('menuBtn');
  addEventListener('scroll', function () { hd.classList.toggle('sc', scrollY > 20); }, { passive: true });
  var menu = function (on) { hd.classList.toggle('open', on); mb.setAttribute('aria-expanded', on); };
  mb.addEventListener('click', function () { menu(!hd.classList.contains('open')); });
  $('mnav').addEventListener('click', function (e) { if (e.target.closest('a')) menu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && hd.classList.contains('open')) { menu(false); mb.focus(); } });

  /* ---------- машины с площадки ---------- */
  var KINDS = [['all', 'Все'], ['sedan', 'Седаны'], ['hatch', 'Хэтчбеки'], ['suv', 'Внедорожники'], ['van', 'Минивэны и бусы']];
  var count = function (k) { return CARS.filter(function (c) { return k === 'all' || c.kind === k; }).length; };
  $('filters').innerHTML = KINDS.filter(function (k) { return count(k[0]); }).map(function (k, i) {
    return '<button type="button" data-k="' + k[0] + '" aria-pressed="' + (i === 0) + '">' + k[1] + '<small>' + count(k[0]) + '</small></button>';
  }).join('');
  $('carsList').innerHTML = CARS.map(function (c) {
    return '<article class="car" data-kind="' + c.kind + '" data-rv>'
      + '<div class="ph"><img src="' + esc(c.img) + '" alt="' + esc(c.model) + ' на площадке Асгард Авто" loading="lazy"><span class="tag">Фото с площадки</span></div>'
      + '<div class="car-b"><h3>' + esc(c.model) + '</h3><span class="body">' + esc(c.body) + '</span>'
      + '<div class="price"><span>Цена и пробег</span><b>по запросу</b></div>'
      + '<div class="car-acts"><a class="btn btn-y" href="' + wa('Здравствуйте! Интересует ' + c.model + ' с вашей площадки. Ещё в продаже? Какая цена и пробег?') + '" target="_blank" rel="noopener">Узнать цену</a>'
      + '<a class="btn" href="' + wa('Здравствуйте! Ищу похожую на ' + c.model + '. Что есть сейчас?') + '" target="_blank" rel="noopener">Похожие</a></div></div></article>';
  }).join('')
    + '<div class="more-car" data-rv><div><h3>Не нашли свою?</h3><p>Напишите марку и бюджет — подберём из того, что есть на площадке, или найдём под заказ.</p></div>'
    + '<a class="btn btn-y" href="' + wa('Здравствуйте! Ищу машину. Марка/модель: , бюджет: ') + '" target="_blank" rel="noopener">Подобрать машину</a></div>';
  $('filters').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    $('filters').querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    var k = b.dataset.k;
    document.querySelectorAll('.car').forEach(function (el) { el.hidden = !(k === 'all' || el.dataset.kind === k); el.classList.add('in'); });
  });

  /* ---------- калькулятор: обмен и кредит ---------- */
  var mode = 'ti', term = 36, TERMS = [12, 24, 36, 48, 60];
  $('cTerm').innerHTML = TERMS.map(function (t) { return '<button type="button" data-t="' + t + '" aria-pressed="' + (t === term) + '">' + t + ' мес</button>'; }).join('');
  var num = function (id) { var v = parseFloat(String($(id).value).replace(/\s/g, '').replace(',', '.')); return isFinite(v) && v > 0 ? v : 0; };
  var fmt = function (el) { var v = num(el.id); if (v && el.id !== 'cRate') el.value = Math.round(v).toLocaleString('ru-RU'); };
  var row = function (a, b) { return '<tr><td>' + a + '</td><td>' + b + '</td></tr>'; };
  function render() {
    var big = $('rBig'), text;
    if (mode === 'ti') {
      var t = num('tTarget'), m = num('tMine'), d = t - m;
      big.classList.toggle('y', d < 0);
      if (!t || !m) { $('rK').textContent = 'Доплата'; big.textContent = '—'; $('rSub').textContent = 'Введите обе суммы'; $('rRows').innerHTML = ''; }
      else {
        $('rK').textContent = d > 0 ? 'Доплата' : d < 0 ? 'Доплатим вам' : 'Обмен без доплаты';
        big.textContent = d === 0 ? '0 ₽' : rub(Math.abs(d));
        $('rSub').textContent = d > 0 ? 'Остальное покроет ваша машина' : d < 0 ? 'Ваша машина дороже выбранной' : 'Суммы совпали';
        $('rRows').innerHTML = row('Машина, которую хотите', rub(t)) + row('Ваша машина в зачёт', '− ' + rub(m));
      }
      $('rNote').textContent = 'Расчёт ориентировочный и не является офертой. Точную сумму назовём после осмотра вашего автомобиля.';
      text = 'Здравствуйте! Хочу обмен (trade-in). Машина, которую хочу: ' + rub(t) + '. Моя машина, по-моему, стоит ' + rub(m) + '. Доплата по расчёту на сайте: ' + rub(Math.max(d, 0)) + '. Когда можно приехать на оценку?';
    } else {
      var p = num('cPrice'), f = Math.min(num('cFirst'), p), r = num('cRate'), s = p - f, i = r / 1200;
      var pay = s > 0 ? (i ? s * i / (1 - Math.pow(1 + i, -term)) : s / term) : 0;
      big.classList.remove('y');
      $('rK').textContent = 'Ежемесячный платёж';
      big.textContent = s > 0 ? '≈ ' + rub(pay) : '—';
      $('rSub').textContent = s > 0 ? 'на ' + term + ' мес · ставка ' + String(r).replace('.', ',') + '% — пример' : 'Взнос покрывает всю цену';
      $('rRows').innerHTML = row('Цена автомобиля', rub(p)) + row('Первый взнос', '− ' + rub(f)) + row('Сумма кредита', rub(Math.max(s, 0))) + (s > 0 ? row('Переплата за срок', '≈ ' + rub(pay * term - s)) : '');
      $('rNote').textContent = 'Ставка — пример, точные условия называет банк после заявки. Расчёт ориентировочный и не является офертой.';
      text = 'Здравствуйте! Интересует автокредит: машина ' + rub(p) + ', первый взнос ' + rub(f) + ', срок ' + term + ' мес. Какие условия сейчас есть?';
    }
    $('rWa').href = wa(text);
  }
  document.querySelectorAll('.calc input').forEach(function (el) {
    el.addEventListener('input', render);
    el.addEventListener('blur', function () { fmt(el); });
  });
  $('cTerm').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    term = +b.dataset.t; $('cTerm').querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); render();
  });
  var tabs = [['ti', 'tab-ti', 'p-ti'], ['cr', 'tab-cr', 'p-cr']];
  function setTab(m) {
    mode = m;
    tabs.forEach(function (t) { var on = t[0] === m; $(t[1]).setAttribute('aria-selected', on); $(t[1]).tabIndex = on ? 0 : -1; $(t[2]).hidden = !on; });
    render();
  }
  tabs.forEach(function (t) { $(t[1]).addEventListener('click', function () { setTab(t[0]); }); });
  document.querySelector('.tabs').addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var n = mode === 'ti' ? 'cr' : 'ti'; setTab(n); $(n === 'ti' ? 'tab-ti' : 'tab-cr').focus();
  });
  setTab('ti');

  /* ---------- кейсы ---------- */
  $('casesList').innerHTML = CS.map(function (c) {
    return '<div class="case"><span class="fig">' + esc(c.fig) + '</span><span class="car-n">' + esc(c.car) + '</span><p>' + esc(c.fact) + '</p><span class="who">' + esc(c.who) + ' · ' + dt(c.date) + '</span></div>';
  }).join('');

  /* ---------- покупатели ---------- */
  var own = '';
  for (var k = 1; k <= 10; k++) own += '<figure><img src="img/own' + k + '.jpg" alt="Покупатель Асгард Авто со своей машиной" loading="lazy"></figure>';
  $('ownList').innerHTML = own;

  /* ---------- отзывы ---------- */
  var cut = function (t) { return t.length > 320 ? t.slice(0, t.lastIndexOf(' ', 310)) + '…' : t; };
  $('revs').innerHTML = RV.map(function (r) {
    return '<blockquote class="rev" data-rv><span class="st" aria-label="5 из 5">★★★★★</span><q>' + esc(cut(r.text)) + '</q><footer><b>' + esc(r.name.replace(/[^\p{L}\s.-]/gu, '').trim()) + '</b> · ' + dt(r.date) + '</footer></blockquote>';
  }).join('');

  /* ---------- появление блоков ---------- */
  var io = 'IntersectionObserver' in window && !still ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }) : null;
  document.querySelectorAll('[data-rv]').forEach(function (el, i) {
    if (!io) { el.classList.add('in'); return; }
    el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el);
  });
})();
