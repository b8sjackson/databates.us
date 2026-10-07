(function () {
  // Section addresses: /about/ serves the home page and scrolls to the About section.
  var SECTIONS = ['tracker', 'why', 'who', 'products', 'how', 'memberships', 'about', 'questions', 'contact'];
  function sectionFrom(path) {
    var m = path.match(/^\/([a-z]+)\/?$/); return m && SECTIONS.indexOf(m[1]) >= 0 ? m[1] : null;
  }
  function headerOffset() { var h = document.querySelector('.header'); return h ? h.offsetHeight + 8 : 0; }
  function jump(id, smooth) {
    var el = document.getElementById(id); if (!el) return false;
    var top = el.getBoundingClientRect().top + window.pageYOffset - headerOffset();
    window.scrollTo({ top: top, behavior: smooth ? 'smooth' : 'auto' });
    return true;
  }
  var here = sectionFrom(location.pathname);
  if (here) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    jump(here, false);
    window.addEventListener('load', function () { jump(here, false); });
  }
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a[href]'); if (!a) return;
    var id = sectionFrom(a.getAttribute('href') || '');
    if (!id || !document.getElementById(id)) return;
    ev.preventDefault();
    jump(id, true);
    history.pushState(null, '', '/' + id + '/');
  });
  window.addEventListener('popstate', function () { var id = sectionFrom(location.pathname); if (id) jump(id, true); else if (location.pathname === '/') window.scrollTo({ top: 0 }); });
})();

(function () {
  var btn = document.querySelector('[data-menu]');
  var drawer = document.querySelector('[data-drawer]');
  if (btn && drawer) {
    btn.addEventListener('click', function () {
      var open = drawer.getAttribute('data-open') === 'true';
      drawer.setAttribute('data-open', open ? 'false' : 'true');
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      btn.textContent = open ? 'Menu' : 'Close';
    });
    drawer.addEventListener('click', function (ev) {
      if (ev.target.tagName === 'A') { drawer.setAttribute('data-open', 'false'); btn.setAttribute('aria-expanded', 'false'); btn.textContent = 'Menu'; }
    });
  }

  var form = document.getElementById('request-form');
  if (!form) return;
  var errorBox = form.querySelector('[data-form-error]');
  var helpError = form.querySelector('[data-error="help"]');
  var submit = form.querySelector('[data-submit]');
  var done = document.querySelector('[data-done]');

  function showError(msg) { errorBox.textContent = msg; errorBox.hidden = false; errorBox.scrollIntoView({ block: 'center' }); }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    errorBox.hidden = true; helpError.hidden = true;
    form.querySelectorAll('.field--error').forEach(function (f) { f.classList.remove('field--error'); });

    var help = Array.prototype.map.call(form.querySelectorAll('input[name="help"]:checked'), function (c) { return c.value; });
    if (!help.length) { helpError.hidden = false; helpError.scrollIntoView({ block: 'center' }); return; }
    if (!form.checkValidity()) {
      var first = null;
      Array.prototype.forEach.call(form.elements, function (el) {
        if (el.willValidate && !el.validity.valid) { var f = el.closest('.field'); if (f) f.classList.add('field--error'); if (!first) first = el; }
      });
      showError('A required field is missing or an email address does not look right. Check the fields marked in red.');
      if (first) first.focus();
      return;
    }
    var data = {
      firm: form.firm.value.trim(), name: form.name.value.trim(), role: form.role.value.trim(),
      email: form.email.value.trim(), phone: form.phone.value.trim(), size: form.size.value,
      help: help, delivery: (form.querySelector('input[name="delivery"]:checked') || {}).value || '',
      start: form.start.value, problem: form.problem.value.trim().slice(0, 1500), source: form.source.value,
      company_website: form.company_website.value
    };
    submit.disabled = true; submit.textContent = 'Sending';
    fetch('/api/request/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.body && res.body.error ? res.body.error : 'bad');
        form.hidden = true; done.hidden = false; window.scrollTo({ top: 0 });
      })
      .catch(function () {
        submit.disabled = false; submit.textContent = 'Send request';
        showError('Your request did not go through. Please try again, or email hello@databates.us with the same details.');
      });
  });
})();
