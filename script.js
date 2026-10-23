(function () {
  'use strict';

  /* ---------- Dark / light theme ---------- */
  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');

  function setTheme(theme) {
    root.setAttribute('data-bs-theme', theme);
    toggle.checked = theme === 'dark';
    try { localStorage.setItem('sw-theme', theme); } catch (e) {}
  }
  toggle.checked = root.getAttribute('data-bs-theme') === 'dark';
  toggle.addEventListener('change', function () {
    setTheme(toggle.checked ? 'dark' : 'light');
  });

  var DURATION = 225; // seconds (3:45), demo value
  var tracks = [];
  var seen = {};
  document.querySelectorAll('[data-track]').forEach(function (el) {
    var key = el.dataset.track + '|' + el.dataset.artist;
    if (!seen[key]) { seen[key] = true; tracks.push({ title: el.dataset.track, artist: el.dataset.artist }); }
  });

  var index = 0, position = 0, playing = false, timer = null;
  var titleEl = document.getElementById('playerTitle');
  var artistEl = document.getElementById('playerArtist');
  var playBtn = document.getElementById('playBtn');
  var playIcon = document.getElementById('playIcon');
  var bar = document.getElementById('progressBar');
  var progress = document.getElementById('progress');
  var curTime = document.getElementById('curTime');
  var durTime = document.getElementById('durTime');
  var coverEl = document.getElementById('playerCover');
  var defaultCover = coverEl.getAttribute('src');

  function coverFor(title) {
    return 'images/' + title.toLowerCase().replace(/[^a-z0-9]/g, '') + '.jpg';
  }

  function updateCover(title) {
    var next = coverFor(title);
    if (coverEl.dataset.current === next) { return; }   // same track, nothing to change
    coverEl.dataset.current = next;
    coverEl.onerror = function () {                      // no file for this track -> default cover
      coverEl.onerror = null;
      coverEl.src = defaultCover;
    };
    coverEl.src = next;
  }

  function fmt(s) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

  function render() {
    var t = tracks[index];
    titleEl.textContent = t.title;
    artistEl.textContent = t.artist;
    updateCover(t.title);
    curTime.textContent = fmt(position);
    durTime.textContent = fmt(DURATION);
    var pct = Math.round((position / DURATION) * 100);
    bar.style.width = pct + '%';
    progress.setAttribute('aria-valuenow', pct);
    playIcon.setAttribute('href', playing ? '#i-pause' : '#i-play');
    playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }

  function tick() {
    position += 1;
    if (position >= DURATION) { go(index + 1, true); return; }
    render();
  }

  function setPlaying(state) {
    playing = state;
    clearInterval(timer);
    if (playing) { timer = setInterval(tick, 1000); }
    render();
  }

  function go(i, autoplay) {
    index = (i + tracks.length) % tracks.length;
    position = 0;
    setPlaying(autoplay);
  }

  playBtn.addEventListener('click', function () { setPlaying(!playing); });
  document.getElementById('nextBtn').addEventListener('click', function () { go(index + 1, playing); });
  document.getElementById('prevBtn').addEventListener('click', function () {
    if (position > 3) { position = 0; render(); } else { go(index - 1, playing); }
  });

  document.querySelectorAll('[data-track]').forEach(function (el) {
    el.addEventListener('click', function () {
      var i = tracks.findIndex(function (t) { return t.title === el.dataset.track && t.artist === el.dataset.artist; });
      go(i, true);
    });
  });

  render();

  /* ---------- Forms ---------- */
  document.querySelectorAll('form[role="search"]').forEach(function (f) {
    f.addEventListener('submit', function (e) { e.preventDefault(); });
  });

  document.getElementById('subscribe-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var email = document.getElementById('email');
    var agree = document.getElementById('agree');
    var msg = document.getElementById('form-msg');
    if (!email.checkValidity() || !agree.checked) {
      msg.textContent = 'Enter a valid email and accept the terms to subscribe.';
      return;
    }
    msg.textContent = 'You are subscribed. Watch your inbox on Friday.';
    this.reset();
  });
})();