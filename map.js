// ═══════════════════════════════════════════════════════
// map.js – Leaflet-Karte initialisieren und befüllen
// ═══════════════════════════════════════════════════════

let map;
let particleSystem;

function initMap() {
  map = L.map('map', {
    center: [15, 0],
    zoom: 2,
    zoomControl: true,
    attributionControl: true,
    scrollWheelZoom: false,
  });

  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | © <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 10,
    }
  ).addTo(map);

  _addGarbagePatches();
  _addPlasticSources();
  _addCurrentArrows();

  particleSystem = new ParticleSystem(map);
  particleSystem.start();
}

// ── MÜLLSTRUDEL als circleMarker (fixer Pixel-Radius, kein Flackern beim Zoom) ──
function _addGarbagePatches() {
  for (const patch of GARBAGE_PATCHES) {

    // Äußerer Glüh-Ring – auch als circleMarker
    L.circleMarker([patch.lat, patch.lng], {
      radius:      patch.radius * 0.85,
      color:       '#ff3b6b',
      fillColor:   '#ff3b6b',
      fillOpacity: 0.06,
      weight:      1,
      opacity:     0.35,
      interactive: false,
      className:   'patch-outer',
    }).addTo(map);

    // Kern-Punkt – fester Pixel-Radius, immer sichtbar
    const marker = L.circleMarker([patch.lat, patch.lng], {
      radius:      patch.radius * 0.38,
      color:       '#ff3b6b',
      fillColor:   '#ff3b6b',
      fillOpacity: 0.55,
      weight:      2,
      className:   'patch-core',
    }).addTo(map);

    const sizeFormatted   = patch.size_km2.toLocaleString('de-DE');
    const weightFormatted = patch.weight_tons.toLocaleString('de-DE');

    marker.bindPopup(`
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
    `, { maxWidth: 280, className: 'custom-popup' });

    marker.bindTooltip(patch.name, {
      permanent: false,
      direction: 'top',
      className: 'patch-tooltip',
      offset: [0, -8],
    });
  }
}

// ── QUELLEN als Marker ──
function _addPlasticSources() {
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

// ── STRÖMUNGSPFEILE ──
function _addCurrentArrows() {
  for (const current of CURRENTS) {
    L.polyline(
      [current.from, current.to],
      {
        color:     `rgba(0, 212, 255, ${0.2 * current.strength})`,
        weight:    1.5 * current.strength,
        opacity:   0.6,
        dashArray: '6, 8',
      }
    ).addTo(map);

    _addArrowHead(current.to, current.from);
  }
}

function _addArrowHead(tipLatLng, fromLatLng) {
  const tip  = L.latLng(tipLatLng);
  const from = L.latLng(fromLatLng);
  const dx   = tip.lng - from.lng;
  const dy   = tip.lat - from.lat;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

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

// ── KARTENANSICHT WECHSELN ──
function flyToStep(step) {
  const view = MAP_VIEWS[step];
  if (!view || !map) return;
  map.flyTo([view.lat, view.lng], view.zoom, {
    animate: true,
    duration: 1.2,
    easeLinearity: 0.5,
  });
}
