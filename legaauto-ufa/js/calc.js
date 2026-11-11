/* Калькулятор «авто под ключ». Чистый расчёт — calcTotal(); интерфейс — initCalc(C) (только в браузере).
   Ставки — rates.js (RATES), тарифы и контакты компании — config.json (их передаёт site.js). Тест: node calc/test.js */
(function (root) {
  var lim = function (x) { return x == null ? Infinity : x; };
  var pick = function (rows, test) { for (var i = 0; i < rows.length; i++) if (test(rows[i])) return rows[i]; return rows[rows.length - 1]; };

  // i: { country, cur, price, age: lt3|3to5|5to7|gt7, engine: ice|hyb|ev, serial, cc, hp, who: fiz|yur }
  // fx: { JPY: ₽ за 1, KRW, CNY, USD, EUR }
  function calcTotal(i, R, C, fx) {
    var eur = fx.EUR, cost = C.costs[i.country];
    var carRub = i.price * fx[i.cur];
    var valRub = carRub + (C.freightInCustomsValue ? cost.abroad : 0);
    var valEur = valRub / eur;
    var old = i.age === '5to7' || i.age === 'gt7';
    var o = { carRub: carRub, abroad: cost.abroad, delivery: cost.delivery, duty: 0, excise: 0, vat: 0, util: 0, fee: 0, dutyHow: '', utilHow: '' };
    var excise = function () { var r = pick(R.yur.excise, function (x) { return i.hp <= lim(x.hpMax); }); return r.rubPerHp * i.hp; };
    var vat = function () { return (valRub + o.duty + o.excise) * R.yur.vat; };
    var mix = function (t, cc) {
      var p = valRub * (t.pct || 0) / 100, m = (t.minEurCc || 0) * cc * eur;
      o.duty = Math.max(p, m);
      o.dutyHow = t.pct && p >= m ? t.pct + '% от стоимости' : t.minEurCc + ' € за см³';
    };

    if (i.who === 'fiz' && i.engine !== 'ev') {
      if (i.age === 'lt3') mix(pick(R.fiz.lt3, function (x) { return valEur <= lim(x.eurMax); }), i.cc);
      else mix(pick(old ? R.fiz.gt5 : R.fiz.age3to5, function (x) { return i.cc <= lim(x.ccMax); }), i.cc);
    } else if (i.who === 'fiz') {
      mix({ pct: R.fiz.ev.dutyPct }, 0);
      if (R.fiz.ev.excise) o.excise = excise();
      if (R.fiz.ev.vat) o.vat = vat();
    } else {
      var band = i.engine === 'ev' ? R.yur.duty.ev : R.yur.duty[i.age];
      mix(pick(band, function (x) { return i.engine === 'ev' || i.cc <= lim(x.ccMax); }), i.cc || 0);
      o.excise = excise();
      o.vat = vat();
    }

    // утильсбор: таблица ПП № 1291 по «кто ввозит» × тип (ДВС и параллельный гибрид / электро и последовательный гибрид) × объём × кВт
    var ev = i.engine === 'ev' || (i.engine === 'hyb' && i.serial), kw = i.hp * R.util.kwPerHp;
    var u = pick(R.util.rows[i.who][ev ? 'ev' : 'ice'], function (x) { return (ev || i.cc <= lim(x.ccMax)) && kw <= lim(x.kwMax); });
    var k = i.age === 'lt3' ? u.lt3 : u.gt3;
    o.util = R.util.base * k;
    o.utilHow = (k < 1 ? 'льготный коэффициент ' : 'коэффициент ') + String(k).replace('.', ',');

    o.fee = pick(R.fee, function (x) { return valRub <= lim(x.rubMax); }).rub;
    o.customs = o.duty + o.excise + o.vat + o.util + o.fee;
    o.total = carRub + o.abroad + o.delivery + o.customs + C.service + C.broker;
    return o;
  }

  // таблица утильсбора текущего года (rates.js несёт 2026–2030): 1 января сайт сам переходит на новые коэффициенты
  function useYear(R, now) {
    if (!R.util.byYear) return R.util.year;
    var y = (now || new Date()).getFullYear(), best = null;
    Object.keys(R.util.byYear).forEach(function (k) { if (+k <= y && (best === null || +k > +best)) best = k; });
    if (best === null) best = Object.keys(R.util.byYear).sort()[0];
    R.util.rows = R.util.byYear[best]; R.util.year = best;
    return best;
  }

  if (typeof module !== 'undefined') { module.exports = { calcTotal: calcTotal, useYear: useYear }; return; }
  root.calcTotal = calcTotal;

  /* ===================== Интерфейс ===================== */
  // C: { demo, phone, whatsapp, telegram, costs: { CN: { cur, abroad, delivery, note } }, service, broker, freightInCustomsValue, example }
  root.initCalc = function (C) {
    var R = root.RATES;
    var $ = function (s) { return document.getElementById(s); };
    var year = useYear(R);
    var COUNTRIES = [['JP', 'Япония'], ['KR', 'Корея'], ['CN', 'Китай'], ['EU', 'Европа']].filter(function (c) { return C.costs[c[0]]; });
    var CURS = [['JPY', '¥ иены'], ['KRW', '₩ воны'], ['CNY', '¥ юани'], ['USD', '$ доллары'], ['EUR', '€ евро']];
    var AGES = [['lt3', 'до 3 лет'], ['3to5', '3–5 лет'], ['5to7', '5–7 лет'], ['gt7', 'старше 7']];
    var ENGINES = [['ice', 'Бензин или дизель'], ['hyb', 'Гибрид'], ['ev', 'Электро']];
    var WHO = [['fiz', 'Физлицо для себя'], ['yur', 'Юрлицо или ИП']];
    var HINT = { ice: '', hyb: R.util.hybridHint || '', ev: 'Объём не нужен. Мощность — 30-минутная, из документов.' };
    if (!COUNTRIES.length) throw new Error('config.json: в calculator.tariffs нет ни одной страны (CN, KR, JP, EU)');
    var ex = C.example && C.costs[C.example.country] ? C.example : null;
    var first = ex ? ex.country : (C.costs.CN ? 'CN' : COUNTRIES[0][0]);

    function seg(id, list, val) {
      $(id).innerHTML = list.map(function (o) {
        return '<label><input type="radio" name="' + id + '" value="' + o[0] + '"' + (o[0] === val ? ' checked' : '') + '><span>' + o[1] + '</span></label>';
      }).join('');
    }
    seg('country', COUNTRIES, first); seg('age', AGES, ex && ex.age || 'lt3'); seg('engine', ENGINES, 'ice'); seg('who', WHO, 'fiz');
    $('cur').innerHTML = CURS.map(function (o) { return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join('');
    $('cur').value = ex && ex.currency || C.costs[first].cur;
    $('demoNote').hidden = !C.demo;

    var radio = function (n) { var x = document.querySelector('input[name="' + n + '"]:checked'); return x && x.value; };
    var num = function (s) { var v = parseFloat(String(s).replace(/\s/g, '').replace(',', '.')); return isFinite(v) ? v : NaN; };
    var rub = function (v) { return Math.round(v).toLocaleString('ru-RU') + ' ₽'; };
    var fmtDate = function (d) { return d ? new Date(d + 'T00:00:00').toLocaleDateString('ru-RU') : '—'; };
    var label = function (list, k) { return list.filter(function (x) { return x[0] === k; })[0][1]; };
    var spaced = function (v) { return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };

    /* курс ЦБ: живой из API, при сбое — сохранённый в rates.js */
    var FX = { date: R.fx.date, rub: R.fx.rub, live: false }, fxFailed = false;
    function loadFx() {
      fetch(R.fx.url, { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) {
        var out = {};
        Object.keys(FX.rub).forEach(function (k) { var v = j.Valute && j.Valute[k]; if (v) out[k] = v.Value / v.Nominal; });
        if (Object.keys(out).length === Object.keys(FX.rub).length) { FX = { date: String(j.Date).slice(0, 10), rub: out, live: true }; render(); }
      }).catch(function () { fxFailed = true; render(); });
    }

    /* поля: ошибка только после ухода из заполненного поля, снимается при фокусе и вводе */
    var F = {
      price: { el: $('price'), e: $('price-e'), msg: 'Введите цену цифрами, например 1 250 000', ok: function (v) { return v > 0; } },
      cc: { el: $('cc'), e: $('cc-e'), msg: 'Введите объём от 600 до 8000 см³', ok: function (v) { return v >= 600 && v <= 8000; } },
      hp: { el: $('hp'), e: $('hp-e'), msg: 'Введите мощность от 30 до 1000 л.с.', ok: function (v) { return v >= 30 && v <= 1000; } }
    };
    function show(k, bad) { var f = F[k]; f.el.setAttribute('aria-invalid', bad ? 'true' : 'false'); f.e.hidden = !bad; f.e.textContent = bad ? f.msg : ''; }
    Object.keys(F).forEach(function (k) {
      var f = F[k];
      f.el.addEventListener('blur', function () { if (f.el.value.trim() !== '') show(k, !f.ok(num(f.el.value))); });
      f.el.addEventListener('focus', function () { show(k, false); });
      f.el.addEventListener('input', function () {
        if (k === 'price') { var p = f.el.value.replace(/[^\d,.]/g, '').split(/[,.]/); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' '); f.el.value = p.slice(0, 2).join(','); }
        else f.el.value = f.el.value.replace(/\D/g, '');
        show(k, false); render();
      });
    });

    /* расчёт, который человек сделал сам (не пример при открытии) — его прикладываем к заявке */
    var touched = false;   // слушаем на погружении: отметка ставится раньше пересчёта, и первый же ввод считается
    $('f').addEventListener('input', function (e) { if (e.isTrusted) touched = true; }, true);
    $('f').addEventListener('change', function (e) { if (e.isTrusted) touched = true; }, true);
    var poke = function () { $('hp').dispatchEvent(new Event('input', { bubbles: true })); };   // будит плашку 2027 (deadline.js)

    function input() {
      var engine = radio('engine');
      return {
        country: radio('country'), cur: $('cur').value, price: num($('price').value), age: radio('age'), engine: engine,
        serial: engine === 'hyb' && !!R.util.hybridSerialDefault, cc: engine === 'ev' ? 0 : num($('cc').value), hp: num($('hp').value), who: radio('who')
      };
    }
    var ready = function (i) { return F.price.ok(i.price) && F.hp.ok(i.hp) && (i.engine === 'ev' || F.cc.ok(i.cc)); };

    var last = null;
    function render() {
      var i = input();
      $('ccBox').hidden = i.engine === 'ev';
      $('engine-h').textContent = HINT[i.engine]; $('engine-h').hidden = !HINT[i.engine];
      $('who-h').textContent = i.who === 'fiz'
        ? R.util.personalNote
        : 'Для юрлица добавляются акциз и НДС ' + Math.round(R.yur.vat * 100) + '%.';
      // предупреждение только о сохранённом курсе: живой курс ЦБ в выходные бывает «вчерашним», это норма
      var oldFx = !FX.live && Date.now() - new Date(FX.date + 'T00:00:00') > 2 * 864e5;
      $('stale').className = 'stale' + (oldFx || R.draft ? ' on' : '');
      $('stale').textContent = R.draft ? R.draft : oldFx ? 'Курс ЦБ не загрузился, расчёт по курсу на ' + fmtDate(FX.date) + '. Обновите страницу.' : '';
      $('note').textContent = 'Расчёт ориентировочный, не является публичной офертой. Курс ЦБ на ' + fmtDate(FX.date) + (FX.live ? '' : ' (сохранённый)')
        + ', ставки пошлин и утильсбора сверены ' + fmtDate(R.checked) + (year ? ', утильсбор по коэффициентам ' + year + ' года' : '')
        + '. Точную сумму назовёт менеджер по документам на конкретный автомобиль.';

      if (!isFinite(FX.rub.EUR)) {
        last = null; $('total').textContent = '—';
        $('rows').innerHTML = '<tr><td style="color:var(--mut)">' + (fxFailed ? 'Не удалось загрузить курс ЦБ. Обновите страницу.' : 'Загружаем курс ЦБ…') + '</td><td></td></tr>';
        return;
      }
      if (!ready(i)) {
        last = null; $('total').textContent = '—';
        $('rows').innerHTML = '<tr><td style="color:var(--mut)">Заполните цену, мощность' + (i.engine === 'ev' ? '' : ' и объём') + ' — итог появится сразу.</td><td></td></tr>';
        return;
      }
      var r = calcTotal(i, R, C, FX.rub); last = { i: i, r: r };
      var exTag = C.demo ? '<span class="ex">Пример</span>' : '';
      var tr = function (a, b, s) { return '<tr><td>' + a + (s ? '<small>' + s + '</small>' : '') + '</td><td>' + b + '</td></tr>'; };
      var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
      $('rows').innerHTML = '<tr class="grp"><td colspan="2">Автомобиль</td></tr>'
        + tr('Цена авто', rub(r.carRub), i.price.toLocaleString('ru-RU') + ' ' + i.cur + ' × ' + FX.rub[i.cur].toFixed(4).replace('.', ',') + ' ₽')
        + tr('Расходы в стране: ' + label(COUNTRIES, i.country) + exTag, rub(r.abroad), esc(C.costs[i.country].note || 'аукцион, стоянка, фрахт до порта'))
        + (r.delivery ? tr('Доставка до города' + exTag, rub(r.delivery)) : '')
        + '<tr class="grp"><td colspan="2">Таможня</td></tr>'
        + tr('Пошлина', rub(r.duty), r.dutyHow)
        + (r.excise ? tr('Акциз', rub(r.excise)) : '')
        + (r.vat ? tr('НДС ' + Math.round(R.yur.vat * 100) + '%', rub(r.vat)) : '')
        + tr('Утильсбор', rub(r.util), r.utilHow)
        + tr('Таможенный сбор', rub(r.fee))
        + '<tr class="grp"><td colspan="2">Оформление</td></tr>'
        + tr('Брокер, СВХ, СБКТС, ЭПТС' + exTag, rub(C.broker))
        + tr('Услуги компании' + exTag, rub(C.service));
      $('total').textContent = rub(r.total);
      if (touched) document.dispatchEvent(new CustomEvent('calc:result'));
    }

    /* отправка расчёта: WhatsApp (готовый текст), Telegram (текст копируется), звонок */
    function summary() {
      if (!last) return '';
      var i = last.i;
      return 'цена ' + i.price.toLocaleString('ru-RU') + ' ' + i.cur + ', ' + label(AGES, i.age) + ', ' + label(ENGINES, i.engine).toLowerCase()
        + (i.cc ? ', ' + i.cc + ' см³' : '') + ', ' + i.hp + ' л.с., итог ≈ ' + rub(last.r.total) + ' (курс ЦБ на ' + fmtDate(FX.date) + ')';
    }
    function text() { return last ? 'Здравствуйте! Посчитал на сайте авто под ключ:\n— ' + summary() + '\nПодберёте вариант?' : 'Здравствуйте! Хочу рассчитать авто под ключ.'; }
    function toast(t) { var x = $('toast'); x.textContent = t; x.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { x.classList.remove('on'); }, 3500); }
    $('waBtn').addEventListener('click', function () { this.href = 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(text()); });
    if (C.telegram) {
      $('tgBtn').addEventListener('click', function () {
        var url = 'https://t.me/' + C.telegram;
        var go = function () { window.open(url, '_blank', 'noopener'); };
        if (navigator.clipboard) navigator.clipboard.writeText(text()).then(function () { toast('Расчёт скопирован — вставьте его в чат'); go(); }, go); else go();
      });
    } else $('tgBtn').hidden = true;
    $('telBtn').href = 'tel:' + C.phone;
    document.addEventListener('change', function (e) {
      if (e.target.name === 'country' && C.costs[e.target.value]) $('cur').value = C.costs[e.target.value].cur;
      if (e.target.closest && e.target.closest('#f')) render();
    });

    /* пример при открытии страницы, чтобы итог был виден сразу */
    if (ex) {
      $('price').value = spaced(ex.price); $('cc').value = ex.cc || ''; $('hp').value = ex.hp || '';
      $('price-h').textContent = 'Пример: ' + spaced(ex.price) + ' ' + (ex.currency === 'CNY' ? '¥' : ex.currency) + (ex.text ? ', ' + ex.text : '') + ' — впишите свою цену';
    }
    render(); poke(); loadFx();

    /* подставить машину в калькулятор (из предложений и каталога) */
    var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function prefill(m) {
      var set = function (n, v) { var x = document.querySelector('input[name="' + n + '"][value="' + v + '"]'); if (x) x.checked = true; };
      var country = C.costs[m.country] ? m.country : first;
      set('country', country); set('age', m.age || 'lt3'); set('engine', 'ice'); set('who', 'fiz');
      $('cur').value = C.costs[country].cur;
      $('cc').value = m.cc || ''; $('hp').value = m.hp || '';
      $('price').value = '';
      $('price-h').textContent = m.title + ': введите цену в стране покупки — остальное уже подставили';
      touched = true; render(); poke();
      $('calc').scrollIntoView({ behavior: still ? 'auto' : 'smooth' });
      setTimeout(function () { try { $('price').focus({ preventScroll: true }); } catch (err) { /* старые браузеры */ } }, still ? 0 : 700);
    }
    return { prefill: prefill, summary: function () { return touched ? summary() : ''; }, year: year };
  };
})(this);
