/* Garant Smile — поведение сайта (общий для всех страниц) */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const BR = { dl: { name: 'ул. Длинная, 100, офис 309', wa: '79181933232' }, may: { name: 'ул. 1 Мая, 277', wa: '79186863232' } };
  const rub = n => Math.round(n).toLocaleString('ru-RU') + ' ₽';
  const lockScroll = on => { document.documentElement.style.overflow = on ? 'hidden' : ''; };

  // шапка
  const hd = $('header.hd'); if (hd) { const f = () => hd.classList.toggle('scr', scrollY > 10); addEventListener('scroll', f, { passive: true }); f(); }

  // мобильное меню
  const mn = $('.mnav');
  $$('[data-menu]').forEach(b => b.addEventListener('click', () => { mn.classList.add('on'); lockScroll(true); }));
  $$('.mnav .x, .mnav a').forEach(b => b.addEventListener('click', () => { mn.classList.remove('on'); lockScroll(false); }));

  // запись: модальное окно и формы → WhatsApp выбранного филиала
  const modal = $('#book');
  const openBook = (svc, note) => {
    if (!modal) return;
    const f = $('form', modal);
    const sel = $('select[name=svc]', f);
    if (svc) { if (![...sel.options].some(o => o.value === svc)) sel.add(new Option(svc, svc)); sel.value = svc; } else sel.selectedIndex = 0;
    $('input[name=note]', f).value = note || '';
    $('.ok', f).hidden = true;
    modal.classList.add('on'); lockScroll(true);
    setTimeout(() => $('input[name=name]', f).focus(), 50);
  };
  const closeBook = () => { modal.classList.remove('on'); lockScroll(false); };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-book]'); if (!b) return;
    e.preventDefault(); openBook(b.dataset.book || '', b.dataset.note || '');
  });
  if (modal) { $('.x', modal).addEventListener('click', closeBook); modal.addEventListener('click', e => { if (e.target === modal) closeBook(); }); }
  addEventListener('keydown', e => { if (e.key === 'Escape' && modal && modal.classList.contains('on')) closeBook(); });

  const phoneOk = v => v.replace(/\D/g, '').length >= 11;
  $$('form.js-form').forEach(f => {
    const ph = $('input[name=phone]', f);
    ph && ph.addEventListener('input', () => {
      let d = ph.value.replace(/\D/g, ''); if (d.startsWith('8')) d = '7' + d.slice(1); if (d && !d.startsWith('7')) d = '7' + d; d = d.slice(0, 11);
      if (!d) { ph.value = ''; return; }
      const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
      ph.value = '+7' + (p[0] ? ' (' + p[0] : '') + (p[0].length === 3 ? ') ' : '') + p[1] + (p[2] ? '-' + p[2] : '') + (p[3] ? '-' + p[3] : '');
      ph.classList.remove('err');
    });
    f.addEventListener('submit', e => {
      e.preventDefault();
      const v = n => (f.elements[n] ? String(f.elements[n].value || '').trim() : '');
      if (!phoneOk(v('phone'))) { ph.classList.add('err'); ph.focus(); return; }
      const br = BR[(f.querySelector('input[name=br]:checked') || {}).value || 'dl'];
      const msg = ['Здравствуйте! Хочу записаться в Garant Smile.', v('name') && 'Имя: ' + v('name'), 'Телефон: ' + v('phone'), v('svc') && 'Услуга: ' + v('svc'), 'Клиника: ' + br.name, v('time') && 'Удобное время: ' + v('time'), v('note'), v('msg') && 'Комментарий: ' + v('msg')].filter(Boolean).join('\n');
      window.open('https://wa.me/' + br.wa + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
      const ok = f.querySelector('.ok'); if (ok) ok.hidden = false;
    });
  });

  // появление при прокрутке
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('.rv').forEach(el => io.observe(el));

  // акция по средам: подсвечиваем, если сегодня среда (время Краснодара, UTC+3)
  const msk = new Date(Date.now() + (new Date().getTimezoneOffset() + 180) * 60000);
  if (msk.getDay() === 3 && msk.getHours() >= 9 && msk.getHours() < 20) $$('.live[data-wed]').forEach(x => x.classList.add('on'));

  // до/после
  $$('.ba').forEach(ba => {
    const r = $('input[type=range]', ba), set = () => ba.style.setProperty('--p', r.value + '%');
    r.addEventListener('input', set); set();
    const box = ba.closest('[data-cases]'); if (!box) return;
    $$('.thumbs button', box).forEach(t => t.addEventListener('click', () => {
      $$('.thumbs button', box).forEach(x => x.classList.toggle('on', x === t));
      $$('.im', ba).forEach(im => im.style.backgroundImage = 'url(' + t.dataset.img + ')');
      const cap = $('[data-cap]', box); if (cap) cap.textContent = t.dataset.cap;
      r.value = 50; set();
    }));
  });

  // лента врачей
  $$('[data-row]').forEach(w => {
    const row = $('.drow', w); if (!row) return;
    $$('.dnav button', w).forEach(b => b.addEventListener('click', () => row.scrollBy({ left: (b.dataset.d === '1' ? 1 : -1) * 290, behavior: 'smooth' })));
  });

  // лайтбокс
  const lb = $('.lbx'); let L = [], li = 0;
  const show = () => { $('img', lb).src = L[li]; };
  document.addEventListener('click', e => {
    const im = e.target.closest('[data-lb] img'); if (!im || !lb) return;
    const g = im.closest('[data-lb]'); L = $$('img', g).map(x => x.dataset.full || x.src); li = $$('img', g).indexOf(im); show(); lb.classList.add('on'); lockScroll(true);
  });
  if (lb) {
    const close = () => { lb.classList.remove('on'); lockScroll(false); };
    $('.x', lb).onclick = close; $('.pv', lb).onclick = () => { li = (li - 1 + L.length) % L.length; show(); }; $('.nx', lb).onclick = () => { li = (li + 1) % L.length; show(); };
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    addEventListener('keydown', e => { if (!lb.classList.contains('on')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') $('.pv', lb).click(); if (e.key === 'ArrowRight') $('.nx', lb).click(); });
  }

  // калькулятор имплантации — цены из прайса клиники
  const cw = $('#icalc');
  if (cw) {
    const SYS = { osstem: ['Имплант Osstem (Корея)', 22000], roott: ['Имплант ROOTT (Швейцария)', 32000], neodent: ['Имплант NEODENT', 35000], nobel: ['Имплант Nobel (Швейцария)', 50000] };
    const CROWN = 35000, FORM = 3000, LENMIRIOT = 33000;
    const ARCH = { a4: ['All-on-4: акриловый протез', 4, 150000], a6: ['All-on-6: акриловый протез', 6, 180000], z4: ['Циркониевый протез на 4 имплантах', 4, 300000], z6: ['Циркониевый протез на 6 имплантах', 6, 350000] };
    let mode = 'one', n = 1;
    const out = $('#icalc-sum');
    const upd = () => {
      $('#lenopt').hidden = mode !== 'one';
      if (mode !== 'one' && $('input[name=sys]:checked', cw).value === 'len') $('input[name=sys][value=osstem]', cw).checked = true;
      $('#icalc-n').hidden = mode !== 'one'; $('#icalc-arch').hidden = mode === 'one';
      const sys = $('input[name=sys]:checked', cw).value;
      const rows = [];
      if (mode === 'one') {
        if (sys === 'len') rows.push(['Имплант Lenmiriot под ключ с коронкой (акция) × ' + n, LENMIRIOT * n]);
        else rows.push([SYS[sys][0] + ' × ' + n, SYS[sys][1] * n], ['Формирователь десны × ' + n, FORM * n], ['Циркониевая коронка на импланте × ' + n, CROWN * n]);
      } else {
        const a = ARCH[$('input[name=arch]:checked', cw).value];
        rows.push([SYS[sys][0] + ' × ' + a[1], SYS[sys][1] * a[1]], [a[0], a[2]]);
      }
      $$('input[name=ex]:checked', cw).forEach(x => rows.push([x.dataset.t, +x.value]));
      rows.push(['Консультация, КТ и план лечения', 0]);
      const tot = rows.reduce((s, r) => s + r[1], 0);
      $('.rows', out).innerHTML = rows.map(r => '<div class="row"><span>' + r[0] + '</span><b>' + (r[1] ? rub(r[1]) : '0 ₽ по акции') + '</b></div>').join('');
      $('.big', out).textContent = rub(tot);
      $('.after', out).textContent = 'Налоговый вычет 13%: можно вернуть до ' + rub(Math.min(tot, 150000) * 0.13) + ' за год';
      $('[data-book]', out).dataset.note = 'Расчёт на сайте: ' + rows.filter(r => r[1]).map(r => r[0]).join('; ') + ' — ' + rub(tot);
    };
    $$('.seg button', cw).forEach(b => b.addEventListener('click', () => { mode = b.dataset.m; $$('.seg button', cw).forEach(x => x.classList.toggle('on', x === b)); upd(); }));
    $$('.cnt button', cw).forEach(b => b.addEventListener('click', () => { n = Math.max(1, Math.min(8, n + +b.dataset.d)); $('#icalc-n output').value = n; upd(); }));
    cw.addEventListener('change', upd); upd();
  }

  // поиск по прайсу
  const ps = $('#psearch');
  if (ps) {
    const rows = $$('.ptab .pr-row'), groups = $$('.ptab');
    ps.addEventListener('input', () => {
      const q = ps.value.trim().toLowerCase();
      rows.forEach(r => r.hidden = !!q && !r.textContent.toLowerCase().includes(q));
      groups.forEach(g => g.hidden = !$$('.pr-row', g).some(r => !r.hidden));
      $('#pempty').hidden = groups.some(g => !g.hidden);
    });
  }

  // фильтр врачей
  const df = $('#dfil');
  if (df) $$('button', df).forEach(b => b.addEventListener('click', () => {
    $$('button', df).forEach(x => x.classList.toggle('on', x === b));
    $$('.dgrid .dc').forEach(c => c.hidden = b.dataset.f !== 'all' && !c.dataset.sp.split(' ').includes(b.dataset.f));
  }));
})();
