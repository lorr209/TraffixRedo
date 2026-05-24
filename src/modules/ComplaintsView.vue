<script setup>
	import { ref, computed, onBeforeMount } from "vue";

	const complaints = ref([]);

	const filtroTesto = ref("");
	const filtroTag = ref("");
	const segnalazioneSelezionata = ref(null);

	onBeforeMount(async () => {
		const response = await fetch("/api/complaints", {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		});
		complaints.value = await response.json();
	});

	/*
	// --- FILTRAGGIO ---
	const segnalazioniFiltrate = computed(() => {
		return segnalazioni.value.filter((s) => {
			const matchTesto = s.descrizione
				.toLowerCase()
				.includes(filtroTesto.value.toLowerCase());
			const matchTag =
				filtroTag.value === "" || s.tags.includes(filtroTag.value);
			return matchTesto && matchTag;
		});
	});

	const generaLinkMaps = (lat, lon) =>
		`https://www.google.com/maps?q=${lat},${lon}`;*/
</script>
<template>
	<main class="admin-container">
		<!-- 
		<header class="page-header">
			<h1>🚩 Gestione Segnalazioni e Problematiche</h1>
		</header> -->

		<div class="main-grid">
			<section class="panel list-panel">
				<div class="panel-header">
					<h2>Elenco Segnalazioni</h2>
					<div class="filters">
						<input
							v-model="filtroTesto"
							placeholder="Cerca nella descrizione..."
							class="search-input"
						/>
						<select v-model="filtroTag">
							<option value="">Tutti i Tag</option>
							<option
								v-for="t in tagsDisponibili"
								:key="t.nome"
								:value="t.nome"
							>
								{{ t.nome }}
							</option>
						</select>
					</div>
				</div>

				<table class="data-table">
					<thead>
						<tr>
							<th>ID</th>
							<th>Descrizione Anteprima</th>
							<th>Tag</th>
							<th>Posizione</th>
							<th>Azioni</th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="s in segnalazioniFiltrate"
							:key="s.id"
							@click="segnalazioneSelezionata = s"
							:class="{ 'selected-row': segnalazioneSelezionata?.id === s.id }"
						>
							<td>#{{ s.id }}</td>
							<td class="truncate">{{ s.descrizione }}</td>
							<td>
								<span v-for="tag in s.tags" :key="tag" class="tag-pill">{{
									tag
								}}</span>
							</td>
							<td>
								<a
									v-if="s.lat"
									:href="generaLinkMaps(s.lat, s.lon)"
									target="_blank"
									@click.stop
									>📍 Apri Maps</a
								>
								<span v-else class="no-pos">N/D</span>
							</td>
							<td>
								<button
									@click.stop="rimuoviSegnalazione(s.id)"
									class="btn-danger"
								>
									Elimina
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</section>

			<aside class="side-panel">
				<div v-if="segnalazioneSelezionata" class="detail-box">
					<h3>Dettaglio Segnalazione #{{ segnalazioneSelezionata.id }}</h3>
					<p class="full-desc">{{ segnalazioneSelezionata.descrizione }}</p>
					<div class="meta">
						<strong>Coordinate:</strong>
						{{ segnalazioneSelezionata.lat || "Assenti" }},
						{{ segnalazioneSelezionata.lon || "Assenti" }}
					</div>
					<button @click="segnalazioneSelezionata = null" class="btn-secondary">
						Chiudi Dettaglio
					</button>
				</div>

				<div class="tags-manager">
					<h3>Configurazione Tag</h3>
					<div class="add-tag-form">
						<input v-model="nuovoTag.nome" placeholder="Nome Tag" />
						<input v-model="nuovoTag.descrizione" placeholder="Descrizione" />
						<button @click="aggiungiTag" class="btn-success">Aggiungi</button>
					</div>

					<table class="tag-table">
						<thead>
							<tr>
								<th>Tag</th>
								<th>Descrizione</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="t in tagsDisponibili" :key="t.nome">
								<td>
									<strong>{{ t.nome }}</strong>
								</td>
								<td>{{ t.descrizione }}</td>
								<td>
									<button @click="rimuoviTag(t.nome)" class="btn-text">
										×
									</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</aside>
		</div>
	</main>
</template>
