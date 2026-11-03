/* Lega Auto: предложения (window.OFFERS), каталог из прайса (CATALOG), кейсы и отзывы из 2ГИС (CASES, REVIEWS), меню, появление блоков. */
(function () {
  var $ = function (s) { return document.getElementById(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var OF = window.OFFERS || [], CAT = window.CATALOG || [], CS = window.CASES || [], RV = window.REVIEWS || [];
  var rub = function (v) { return Math.round(v).toLocaleString('ru-RU') + ' ₽'; };
  var num = function (v) { return String(v).replace('.', ','); };
  var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

  /* шапка и меню */
  var hd = $('hd'), mb = $('menuBtn');
  addEventListener('scroll', function () { hd.classList.toggle('sc', scrollY > 20); }, { passive: true });
  var menu = function (on) { hd.classList.toggle('open', on); mb.setAttribute('aria-expanded', on); };
  mb.addEventListener('click', function () { menu(!hd.classList.contains('open')); });
  $('mnav').addEventListener('click', function (e) { if (e.target.closest('a')) menu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && hd.classList.contains('open')) { menu(false); mb.focus(); } });

  /* калькулятор по умолчанию — Китай */
  var cn = document.querySelector('input[name="country"][value="CN"]');
  if (cn && !cn.checked) { cn.checked = true; cn.dispatchEvent(new Event('change', { bubbles: true })); }
  /* пример расчёта, чтобы итог был виден сразу (помечен «Пример») */
  var lt3 = document.querySelector('input[name="age"][value="lt3"]'); if (lt3) lt3.checked = true;
  $('price').value = '150 000'; $('cc').value = '1497'; $('hp').value = '144';
  $('price-h').textContent = 'Пример: 150 000 ¥, 1.5 turbo, 144 л.с. — впишите свою цену';
  $('hp').dispatchEvent(new Event('input', { bubbles: true }));

  /* подставить машину в калькулятор */
  function prefill(m) {
    var set = function (n, v) { var x = document.querySelector('input[name="' + n + '"][value="' + v + '"]'); if (x) x.checked = true; };
    set('country', m.country || 'CN'); set('age', m.age || 'lt3'); set('engine', 'ice'); set('who', 'fiz');
    $('cur').value = (window.CONFIG.costs[m.country || 'CN'] || {}).cur || 'CNY';
    if (m.cc) $('cc').value = m.cc;
    if (m.hp) $('hp').value = m.hp;
    $('price').value = '';
    $('price-h').textContent = m.title + ': введите цену в Китае — остальное уже подставили';
    $('hp').dispatchEvent(new Event('input', { bubbles: true }));
    $('calc').scrollIntoView({ behavior: still ? 'auto' : 'smooth' });
    setTimeout(function () { try { $('price').focus({ preventScroll: true }); } catch (err) { /* старые браузеры */ } }, still ? 0 : 700);
  }

  /* ---------- предложения ---------- */
  $('offersList').innerHTML = OF.map(function (o, k) {
    return '<article class="offer" data-rv>'
      + '<div class="o-pic"><img src="' + esc(o.img) + '" alt="' + esc(o.model) + '" loading="lazy"></div>'
      + '<div class="o-body"><span class="o-note">' + esc(o.note) + '</span><h3>' + esc(o.model) + '</h3><p class="o-spec">' + esc(o.spec) + '</p>'
      + '<div class="vars">' + o.variants.map(function (v) { return '<div class="var"><span>' + esc(v[0]) + '</span><b>' + rub(v[1]) + '</b></div>'; }).join('') + '</div>'
      + (o.term ? '<span class="o-term">' + esc(cap(o.term)) + '</span>' : '')
      + '<div class="o-acts"><a class="btn btn-r" href="https://wa.me/79191473633?text=' + encodeURIComponent('Здравствуйте! Интересует ' + o.model + ' из предложений на сайте.') + '" target="_blank" rel="noopener">Узнать о наличии</a>'
      + '<button class="btn" type="button" data-offer="' + k + '">Посчитать такую</button></div>'
      + '<span class="src-n">Цена из публикации Lega Auto в 2ГИС</span></div></article>';
  }).join('');
  $('offersList').addEventListener('click', function (e) {
    var b = e.target.closest('[data-offer]'); if (!b) return;
    var o = OF[+b.dataset.offer], c = o.calc || {};
    prefill({ title: o.model, country: c.country, age: c.age, cc: c.cc, hp: c.hp });
  });

  /* ---------- каталог ---------- */
  $('catList').innerHTML = CAT.map(function (c, k) {
    return '<button class="ci" type="button" data-cat="' + k + '"><b>' + esc(c.model) + '</b><span>' + esc([c.sub, c.vol ? num(c.vol) + ' л' : '', c.hp ? c.hp + ' л.с.' : ''].filter(Boolean).join(' · ')) + '</span><i>Посчитать →</i></button>';
  }).join('');
  $('catList').addEventListener('click', function (e) {
    var b = e.target.closest('[data-cat]'); if (!b) return;
    var c = CAT[+b.dataset.cat], y = parseInt(c.sub, 10), age = 'lt3';
    if (y > 1990) { var d = new Date().getFullYear() - y; age = d < 3 ? 'lt3' : d < 5 ? '3to5' : d < 7 ? '5to7' : 'gt7'; }
    prefill({ title: c.model, country: 'CN', age: age, cc: c.vol ? Math.round(c.vol * 1000) : '', hp: c.hp });
  });

  /* ---------- кейсы ---------- */
  var dt = function (s) { return new Date(s + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }); };
  $('casesList').innerHTML = CS.map(function (c) {
    return '<div class="case"><b>' + esc(c.car) + '</b><p>' + esc(cap(c.fact)) + '</p><span>' + esc(c.who) + ' · ' + dt(c.date) + '</span></div>';
  }).join('');

  /* ---------- отзывы ---------- */
  var cut = function (t) { return t.length > 300 ? t.slice(0, t.lastIndexOf(' ', 290)) + '…' : t; };
  $('revs').innerHTML = RV.map(function (r) {
    return '<blockquote class="rev" data-rv><span class="st" aria-label="5 из 5">★★★★★</span><q>' + esc(cut(r.text)) + '</q><footer><b>' + esc(r.name) + '</b> · ' + dt(r.date) + '</footer></blockquote>';
  }).join('');

  /* ---------- появление блоков ---------- */
  var io = 'IntersectionObserver' in window && !still ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }) : null;
  document.querySelectorAll('[data-rv]').forEach(function (el, i) {
    if (!io) { el.classList.add('in'); return; }
    el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el);
  });
})();
