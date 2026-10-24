// Коттедж для праздника: шапка при прокрутке, заявка на дату в WhatsApp, просмотр фото.
(() => {
  const PHONE = '79137689999';
  const $ = (s, r = document) => r.querySelector(s);

  const top = $('#top');
  const onScroll = () => top.classList.toggle('solid', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const f = $('#bronForm'), err = $('#bronErr');
  f.date.min = new Date().toISOString().slice(0, 10);
  f.addEventListener('click', e => {
    const b = e.target.closest('[data-step]'); if (!b) return;
    f.guests.value = Math.max(5, Math.min(120, (parseInt(f.guests.value) || 0) + +b.dataset.step));
  });
  f.addEventListener('submit', e => {
    e.preventDefault();
    if (!f.date.value) { err.textContent = 'Выберите дату праздника'; f.date.focus(); return; }
    err.textContent = '';
    const dt = new Date(f.date.value + 'T00:00');
    const date = dt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) + ' (' + dt.toLocaleDateString('ru-RU', { weekday: 'long' }) + ')';
    const what = (f.querySelector('[name=what]:checked') || {}).value || 'праздник';
    const name = f.name.value.trim();
    const text = 'Здравствуйте!' + (name ? ' Меня зовут ' + name + '.' : '') +
      ' Хотим провести ' + what + ' у вас в коттедже ' + date + '.' +
      '\nГостей: около ' + (parseInt(f.guests.value) || 0) + '.' + (f.night.checked ? '\nНужна ночёвка для гостей.' : '') +
      '\nСвободна ли эта дата? Можно приехать посмотреть дом?';
    window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
  });

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
