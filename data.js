// ═══════════════════════════════════════════════════════
// data.js – Alle Geodaten für die Visualisierung
//
// WIE GEFUNDEN / BEFÜLLT:
//   - Koordinaten: aus wissenschaftlichen Publikationen
//     (Lebreton et al. 2018, NOAA Marine Debris Program)
//   - Du kannst diese Daten später durch echte CSV-/JSON-
//     Exporte von NOAA ersetzen und hier einbinden.
// ═══════════════════════════════════════════════════════

// ── 1. DIE FÜNF GROßEN MÜLLSTRUDEL (Garbage Patches) ──
const GARBAGE_PATCHES = [
  {
    id: 'gpgp',
    name: 'Great Pacific Garbage Patch',
    lat: 32.0,
    lng: -145.0,
    size_km2: 1600000,
    weight_tons: 80000,
    discovered: 1997,
    description: 'Der größte Müllstrudel der Welt, dreimal so groß wie Frankreich. Liegt zwischen Hawaii und Kalifornien im Nordpazifik-Gyre.',
    source: 'The Ocean Cleanup, Lebreton et al. (2018)',
    radius: 55,
  },
  {
    id: 'spgp',
    name: 'South Pacific Garbage Patch',
    lat: -32.0,
    lng: -130.0,
    size_km2: 2600000,
    weight_tons: 70000,
    discovered: 2011,
    description: 'Im südlichen Pazifik-Gyre gelegen. Flächenmäßig noch größer als der nördliche Pendant, aber weniger erforscht.',
    source: 'NOAA / Eriksen et al.',
    radius: 48,
  },
  {
    id: 'nagp',
    name: 'North Atlantic Garbage Patch',
    lat: 30.0,
    lng: -45.0,
    size_km2: 700000,
    weight_tons: 7000,
    discovered: 1972,
    description: 'Zwischen den Azoren und der US-Ostküste. Der am längsten bekannte Müllstrudel – erste Beobachtungen bereits 1972.',
    source: 'Carpenter & Smith (1972), NOAA',
    radius: 38,
  },
  {
    id: 'sagp',
    name: 'South Atlantic Garbage Patch',
    lat: -25.0,
    lng: -28.0,
    size_km2: 500000,
    weight_tons: 5000,
    discovered: 2010,
    description: 'Im südlichen Atlantik, östlich von Rio de Janeiro. Weniger dicht als pazifische Patches, aber stark wachsend.',
    source: 'NOAA Marine Debris Program',
    radius: 34,
  },
  {
    id: 'iogp',
    name: 'Indian Ocean Garbage Patch',
    lat: -25.0,
    lng: 80.0,
    size_km2: 5000000,
    weight_tons: 60000,
    discovered: 2010,
    description: 'Der am wenigsten erforschte der fünf Strudel. Liegt im Indischen Ozean-Gyre, beeinflusst durch Monsunwinde.',
    source: 'NOAA / Maximenko et al.',
    radius: 45,
  },
];

// ── 2. HAUPTQUELLEN (Land-basierte Plastikeinträge) ──
const PLASTIC_SOURCES = [
  {
    name: 'Yangtze (China)',
    lat: 30.5,
    lng: 121.8,
    annual_tons: 333000,
    description: 'Größter Einzelflusse-Eintrag weltweit. Mündet in den Ostchinesischen See.',
  },
  {
    name: 'Ganges (Indien/Bangladesh)',
    lat: 22.5,
    lng: 89.0,
    annual_tons: 115000,
    description: 'Dichter besiedeltes Einzugsgebiet, teils unzureichende Abfallentsorgung.',
  },
  {
    name: 'Xi / Perle (China)',
    lat: 22.1,
    lng: 113.5,
    annual_tons: 88000,
    description: 'Südchinesisches Industriezentrum. Mündet im Perlflussdelta nahe Guangzhou.',
  },
  {
    name: 'Amur (Russland/China)',
    lat: 52.9,
    lng: 141.2,
    annual_tons: 38000,
    description: 'Grenzfluss zwischen Russland und China mit hohem Plastikaufkommen.',
  },
  {
    name: 'Mekong (Südostasien)',
    lat: 15.0,
    lng: 105.0,
    annual_tons: 33000,
    description: 'Fließt durch sechs Länder. Trägt erheblich zur Plastikverschmutzung im Südchinesischen Meer bei.',
  },
  {
    name: 'Niger (Westafrika)',
    lat: 4.5,
    lng: 6.3,
    annual_tons: 35000,
    description: 'Dichter besiedeltes Nigerianisches Delta, wenig Infrastruktur für Abfallmanagement.',
  },
  {
    name: 'Mississippi (USA)',
    lat: 29.0,
    lng: -89.5,
    annual_tons: 16000,
    description: 'Trotz guter Infrastruktur erheblicher Eintrag durch Größe des Einzugsgebiets.',
  },
];

// ── 3. STRÖMUNGSVEKTOREN (vereinfachtes Modell) ──
// Echte Daten: NOAA OSCAR (https://podaac.jpl.nasa.gov/dataset/OSCAR_L4_OC_FINAL_V2.0)
// Hier: Vereinfachte Pfeile, die die fünf großen Gyres zeigen
// Format: [lat_start, lng_start, lat_end, lng_end, label]
const CURRENTS = [
  // Nordpazifik-Gyre (im Uhrzeigersinn)
  { from: [50, -140], to: [35, -125], label: 'Nordpazifik', strength: 0.8 },
  { from: [35, -125], to: [20, -150], label: 'Nordpazifik', strength: 0.8 },
  { from: [20, -150], to: [10, -170], label: 'Nordäquatorial', strength: 0.9 },
  { from: [10, -170], to: [30, -175], label: 'Kuroshio', strength: 1.0 },
  { from: [30, -175], to: [50, -155], label: 'Kuroshio-Ext.', strength: 0.7 },

  // Südpazifik-Gyre (gegen Uhrzeigersinn)
  { from: [-10, -140], to: [-30, -120], label: 'Humboldtstrom', strength: 0.9 },
  { from: [-30, -120], to: [-45, -90], label: 'Humboldtstrom', strength: 0.8 },
  { from: [-45, -90], to: [-45, -150], label: 'Antarktisch', strength: 0.7 },
  { from: [-45, -150], to: [-25, -170], label: 'Südpazifik', strength: 0.6 },
  { from: [-25, -170], to: [-10, -145], label: 'Südäquatorial', strength: 0.8 },

  // Nordatlantik-Gyre (im Uhrzeigersinn)
  { from: [45, -30], to: [35, -15], label: 'Nordatlantik', strength: 0.7 },
  { from: [35, -15], to: [20, -25], label: 'Kanarenstrom', strength: 0.8 },
  { from: [20, -25], to: [15, -60], label: 'Nordäquatorial', strength: 0.9 },
  { from: [15, -60], to: [30, -75], label: 'Golfstrom', strength: 1.0 },
  { from: [30, -75], to: [45, -50], label: 'Golfstrom', strength: 1.0 },

  // Südatlantik
  { from: [-10, -35], to: [-30, -20], label: 'Benguela', strength: 0.7 },
  { from: [-30, -20], to: [-45, -30], label: 'Südatlantik', strength: 0.6 },
  { from: [-45, -30], to: [-35, -50], label: 'Südatlantik', strength: 0.6 },
  { from: [-35, -50], to: [-10, -40], label: 'Brasilien', strength: 0.8 },

  // Indischer Ozean
  { from: [-10, 65],  to: [-25, 95], label: 'Indisch', strength: 0.7 },
  { from: [-25, 95],  to: [-40, 90], label: 'Indisch', strength: 0.6 },
  { from: [-40, 90],  to: [-35, 60], label: 'Agulhas', strength: 0.8 },
  { from: [-35, 60],  to: [-15, 55], label: 'Südindisch', strength: 0.7 },
  { from: [-15, 55],  to: [-10, 65], label: 'Südäquatorial', strength: 0.7 },
];

// ── 4. KARTENANSICHTEN PRO SCROLLSCHRITT ──
// Steuert, wohin die Karte sich bewegt, wenn der
// Nutzer die jeweilige Story-Karte sieht.
const MAP_VIEWS = {
  1: { lat: 20,  lng: 0,    zoom: 2,   label: 'Quellen weltweit' },
  2: { lat: 25,  lng: -160, zoom: 3.5, label: 'Nordpazifik-Gyre' },
  3: { lat: -32, lng: -130, zoom: 3.5, label: 'Südpazifik Garbage Patch' },
  4: { lat: -25, lng: 80,   zoom: 3.5, label: 'Indischer Ozean Garbage Patch' },
  5: { lat: 10,  lng: 0,    zoom: 2,   label: 'Globale Übersicht' },
};
