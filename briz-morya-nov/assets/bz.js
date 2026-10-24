// «Бриз моря»: шапка при прокрутке, бронь в WhatsApp, просмотр фото.
(() => {
  const PHONE = '79640954717';
  const $ = (s, r = document) => r.querySelector(s);

  const top = $('#top');
  const onScroll = () => top.classList.toggle('solid', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // бронь: даты заезда/выезда, гости, пожелания → сообщение хозяевам
  const f = $('#bronForm'), err = $('#bronErr');
  const today = new Date().toISOString().slice(0, 10);
  f.from.min = today; f.to.min = today;
  f.from.addEventListener('change', () => { f.to.min = f.from.value || today; if (f.to.value && f.to.value <= f.from.value) f.to.value = ''; });
  f.addEventListener('click', e => {
    const b = e.target.closest('[data-step]'); if (!b) return;
    f.guests.value = Math.max(1, Math.min(30, (parseInt(f.guests.value) || 1) + +b.dataset.step));
  });
  const fmt = v => new Date(v + 'T00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  f.addEventListener('submit', e => {
    e.preventDefault();
    if (!f.from.value || !f.to.value) { err.textContent = 'Выберите даты заезда и выезда'; (f.from.value ? f.to : f.from).focus(); return; }
    if (f.to.value <= f.from.value) { err.textContent = 'Выезд должен быть позже заезда'; f.to.focus(); return; }
    err.textContent = '';
    const nights = Math.round((new Date(f.to.value) - new Date(f.from.value)) / 864e5);
    const extra = [...f.querySelectorAll('[name=extra]:checked')].map(x => x.value);
    const name = f.name.value.trim();
    const text = 'Здравствуйте!' + (name ? ' Меня зовут ' + name + '.' : '') +
      ' Хочу забронировать номер с ' + fmt(f.from.value) + ' по ' + fmt(f.to.value) + ' (ночей: ' + nights + ').' +
      '\nГостей: ' + (parseInt(f.guests.value) || 1) + '.' + (extra.length ? '\nЕщё интересует: ' + extra.join(', ') + '.' : '') +
      '\nЕсть свободные номера?';
    window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
  });

  // просмотр фото
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
