/* Дапимоторс: направления, сделки из Telegram (window.DEALS), подстановка в калькулятор, расшифровка аукционного листа,
   отправки (SHIPS), прайс детейлинга, отзывы 2ГИС (REVIEWS), заявки в WhatsApp, меню, появление блоков. */
(function () {
  var $ = function (s) { return document.getElementById(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DL = window.DEALS || [], SH = window.SHIPS || [], RV = window.REVIEWS || [], RT = window.RATING || null;
  var WA = '79145533115', AUC = 'http://auctions.dapimotors.ru/auctions/?p=project/searchform&searchtype=max&s&ld';
  var wa = function (t) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t); };
  var rub = function (v) { return Math.round(v).toLocaleString('ru-RU') + ' ₽'; };
  var dt = function (s) { return new Date(s + 'T00:00:00').toLocaleDateString('ru-RU'); };
  var plural = function (n, a, b, c) { var m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 10 || h >= 20) ? b : c; };
  var CN = { JP: 'Япония', KR: 'Корея', CN: 'Китай' };

  /* «MAZDA CX-5 20S BLACK TONE» → «Mazda CX-5 20S Black Tone»: слова с цифрами и короткие части через дефис не трогаем */
  var KEEP = { BMW: 1, BYD: 1, TSI: 1, GT: 1, SM: 1, XV: 1, NC: 1 };
  var title = function (s) {
    return s.split(' ').map(function (w) {
      if (/\d/.test(w) || KEEP[w]) return w;
      return w.split('-').map(function (p) { return p.length <= 2 ? p : p.charAt(0) + p.slice(1).toLowerCase(); }).join('-');
    }).join(' ');
  };
  var spec = function (d) {
    var v = d.moto ? d.vol + ' см³' : d.ev ? 'электро' : d.vol ? String(d.vol).replace('.', ',') + ' л' : '';
    return [d.year, v, d.hyb ? 'гибрид' : '', d.drive, d.isNew ? 'новый' : d.km ? d.km.toLocaleString('ru-RU') + ' км' : ''].filter(Boolean);
  };

  /* шапка, меню, наверх */
  var hd = $('hd'), mb = $('menuBtn'), up = $('up');
  addEventListener('scroll', function () { hd.classList.toggle('sc', scrollY > 20); up.classList.toggle('on', scrollY > 900); }, { passive: true });
  var menu = function (on) { hd.classList.toggle('open', on); mb.setAttribute('aria-expanded', on); };
  mb.addEventListener('click', function () { menu(!hd.classList.contains('open')); });
  $('mnav').addEventListener('click', function (e) { if (e.target.closest('a')) menu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && hd.classList.contains('open')) { menu(false); mb.focus(); } });
  up.addEventListener('click', function () { scrollTo({ top: 0, behavior: still ? 'auto' : 'smooth' }); });

  /* рейтинг 2ГИС */
  if (RT) {
    var rv = RT.value.toFixed(1), rc = RT.count + ' ' + plural(RT.count, 'отзыв', 'отзыва', 'отзывов') + ' в 2ГИС';
    $('hRate').textContent = rv; $('hRateN').textContent = rc; $('rVal').textContent = rv; $('rCnt').textContent = rc;
  }

  /* первый экран: последняя сделка как лот */
  var h0 = DL.filter(function (d) { return !d.moto; })[0];
  if (h0) {
    $('heroLot').innerHTML = '<div class="lot-top"><span><b>ЛОТ</b> · ' + h0.country + ' · ' + esc(CN[h0.country]) + '</span><span>' + dt(h0.date) + '</span></div>'
      + '<img src="' + esc(h0.imgs[0]) + '" alt="' + esc(title(h0.model)) + ', привезён для клиента" fetchpriority="high">'
      + '<span class="stamp">СДЕЛКА<br>ЗАКРЫТА</span>'
      + '<div class="lot-b"><div><h3>' + esc(title(h0.model)) + '</h3><p>' + esc(spec(h0).join(' · ')) + '</p></div><div class="pr"><span>Цена</span><b>' + rub(h0.price) + '</b></div></div>'
      + '<p class="lot-src">Из <a href="' + esc(h0.post) + '" target="_blank" rel="noopener">поста в Telegram</a> от ' + dt(h0.date) + '</p>';
  }

  /* ---------- направления ---------- */
  var DIR = {
    JP: { h: 'Авто с аукционов Японии', p: 'Крупнейший рынок подержанных машин: каждый день на торгах тысячи лотов, и каждый проходит независимый осмотр. Пробег, оценка кузова и салона, замечания — всё в аукционном листе.',
      ticks: ['Переводим аукционный лист перед ставкой', 'Сверяем пробег с прошлыми продажами', 'Проверяем ДТП, страховые случаи и выплаты', 'До пяти ставок одновременно', 'Торг с продавцом после аукциона', 'СБКТС и ЭПТС в лаборатории'],
      dl: [['До Владивостока', '20–30 дней'], ['Оплата лота', '2 рабочих дня'], ['Ставки', 'до 5 одновременно'], ['Неуспешные ставки', 'бесплатно']],
      plat: ['USS', 'TAA', 'JU', 'CAA', 'HAA', 'BAYAUC', 'SMAP'], btn: ['Открыть аукционы', AUC] },
    KR: { h: 'Авто из Южной Кореи с проверкой', p: 'В Корее нет единой системы аукционных оценок, поэтому фотографий продавца мало. Машину на месте осматривает независимый эксперт: фото, видео и заключение — до того, как вы платите основную сумму.',
      ticks: ['Осмотр в Корее с фото и видео', 'Пробег и история обслуживания', 'ДТП и страховые выплаты', 'Прошлые продажи и ограничения', 'Двигатель, коробка, ходовая', 'Только под заказ, без машин из наличия'],
      dl: [['Бюджет обычно', '1,5–8 млн ₽'], ['Проверка', 'до выкупа'], ['Предоплата', 'возврат до покупки'], ['Доставка', 'по всей России']],
      plat: ['Encar', 'Kbchacha', 'Bobaedream'], btn: ['Посчитать из Кореи', '#calc', 'KR'] },
    CN: { h: 'Авто из Китая — новые и с пробегом', p: 'Ищем у дилеров и на крупных площадках. Эксперт осматривает машину в Китае, историю проверяем по базам дилеров и страховых. Бронируем и платим по инвойсу только после вашего согласия.',
      ticks: ['Новые машины у дилеров и с пробегом', 'Независимый осмотр с фото и видео', 'Проверка по базам дилеров и страховых', 'Выкуп только после вашего одобрения', 'Пять платежей по мере работы', 'СБКТС, ЭПТС и документы для учёта'],
      dl: [['Аванс', '50–70 тыс. ₽'], ['Поставка', 'до 60 суток'], ['Оформление на СВХ', 'до 15 суток'], ['Бюджет обычно', '1–4 млн ₽']],
      plat: ['Che168', 'Dongchedi', 'Guazi'], btn: ['Посчитать из Китая', '#calc', 'CN'],
      alert: ['С 1 января 2027 правила вывоза новых авто из Китая ужесточаются', 'Пока некоторые новые модели можно заказать без 180 дней ожидания.'] }
  };
  function dir(c) {
    var d = DIR[c];
    $('p-dir').innerHTML = '<div class="dir-m"><h3>' + d.h + '</h3><p>' + d.p + '</p><ul class="ticks">' + d.ticks.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>'
      + (d.alert ? '<p class="alert"><b>' + d.alert[0] + '</b>' + d.alert[1] + '</p>' : '') + '</div>'
      + '<div class="dir-s"><dl>' + d.dl.map(function (x) { return '<div><dt>' + x[0] + '</dt><dd>' + x[1] + '</dd></div>'; }).join('') + '</dl>'
      + '<div class="plat">' + d.plat.map(function (x) { return '<span>' + x + '</span>'; }).join('') + '</div>'
      + '<a class="btn btn-r" href="' + esc(d.btn[1]) + '"' + (d.btn[2] ? ' data-country="' + d.btn[2] + '"' : ' target="_blank" rel="noopener"') + '>' + d.btn[0] + '</a></div>';
    ['JP', 'KR', 'CN'].forEach(function (k) { var t = $('t-' + k), on = k === c; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    $('p-dir').setAttribute('aria-labelledby', 't-' + c);
  }
  var tabsEl = document.querySelector('.tabs');
  tabsEl.addEventListener('click', function (e) { var b = e.target.closest('[data-c]'); if (b) dir(b.dataset.c); });
  tabsEl.addEventListener('keydown', function (e) {
    var ks = ['JP', 'KR', 'CN'], i = ks.indexOf(document.activeElement.dataset.c); if (i < 0) return;
    var n = e.key === 'ArrowRight' ? (i + 1) % 3 : e.key === 'ArrowLeft' ? (i + 2) % 3 : -1; if (n < 0) return;
    e.preventDefault(); dir(ks[n]); $('t-' + ks[n]).focus();
  });
  dir('JP');
  $('p-dir').addEventListener('click', function (e) {
    var a = e.target.closest('[data-country]'); if (!a) return;
    var x = document.querySelector('input[name="country"][value="' + a.dataset.country + '"]');
    if (x) { x.checked = true; x.dispatchEvent(new Event('change', { bubbles: true })); }
  });

  /* ---------- калькулятор: пример и подстановка ---------- */
  var setR = function (n, v) { var x = document.querySelector('input[name="' + n + '"][value="' + v + '"]'); if (x) x.checked = true; };
  var fire = function () { $('hp').dispatchEvent(new Event('input', { bubbles: true })); };
  if ($('price')) {
    setR('age', '3to5'); $('price').value = '1 800 000'; $('cc').value = '1998'; $('hp').value = '155';
    $('price-h').textContent = 'Пример: 1 800 000 ¥, 2.0 л, 155 л.с. — впишите свою ставку';
    fire();
  }
  var ageOf = function (y) { var d = new Date().getFullYear() - y; return d < 3 ? 'lt3' : d < 5 ? '3to5' : d < 7 ? '5to7' : 'gt7'; };
  function prefill(d) {
    setR('country', d.country); setR('age', ageOf(d.year)); setR('engine', d.ev ? 'ev' : d.hyb ? 'hyb' : 'ice'); setR('who', 'fiz');
    $('cur').value = (window.CONFIG.costs[d.country] || {}).cur || 'JPY';
    $('cc').value = d.vol && !d.ev ? Math.round(d.vol * 1000) : '';
    $('hp').value = ''; $('price').value = '';
    $('price-h').textContent = title(d.model) + ': впишите цену в стране покупки и мощность — остальное подставили';
    fire();
    $('calc').scrollIntoView({ behavior: still ? 'auto' : 'smooth' });
    setTimeout(function () { try { $('price').focus({ preventScroll: true }); } catch (err) { /* старые браузеры */ } }, still ? 0 : 700);
  }

  /* ---------- сделки ---------- */
  var FILT = [['all', 'Все', function () { return true; }], ['JP', 'Япония', function (d) { return d.country === 'JP' && !d.moto; }], ['KR', 'Корея', function (d) { return d.country === 'KR'; }],
    ['CN', 'Китай с пробегом', function (d) { return d.country === 'CN' && !d.isNew; }], ['new', 'Новые из Китая', function (d) { return d.isNew; }], ['moto', 'Мотоциклы', function (d) { return d.moto; }]];
  var small = matchMedia('(max-width: 760px)').matches, PAGE = small ? 6 : 12;
  var fk = 'all', sort = 'new', shown = PAGE, list = [];
  $('dChips').innerHTML = FILT.map(function (f) {
    var n = DL.filter(f[2]).length; return n ? '<button type="button" data-f="' + f[0] + '" aria-pressed="' + (f[0] === fk) + '">' + f[1] + '<small>' + n + '</small></button>' : '';
  }).join('');
  function card(d, i) {
    var t = title(d.model);
    return '<article class="deal">'
      + '<button class="ph" type="button" data-lb="' + i + '" aria-label="Фото: ' + esc(t) + '"><img src="' + esc(d.imgs[0]) + '" alt="' + esc(t) + '" loading="lazy">'
      + '<span class="flag' + (d.isNew ? ' nw' : '') + '">' + (d.isNew ? 'НОВЫЙ · ' : '') + d.country + '</span>' + (d.imgs.length > 1 ? '<span class="cnt">' + d.imgs.length + ' фото</span>' : '') + '</button>'
      + '<div class="deal-b"><span class="lotn">' + esc(CN[d.country]) + ' · пост от ' + dt(d.date) + '</span><h3>' + esc(t) + '</h3>'
      + '<div class="spec">' + spec(d).map(function (s) { return '<span>' + esc(s) + '</span>'; }).join('') + '</div>'
      + '<div class="price"><span>Цена из поста</span><b>' + rub(d.price) + '</b></div>'
      + '<div class="deal-a"><a class="btn btn-r" href="' + wa('Здравствуйте! Видел на сайте ' + t + ' ' + d.year + ' г. за ' + rub(d.price) + '. Хочу похожую — сколько будет сейчас?') + '" target="_blank" rel="noopener">Хочу такую</a>'
      + (d.moto ? '' : '<button class="btn" type="button" data-calc="' + i + '">Посчитать</button>') + '</div></div></article>';
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
    var t = title(lbD.model);
    $('lbImg').src = lbD.imgs[lbK]; $('lbImg').alt = t + ', фото ' + (lbK + 1) + ' из ' + lbD.imgs.length;
    $('lbT').textContent = t; $('lbS').textContent = spec(lbD).join(' · ') + ' · ' + rub(lbD.price);
    $('lbWa').href = wa('Здравствуйте! Видел на сайте ' + t + ' ' + lbD.year + ' г. за ' + rub(lbD.price) + '. Хочу похожую — сколько будет сейчас?');
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

  /* ---------- поля: ошибка после ухода из поля, снимается при фокусе ---------- */
  function field(id, msg, ok) {
    var el = $(id), er = $(id + '-e');
    var show = function (bad) { el.setAttribute('aria-invalid', bad ? 'true' : 'false'); er.hidden = !bad; er.textContent = bad ? msg : ''; };
    var test = function () { return ok(el.type === 'checkbox' ? el.checked : el.value.trim()); };
    if (el.type === 'checkbox') el.addEventListener('change', function () { show(false); });
    else { el.addEventListener('blur', function () { if (el.value.trim()) show(!test()); }); el.addEventListener('focus', function () { show(false); }); el.addEventListener('input', function () { show(false); }); }
    return { el: el, check: function () { var g = test(); show(!g); return g; } };
  }
  function form(id, fields, msg) {
    $(id).addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = fields.filter(function (f) { return !f.check(); });
      if (bad.length) { bad[0].el.focus(); return; }
      window.open(wa(msg()), '_blank', 'noopener');
    });
  }
  var lot = field('lotNo', 'Впишите номер лота или ссылку на него', function (v) { return v.length >= 3; });
  form('lotForm', [lot], function () { var n = $('lotNote').value.trim(); return 'Здравствуйте! Прошу проверить лот перед ставкой: ' + $('lotNo').value.trim() + '.' + (n ? '\n' + n : ''); });
  var fN = field('lName', 'Как к вам обращаться?', function (v) { return v.length >= 2; });
  var fT = field('lTel', 'Введите телефон, например +7 914 553-31-15', function (v) { return v.replace(/\D/g, '').length >= 10; });
  var fO = field('lOk', 'Нужно согласие, чтобы мы могли вам ответить', function (v) { return v; });
  form('leadForm', [fN, fT, fO], function () {
    var c = $('lCar').value.trim();
    return 'Здравствуйте! Заявка с сайта.\nИмя: ' + $('lName').value.trim() + '\nТелефон: ' + $('lTel').value.trim() + (c ? '\nИщу: ' + c : '') + ($('lNews').checked ? '\nХочу получать новости и новые машины к заказу.' : '');
  });
  $('ctWa').href = wa('Здравствуйте! Хочу заказать авто. Подскажете по бюджету?');

  /* ---------- аукционный лист ---------- */
  var CODES = {
    A: ['Царапина', 3], U: ['Вмятина', 3], B: ['Вмятина с царапиной', 3], E: ['Впадина', 3], Y: ['Трещина или разрыв', 3],
    P: ['Отличие по цвету — признак покраски', 3], S: ['Ржавчина', 3], C: ['Коррозия', 3], X: ['Элемент требует замены', 0], XX: ['Элемент уже заменён', 0]
  };
  var SEEN = { A3: 'USS Yokohama, CAA Tokyo, Arai Bayside', A2: 'BayAuc, USS Tohoku, USS Saitama, USS Gunma, SMAP Sapporo', A1: 'USS Gunma', U3: 'GE Tokyo', U2: 'USS Saitama, USS Yokohama, CAA Tokyo', U1: 'SMAP Sapporo', B1: 'JU Tochigi', Y2: 'USS Tokyo', P1: 'JU Kanagawa' };
  var KEYS = ['A1', 'A2', 'A3', 'U1', 'U2', 'U3', 'B1', 'B2', 'E1', 'Y1', 'Y2', 'P1', 'S1', 'C1', 'X', 'XX'];
  var WHAT = { 1: 'лёгкая, обычно убирается полировкой или локально', 2: 'заметная, нужен локальный ремонт', 3: 'серьёзная, нужен кузовной ремонт и покраска' };
  $('kbd').innerHTML = KEYS.map(function (k, i) { return '<button type="button" data-k="' + k + '" aria-pressed="' + (i === 1) + '">' + k + '</button>'; }).join('');
  function decode(k) {
    var l = k.replace(/\d/g, ''), n = +k.replace(/\D/g, '') || 0, c = CODES[l];
    $('dec').innerHTML = '<b>' + k + '</b><p>' + c[0] + (n ? ': степень ' + n + ' — ' + WHAT[n] : '') + '.</p>'
      + (c[1] ? '<div class="lvl" aria-hidden="true">' + [1, 2, 3].map(function (x) { return '<i' + (x <= n ? ' class="on"' : '') + '></i>'; }).join('') + '</div>' : '')
      + (SEEN[k] ? '<small>Встречали в листах аукционов: ' + SEEN[k] + '</small>' : '');
  }
  $('kbd').addEventListener('click', function (e) {
    var b = e.target.closest('[data-k]'); if (!b) return;
    $('kbd').querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    decode(b.dataset.k);
  });
  decode('A2');

  /* ---------- отправки ---------- */
  var cnt = {}; SH.forEach(function (s) { cnt[s.city] = (cnt[s.city] || 0) + 1; });
  $('cities').innerHTML = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).map(function (c) { return '<span>' + esc(c) + '<b>' + cnt[c] + '</b></span>'; }).join('');
  $('shipList').innerHTML = SH.map(function (s) {
    return '<a class="ship" href="' + esc(s.post) + '" target="_blank" rel="noopener">' + (s.img ? '<img src="' + esc(s.img) + '" alt="' + esc(s.car) + ' перед отправкой" loading="lazy">' : '')
      + '<div><b>' + esc(s.car) + '</b><span>Передали в ТК → ' + esc(s.city) + '</span><time datetime="' + s.date + '">' + dt(s.date) + '</time></div></a>';
  }).join('');

  /* ---------- детейлинг ---------- */
  var SIZES = [['Мини', 'кей-кары, малолитражки'], ['Средние', 'и компактные кроссоверы'], ['Кроссоверы', 'минивэны, бизнес-седаны'], ['Большие', 'джипы, большие кроссоверы, автобусы']];
  var PACKS = [
    ['Базовый', [20000, 27000, 34000, 41000], 'Стандартная химчистка и сушка салона, консервация пластика и резины, экспресс-полировка кузова и фар, кондиционер шин и внешнего пластика.'],
    ['Оптимальный', [38000, 47000, 56000, 65000], 'Химчистка с частичным разбором, сушка и озонирование, восстановительная полировка кузова и фар, керамика в 2 слоя, очистка стёкол и антидождь на переднюю полусферу.'],
    ['Премиум', [52000, 62000, 72000, 82000], 'Всё из «Оптимального», плюс защита обивки, полировка задних фонарей, керамика в 4 слоя, антидождь на все стёкла и зеркала, химчистка подкапотного пространства.']
  ];
  var SVC = [
    ['Химчистка'], ['Стандартная*', [10000, 12000, 14000, 16000]], ['С частичным разбором*', [13000, 15000, 18000, 20000]],
    ['Полировка'], ['Экспресс-полировка*', [10000, 15000, 20000, 25000]], ['Восстановительная*', [15000, 20000, 25000, 30000]],
    ['Защитные покрытия'], ['Everglass, 1 слой', [7000, 8000, 9000, 10000]], ['Everglass, 2 слоя', [12000, 14000, 16000, 18000]], ['Everglass, 3 слоя', [16000, 20000, 23000, 26000]], ['Everglass, 4 слоя', [20000, 24000, 28000, 32000]],
    ['Антидождь, передняя полусфера', [4000, 5000, 6000, 7000]], ['Антидождь, все стёкла', [8000, 10000, 12000, 14000]], ['Химчистка подкапотного пространства', [3500, 4000, 4500, 5000]]
  ];
  var sz = 1, pk = 0;
  $('sizes').innerHTML = SIZES.map(function (s, i) { return '<button type="button" data-s="' + i + '" aria-pressed="' + (i === sz) + '"><b>' + (i + 1) + ' · ' + s[0] + '</b>' + s[1] + '</button>'; }).join('');
  function det() {
    $('pk').innerHTML = PACKS.map(function (p, i) { return '<button type="button" data-p="' + i + '" aria-pressed="' + (i === pk) + '"><span>' + p[0] + '</span><b>' + rub(p[1][sz]) + '</b></button>'; }).join('');
    $('pkD').textContent = PACKS[pk][2];
    $('svc').innerHTML = SVC.map(function (r) { return r[1] ? '<tr><td>' + r[0] + '</td><td>' + rub(r[1][sz]) + '</td></tr>' : '<tr class="g"><td colspan="2">' + r[0] + '</td></tr>'; }).join('');
    $('detWa').href = wa('Здравствуйте! Хочу записаться на детейлинг: комплекс «' + PACKS[pk][0] + '», размер авто — ' + SIZES[sz][0].toLowerCase() + ' (' + rub(PACKS[pk][1][sz]) + ' по прайсу на сайте). Когда есть время?');
  }
  $('sizes').addEventListener('click', function (e) {
    var b = e.target.closest('[data-s]'); if (!b) return; sz = +b.dataset.s;
    $('sizes').querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); det();
  });
  $('pk').addEventListener('click', function (e) { var b = e.target.closest('[data-p]'); if (!b) return; pk = +b.dataset.p; det(); });
  det();

  /* ---------- отзывы ---------- */
  var LIM = 260;
  $('revs').innerHTML = RV.map(function (r, i) {
    var long = r.text.length > LIM + 40, s = long ? r.text.slice(0, r.text.lastIndexOf(' ', LIM)) + '…' : r.text;
    return '<blockquote class="rev" data-rv><span class="st" aria-label="5 из 5">★★★★★</span><q id="rq' + i + '">' + esc(s) + '</q>'
      + (long ? '<button type="button" data-r="' + i + '" aria-controls="rq' + i + '" aria-expanded="false">Читать полностью</button>' : '')
      + '<footer><b>' + esc(r.name) + '</b> · ' + dt(r.date) + '</footer></blockquote>';
  }).join('');
  /* на телефоне сначала 5 отзывов */
  var revEls = $('revs').children, RMAX = small ? 5 : RV.length;
  for (var q = RMAX; q < revEls.length; q++) revEls[q].hidden = true;
  $('rMore').hidden = RMAX >= RV.length;
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
