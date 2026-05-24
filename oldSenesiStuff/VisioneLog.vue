<template>
  <section class="main-layout">
    <div class="table-container">
      <div class="header-info">
        <h2>Registro Attività (Log)</h2>
        <p>I record in questa pagina sono immutabili e servono per l'audit di sistema.</p>
      </div>

      <div class="table-wrapper">
        <table @mouseleave="activeColIndex = null">
          <thead>
            <tr>
              <th :class="{ 'on-hover': activeColIndex === 0 }">EMAIL UTENTE</th>
              <th :class="{ 'on-hover': activeColIndex === 1 }">ORARIO</th>
              <th :class="{ 'on-hover': activeColIndex === 2 }">AZIONE ESEGUITA</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id" class="log-row">
              <td @mouseover="handleMouseOver(0)" class="email-cell">{{ log.email }}</td>
              <td @mouseover="handleMouseOver(1)" class="time-cell">{{ log.orario }}</td>
              <td @mouseover="handleMouseOver(2)">
                <span class="action-badge">{{ log.azione }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import '@/assets/styles/CSS/base.css'
import '@/assets/styles/CSS/modules/visione-log.css'

import { ref, onMounted } from 'vue'

const logs = ref([]);
const activeColIndex = ref(null);

// 1. Caricamento Log via API (Mock incluso)
const caricaLogs = async () => {
  try {
    const response = await fetch('https://tuo-sito.it/api/logs');
    const data = await response.json();
    logs.value = data;
  } catch (error) {
    logs.value = [
      { id: 1, email: 'gian.carlo@gmail.com', orario: '2023-10-27 10:30:15', azione: 'Accesso' },
      { id: 2, email: 'gian.franco@gmail.com', orario: '2023-10-27 11:45:22', azione: 'Modifica Ruolo' },
      { id: 3, email: 'mario.rossi@gmail.com', orario: '2023-10-27 12:10:05', azione: 'Logout' },
      { id: 4, email: 'gian.carlo@gmail.com', orario: '2023-10-27 14:20:44', azione: 'Visualizzazione Moduli' },
    ];
  }
}

onMounted(caricaLogs);

const handleMouseOver = (index) => {
  activeColIndex.value = index;
};
</script>