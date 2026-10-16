/* Autocapital · page d'accueil.
   Intro, mot géant, photo qui s’ouvre au défilement,
   voitures du back-office (/api/cars), philosophie mot à mot, services,
   curseur et boutons aimantés. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const nf = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;

  // ------------------------------------------------------------ découpages
  $$('[data-split]').forEach((el) => {
    el.outerHTML = [...el.textContent].map((c, i) => `<span class="ch" style="--i:${i}">${c}</span>`).join('');
  });
  $$('[data-lines]').forEach((el) => {
    el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map((l, i) => `<span class="ln"><span style="--i:${i}">${l}</span></span>`).join('');
  });
  $$('[data-words]').forEach((el) => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
  });

  // ------------------------------------------------------------ ouverture
  const say = $('#hero-say');
  say.innerHTML = say.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
  const sayW = $$('.w', say);
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-ready')));
  setTimeout(() => root.classList.add('is-settled'), calm ? 0 : 4200);

  // ------------------------------------------------------------ navigation
  const nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
  burger.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) menu.hidden = false; else setTimeout(() => { if (!nav.classList.contains('is-open')) menu.hidden = true; }, 800);
  });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) burger.click(); });
  const darks = [$('#accueil'), $('#voitures'), $('#foot')];
  const links = $$('.nav__links a');
  const ids = links.map((a) => $(a.getAttribute('href')));

  // ------------------------------------------------------------ apparitions
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -12% 0px' });
  const watch = (els) => els.forEach((el) => io.observe(el));
  watch($$('.rv, [data-lines]'));
  $$('.serv__row').forEach((el, i) => el.style.setProperty('--d', i));

  let vel = 0, lastY = scrollY;

  // ------------------------------------------------------------ voitures
  const grid = $('#grid');
  let cars = [];
  let filter = 'all';
  fetch('/api/cars')
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .catch(() => fetch('/data/seed.json').then((r) => r.json()))
    .then((d) => { cars = d.cars || []; renderCars(); })
    .catch(() => { grid.innerHTML = '<p class="stock__empty">Les voitures n’ont pas pu être chargées. Appelez-nous au 032 950 10 10.</p>'; });

  function renderCars() {
    grid.removeAttribute('aria-busy');
    cars.sort((a, b) => b.price - a.price);
    grid.innerHTML = cars.length ? cars.map((c) => `
      <a class="card rv" href="/voiture/${encodeURIComponent(c.id)}" data-cat="${esc(c.cat)}" data-view>
        <div class="card__in">
          ${c.badge ? `<span class="card__badge">${esc(c.badge)}</span>` : ''}
          <span class="card__go" aria-hidden="true"><svg><use href="#i-arrow"/></svg></span>
          <div class="card__img"><img src="${esc((c.photos || [])[0] || '')}" alt="${esc(c.brand + ' ' + c.model)}" loading="lazy" decoding="async"></div>
          <div class="card__body">
            <span class="card__brand">${esc(c.brand)}</span>
            <span class="card__model">${esc(c.model)}</span>
            <span class="card__meta">${[c.year, c.km || c.km === 0 ? nf(c.km) + ' km' : '', c.ps ? c.ps + ' ch' : ''].filter(Boolean).join(' · ')}</span>
            <span class="card__price">CHF ${nf(c.price)}.–</span>
          </div>
        </div>
      </a>`).join('') : '<p class="stock__empty">Notre stock se renouvelle, revenez bientôt ou appelez-nous.</p>';
    applyFilter();
    $$('.card', grid).forEach((card) => { io.observe(card); tilt(card); });
    bindCursor(grid);
  }

  function applyFilter() {
    const cards = $$('.card', grid);
    let shown = 0;
    cards.forEach((c) => {
      const ok = filter === 'all' || c.dataset.cat === filter;
      c.classList.toggle('is-hide', !ok);
      c.classList.remove('is-wide');
      if (ok) { c.style.setProperty('--d', shown % 2); shown++; }
    });
    // un nombre impair : la première voiture prend toute la largeur
    if (shown % 2 === 1) { const first = cards.find((c) => !c.classList.contains('is-hide')); if (first) first.classList.add('is-wide'); }
    $('#stock-count').textContent = shown ? `${shown} voiture${shown > 1 ? 's' : ''} disponible${shown > 1 ? 's' : ''}` : 'Aucune voiture dans cette catégorie pour le moment.';
  }

  $('#filters').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    filter = b.dataset.f;
    $$('#filters button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    grid.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(12px)' }], { duration: 220, easing: 'ease-in' }).onfinish = () => {
      applyFilter();
      grid.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.22,1,.36,1)' });
    };
  });

  function tilt(card) {
    if (!fine || calm) return;
    const inner = $('.card__in', card), img = $('.card__img', card);
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      inner.style.setProperty('--rx', `${(x - 0.5) * 6}deg`);
      inner.style.setProperty('--ry', `${(0.5 - y) * 6}deg`);
      img.style.setProperty('--mx', `${x * 100}%`);
      img.style.setProperty('--my', `${y * 100}%`);
    });
    card.addEventListener('pointerleave', () => { inner.style.setProperty('--rx', '0deg'); inner.style.setProperty('--ry', '0deg'); });
  }

  // ------------------------------------------------------- curseur, aimants
  const cur = $('#cur');
  let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
  function bindCursor(scope = document) {
    if (!fine) return;
    $$('a, button, label', scope).forEach((el) => {
      if (el.dataset.cb) return; el.dataset.cb = 1;
      const view = el.hasAttribute('data-view');
      el.addEventListener('pointerenter', () => cur.classList.add(view ? 'is-view' : 'is-link'));
      el.addEventListener('pointerleave', () => cur.classList.remove('is-view', 'is-link'));
    });
  }
  if (fine) {
    addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; cur.classList.remove('is-off'); });
    document.addEventListener('pointerleave', () => cur.classList.add('is-off'));
    bindCursor();
    if (!calm) $$('[data-mag]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  } else cur.remove();

  // ---------------------------------------------------------- philosophie
  const philo = $$('#philo li');
  const philoN = $('#philo-n');
  let lastPhilo = -1;

  const hero = $('#accueil'), heroPin = $('.hero__pin');


  // ------------------------------------------------------- boucle d'images
  const par = $$('[data-par]');
  const foot = $('#foot-word');

  function frame() {
    const y = scrollY, vh = innerHeight;
    const dy = y - lastY; lastY = y;
    vel += (dy - vel) * 0.1;

    // nav
    nav.classList.toggle('is-scrolled', y > 20);
    const probe = 30;
    nav.classList.toggle('is-dark', darks.some((s) => { const r = s.getBoundingClientRect(); return r.top <= probe && r.bottom > probe; }));
    let act = -1;
    ids.forEach((s, i) => { if (s) { const r = s.getBoundingClientRect(); if (r.top < vh * 0.4 && r.bottom > vh * 0.4) act = i; } });
    links.forEach((a, i) => a.classList.toggle('is-active', i === act));

    if (!calm) {
      // hero
      const hr = hero.getBoundingClientRect();
      const hp = clamp(-hr.top / (hr.height - vh));
      heroPin.style.setProperty('--p', hp.toFixed(4));
      const sn = Math.round(clamp((hp - 0.3) / 0.55) * sayW.length);
      sayW.forEach((w, i) => w.classList.toggle('on', i < sn));

      // parallaxe
      par.forEach((im) => { const r = im.parentNode.getBoundingClientRect(); if (r.bottom > 0 && r.top < vh) im.style.setProperty('--py', `${((r.top + r.height / 2) / vh - 0.5) * -60}px`); });


      // pied
      const fr = foot.getBoundingClientRect();
      const fp = clamp((vh - fr.top) / (fr.height + 160));
      foot.style.setProperty('--f', clamp(fp * 1.6).toFixed(4));

    }

    // philosophie : les mots s'allument au passage
    let best = 0, bestD = Infinity;
    philo.forEach((li, k) => {
      const r = li.getBoundingClientRect();
      const p = calm ? 1 : clamp((vh * 0.82 - r.top) / (r.height + vh * 0.3));
      const ws = li._w || (li._w = $$('.w', li));
      const n = Math.round(p * ws.length);
      ws.forEach((w, i) => w.classList.toggle('on', i < n));
      const d = Math.abs(r.top + r.height / 2 - vh / 2);
      if (d < bestD) { bestD = d; best = k; }
    });
    if (best !== lastPhilo && philoN) {
      lastPhilo = best;
      philoN.animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.22,1,.36,1)' });
      philoN.textContent = String(best + 1).padStart(2, '0');
    }

    // curseur
    if (fine) { cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2; cur.style.transform = `translate3d(${cx}px,${cy}px,0)`; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ------------------------------------------------------------- formulaire
  const form = $('#form'), msg = $('#form-msg');
  const q = new URLSearchParams(location.search);
  if (q.get('voiture')) {
    form.message.value = `Bonjour, je suis intéressé(e) par la ${q.get('voiture')}. `;
  }
  if (q.get('sujet') === 'depot') {
    form.querySelector('input[value="Dépôt-vente"]').checked = true;
    form.message.value = 'Bonjour, je souhaite faire estimer ma voiture (marque, modèle, année, kilométrage) : ';
  }
  $$('a[href="/?sujet=depot#contact"]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    form.querySelector('input[value="Dépôt-vente"]').checked = true;
    if (!form.message.value) form.message.value = 'Bonjour, je souhaite faire estimer ma voiture (marque, modèle, année, kilométrage) : ';
    $('#contact').scrollIntoView({ behavior: calm ? 'auto' : 'smooth' });
  }));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let bad = false;
    ['nom', 'email', 'message'].forEach((k) => {
      const f = form[k], ok = f.value.trim() && (k !== 'email' || /\S+@\S+\.\S+/.test(f.value));
      f.closest('.field').classList.toggle('is-bad', !ok);
      if (!ok) bad = true;
    });
    if (bad) { msg.textContent = 'Merci de compléter les champs en rouge.'; return; }
    const sujet = form.querySelector('input[name="sujet"]:checked').value;
    const body = `${form.message.value}\n\n${form.nom.value}\n${form.email.value}${form.tel.value ? '\n' + form.tel.value : ''}`;
    location.href = `mailto:info@autocapital.ch?subject=${encodeURIComponent(`[Site] ${sujet} : ${form.nom.value}`)}&body=${encodeURIComponent(body)}`;
    msg.textContent = 'Votre messagerie s’ouvre avec le message prêt à envoyer.';
  });
})();
