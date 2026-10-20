// общие шапка, подвал, заявка в WhatsApp и анимации для всех страниц «Золотой подковы»
(() => {
  const WA = '79832781074', TEL = '+79235981700', TEL_H = '+7 923 598-17-00', VK = 'https://vk.com/podkova19';
  const WHAT = ['Конная прогулка', 'Покатать детей', 'Урок верховой езды', 'Проживание', 'Баня или чан', 'Беседка', 'Праздник или банкет', 'Свадьба', 'Рыбалка'];
  const I = {
    shoe: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M14 40c-5-4-8-10-8-17C6 13 14 6 24 6s18 7 18 17c0 7-3 13-8 17"/><path d="M14 40h-4M34 40h4"/><circle cx="11" cy="22" r="1.4" fill="currentColor"/><circle cx="14" cy="13.5" r="1.4" fill="currentColor"/><circle cx="24" cy="10" r="1.4" fill="currentColor"/><circle cx="34" cy="13.5" r="1.4" fill="currentColor"/><circle cx="37" cy="22" r="1.4" fill="currentColor"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.5 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.1-4.7-4-4.9-4.2-.1-.2-1.2-1.6-1.2-3s.7-2.2 1-2.5c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>',
    ph: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
    vk: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 18c-6.4 0-10-4.4-10.2-11.7h3.2c.1 5.4 2.5 7.6 4.3 8.1V6.3h3v4.6c1.8-.2 3.7-2.3 4.3-4.6h3a8.9 8.9 0 0 1-4 5.8 9.1 9.1 0 0 1 4.7 5.9h-3.3a5.8 5.8 0 0 0-4.7-4.2V18z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 8h16M4 16h16"/></svg>'
  };
  window.ZP_ICON = I;
  const page = document.body.dataset.page;
  const NAV = [['loshadi.html', 'Конные прогулки', 'horses'], ['otdyh.html', 'Отдых и баня', 'stay'], ['prazdniki.html', 'Праздники', 'events'], ['kontakty.html', 'Контакты', 'contacts']];
  const logo = `<a class="logo" href="index.html" aria-label="Золотая подкова — на главную">${I.shoe}<div><b>Золотая подкова</b><span>Конный комплекс · Хакасия</span></div></a>`;

  document.body.insertAdjacentHTML('afterbegin', `
<header class="hd"><div class="wrap">${logo}
  <nav class="nav" aria-label="Разделы">${NAV.map(([h, t, k]) => `<a href="${h}"${k === page ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
  <a class="tel" href="tel:${TEL}">${TEL_H}</a>
  <button class="btn btn-g" data-book>Забронировать</button>
  <button class="burger" aria-label="Меню" data-menu>${I.menu}</button>
</div></header>
<div class="mnav" aria-hidden="true"><button class="x" aria-label="Закрыть меню" data-menu>${I.x}</button>
  <a class="m" href="index.html">Главная</a>${NAV.map(([h, t]) => `<a class="m" href="${h}">${t}</a>`).join('')}
  <div class="btm"><button class="btn btn-g" data-book>Забронировать</button><a class="btn btn-o" href="tel:${TEL}">${I.ph}${TEL_H}</a></div>
</div>`);

  document.body.insertAdjacentHTML('beforeend', `
<footer class="ft"><div class="wrap"><div class="g">
  <div>${logo}<p style="max-width:320px;margin-top:20px">Конно-туристический комплекс под Абаканом: конные прогулки, проживание, баня, беседки и праздники.</p></div>
  <div><h4>Разделы</h4>${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}</div>
  <div><h4>Связь</h4><a href="tel:${TEL}">${TEL_H}</a><a href="tel:+79532590214">+7 953 259-02-14</a><a href="https://wa.me/${WA}" target="_blank" rel="noopener">WhatsApp</a><a href="${VK}" target="_blank" rel="noopener">ВКонтакте</a></div>
  <div><h4>Где мы</h4><a href="kontakty.html">2 км севернее Сапогова, 1</a><p style="padding-top:5px">Ежедневно 08:00–18:00</p></div>
</div><div class="cp"><span>© «Золотая подкова», Республика Хакасия</span><a href="https://2gis.ru/abakan/firm/9711414977502424" target="_blank" rel="noopener" style="display:inline;padding:0">4.9 ★ в 2ГИС</a></div></div></footer>
<div class="mbar"><a href="tel:${TEL}">${I.ph}Звонок</a><button data-book>${I.wa}Забронировать</button></div>
<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="bk-t"><div class="bd" data-close></div><div class="pn">
  <button class="x" aria-label="Закрыть" data-close>${I.x}</button>
  <span class="eb">${I.shoe}Бронь</span><h3 id="bk-t">Приезжайте <em>в гости</em></h3>
  <p style="color:var(--mut);margin-top:10px">Заявка уйдёт администратору в WhatsApp — вам подтвердят время и ответят на вопросы.</p>
  <form class="fm" id="bk" novalidate>
    <div class="lb">Что интересует<div class="chips" id="bk-w">${WHAT.map(p => `<button type="button" aria-pressed="false">${p}</button>`).join('')}</div></div>
    <div class="two"><label for="bk-d">Дата<input class="inp" id="bk-d" type="date"></label><label for="bk-g">Сколько человек<input class="inp" id="bk-g" type="number" min="1" inputmode="numeric" placeholder="2"></label></div>
    <label for="bk-n">Имя<input class="inp" id="bk-n" autocomplete="name" placeholder="Как к вам обращаться"></label>
    <label for="bk-c">Комментарий<input class="inp" id="bk-c" placeholder="Например: двое детей, 6 и 9 лет"></label>
    <button class="btn btn-wa" type="submit">${I.wa}Отправить в WhatsApp</button>
    <p class="note">Откроется WhatsApp с готовым сообщением — останется нажать «отправить».</p>
  </form>
  <div class="alt"><a href="tel:${TEL}">${I.ph}Позвонить</a><a href="${VK}" target="_blank" rel="noopener">${I.vk}ВКонтакте</a></div>
</div></div>`);

  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const hd = $('.hd'), mbar = $('.mbar'), sheet = $('.sheet'), mnav = $('.mnav');
  const onScroll = () => { const y = scrollY; hd.classList.toggle('solid', y > 40); mbar.classList.toggle('on', y > 480) };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('#bk-d').min = new Date().toISOString().slice(0, 10);

  const toggleMenu = open => { mnav.classList.toggle('open', open); mnav.setAttribute('aria-hidden', String(!open)); document.body.style.overflow = open ? 'hidden' : '' };
  const openSheet = (what, extra) => {
    toggleMenu(false);
    $$('#bk-w button').forEach(b => b.setAttribute('aria-pressed', String(b.textContent === what)));
    $('#bk-c').value = extra || '';
    sheet.classList.add('open'); document.body.style.overflow = 'hidden';
  };
  const closeSheet = () => { sheet.classList.remove('open'); document.body.style.overflow = '' };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-book]'); if (b) { e.preventDefault(); openSheet(b.dataset.book, b.dataset.note) }
    if (e.target.closest('[data-close]')) closeSheet();
    if (e.target.closest('[data-menu]')) toggleMenu(!mnav.classList.contains('open'));
    const c = e.target.closest('#bk-w button'); if (c) c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true'));
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeSheet(); toggleMenu(false) } });

  const fmtDate = v => v ? new Date(v + 'T12:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' }) : '';
  $('#bk').addEventListener('submit', e => {
    e.preventDefault();
    const what = $$('#bk-w button[aria-pressed=true]').map(b => b.textContent), v = id => $(id).value.trim();
    const text = ['Здравствуйте! Пишу с сайта «Золотой подковы».', what.length && 'Интересует: ' + what.join(', '), v('#bk-d') && 'Дата: ' + fmtDate(v('#bk-d')), v('#bk-g') && 'Человек: ' + v('#bk-g'), v('#bk-n') && 'Имя: ' + v('#bk-n'), v('#bk-c') && v('#bk-c')].filter(Boolean).join('\n');
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });

  const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target) } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach(el => io.observe(el));
  window.ZP = { openSheet };
})();
