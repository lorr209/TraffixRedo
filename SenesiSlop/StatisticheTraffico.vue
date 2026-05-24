<template>
  <section class="dashboard-layout">
    <div class="kpi-container">
      <div class="kpi-grid">
        <div class="card">
          <div class="card-header">TRAFFICO MEDIO</div>
          <div class="card-body">
            <span class="value">{{ trafficoMedio }}</span>
            <span class="label">veicoli rilevati</span>
          </div>
          <div class="footer-source">Sorgente: ID Sensori Fissi</div>
        </div>

        <div class="card">
          <div class="card-header">DENSITÀ STRADALE</div>
          <div class="card-body">
            <span class="value">{{ densitaMedia }}%</span>
            <span class="label">occupazione suolo</span>
          </div>
          <div class="footer-source">Sorgente: Coordinate GPS (A+B)</div>
        </div>

        <div class="card" :class="{ 'alert': inquinamentoStimato > 1000 }">
          <div class="card-header">INQUINAMENTO STIMATO</div>
          <div class="card-body">
            <span class="value">{{ inquinamentoStimato }}</span>
            <span class="label">U.I. / h (stima ponderata)</span>

            <div class="analytics-container">
              <div class="controls-top">
                <div class="selector">
                  <span>Raggruppa:</span>
                  <button @click="filtroTempo = 'ora'" :class="{ active: filtroTempo === 'ora' }">Orario</button>
                  <button @click="filtroTempo = 'giorno'" :class="{ active: filtroTempo === 'giorno' }">Giornaliero</button>
                </div>
              </div>

              <div class="chart-box">
                <div class="visual-grid">
                  <div v-for="(ponto, i) in datiGrafico.labels" :key="i" class="data-point">
                    <div class="bar-traffico" :style="{ height: datiGrafico.datasets[0].data[i] + 'px' }"></div>
                    <div class="bar-inquinamento" :style="{ height: datiGrafico.datasets[1].data[i] + 'px' }"></div>
                    <span class="timestamp">{{ ponto }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="footer-source">Sorgente: Mix Flotta Operatore</div>
        </div>
      </div>
    </div>

    <aside class="control-panel">
      <div class="panel-header">
        <h3>Mix Veicoli</h3>
        <button @click="aggiungiTipologia" class="btn-add">+ Aggiungi</button>
      </div>

      <div class="scroll-area">
        <div v-for="tipo in tipologieAggiuntive" :key="tipo.id" class="tipo-item">
          <div class="item-top">
            <input v-model="tipo.nome" class="input-name" />
            <button @click="rimuoviTipologia(tipo.id)" class="btn-del">×</button>
          </div>
          <div class="item-inputs">
            <div>
              <label>% Presenza</label>
              <input type="number" v-model.number="tipo.percentuale" />
            </div>
            <div>
              <label>Emissione</label>
              <input type="number" v-model.number="tipo.emissione" />
            </div>
          </div>
        </div>

        <div class="restanti-box">
          <div class="item-top">
            <strong>Restanti</strong>
            <span>{{ percRestanti }}%</span>
          </div>
          <div class="item-inputs">
            <div style="grid-column: span 2">
              <label>Emissione Default (Restanti)</label>
              <input type="number" v-model.number="emissioneDefault" />
            </div>
          </div>
        </div>
      </div>

      <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: Math.min(percOccupata, 100) + '%' }"></div>
        <div class="progress-text">Copertura flotta: {{ percOccupata }}%</div>
      </div>
    </aside>
  </section>
</template>

<script setup>
import '@/assets/styles/CSS/base.css'
import '@/assets/styles/CSS/modules/statistiche-traffico.css'

import { ref, onMounted, computed } from 'vue'

const trackingGPS = ref([]); // Tabella A
const sensoriFissi = ref([]); // Tabella B
const filtroTempo = ref('ora'); // 'ora' | 'giorno'

// --- LOGICA PANNELLO DINAMICO FLOTTA ---
const emissioneDefault = ref(12);
const tipologieAggiuntive = ref([
  { id: 1, nome: 'Auto Tipo A', percentuale: 30, emissione: 9 },
  { id: 2, nome: 'Elettriche', percentuale: 10, emissione: 0 }
]);

const aggiungiTipologia = () => {
  tipologieAggiuntive.value.push({
    id: Date.now(),
    nome: 'Nuova Categoria',
    percentuale: 0,
    emissione: 10
  });
};

const rimuoviTipologia = (id) => {
  tipologieAggiuntive.value = tipologieAggiuntive.value.filter(t => t.id !== id);
};

const percOccupata = computed(() => {
  return tipologieAggiuntive.value.reduce((acc, t) => acc + t.percentuale, 0);
});

const percRestanti = computed(() => {
  const diff = 100 - percOccupata.value;
  return diff > 0 ? diff : 0;
});

// --- CARICAMENTO DATI ---
const fetchData = async () => {
  trackingGPS.value = [
    { id: 'V1', lat: 45.4642, lon: 9.1900, time: '10:00:00' },
    { id: 'V1', lat: 45.4645, lon: 9.1910, time: '10:00:10' }
  ];
  
  sensoriFissi.value = [
    { id: 'S_Duomo', lat: 45.4641, lon: 9.1919, qta: 120, time: '10:00:00' },
    { id: 'S_Centrale', lat: 45.4850, lon: 9.2030, qta: 45, time: '10:00:00' }
  ];
}

// --- KPI ---
const trafficoMedio = computed(() => {
  if (!sensoriFissi.value.length) return 0;
  const totale = sensoriFissi.value.reduce((acc, s) => acc + s.qta, 0);
  return (totale / sensoriFissi.value.length).toFixed(0);
});

const densitaMedia = computed(() => {
  const rapporto = (trackingGPS.value.length / sensoriFissi.value.length) * 10;
  return Math.min(rapporto, 100).toFixed(1);
});

const inquinamentoStimato = computed(() => {
  const qtaTotale = sensoriFissi.value.reduce((acc, s) => acc + s.qta, 0);
  
  // Somma ponderata delle tipologie create dall'operatore
  let sommaPonderata = tipologieAggiuntive.value.reduce((acc, t) => {
    return acc + (t.percentuale / 100 * t.emissione);
  }, 0);

  // Aggiunta dell'impatto dei veicoli "Restanti"
  sommaPonderata += (percRestanti.value / 100 * emissioneDefault.value);

  return (qtaTotale * sommaPonderata).toFixed(1);
});

const elaboraDatiTemporali = (dati, granularita) => {
  const aggregati = {};

  dati.forEach(tupla => {
    // Definiamo il taglio della stringa timestamp '2026-02-14 10:30:00'
    let chiave;
    if (granularita === 'ora') {
      chiave = tupla.time.substring(0, 13); // '2026-02-14 10'
    } else if (granularita === 'giorno') {
      chiave = tupla.time.substring(0, 10); // '2026-02-14'
    } else {
      chiave = tupla.time.substring(0, 7);  // '2026-02' (Mese/Settimana)
    }

    if (!aggregati[chiave]) {
      aggregati[chiave] = { totaleQta: 0, conteggio: 0 };
    }
    
    // Usiamo la quantità della Tabella B per il volume di traffico
    aggregati[chiave].totaleQta += tupla.qta || 1; 
    aggregati[chiave].conteggio++;
  });

  // Trasformiamo l'oggetto in array ordinato per il grafico
  return Object.keys(aggregati).sort().map(k => ({
    label: k,
    valore: aggregati[k].totaleQta / aggregati[k].conteggio // Media nel periodo
  }));
};

// 1. Calcolo del moltiplicatore di inquinamento basato sul mix operatore
const fattoreInquinamentoMedio = computed(() => {
  const percOccupata = tipologieAggiuntive.value.reduce((acc, t) => acc + t.percentuale, 0);
  const percRestanti = Math.max(0, 100 - percOccupata);
  
  const ponderataAggiuntivi = tipologieAggiuntive.value.reduce((acc, t) => {
    return acc + (t.percentuale / 100 * t.emissione);
  }, 0);
  
  return ponderataAggiuntivi + (percRestanti / 100 * emissioneDefault.value);
});

// 2. Elaborazione dati per il Grafico
const datiGrafico = computed(() => {
  // Raggruppiamo i dati reali dei sensori (Tabella B)
  const datiAggregati = elaboraDatiTemporali(sensoriFissi.value, filtroTempo.value);

  return {
    labels: datiAggregati.map(d => d.label),
    datasets: [
      {
        label: 'Volume Traffico',
        data: datiAggregati.map(d => d.valore), // Media veicoli
        color: '#002d57'
      },
      {
        label: 'Inquinamento Stimato',
        // Moltiplichiamo il traffico di ogni ora per il fattore flotta dinamico
        data: datiAggregati.map(d => d.valore * fattoreInquinamentoMedio.value),
        color: '#e74c3c'
      }
    ]
  };
});

onMounted(fetchData);
</script>
