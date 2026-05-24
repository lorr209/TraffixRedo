<template>
  <div class="dashboard">
    <header class="navbar">
      <div class="brand">TRENTO <span>LIVE MAP</span></div>
      <div class="controls">
        <button v-for="(v, k) in layers" :key="k" @click="layers[k] = !layers[k]; updateMapElements()" :class="{ active: v }">
          {{ k.toUpperCase() }}
        </button>
      </div>
    </header>

    <div class="content">
      <section class="map-wrapper">
        <div id="map-container"></div>
        
        <footer class="timeline-bar">
          <button @click="togglePlay" class="play-btn">{{ isPlaying ? '⏸' : '▶' }}</button>
          <div class="slider-container">
            <div class="labels">
              <span>{{ dataInizio.toLocaleDateString() }}</span>
              <span class="range-info">{{ formatTime(rangeInizio) }} - {{ formatTime(rangeFine) }}</span>
              <span>Oggi</span>
            </div>
            <div class="dual-slider">
              <input type="range" v-model.number="rangeInizio" class="slider-input">
              <input type="range" v-model.number="rangeFine" class="slider-input">
              <div class="track" :style="{ left: rangeInizio + '%', width: (rangeFine - rangeInizio) + '%' }"></div>
            </div>
          </div>
        </footer>
      </section>

      <aside class="sidebar">
        <h3>Configurazione Flotta</h3>
        <div class="fleet-box">
          <div v-for="t in tipologieAggiuntive" :key="t.id" class="fleet-item">
            <input v-model="t.nome" class="t-name">
            <div class="t-inputs">
              <label>% <input type="number" v-model.number="t.percentuale"></label>
              <label>CO2 <input type="number" v-model.number="t.emissione"></label>
            </div>
          </div>
          <div class="fleet-item default">
            <strong>Restanti: {{ Math.max(0, 100 - tipologieAggiuntive.reduce((a,b)=>a+b.percentuale,0)) }}%</strong>
            <label>CO2 Default <input type="number" v-model.number="emissioneDefault"></label>
          </div>
        </div>

        <div class="legend">
          <h4>Legenda</h4>
          <div class="grad-traffic"></div>
          <div class="l-labels"><span>Fluido</span><span>Critico</span></div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import '@/assets/styles/CSS/base.css'
import '@/assets/styles/CSS/modules/visualizzazione-traffico.css'

import { ref, computed, onMounted, nextTick } from 'vue'

// --- 1. IMPORT DINAMICO DI LEAFLET (CDN per Playground) ---
// Utilizziamo un import asincrono per evitare errori di caricamento nel browser
let L;

// --- 2. STATO DATI E CONFIGURAZIONE ---
const trackingGPS = ref([
  { id: 'V1', lat: 46.065, lon: 11.115, time: new Date().toISOString() },
  { id: 'V1', lat: 46.068, lon: 11.125, time: new Date().toISOString() }
]);
const sensoriFissi = ref([
  { id_pos: 'S1', lat: 46.067, lon: 11.121, qta: 150, time: new Date().toISOString() },
  { id_pos: 'S2', lat: 46.075, lon: 11.135, qta: 40, time: new Date().toISOString() }
]);

const emissioneDefault = ref(12);
const tipologieAggiuntive = ref([
  { id: 1, nome: 'Auto Tipo A', percentuale: 30, emissione: 9 },
  { id: 2, nome: 'Elettriche', percentuale: 10, emissione: 0 }
]);

const layers = ref({ heatmap: true, critical: true, pollution: false });
const rangeInizio = ref(0);
const rangeFine = ref(100);
const isPlaying = ref(false);

// --- 3. INIZIALIZZAZIONE MAPPA ---
const mapInstance = ref(null);
const markersLayer = ref(null);

const initMap = async () => {
  // Caricamento CSS di Leaflet nel DOM di Vue
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }

  // Importazione libreria
  L = await import('https://esm.sh/leaflet@1.9.4');

  await nextTick();
  
  // Creazione mappa centrata su Trento
  mapInstance.value = L.map('map-container').setView([46.0679, 11.1211], 14);

  // Layer Satellitare Reale
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
  }).addTo(mapInstance.value);

  markersLayer.value = L.layerGroup().addTo(mapInstance.value);
  updateMapElements();
};

const updateMapElements = () => {
  if (!markersLayer.value || !L) return;
  markersLayer.value.clearLayers();

  if (layers.value.critical) {
    sensoriFissi.value.forEach(s => {
      if (s.qta > 50) {
        L.circle([s.lat, s.lon], {
          color: 'red', fillColor: '#f03', fillOpacity: 0.5, radius: 200
        }).addTo(markersLayer.value).bindPopup(`Zona Critica: ${s.qta} veicoli`);
      }
    });
  }
};

// --- 4. LOGICA TIMELINE ---
const dataInizio = new Date();
dataInizio.setMonth(dataInizio.getMonth() - 1);
const dataFine = new Date();

const formatTime = (pct) => {
  const ms = dataInizio.getTime() + (pct / 100) * (dataFine.getTime() - dataInizio.getTime());
  return new Date(ms).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit' });
};

const togglePlay = () => {
  isPlaying.value = !isPlaying.value;
  if (isPlaying.value) {
    const step = () => {
      if (!isPlaying.value || rangeFine.value >= 100) { isPlaying.value = false; return; }
      rangeInizio.value += 0.2;
      rangeFine.value += 0.2;
      requestAnimationFrame(step);
    };
    step();
  }
};

onMounted(initMap);

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>