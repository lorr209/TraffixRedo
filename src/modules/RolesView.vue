<script setup>
import { ref, onMounted, computed } from 'vue'

// --- 1. STATO REATTIVO ---
const ruoli = ref([])
const tuttiIModuli = ref([]) // Elenco completo recuperato dall'API moduli
const selectedId = ref(null)
const activeColIndex = ref(null)
const barOpen = ref(false)
const ruoloInModifica = ref(null)
const isNew = ref(false) // Flag per distinguere tra Creazione e Modifica

// --- 2. UTILS & HELPERS ---
const extractId = (selfPath) => selfPath ? selfPath.split('/').pop() : null

// Converte gli ID dei moduli associati al ruolo nei loro nomi reali per la tabella
const getNomiModuli = (moduliIds) => {
  if (!moduliIds || !Array.isArray(moduliIds)) return []
  return moduliIds.map(id => {
    const moduloTrovato = tuttiIModuli.value.find(m => extractId(m.self) === id)
    return moduloTrovato ? moduloTrovato.nome : 'Modulo Sconosciuto'
  })
}

// Verifica se un modulo riguarda la gestione critica (Utenti, Ruoli, Moduli)
const isModuloPrivilegiato = (mod) => {
  if (!mod || !mod.nome) return false
  const n = mod.nome.toLowerCase()
  return n.includes('utent') || n.includes('ruol') || n.includes('modul')
}

// Verifica se il ruolo attualmente in modifica è l'Admin
const isRoleAdmin = computed(() => {
  if (!ruoloInModifica.value) return false
  const n = ruoloInModifica.value.nome.toLowerCase()
  return n === 'admin' || n === 'amministratore'
})

// --- 3. CHIAMATE API (GET) ---
const caricaDatiSdf = async () => {
  try {
    const [resRuoli, resModuli] = await Promise.all([
      fetch('/api/roles'),
      fetch('/api/modules')
    ])

    if (resRuoli.ok) ruoli.value = await resRuoli.json()
    if (resModuli.ok) tuttiIModuli.value = await resModuli.json()
  } catch (error) {
    console.error("💥 Errore nel caricamento dei dati dei ruoli:", error)
  }
}

onMounted(caricaDatiSdf)

// --- 4. GESTIONE INTERFACCIA (SIDEBAR) ---
const selezionaRuolo = (r) => {
  selectedId.value = extractId(r.self)
  isNew.value = false
  
  const isAdminCheck = r.nome.toLowerCase() === 'admin' || r.nome.toLowerCase() === 'amministratore'

  ruoloInModifica.value = {
    id: selectedId.value,
    nome: r.nome,
    descrizione: r.descrizione,
    // Se è admin, forza tutti i moduli. Altrimenti, filtra eventuali moduli critici finiti per sbaglio ad un non-admin
    moduli: isAdminCheck 
      ? tuttiIModuli.value.map(m => extractId(m.self)) 
      : (r.moduli || []).filter(id => {
          const mod = tuttiIModuli.value.find(m => extractId(m.self) === id)
          return mod && !isModuloPrivilegiato(mod)
        })
  }
  barOpen.value = true
}

const preparaNuovoRuolo = () => {
  selectedId.value = null
  isNew.value = true
  ruoloInModifica.value = {
    nome: '',
    descrizione: '',
    moduli: []
  }
  barOpen.value = true
}

const handleMouseOver = (index) => {
  activeColIndex.value = index
}

// --- 5. CHIAMATE API (POST / PATCH) ---
const salvaModifiche = async () => {
  if (!ruoloInModifica.value || !ruoloInModifica.value.nome.trim()) {
    return alert("Il nome del ruolo è obbligatorio.")
  }

  try {
    const url = isNew.value ? '/api/roles' : `/api/roles/${ruoloInModifica.value.id}`
    const method = isNew.value ? 'POST' : 'PATCH'
    
    // Per sicurezza, prepariamo i moduli da salvare applicando le stesse regole di back-end "ideali"
    let moduliToSave = ruoloInModifica.value.moduli
    if (isRoleAdmin.value) {
      moduliToSave = tuttiIModuli.value.map(m => extractId(m.self))
    }

    const payload = {
      descrizione: ruoloInModifica.value.descrizione,
      moduli: moduliToSave
    }
    
    if (isNew.value) payload.nome = ruoloInModifica.value.nome

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (res.ok) {
      await caricaDatiSdf() // Rinfresca la tabella
      barOpen.value = false
      selectedId.value = null
      ruoloInModifica.value = null
    } else {
      const errore = await res.json()
      alert("Errore durante il salvataggio: " + (errore.message || "Ruolo già presente o richiesta non valida"))
    }
  } catch (error) {
    console.error("Errore di rete durante il salvataggio:", error)
    alert("Impossibile connettersi al server.")
  }
}
</script>

<template>
  <div class="dashboard-page">
    <header class="navbar-panel">
      <div class="brand">TRENTO <span class="accent">LIVE ADMIN</span></div>
      <div class="controls-group">
        <button @click="preparaNuovoRuolo" class="btn-primary">➕ Crea Nuovo Ruolo</button>
      </div>
    </header>

    <div class="main-content">
      <section class="table-section panel">
        <div class="table-wrapper">
          <table @mouseleave="activeColIndex = null">
            <thead>
              <tr>
                <th :class="{ 'on-hover': activeColIndex === 0 }">RUOLO</th>
                <th :class="{ 'on-hover': activeColIndex === 1 }">DESCRIZIONE</th>
                <th :class="{ 'on-hover': activeColIndex === 2 }">MODULI ABILITATI</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="r in ruoli" :key="extractId(r.self)"
                :class="{ 'selected': selectedId === extractId(r.self) }"
                @click="selezionaRuolo(r)"
              >
                <td @mouseover="handleMouseOver(0)"><strong>{{ r.nome }}</strong></td>
                <td @mouseover="handleMouseOver(1)" class="cell-descrizione">{{ r.descrizione }}</td>
                <td @mouseover="handleMouseOver(2)">
                  <div class="tags-container">
                    <span v-for="mNome in getNomiModuli(r.moduli)" :key="mNome" class="tag-modulo">
                      {{ mNome }}
                    </span>
                    <span v-if="!r.moduli || r.moduli.length === 0" class="no-modules">
                      Nessun modulo associato
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <aside class="sidebar-panel panel bar" :class="{ 'open': barOpen }">
        <div v-if="ruoloInModifica" class="settings-content">
          <div class="sidebar-header">
            <h3>{{ isNew ? 'Nuovo Ruolo' : 'Modifica Permessi' }}</h3>
            <button @click="barOpen = false" class="btn-close-x">✕</button>
          </div>

          <div class="scroll-area form-container">
            <div v-if="isRoleAdmin" class="admin-alert">
              <strong>👑 Ruolo di Sistema</strong><br/>
              L'Amministratore ha sempre accesso completo a tutti i moduli.
            </div>

            <div class="form-group">
              <label>Nome Ruolo {{ !isNew ? '(Sola Lettura)' : '' }}</label>
              <input 
                v-model="ruoloInModifica.nome" 
                :disabled="!isNew" 
                :class="{ 'input-disabled': !isNew }"
                placeholder="Es. Sviluppatore" 
              />
            </div>

            <div class="form-group">
              <label>Descrizione Ruolo</label>
              <textarea v-model="ruoloInModifica.descrizione" rows="4" placeholder="Inserisci una descrizione per questo ruolo..."></textarea>
            </div>

            <div class="form-group">
              <label>Moduli Applicazione Accessibili</label>
              <p class="hint">Seleziona i moduli visibili per gli utenti con questo ruolo:</p>
              
              <div class="modules-checkbox-list">
                <label 
                  v-for="mod in tuttiIModuli" 
                  :key="extractId(mod.self)" 
                  class="checkbox-item"
                  :class="{ 'disabled-item': isRoleAdmin || (!isRoleAdmin && isModuloPrivilegiato(mod)) }"
                >
                  <input 
                    type="checkbox" 
                    :value="extractId(mod.self)" 
                    v-model="ruoloInModifica.moduli" 
                    :disabled="isRoleAdmin || (!isRoleAdmin && isModuloPrivilegiato(mod))"
                  />
                  <div class="checkbox-custom"></div>
                  <div class="checkbox-label-text">
                    <span class="mod-name">{{ mod.nome }}</span>
                    <span class="mod-desc">
                      <template v-if="!isRoleAdmin && isModuloPrivilegiato(mod)">
                        🔒 <i>Riservato Amministratore</i>
                      </template>
                      <template v-else>
                        {{ mod.descrizione }}
                      </template>
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div class="actions-grid">
            <button @click="salvaModifiche" class="btn-save">
              {{ isNew ? '💾 Crea Ruolo' : '💾 Aggiorna Ruolo' }}
            </button>
            <button @click="barOpen = false" class="btn-close">Annulla</button>
          </div>
        </div>

        <div v-else class="empty-state">
          Seleziona un ruolo dalla tabella per configurarlo o clicca su "Crea Nuovo Ruolo".
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
/* --- DESIGN SYSTEM GENERALE --- */
.dashboard-page { display: flex; flex-direction: column; height: 100vh; background: #f8f9fa; font-family: system-ui, -apple-system, sans-serif; color: #2d3748; }
.navbar-panel { display: flex; justify-content: space-between; align-items: center; padding: 15px 30px; background: white; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03); border-bottom: 1px solid #edf2f7; }
.brand { font-weight: 700; font-size: 1.1rem; color: #1a202c; letter-spacing: 0.5px; }
.brand .accent { color: #3182ce; }
.controls-group { display: flex; gap: 10px; }
.main-content { display: flex; flex: 1; padding: 20px; gap: 20px; overflow: hidden; }
.panel { background: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); border: 1px solid #edf2f7; }

/* --- SEZIONE TABELLA --- */
.table-section { flex: 1; display: flex; flex-direction: column; padding: 20px; overflow: hidden; }
.table-wrapper { flex: 1; overflow-y: auto; overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px; }

.table-wrapper::-webkit-scrollbar { height: 8px; width: 8px; }
.table-wrapper::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 4px; }
.table-wrapper::-webkit-scrollbar-track { background: #f7fafc; border-radius: 4px; }

table { width: 100%; border-collapse: collapse; text-align: left; table-layout: fixed; }
thead th { position: sticky; top: 0; background: #3182ce; color: white; padding: 15px; font-size: 0.8rem; font-weight: 600; z-index: 2; letter-spacing: 0.5px; transition: transform 0.1s ease; }

tbody td { padding: 15px; border-bottom: 1px solid #edf2f7; font-size: 0.85rem; color: #4a5568; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cell-descrizione { white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; }
tbody tr { cursor: pointer; transition: background-color 0.2s; }
tbody tr:hover { background-color: #f7fafc; }

.selected td { background-color: #ebf8ff !important; border-top: 1px solid #3182ce; border-bottom: 1px solid #3182ce; color: #2b6cb0; font-weight: 500; }
td:hover, thead th.on-hover { color: #2b6cb0; background-color: #ebf8ff; }
thead th.on-hover { transform: scale(1.02); z-index: 10; position: relative; box-shadow: 0 4px 6px rgba(0,0,0,0.08); border-radius: 4px; }

.tags-container { display: flex; flex-wrap: wrap; gap: 6px; max-height: 45px; overflow: hidden; }
.tag-modulo { background: #edf2f7; color: #4a5568; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; border: 1px solid #e2e8f0; }
.no-modules { color: #a0aec0; font-style: italic; font-size: 0.8rem; }

/* --- SIDEBAR --- */
.sidebar-panel { width: 0; opacity: 0; padding: 0; overflow: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; }
.sidebar-panel.open { width: 380px; opacity: 1; padding: 25px; }

.settings-content { display: flex; flex-direction: column; height: 100%; overflow: hidden; }

.sidebar-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #edf2f7; padding-bottom: 12px; margin-bottom: 15px; flex-shrink: 0; }
.sidebar-header h3 { font-size: 1.1rem; color: #1a202c; font-weight: 700; margin: 0; }
.btn-close-x { background: transparent; border: none; font-size: 1.1rem; color: #a0aec0; cursor: pointer; transition: color 0.2s; }
.btn-close-x:hover { color: #e53e3e; }

.form-container { flex: 1; overflow-y: auto; padding-right: 10px; margin-bottom: 15px; }
.form-container::-webkit-scrollbar { width: 6px; }
.form-container::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 4px; }
.form-container::-webkit-scrollbar-track { background: transparent; }

.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 0.8rem; font-weight: 600; color: #4a5568; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.3px; }
.form-group input, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #cbd5e0; border-radius: 8px; font-size: 0.85rem; color: #2d3748; background: #f7fafc; transition: all 0.2s; font-family: inherit; resize: none; }
.form-group input:focus, .form-group textarea:focus { outline: none; border-color: #3182ce; background: white; box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1); }
.input-disabled { background: #edf2f7 !important; cursor: not-allowed; color: #718096 !important; font-weight: 500; border-color: #e2e8f0; }
.hint { font-size: 0.8rem; color: #718096; margin: -2px 0 10px 0; }

.admin-alert { background: #ebf8ff; border: 1px solid #90cdf4; color: #2b6cb0; padding: 12px; border-radius: 8px; font-size: 0.85rem; margin-bottom: 20px; line-height: 1.4; }

/* --- CHECKBOX LIST --- */
.modules-checkbox-list { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; max-height: 250px; overflow-y: auto; padding-right: 5px; }
.modules-checkbox-list::-webkit-scrollbar { width: 4px; }
.modules-checkbox-list::-webkit-scrollbar-thumb { background: #a0aec0; border-radius: 4px; }
.modules-checkbox-list::-webkit-scrollbar-track { background: transparent; }

.checkbox-item { display: flex; align-items: flex-start; padding: 10px; border: 1px solid #edf2f7; border-radius: 8px; background: #f7fafc; cursor: pointer; transition: all 0.2s; }
.checkbox-item:hover:not(.disabled-item) { background: #f0fff4; border-color: #c6f6d5; }
.checkbox-item.disabled-item { opacity: 0.5; cursor: not-allowed; background: #edf2f7; }

.checkbox-item input { display: none; }
.checkbox-custom { width: 18px; height: 18px; border: 2px solid #cbd5e0; border-radius: 4px; margin-top: 2px; margin-right: 12px; position: relative; background: white; transition: all 0.15s; flex-shrink: 0; }
.checkbox-item input:checked + .checkbox-custom { background: #48bb78; border-color: #48bb78; }
.checkbox-item input:checked + .checkbox-custom::after { content: "✓"; position: absolute; color: white; font-size: 0.75rem; font-weight: bold; top: 50%; left: 50%; transform: translate(-50%, -50%); }

.checkbox-label-text { display: flex; flex-direction: column; gap: 1px; }
.mod-name { font-size: 0.85rem; font-weight: 600; color: #2d3748; }
.checkbox-item input:checked ~ .checkbox-label-text .mod-name { color: #276749; }
.mod-desc { font-size: 0.75rem; color: #718096; line-height: 1.2; }

/* --- AZIONI --- */
.actions-grid { display: flex; flex-direction: column; gap: 10px; padding-top: 15px; border-top: 1px solid #edf2f7; flex-shrink: 0; }
button { padding: 11px 15px; border: none; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }

.btn-primary { background: #3182ce; color: white; box-shadow: 0 2px 4px rgba(49, 130, 206, 0.2); }
.btn-primary:hover { background: #2b6cb0; }

.btn-save { background: #48bb78; color: white; box-shadow: 0 2px 4px rgba(72, 187, 120, 0.2); width: 100%; }
.btn-save:hover { background: #38a169; }

.btn-close { background: transparent; color: #a0aec0; font-weight: 500; width: 100%; }
.btn-close:hover { color: #4a5568; text-decoration: underline; }

.empty-state { text-align: center; color: #a0aec0; font-size: 0.9rem; margin-top: 60px; font-style: italic; padding: 0 20px; line-height: 1.4; }
</style>