/* Автоподбор005: настоящий отчёт об осмотре, замеры толщиномера, сроки, машины клиентов, отзывы 2ГИС, заявка в WhatsApp. Отзывы и замеры — js/data.js (собирает custom-wip/avtopodbor005-koms/build.py) */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var WA = '79243080808';
  var waUrl = function (t) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t); };
  var RV = window.RV, TH = window.TH, READ = window.READ, WALL = window.WALL;
  var isMob = function () { return window.innerWidth < 641; };
  var dec = function (v) { return String(v).replace('.', ','); };

  /* появление */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px' }) : null;
  $$('[data-rv]').forEach(function (el) { if (io) io.observe(el); else el.classList.add('on'); });

  /* местное время: клиенты пишут из других часовых поясов */
  function paintTime() {
    var t = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Asia/Vladivostok', hour: '2-digit', minute: '2-digit' }).format(new Date());
    $$('[data-time]').forEach(function (el) { el.textContent = 'Сейчас в Комсомольске-на-Амуре ' + t; });
  }
  paintTime(); setInterval(paintTime, 30000);

  /* окна */
  function openDlg(d) { if (d.showModal) d.showModal(); else d.setAttribute('open', ''); document.documentElement.style.overflow = 'hidden'; d.scrollTop = 0; }
  $$('dialog').forEach(function (d) {
    d.addEventListener('close', function () { document.documentElement.style.overflow = ''; });
    d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
  });

  /* ---------- настоящий отчёт: Хюндай Крета, данные со снимка отчёта в отзыве, июнь 2024 ---------- */
  /* [номер, название, замеры, среднее, отклонение, перекрашено, контур, x, y числа] */
  var P = [
    [1, 'Капот', [167, 167, 160, 164, 156, 156], 161.7, 11.8, 0, 'M100 66Q170 44 240 66L246 166Q170 154 94 166Z', 170, 110],
    [2, 'Левое переднее крыло', [165, 143, 134, 134, 156, 174], 151.2, 40.5, 1, 'M48 100Q54 66 92 58L88 172H48Z', 70, 122],
    [3, 'Левая передняя стойка', null, 0, 0, 0, 'M94 178H106L114 236 100 240Z', 104, 208],
    [4, 'Левая передняя дверь', [110, 113, 102, 106, 121, 117], 111.3, 19.3, 0, 'M48 178H90V298H48Z', 69, 238],
    [5, 'Левая центральная стойка', [72.8, 57.8, 73.1, 73.3, 63.3, 63.0], 67.2, 15.5, 0, 'M48 302H90V322H48Z', 69, 312],
    [6, 'Левая задняя дверь', [93.0, 114, 108, 102, 114, 118], 108.2, 25.2, 0, 'M48 326H90V430H48Z', 69, 378],
    [7, 'Левая задняя стойка', [111, 111, 96.9, 97.1, 102, 99.8], 102.9, 14.1, 0, 'M96 392H110L114 456 100 464Z', 105, 428],
    [8, 'Левое заднее крыло', [103, 99.8, 104, 115, 106, 130], 109.6, 29.7, 0, 'M48 434H90V552Q60 548 48 512Z', 69, 490],
    [9, 'Левая стойка багажника', null, 0, 0, 0, 'M98 470L114 462 118 508 100 516Z', 107, 490],
    [10, 'Крышка багажника', [116, 112, 112, 112, 93.5, 109], 109.1, 22.7, 0, 'M98 522Q170 508 242 522L238 576Q170 594 102 576Z', 170, 552],
    [11, 'Правая стойка багажника', null, 0, 0, 0, 'M242 470L226 462 222 508 240 516Z', 233, 490],
    [12, 'Правое заднее крыло', [124, 95.4, 101, 109, 88.1, 98.4], 102.7, 35.5, 0, 'M292 434H250V552Q280 548 292 512Z', 271, 490],
    [13, 'Правая задняя стойка', [113, 113, 107, 104, 99.4, 95.4], 105.4, 17.8, 0, 'M244 392H230L226 456 240 464Z', 235, 428],
    [14, 'Правая задняя дверь', [102, 96.9, 115, 110, 96.9, 105], 104.3, 18.3, 0, 'M292 326H250V430H292Z', 271, 378],
    [15, 'Правая центральная стойка', [83.8, 109, 102, 102, 97.9, 101], 99.3, 25.5, 0, 'M292 302H250V322H292Z', 271, 312],
    [16, 'Правая передняя дверь', [164, 192, 195, 195, 195, 195], 189.4, 31.1, 1, 'M292 178H250V298H292Z', 271, 238],
    [17, 'Правая передняя стойка', null, 0, 0, 0, 'M246 178H234L226 236 240 240Z', 236, 208],
    [18, 'Правое переднее крыло', [182, 164, 160, 152, 169, 193], 170.1, 41.4, 1, 'M292 100Q286 66 248 58L252 172H292Z', 270, 122],
    [19, 'Крыша', [87.0, 107, 107, 87.0, 109, 100], 99.5, 21.8, 0, 'M122 244Q170 236 218 244V386Q170 394 122 386Z', 170, 315]
  ];
  var sel = 16;
  $('#plan').innerHTML = '<rect class="wheel" x="38" y="104" width="10" height="56" rx="3"/><rect class="wheel" x="292" y="104" width="10" height="56" rx="3"/><rect class="wheel" x="38" y="458" width="10" height="56" rx="3"/><rect class="wheel" x="292" y="458" width="10" height="56" rx="3"/>'
    + '<path class="glass" d="M116 176Q170 164 224 176L216 234Q170 226 124 234Z"/><path class="glass" d="M122 396Q170 404 218 396L224 454Q170 468 116 454Z"/>'
    + '<path class="glass" d="M96 246H114V386H96Z"/><path class="glass" d="M244 246H226V386H244Z"/>'
    + P.map(function (p) { return '<g class="pz' + (p[5] ? ' bad' : '') + (p[2] ? '' : ' none') + '" data-p="' + p[0] + '" tabindex="0" role="button" aria-label="' + esc(p[1]) + (p[5] ? ', перекрашено' : '') + '"><path d="' + p[6] + '"/><text x="' + p[7] + '" y="' + p[8] + '">' + p[0] + '</text></g>'; }).join('');
  $('#repB2').innerHTML = P.map(function (p) {
    return '<tr class="' + (p[5] ? 'bad' : '') + '" data-p="' + p[0] + '"><td><button type="button" data-p="' + p[0] + '"><i>' + p[0] + '</i>' + esc(p[1]) + '</button></td><td>' + (p[2] ? dec(p[3]) : '—') + '</td><td>' + (p[2] ? dec(p[4]) : '—') + '</td></tr>';
  }).join('');
  function paintRep() {
    var p = P[sel - 1];
    $$('.pz, #repB2 tr').forEach(function (el) { el.classList.toggle('sel', +el.dataset.p === sel); });
    $('#repD').innerHTML = '<div class="nm">' + p[0] + '. ' + esc(p[1]) + '</div>'
      + '<span class="st' + (p[5] ? ' bad' : '') + '">' + (p[5] ? 'В отчёте: перекрашено' : p[2] ? 'В отчёте без отметки' : 'Замера нет') + '</span>'
      + (p[2] ? '<div class="six">' + p[2].map(function (v) { return '<span class="lcd">' + dec(v) + '</span>'; }).join('') + '</div>'
        + '<div class="sum"><div><b>' + dec(p[3]) + '</b>среднее, мкм</div><div><b>' + dec(p[4]) + '</b>отклонение, мкм</div></div>'
        : '<p class="hint2">По этой стойке в отчёте стоит 0: замеров нет.</p>')
      + '<p class="hint2">Шесть точек на одной детали. Числа и отметки со снимка отчёта: откройте оригинал ниже.</p>';
  }
  function pickP(n) { sel = n; paintRep(); }
  $('#plan').addEventListener('click', function (e) { var g = e.target.closest('[data-p]'); if (g) pickP(+g.dataset.p); });
  $('#plan').addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.dataset.p) { e.preventDefault(); pickP(+e.target.dataset.p); } });
  $('#repB2').addEventListener('click', function (e) { var b = e.target.closest('button[data-p]'); if (b) pickP(+b.dataset.p); });
  paintRep();
  if (isMob()) $('#repT').removeAttribute('open');
  $('#repOpen').addEventListener('click', function () { openDlg($('#repD2')); });

  /* ---------- замеры толщиномера: от больших к маленьким ---------- */
  var MON = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
  var when = function (d) { return d ? MON[+d.slice(5) - 1] + ' ' + d.slice(0, 4) : ''; };
  var reads = READ.slice().sort(function (a, c) { return c.v - a.v; }), gAll = false;
  var gBar = function (v) { return Math.round((Math.log(v) - Math.log(50)) / (Math.log(3000) - Math.log(50)) * 100); };
  function renderG() {
    var n = gAll ? reads.length : (isMob() ? 8 : window.innerWidth < 1001 ? 12 : 12);
    $('#gGrid').innerHTML = reads.slice(0, n).map(function (r, i) {
      return '<button class="g" type="button" data-g="' + i + '" aria-label="Замер ' + dec(r.v) + ' микрон. ' + (r.k >= 0 ? 'Открыть отзыв: ' + esc(r.a) : 'Открыть фото') + '"><img src="img/rv/' + r.img + '_r.jpg" alt="Толщиномер показывает ' + dec(r.v) + ' микрон" loading="lazy" width="360" height="480"><span class="g-b"><span class="lcd">' + dec(r.v) + '<small>мкм</small></span><span class="g-bar" aria-hidden="true"><i style="width:' + gBar(r.v) + '%"></i></span><small>' + esc(r.a) + (r.m ? ', ' + esc(r.m) : '') + '</small></span></button>';
    }).join('');
    var m = $('#gMore'); m.hidden = gAll || n >= reads.length; m.textContent = 'Показать все ' + reads.length + ' замера';
  }
  renderG();
  $('#gMore').addEventListener('click', function () { gAll = true; renderG(); });

  /* ---------- сроки: [машина, кто, поиск и торги, доставка, дорога домой, итог, конечная точка] ---------- */
  var TL = [
    ['Mazda Axela', 'Клиент, март 2024', 0, 15, 0, '15 дней', 'машина уже у порога'],
    ['Машина из Японии', 'Юрий, сентябрь 2026', 0, 15, 0, '15 дней', 'от покупки на аукционе до получения с автовоза'],
    ['Машина клиента', 'Виктория, июнь 2026', 0, 14, 0, '2 недели', 'во Владивостоке'],
    ['Подбор за сутки, ограниченный бюджет', 'Андрей, май 2024', 1, 14, 0, '15 дней', 'вышла с таможни во Владивостоке'],
    ['Toyota Corolla Fielder', 'Клиент, октябрь 2023', 2, 14, 0, '16 дней', 'во Владивостоке'],
    ['Машина клиента', 'Владимир, октябрь 2023', 2, 15, 0, 'около 17', 'чуть больше 2 недель после торгов'],
    ['Машина клиента', 'Клиент, сентябрь 2026', 3, 14, 0, '17 дней', 'впервые сел за руль'],
    ['Машина клиента', 'Ислам, июнь 2024', 0, 19, 0, '19 дней', 'привёз'],
    ['Nissan Note', 'Сергей, октябрь 2026', 3, 14, 3, '20 дней', 'ездит на новой машине'],
    ['Subaru Levorg', 'Вадим, август 2024', 6, 19, 0, '25 дней', 'прошла таможню, ждёт автовоз'],
    ['Санкционная машина', 'Дмитрий, май 2026', 2, 39, 7, '48 дней', 'дома, забирал сам']
  ];
  var TLMAX = 48;
  $('#tlRows').innerHTML = TL.map(function (t) {
    var seg = function (v, c) { return v ? '<i class="' + c + '" style="width:' + (v / TLMAX * 62) + '%"></i>' : ''; };
    return '<div class="tr"><div class="tr-n"><b>' + esc(t[0]) + '</b><small>' + esc(t[1]) + '</small></div><div class="tr-b" role="img" aria-label="' + esc(t[5] + ', ' + t[6]) + '">' + seg(t[2], 'c1') + seg(t[3], 'c2') + seg(t[4], 'c3') + '<span>' + esc(t[5]) + '<small> ' + esc(t[6]) + '</small></span></div></div>';
  }).join('');

  /* ---------- машины клиентов: [откуда, модель, снимок, номер отзыва, срок, слова клиента, кто] ---------- */
  var SHOW = [
    ['jp', 'Nissan Note', 'r003_0', 3, '3 дня и 2 недели', 'Нашли автомобиль на аукционе за 3 дня, процесс доставки составил всего 2 недели до Владивостока', 'Сергей, октябрь 2026'],
    ['cn', 'Электромобиль', 'r007_0', 7, '', 'Очень оперативно нашел мне нужную машину именно в том цвете и той комплектации которую я хотел', 'Алексей, октябрь 2026'],
    ['jp', 'Subaru Levorg', 'r089_3', 89, '19 дней', 'Весь процесс занял ровно 19 дней с момента удачной ставки на аукционе', 'Вадим, август 2024'],
    ['cn', 'Honda Vezel', 'r059_1', 59, 'в Москву', 'Доставка авто нужна была в Москву! В итоге — вауля! Моя красотка у меня в Москве', 'Светлана, июнь 2025'],
    ['jp', 'Mazda Axela', 'r142_0', 142, '15 дней', 'Получили пушку за очень короткие сроки. 15 дней, машина уже у порога', 'Клиент, март 2024'],
    ['jp', 'Toyota Corolla Axio', 'r067_0', 67, '15 000 км', 'В итоге купили идеальный вариант с пробегом всего 15.000 км, в состоянии нового авто', 'Клиент, апрель 2025'],
    ['cn', 'Hyundai Elantra', 'r038_0', 38, '', 'Мы заказали у него два авто джили и элантру (из Китая) сравнив везде цены, у него оказались самые выгодные!', 'Клиент, декабрь 2025'],
    ['jp', 'Toyota Corolla Fielder', 'r061_0', 61, 'меньше месяца', 'Задача была найти полноприводный Филдер… Машина меньше чем за месяц уже у нас', 'Клиент, июнь 2025'],
    ['jp', 'Mercedes-Benz C-class W205', 'r102_0', 102, '', 'Машинку идеальную нашли, и по моему бюджету!', 'Денис, июль 2024'],
    ['jp', 'Санкционная машина', 'r029_0', 29, '39 дней после торгов', 'Так машина санкционная, поэтому пришлось больше месяца подождать. Руслан сразу сказал, сроки 30-40 дней.', 'Дмитрий, май 2026'],
    ['jp', 'Toyota Allion', 'r128_0', 128, '', 'Все быстро, никакого участия кроме выбора принимать не приходилось', 'Эльвира, май 2024'],
    ['ru', 'Toyota Land Cruiser Prado 95', 'r169_0', 169, '', 'Очень трудно найти TLC PRADO в 95 кузове живого, еще и на KZ моторе, но Руслан как всегда, все сделал оперативно и четко!', 'Сергей, октябрь 2023'],
    ['jp', 'Toyota Corolla Fielder', 'r170_2', 170, '2 недели', 'От момента покупки на аукционе до привоза во Владивосток прошло ровно 2 недели', 'Клиент, октябрь 2023'],
    ['jp', 'Honda Fit Shuttle', 'r132_0', 132, '', 'Привёз Honda fit shuttle в кратчайшие сроки, был на связи 24/7', 'Сергей, апрель 2024'],
    ['jp', 'Toyota Wish', 'r031_0', 31, '', 'Заказали у Руслана 005 тойоту виш все прошло отлично', 'Санжар, май 2026']
  ];
  var LAB = { all: 'Все', jp: 'Из Японии', cn: 'Из Китая', ru: 'С рынка России' };
  var sw = 'all';
  $('#sF').innerHTML = ['all', 'jp', 'cn', 'ru'].map(function (k) { var n = k === 'all' ? SHOW.length : SHOW.filter(function (s) { return s[0] === k; }).length; return '<button class="chip" type="button" data-s="' + k + '" aria-pressed="' + (k === 'all') + '">' + LAB[k] + '<small>' + n + '</small></button>'; }).join('');
  var WISH = '<div class="wish"><h3>Хотите такую же?</h3><p>Напишите модель и бюджет. Руслан ответит, что сейчас есть на аукционах и как быстро можно привезти.</p><a class="btn btn-p" href="#contacts">Подобрать машину</a><a class="btn btn-d" href="#calc">Посчитать под ключ</a></div>';
  function renderS() {
    var l = SHOW.filter(function (s) { return sw === 'all' || s[0] === sw; });
    $('#sGrid').innerHTML = l.map(function (s) {
      return '<article class="car"><button class="car-ph" type="button" data-k="' + s[3] + '" data-img="' + s[2] + '" aria-label="Открыть отзыв: ' + esc(s[1]) + '"><img src="img/rv/' + s[2] + '_t.jpg" alt="' + esc(s[1]) + ', машина клиента" loading="lazy" width="440" height="330"><span class="tag">' + LAB[s[0]] + '</span></button><div class="car-b"><h3>' + esc(s[1]) + '</h3>' + (s[4] ? '<span class="lcd term">' + esc(s[4]) + '</span>' : '') + '<q>' + esc(s[5]) + '</q><small>' + esc(s[6]) + '</small></div></article>';
    }).join('') + (l.length % 3 === 2 || sw !== 'all' ? WISH : '');
    $$('#sF .chip').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.s === sw); });
  }
  $('#sF').addEventListener('click', function (e) { var b = e.target.closest('[data-s]'); if (b) { sw = b.dataset.s; renderS(); } });
  renderS();
  $('#wall').innerHTML = WALL.map(function (n) {
    var k = +n.slice(1, 4); var r = RV.filter(function (x) { return x.k === k; })[0];
    return '<button type="button" data-k="' + k + '" data-img="' + n + '" aria-label="Отзыв: ' + esc(r ? r.a : '') + '"><img src="img/rv/' + n + '_t.jpg" alt="' + esc(r && r.m ? r.m : 'Машина клиента') + '" loading="lazy" width="440" height="330"></button>';
  }).join('');

  /* ---------- отзывы ---------- */
  var rvTh = 'all', rvPage = 0;
  var rvPer = function () { return isMob() ? 4 : window.innerWidth < 1001 ? 6 : 9; };
  $('#rvF').innerHTML = '<button class="chip" type="button" data-th="all" aria-pressed="true">Все<small>' + RV.length + '</small></button>' + TH.map(function (t) { return '<button class="chip" type="button" data-th="' + t[0] + '" aria-pressed="false">' + esc(t[1]) + '<small>' + t[2] + '</small></button>'; }).join('');
  function rvList() {
    var l = RV.map(function (r, i) { return i; });
    if (rvTh !== 'all') l = l.filter(function (i) { return RV[i].th.indexOf(rvTh) >= 0; });
    return l.sort(function (a, c) { return ((RV[c].x.length > 70) - (RV[a].x.length > 70)) || ((RV[c].img ? 1 : 0) - (RV[a].img ? 1 : 0)) || (a - c); });
  }
  function renderRv() {
    var l = rvList(), s = l.slice(0, (rvPage + 1) * rvPer());
    $('#rvs').innerHTML = s.map(function (i) {
      var r = RV[i];
      return '<article class="rv"><div class="rv-top">' + (r.img ? '<img src="img/rv/' + r.img + '_t.jpg" alt="" loading="lazy" width="76" height="58">' : '') + '<div><div class="rv-st" aria-label="5 из 5">★★★★★</div><div class="rv-w"><b>' + esc(r.a) + '</b>, ' + when(r.d) + (r.m ? '<br>' + esc(r.m) : '') + '</div></div></div><p>' + esc(r.x) + '</p>' + (r.t.length > r.x.length + 12 ? '<button type="button" data-k="' + r.k + '">Читать весь отзыв</button>' : '') + '</article>';
    }).join('');
    var left = l.length - s.length, m = $('#rvMore'); m.hidden = left <= 0; m.textContent = 'Показать ещё отзывы (' + left + ')';
  }
  $('#rvF').addEventListener('click', function (e) { var b = e.target.closest('[data-th]'); if (!b) return; rvTh = b.dataset.th; rvPage = 0; $$('#rvF .chip').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); renderRv(); });
  $('#rvMore').addEventListener('click', function () { rvPage++; renderRv(); });
  renderRv();
  function openRv(k, img) {
    var r = RV.filter(function (x) { return x.k === k; })[0]; if (!r) return;
    var ph = img || r.img;
    $('#rvB').innerHTML = (ph ? '<img src="img/rv/' + ph + '.jpg" alt="' + esc(r.m ? 'Машина клиента: ' + r.m : 'Снимок клиента') + '">' : '') + '<div class="rv-d"><small><b>' + esc(r.a) + '</b>, ' + when(r.d) + (r.m ? ', ' + esc(r.m) : '') + ' · отзыв в 2ГИС</small><p>' + esc(r.t) + '</p></div>';
    openDlg($('#rvD'));
  }
  function openPhoto(img) {
    $('#rvB').innerHTML = '<img src="img/rv/' + img + '.jpg" alt="Замер толщиномером"><div class="rv-d"><small>Фото компании в 2ГИС</small></div>';
    openDlg($('#rvD'));
  }

  document.addEventListener('click', function (e) {
    var g = e.target.closest('[data-g]');
    if (g) { var r = reads[+g.dataset.g]; if (r.k >= 0) openRv(r.k, r.img); else openPhoto(r.img); return; }
    var o = e.target.closest('[data-k]');
    if (o) openRv(+o.dataset.k, o.dataset.img);
  });

  /* ---------- калькулятор: пример по стране, пока человек не ввёл своё ---------- */
  var setR = function (n, v) { var x = $('input[name="' + n + '"][value="' + v + '"]'); if (x) x.checked = true; };
  var EX = { JP: ['1 500 000', '1490', '120', 'Пример: 1 500 000 ¥, 1,5 л, 120 л.с. Впишите свою ставку'], KR: ['20 000 000', '1598', '123', 'Пример: 20 000 000 вон, 1,6 л, 123 л.с. Впишите цену продавца'], CN: ['100 000', '1497', '150', 'Пример: 100 000 юаней, 1,5 л, 150 л.с. Впишите цену продавца'] };
  var exMode = true;
  function example(c) { var e = EX[c]; if (!e) return; setR('age', '3to5'); $('#price').value = e[0]; $('#cc').value = e[1]; $('#hp').value = e[2]; $('#price-h').textContent = e[3]; $('#hp').dispatchEvent(new Event('input', { bubbles: true })); }
  ['#price', '#cc', '#hp'].forEach(function (s) { $(s).addEventListener('input', function (e) { if (e.isTrusted) exMode = false; }); });
  document.addEventListener('change', function (e) { if (e.target.name === 'country' && exMode) example(e.target.value); });
  example('JP');

  /* ---------- заявка ---------- */
  var F = { lWhat: 'Напишите, какая машина и бюджет', lName: 'Напишите, как к вам обращаться' };
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
    var t = 'Здравствуйте, Руслан! Меня зовут ' + $('#lName').value.trim() + '.\nНужно: ' + $('#lSvc').value + '.\n' + $('#lWhat').value.trim() + '\nПодскажите, пожалуйста.';
    var url = waUrl(t);
    $('#sentA').href = url; $('#sent').hidden = false;
    window.open(url, '_blank', 'noopener');
  });
})();
