const data = window.portfolio;
const make = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text) node.textContent = text; return node; };
document.querySelectorAll('[data-name]').forEach(node => node.textContent = data.name);
document.title = `${data.name} — ${data.fullName} | Code, stories & learning`;
document.querySelector('meta[property="og:title"]').content = document.title;
document.getElementById('year').textContent = new Date().getFullYear();
const emailLink = document.getElementById('contact-email');
emailLink.href = `mailto:${data.email}`;
emailLink.replaceChildren(document.createTextNode(`${data.email} `), make('span', '', '↗'));
document.querySelectorAll('a[href^="mailto:"]').forEach(link => link.href = `mailto:${data.email}`);
data.projects.forEach(project => {
  if (/^https:\/\//.test(project.url)) document.querySelector(`[data-project-link="${project.id}"]`).href = project.url;
  document.querySelectorAll(`img[src="assets/${project.id}-dashboard.png"]`).forEach(img => { img.src = project.image; });
  if (project.role || project.status) document.querySelector(`#${project.id} .case-disclosure`).textContent = [project.role && `My role: ${project.role}.`, project.status && `Status: ${project.status}.`, 'Preview from the supplied Figma design.'].filter(Boolean).join(' ');
});
const serviceSelect = document.querySelector('select[name="service"]');
function selectService(name) { serviceSelect.value = name; }
data.services.forEach((service, index) => {
  const row = make('article', 'service-row'); row.append(make('span', 'service-number', `0${index + 1}`));
  const icon = make('span', 'service-icon', service.symbol); icon.setAttribute('aria-hidden', 'true'); row.append(icon, make('h3', '', service.name));
  const copy = make('div', 'service-copy'); copy.append(make('p', '', service.description), make('p', 'service-items', service.items)); row.append(copy);
  const link = make('a', 'service-arrow', '↗'); link.href = '#contact'; link.setAttribute('aria-label', `Inquire about ${service.name}`); link.addEventListener('click', () => selectService(service.name)); row.append(link); document.getElementById('services-list').append(row);
});
data.training.forEach(training => {
  const card = make('article', `training-card ${training.theme}`);
  const header = make('div', 'training-header'); header.append(make('p', 'eyebrow', training.label)); const symbol = make('span', 'training-icon', training.symbol); symbol.setAttribute('aria-hidden', 'true'); header.append(symbol); card.append(header);
  card.append(make('h3', '', training.name), make('p', 'training-description', training.description));
  const list = make('ul', 'training-topics'); training.topics.forEach(topic => list.append(make('li', '', topic))); card.append(list);
  const bottom = make('div', 'training-price-row'); const price = make('div'); price.append(make('span', 'price-label', 'PERSONALISED LEARNING'), make('p', 'training-quote', 'Let’s find your starting point.'), make('span', 'quote-currency', 'Training quotes in USD')); 
  const link = make('a', 'button dark', 'Request pricing ↗'); link.href = '#contact'; link.addEventListener('click', () => selectService(training.name)); bottom.append(price, link); card.append(bottom); document.getElementById('training-list').append(card);
});
document.querySelectorAll('[data-inquire]').forEach(link => link.addEventListener('click', () => selectService(link.dataset.inquire)));
const menu = document.querySelector('.menu'); const nav = document.querySelector('nav');
function closeMenu(returnFocus = false) { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); if (returnFocus) menu.focus(); }
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); });
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true); });
document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
matchMedia('(max-width: 760px)').addEventListener('change', () => closeMenu());
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); } }), { threshold: 0.08 });
  document.querySelectorAll('.case-card, .creative-work, .training-card, .about-grid').forEach(node => { node.classList.add('reveal'); observer.observe(node); });
}
if (['localhost', '127.0.0.1'].includes(location.hostname) || location.protocol === 'file:') document.querySelector('form[name="inquiry"]').addEventListener('submit', event => { event.preventDefault(); document.querySelector('.form-note').textContent = 'Preview only: nothing was sent. The live Netlify site receives inquiries after form detection is enabled.'; });
