// общие шапка, подвал, бронь в WhatsApp, галерея и анимации для всех страниц усадьбы Марковских
(() => {
  const WA = '79291616516', TEL = '+79291616516', TEL_H = '+7 929 161-65-16', MAIL = 'markovka130974@gmail.com';
  const GIS = 'https://2gis.ru/kaliningrad/firm/70000001056691697';
  // цены из прайса в 2ГИС, за сутки; у беседок цена в прайсе своя для каждой
  const STAY = [['Коттедж «Панорама»', 25000], ['Половина дома «Лесной дуэт»', 17000], ['«Лесной дуэт» целиком', 30000], ['Дом с камином', 35000], ['Беседка на день', 0]];
  const EXTRA = ['Рыбалка', 'Сапы, лодки, катамараны', 'Квадроциклы', 'Приедем с питомцем', 'Нужен трансфер'];
  const I = {
    logo: '<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="13" fill="#d9a441"/><path d="M10 24 24 12l14 12M14 22v10h20V22" stroke="#10231f" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 38c4-3 8 3 12 0s8 3 12 0 8 3 10 0" stroke="#10231f" stroke-width="2.6" stroke-linecap="round"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.5 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.1-4.7-4-4.9-4.2-.1-.2-1.2-1.6-1.2-3s.7-2.2 1-2.5c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>',
    tg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.4 4.2 2.9 11.3c-1.3.5-1.2 1.2-.2 1.5l4.7 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.8-1.4-1.4zM8.6 14l9.4-5.9c.5-.3.9-.1.5.2l-7.9 7.2-.3 3.4z"/></svg>',
    ph: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 8h16M4 16h16"/></svg>',
    l: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 5l-7 7 7 7"/></svg>',
    r: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 5l7 7-7 7"/></svg>'
  };
  const page = document.body.dataset.page;
  const NAV = [['doma.html', 'Дома', 'stay'], ['besedki.html', 'Беседки', 'gazebo'], ['otdyh.html', 'Рыбалка и отдых', 'rest'], ['kontakty.html', 'Как добраться', 'contacts']];
  const logo = `<a class="logo" href="index.html" aria-label="Усадьба Марковских — на главную">${I.logo}<div><b>Усадьба Марковских</b><span>Парк-усадьба · Логвино</span></div></a>`;

  document.body.insertAdjacentHTML('afterbegin', `
<header class="hd"><div class="wrap">${logo}
  <nav class="nav" aria-label="Разделы">${NAV.map(([h, t, k]) => `<a href="${h}"${k === page ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
  <a class="tel" href="tel:${TEL}">${TEL_H}</a>
  <button class="btn btn-s" data-book>Забронировать</button>
  <button class="burger" aria-label="Меню" data-menu>${I.menu}</button>
</div></header>
<div class="mnav" aria-hidden="true"><button class="x" aria-label="Закрыть меню" data-menu>${I.x}</button>
  <a class="m" href="index.html">Главная</a>${NAV.map(([h, t]) => `<a class="m" href="${h}">${t}</a>`).join('')}
  <div class="btm"><button class="btn btn-s" data-book>Забронировать</button><a class="btn btn-o" href="tel:${TEL}">${I.ph}${TEL_H}</a></div>
</div>`);

  document.body.insertAdjacentHTML('beforeend', `
<footer class="ft"><div class="wrap"><div class="g">
  <div>${logo}<p style="max-width:330px;margin-top:20px">Дома и беседки на берегу озера Большое в посёлке Логвино, Зеленоградский округ. Рыбалка, лес, прокат сапов и лодок.</p></div>
  <div><h4>Разделы</h4>${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}</div>
  <div><h4>Связь</h4><a href="tel:${TEL}">${TEL_H}</a><a href="https://wa.me/${WA}" target="_blank" rel="noopener">WhatsApp</a><a href="https://t.me/+${WA}" target="_blank" rel="noopener">Telegram</a><a href="mailto:${MAIL}">${MAIL}</a></div>
  <div><h4>Где мы</h4><a href="kontakty.html">пос. Логвино, Ростовская улица, 21</a><p style="padding-top:5px">Работаем круглосуточно<br>Беседки — с 8:00 до 21:00</p></div>
</div><div class="cp"><span>© Парк-усадьба Марковских, Калининградская область</span><a href="${GIS}" target="_blank" rel="noopener" style="display:inline;padding:0">4.9 ★ в 2ГИС · 29 оценок</a></div></div></footer>
<div class="mbar"><a href="tel:${TEL}">${I.ph}Звонок</a><button data-book>${I.wa}Забронировать</button></div>
<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="bk-t"><div class="bd" data-close></div><div class="pn">
  <button class="x" aria-label="Закрыть" data-close>${I.x}</button>
  <span class="eb">Бронь</span><h3 id="bk-t">Проверим, <em>свободны ли даты</em></h3>
  <p style="color:var(--mut);margin-top:10px">Заявка уйдёт администратору усадьбы в WhatsApp — вам ответят, свободны ли даты, и назовут точную цену.</p>
  <form class="fm" id="bk" novalidate>
    <div class="lb2">Что забронировать<div class="chips" id="bk-s">${STAY.map(([t, p]) => `<button type="button" aria-pressed="false" data-p="${p}">${t}</button>`).join('')}</div></div>
    <div class="two"><label for="bk-in">Заезд<input class="inp" id="bk-in" type="date"></label><label for="bk-out">Выезд<input class="inp" id="bk-out" type="date"></label></div>
    <div class="two"><label for="bk-a">Взрослых<input class="inp" id="bk-a" type="number" min="1" max="30" inputmode="numeric" placeholder="2"></label><label for="bk-k">Детей<input class="inp" id="bk-k" type="number" min="0" max="20" inputmode="numeric" placeholder="0"></label></div>
    <div class="lb2">Дополнительно<div class="chips" id="bk-x">${EXTRA.map(t => `<button type="button" aria-pressed="false">${t}</button>`).join('')}</div></div>
    <p class="est" id="bk-e" aria-live="polite"></p>
    <label for="bk-n">Имя<input class="inp" id="bk-n" autocomplete="name" placeholder="Как к вам обращаться"></label>
    <label for="bk-c">Комментарий<input class="inp" id="bk-c" placeholder="Например: беседка №3 на субботу, нас 8"></label>
    <button class="btn btn-wa" type="submit">${I.wa}Отправить в WhatsApp</button>
    <p class="note">Откроется WhatsApp с готовым сообщением — останется нажать «отправить». Этот же номер есть в Telegram.</p>
  </form>
  <div class="alt"><a href="tel:${TEL}">${I.ph}Позвонить</a><a href="https://t.me/+${WA}" target="_blank" rel="noopener">${I.tg}Telegram</a></div>
</div></div>
<div class="lb" role="dialog" aria-modal="true" aria-label="Фотография"><img alt=""><p class="cap"></p>
  <button class="x" aria-label="Закрыть" data-lbx>${I.x}</button><button class="pv" aria-label="Предыдущее фото">${I.l}</button><button class="nx" aria-label="Следующее фото">${I.r}</button></div>`);

  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const hd = $('.hd'), mbar = $('.mbar'), sheet = $('.sheet'), mnav = $('.mnav'), lb = $('.lb');
  const onScroll = () => { const y = scrollY; hd.classList.toggle('solid', y > 40); mbar.classList.toggle('on', y > 480) };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const today = new Date().toISOString().slice(0, 10);
  $('#bk-in').min = today; $('#bk-out').min = today;

  // ориентировочная сумма: ночи × цена «от» выбранного варианта
  const nights = () => { const a = $('#bk-in').value, b = $('#bk-out').value; return a && b ? Math.round((new Date(b) - new Date(a)) / 864e5) : 0 };
  const rub = n => n.toLocaleString('ru-RU') + ' ₽';
  const plural = n => n % 10 === 1 && n % 100 !== 11 ? 'ночь' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'ночи' : 'ночей';
  const estimate = () => {
    const s = $$('#bk-s button[aria-pressed=true]'), n = nights(), e = $('#bk-e');
    if ($('#bk-in').value) $('#bk-out').min = $('#bk-in').value;
    if (s.length !== 1 || n < 1 || !+s[0].dataset.p) { e.classList.remove('on'); return }
    e.innerHTML = `${n} ${plural(n)} · по прайсу <b>${rub(n * +s[0].dataset.p)}</b>. Точную цену на ваши даты подтвердит администратор.`;
    e.classList.add('on');
  };
  ['#bk-in', '#bk-out'].forEach(id => $(id).addEventListener('change', estimate));

  const toggleMenu = open => { mnav.classList.toggle('open', open); mnav.setAttribute('aria-hidden', String(!open)); document.body.style.overflow = open ? 'hidden' : '' };
  const openSheet = (stay, extra) => {
    toggleMenu(false);
    if (stay) $$('#bk-s button').forEach(b => b.setAttribute('aria-pressed', String(b.textContent === stay)));
    if (extra) $$('#bk-x button').forEach(b => { if (b.textContent === extra) b.setAttribute('aria-pressed', 'true') });
    estimate();
    sheet.classList.add('open'); document.body.style.overflow = 'hidden';
  };
  const closeSheet = () => { sheet.classList.remove('open'); document.body.style.overflow = '' };

  let set = [], at = 0;
  const show = i => { at = (i + set.length) % set.length; const im = set[at].querySelector('img'); lb.querySelector('img').src = im.src; lb.querySelector('img').alt = im.alt; lb.querySelector('.cap').textContent = `${im.alt} · ${at + 1} / ${set.length}` };
  const closeLb = () => { lb.classList.remove('open'); document.body.style.overflow = '' };

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-book]'); if (b) { e.preventDefault(); openSheet(b.dataset.book, b.dataset.extra) }
    if (e.target.closest('[data-close]')) closeSheet();
    if (e.target.closest('[data-menu]')) toggleMenu(!mnav.classList.contains('open'));
    const c = e.target.closest('#bk-s button,#bk-x button'); if (c) { c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true')); estimate() }
    const g = e.target.closest('.gal button'); if (g) { set = [...g.closest('.gal').querySelectorAll('button')]; show(set.indexOf(g)); lb.classList.add('open'); document.body.style.overflow = 'hidden' }
    if (e.target.closest('[data-lbx]') || e.target === lb) closeLb();
    if (e.target.closest('.lb .pv')) show(at - 1);
    if (e.target.closest('.lb .nx')) show(at + 1);
  });
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeSheet(); toggleMenu(false); closeLb() }
    if (lb.classList.contains('open') && e.key === 'ArrowLeft') show(at - 1);
    if (lb.classList.contains('open') && e.key === 'ArrowRight') show(at + 1);
  });

  const fmtDate = v => v ? new Date(v + 'T12:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' }) : '';
  $('#bk').addEventListener('submit', e => {
    e.preventDefault();
    const pick = id => $$(id + ' button[aria-pressed=true]').map(b => b.textContent), v = id => $(id).value.trim();
    const stay = pick('#bk-s'), extra = pick('#bk-x');
    const text = ['Здравствуйте! Пишу с сайта усадьбы Марковских, хочу забронировать.', stay.length && 'Что забронировать: ' + stay.join(', '),
      v('#bk-in') && 'Заезд: ' + fmtDate(v('#bk-in')), v('#bk-out') && 'Выезд: ' + fmtDate(v('#bk-out')),
      v('#bk-a') && 'Взрослых: ' + v('#bk-a'), +v('#bk-k') > 0 && 'Детей: ' + v('#bk-k'),
      extra.length && 'Ещё: ' + extra.join(', '), v('#bk-n') && 'Имя: ' + v('#bk-n'), v('#bk-c') && v('#bk-c')].filter(Boolean).join('\n');
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });

  const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target) } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach(el => io.observe(el));
  window.MK = { openSheet };
})();
