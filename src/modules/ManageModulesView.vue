<script setup>
	import { ref, onMounted } from "vue";

	const moduli = ref([]);
	const selectedId = ref(null);
	const activeColIndex = ref(null);
	const barOpen = ref(false);
	const moduloInModifica = ref(null);

	const extractId = (selfPath) => (selfPath ? selfPath.split("/").pop() : null);

	const caricaModuli = async () => {
		try {
			const res = await fetch("/api/modules");
			if (res.ok) {
				moduli.value = await res.json();
			}
		} catch (error) {
			console.error("Errore nel caricamento dei moduli:", error);
			moduli.value = [
				{
					self: "/api/modules/1",
					nome: "Anagrafica",
					descrizione: "Gestione dati sensibili utenti",
					percorso: "/anagrafica",
					attivo: true,
				},
				{
					self: "/api/modules/2",
					nome: "Smart City Map",
					descrizione: "Visualizzazione sensori su mappa 3D",
					percorso: "/mappa",
					attivo: true,
				},
				{
					self: "/api/modules/3",
					nome: "Report System",
					descrizione: "Generazione PDF e statistiche",
					percorso: "/report",
					attivo: false,
				},
			];
		}
	};

	onMounted(caricaModuli);

	const selezionaModulo = (m) => {
		selectedId.value = extractId(m.self);

		moduloInModifica.value = {
			id: selectedId.value,
			nome: m.nome,
			descrizione: m.descrizione,
			percorso: m.percorso,
			attivo: m.attivo,
		};

		barOpen.value = true;
	};

	const handleMouseOver = (index) => {
		activeColIndex.value = index;
	};

	const salvaModifiche = async () => {
		if (!moduloInModifica.value) return;

		try {
			const payload = {
				attivo: moduloInModifica.value.attivo,
			};

			const res = await fetch(`/api/modules/${moduloInModifica.value.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (res.ok) {
				await caricaModuli();
				barOpen.value = false;
				selectedId.value = null;
				moduloInModifica.value = null;
			} else {
				const errore = await res.json();
				alert(
					"Errore durante l'aggiornamento: " +
						(errore.message || "Richiesta non valida"),
				);
			}
		} catch (error) {
			console.error("Errore di rete durante il salvataggio:", error);
			alert("Impossibile connettersi al server per aggiornare il modulo.");
		}
	};
</script>

<template>
	<div class="dashboard-page">
		<header class="navbar-panel">
			<div class="brand">
				GESTIONE <span class="accent">MODULI DI SISTEMA</span>
			</div>
		</header>

		<div class="main-content">
			<section class="table-section panel">
				<div class="table-wrapper">
					<table @mouseleave="activeColIndex = null">
						<thead>
							<tr>
								<th :class="{ 'on-hover': activeColIndex === 0 }">STATO</th>
								<th :class="{ 'on-hover': activeColIndex === 1 }">MODULO</th>
								<th :class="{ 'on-hover': activeColIndex === 2 }">
									DESCRIZIONE
								</th>
								<th :class="{ 'on-hover': activeColIndex === 3 }">
									PERCORSO (ROUTING)
								</th>
							</tr>
						</thead>
						<tbody>
							<tr
								v-for="m in moduli"
								:key="extractId(m.self)"
								:class="{
									selected: selectedId === extractId(m.self),
									'inactive-row': !m.attivo,
								}"
								@click="selezionaModulo(m)"
							>
								<td @mouseover="handleMouseOver(0)">
									<span
										:class="[
											'status-badge',
											m.attivo ? 'badge-active' : 'badge-inactive',
										]"
									>
										{{ m.attivo ? "Operativo" : "Disattivo" }}
									</span>
								</td>
								<td @mouseover="handleMouseOver(1)">
									<strong>{{ m.nome }}</strong>
								</td>
								<td @mouseover="handleMouseOver(2)" class="cell-descrizione">
									{{ m.descrizione }}
								</td>
								<td @mouseover="handleMouseOver(3)">
									<code class="path-code">{{ m.percorso }}</code>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>

			<aside class="sidebar-panel panel bar" :class="{ open: barOpen }">
				<div v-if="moduloInModifica" class="settings-content">
					<div class="sidebar-header">
						<h3>Impostazioni Modulo</h3>
						<button @click="barOpen = false" class="btn-close-x">✕</button>
					</div>

					<div class="scroll-area form-container">
						<div class="info-alert">
							<strong>Nota di sistema</strong><br />
							Nome, descrizione e percorsi di routing sono definiti a livello di
							core e non possono essere modificati da questa interfaccia.
						</div>

						<div class="form-group">
							<label>Nome Identificativo</label>
							<input
								:value="moduloInModifica.nome"
								disabled
								class="input-disabled"
							/>
						</div>

						<div class="form-group">
							<label>Descrizione Funzionale</label>
							<textarea
								:value="moduloInModifica.descrizione"
								disabled
								rows="3"
								class="input-disabled"
							></textarea>
						</div>

						<div class="form-group">
							<label>Percorso Applicativo</label>
							<input
								:value="moduloInModifica.percorso"
								disabled
								class="input-disabled"
							/>
						</div>

						<div class="form-group">
							<label>Stato Operativo</label>
							<p class="hint">
								Abilita o disabilita globalmente l'accesso a questo modulo.
							</p>

							<div class="modules-checkbox-list">
								<label
									class="checkbox-item"
									:class="{ 'is-active': moduloInModifica.attivo }"
								>
									<input type="checkbox" v-model="moduloInModifica.attivo" />
									<div class="checkbox-custom"></div>
									<div class="checkbox-label-text">
										<span class="mod-name">Modulo Attivo</span>
										<span class="mod-desc"
											>Gli utenti autorizzati potranno accedervi</span
										>
									</div>
								</label>
							</div>
						</div>
					</div>

					<div class="actions-grid">
						<button @click="salvaModifiche" class="btn-save">
							Salva Configurazione
						</button>
						<button @click="barOpen = false" class="btn-close">Annulla</button>
					</div>
				</div>

				<div v-else class="empty-state">
					Seleziona un modulo dalla tabella per gestirne lo stato operativo.
				</div>
			</aside>
		</div>
	</div>
</template>

<style scoped>
	.dashboard-page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: #f8f9fa;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		color: #2d3748;
	}
	.navbar-panel {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px 30px;
		background: white;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
		border-bottom: 1px solid #edf2f7;
	}
	.brand {
		font-weight: 700;
		font-size: 1.4rem;
		color: #1a202c;
		letter-spacing: 0.5px;
	}
	.brand .accent {
		color: #3182ce;
	}
	.main-content {
		display: flex;
		flex: 1;
		padding: 20px;
		gap: 20px;
		overflow: hidden;
	}
	.panel {
		background: white;
		border-radius: 15px;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
		border: 1px solid #edf2f7;
	}

	.table-section {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 20px;
		overflow: hidden;
	}
	.table-wrapper {
		flex: 1;
		overflow-y: auto;
		overflow-x: auto;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
	}

	.table-wrapper::-webkit-scrollbar {
		height: 8px;
		width: 8px;
	}
	.table-wrapper::-webkit-scrollbar-thumb {
		background: #cbd5e0;
		border-radius: 4px;
	}
	.table-wrapper::-webkit-scrollbar-track {
		background: #f7fafc;
		border-radius: 4px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
		table-layout: fixed;
	}
	thead th {
		position: sticky;
		top: 0;
		background: #3182ce;
		color: white;
		padding: 15px;
		font-size: 1.6rem;
		font-weight: 600;
		z-index: 2;
		letter-spacing: 0.5px;
		transition: transform 0.1s ease;
	}

	th:nth-child(1) {
		width: 130px;
	}
	th:nth-child(2) {
		width: 25%;
	}
	th:nth-child(4) {
		width: 200px;
	}

	tbody td {
		padding: 15px;
		border-bottom: 1px solid #edf2f7;
		font-size: 1.4rem;
		color: #4a5568;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.cell-descrizione {
		white-space: normal;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	tbody tr {
		cursor: pointer;
		transition:
			background-color 0.2s,
			opacity 0.2s;
	}
	tbody tr:hover {
		background-color: #f7fafc;
	}
	.inactive-row td {
		color: #a0aec0;
	}
	.path-code {
		background: #edf2f7;
		padding: 3px 6px;
		border-radius: 4px;
		font-family: monospace;
		font-size: 1.4rem;
		color: #4a5568;
	}

	.selected td {
		background-color: #ebf8ff !important;
		border-top: 1px solid #3182ce;
		border-bottom: 1px solid #3182ce;
		color: #2b6cb0;
		font-weight: 500;
	}
	td:hover,
	thead th.on-hover {
		color: #2b6cb0;
		background-color: #ebf8ff;
	}
	thead th.on-hover {
		transform: scale(1.02);
		z-index: 10;
		position: relative;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);
		border-radius: 4px;
	}

	.status-badge {
		padding: 4px 10px;
		border-radius: 12px;
		font-size: 1.2rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	.badge-active {
		background: #c6f6d5;
		color: #22543d;
		border: 1px solid #9ae6b4;
	}
	.badge-inactive {
		background: #e2e8f0;
		color: #4a5568;
		border: 1px solid #cbd5e0;
	}

	.sidebar-panel {
		width: 0;
		opacity: 0;
		padding: 0;
		overflow: hidden;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		flex-direction: column;
	}
	.sidebar-panel.open {
		width: 380px;
		opacity: 1;
		padding: 25px;
	}

	.settings-content {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
	}

	.sidebar-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 2px solid #edf2f7;
		padding-bottom: 12px;
		margin-bottom: 15px;
		flex-shrink: 0;
	}
	.sidebar-header h3 {
		font-size: 1.4rem;
		color: #1a202c;
		font-weight: 700;
		margin: 0;
	}
	.btn-close-x {
		background: transparent;
		border: none;
		font-size: 1.6rem;
		color: #a0aec0;
		cursor: pointer;
		transition: color 0.2s;
	}
	.btn-close-x:hover {
		color: #e53e3e;
	}

	.form-container {
		flex: 1;
		overflow-y: auto;
		padding-right: 10px;
		margin-bottom: 15px;
	}
	.form-container::-webkit-scrollbar {
		width: 6px;
	}
	.form-container::-webkit-scrollbar-thumb {
		background: #cbd5e0;
		border-radius: 4px;
	}
	.form-container::-webkit-scrollbar-track {
		background: transparent;
	}

	.info-alert {
		background: #fffff0;
		border: 1px solid #f6e05e;
		color: #744210;
		padding: 12px;
		border-radius: 8px;
		font-size: 1.4rem;
		margin-bottom: 20px;
		line-height: 1.4;
	}

	.form-group {
		margin-bottom: 20px;
	}
	.form-group label {
		display: block;
		font-size: 1.4rem;
		font-weight: 600;
		color: #4a5568;
		margin-bottom: 6px;
		text-transform: uppercase;
		letter-spacing: 0.3px;
	}
	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 10px;
		border: 1px solid #cbd5e0;
		border-radius: 8px;
		font-size: 1.4rem;
		color: #2d3748;
		background: #f7fafc;
		transition: all 0.2s;
		font-family: inherit;
		resize: none;
		box-sizing: border-box;
	}
	.input-disabled {
		background: #edf2f7 !important;
		cursor: not-allowed;
		color: #718096 !important;
		font-weight: 500;
		border-color: #e2e8f0;
	}
	.hint {
		font-size: 1.4rem;
		color: #718096;
		margin: -2px 0 10px 0;
	}

	.modules-checkbox-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: 10px;
	}
	.checkbox-item {
		display: flex;
		align-items: flex-start;
		padding: 12px 10px;
		border: 1px solid #edf2f7;
		border-radius: 8px;
		background: #f7fafc;
		cursor: pointer;
		transition: all 0.2s;
	}
	.checkbox-item.is-active {
		background: #f0fff4;
		border-color: #c6f6d5;
	}
	.checkbox-item input {
		display: none;
	}
	.checkbox-custom {
		width: 18px;
		height: 18px;
		border: 2px solid #cbd5e0;
		border-radius: 4px;
		margin-top: 2px;
		margin-right: 12px;
		position: relative;
		background: white;
		transition: all 0.15s;
		flex-shrink: 0;
	}
	.checkbox-item input:checked + .checkbox-custom {
		background: #48bb78;
		border-color: #48bb78;
	}
	.checkbox-item input:checked + .checkbox-custom::after {
		content: "✓";
		position: absolute;
		color: white;
		font-size: 1.4rem;
		font-weight: bold;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.checkbox-label-text {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}
	.mod-name {
		font-size: 1.4rem;
		font-weight: 600;
		color: #2d3748;
	}
	.checkbox-item input:checked ~ .checkbox-label-text .mod-name {
		color: #276749;
	}
	.mod-desc {
		font-size: 1.2rem;
		color: #718096;
		line-height: 1.2;
	}

	.actions-grid {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding-top: 15px;
		border-top: 1px solid #edf2f7;
		flex-shrink: 0;
	}
	button {
		padding: 11px 15px;
		border: none;
		border-radius: 8px;
		font-size: 1.4rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.btn-save {
		background: #48bb78;
		color: white;
		box-shadow: 0 2px 4px rgba(72, 187, 120, 0.2);
		width: 100%;
	}
	.btn-save:hover {
		background: #38a169;
	}

	.btn-close {
		background: transparent;
		color: #a0aec0;
		font-weight: 500;
		width: 100%;
	}
	.btn-close:hover {
		color: #4a5568;
		text-decoration: underline;
	}

	.empty-state {
		text-align: center;
		color: #a0aec0;
		font-size: 1.4rem;
		margin-top: 60px;
		font-style: italic;
		padding: 0 20px;
		line-height: 1.4;
	}
</style>
