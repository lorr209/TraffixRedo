<script setup>
	import { ref, onBeforeMount } from "vue";

	const logs = ref([]);
	const activeColIndex = ref(null);

	onBeforeMount(async () => {
		try {
			const response = await fetch("/api/logs", {
				method: "GET",
				headers: { "Content-Type": "application/json" },
			});

			const contentType = response.headers.get("content-type");
			if (contentType && contentType.includes("text/html")) {
				console.error(
					"ERRORE CRITICO PROXY: L'API sta ritornando una pagina HTML invece del JSON dei log! Verifica il file vite.config.js",
				);
				return;
			}

			if (response.ok) {
				const data = await response.json();
				console.log("Dati grezzi ricevuti dall'API logs:", data);

				if (Array.isArray(data)) {
					logs.value = data;
				} else if (data && Array.isArray(data.logs)) {
					logs.value = data.logs;
				} else if (data && Array.isArray(data.data)) {
					logs.value = data.data;
				} else {
					console.error(
						"Il backend ha risposto correttamente ma il formato non è un array riconosciuto:",
						data,
					);
				}
			} else {
				console.error(
					"Il server ha risposto con un errore. Stato:",
					response.status,
				);
			}
		} catch (error) {
			console.error(
				"Errore di rete o crash durante il parsing del JSON:",
				error,
			);
		}
	});

	const handleMouseOver = (index) => {
		activeColIndex.value = index;
	};

	const formattaData = (dataString) => {
		if (!dataString) return "N/D";
		const d = new Date(dataString);
		if (isNaN(d.getTime())) return dataString;
		return d.toLocaleDateString("it-IT") + " " + d.toLocaleTimeString("it-IT");
	};
</script>

<template>
	<main class="logs-page">
		<div class="panel table-container">
			<div class="table-wrapper">
				<table @mouseleave="activeColIndex = null" class="data-table">
					<thead>
						<tr>
							<th :class="{ 'on-hover-th': activeColIndex === 0 }">
								ID Utente
							</th>
							<th :class="{ 'on-hover-th': activeColIndex === 1 }">
								Data e Ora
							</th>
						</tr>
					</thead>
					<tbody>
						<tr v-if="logs.length === 0">
							<td
								colspan="2"
								style="
									text-align: center;
									color: #a0aec0;
									font-style: italic;
									padding: 20px;
								"
							>
								Nessun log presente a database.
							</td>
						</tr>

						<tr
							v-else
							v-for="(log, index) in logs"
							:key="index"
							class="log-row"
						>
							<td
								@mouseover="handleMouseOver(0)"
								class="user-cell truncate"
								:class="{ 'on-hover-td': activeColIndex === 0 }"
							>
								{{ log.utente }}
							</td>
							<td
								@mouseover="handleMouseOver(1)"
								class="time-cell"
								:class="{ 'on-hover-td': activeColIndex === 1 }"
							>
								{{ formattaData(log.data) }}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</main>
</template>

<style scoped>
	.logs-page {
		padding: 30px;
		background: #f8f9fa;
		min-height: 100vh;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}

	.panel {
		background: white;
		border-radius: 15px;
		padding: 25px;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
	}

	.table-wrapper {
		max-height: 650px;
		overflow-y: auto;
		border-radius: 8px;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 1.4rem;
	}

	.data-table th {
		position: sticky;
		top: 0;
		background: white;
		padding: 16px;
		text-align: left;
		color: #718096;
		font-weight: 600;
		border-bottom: 2px solid #edf2f7;
		font-size: 1.6rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		z-index: 10;
		transition:
			background-color 0.2s,
			color 0.2s;
	}

	.data-table td {
		padding: 16px;
		color: #2d3748;
		border-bottom: 1px solid #edf2f7;
		vertical-align: middle;
		transition: background-color 0.15s;
	}

	.user-cell {
		font-weight: 600;
		color: #3182ce;
		font-family: monospace;
		font-size: 1.4rem;
	}

	.time-cell {
		color: #4a5568;
		font-weight: 500;
	}

	.truncate {
		max-width: 250px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.log-row:nth-child(even) {
		background-color: #fcfcfc;
	}

	.log-row:hover {
		background-color: #f7fafc;
	}

	.on-hover-th {
		background-color: #ebf8ff !important;
		color: #2b6cb0 !important;
	}

	.on-hover-td {
		background-color: #f0f4f8;
	}
</style>
