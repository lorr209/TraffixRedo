<script setup>
	import { ref, onBeforeMount } from "vue";

	const moduli = ref([]);
	const selectedId = ref(null);
	const activeColIndex = ref(null);
	const barOpen = ref(false);
	const moduloInModifica = ref(null);

	onBeforeMount(async () => {
		const response = await fetch("/api/modules", {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		});
		prizes.value = await response.json();
	});

	const selezionaModulo = (m) => {
		selectedId.value = m.id;
		moduloInModifica.value = { ...m }; // Clonazione per editing sicuro
		barOpen.value = true;
	};

	const toggleStato = () => {
		moduloInModifica.value.stato =
			moduloInModifica.value.stato === "attivo" ? "disattivo" : "attivo";
	};

	const salvaModifiche = () => {
		const index = moduli.value.findIndex((m) => m.id === selectedId.value);
		moduli.value[index] = { ...moduloInModifica.value };
		barOpen.value = false;
		// Qui andrebbe: await fetch(`/api/moduli/${selectedId.value}`, { method: 'PUT', ... })
	};
</script>
<template>
	<main class="main-layout">
		<div class="table-container">
			<div class="table-wrapper">
				<table @mouseleave="activeColIndex = null">
					<thead>
						<tr>
							<th :class="{ 'on-hover': activeColIndex === 0 }">MODULO</th>
							<th :class="{ 'on-hover': activeColIndex === 1 }">DESCRIZIONE</th>
							<th :class="{ 'on-hover': activeColIndex === 2 }">STATO</th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="m in moduli"
							:key="m.id"
							:class="{ selected: selectedId === m.id }"
							@click="selezionaModulo(m)"
						>
							<td @mouseover="activeColIndex = 0">
								<strong>{{ m.nome }}</strong>
							</td>
							<td @mouseover="activeColIndex = 1">{{ m.descrizione }}</td>
							<td @mouseover="activeColIndex = 2">
								<span :class="['pallino', m.stato]"></span>
								{{ m.stato.charAt(0).toUpperCase() + m.stato.slice(1) }}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<aside v-if="barOpen" class="bar">
			<div class="bar-header">
				<h3>Impostazioni Modulo</h3>
				<button @click="barOpen = false" class="btn-close-x">✕</button>
			</div>

			<div class="bar-body" v-if="moduloInModifica">
				<div class="form-group">
					<label>Identificativo Modulo</label>
					<input
						:value="moduloInModifica.nome"
						disabled
						class="input-disabled"
					/>
				</div>

				<div class="form-group">
					<label>Descrizione Funzionale</label>
					<textarea v-model="moduloInModifica.descrizione" rows="5"></textarea>
				</div>

				<div class="form-group">
					<label>Stato Operativo</label>
					<button
						@click="toggleStato"
						:class="['btn-status', moduloInModifica.stato]"
					>
						{{
							moduloInModifica.stato === "attivo"
								? "DISATTIVA MODULO"
								: "ATTIVA MODULO"
						}}
					</button>
				</div>

				<div class="actions">
					<button @click="salvaModifiche" class="btn-save">
						Salva Configurazione
					</button>
				</div>
			</div>
		</aside>
	</main>
</template>
