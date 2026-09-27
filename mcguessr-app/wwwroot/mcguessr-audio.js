// Kleiner, eigenständiger Audio-Manager für Musik + Soundeffekte.
// Fehlende Dateien (siehe audio/README.md) führen zu keinem Fehler - .play()
// schlägt dann einfach lautlos fehl, das Spiel läuft normal weiter.
const AudioManager = (() => {
  const STORAGE_MUSIC = "mcguessr.musicVolume";
  const STORAGE_SFX = "mcguessr.sfxVolume";

  const CROSSFADE_MS = 1800;
  const DUCK_MS = 500;
  const DUCK_FACTOR = 0.25; // Musik-Lautstärke während der Warnung
  const WARNING_HOLD_MS = 3000; // spätestens danach wieder lauter, egal wie lang die Warnungsdatei ist
  const TRACK_SLOTS = 6; // menu1.mp3 .. menu6.mp3 - überzählige/fehlende werden einfach übersprungen

  let musicVolume = 0.5;
  let sfxVolume = 0.7;

  try {
    const m = localStorage.getItem(STORAGE_MUSIC);
    const s = localStorage.getItem(STORAGE_SFX);
    if (m !== null) musicVolume = parseFloat(m);
    if (s !== null) sfxVolume = parseFloat(s);
  } catch (e) { /* localStorage evtl. nicht verfügbar */ }

  // ---- Eine einzige durchgehende Musik-Playlist für Menü UND Runde - beim
  // Rundenstart wird nichts umgeschaltet, der gerade laufende Track spielt
  // einfach weiter. Mehrere Tracks wechseln sich zufällig mit Crossfade ab. ----
  const musicTracks = [];
  // "menu.mp3" bleibt als Fallback nutzbar, falls nur eine einzelne Datei
  // ohne Nummer vorhanden ist.
  ["menu.mp3", ...Array.from({ length: TRACK_SLOTS }, (_, i) => `menu${i + 1}.mp3`)]
    .forEach((filename) => {
      const a = new Audio(`audio/music/${filename}`);
      // "none" statt "auto": lädt erst beim tatsächlichen Abspielversuch -
      // sonst holt der Browser bei jedem Laden alle (meist leeren) Slots
      // sofort ab.
      a.preload = "none";
      a.loop = false;
      a.usable = true;
      a.addEventListener("error", () => { a.usable = false; });
      musicTracks.push(a);
    });

  let currentTrack = null;
  let musicActive = false;
  let musicBlocked = false;

  // Kurze "Warnung", die die laufende Musik nur duckt statt sie zu ersetzen.
  const warningTrack = new Audio("audio/music/game-lowtime.mp3");
  warningTrack.loop = false;

  const sfxSources = {
    click: "audio/sfx/click.mp3",
    result: "audio/sfx/result.mp3",
    impact: "audio/sfx/impact.mp3",
  };

  function clearFade(audio) {
    if (audio._fadeInterval) {
      clearInterval(audio._fadeInterval);
      audio._fadeInterval = null;
    }
  }

  function fadeVolume(audio, to, ms, onDone) {
    clearFade(audio);
    const from = audio.volume;
    const steps = Math.max(1, Math.round(ms / 40));
    let i = 0;
    audio._fadeInterval = setInterval(() => {
      i++;
      audio.volume = Math.max(0, Math.min(1, from + (to - from) * (i / steps)));
      if (i >= steps) {
        clearFade(audio);
        audio.volume = to;
        if (onDone) onDone();
      }
    }, ms / steps);
  }

  function safePlay(audio, onBlocked) {
    const p = audio.play();
    if (p && p.catch) p.catch(() => { if (onBlocked) onBlocked(); });
  }

  // ---- Musik-Playlist ----
  function playRandomTrack(excluding) {
    if (!musicActive) return;

    const pool = musicTracks.filter((t) => t.usable && t !== excluding);
    const candidates = pool.length ? pool : musicTracks.filter((t) => t.usable);
    if (!candidates.length) return; // keine Datei verfügbar - einfach still

    const next = candidates[Math.floor(Math.random() * candidates.length)];
    const prev = currentTrack;
    currentTrack = next;

    next.currentTime = 0;
    next.volume = prev ? 0 : musicVolume;
    next.onended = () => playRandomTrack(next);

    safePlay(next, () => { musicBlocked = true; });

    if (prev && prev !== next) {
      fadeVolume(next, musicVolume, CROSSFADE_MS);
      fadeVolume(prev, 0, CROSSFADE_MS, () => { prev.pause(); prev.onended = null; });
    }
  }

  function startMusic() {
    if (musicActive) return;
    musicActive = true;
    musicBlocked = false;
    playRandomTrack(null);
  }

  function stopMusic() {
    musicActive = false;
    musicBlocked = false;
    warningTrack.onended = null;
    clearFade(warningTrack);
    warningTrack.pause();
    warningTrack.currentTime = 0;
    if (currentTrack) {
      currentTrack.onended = null;
      fadeVolume(currentTrack, 0, 400, () => currentTrack && currentTrack.pause());
      currentTrack = null;
    }
  }

  // Rundenwechsel: falls die Warnung aus der Vorrunde noch nachklingt, sauber
  // zurücksetzen, damit jede neue Runde mit voller Lautstärke beginnt.
  function resetForNewRound() {
    warningTrack.onended = null;
    clearFade(warningTrack);
    warningTrack.pause();
    warningTrack.currentTime = 0;
    if (currentTrack) {
      clearFade(currentTrack);
      currentTrack.volume = musicVolume;
    }
  }

  // Wird einmal pro Runde aufgerufen, sobald die Zeit knapp wird: laufende
  // Musik leiser (kein Trackwechsel), Warnung einmal drüberlegen, danach
  // wieder hochfahren.
  function triggerLowTimeWarning() {
    const track = currentTrack;
    if (!track) return;

    fadeVolume(track, musicVolume * DUCK_FACTOR, DUCK_MS);

    // Nur einmal wiederherstellen, egal ob die Warnungsdatei von selbst zu
    // Ende ist oder die feste Haltezeit zuerst erreicht wird - manche
    // Warnungsdateien sind länger als die verbleibende Rundenzeit, dann
    // bliebe die Musik sonst bis zum nächsten Rundenstart leise.
    let restored = false;
    const restore = () => {
      if (restored) return;
      restored = true;
      clearTimeout(holdTimeout);
      warningTrack.onended = null;
      if (currentTrack === track) fadeVolume(track, musicVolume, DUCK_MS);
    };
    const holdTimeout = setTimeout(restore, WARNING_HOLD_MS);

    warningTrack.currentTime = 0;
    warningTrack.volume = musicVolume;
    warningTrack.onended = restore;
    safePlay(warningTrack, restore); // Datei fehlt/blockiert - Musik nicht dauerhaft leise lassen.
  }

  // ---- Lautstärke ----
  function setMusicVolume(v) {
    musicVolume = v;
    if (currentTrack && !currentTrack._fadeInterval) currentTrack.volume = v;
    try { localStorage.setItem(STORAGE_MUSIC, String(v)); } catch (e) {}
  }

  function setSfxVolume(v) {
    sfxVolume = v;
    try { localStorage.setItem(STORAGE_SFX, String(v)); } catch (e) {}
  }

  function playSfx(key) {
    const src = sfxSources[key];
    if (!src) return;
    const a = new Audio(src);
    a.volume = sfxVolume;
    a.play().catch(() => {});
  }

  // Browser blockieren Autoplay ohne vorherige Nutzerinteraktion - beim
  // ersten Klick irgendwo im Dokument wird das nachgeholt.
  document.addEventListener("click", () => {
    if (musicBlocked && musicActive) {
      musicBlocked = false;
      playRandomTrack(currentTrack);
    }
  });

  return {
    startMusic,
    stopMusic,
    resetForNewRound,
    triggerLowTimeWarning,
    playSfx,
    setMusicVolume,
    setSfxVolume,
    getMusicVolume: () => musicVolume,
    getSfxVolume: () => sfxVolume,
  };
})();

// Sound bei jedem Button-Klick, egal welcher - neue Buttons brauchen dafür
// keine eigene Verdrahtung.
document.addEventListener("click", (e) => {
  if (e.target.closest("button")) AudioManager.playSfx("click");
});
