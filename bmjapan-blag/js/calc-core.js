/* Калькулятор «авто под ключ». Чистый расчёт — calcTotal(); ниже — интерфейс (только в браузере).
   Ставки — rates.js (RATES), настройки импортёра — CONFIG в index.html. Тест: node calc/test.js */
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
  if (typeof module !== 'undefined') module.exports = { calcTotal: calcTotal };
  else root.calcTotal = calcTotal; // для карточек каталога на сайте
  })(this);
