<template>
  <section class="main-layout">
    <div class="table-container">
      <div class="table-wrapper">
        <table @mouseleave="activeColIndex = null">
          <thead>
            <tr>
              <th :class="{ 'on-hover': activeColIndex === 0 }">RUOLO</th>
              <th :class="{ 'on-hover': activeColIndex === 1 }">DESCRIZIONE</th>
              <th :class="{ 'on-hover': activeColIndex === 2 }">MODULI</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="r in ruoli" :key="r.id"
              :class="{ 'selected': selectedId === r.id }"
              @click="selezionaRuolo(r)"
            >
              <td @mouseover="handleMouseOver(0)"><strong>{{ r.nome }}</strong></td>
              <td @mouseover="handleMouseOver(1)">{{ r.descrizione }}</td>
              <td @mouseover="handleMouseOver(2)">
                <span v-for="m in r.moduli" :key="m" class="tag-modulo">{{ m }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <aside v-if="barOpen" class="bar">
      <div class="bar-header">
        <h3>Modifica Ruolo</h3>
        <button @click="barOpen = false" class="btn-close-x">✕</button>
      </div>

      <div class="bar-body" v-if="ruoloInModifica">
        <div class="form-group">
          <label>Nome Ruolo (Sola Lettura)</label>
          <input :value="ruoloInModifica.nome" disabled class="input-disabled" />
        </div>

        <div class="form-group">
          <label>Descrizione</label>
          <textarea v-model="ruoloInModifica.descrizione" rows="4"></textarea>
        </div>

        <div class="form-group">
          <label>Moduli Associati (separati da virgola)</label>
          <p class="hint">Esempio: Utenti, Dashboard, Mappe</p>
          <input 
            :value="ruoloInModifica.moduli.join(', ')" 
            @input="e => ruoloInModifica.moduli = e.target.value.split(',').map(s => s.trim())"
          />
        </div>

        <div class="actions">
          <button @click="salvaModifiche" class="btn-save">Aggiorna Ruolo</button>
        </div>
      </div>
    </aside>
  </section>
</template>

<script setup>
import '@/assets/styles/CSS/base.css'
import '@/assets/styles/CSS/modules/gestione-ruoli.css'

import { ref, onMounted } from 'vue'

const ruoli = ref([]);
const selectedId = ref(null);
const activeColIndex = ref(null);
const barOpen = ref(false);
const ruoloInModifica = ref(null);

// 1. Caricamento dati via API (Mock incluso)
const caricaRuoli = async () => {
  try {
    const response = await fetch('https://tuo-sito.it/api/ruoli');
    const data = await response.json();
    ruoli.value = data;
  } catch (error) {
    ruoli.value = [
      { id: 1, nome: 'Amministratore', descrizione: 'Accesso totale al sistema', moduli: ['Utenti', 'Dashboard', 'Impostazioni'] },
      { id: 2, nome: 'Ufficio_Smart', descrizione: 'Gestione sensori cittadini', moduli: ['Mappe', 'Sensori'] },
      { id: 3, nome: 'Operatore', descrizione: 'Solo visualizzazione dati', moduli: ['Dashboard'] }
    ];
  }
}

onMounted(caricaRuoli);

// 2. Logica bar
const selezionaRuolo = (r) => {
  selectedId.value = r.id;
  ruoloInModifica.value = { ...r }; // Copia per editing
  barOpen.value = true;
};

const handleMouseOver = (index) => {
  activeColIndex.value = index;
};

const salvaModifiche = () => {
  const index = ruoli.value.findIndex(r => r.id === selectedId.value);
  ruoli.value[index] = { ...ruoloInModifica.value };
  barOpen.value = false;
  // Qui andrebbe la chiamata API: await fetch(..., { method: 'PUT', body: ... })
};
</script>