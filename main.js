// ═══════════════════════════════════════════════════════
// main.js – Einstiegspunkt der Anwendung
//
// Initialisiert alle Module in der richtigen Reihenfolge:
//   1. Leaflet-Karte + Marker
//   2. Partikelanimation
//   3. Scrollytelling-Observer
//   4. Counter-Animationen
// ═══════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // Karte aufbauen (map.js → ParticleSystem aus particles.js)
  initMap();

  // Scrollytelling starten (scroll.js)
  initScrollytelling();

  // Zähler-Animationen (scroll.js)
  initCounters();

  // Smooth-Scroll für den Hero-CTA-Button
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Karte-Scroll-Lock: Karte nur scrollen wenn Nutzer Strg hält
  // (verhindert, dass die Karte den Seiten-Scroll kapert)
  const mapEl = document.getElementById('map');
  if (mapEl) {
    mapEl.addEventListener('wheel', (e) => {
      if (!e.ctrlKey) e.stopPropagation();
    }, { passive: false });
  }

  console.log('✓ Plastik im Ozean – Visualisierung geladen');
});
