<script setup>
	import { ref, onBeforeMount, computed } from "vue";

	const trackingGPS = ref([]);
	const sensoriFissi = ref([]);
	const filtroTempo = ref("ora");

	const emissioneDefault = ref(12);
	const tipologieAggiuntive = ref([
		{ id: 1, nome: "Auto Tipo A", percentuale: 30, emissione: 9 },
		{ id: 2, nome: "Elettriche", percentuale: 10, emissione: 0 },
	]);

	const aggiungiTipologia = () => {
		tipologieAggiuntive.value.push({
			id: Date.now(),
			nome: "Nuova Categoria",
			percentuale: 0,
			emissione: 10,
		});
	};
	const rimuoviTipologia = (id) => {
		tipologieAggiuntive.value = tipologieAggiuntive.value.filter(
			(t) => t.id !== id,
		);
	};

	const percOccupata = computed(() =>
		tipologieAggiuntive.value.reduce(
			(acc, t) => acc + (Number(t.percentuale) || 0),
			0,
		),
	);
	const percRestanti = computed(() => Math.max(0, 100 - percOccupata.value));

	onBeforeMount(async () => {
		try {
			const [resDensities, resVehicles] = await Promise.all([
				fetch("/api/traffic/densities"),
				fetch("/api/traffic/vehicles"),
			]);

			if (resDensities.ok) sensoriFissi.value = await resDensities.json();
			if (resVehicles.ok) trackingGPS.value = await resVehicles.json();
		} catch (error) {
			console.error(
				"Errore nel caricamento dei dati delle statistiche:",
				error,
			);
		}
	});

	const trafficoMedio = computed(() => {
		if (!sensoriFissi.value.length) return 0;
		const totale = sensoriFissi.value.reduce(
			(acc, s) => acc + (s.quantità || 0),
			0,
		);
		return Math.round(totale / sensoriFissi.value.length);
	});

	const densitaMedia = computed(() => {
		return trackingGPS.value.length;
	});

	const fattoreInquinamentoMedio = computed(() => {
		const ponderataAggiuntivi = tipologieAggiuntive.value.reduce(
			(acc, t) =>
				acc + ((Number(t.percentuale) || 0) / 100) * (Number(t.emissione) || 0),
			0,
		);
		return (
			ponderataAggiuntivi + (percRestanti.value / 100) * emissioneDefault.value
		);
	});

	const inquinamentoStimato = computed(() => {
		const qtaTotale = sensoriFissi.value.reduce(
			(acc, s) => acc + (s.quantità || 0),
			0,
		);
		return Math.round(qtaTotale * fattoreInquinamentoMedio.value);
	});

	const getLocalTimeStr = (dateString) => {
		if (!dateString) return "";
		const s =
			typeof dateString === "string" && dateString.endsWith("Z")
				? dateString.slice(0, -1)
				: dateString;
		return new Date(s);
	};

	const elaboraDatiTemporali = (dati, granularita) => {
		const aggregati = {};
		dati.forEach((item) => {
			if (!item.data) return;
			const dateObj = getLocalTimeStr(item.data);
			if (isNaN(dateObj)) return;

			let chiave = "";
			const isoStr = new Date(
				dateObj.getTime() - dateObj.getTimezoneOffset() * 60000,
			).toISOString();

			if (granularita === "ora") {
				chiave = isoStr.substring(0, 13);
			} else {
				chiave = isoStr.substring(0, 10);
			}

			if (!aggregati[chiave])
				aggregati[chiave] = { totaleQta: 0, conteggio: 0 };
			aggregati[chiave].totaleQta += item.quantità || 1;
			aggregati[chiave].conteggio++;
		});

		return Object.keys(aggregati)
			.sort()
			.map((k) => ({
				label: k,
				valore: aggregati[k].totaleQta / aggregati[k].conteggio,
			}));
	};

	const datiGrafico = computed(() => {
		const datiAggregati = elaboraDatiTemporali(
			sensoriFissi.value,
			filtroTempo.value,
		);
		return {
			labels: datiAggregati.map((d) => d.label),
			datasets: [
				{ data: datiAggregati.map((d) => d.valore) },
				{
					data: datiAggregati.map(
						(d) => d.valore * fattoreInquinamentoMedio.value,
					),
				},
			],
		};
	});

	const altezzaMaxGrafico = 180;
	const maxTraffico = computed(() =>
		Math.max(
			...(datiGrafico.value.datasets[0].data.length
				? datiGrafico.value.datasets[0].data
				: [1]),
		),
	);
	const maxInquinamento = computed(() =>
		Math.max(
			...(datiGrafico.value.datasets[1].data.length
				? datiGrafico.value.datasets[1].data
				: [1]),
		),
	);

	const calcolaAltezzaBarra = (valore, massimo) => {
		return Math.max(5, (valore / massimo) * altezzaMaxGrafico);
	};

	const formattaDataGrafico = (chiave) => {
		if (filtroTempo.value === "ora") {
			const dt = new Date(chiave + ":00:00");
			return dt.toLocaleString("it-IT", {
				day: "2-digit",
				month: "2-digit",
				hour: "2-digit",
			});
		} else {
			const dt = new Date(chiave);
			return dt.toLocaleString("it-IT", { day: "2-digit", month: "2-digit" });
		}
	};
</script>

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
					<div class="footer-source">Sorgente: API /densities</div>
				</div>

				<div class="card">
					<div class="card-header">VEICOLI GPS RILEVATI</div>
					<div class="card-body">
						<span class="value">{{ densitaMedia }}</span>
						<span class="label">punti tracciamento</span>
					</div>
					<div class="footer-source">Sorgente: API /vehicles</div>
				</div>

				<div
					class="card card-wide"
					:class="{ alert: inquinamentoStimato > 1000 }"
				>
					<div class="card-header">INQUINAMENTO STIMATO (Trend)</div>
					<div class="card-body">
						<div class="inquinamento-overview">
							<span class="value">{{ inquinamentoStimato }}</span>
							<span class="label">U.I. Totali (Stima ponderata flotta)</span>
						</div>

						<div class="analytics-container">
							<div class="controls-top">
								<div class="selector">
									<span class="selector-label">Raggruppa:</span>
									<button
										@click="filtroTempo = 'ora'"
										:class="{ active: filtroTempo === 'ora' }"
										class="btn-toggle"
									>
										Orario
									</button>
									<button
										@click="filtroTempo = 'giorno'"
										:class="{ active: filtroTempo === 'giorno' }"
										class="btn-toggle"
									>
										Giornaliero
									</button>
								</div>
							</div>

							<div class="chart-box">
								<div class="visual-grid">
									<div
										v-for="(ponto, i) in datiGrafico.labels"
										:key="i"
										class="data-point"
									>
										<div
											class="bar-traffico"
											:style="{
												height:
													calcolaAltezzaBarra(
														datiGrafico.datasets[0].data[i],
														maxTraffico,
													) + 'px',
											}"
											:title="
												'Traffico: ' +
												Math.round(datiGrafico.datasets[0].data[i])
											"
										></div>
										<div
											class="bar-inquinamento"
											:style="{
												height:
													calcolaAltezzaBarra(
														datiGrafico.datasets[1].data[i],
														maxInquinamento,
													) + 'px',
											}"
											:title="
												'Inquinamento: ' +
												Math.round(datiGrafico.datasets[1].data[i])
											"
										></div>
										<span class="timestamp">{{
											formattaDataGrafico(ponto)
										}}</span>
									</div>
								</div>
								<div class="chart-legend">
									<div class="legend-item">
										<div class="color-box traffic-color"></div>
										Traffico Rilevato
									</div>
									<div class="legend-item">
										<div class="color-box pol-color"></div>
										Inquinamento Stimato
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<aside class="sidebar-panel panel control-panel">
			<div class="sidebar-header">
				<h3>Configurazione Flotta</h3>
				<button @click="aggiungiTipologia" class="btn-add">Aggiungi</button>
			</div>

			<div class="fleet-box scroll-area">
				<div
					v-for="(tipo, index) in tipologieAggiuntive"
					:key="tipo.id"
					class="fleet-item"
				>
					<div class="item-header">
						<input
							v-model="tipo.nome"
							class="t-name"
							placeholder="Nome veicolo"
						/>
						<button
							@click="rimuoviTipologia(tipo.id)"
							class="btn-delete"
							title="Rimuovi tipologia"
						>
							X
						</button>
					</div>
					<div class="t-inputs">
						<label
							>%
							<input
								type="number"
								v-model.number="tipo.percentuale"
								min="0"
								max="100"
						/></label>
						<label
							>CO₂ <input type="number" v-model.number="tipo.emissione" min="0"
						/></label>
					</div>
				</div>

				<div class="fleet-item default-item">
					<div class="restanti-label">
						Veicoli Restanti: <strong>{{ percRestanti }}%</strong>
					</div>
					<label class="co2-default">
						CO₂ Default
						<input type="number" v-model.number="emissioneDefault" min="0" />
					</label>
				</div>
			</div>

			<div class="progress-bar-container">
				<div
					class="progress-bar"
					:style="{ width: Math.min(percOccupata, 100) + '%' }"
					:class="{ 'over-limit': percOccupata > 100 }"
				></div>
				<div class="progress-text">
					Totale allocato: {{ percOccupata }}%
					<span v-if="percOccupata > 100" class="err-txt">(Errato)</span>
				</div>
			</div>
		</aside>
	</section>
</template>

<style scoped>
	.dashboard-layout {
		display: flex;
		gap: 20px;
		padding: 20px;
		background: #f8f9fa;
		min-height: 100vh;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		color: #2d3748;
	}

	.kpi-container {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	.kpi-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
		align-items: flex-start;
	}

	.card {
		flex: 1 1 calc(50% - 10px);
		background: white;
		border-radius: 15px;
		padding: 25px;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
		border: 1px solid #edf2f7;
		display: flex;
		flex-direction: column;
		border-top: 4px solid #3182ce;
	}
	.card-wide {
		flex: 1 1 100%;
		border-top-color: #ecc94b;
	}
	.card.alert {
		border-top-color: #f56565;
	}

	.card-header {
		font-size: 1.6rem;
		font-weight: 700;
		color: #4a5568;
		margin-bottom: 15px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	.card-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.value {
		font-size: 3rem;
		font-weight: 800;
		color: #1a202c;
		line-height: 1.1;
	}
	.label {
		font-size: 1.4rem;
		color: #718096;
		margin-top: 5px;
		font-weight: 500;
	}
	.inquinamento-overview {
		text-align: center;
		margin-bottom: 25px;
		padding-bottom: 15px;
		border-bottom: 1px solid #edf2f7;
	}

	.footer-source {
		font-size: 1.2rem;
		color: #a0aec0;
		margin-top: 20px;
		text-align: right;
		font-style: italic;
	}

	.sidebar-panel {
		width: 320px;
		padding: 20px;
		display: flex;
		flex-direction: column;
		background: white;
		border-radius: 15px;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
		border: 1px solid #edf2f7;
	}
	.sidebar-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15px;
	}
	.sidebar-panel h3 {
		font-size: 1.8rem;
		color: #1a202c;
		font-weight: 600;
		margin: 0;
	}
	.btn-add {
		background: #48bb78;
		color: white;
		border: none;
		padding: 5px 10px;
		border-radius: 6px;
		font-size: 1.4rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}
	.btn-add:hover {
		background: #38a169;
	}

	.fleet-box {
		flex: 1;
		overflow-y: auto;
		padding-right: 5px;
	}
	.fleet-item {
		background: #f7fafc;
		padding: 12px;
		border-radius: 8px;
		margin-bottom: 10px;
		border: 1px solid #e2e8f0;
	}
	.item-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
		gap: 10px;
	}
	.t-name {
		background: transparent;
		border: none;
		border-bottom: 2px solid #e2e8f0;
		color: #2d3748;
		width: 100%;
		font-weight: 600;
		font-size: 1.6rem;
		padding-bottom: 2px;
	}
	.t-name:focus {
		outline: none;
		border-color: #3182ce;
	}
	.btn-delete {
		background: transparent;
		border: none;
		cursor: pointer;
		font-size: 1.6rem;
		padding: 2px;
		opacity: 0.6;
		transition: opacity 0.2s;
	}
	.btn-delete:hover {
		opacity: 1;
		color: #f56565;
	}

	.t-inputs {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
		font-size: 1.4rem;
		color: #4a5568;
	}
	.t-inputs input,
	.co2-default input {
		width: 100%;
		background: white;
		border: 1px solid #cbd5e0;
		color: #2d3748;
		padding: 3px 6px;
		border-radius: 5px;
		margin-top: 2px;
	}

	.default-item {
		background: #ebf8ff;
		border-color: #bee3f8;
		color: #2b6cb0;
	}
	.restanti-label {
		font-size: 1.6rem;
		margin-bottom: 6px;
	}
	.co2-default {
		font-size: 1.4rem;
		display: block;
	}

	.progress-bar-container {
		height: 20px;
		background: #e2e8f0;
		border-radius: 10px;
		margin-top: 15px;
		position: relative;
		overflow: hidden;
		font-size: 1.4rem;
		line-height: 20px;
		text-align: center;
		color: #1a202c;
	}
	.progress-bar {
		height: 100%;
		background: #48bb78;
		transition: width 0.3s;
		position: absolute;
		left: 0;
		top: 0;
	}
	.progress-bar.over-limit {
		background: #f56565;
	}
	.progress-text {
		position: relative;
		z-index: 2;
		font-weight: 600;
		mix-blend-mode: hard-light;
	}
	.err-txt {
		color: #9b2c2c;
	}

	.analytics-container {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	.controls-top {
		margin-bottom: 20px;
	}
	.selector {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.selector-label {
		font-size: 1.6rem;
		font-weight: 600;
		color: #4a5568;
	}
	.btn-toggle {
		background: #f7fafc;
		border: 1px solid #e2e8f0;
		color: #718096;
		padding: 6px 14px;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1.4rem;
		font-weight: 600;
		transition: all 0.2s;
	}
	.btn-toggle:hover {
		background: #edf2f7;
	}
	.btn-toggle.active {
		background: #3182ce;
		color: white;
		border-color: #2b6cb0;
	}

	.chart-box {
		background: #f7fafc;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 20px 20px 40px 20px;
		overflow-x: auto;
	}
	.visual-grid {
		display: flex;
		align-items: flex-end;
		gap: 15px;
		height: 180px;
		padding-bottom: 20px;
		border-bottom: 1px solid #cbd5e0;
	}
	.data-point {
		display: flex;
		align-items: flex-end;
		gap: 4px;
		position: relative;
		min-width: 40px;
		justify-content: center;
		transition: transform 0.2s;
	}
	.data-point:hover {
		transform: translateY(-5px);
	}

	.bar-traffico {
		width: 14px;
		background: #3182ce;
		border-radius: 3px 3px 0 0;
		opacity: 0.85;
		transition: height 0.4s ease;
	}
	.bar-inquinamento {
		width: 14px;
		background: #f56565;
		border-radius: 3px 3px 0 0;
		opacity: 0.85;
		transition: height 0.4s ease;
	}

	.timestamp {
		position: absolute;
		bottom: -35px;
		font-size: 1.4rem;
		color: #718096;
		font-weight: 500;
		transform: rotate(-45deg);
		white-space: nowrap;
	}

	.chart-legend {
		display: flex;
		justify-content: center;
		gap: 20px;
		margin-top: 25px;
		font-size: 1.4rem;
		font-weight: 600;
		color: #4a5568;
	}
	.legend-item {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.color-box {
		width: 12px;
		height: 12px;
		border-radius: 3px;
	}
	.traffic-color {
		background: #3182ce;
	}
	.pol-color {
		background: #f56565;
	}
</style>
