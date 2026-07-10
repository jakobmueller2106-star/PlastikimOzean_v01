// ═══════════════════════════════════════════════════════
// particles.js – Canvas-Partikelanimation
//
// WIE ES FUNKTIONIERT:
//   1. Ein <canvas>-Element wird über die Leaflet-Karte gelegt.
//   2. Jedes Partikel hat eine Position (lat/lng) und folgt
//      dem nächstgelegenen Strömungsvektor.
//   3. requestAnimationFrame() animiert 60fps.
//
// VERBINDUNG ZU DEN FOLIEN:
//   INME Folie 76: "animierte Karte – Ausbreitung eines
//   Phänomens als Zeitschritt-Animation"
// ═══════════════════════════════════════════════════════

class ParticleSystem {
  constructor(map) {
    this.map      = map;
    this.canvas   = null;
    this.ctx      = null;
    this.particles = [];
    this.animId   = null;
    this.running  = false;

    this._buildCanvas();
    this._spawnParticles(300);  // Anzahl Partikel
    this._bindMapEvents();
  }

  // ── Canvas über Leaflet-Karte legen ──
  _buildCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'particle-canvas';
    this.canvas.style.cssText = `
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      z-index: 450;
    `;
    // Leaflet-Pane nutzen, damit Canvas korrekt sitzt
    const pane = this.map.getPane('overlayPane');
    pane.appendChild(this.canvas);
    this._resize();
  }

  _resize() {
    const container = this.map.getContainer();
    this.canvas.width  = container.offsetWidth;
    this.canvas.height = container.offsetHeight;
  }

  // ── Partikel initialisieren ──
  _spawnParticles(count) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push(this._newParticle());
    }
  }

  _newParticle() {
    // Zufällige Startposition im sichtbaren Lat/Lng-Bereich
    const lat = Math.random() * 120 - 60;   // -60° bis +60°
    const lng = Math.random() * 360 - 180;  // -180° bis +180°

    // Strömungsvektor für diesen Punkt berechnen
    const vel = this._velocityAt(lat, lng);

    return {
      lat,
      lng,
      vLat: vel.vLat,
      vLng: vel.vLng,
      age: Math.floor(Math.random() * 200),   // Startphase verteilen
      maxAge: 150 + Math.floor(Math.random() * 200),
      size: 1.2 + Math.random() * 1.5,
      alpha: 0,
    };
  }

  // ── Geschwindigkeit am Punkt (nächste Strömung) ──
  _velocityAt(lat, lng) {
    let bestDist = Infinity;
    let bestCurrent = null;

    for (const c of CURRENTS) {
      const midLat = (c.from[0] + c.to[0]) / 2;
      const midLng = (c.from[1] + c.to[1]) / 2;
      const d = Math.hypot(lat - midLat, lng - midLng);
      if (d < bestDist) {
        bestDist = d;
        bestCurrent = c;
      }
    }

    if (!bestCurrent) return { vLat: 0, vLng: 0 };

    const dLat = (bestCurrent.to[0] - bestCurrent.from[0]);
    const dLng = (bestCurrent.to[1] - bestCurrent.from[1]);
    const len  = Math.hypot(dLat, dLng) || 1;
    const speed = 0.03 * bestCurrent.strength;

    return {
      vLat: (dLat / len) * speed,
      vLng: (dLng / len) * speed,
    };
  }

  // ── Kartenbewegungen verfolgen ──
  _bindMapEvents() {
    this.map.on('move zoom resize', () => {
      this._resize();
    });
  }

  // ── Lat/Lng → Pixel auf Canvas ──
  _latlngToCanvas(lat, lng) {
    const point = this.map.latLngToContainerPoint([lat, lng]);
    return { x: point.x, y: point.y };
  }

  // ── Hauptanimation ──
  start() {
    if (this.running) return;
    this.running = true;
    this._loop();
  }

  stop() {
    this.running = false;
    if (this.animId) cancelAnimationFrame(this.animId);
  }

  _loop() {
    if (!this.running) return;
    this._draw();
    this.animId = requestAnimationFrame(() => this._loop());
  }

  _draw() {
    const ctx = this.canvas.getContext('2d');
    const W   = this.canvas.width;
    const H   = this.canvas.height;

    // Nachleucht-Effekt (Trail)
    ctx.fillStyle = 'rgba(6, 13, 26, 0.15)';
    ctx.fillRect(0, 0, W, H);

    for (const p of this.particles) {
      // Position aktualisieren
      p.lat += p.vLat;
      p.lng += p.vLng;
      p.age++;

      // Fade in / out
      if (p.age < 30) {
        p.alpha = p.age / 30;
      } else if (p.age > p.maxAge - 30) {
        p.alpha = (p.maxAge - p.age) / 30;
      } else {
        p.alpha = 1;
      }

      // Partikel neu starten wenn zu alt oder außerhalb
      if (p.age > p.maxAge || p.lat < -70 || p.lat > 70) {
        Object.assign(p, this._newParticle());
        continue;
      }

      // Pixel-Position berechnen
      let px;
      try {
        px = this._latlngToCanvas(p.lat, p.lng);
      } catch (_) {
        continue;
      }

      // Nur zeichnen wenn im Sichtbereich
      if (px.x < -20 || px.x > W + 20 || px.y < -20 || px.y > H + 20) {
        continue;
      }

      // Partikel zeichnen
      ctx.beginPath();
      ctx.arc(px.x, px.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 212, 255, ${p.alpha * 0.7})`;
      ctx.fill();
    }
  }
}
