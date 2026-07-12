<script setup>
	import { ref, computed, onBeforeMount } from "vue";

	const complaints = ref([]);

	const filtroTesto = ref("");
	const filtroTag = ref("");
	const segnalazioneSelezionata = ref(null);

	onBeforeMount(async () => {
		try {
			const response = await fetch("/api/complaints", {
				method: "GET",
				headers: { "Content-Type": "application/json" },
			});
			if (response.ok) {
				complaints.value = await response.json();
			} else {
				console.error("Errore nel recupero dei dati dal server");
			}
		} catch (error) {
			console.error("Errore di rete:", error);
		}
	});

	const segnalazioniFiltrate = computed(() => {
		return complaints.value.filter((s) => {
			const matchTesto = (s.testo || "")
				.toLowerCase()
				.includes(filtroTesto.value.toLowerCase());

			const matchTag = filtroTag.value === "" || s.tipo === filtroTag.value;

			return matchTesto && matchTag;
		});
	});

	const generaLinkMaps = (lat, lon) =>
		lat && lon ? `https://www.google.com/maps?q=${lat},${lon}` : "#";
</script>

<template>
	<main class="complaints-page">
		<div class="main-grid">
			<section class="panel list-panel">
				<div class="panel-header">
					<h2>Elenco Segnalazioni</h2>
					<div class="filters">
						<input
							v-model="filtroTesto"
							placeholder="Cerca nel testo della segnalazione..."
							class="search-input"
						/>
						<select v-model="filtroTag" class="select-filter">
							<option value="">Tutti i Tipi</option>
							<option value="traffico">Traffico</option>
							<option value="tpl">TPL (Trasporto Pubblico)</option>
						</select>
					</div>
				</div>

				<table class="data-table">
					<thead>
						<tr>
							<th>ID</th>
							<th>Testo Anteprima</th>
							<th>Tipo</th>
							<th>Posizione</th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="s in segnalazioniFiltrate"
							:key="s.id || s.self"
							@click="segnalazioneSelezionata = s"
							:class="{
								'selected-row':
									segnalazioneSelezionata?.id === s.id ||
									segnalazioneSelezionata?.self === s.self,
							}"
						>
							<td>#{{ s.id || s.self?.split("/").pop()?.slice(-4) }}</td>
							<td class="truncate">{{ s.testo }}</td>
							<td>
								<span v-if="s.tipo" :class="['status-badge', s.tipo]">
									{{ s.tipo }}
								</span>
								<span v-else class="no-pos">N/D</span>
							</td>
							<td>
								<a
									v-if="s.lat && s.lon"
									:href="generaLinkMaps(s.lat, s.lon)"
									target="_blank"
									@click.stop
									class="maps-link"
									>Apri Maps</a
								>
								<span v-else class="no-pos">N/D</span>
							</td>
						</tr>
					</tbody>
				</table>
			</section>

			<aside class="side-panel">
				<div v-if="segnalazioneSelezionata" class="detail-box">
					<h3>Dettaglio Segnalazione</h3>
					<p class="full-desc">{{ segnalazioneSelezionata.testo }}</p>

					<div class="stats">
						<div class="stat">
							<span class="label">Tipo Categoria</span>
							<span class="val text-capitalize">{{
								segnalazioneSelezionata.tipo || "Non specificato"
							}}</span>
						</div>
						<div class="stat" v-if="segnalazioneSelezionata.data">
							<span class="label">Data Inserimento</span>
							<span class="val">{{
								new Date(segnalazioneSelezionata.data).toLocaleDateString()
							}}</span>
						</div>
					</div>

					<div class="stats">
						<div class="stat">
							<span class="label">Latitudine</span>
							<span class="val">{{
								segnalazioneSelezionata.lat || "Assente"
							}}</span>
						</div>
						<div class="stat">
							<span class="label">Longitudine</span>
							<span class="val">{{
								segnalazioneSelezionata.lon || "Assente"
							}}</span>
						</div>
					</div>

					<button @click="segnalazioneSelezionata = null" class="btn-cancel">
						Chiudi Dettaglio
					</button>
				</div>

				<div v-else class="placeholder-box">
					<p>
						Seleziona una segnalazione dalla tabella per visualizzarne i
						dettagli completi.
					</p>
				</div>
			</aside>
		</div>
	</main>
</template>

<style scoped>
	.complaints-page {
		padding: 30px;
		background: #f8f9fa;
		min-height: 100vh;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}

	.main-grid {
		display: grid;
		grid-template-columns: 1fr 400px;
		gap: 25px;
	}

	.panel,
	.detail-box,
	.placeholder-box {
		background: white;
		border-radius: 15px;
		padding: 25px;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 25px;
		gap: 15px;
	}

	.panel-header h2 {
		margin: 0;
		color: #2d3748;
		font-size: 1.6rem;
	}

	.filters {
		display: flex;
		gap: 12px;
		flex: 1;
		justify-content: flex-end;
	}

	.search-input,
	.select-filter {
		padding: 10px 14px;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-size: 1.2rem;
		color: #2d3748;
		outline: none;
		transition: border-color 0.2s;
	}

	.search-input {
		width: 100%;
		max-width: 300px;
	}

	.search-input:focus,
	.select-filter:focus {
		border-color: #3182ce;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 1.4rem;
	}

	.data-table th {
		padding: 14px;
		text-align: left;
		color: #718096;
		font-weight: 600;
		border-bottom: 2px solid #edf2f7;
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.data-table td {
		padding: 14px;
		color: #2d3748;
		border-bottom: 1px solid #edf2f7;
		vertical-align: middle;
	}

	.data-table tbody tr {
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.data-table tbody tr:hover {
		background: #f7fafc;
	}

	.selected-row {
		background: #ebf8ff !important;
	}

	.truncate {
		max-width: 250px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.status-badge {
		font-size: 1.2rem;
		padding: 6px 12px;
		border-radius: 20px;
		font-weight: bold;
		text-transform: uppercase;
		display: inline-block;
	}

	.status-badge.traffico {
		background: #fff5f5;
		color: #c53030;
	}

	.status-badge.tpl {
		background: #e6fffa;
		color: #234e52;
	}

	.maps-link {
		color: #3182ce;
		text-decoration: none;
		font-weight: 500;
	}

	.maps-link:hover {
		text-decoration: underline;
	}

	.no-pos {
		color: #a0aec0;
		font-style: italic;
		font-size: 1.2rem;
	}

	.side-panel {
		display: flex;
		flex-direction: column;
	}

	.detail-box h3 {
		margin: 0 0 15px 0;
		color: #2d3748;
		font-size: 1.6rem;
	}

	.full-desc {
		color: #4a5568;
		font-size: 1.4rem;
		background: #f7fafc;
		padding: 15px;
		border-radius: 8px;
		border: 1px solid #edf2f7;
		line-height: 1.6;
		margin-bottom: 20px;
		word-break: break-word;
	}

	.stats {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 15px;
		margin-bottom: 15px;
		padding: 12px;
		background: #f7fafc;
		border-radius: 8px;
	}

	.stat {
		display: flex;
		flex-direction: column;
	}

	.stat .label {
		font-size: 1.2rem;
		color: #a0aec0;
		text-transform: uppercase;
		font-weight: 600;
		margin-bottom: 2px;
	}

	.stat .val {
		font-weight: bold;
		color: #2d3748;
		font-size: 1.2rem;
	}

	.text-capitalize {
		text-transform: capitalize;
	}

	.placeholder-box {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		min-height: 200px;
		color: #718096;
		font-style: italic;
		border: 2px dashed #e2e8f0;
		background: #fafafa;
		box-shadow: none;
	}

	.btn-delete {
		padding: 6px 12px;
		border: 1px solid #e53e3e;
		color: #e53e3e;
		background: white;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.85rem;
		transition: all 0.2s;
	}

	.btn-delete:hover {
		background: #fff5f5;
	}

	.btn-cancel {
		width: 100%;
		padding: 10px 20px;
		background: #edf2f7;
		color: #4a5568;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-weight: bold;
		font-size: 1.4rem;
		margin-top: 10px;
		transition: background 0.2s;
	}

	.btn-cancel:hover {
		background: #e2e8f0;
	}
</style>
