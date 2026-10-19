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

/* схема зубов, подбор лечения, ближайшая клиника */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  // схема зубов: выбранные зубы задают количество в калькуляторе
  const jaw = $('.jaw');
  if (jaw) {
    const out = $('#icalc-n output'), info = $('.jaw-info b'), plus = $('#icalc-n .cnt button[data-d="1"]'), minus = $('#icalc-n .cnt button[data-d="-1"]');
    const sync = () => {
      const k = $$('button.on', jaw).length;
      info.textContent = k ? 'Отмечено зубов: ' + k : 'Отметьте зубы, которых нет';
      let cur = +out.value;
      while (cur < Math.max(1, k)) { plus.click(); cur++; }
      while (cur > Math.max(1, k)) { minus.click(); cur--; }
    };
    jaw.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; b.classList.toggle('on'); b.setAttribute('aria-pressed', b.classList.contains('on')); sync(); });
    const clr = $('.jaw-info button'); clr && clr.addEventListener('click', () => { $$('button.on', jaw).forEach(b => { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); }); sync(); });
  }
  // подбор лечения
  const pk = $('#pick');
  if (pk && window.GSQ) {
    const r = $('.pk-r', pk);
    $$('.pk-q button', pk).forEach(b => b.addEventListener('click', () => {
      $$('.pk-q button', pk).forEach(x => x.classList.toggle('on', x === b));
      const q = window.GSQ[b.dataset.k];
      r.innerHTML = '<span class="eyebrow" style="color:#ff9aa1">Вам подойдёт</span><h3>' + q.t + '</h3><p>' + q.why + '</p><div class="ph">' + q.docs.map(d => '<img src="' + d.i + '" alt="' + d.n + '">').join('') + '</div><div class="doc">Ведут приём: ' + q.docs.map(d => d.n).join(', ') + '</div><div class="pr">' + q.from + '</div><div class="acts"><a class="btn btn-red" href="#" data-book="' + q.svc + '" data-note="Подбор на сайте: ' + b.querySelector('b').textContent + '">Записаться</a><a class="btn btn-ghost" href="' + q.url + '">Подробнее</a></div>';
    }));
  }
  // ближайшая клиника по геолокации
  const nb = $('#nearBtn');
  if (nb) nb.addEventListener('click', () => {
    const st = $('#nearSt');
    if (!navigator.geolocation) { st.textContent = 'Геолокация недоступна в этом браузере'; return; }
    st.textContent = 'Определяем…';
    navigator.geolocation.getCurrentPosition(p => {
      const d = (a, b, c, e) => { const R = 6371, x = (c - a) * Math.PI / 180, y = (e - b) * Math.PI / 180, h = Math.sin(x / 2) ** 2 + Math.cos(a * Math.PI / 180) * Math.cos(c * Math.PI / 180) * Math.sin(y / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
      const cards = $$('.br[data-lat]').map(c => ({ c, km: d(p.coords.latitude, p.coords.longitude, +c.dataset.lat, +c.dataset.lon) })).sort((a, b) => a.km - b.km);
      cards.forEach(({ c, km }, i) => { c.classList.add('has'); c.classList.toggle('best', i === 0); $('.dist', c).textContent = (i === 0 ? 'Ближе к вам · ' : '') + (km < 1 ? Math.round(km * 1000) + ' м' : km.toFixed(1).replace('.', ',') + ' км'); });
      st.textContent = 'Ближайшая клиника: ' + $('h3', cards[0].c).textContent;
      $$('input[name=br][value="' + cards[0].c.dataset.k + '"]').forEach(i => i.checked = true);
    }, () => { st.textContent = 'Не удалось определить местоположение — разрешите доступ к геолокации'; }, { timeout: 10000 });
  });
})();

/* отсчёт цифр и демонстрация ползунка «до/после» */
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const runCount = () => document.querySelectorAll('[data-count]').forEach(el => {
    const to = +el.dataset.count, suf = el.dataset.suf || '';
    if (still) return;
    const t0 = performance.now() + 250, dur = 1600;
    const step = t => { const k = Math.min(1, Math.max(0, (t - t0) / dur)), v = Math.round(to * (1 - Math.pow(1 - k, 3))); el.textContent = v.toLocaleString('ru-RU') + suf; if (k < 1) requestAnimationFrame(step); };
    el.textContent = '0' + suf; requestAnimationFrame(step);
  });
  if (document.documentElement.classList.contains('is-loading')) addEventListener('gs-ready', runCount, { once: true }); else runCount();
  if (still) return;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; io.unobserve(e.target);
    const ba = e.target, r = ba.querySelector('input[type=range]'); let touched = false;
    ['pointerdown', 'input', 'touchstart'].forEach(ev => r.addEventListener(ev, () => { touched = true; }, { once: true }));
    const keys = [[0, 50], [700, 18], [1500, 82], [2200, 50]], t0 = performance.now() + 300;
    const ease = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    const step = t => {
      if (touched) return;
      const dt = t - t0; let i = keys.findIndex(k => k[0] > dt); if (i === -1) { ba.style.setProperty('--p', '50%'); r.value = 50; return; }
      if (i === 0) { requestAnimationFrame(step); return; }
      const [a, pa] = keys[i - 1], [b, pb] = keys[i], v = pa + (pb - pa) * ease((dt - a) / (b - a));
      ba.style.setProperty('--p', v + '%'); r.value = v; requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: .5 });
  document.querySelectorAll('.ba').forEach(b => io.observe(b));
})();
