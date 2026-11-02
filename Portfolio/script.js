const data = window.portfolio;
const make = (tag, cls, text) => { const el = document.createElement(tag); if (cls) el.className = cls; if (text) el.textContent = text; return el; };
document.querySelectorAll('[data-name]').forEach(el => el.textContent = data.name);
document.title = `${data.name} — ${data.fullName} | Developer & Creative`;
document.querySelector('meta[property="og:title"]').content = document.title;
const aboutIntro = document.querySelector('.about-copy > p:not(.eyebrow)');
aboutIntro.textContent = `I’m ${data.fullName}, also known as ${data.alias}, the creative behind ${data.name}. I work across software development, video editing, content creation, cinematography, and AI tutoring. That mix lets me approach an idea from different angles: how it works, how it feels, and how people connect with it.`;
const serviceSelect = document.querySelector('select[name="service"]');
data.services.forEach(s => { if (![...serviceSelect.options].some(o => o.value === s.name)) { const option = make('option', '', s.name); option.value = s.name; serviceSelect.add(option); } });
document.getElementById('year').textContent = new Date().getFullYear();
if (data.email) { const a = make('a', '', data.email); a.href = `mailto:${data.email}`; document.getElementById('contact-email').replaceChildren(a); }
data.projects.forEach((p, i) => {
  const article = make('article', 'project'); article.dataset.category = p.category;
  const art = make('div', `project-art ${p.art}`); art.setAttribute('aria-hidden', 'true');
  if (p.art === 'web') { const mock = make('div', 'mock-browser'); mock.append(make('div', 'mock-top', '● ● ●'), make('div', 'mock-title', 'Ideas into\nexperiences.'), make('div', 'mock-line'), make('div', 'mock-pill', 'Explore →')); art.append(mock); }
  else if (p.art === 'cinema') { art.append(make('span', 'cinema-sun'), make('span', 'cinema-hill'), make('span', 'cinema-title', 'Every frame,\na feeling.'), make('span', 'cinema-time', 'STORY / LIGHT / MOTION')); }
  else { art.append(make('span', 'learning-star', '✳'), make('span', 'learning-title', 'A little clarity.\nNew possibilities.'), make('span', 'learning-chip', 'human + AI')); }
  article.append(art, make('p', 'project-label', `${p.label} / ${String(i + 1).padStart(2, '0')}`), make('h3', '', p.title), make('p', 'project-description', p.description));
  if (p.url && /^https?:\/\//.test(p.url)) { const a = make('a', 'text-link', 'View project ↗'); a.href = p.url; article.append(a); } else article.append(make('span', 'placeholder-label', 'PROJECT PLACEHOLDER'));
  document.getElementById('projects').append(article);
});
data.services.forEach((s, i) => {
  const row = make('div', 'service-row'); row.append(make('span', 'service-number', `0${i + 1}`), make('h3', '', s.name));
  const desc = make('div'); desc.append(make('p', '', s.description), make('p', 'service-items', s.items)); row.append(desc, make('a', 'service-arrow', '↗')); row.lastChild.href = '#contact'; row.lastChild.setAttribute('aria-label', `Inquire about ${s.name}`); document.getElementById('services-list').append(row);
  const rate = make('article', 'rate-card'); rate.append(make('span', 'rate-number', `0${i + 1}`), make('h3', '', s.name), make('p', 'rate-price', s.rate || 'Custom quote'), make('p', 'rate-scope', s.scope));
  const link = make('a', 'rate-link', 'Request a quote ↗'); link.href = '#contact'; link.addEventListener('click', () => document.querySelector('select[name="service"]').value = s.name); rate.append(link); document.getElementById('rates').append(rate);
});
const menu = document.querySelector('.menu'); const nav = document.querySelector('nav');
function closeMenu() { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); }
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); });
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenu(); menu.focus(); } });
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('[data-filter]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); }); document.querySelectorAll('.project').forEach(p => p.hidden = button.dataset.filter !== 'all' && p.dataset.category !== button.dataset.filter); }));
if (['localhost', '127.0.0.1'].includes(location.hostname) || location.protocol === 'file:') document.querySelector('form').addEventListener('submit', e => { e.preventDefault(); document.querySelector('.form-note').textContent = 'Local preview only: no inquiry was sent. Deploy to Netlify and enable form detection to receive messages.'; });

