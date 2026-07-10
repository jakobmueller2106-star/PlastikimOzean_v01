// ═══════════════════════════════════════════════════════
// scroll.js – Scrollytelling-Logik
//
// ENTSPRICHT DEN FOLIEN:
//   - INME Folie 464/466: "IntersectionObserver" für
//     Scrollytelling, Fading-Effekte zwischen Akten
//   - INME Folie 76: "Scrollytelling-Effekt, der beim
//     Scrollen Grafiken belebt"
//   - Bahn-Fallbeispiel Folie 465: "Scrollytelling,
//     Buttons, animierte Grafiken, Fading-Effekte"
// ═══════════════════════════════════════════════════════

function initScrollytelling() {
  const steps = document.querySelectorAll('.story__step');
  const cards = document.querySelectorAll('.story__card');

  // ── IntersectionObserver beobachtet jeden Schritt ──
  // Wenn ein Schritt 50% sichtbar ist → Karte fliegt dorthin
  const stepObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const step = parseInt(entry.target.dataset.step, 10);

          // Karte zur passenden Position fliegen
          flyToStep(step);

          // Zugehörige Card einblenden
          const card = entry.target.querySelector('.story__card');
          if (card) card.classList.add('is-active');

        } else {
          // Card ausblenden wenn Schritt nicht mehr sichtbar
          const card = entry.target.querySelector('.story__card');
          if (card) card.classList.remove('is-active');
        }
      }
    },
    {
      root: null,          // Viewport
      rootMargin: '-20% 0px -20% 0px',  // Trifft wenn Mitte des Schritts sichtbar
      threshold: 0.2,
    }
  );

  steps.forEach((step) => stepObserver.observe(step));

  // ── Reveal-Elemente (Dashboard, Methodik) ──
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target); // Nur einmal animieren
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.reveal').forEach((el) => {
    revealObserver.observe(el);
  });
}

// ── Zähler-Animation für Dashboard-Zahlen ──
function initCounters() {
  const counters = document.querySelectorAll('.dashboard__number');

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((c) => counterObserver.observe(c));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800; // ms
  const steps = 60;
  const stepDuration = duration / steps;
  let current = 0;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    // Easing: schnell am Anfang, langsamer am Ende
    const progress = step / steps;
    const ease = 1 - Math.pow(1 - progress, 3);
    current = Math.round(target * ease);

    // Tausender-Trennzeichen für große Zahlen
    el.textContent = current.toLocaleString('de-DE');

    if (step >= steps) {
      clearInterval(timer);
      el.textContent = target.toLocaleString('de-DE');
    }
  }, stepDuration);
}
