<script setup>
	import { ref, computed, onMounted } from "vue";

	const prizes = ref([]);

	const editPrize = ref({
		id: null,
		nome: "",
		descrizione: "",
		costo: 0,
		attivo: true,
		termina: "",
	});

	onMounted(async () => {
		const response = await fetch("/api/prizes", {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		});
		premi.value = response.json();
	});
	/*
	const salvaPremio = async () => {
		if (premioEdit.value.id) {
			// API: PUT /api/premi/id
			const index = premi.value.findIndex((p) => p.id === premioEdit.value.id);
			premi.value[index] = { ...premioEdit.value };
		} else {
			// API: POST /api/premi
			const nuovo = { ...premioEdit.value, id: Date.now() };
			premi.value.push(nuovo);
		}
		chiudiModale();
	};

	const eliminaPremio = (id) => {
		if (confirm("Sei sicuro di voler eliminare questo premio?")) {
			premi.value = premi.value.filter((p) => p.id !== id);
		}
	};

	// --- GESTIONE UI ---
	const apriModale = (premio = null) => {
		if (premio) {
			premioEdit.value = { ...premio };
		} else {
			premioEdit.value = {
				id: null,
				nome: "",
				descrizione: "",
				costo: 0,
				attivo: true,
				durataGiorni: 30,
			};
		}
		mostraModale.value = true;
	};

	const chiudiModale = () => {
		mostraModale.value = false;
	};
*/
</script>

<template>
	<div class="prizes-page">
		<!--
		<header class="prizes-header">
			<div>
				<h1>🎁 Gestione Catalogo Premi</h1>
				<p>Configura i premi riscattabili e la loro validità.</p>
			</div>
			<button @click="apriModale()" class="btn-primary">
				+ Aggiungi Nuovo Premio
			</button>
		</header> -->

		<div class="prizes-grid">
			<div
				v-for="p in prizes"
				:key="p.self"
				class="prize-card"
				:class="{ inactive: !p.attivo }"
			>
				<div class="status-badge" :class="p.attivo ? 'active' : 'off'">
					{{ p.attivo ? "Attivo" : "Non Attivo" }}
				</div>

				<div class="prize-info">
					<h3>{{ p.nome }}</h3>
					<p class="desc">{{ p.descrizione }}</p>
					<div class="stats">
						<div class="stat">
							<span class="label">Costo</span>
							<span class="val">{{ p.costo }} pt</span>
						</div>
						<!-- 			<div class="stat">
							<span class="label">Validità</span>
							<span class="val">{{ p.durataGiorni }} gg</span>
						</div> -->
					</div>
				</div>

				<!-- 	<div class="prize-actions">
					<button @click="apriModale(p)" class="btn-edit">Modifica</button>
					<button @click="eliminaPremio(p.id)" class="btn-delete">
						Elimina
					</button>
				</div> -->
			</div>
		</div>
		<!-- 

		<div v-if="mostraModale" class="modal-overlay">
			<div class="modal-content">
				<h2>{{ premioEdit.id ? "Modifica Premio" : "Nuovo Premio" }}</h2>

				<div class="form-group">
					<label>Nome Premio</label>
					<input
						v-model="premioEdit.nome"
						placeholder="es: Sconto Carsharing"
					/>
				</div>

				<div class="form-group">
					<label>Descrizione</label>
					<textarea v-model="premioEdit.descrizione" rows="3"></textarea>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label>Costo (Punti)</label>
						<input type="number" v-model.number="premioEdit.costo" />
					</div>
					<div class="form-group">
						<label>Durata (Giorni dalla riscossione)</label>
						<input type="number" v-model.number="premioEdit.durataGiorni" />
					</div>
				</div>

				<div class="form-group check">
					<input type="checkbox" v-model="premioEdit.attivo" id="attivo" />
					<label for="attivo">Rendi il premio disponibile subito</label>
				</div>

				<div class="modal-actions">
					<button @click="chiudiModale" class="btn-cancel">Annulla</button>
					<button @click="salvaPremio" class="btn-save">Salva Premio</button>
				</div> -->
		<!-- 			</div>
		</div> -->
	</div>
</template>
<style scoped>
	.prizes-page {
		padding: 30px;
		background: #f8f9fa;
		min-height: 100vh;
	}
	.prizes-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30px;
	}

	.prizes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 20px;
	}

	/* Prize Card */
	.prize-card {
		background: white;
		border-radius: 15px;
		padding: 20px;
		position: relative;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
		display: flex;
		flex-direction: column;
		transition: transform 0.2s;
	}
	.prize-card:hover {
		transform: translateY(-5px);
	}
	.prize-card.inactive {
		opacity: 0.7;
		border: 1px dashed #ccc;
	}

	.status-badge {
		position: absolute;
		top: 15px;
		right: 15px;
		font-size: 0.7rem;
		padding: 4px 10px;
		border-radius: 20px;
		font-weight: bold;
	}
	.status-badge.active {
		background: #e6fffa;
		color: #2d3748;
	}
	.status-badge.off {
		background: #fff5f5;
		color: #c53030;
	}

	.prize-info h3 {
		margin: 0 0 10px 0;
		color: #2d3748;
	}
	.desc {
		color: #718096;
		font-size: 0.9rem;
		margin-bottom: 20px;
		height: 40px;
		overflow: hidden;
	}

	.stats {
		display: flex;
		gap: 20px;
		margin-bottom: 20px;
		padding: 10px;
		background: #f7fafc;
		border-radius: 8px;
	}
	.stat {
		display: flex;
		flex-direction: column;
	}
	.stat .label {
		font-size: 0.7rem;
		color: #a0aec0;
		text-transform: uppercase;
	}
	.stat .val {
		font-weight: bold;
		color: #2d3748;
	}

	.prize-actions {
		display: flex;
		gap: 10px;
		margin-top: auto;
	}
	.btn-edit {
		flex: 1;
		padding: 8px;
		border: 1px solid #3182ce;
		color: #3182ce;
		background: white;
		border-radius: 6px;
		cursor: pointer;
	}
	.btn-delete {
		padding: 8px;
		border: 1px solid #e53e3e;
		color: #e53e3e;
		background: white;
		border-radius: 6px;
		cursor: pointer;
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}
	.modal-content {
		background: white;
		padding: 30px;
		border-radius: 15px;
		width: 500px;
		max-width: 90%;
	}
	.form-group {
		margin-bottom: 15px;
	}
	.form-group label {
		display: block;
		font-size: 0.9rem;
		margin-bottom: 5px;
		font-weight: bold;
	}
	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 10px;
		border: 1px solid #ddd;
		border-radius: 6px;
	}
	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 15px;
	}
	.form-group.check {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.form-group.check input {
		width: auto;
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		margin-top: 20px;
	}
	.btn-save {
		background: #3182ce;
		color: white;
		border: none;
		padding: 10px 20px;
		border-radius: 6px;
		cursor: pointer;
	}
	.btn-cancel {
		background: #edf2f7;
		color: #4a5568;
		border: none;
		padding: 10px 20px;
		border-radius: 6px;
		cursor: pointer;
	}
	.btn-primary {
		background: #3182ce;
		color: white;
		border: none;
		padding: 12px 20px;
		border-radius: 8px;
		font-weight: bold;
		cursor: pointer;
	}
</style>
