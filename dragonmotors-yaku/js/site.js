/* Драгон моторс: сделки из Telegram (window.DEALS), сроки «лот → СВХ» (PATH), подстановка в калькулятор,
   отзывы 2ГИС (REVIEWS), фото компании (GIS), «не только авто» (MORE), заявки в WhatsApp, меню, появление блоков. */
(function () {
  var $ = function (s) { return document.getElementById(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DL = window.DEALS || [], RV = window.REVIEWS || [], RT = window.RATING || null, PATH = window.PATH || { list: [] }, GIS = window.GIS || [], MORE = window.MORE || {};
  var WA = '79245999501';
  var wa = function (t) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t); };
  var rub = function (v) { return Math.round(v).toLocaleString('ru-RU') + ' ₽'; };
  var dt = function (s) { return new Date(s + 'T00:00:00').toLocaleDateString('ru-RU'); };
  var dm = function (s) { return new Date(s + 'T00:00:00').toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }); };
  var plural = function (n, a, b, c) { var m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 10 || h >= 20) ? b : c; };
  var CN = { JP: 'Япония', CN: 'Китай' };
  var KIND = { won: 'Выигран лот', svh: 'Забрали с СВХ', stock: 'Со стоянки в Японии', bought: 'Куплена в Китае', offer: 'Предлагали под заказ' };
  var WHERE = { 'Владивосток': 'во Владивостоке', 'Уссурийск': 'в Уссурийске', 'Якутск': 'в Якутске' };
  var where = function (d) { return WHERE[d.city] ? 'итог ' + WHERE[d.city] : 'цена под заказ'; };
  var name = function (d) { return d.model + (d.year ? ' ' + d.year : ''); };
  var spec = function (d) {
    var s = [];
    if (d.isNew) s.push('новый'); else if (d.km) s.push(d.km.toLocaleString('ru-RU') + ' км');
    if (d.grade) s.push('оценка ' + d.grade.replace('.', ','));
    if (d.vol) s.push(String(d.vol.toFixed(1)).replace('.', ',') + ' л');
    if (d.hyb) s.push('гибрид');
    if (d.drive === '4WD') s.push('4WD');
    if (d.trim && d.trim.length <= 24 && !/пробег|максимальн/i.test(d.trim)) s.push(d.trim);
    return s;
  };
  var want = function (d) { return 'Здравствуйте! Видел на сайте ' + name(d) + ' — ' + rub(d.price) + ' (' + where(d) + '). Хочу похожую — сколько будет сейчас?'; };

  /* шапка, меню, наверх, WhatsApp */
  var hd = $('hd'), mb = $('menuBtn'), up = $('up');
  addEventListener('scroll', function () { hd.classList.toggle('sc', scrollY > 20); up.classList.toggle('on', scrollY > 900); }, { passive: true });
  var menu = function (on) { hd.classList.toggle('open', on); mb.setAttribute('aria-expanded', on); };
  mb.addEventListener('click', function () { menu(!hd.classList.contains('open')); });
  $('mnav').addEventListener('click', function (e) { if (e.target.closest('a')) menu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && hd.classList.contains('open')) { menu(false); mb.focus(); } });
  up.addEventListener('click', function () { scrollTo({ top: 0, behavior: still ? 'auto' : 'smooth' }); });
  var hello = wa('Здравствуйте! Хочу подобрать авто из Японии или Китая. Подскажете по бюджету?');
  ['hdWa', 'ctWa', 'mbWa'].forEach(function (id) { if ($(id)) $(id).href = hello; });
  $('stockWa').href = wa('Здравствуйте! Хочу посмотреть ваши авто в Японии. Пришлите, пожалуйста, подборку.');

  /* цифры: рейтинг 2ГИС, сроки, число машин */
  if (RT) {
    var rv = RT.value.toFixed(1).replace('.', ','), rc = RT.count + ' ' + plural(RT.count, 'отзыв', 'отзыва', 'отзывов') + ' в 2ГИС';
    $('hRate').textContent = rv; $('hRateN').textContent = rc; $('rVal').textContent = rv; $('rCnt').textContent = rc;
  }
  var M = PATH.median;
  if (M) {
    var dW = M + ' ' + plural(M, 'день', 'дня', 'дней');
    $('hDays').textContent = dW; $('tMed').textContent = M; $('tMed').nextElementSibling.textContent = plural(M, 'день', 'дня', 'дней') + ' — медиана';
    $('wDays').textContent = 'около трёх недель (медиана ' + dW + ')'; $('sDays').textContent = 'медиана ' + dW + ' от лота до СВХ';
  }
  $('hCars').textContent = DL.length;

  /* первый экран: сделка с полным путём «выигран лот → СВХ» */
  var h0 = DL.filter(function (d) { return d.id === 853; })[0] || DL.filter(function (d) { return d.won; })[0] || DL[0];
  if (h0) {
    var hd0 = h0.won ? Math.round((new Date(h0.date) - new Date(h0.won)) / 864e5) : 0;
    $('heroLot').innerHTML = '<div class="lot-top"><span><b>Сделка</b> · ' + esc(CN[h0.country]) + '</span><span>' + dt(h0.date) + '</span></div>'
      + '<div class="ph"><img src="' + esc(h0.imgs[0]) + '" alt="' + esc(name(h0)) + ' клиента Драгон моторс" fetchpriority="high"><span class="seal">' + (h0.won ? 'Лот<br>выигран' : esc(KIND[h0.kind])) + '</span></div>'
      + '<div class="lot-b"><div><h3>' + esc(name(h0)) + '</h3><p>' + esc(spec(h0).join(' · ')) + '</p></div><div class="pr"><span>' + esc(where(h0)) + '</span><b>' + rub(h0.price) + '</b></div></div>'
      + (h0.won ? '<div class="trail"><span>Лот выигран <b>' + dm(h0.won) + '</b></span><i></i><span>С СВХ <b>' + dm(h0.date) + '</b></span><em>' + hd0 + ' ' + plural(hd0, 'день', 'дня', 'дней') + '</em></div>' : '')
      + '<p class="lot-src">Из постов в Telegram: <a href="' + esc(h0.wonPost || h0.post) + '" target="_blank" rel="noopener">покупка</a>' + (h0.won ? ' и <a href="' + esc(h0.post) + '" target="_blank" rel="noopener">выдача с СВХ</a>' : '') + '</p>';
  }

  /* ---------- калькулятор: пример и подстановка ---------- */
  var setR = function (n, v) { var x = document.querySelector('input[name="' + n + '"][value="' + v + '"]'); if (x) x.checked = true; };
  var fire = function () { $('hp').dispatchEvent(new Event('input', { bubbles: true })); };
  var setCountry = function (c) { var x = document.querySelector('input[name="country"][value="' + c + '"]'); if (x) { x.checked = true; x.dispatchEvent(new Event('change', { bubbles: true })); } };
  /* пример в калькуляторе свой для каждой страны, пока человек не ввёл свои цифры: иначе 1 500 000 «иен» станут юанями */
  var EX = { JP: ['1 500 000', '1490', '120', 'Пример: 1 500 000 ¥, 1,5 л, 120 л.с. — впишите свою ставку'], CN: ['100 000', '1497', '150', 'Пример: 100 000 юаней, 1,5 л турбо, 150 л.с. — впишите цену продавца'] };
  var exMode = true;
  var example = function (c) { var e = EX[c]; if (!e) return; setR('age', '3to5'); $('price').value = e[0]; $('cc').value = e[1]; $('hp').value = e[2]; $('price-h').textContent = e[3]; fire(); };
  ['price', 'cc', 'hp'].forEach(function (k) { $(k).addEventListener('input', function (e) { if (e.isTrusted) exMode = false; }); });
  document.addEventListener('change', function (e) { if (e.target.name === 'country' && exMode) example(e.target.value); });
  if ($('price')) example('JP');
  document.querySelectorAll('[data-country]').forEach(function (a) { a.addEventListener('click', function () { setCountry(a.dataset.country); }); });
  var ageOf = function (y) { var d = new Date().getFullYear() - y; return d < 3 ? 'lt3' : d < 5 ? '3to5' : d < 7 ? '5to7' : 'gt7'; };
  function prefill(d) {
    exMode = false; setCountry(d.country); if (d.year) setR('age', ageOf(d.year)); setR('engine', d.ev ? 'ev' : d.hyb ? 'hyb' : 'ice'); setR('who', 'fiz');
    $('cc').value = d.vol && !d.ev ? Math.round(d.vol * 1000) : '';
    $('hp').value = ''; $('price').value = '';
    $('price-h').textContent = name(d) + ': впишите цену в стране покупки, мощность' + (d.vol ? '' : ' и объём') + ' — остальное подставили';
    fire();
    $('calc').scrollIntoView({ behavior: still ? 'auto' : 'smooth' });
    setTimeout(function () { try { $('price').focus({ preventScroll: true }); } catch (err) { /* старые браузеры */ } }, still ? 0 : 700);
  }

  /* ---------- сделки ---------- */
  var FILT = [['all', 'Все', function () { return true; }],
    ['auc', 'Аукционы Японии', function (d) { return d.country === 'JP' && (d.kind === 'won' || d.kind === 'svh'); }],
    ['stock', 'Со стоянки в Японии', function (d) { return d.kind === 'stock'; }],
    ['cn', 'Китай', function (d) { return d.country === 'CN'; }],
    ['new', 'Новые', function (d) { return d.isNew; }]];
  /* на странице — три полных ряда карточек: столбцов столько, сколько помещается по 280px */
  var small = matchMedia('(max-width: 760px)').matches;
  var PAGE = small ? 6 : Math.max(2, Math.floor(($('dGrid').clientWidth + 18) / 298)) * 3;
  var fk = 'all', sort = 'new', shown = PAGE, list = [];
  $('dChips').innerHTML = FILT.map(function (f) {
    var n = DL.filter(f[2]).length; return n >= 3 || f[0] === 'all' ? '<button type="button" data-f="' + f[0] + '" aria-pressed="' + (f[0] === fk) + '">' + f[1] + '<small>' + n + '</small></button>' : '';
  }).join('');
  function card(d, i) {
    var t = name(d), days = d.won ? Math.round((new Date(d.date) - new Date(d.won)) / 864e5) : 0;
    return '<article class="deal">'
      + '<button class="ph" type="button" data-lb="' + i + '" aria-label="Фото: ' + esc(t) + '"><img src="' + esc(d.imgs[0]) + '" alt="' + esc(t) + '" loading="lazy">'
      + '<span class="kind' + (d.kind === 'won' || d.won ? ' won' : '') + '">' + esc(d.won ? 'Выигран → на СВХ' : KIND[d.kind]) + '</span>' + (d.imgs.length > 1 ? '<span class="cnt">' + d.imgs.length + ' фото</span>' : '') + '</button>'
      + '<div class="deal-b"><span class="meta">' + esc(CN[d.country]) + ' · <a href="' + esc(d.post) + '" target="_blank" rel="noopener">пост от ' + dt(d.date) + '</a></span><h3>' + esc(t) + '</h3>'
      + '<div class="spec">' + spec(d).map(function (s) { return '<span>' + esc(s) + '</span>'; }).join('') + '</div>'
      + (d.won ? '<div class="path"><span>лот ' + dm(d.won) + '</span><i></i><span>СВХ ' + dm(d.date) + '</span><b>' + days + ' ' + plural(days, 'день', 'дня', 'дней') + '</b></div>' : '')
      + '<div class="price"><span>' + esc(where(d)) + '</span><b class="num">' + rub(d.price) + '</b></div>'
      + '<div class="deal-a"><a class="btn btn-r" href="' + wa(want(d)) + '" target="_blank" rel="noopener">Хочу такую</a>'
      + (d.model.indexOf('DongFeng') === 0 ? '' : '<button class="btn" type="button" data-calc="' + i + '">Посчитать</button>') + '</div></div></article>';
  }
  function deals() {
    var f = FILT.filter(function (x) { return x[0] === fk; })[0][2];
    list = DL.filter(f).slice().sort(function (a, b) { return sort === 'cheap' ? a.price - b.price : sort === 'exp' ? b.price - a.price : b.date.localeCompare(a.date); });
    $('dGrid').innerHTML = list.slice(0, shown).map(card).join('');
    $('dMore').hidden = list.length <= shown;
    $('dMore').textContent = 'Показать ещё ' + Math.min(PAGE, list.length - shown);
  }
  $('dChips').addEventListener('click', function (e) {
    var b = e.target.closest('[data-f]'); if (!b) return;
    fk = b.dataset.f; shown = PAGE;
    $('dChips').querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    deals();
  });
  $('dSort').addEventListener('change', function () { sort = this.value; deals(); });
  $('dMore').addEventListener('click', function () { shown += PAGE; deals(); });
  $('dGrid').addEventListener('click', function (e) {
    var c = e.target.closest('[data-calc]'); if (c) { prefill(list[+c.dataset.calc]); return; }
    var p = e.target.closest('[data-lb]'); if (p) openLb(+p.dataset.lb, p);
  });
  deals();

  /* просмотр фото */
  var lb = $('lb'), lbD = null, lbK = 0, lbFrom = null;
  function lbShow() {
    $('lbImg').src = lbD.imgs[lbK]; $('lbImg').alt = name(lbD) + ', фото ' + (lbK + 1) + ' из ' + lbD.imgs.length;
    $('lbT').textContent = name(lbD); $('lbS').textContent = spec(lbD).concat([rub(lbD.price) + ' — ' + where(lbD)]).join(' · ');
    $('lbWa').href = wa(want(lbD));
    $('lbP').hidden = $('lbN').hidden = lbD.imgs.length < 2;
  }
  function openLb(i, from) {
    lbD = list[i]; lbK = 0; lbFrom = from; lbShow();
    if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
  }
  var lbClose = function () { if (lb.close) lb.close(); else lb.removeAttribute('open'); };
  lb.addEventListener('close', function () { if (lbFrom) lbFrom.focus(); });
  $('lbX').addEventListener('click', lbClose);
  lb.addEventListener('click', function (e) { if (e.target === lb) lbClose(); });
  var step = function (n) { lbK = (lbK + n + lbD.imgs.length) % lbD.imgs.length; lbShow(); };
  $('lbP').addEventListener('click', function () { step(-1); });
  $('lbN').addEventListener('click', function () { step(1); });
  lb.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });

  /* ---------- путь машины: фото из альбома компании в 2ГИС ---------- */
  var ROUTE = [['071', 'Япония'], ['103', 'Порт'], ['104', 'Автовоз'], ['075', 'Якутия']];
  $('route').innerHTML = ROUTE.filter(function (r) { return GIS.indexOf('img/gis/' + r[0] + '.jpg') >= 0; }).map(function (r, i) {
    return '<figure><img src="img/gis/' + r[0] + '.jpg" alt="' + r[1] + ': фото из альбома Драгон моторс в 2ГИС" loading="lazy"><figcaption>' + (i + 1) + ' · ' + r[1] + '</figcaption></figure>';
  }).join('');

  /* ---------- сроки «выигран лот → забрали с СВХ» по постам канала ---------- */
  var PL = (PATH.list || []).slice().sort(function (a, b) { return a.days - b.days; });
  var mx = Math.max.apply(null, PL.map(function (x) { return x.days; }).concat([1]));
  $('days').innerHTML = PL.map(function (x) {
    return '<a class="dr" href="' + esc(x.post) + '" target="_blank" rel="noopener" title="Лот ' + dt(x.won) + ' → СВХ ' + dt(x.svh) + '"><span class="dm">' + esc(x.model + ' ' + x.year) + '</span>'
      + '<span class="db"><i' + (x.days > 30 ? ' class="long"' : '') + ' style="width:' + Math.max(6, Math.round(x.days / mx * 100)) + '%"></i></span><b>' + x.days + ' ' + plural(x.days, 'день', 'дня', 'дней') + '</b></a>';
  }).join('') + (PL.length ? '<small>' + PL.filter(function (x) { return x.days <= 25; }).length + ' из ' + PL.length + ' машин дошли до СВХ за ' + PL[0].days + '–25 дней. Дольше — когда ждали судно или оформление.</small>' : '');

  /* ---------- команда: упоминания в отзывах ---------- */
  var cnt = function (re) { return RV.filter(function (r) { return re.test(r.text); }).length; };
  var nD = cnt(/Дмитри|Дим[аеуы]\b/i), nA = cnt(/Алексе|Алёш|Алеш/i);
  if (nD) $('teamRv').innerHTML = 'В отзывах 2ГИС Дмитрия называют по имени в <b>' + nD + ' ' + plural(nD, 'отзыве', 'отзывах', 'отзывах') + '</b>, Алексея — в <b>' + nA + '</b>.';

  /* ---------- не только авто: посты канала ---------- */
  var MO = [
    { img: MORE[842], meta: 'Купили под заказ · 07.02.2026', h: 'Лодочный мотор Yamaha F300', p: 'Новый, оригинал made in Japan: 300 л.с., электростартер, дистанционное управление. Срок доставки — 30 дней.', price: 3100000, w: 'со всеми расходами в Якутске', post: 842 },
    { img: MORE[831], meta: 'Аукцион Японии · 03.02.2026', h: 'Мотоцикл Honda CBR650, 2021', p: 'Пробег 5 000 км, оценка 4,5. Купили на аукционе Японии для клиента из Якутска.', price: 1000000, w: 'со всеми расходами во Владивостоке', post: 831 },
    { img: MORE[452], meta: 'Запчасти · 11.10.2025', h: 'Коробка передач для Exeed LX 2022', p: 'Новая оригинальная коробка. В Москве такая продаётся от 300 000 ₽.', price: 220000, w: 'с доставкой до Якутска', post: 452 }
  ];
  $('mores').innerHTML = MO.map(function (m) {
    return '<article class="mo" data-rv>' + (m.img ? '<img src="' + esc(m.img) + '" alt="' + esc(m.h) + '" loading="lazy">' : '<div class="noimg">Фото — в посте канала</div>')
      + '<div class="b"><span class="meta">' + esc(m.meta) + '</span><h3>' + esc(m.h) + '</h3><p>' + esc(m.p) + '</p>'
      + '<div class="price"><span>' + esc(m.w) + '</span><b class="num">' + rub(m.price) + '</b></div>'
      + '<a class="src" href="https://t.me/sinoimport/' + m.post + '" target="_blank" rel="noopener">Пост в Telegram ↗</a>'
      + '<a class="btn" style="margin-top:12px" href="' + wa('Здравствуйте! Интересует: ' + m.h + '. Можно привезти под заказ?') + '" target="_blank" rel="noopener">Спросить в WhatsApp</a></div></article>';
  }).join('');

  /* ---------- поля: ошибка после ухода из поля, снимается при фокусе ---------- */
  function field(id, msg, ok) {
    var el = $(id), er = $(id + '-e');
    var show = function (bad) { el.setAttribute('aria-invalid', bad ? 'true' : 'false'); er.hidden = !bad; er.textContent = bad ? msg : ''; };
    var test = function () { return ok(el.type === 'checkbox' ? el.checked : el.value.trim()); };
    if (el.type === 'checkbox') el.addEventListener('change', function () { show(false); });
    else { el.addEventListener('blur', function () { if (el.value.trim()) show(!test()); }); el.addEventListener('focus', function () { show(false); }); el.addEventListener('input', function () { show(false); }); }
    return { el: el, check: function () { var g = test(); show(!g); return g; } };
  }
  var fN = field('lName', 'Как к вам обращаться?', function (v) { return v.length >= 2; });
  var fT = field('lTel', 'Введите телефон, например +7 924 599-95-01', function (v) { return v.replace(/\D/g, '').length >= 10; });
  var fO = field('lOk', 'Нужно согласие, чтобы мы могли вам ответить', function (v) { return v; });
  $('leadForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = [fN, fT, fO].filter(function (f) { return !f.check(); });
    if (bad.length) { bad[0].el.focus(); return; }
    var c = $('lCar').value.trim();
    window.open(wa('Здравствуйте! Заявка с сайта.\nИмя: ' + $('lName').value.trim() + '\nТелефон: ' + $('lTel').value.trim() + (c ? '\nИщу: ' + c : '')), '_blank', 'noopener');
  });

  /* ---------- отзывы: сначала с фото, на телефоне — 4 ---------- */
  var LIM = 230;
  $('revs').innerHTML = RV.map(function (r, i) {
    var long = r.text.length > LIM + 40, s = long ? r.text.slice(0, r.text.lastIndexOf(' ', LIM)) + '…' : r.text;
    return '<blockquote class="rev">' + (r.imgs && r.imgs[0] ? '<img src="' + esc(r.imgs[0]) + '" alt="Фото из отзыва: ' + esc(r.name) + '" loading="lazy">' : '')
      + '<div class="in"><span class="st" aria-label="5 из 5">★★★★★</span><q id="rq' + i + '">' + esc(s) + '</q>'
      + (long ? '<button type="button" data-r="' + i + '" aria-controls="rq' + i + '" aria-expanded="false">Читать полностью</button>' : '')
      + '<footer><b>' + esc(r.name) + '</b> · ' + dt(r.date) + '</footer></div></blockquote>';
  }).join('');
  var revEls = $('revs').children, RMAX = Math.min(RV.length, small ? 4 : 9);
  for (var q = RMAX; q < revEls.length; q++) revEls[q].hidden = true;
  $('rMore').hidden = RMAX >= RV.length;
  $('rMore').textContent = 'Ещё ' + (RV.length - RMAX) + ' ' + plural(RV.length - RMAX, 'отзыв', 'отзыва', 'отзывов');
  $('rMore').addEventListener('click', function () { for (var q = 0; q < revEls.length; q++) revEls[q].hidden = false; this.hidden = true; });
  $('revs').addEventListener('click', function (e) {
    var b = e.target.closest('[data-r]'); if (!b) return;
    $('rq' + b.dataset.r).textContent = RV[+b.dataset.r].text; b.remove();
  });

  /* ---------- появление блоков ---------- */
  var io = 'IntersectionObserver' in window && !still ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }) : null;
  document.querySelectorAll('[data-rv]').forEach(function (el, i) {
    if (!io) { el.classList.add('in'); return; }
    el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el);
  });
})();
