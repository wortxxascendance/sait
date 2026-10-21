// общие шапка, подвал, запись в WhatsApp, галерея и анимации для всех страниц ЦТС
(() => {
  const WA = '79272313781', TEL = '+79272313781', TEL_H = '+7 927 231-37-81';
  const GIS = 'https://2gis.ru/ufa/firm/2393065583467081';
  const WHAT = ['Задняя полусфера', 'Передние боковые', 'Тонировка в круг', 'Атермальная на лобовое', 'Снять старую плёнку', 'Бронь лобового', 'Антигравийная защита', 'Автовинил'];
  const I = {
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.5 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.1-4.7-4-4.9-4.2-.1-.2-1.2-1.6-1.2-3s.7-2.2 1-2.5c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>',
    ph: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 8h16M4 16h16"/></svg>',
    l: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 5l-7 7 7 7"/></svg>',
    r: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 5l7 7-7 7"/></svg>'
  };
  const page = document.body.dataset.page;
  const NAV = [['uslugi.html', 'Услуги', 'services'], ['raboty.html', 'Работы', 'works'], ['otzyvy.html', 'Отзывы', 'reviews'], ['kontakty.html', 'Контакты', 'contacts']];
  const logo = `<a class="logo" href="index.html" aria-label="ЦТС — на главную"><i>ЦТС</i><div><b>ЦТС</b><span>Центр тонирования · Уфа</span></div></a>`;

  document.body.insertAdjacentHTML('afterbegin', `
<header class="hd"><div class="wrap">${logo}
  <nav class="nav" aria-label="Разделы">${NAV.map(([h, t, k]) => `<a href="${h}"${k === page ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
  <a class="tel" href="tel:${TEL}">${TEL_H}</a>
  <button class="btn btn-a" data-book>Записаться</button>
  <button class="burger" aria-label="Меню" data-menu>${I.menu}</button>
</div></header>
<div class="mnav" aria-hidden="true"><button class="x" aria-label="Закрыть меню" data-menu>${I.x}</button>
  <a class="m" href="index.html">Главная</a>${NAV.map(([h, t]) => `<a class="m" href="${h}">${t}</a>`).join('')}
  <div class="btm"><button class="btn btn-a" data-book>Записаться</button><a class="btn btn-o" href="tel:${TEL}">${I.ph}${TEL_H}</a></div>
</div>`);

  document.body.insertAdjacentHTML('beforeend', `
<footer class="ft"><div class="wrap"><div class="g">
  <div>${logo}<p style="max-width:320px;margin-top:20px">Тонировка автостёкол любой сложности, бронь лобового, антигравийная защита и автовинил в Уфе.</p></div>
  <div><h4>Разделы</h4>${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}</div>
  <div><h4>Связь</h4><a href="tel:${TEL}">${TEL_H}</a><a href="https://wa.me/${WA}" target="_blank" rel="noopener">WhatsApp</a><a href="viber://chat?number=%2B${WA}">Viber</a></div>
  <div><h4>Где мы</h4><a href="kontakty.html">ул. Рихарда Зорге, 12/1, бокс 6</a><p style="padding-top:5px">Пн–Сб 10:00–19:00<br>Вс 12:00–18:00</p></div>
</div><div class="cp"><span>© ЦТС, центр тонирования, Уфа</span><a href="${GIS}" target="_blank" rel="noopener" style="display:inline;padding:0">4.9 ★ в 2ГИС · 82 оценки</a></div></div></footer>
<div class="mbar"><a href="tel:${TEL}">${I.ph}Звонок</a><button data-book>${I.wa}Записаться</button></div>
<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="bk-t"><div class="bd" data-close></div><div class="pn">
  <button class="x" aria-label="Закрыть" data-close>${I.x}</button>
  <span class="eb">Запись</span><h3 id="bk-t">Запишитесь <span style="color:var(--acc)">на удобное время</span></h3>
  <p style="color:var(--mut);margin-top:10px">Заявка уйдёт мастеру в WhatsApp — он назовёт цену для вашей машины и предложит время.</p>
  <form class="fm" id="bk" novalidate>
    <div class="lb2">Что сделать<div class="chips" id="bk-w">${WHAT.map(p => `<button type="button" aria-pressed="false">${p}</button>`).join('')}</div></div>
    <div class="two"><label for="bk-car">Марка и модель<input class="inp" id="bk-car" placeholder="Toyota RAV4"></label><label for="bk-d">Когда удобно<input class="inp" id="bk-d" type="date"></label></div>
    <label for="bk-n">Имя<input class="inp" id="bk-n" autocomplete="name" placeholder="Как к вам обращаться"></label>
    <label for="bk-c">Комментарий<input class="inp" id="bk-c" placeholder="Например: задние 5%, есть заводская тонировка"></label>
    <button class="btn btn-wa" type="submit">${I.wa}Отправить в WhatsApp</button>
    <p class="note">Откроется WhatsApp с готовым сообщением — останется нажать «отправить».</p>
  </form>
  <div class="alt2"><a href="tel:${TEL}">${I.ph}Позвонить</a><a href="viber://chat?number=%2B${WA}">Viber</a></div>
</div></div>
<div class="lb" role="dialog" aria-modal="true" aria-label="Фотография"><img alt=""><p class="cap"></p>
  <button class="x" aria-label="Закрыть" data-lbx>${I.x}</button><button class="pv" aria-label="Предыдущее фото">${I.l}</button><button class="nx" aria-label="Следующее фото">${I.r}</button></div>`);

  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const hd = $('.hd'), mbar = $('.mbar'), sheet = $('.sheet'), mnav = $('.mnav'), lb = $('.lb');
  const onScroll = () => { const y = scrollY; hd.classList.toggle('solid', y > 40); mbar.classList.toggle('on', y > 480) };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('#bk-d').min = new Date().toISOString().slice(0, 10);

  const toggleMenu = open => { mnav.classList.toggle('open', open); mnav.setAttribute('aria-hidden', String(!open)); document.body.style.overflow = open ? 'hidden' : '' };
  // what — один или несколько пунктов через «|»
  const openSheet = (what, extra) => {
    toggleMenu(false);
    const list = (what || '').split('|');
    $$('#bk-w button').forEach(b => b.setAttribute('aria-pressed', String(list.includes(b.textContent))));
    $('#bk-c').value = extra || '';
    sheet.classList.add('open'); document.body.style.overflow = 'hidden';
  };
  const closeSheet = () => { sheet.classList.remove('open'); document.body.style.overflow = '' };

  let set = [], at = 0;
  const show = i => { at = (i + set.length) % set.length; const im = set[at].querySelector('img'); lb.querySelector('img').src = im.src; lb.querySelector('img').alt = im.alt; lb.querySelector('.cap').textContent = `${im.alt} · ${at + 1} / ${set.length}` };
  const closeLb = () => { lb.classList.remove('open'); document.body.style.overflow = '' };

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-book]'); if (b) { e.preventDefault(); openSheet(b.dataset.book, b.dataset.note) }
    if (e.target.closest('[data-close]')) closeSheet();
    if (e.target.closest('[data-menu]')) toggleMenu(!mnav.classList.contains('open'));
    const c = e.target.closest('#bk-w button'); if (c) c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true'));
    const g = e.target.closest('.gal button'); if (g) { set = [...g.closest('.gal').querySelectorAll('button:not([hidden])')]; show(set.indexOf(g)); lb.classList.add('open'); document.body.style.overflow = 'hidden' }
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
    const what = $$('#bk-w button[aria-pressed=true]').map(b => b.textContent), v = id => $(id).value.trim();
    const text = ['Здравствуйте! Пишу с сайта ЦТС, хочу записаться.', what.length && 'Что сделать: ' + what.join(', '), v('#bk-car') && 'Машина: ' + v('#bk-car'), v('#bk-d') && 'Когда: ' + fmtDate(v('#bk-d')), v('#bk-n') && 'Имя: ' + v('#bk-n'), v('#bk-c') && v('#bk-c')].filter(Boolean).join('\n');
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });

  const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target) } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach(el => io.observe(el));
  window.TS = { openSheet };
})();
