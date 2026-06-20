<script setup>
import { ref, onMounted } from 'vue'

// --- 1. STATO REATTIVO ---
const utenti = ref([]);
const ruoli = ref([]);
const selectedId = ref(null);
const activeColIndex = ref(null);
const barOpen = ref(false);
const utenteInModifica = ref(null);
const isNew = ref(false);

// --- 2. HELPER UTILS ---
// L'API restituisce 'self' (es. "/api/users/60d5ec..."), usiamo questo helper per estrarre l'ID reale
const extractId = (selfPath) => selfPath ? selfPath.split('/').pop() : null;

// Trova il nome del ruolo partendo dall'ID per stamparlo in tabella
const getNomeRuolo = (ruoloId) => {
    const ruolo = ruoli.value.find(r => extractId(r.self) === ruoloId);
    return ruolo ? ruolo.nome : 'Non assegnato';
};

// --- 3. CHIAMATE API (GET) ---
const caricaDati = async () => {
    try {
        const [resUsers, resRoles] = await Promise.all([
            fetch("/api/users"),
            fetch("/api/roles")
        ]);

        if (resUsers.ok) utenti.value = await resUsers.json();
        if (resRoles.ok) ruoli.value = await resRoles.json();
    } catch (error) {
        console.error("💥 Errore nel caricamento dati:", error);
    }
};

onMounted(caricaDati);

// --- 4. GESTIONE UI SIDEBAR ---
const seleziona = (u) => {
    selectedId.value = extractId(u.self);
    isNew.value = false;
    // Creiamo una copia profonda per non modificare la tabella prima del salvataggio API
    utenteInModifica.value = { 
        id: selectedId.value,
        nome: u.nome, 
        cognome: u.cognome, 
        email: u.email, 
        attivo: u.attivo, 
        ruolo: u.ruolo 
    };
    barOpen.value = true;
};

const preparaNuovoUtente = () => {
    selectedId.value = null;
    isNew.value = true;
    utenteInModifica.value = { 
        nome: '', 
        cognome: '', 
        email: '', 
        password: '', // Richiesta dall'API in fase di POST
        attivo: true, 
        ruolo: ruoli.value.length ? extractId(ruoli.value[0].self) : '' 
    };
    barOpen.value = true;
};

const toggleStato = () => {
    utenteInModifica.value.attivo = !utenteInModifica.value.attivo;
};

// --- 5. CHIAMATE API (POST / PATCH) ---
const salvaDati = async () => {
    try {
        const url = isNew.value ? "/api/users" : `/api/users/${utenteInModifica.value.id}`;
        const method = isNew.value ? "POST" : "PATCH";
        
        const payload = {
            nome: utenteInModifica.value.nome,
            cognome: utenteInModifica.value.cognome,
            email: utenteInModifica.value.email,
            ruolo: utenteInModifica.value.ruolo,
            attivo: utenteInModifica.value.attivo
        };

        // La password serve solo in creazione
        if (isNew.value) {
            if(!utenteInModifica.value.password) return alert("Inserisci una password per il nuovo utente!");
            payload.password = utenteInModifica.value.password;
        }

        const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            await caricaDati(); // Ricarica la tabella
            barOpen.value = false;
        } else {
            const err = await res.json();
            alert("Errore salvataggio: " + (err.message || "Sconosciuto"));
        }
    } catch (error) {
        console.error("Errore salvataggio", error);
    }
};

const resetPassword = async () => {
    const nuovaPassword = prompt("Inserisci la nuova password per l'utente:");
    if (!nuovaPassword) return;

    try {
        const res = await fetch(`/api/users/${utenteInModifica.value.id}/password`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: nuovaPassword })
        });

        if (res.ok) {
            alert("Password aggiornata con successo!");
        } else {
            alert("Errore nell'aggiornamento della password.");
        }
    } catch (error) {
        console.error("Errore reset password", error);
    }
};
</script>

<template>
    <div class="dashboard-page">
        <header class="navbar-panel">
            <div class="brand">TRENTO <span class="accent">LIVE ADMIN</span></div>
            <div class="controls-group">
                <button @click="preparaNuovoUtente" class="btn-primary">➕ Crea Nuovo Account</button>
            </div>
        </header>

        <div class="main-content">
            <section class="table-section panel">
                <div class="table-wrapper">
                    <table @mouseleave="activeColIndex = null">
                        <thead>
                            <tr>
                                <th v-for="(h, i) in ['NOME', 'COGNOME', 'EMAIL', 'RUOLO', 'STATO']" 
                                    :key="h" 
                                    :class="{ 'on-hover': activeColIndex === i }">
                                    {{ h }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="u in utenti" :key="extractId(u.self)" 
                                :class="{ 'selected': selectedId === extractId(u.self) }" 
                                @click="seleziona(u)">
                                
                                <td @mouseover="activeColIndex = 0">{{ u.nome }}</td>
                                <td @mouseover="activeColIndex = 1">{{ u.cognome }}</td>
                                <td @mouseover="activeColIndex = 2">{{ u.email }}</td>
                                <td @mouseover="activeColIndex = 3">
                                    <span class="ruolo-badge">{{ getNomeRuolo(u.ruolo) }}</span>
                                </td>
                                <td @mouseover="activeColIndex = 4">
                                    <span :class="['pallino', u.attivo ? 'attivo' : 'disattivo']"></span>
                                    {{ u.attivo ? 'Attivo' : 'Disattivo' }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <aside class="sidebar-panel panel bar" :class="{ 'open': barOpen }">
                <div v-if="utenteInModifica" class="settings-content">
                    <div class="sidebar-header">
                        <h3>{{ isNew ? 'Nuovo Utente' : 'Impostazioni Account' }}</h3>
                    </div>
                    
                    <p v-if="!isNew" class="edit-subtitle">
                        Modificando: <strong>{{ utenteInModifica.nome }} {{ utenteInModifica.cognome }}</strong>
                    </p>

                    <div class="scroll-area form-container">
                        <div class="form-group">
                            <label>Nome</label>
                            <input v-model="utenteInModifica.nome" type="text" placeholder="Es. Mario" />
                        </div>

                        <div class="form-group">
                            <label>Cognome</label>
                            <input v-model="utenteInModifica.cognome" type="text" placeholder="Es. Rossi" />
                        </div>

                        <div class="form-group">
                            <label>Email</label>
                            <input v-model="utenteInModifica.email" type="email" placeholder="mario@example.com" />
                        </div>

                        <div class="form-group" v-if="isNew">
                            <label>Password Provvisoria</label>
                            <input v-model="utenteInModifica.password" type="text" placeholder="Password123!" />
                        </div>

                        <div class="form-group">
                            <label>Ruolo Sistema</label>
                            <select v-model="utenteInModifica.ruolo">
                                <option v-for="r in ruoli" :key="extractId(r.self)" :value="extractId(r.self)">
                                    {{ r.nome }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <div class="actions-grid">
                        <button v-if="!isNew" @click="toggleStato" :class="utenteInModifica.attivo ? 'btn-danger-outline' : 'btn-success-outline'">
                            {{ utenteInModifica.attivo ? '🚫 Disattiva Account' : '✅ Attiva Account' }}
                        </button>

                        <button v-if="!isNew" @click="resetPassword" class="btn-secondary">🔑 Reset Password</button>

                        <button @click="salvaDati" class="btn-save">
                            {{ isNew ? '💾 Crea Account' : '💾 Salva Modifiche' }}
                        </button>
                        
                        <button @click="barOpen = false" class="btn-close">Annulla</button>
                    </div>
                </div>
                <div v-else class="empty-state">
                    Seleziona una riga dalla tabella per modificare l'utente oppure clicca su "Crea Nuovo Account".
                </div>
            </aside>
        </div>
    </div>
</template>

<style scoped>
/* --- LAYOUT GENERALE ALLINEATO AL DESIGN SYSTEM --- */
.dashboard-page { display: flex; flex-direction: column; height: 100vh; background: #f8f9fa; font-family: system-ui, -apple-system, sans-serif; color: #2d3748; }
.navbar-panel { display: flex; justify-content: space-between; align-items: center; padding: 12px 30px; background: white; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03); border-bottom: 1px solid #edf2f7; }
.brand { font-weight: 700; font-size: 1.1rem; color: #1a202c; }
.brand .accent { color: #3182ce; }
.main-content { display: flex; flex: 1; padding: 20px; gap: 20px; overflow: hidden; }
.panel { background: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); border: 1px solid #edf2f7; }

/* --- TABELLA (Adattata dallo snippet fornito) --- */
.table-section { flex: 1; display: flex; flex-direction: column; padding: 20px; overflow: hidden; }
.table-wrapper { flex: 1; overflow-y: auto; overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px; }

.table-wrapper::-webkit-scrollbar { height: 8px; width: 8px; }
.table-wrapper::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 4px; }
.table-wrapper::-webkit-scrollbar-track { background: #f7fafc; border-radius: 4px; }

table { width: 100%; border-collapse: collapse; text-align: left; table-layout: fixed; }
thead th { position: sticky; top: 0; background: #3182ce; color: white; padding: 15px; font-size: 0.8rem; font-weight: 600; z-index: 2; letter-spacing: 0.5px; }

tbody td { padding: 15px; border-bottom: 1px solid #edf2f7; font-size: 0.85rem; color: #4a5568; transition: background-color 0.2s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
tbody tr { cursor: pointer; transition: background-color 0.2s; }
tbody tr:hover { background-color: #f7fafc; }

/* --- Selezionata/Deselezionata --- */
.selected td { background-color: #ebf8ff !important; border-top: 1px solid #3182ce; border-bottom: 1px solid #3182ce; color: #2b6cb0; font-weight: 500; }

/* --- Effetti Hover Richiesti --- */
td:hover, thead th.on-hover { color: #2b6cb0; background-color: #ebf8ff; }
thead th.on-hover { transform: scale(1.02); transition: transform 0.1s ease; z-index: 10; position: relative; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 4px; }

/* --- Badge & Indicatori --- */
.ruolo-badge { background: #edf2f7; color: #4a5568; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; border: 1px solid #e2e8f0; }
.pallino { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 8px; vertical-align: middle; }
.attivo { background-color: #48bb78; box-shadow: 0 0 5px rgba(72, 187, 120, 0.4); }
.disattivo { background-color: #f56565; box-shadow: 0 0 5px rgba(245, 101, 101, 0.4); }

/* --- SIDEBAR FORM --- */
.sidebar-panel { width: 0; opacity: 0; padding: 0; overflow: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; }
.sidebar-panel.open { width: 350px; opacity: 1; padding: 20px; }

.sidebar-header h3 { font-size: 1.1rem; color: #1a202c; font-weight: 700; margin: 0; border-bottom: 2px solid #edf2f7; padding-bottom: 10px; margin-bottom: 15px; }
.edit-subtitle { font-size: 0.85rem; color: #718096; margin-bottom: 20px; }

.form-container { flex: 1; padding-right: 5px; margin-bottom: 20px; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; font-size: 0.8rem; font-weight: 600; color: #4a5568; margin-bottom: 6px; }
.form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #cbd5e0; border-radius: 8px; font-size: 0.85rem; color: #2d3748; background: #f7fafc; transition: border-color 0.2s; }
.form-group input:focus, .form-group select:focus { outline: none; border-color: #3182ce; background: white; box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1); }

/* --- BOTTONI SIDEBAR --- */
.actions-grid { display: flex; flex-direction: column; gap: 10px; padding-top: 15px; border-top: 1px solid #edf2f7; }
button { padding: 10px 15px; border: none; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }

.btn-primary { background: #3182ce; color: white; box-shadow: 0 2px 4px rgba(49, 130, 206, 0.2); }
.btn-primary:hover { background: #2b6cb0; }

.btn-save { background: #48bb78; color: white; box-shadow: 0 2px 4px rgba(72, 187, 120, 0.2); }
.btn-save:hover { background: #38a169; }

.btn-secondary { background: #edf2f7; color: #4a5568; border: 1px solid #cbd5e0; }
.btn-secondary:hover { background: #e2e8f0; }

.btn-danger-outline { background: white; color: #f56565; border: 1px solid #f56565; }
.btn-danger-outline:hover { background: #fff5f5; }

.btn-success-outline { background: white; color: #48bb78; border: 1px solid #48bb78; }
.btn-success-outline:hover { background: #f0fff4; }

.btn-close { background: transparent; color: #a0aec0; font-weight: 500; }
.btn-close:hover { color: #4a5568; text-decoration: underline; }

.empty-state { text-align: center; color: #a0aec0; font-size: 0.9rem; margin-top: 50px; font-style: italic; }
</style>