// Public gallery. The upload editor is available only through the local preview server.
(() => {
  const track = document.getElementById('film-track');
  const status = document.getElementById('film-status');
  const prev = document.getElementById('film-prev');
  const next = document.getElementById('film-next');
  let clips = [];
  let active = 0;
  let observer;
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  const element = (tag, cls, text) => { const el = document.createElement(tag); el.className = cls; if (text) el.textContent = text; return el; };
  function updatePosition() {
    const cards = [...track.querySelectorAll('.reel-card')];
    if (!cards.length) { prev.disabled = next.disabled = true; return; }
    const left = track.getBoundingClientRect().left;
    active = cards.reduce((best, card, i) => Math.abs(card.getBoundingClientRect().left - left) < Math.abs(cards[best].getBoundingClientRect().left - left) ? i : best, 0);
    prev.disabled = active === 0; next.disabled = active === cards.length - 1;
    status.textContent = `${active + 1} / ${cards.length} — ${clips[active].title}`;
  }
  function move(direction) {
    const cards = track.querySelectorAll('.reel-card');
    const card = cards[Math.max(0, Math.min(cards.length - 1, active + direction))];
    if (card) track.scrollTo({left: track.scrollLeft + card.getBoundingClientRect().left - track.getBoundingClientRect().left, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }
  prev.addEventListener('click', () => move(-1)); next.addEventListener('click', () => move(1));
  track.addEventListener('keydown', event => { if (event.target === track && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); } });
  let pending;
  track.addEventListener('scroll', () => { cancelAnimationFrame(pending); pending = requestAnimationFrame(updatePosition); }, {passive: true});
  function render() {
    observer?.disconnect(); track.querySelectorAll('video').forEach(video => { video.pause(); video.removeAttribute('src'); video.load(); });
    track.replaceChildren(); active = 0;
    if (!clips.length) {
      const empty = element('div', 'film-empty'); empty.append(element('span', 'empty-frame', '▷'), element('h4', '', 'The film collection is on its way.'), element('p', '', 'Have a story to tell? Let’s create it together.'));
      const link = element('a', 'text-link', 'Discuss your film ↗'); link.href = '#contact'; empty.append(link); track.append(empty); status.textContent = ''; updatePosition(); return;
    }
    observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.intersectionRatio < 0.5) entry.target.pause(); }), {threshold: [0, 0.5], root: track});
    clips.forEach((clip, index) => {
      const card = element('article', 'reel-card'); card.setAttribute('aria-label', `${clip.title}, video ${index + 1} of ${clips.length}`);
      const frame = element('div', 'reel-player');
      if (clip.instagram) {
        const launch = element('button', 'instagram-launch', '▶ Watch Reel'); launch.type = 'button';
        const player = element('iframe', 'instagram-embed'); player.title = clip.title; player.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture'; player.allowFullscreen = true;
        const stop = () => { player.removeAttribute('src'); player.hidden = true; launch.hidden = false; };
        stop(); launch.addEventListener('stop-reel', stop);
        launch.addEventListener('click', () => {
          track.querySelectorAll('video').forEach(video => video.pause());
          track.querySelectorAll('.instagram-launch').forEach(button => { if(button !== launch) button.dispatchEvent(new Event('stop-reel')); });
          player.src = 'https://www.instagram.com/reel/' + clip.instagram + '/embed/'; player.hidden = false; launch.hidden = true;
        });
        const watch = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.intersectionRatio < 0.5) stop(); }), {root:track, threshold:[0,0.5]}); watch.observe(frame);
        document.addEventListener('visibilitychange', () => { if(document.hidden) stop(); });
        frame.append(player, launch);
        const caption = element('div', 'reel-caption'); caption.append(element('h4', '', clip.title));
        const link = element('a', 'text-link', 'Watch on Instagram ↗'); link.href = 'https://www.instagram.com/reel/' + clip.instagram + '/'; link.target = '_blank'; link.rel = 'noopener noreferrer'; caption.append(link);
        card.append(frame, caption); track.append(card); return;
      }
      const top = element('div', 'reel-brand'); top.append(element('span', 'reel-avatar', 's.'), element('span', '', 'sticebeks'), element('span', 'reel-category', clip.category || 'Film'));
      const video = element('video', 'portfolio-video'); video.controls = true; video.playsInline = true; video.preload = 'metadata'; video.src = clip.src; video.setAttribute('aria-label', clip.title);
      if (clip.poster && /^(assets\/|https:\/\/)/.test(clip.poster)) video.poster = clip.poster;
      const hint = element('span', 'video-hint', 'Press play to watch');
      video.addEventListener('play', () => { track.querySelectorAll('video').forEach(other => { if (other !== video) other.pause(); }); hint.hidden = true; });
      video.addEventListener('error', () => { hint.hidden = false; hint.textContent = 'This clip could not load. Try another browser or contact me.'; });
      frame.append(video, top, hint); observer.observe(video);
      const caption = element('div', 'reel-caption'); caption.append(element('span', 'reel-count', `${String(index + 1).padStart(2, '0')} / ${String(clips.length).padStart(2, '0')}`), element('h4', '', clip.title));
      if (clip.caption) caption.append(element('p', '', clip.caption));
      card.append(frame, caption); track.append(card);
    });
    track.scrollLeft = 0; updatePosition();
  }
  async function load() {
    const response = await fetch('videos.json', {cache: 'no-store'}); if (!response.ok) throw Error('Gallery could not load.');
    const records = await response.json(); if (!Array.isArray(records)) throw Error('Gallery format is invalid.');
    clips = records.filter(clip => typeof clip.title === 'string' && ((typeof clip.instagram === 'string' && /^[A-Za-z0-9_-]+$/.test(clip.instagram)) || (typeof clip.src === 'string' && /^(assets\/videos\/|https:\/\/)/.test(clip.src)))); render();
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) track.querySelectorAll('video').forEach(video => video.pause()); });
  window.addEventListener('resize', updatePosition);
  load().catch(() => { status.textContent = 'The film collection is temporarily unavailable. Please get in touch to see my work.'; prev.disabled = next.disabled = true; });
  if (local) setupEditor();
  async function setupEditor() {
    try {
      const response = await fetch('/api/editor'); if (!response.ok) return;
      const {token} = await response.json(); if (!token) return;
      document.getElementById('video-owner').hidden = false;
      const form = document.getElementById('video-upload'); const message = form.querySelector('.upload-status'); const button = form.querySelector('button');
      form.addEventListener('submit', async event => {
        event.preventDefault(); const file = form.elements.video.files[0];
        if (!file || !/\.(mp4|webm)$/i.test(file.name)) { message.textContent = 'Choose an MP4 or WebM video.'; return; }
        if (file.size > 80 * 1024 * 1024) { message.textContent = 'Please export a smaller clip, under 80 MB.'; return; }
        button.disabled = true; message.textContent = 'Saving your clip… Keep this page open.';
        const query = new URLSearchParams({filename: file.name, title: form.elements.title.value.trim(), category: form.elements.category.value, caption: form.elements.caption.value.trim()});
        try {
          const result = await fetch(`/api/videos?${query}`, {method: 'POST', headers: {'Content-Type': file.type || 'application/octet-stream', 'X-Editor-Token': token}, body: file});
          const payload = await result.json(); if (!result.ok) throw Error(payload.error || 'Video could not be saved.');
          await load(); form.reset(); message.textContent = 'Saved to the project. Commit and push the video file and videos.json to publish it on Netlify.';
        } catch (error) { message.textContent = error.message; }
        finally { button.disabled = false; }
      });
    } catch { /* Public site and other preview servers do not expose the local editor. */ }
  }
})();
