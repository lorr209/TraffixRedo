<script setup>
import { ref, onMounted, onBeforeMount, nextTick, watch, computed } from 'vue'

let L;

const trackingGPS = ref([]);
const sensoriFissi = ref([]);
const emissioneDefault = ref(12);
const tipologieAggiuntive = ref([
    { id: 1, nome: 'Auto Tipo A', percentuale: 30, emissione: 9 },
    { id: 2, nome: 'Elettriche', percentuale: 10, emissione: 0 }
]);

const dataAttuale = new Date();
const dataUnMeseFa = new Date();
dataUnMeseFa.setMonth(dataUnMeseFa.getMonth() - 1);

const formatToInputDateTime = (date) => {
    const pad = (num) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const dataLimiteInizio = ref(formatToInputDateTime(dataUnMeseFa));
const dataLimiteFine = ref(formatToInputDateTime(dataAttuale));

const layers = ref({ heatmap: true, critical: true, pollution: false });
const rangeInizio = ref(0);
const rangeFine = ref(100);
const isPlaying = ref(false);

const mapInstance = ref(null);
const markersLayer = ref(null);

const calcolaRestanti = computed(() => {
    const totaleAccanto = tipologieAggiuntive.value.reduce((a, b) => a + (Number(b.percentuale) || 0), 0);
    return Math.max(0, 100 - totaleAccanto);
});

const aggiungiTipologia = () => {
    tipologieAggiuntive.value.push({ id: Date.now(), nome: 'Nuova voce', percentuale: 0, emissione: 0 });
};
const rimuoviTipologia = (index) => { tipologieAggiuntive.value.splice(index, 1); };

onBeforeMount(async () => {
    try {
        const [resDensities, resVehicles] = await Promise.all([
            fetch("/api/traffic/densities"),
            fetch("/api/traffic/vehicles")
        ]);
        if (resDensities.ok) sensoriFissi.value = await resDensities.json();
        if (resVehicles.ok) trackingGPS.value = await resVehicles.json();
        updateMapElements();
    } catch (error) {
        console.error("💥 Errore caricamento dati:", error);
    }
});

const initMap = async () => {
    if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css'; link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
    }

    L = await import('https://esm.sh/leaflet@1.9.4');
    await nextTick();
    
    if (mapInstance.value) { mapInstance.value.remove(); }

    mapInstance.value = L.map('map-container').setView([46.0679, 11.1211], 14);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri', maxZoom: 19
    }).addTo(mapInstance.value);

    markersLayer.value = L.layerGroup().addTo(mapInstance.value);
    
    setTimeout(() => { if (mapInstance.value) mapInstance.value.invalidateSize(); }, 300);
    updateMapElements();
};

const updateMapElements = () => {
    if (!markersLayer.value || !L) return;
    markersLayer.value.clearLayers();

    const startMs = tInizioMs.value + (rangeInizio.value / 100) * (tFineMs.value - tInizioMs.value);
    const endMs = tInizioMs.value + (rangeFine.value / 100) * (tFineMs.value - tInizioMs.value);

    // Funzione helper per risolvere il problema del fuso orario (rimuove la Z finale se presente)
    const getLocalTime = (dateString) => {
        if(!dateString) return 0;
        const s = typeof dateString === 'string' && dateString.endsWith('Z') ? dateString.slice(0, -1) : dateString;
        return new Date(s).getTime();
    };

    if (layers.value.critical) {
        sensoriFissi.value.forEach(s => {
            const itemTime = getLocalTime(s.data);
            if (itemTime >= startMs && itemTime <= endMs) {
                const raggioBase = Math.min(350, s.quantità * 3);
                L.circle([s.lat, s.lon], { color: 'transparent', fillColor: '#f56565', fillOpacity: 0.12, radius: raggioBase * 2.2 }).addTo(markersLayer.value);
                L.circle([s.lat, s.lon], { color: 'transparent', fillColor: '#e53e3e', fillOpacity: 0.28, radius: raggioBase * 1.4 }).addTo(markersLayer.value);
                L.circle([s.lat, s.lon], { color: '#c53030', weight: 1, fillColor: '#9b2c2c', fillOpacity: 0.65, radius: raggioBase }).addTo(markersLayer.value);
            }
        });
    }

    if (layers.value.heatmap) {
        const veicoliNelRange = trackingGPS.value.filter(v => {
            const itemTime = getLocalTime(v.data);
            return itemTime >= startMs && itemTime <= endMs;
        });

        const gruppiVeicoli = {};
        veicoliNelRange.forEach(v => {
            const id = v.id_veicolo || 'Veicolo_Sconosciuto';
            if (!gruppiVeicoli[id]) gruppiVeicoli[id] = [];
            gruppiVeicoli[id].push(v);
        });

        Object.keys(gruppiVeicoli).forEach(idVeicolo => {
            const puntiOrdinati = gruppiVeicoli[idVeicolo].sort((a, b) => getLocalTime(a.data) - getLocalTime(b.data));
            const coordinateLinea = puntiOrdinati.map(p => [p.lat, p.lon]);

            if (coordinateLinea.length > 1) {
                L.polyline(coordinateLinea, { color: '#3182ce', weight: 3, opacity: 0.8, dashArray: '6, 6', lineJoin: 'round' }).addTo(markersLayer.value);
            }

            if (puntiOrdinati.length > 0) {
                const ultimoPunto = puntiOrdinati[puntiOrdinati.length - 1];
                L.circleMarker([ultimoPunto.lat, ultimoPunto.lon], { radius: 7, color: '#1a365d', fillColor: '#63b3ed', fillOpacity: 1, weight: 2 }).addTo(markersLayer.value)
                  .bindPopup(`<strong>ID Veicolo:</strong> ${idVeicolo}`);
            }
        });
    }
};

// --- LOGICA TIMELINE REATTIVA ---

// Calcoliamo i millisecondi assoluti degli input utente
const tInizioMs = computed(() => new Date(dataLimiteInizio.value).getTime());
const tFineMs = computed(() => new Date(dataLimiteFine.value).getTime());

// Etichette dinamiche per lo slider (mostrano anche i SECONDI)
const labelInizio = computed(() => {
    if (isNaN(tInizioMs.value) || isNaN(tFineMs.value)) return "--:--";
    const ms = tInizioMs.value + (rangeInizio.value / 100) * (tFineMs.value - tInizioMs.value);
    return new Date(ms).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
});

const labelFine = computed(() => {
    if (isNaN(tInizioMs.value) || isNaN(tFineMs.value)) return "--:--";
    const ms = tInizioMs.value + (rangeFine.value / 100) * (tFineMs.value - tInizioMs.value);
    return new Date(ms).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
});

const togglePlay = () => {
    isPlaying.value = !isPlaying.value;
    if (isPlaying.value) {
        if (rangeFine.value >= 100) { rangeInizio.value = 0; rangeFine.value = 5; }
        const step = () => {
            if (!isPlaying.value || rangeFine.value >= 100) { isPlaying.value = false; return; }
            // Rallentato lo step del Play per farti gustare l'animazione
            rangeInizio.value += 0.1; 
            rangeFine.value += 0.1;
            requestAnimationFrame(step);
        };
        step();
    }
};

watch([rangeInizio, rangeFine, dataLimiteInizio, dataLimiteFine], () => { updateMapElements(); });
onMounted(initMap);
</script>

<template>
    <div class="dashboard-page">
        <header class="navbar-panel">
            <div class="brand">TRENTO <span class="accent">LIVE MAP</span></div>
            <div class="controls-group">
                <button 
                    v-for="(v, k) in layers" 
                    :key="k" 
                    @click="layers[k] = !layers[k]; updateMapElements()" 
                    :class="{ active: v }"
                    class="btn-toggle"
                >
                    {{ k === 'heatmap' ? 'PERCORSI VEICOLI' : k === 'critical' ? 'DENSITÀ TRAFFICO' : k.toUpperCase() }}
                </button>
            </div>
        </header>

        <div class="main-content">
            <section class="map-wrapper panel">
                <div id="map-container"></div>
                
                <footer class="timeline-bar">
                    <div class="date-pickers">
                        <label>Inizio: <input type="datetime-local" v-model="dataLimiteInizio" step="1" class="date-input"></label>
                        <label>Fine: <input type="datetime-local" v-model="dataLimiteFine" step="1" class="date-input"></label>
                    </div>

                    <div class="timeline-controls">
                        <button @click="togglePlay" class="play-btn">
                            {{ isPlaying ? '⏸' : '▶' }}
                        </button>
                        <div class="slider-container">
                            <div class="labels">
                                <span class="range-info">{{ labelInizio }}</span>
                                <span>fino a</span>
                                <span class="range-info">{{ labelFine }}</span>
                            </div>
                            <div class="dual-slider">
                                <input type="range" v-model.number="rangeInizio" min="0" max="100" step="0.1" class="slider-input">
                                <input type="range" v-model.number="rangeFine" min="0" max="100" step="0.1" class="slider-input">
                                <div class="track" :style="{ left: rangeInizio + '%', width: (rangeFine - rangeInizio) + '%' }"></div>
                            </div>
                        </div>
                    </div>
                </footer>
            </section>

            <aside class="sidebar-panel panel">
                <div class="sidebar-header">
                    <h3>Configurazione Flotta</h3>
                    <button @click="aggiungiTipologia" class="btn-add">➕ Aggiungi</button>
                </div>

                <div class="fleet-box">
                    <div v-for="(t, index) in tipologieAggiuntive" :key="t.id" class="fleet-item">
                        <div class="item-header">
                            <input v-model="t.nome" class="t-name" placeholder="Nome veicolo">
                            <button @click="rimuoviTipologia(index)" class="btn-delete">🗑️</button>
                        </div>
                        <div class="t-inputs">
                            <label>% <input type="number" v-model.number="t.percentuale" min="0" max="100"></label>
                            <label>CO₂ <input type="number" v-model.number="t.emissione" min="0"></label>
                        </div>
                    </div>
                    
                    <div class="fleet-item default-item">
                        <div class="restanti-label">Veicoli Restanti: <strong>{{ calcolaRestanti }}%</strong></div>
                        <label class="co2-default">CO₂ Default <input type="number" v-model.number="emissioneDefault" min="0"></label>
                    </div>
                </div>

                <div class="legend-box">
                    <h4>Legenda Traffico</h4>
                    <div class="grad-traffic"></div>
                    <div class="l-labels">
                        <span>Fluido (Area Sfumata)</span>
                        <span>Critico (Centro Intenso)</span>
                    </div>
                </div>
            </aside>
        </div>
    </div>
</template>

<style scoped>
/* Lascia immutati i CSS stabili forniti nel turno precedente */
.dashboard-page { display: flex; flex-direction: column; height: 100vh; background: #f8f9fa; font-family: system-ui, -apple-system, sans-serif; color: #2d3748; }
.navbar-panel { display: flex; justify-content: space-between; align-items: center; padding: 12px 30px; background: white; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03); border-bottom: 1px solid #edf2f7; }
.brand { font-weight: 700; font-size: 1.1rem; color: #1a202c; }
.brand .accent { color: #3182ce; }
.btn-toggle { background: #f7fafc; border: 1px solid #e2e8f0; color: #718096; padding: 6px 14px; margin-left: 8px; border-radius: 8px; cursor: pointer; font-size: 0.75rem; font-weight: 600; transition: all 0.2s; }
.btn-toggle:hover { background: #edf2f7; }
.btn-toggle.active { background: #3182ce; color: white; border-color: #2b6cb0; }
.main-content { display: flex; flex: 1; padding: 20px; gap: 20px; overflow: hidden; }
.panel { background: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); border: 1px solid #edf2f7; }
.map-wrapper { flex: 1; position: relative; display: flex; flex-direction: column; overflow: hidden; }
#map-container { flex: 1; z-index: 1; border-radius: 15px; background: #1a1a1a; }
.timeline-bar { position: absolute; bottom: 15px; left: 15px; right: 15px; background: rgba(255, 255, 255, 0.96); backdrop-filter: blur(10px); padding: 15px; border-radius: 12px; z-index: 1000; display: flex; flex-direction: column; gap: 12px; border: 1px solid #edf2f7; box-shadow: 0 8px 20px rgba(0,0,0,0.2); }
.date-pickers { display: flex; gap: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
.date-pickers label { font-size: 0.8rem; font-weight: 600; color: #4a5568; display: flex; align-items: center; gap: 8px; }
.date-input { border: 1px solid #cbd5e0; border-radius: 6px; padding: 4px 8px; font-family: inherit; font-size: 0.8rem; color: #2d3748; }
.timeline-controls { display: flex; align-items: center; gap: 15px; width: 100%; }
.play-btn { background: #3182ce; color: white; border: none; width: 38px; height: 38px; border-radius: 50%; cursor: pointer; font-size: 13px; box-shadow: 0 3px 8px rgba(49, 130, 206, 0.3); }
.play-btn:hover { background: #2b6cb0; }
.slider-container { flex: 1; }
.labels { display: flex; justify-content: space-between; font-size: 0.75rem; color: #718096; margin-bottom: 5px; }
.range-info { color: #3182ce; font-weight: 700; background: #ebf8ff; padding: 2px 6px; border-radius: 4px; }
.dual-slider { position: relative; height: 6px; background: #e2e8f0; border-radius: 3px; }
.slider-input { position: absolute; width: 100%; top: -5px; -webkit-appearance: none; background: transparent; pointer-events: none; }
.slider-input::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: #3182ce; pointer-events: auto; cursor: pointer; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
.track { position: absolute; height: 100%; background: #3182ce; border-radius: 3px; }
.sidebar-panel { width: 320px; padding: 20px; display: flex; flex-direction: column; }
.sidebar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.sidebar-panel h3 { font-size: 1rem; color: #1a202c; font-weight: 600; margin: 0; }
.btn-add { background: #48bb78; color: white; border: none; padding: 5px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; }
.btn-add:hover { background: #38a169; }
.fleet-box { flex: 1; overflow-y: auto; }
.fleet-item { background: #f7fafc; padding: 12px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #e2e8f0; }
.item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; gap: 10px; }
.t-name { background: transparent; border: none; border-bottom: 2px solid #e2e8f0; color: #2d3748; width: 100%; font-weight: 600; font-size: 0.8rem; padding-bottom: 2px; }
.t-name:focus { outline: none; border-color: #3182ce; }
.btn-delete { background: transparent; border: none; cursor: pointer; font-size: 0.9rem; opacity: 0.6; }
.btn-delete:hover { opacity: 1; }
.t-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.7rem; color: #4a5568; }
.t-inputs input, .co2-default input { width: 100%; background: white; border: 1px solid #cbd5e0; color: #2d3748; padding: 3px 6px; border-radius: 5px; margin-top: 2px; }
.default-item { background: #ebf8ff; border-color: #bee3f8; color: #2b6cb0; }
.restanti-label { font-size: 0.8rem; margin-bottom: 6px; }
.co2-default { font-size: 0.7rem; display: block; }
.legend-box { margin-top: 15px; border-top: 1px solid #edf2f7; padding-top: 15px; }
.legend-box h4 { font-size: 0.8rem; color: #4a5568; margin-bottom: 8px; }
.grad-traffic { height: 6px; border-radius: 3px; background: linear-gradient(to right, rgba(245,101,101,0.2), rgba(229,62,62,0.6), #9b2c2c); margin-bottom: 6px; }
.l-labels { display: flex; justify-content: space-between; font-size: 0.65rem; color: #718096; font-weight: 500; }
</style>