<template>
  <div class="dashboard-container">
    <section class="table-section">
      <div class="actions-top">
        <button @click="preparaNuovoUtente" class="btn-primary"> + Crea Nuovo Account</button>
      </div>
      
      <div class="table-wrapper">
        <table @mouseleave="activeColIndex = null">
          <thead>
            <tr>
              <th v-for="(h, i) in ['NOME', 'COGNOME', 'EMAIL', 'STATO']" 
                  :key="h" :class="{ 'on-hover': activeColIndex === i }">
                {{ h }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in utenti" :key="u.id" 
                :class="{ 'selected': selectedId === u.id }" 
                @click="seleziona(u)">
              <td @mouseover="activeColIndex = 0">{{ u.nome }}</td>
              <td @mouseover="activeColIndex = 1">{{ u.cognome }}</td>
              <td @mouseover="activeColIndex = 2">{{ u.email }}</td>
              <td @mouseover="activeColIndex = 3">
                <span :class="['pallino', u.stato]"></span>
                {{ u.stato }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <aside class="bar" :class="{ 'open': barOpen }">
      <div v-if="utenteInModifica" class="settings-content">
        <h3>{{ isNew ? 'Nuovo Utente' : 'Impostazioni Riga' }}</h3>
        <p v-if="!isNew">Modificando: <strong>{{ utenteInModifica.nome }}</strong></p>

        <div class="form-group">
          <label>Nome</label>
          <input v-model="utenteInModifica.nome" type="text" />
        </div>

        <div class="form-group">
          <label>Ruolo</label>
          <select v-model="utenteInModifica.ruolo"> <!-- di mock -->
            <option value="Admin">Admin</option>
            <option value="User">User</option>
            <option value="Editor">Editor</option>
          </select>
        </div>

        <hr />

        <div class="actions-grid">
          <button @click="toggleStato" :class="utenteInModifica.stato === 'attivo' ? 'btn-warn' : 'btn-success'">
            {{ utenteInModifica.stato === 'attivo' ? 'Disattiva Account' : 'Attiva Account' }}
          </button>

          <button @click="resetPassword" class="btn-info" v-if="!isNew">Reset Password</button>

          <button @click="salvaDati" class="btn-save">{{ isNew ? 'Crea Account' : 'Salva Modifiche' }}</button>
        </div>
        
        <button @click="barOpen = false" class="btn-close">Chiudi</button>
      </div>
      <div v-else class="empty-state">
        Seleziona una riga per modificare o clicca su "Crea Nuovo"
      </div>
    </aside>
  </div>
</template>

<script setup>
import '@/assets/styles/CSS/base.css'
import '@/assets/styles/CSS/modules/gestione-utenti.css'

import { ref, onMounted } from 'vue'

// 1. Variabili Reattive
const utenti = ref([]);           // Si popola via API
const selectedId = ref(null);      // Per evidenziare la riga
const activeColIndex = ref(null);  // Per l'hover degli header
const barOpen = ref(false);    // Controlla la visibilità bar
const utenteInModifica = ref(null); // Copia dei dati per il form
const isNew = ref(false);          // Flag per capire se stiamo creando o modificando

// 2. Funzione API Originale
const caricaUtenti = async () => {
  try {
    const response = await fetch('https://tuo-sito.it/api/utenti');
    const data = await response.json();
    utenti.value = data; 
  } catch (error) {
    console.error("Errore nel caricamento dei dati:", error);
    utenti.value = [
      { id: 1, nome: 'Gian', cognome: 'Carlo', email: 'gian@gmail.com', stato: 'attivo', ruolo: 'Amministratore' },
      { id: 2, nome: 'Gian', cognome: 'Franco', email: 'gian@franco.com', stato: 'disattivo', ruolo: 'User' },
    ];
  }
}

onMounted(caricaUtenti);

// 3. Gestione Azioni
const seleziona = (u) => {
  selectedId.value = u.id;
  isNew.value = false;
  utenteInModifica.value = { ...u }; // Creiamo una copia per non modificare la tabella live
  barOpen.value = true;
};

const preparaNuovoUtente = () => {
  selectedId.value = null;
  isNew.value = true;
  utenteInModifica.value = { nome: '', cognome: '', email: '', stato: 'attivo', ruolo: 'User' };
  barOpen.value = true;
};

const toggleStato = () => {
  utenteInModifica.value.stato = utenteInModifica.value.stato === 'attivo' ? 'disattivo' : 'attivo';
};

const resetPassword = () => {
  alert("Password resettata alla versione di default.");
};

const handleMouseOver = (index) => {
  activeColIndex.value = index;
};
</script>