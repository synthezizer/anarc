/**
 * Beat player controller. The player element persists across client-side
 * navigations, so it is wired exactly once and keeps playing between tabs.
 */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const fmt = (seconds: number) => {
  if (!Number.isFinite(seconds)) return '--:--';
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const setFill = (input: HTMLInputElement) => {
  const min = Number(input.min) || 0;
  const max = Number(input.max) || 1;
  input.style.setProperty('--fill', `${((Number(input.value) - min) / (max - min)) * 100}%`);
};

function wire(root: HTMLElement): void {
  const q = <T extends Element>(sel: string) => root.querySelector<T>(sel);
  const audio = q<HTMLAudioElement>('[data-audio]');
  const toggle = q<HTMLButtonElement>('[data-toggle]');
  const seek = q<HTMLInputElement>('[data-seek]');
  const volume = q<HTMLInputElement>('[data-volume]');
  const title = q<HTMLElement>('[data-title]');
  const current = q<HTMLElement>('[data-current]');
  const duration = q<HTMLElement>('[data-duration]');
  const canvas = q<HTMLCanvasElement>('[data-viz]');
  const tracks = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-track]'));
  if (!audio || !toggle || !seek || !volume || !title || !current || !duration || !canvas || tracks.length === 0) return;

  let index = 0;
  let seeking = false;

  // Track lengths, fetched as metadata only.
  tracks.forEach((track) => {
    const probe = new Audio();
    probe.preload = 'metadata';
    probe.src = track.dataset['src'] ?? '';
    probe.addEventListener('loadedmetadata', () => {
      const out = track.querySelector('[data-length]');
      if (out) out.textContent = fmt(probe.duration);
    });
  });

  const select = (i: number, autoplay: boolean) => {
    cancelFade();
    index = (i + tracks.length) % tracks.length;
    const track = tracks[index];
    if (!track) return;
    audio.src = track.dataset['src'] ?? '';
    title.textContent = track.querySelector('.name')?.textContent ?? '';
    tracks.forEach((t) => t.setAttribute('aria-current', String(t === track)));
    current.textContent = '0:00';
    duration.textContent = '--:--';
    seek.value = '0';
    setFill(seek);
    updateMediaSession();
    if (autoplay) void play();
  };

  const play = async () => {
    cancelFade();
    if (!audio.src) select(index, false);
    ensureAnalyser();
    await audioContext?.resume();
    await audio.play().catch(() => undefined);
    fadeIn();
  };

  // ---- Click-free pause: fade out, pause, stay silent; fade back in on play ----
  const FADE_OUT_MS = 350;
  const FADE_IN_MS = 90;
  let fadeTimer: number | undefined;
  let fadeFrame = 0;

  /** Ramp the element volume (fallback when there is no Web Audio graph). */
  function rampVolume(to: number, ms: number) {
    cancelAnimationFrame(fadeFrame);
    const from = audio!.volume;
    const start = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      audio!.volume = from + (to - from) * k;
      if (k < 1) fadeFrame = requestAnimationFrame(step);
    };
    fadeFrame = requestAnimationFrame(step);
  }

  function cancelFade() {
    window.clearTimeout(fadeTimer);
    fadeTimer = undefined;
    cancelAnimationFrame(fadeFrame);
  }

  function fadeIn() {
    if (gain && audioContext) {
      const now = audioContext.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(1, now + FADE_IN_MS / 1000);
    } else {
      rampVolume(Number(volume!.value), FADE_IN_MS);
    }
  }

  function fadeOutAndPause() {
    if (audio!.paused || fadeTimer !== undefined) return;
    if (gain && audioContext) {
      // Exponential-style decay sounds natural and never hits a hard edge.
      const now = audioContext.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.setTargetAtTime(0, now, FADE_OUT_MS / 1000 / 4);
    } else {
      rampVolume(0, FADE_OUT_MS);
    }
    // Pause a beat after the fade lands; gain stays at 0 until the next play.
    fadeTimer = window.setTimeout(() => {
      fadeTimer = undefined;
      audio!.pause();
    }, FADE_OUT_MS + 40);
  }

  // ---- Visualizer (Web Audio analyser → canvas bars) ----
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let gain: GainNode | null = null;
  let frame = 0;
  const ctx2d = canvas.getContext('2d');

  function ensureAnalyser() {
    if (audioContext || reducedMotion) return;
    try {
      audioContext = new AudioContext();
      const source = audioContext.createMediaElementSource(audio!);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.8;
      gain = audioContext.createGain();
      source.connect(gain);
      gain.connect(analyser);
      analyser.connect(audioContext.destination);
    } catch {
      audioContext = null;
      analyser = null;
      gain = null;
    }
  }

  const bars = 28;
  const data = new Uint8Array(256);
  // Log-spaced bins so bass-heavy beats spread across the whole screen.
  const binFor = (i: number) => Math.min(200, Math.floor(Math.pow(200, i / (bars - 1))));

  function draw(levels: (i: number) => number) {
    if (!ctx2d) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas!.clientWidth;
    const h = canvas!.clientHeight;
    if (canvas!.width !== w * dpr) {
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
    }
    ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx2d.clearRect(0, 0, w, h);
    const gap = 2;
    const bw = (w - gap * (bars - 1)) / bars;
    const grad = ctx2d.createLinearGradient(0, h, 0, 0);
    grad.addColorStop(0, 'rgba(63, 217, 120, 0.85)');
    grad.addColorStop(0.6, 'rgba(46, 167, 230, 0.75)');
    grad.addColorStop(1, 'rgba(200, 240, 255, 0.6)');
    ctx2d.fillStyle = grad;
    for (let i = 0; i < bars; i++) {
      const bh = Math.max(2, levels(i) * (h - 8));
      // Bit-crushed LED meter: stacked 3px blocks, quantised to whole segments
      const seg = 3;
      const segs = Math.round(bh / (seg + 1));
      for (let k = 0; k < segs; k++) ctx2d.fillRect(Math.round(i * (bw + gap)), h - (k + 1) * (seg + 1), Math.round(bw), seg);
    }
  }

  const idle = () => draw((i) => 0.06 + 0.04 * Math.sin(i * 0.7));

  function loop() {
    if (!analyser) return;
    analyser.getByteFrequencyData(data);
    draw((i) => (data[binFor(i)] ?? 0) / 255);
    frame = requestAnimationFrame(loop);
  }

  idle();

  // ---- Events ----
  toggle.addEventListener('click', () => (audio.paused || fadeTimer !== undefined ? void play() : fadeOutAndPause()));
  q('[data-prev]')?.addEventListener('click', () => (audio.currentTime > 3 ? (audio.currentTime = 0) : select(index - 1, !audio.paused)));
  q('[data-next]')?.addEventListener('click', () => select(index + 1, !audio.paused));
  tracks.forEach((track, i) =>
    track.addEventListener('click', () => (i === index && audio.src ? (audio.paused || fadeTimer !== undefined ? void play() : fadeOutAndPause()) : select(i, true))),
  );

  audio.addEventListener('play', () => {
    root.classList.add('is-playing');
    toggle.setAttribute('aria-label', 'Pause');
    if (analyser && !frame) frame = requestAnimationFrame(loop);
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
  });
  audio.addEventListener('pause', () => {
    root.classList.remove('is-playing');
    toggle.setAttribute('aria-label', 'Play');
    // Freeze on the last drawn frame: it stays on screen as the paused "cover".
    cancelAnimationFrame(frame);
    frame = 0;
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
  });
  audio.addEventListener('ended', () => select(index + 1, true));
  audio.addEventListener('loadedmetadata', () => (duration.textContent = fmt(audio.duration)));
  audio.addEventListener('timeupdate', () => {
    current.textContent = fmt(audio.currentTime);
    if (!seeking && audio.duration) {
      seek.value = String(Math.round((audio.currentTime / audio.duration) * 1000));
      setFill(seek);
    }
  });

  seek.addEventListener('input', () => {
    seeking = true;
    setFill(seek);
    if (audio.duration) current.textContent = fmt((Number(seek.value) / 1000) * audio.duration);
  });
  seek.addEventListener('change', () => {
    if (audio.duration) audio.currentTime = (Number(seek.value) / 1000) * audio.duration;
    seeking = false;
  });

  audio.volume = Number(volume.value);
  setFill(volume);
  volume.addEventListener('input', () => {
    if (gain || !audio.paused) audio.volume = Number(volume.value);
    setFill(volume);
  });

  // ---- OS media controls (lock screen, media keys) ----
  function updateMediaSession() {
    if (!('mediaSession' in navigator)) return;
    const track = tracks[index];
    const cover = track?.dataset['cover'];
    navigator.mediaSession.metadata = new MediaMetadata({
      title: title!.textContent ?? '',
      artist: root.dataset['artist'] ?? '',
      artwork: cover ? [{ src: new URL(cover, location.href).href }] : [],
    });
  }

  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => void play());
    navigator.mediaSession.setActionHandler('pause', () => fadeOutAndPause());
    navigator.mediaSession.setActionHandler('previoustrack', () => select(index - 1, true));
    navigator.mediaSession.setActionHandler('nexttrack', () => select(index + 1, true));
  }

  select(0, false);
}

export function startPlayer(): void {
  const attach = () => {
    document.querySelectorAll<HTMLElement>('[data-player]').forEach((player) => {
      if (player.dataset['ready']) return;
      player.dataset['ready'] = 'true';
      wire(player);
    });
  };
  document.addEventListener('astro:page-load', attach);
}
