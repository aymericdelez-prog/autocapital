// Pastille « Maquette » : rappelle que ce site est une proposition, pas le site officiel d'Autocapital.
// À retirer à la mise en ligne réelle (supprimer la balise <script src="/js/maquette.js"> des pages).
(() => {
  try { if (sessionStorage.getItem('na-maquette-fermee')) return; } catch {}
  const css = document.createElement('style');
  css.textContent = `
.na-maquette { position: fixed; left: 16px; bottom: calc(16px + env(safe-area-inset-bottom)); z-index: 90; display: flex; align-items: center; gap: 4px;
  padding: 4px 4px 4px 14px; border-radius: 999px; font: 500 12px/1 Inter, system-ui, sans-serif; letter-spacing: .01em; color: rgba(255,255,255,.9);
  background: rgba(13,13,15,.62); -webkit-backdrop-filter: blur(18px) saturate(160%); backdrop-filter: blur(18px) saturate(160%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.14), 0 10px 30px rgba(0,0,0,.3); opacity: 0; transform: translateY(12px);
  transition: opacity .6s cubic-bezier(.2,.7,.2,1), transform .6s cubic-bezier(.2,.7,.2,1); }
.na-maquette.on { opacity: 1; transform: none; }
.na-maquette a { color: inherit; text-decoration: underline; text-underline-offset: 2px; text-decoration-color: rgba(255,255,255,.35); }
.na-maquette button { width: 28px; height: 28px; border: 0; border-radius: 50%; background: transparent; color: inherit; font-size: 16px; line-height: 1; cursor: pointer; }
.na-maquette button:hover { background: rgba(255,255,255,.12); }
@media (max-width: 360px) { .na-maquette { font-size: 11px; left: 12px; } }`;
  document.head.appendChild(css);
  const el = document.createElement('div');
  el.className = 'na-maquette';
  el.setAttribute('role', 'note');
  el.innerHTML = '<span>Maquette proposée par <a href="https://new-architect.ch/" target="_blank" rel="noopener">New Architect</a></span><button type="button" aria-label="Masquer">×</button>';
  el.querySelector('button').addEventListener('click', () => { el.classList.remove('on'); setTimeout(() => el.remove(), 600); try { sessionStorage.setItem('na-maquette-fermee', 1); } catch {} });
  const montrer = () => { document.body.appendChild(el); requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('on'))); };
  if (document.readyState === 'complete') setTimeout(montrer, 2500); else addEventListener('load', () => setTimeout(montrer, 2500));
})();
