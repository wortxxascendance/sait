// «Фазенда»: шапка при прокрутке, бронь в WhatsApp, просмотр фото.
(() => {
  const PHONE = '79530728888';
  const $ = (s, r = document) => r.querySelector(s);

  // шапка становится светлой, когда ушли с первого экрана
  const top = $('#top');
  const onScroll = () => top.classList.toggle('solid', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // бронь: собираем понятное сообщение администратору
  const f = $('#bronForm'), err = $('#bronErr');
  const d = new Date(); f.date.min = d.toISOString().slice(0, 10);
  f.addEventListener('click', e => {
    const b = e.target.closest('[data-step]'); if (!b) return;
    const inp = f.elements[b.dataset.for];
    inp.value = Math.max(b.dataset.for === 'adults' ? 1 : 0, Math.min(30, (parseInt(inp.value) || 0) + +b.dataset.step));
  });
  f.addEventListener('submit', e => {
    e.preventDefault();
    if (!f.date.value) { err.textContent = 'Выберите дату'; f.date.focus(); return; }
    err.textContent = '';
    const what = [...f.querySelectorAll('[name=what]:checked')].map(x => x.value);
    const dt = new Date(f.date.value + 'T00:00');
    const date = dt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) + ' (' + dt.toLocaleDateString('ru-RU', { weekday: 'long' }) + ')';
    const adults = parseInt(f.adults.value) || 1, kids = parseInt(f.kids.value) || 0;
    const text = 'Здравствуйте!' + (f.name.value.trim() ? ' Меня зовут ' + f.name.value.trim() + '.' : '') +
      ' Хочу забронировать ' + (what.length ? what.join(', ') : 'отдых') + ' на ' + date + '.' +
      '\nГостей: ' + adults + ' взр.' + (kids ? ', ' + kids + ' дет.' : '') + '\nПодскажите, есть ли свободные места?';
    window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
  });

  // просмотр фото: клик, стрелки, свайп, Esc
  const links = [...document.querySelectorAll('#gal a')], lb = $('#lb'), img = $('img', lb);
  let i = 0, x0 = null;
  const show = n => { i = (n + links.length) % links.length; img.src = links[i].href; img.alt = links[i].querySelector('img').alt; };
  const close = () => { lb.hidden = true; document.body.style.overflow = ''; links[i].focus(); };
  links.forEach((a, n) => a.addEventListener('click', e => { e.preventDefault(); show(n); lb.hidden = false; document.body.style.overflow = 'hidden'; $('.lb-x').focus(); }));
  $('.lb-x').onclick = close; $('.lb-p').onclick = () => show(i - 1); $('.lb-n').onclick = () => show(i + 1);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => { if (lb.hidden) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(i - 1); if (e.key === 'ArrowRight') show(i + 1); });
  lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1)); x0 = null; });
})();
