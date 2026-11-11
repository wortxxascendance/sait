/* Политика и согласие: наименование оператора, телефон и адрес берутся из ../config.json (company), как на главной. */
(function () {
  if (!window.fetch) return;
  fetch('../config.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (c) {
    var co = c.company || {}, all = function (k, f) { Array.prototype.forEach.call(document.querySelectorAll('[data-c="' + k + '"]'), f); };
    var d = String(co.phone || '').replace(/\D/g, '');
    if (d.length === 11 && d.charAt(0) === '8') d = '7' + d.slice(1);
    if (d.length === 10) d = '7' + d;
    if (co.legal) all('legal', function (e) { e.textContent = co.legal; e.className = ''; e.removeAttribute('data-fill'); });
    if (d) all('phone', function (e) { e.textContent = co.phone; e.setAttribute('href', 'tel:+' + d); });
    if (co.address) all('address', function (e) { e.textContent = co.address; });
  }).catch(function () { /* без config.json остаются значения из разметки */ });
})();
