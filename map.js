// ═══════════════════════════════════════════════════════
// map.js – Leaflet-Karte initialisieren und befüllen
//
// ENTSPRICHT DEN FOLIEN:
//   - Folie 107–109 INME: folium.Map(...), folium.CircleMarker,
//     folium.Marker mit Popup → hier 1:1 in Leaflet.js übersetzt
//   - Folie 195 DV: Punkt- vs. Choroplethenkarte → Punktmarker
//   - Folie 200 DV: Interaktive HTML-Karte mit Klick-Popup
// ═══════════════════════════════════════════════════════

let map;           // Globale Leaflet-Map-Instanz
let particleSystem; // Globale Partikelinstanz

function initMap() {
  // ── 1. Karte erstellen (wie folium.Map in den Folien) ──
  map = L.map('map', {
    center: [15, 0],
    zoom: 2,
    zoomControl: true,
    attributionControl: true,
    // Scrollen auf der Karte nicht mit Seiten-Scroll mixen
    scrollWheelZoom: false,
  });

  // ── 2. Kacheln einbinden (CartoDB Dark Matter = dunkles OSM)
  //    Entspricht tiles='CartoDB positron' aus den Folien (Folie 107),
  //    hier die dunkle Variante für Ocean-Thema
  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | © <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 10,
    }
  ).addTo(map);

  // ── 3. Daten auf Karte zeichnen ──
  _addGarbagePatches();
  _addPlasticSources();
  _addCurrentArrows();

  // ── 4. Partikelanimation starten ──
  particleSystem = new ParticleSystem(map);
  particleSystem.start();
}

// ── MÜLLSTRUDEL als Kreise (wie folium.CircleMarker in Folie 108) ──
function _addGarbagePatches() {
  for (const patch of GARBAGE_PATCHES) {
    // Äußerer Glüh-Kreis
    L.circle([patch.lat, patch.lng], {
      radius: patch.radius * 15000,
      color:       '#ff3b6b',
      fillColor:   '#ff3b6b',
      fillOpacity: 0.07,
      weight:      1.5,
      opacity:     0.4,
      className:   'patch-outer',
    }).addTo(map);

    // Innerer Kern-Kreis mit Popup (wie folium.Popup in Folie 108)
    const circle = L.circle([patch.lat, patch.lng], {
      radius:      patch.radius * 5000,
      color:       '#ff3b6b',
      fillColor:   '#ff3b6b',
      fillOpacity: 0.5,
      weight:      2,
    }).addTo(map);

    // Popup-Inhalt bauen (wie in Folie 109 beschrieben)
    const sizeFormatted = patch.size_km2.toLocaleString('de-DE');
    const weightFormatted = patch.weight_tons.toLocaleString('de-DE');

    circle.bindPopup(`
      <div class="popup-inner">
        <h3>${patch.name}</h3>
        <span class="popup-badge popup-badge--patch">Garbage Patch</span>
        <p>${patch.description}</p>
        <div class="popup-stat">
          <span class="popup-stat-key">Fläche</span>
          <span class="popup-stat-value">~${sizeFormatted} km²</span>
        </div>
        <div class="popup-stat">
          <span class="popup-stat-key">Plastik (geschätzt)</span>
          <span class="popup-stat-value">${weightFormatted} Tonnen</span>
        </div>
        <div class="popup-stat">
          <span class="popup-stat-key">Entdeckt</span>
          <span class="popup-stat-value">${patch.discovered}</span>
        </div>
        <div class="popup-stat">
          <span class="popup-stat-key">Quelle</span>
          <span class="popup-stat-value" style="font-size:0.72rem">${patch.source}</span>
        </div>
      </div>
    `, {
      maxWidth: 280,
      className: 'custom-popup',
    });

    // Hover-Effekt: Tooltip
    circle.bindTooltip(patch.name, {
      permanent: false,
      direction: 'top',
      className: 'patch-tooltip',
      offset: [0, -8],
    });
  }
}

// ── QUELLEN als Marker (wie folium.Marker in Folie 108/109) ──
function _addPlasticSources() {
  // Eigenes Dreieck-Icon für Quellen
  const sourceIcon = L.divIcon({
    html: `<div style="
      width:12px; height:12px;
      background: #ff6b35;
      border-radius: 2px;
      border: 2px solid rgba(255,107,53,0.5);
      box-shadow: 0 0 8px rgba(255,107,53,0.8);
    "></div>`,
    className: '',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

  for (const source of PLASTIC_SOURCES) {
    const tonsFormatted = source.annual_tons.toLocaleString('de-DE');

    L.marker([source.lat, source.lng], { icon: sourceIcon })
      .addTo(map)
      .bindPopup(`
        <div class="popup-inner">
          <h3>${source.name}</h3>
          <span class="popup-badge popup-badge--source">Plastikquelle</span>
          <p>${source.description}</p>
          <div class="popup-stat">
            <span class="popup-stat-key">Eintrag/Jahr</span>
            <span class="popup-stat-value">~${tonsFormatted} Tonnen</span>
          </div>
        </div>
      `, { maxWidth: 260, className: 'custom-popup' })
      .bindTooltip(source.name, {
        permanent: false,
        direction: 'top',
        className: 'patch-tooltip',
      });
  }
}

// ── STRÖMUNGSPFEILE als Polylinien ──
function _addCurrentArrows() {
  for (const current of CURRENTS) {
    // Linie der Strömung
    const line = L.polyline(
      [current.from, current.to],
      {
        color:   `rgba(0, 212, 255, ${0.2 * current.strength})`,
        weight:  1.5 * current.strength,
        opacity: 0.6,
        dashArray: '6, 8',
      }
    ).addTo(map);

    // Kleinen Pfeil am Ende der Linie
    _addArrowHead(current.to, current.from, current.to);
  }
}

// Pfeilspitze zeichnen
function _addArrowHead(tipLatLng, fromLatLng, toLatLng) {
  const tip  = L.latLng(tipLatLng);
  const from = L.latLng(fromLatLng);

  // Winkel berechnen
  const dx = tip.lng - from.lng;
  const dy = tip.lat - from.lat;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  // Kleinen Dreiecks-Marker als Pfeilkopf
  const arrowIcon = L.divIcon({
    html: `<div style="
      width: 0; height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-bottom: 9px solid rgba(0,212,255,0.5);
      transform: rotate(${-angle + 90}deg);
      transform-origin: center;
    "></div>`,
    className: '',
    iconSize: [10, 9],
    iconAnchor: [5, 4],
  });

  L.marker(tip, { icon: arrowIcon, interactive: false }).addTo(map);
}

// ── KARTENANSICHT WECHSELN (für Scrollytelling) ──
// Wird von scroll.js aufgerufen, wenn ein neuer Schritt aktiv wird
function flyToStep(step) {
  const view = MAP_VIEWS[step];
  if (!view || !map) return;
  map.flyTo([view.lat, view.lng], view.zoom, {
    animate: true,
    duration: 1.2,
    easeLinearity: 0.5,
  });
}
