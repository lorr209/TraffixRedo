<script setup>
	import { ref, defineAsyncComponent } from "vue";

	const props = defineProps({
		modules: {
			type: Array,
			default: () => [],
		},
	});

	const emit = defineEmits(["change-view"]);

	const mappaComponentiAsync = {
		MapView: defineAsyncComponent(() => import("./MapView.vue")),
		PrizesView: defineAsyncComponent(() => import("./PrizesView.vue")),
		ManageModulesView: defineAsyncComponent(
			() => import("./ManageModulesView.vue"),
		),
		RolesView: defineAsyncComponent(() => import("./RolesView.vue")),
		UsersView: defineAsyncComponent(() => import("./UsersView.vue")),
		TrafficStatsView: defineAsyncComponent(
			() => import("./TrafficStatsView.vue"),
		),
		LogsView: defineAsyncComponent(() => import("./LogsView.vue")),
		ComplaintsView: defineAsyncComponent(() => import("./ComplaintsView.vue")),
	};

	const getComponenteReale = (nomeVista) => {
		return mappaComponentiAsync[nomeVista] || null;
	};

	const viewMode = ref("grid");
	const setView = (mode) => {
		viewMode.value = mode;
	};

	const handleModuleClick = (module) => {
		if (!module.attivo) return;

		emit("change-view", module.percorso);
	};
</script>

<template>
	<main class="dashboard-wrapper">
		<header class="dashboard-header">
			<div class="header-titles">
				<h2>Dashboard Moduli</h2>
				<p>Seleziona un modulo per accedervi.</p>
			</div>
			<div class="view-toggles">
				<button
					@click="setView('grid')"
					:class="{ active: viewMode === 'grid' }"
				>
					⊞ Griglia
				</button>
				<button
					@click="setView('list')"
					:class="{ active: viewMode === 'list' }"
				>
					☷ Lista
				</button>
			</div>
		</header>

		<div
			class="modules"
			:class="viewMode === 'list' ? 'list-view' : 'grid-view'"
		>
			<div
				class="module-card"
				v-for="module in modules"
				:key="module.self"
				:class="{
					'is-disabled': !module.attivo,
				}"
				@click.prevent="handleModuleClick(module)"
			>
				<div class="card-header">
					<div
						class="status-dot"
						:class="module.attivo ? 'active' : 'inactive'"
					></div>
					<span class="status-text">{{ module.nome }}</span>
				</div>

				<div class="card-body">
					<div class="preview-container">
						<div
							v-if="module.attivo && getComponenteReale(module.percorso)"
							class="live-preview-wrapper"
						>
							<component
								:is="getComponenteReale(module.percorso)"
								class="live-component"
							/>
						</div>
						<div v-else class="disabled-placeholder">
							{{
								module.attivo
									? "Anteprima non disponibile"
									: "🔒 Modulo Non Disponibile"
							}}
						</div>
					</div>
				</div>

				<div class="card-footer">
					<p class="module-desc">{{ module.descrizione }}</p>
					<code class="path-badge">{{ module.percorso }}</code>
				</div>
			</div>
		</div>
	</main>
</template>

<style scoped>
	.dashboard-wrapper {
		background: #f8f9fa;
		min-height: 100vh;
		padding: 10px 20px;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		position: relative;
		overflow-x: hidden;
		overflow-y: scroll;
	}

	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-bottom: 15px;
		padding-bottom: 10px;
		border-bottom: 1px solid #edf2f7;
	}
	.header-titles h2 {
		margin: 0;
		color: #1a202c;
		font-size: 1.6rem;
		line-height: 1;
	}
	.header-titles p {
		margin: 4px 0 0 0;
		color: #718096;
		font-size: 1.4rem;
	}

	.view-toggles {
		display: flex;
		gap: 8px;
	}
	.view-toggles button {
		padding: 4px 10px;
		border: 1px solid #cbd5e0;
		background: white;
		border-radius: 6px;
		cursor: pointer;
		font-size: 1.4rem;
		font-weight: 600;
		color: #4a5568;
	}
	.view-toggles button.active {
		background: #3182ce;
		color: white;
		border-color: #3182ce;
	}

	.modules {
		display: grid;
		gap: 1.2rem;
	}

	.grid-view {
		grid-template-columns: repeat(auto-fit, minmax(42rem, 1fr));
	}

	.list-view {
		grid-template-columns: 1fr;
	}

	.module-card {
		background: white;
		border: 1px solid #edf2f7;
		border-radius: 12px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.04);
		cursor: pointer;
		position: relative;
		z-index: 1;
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
	}

	.module-card:hover:not(.is-disabled) {
		transform: translateY(-4px);
		box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
		border-color: #cbd5e0;
	}

	.module-card.is-disabled {
		cursor: not-allowed;
		background: #f7fafc;
		opacity: 0.75;
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 0.8rem;
	}
	.status-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
	}
	.status-dot.active {
		background: #48bb78;
	}
	.status-dot.inactive {
		background: #e53e3e;
	}
	.status-text {
		font-size: 1.6rem;
		font-weight: 700;
		color: #2d3748;
	}

	.card-body {
		flex: 1;
		margin-bottom: 0.5rem;
	}

	.preview-container {
		width: 100%;
		height: 350px;
		overflow: hidden;
		border-radius: 8px;
		background: #f7fafc;
		border: 1px solid #e2e8f0;
		position: relative;
	}

	.live-preview-wrapper {
		position: absolute;
		top: 0;
		left: 0;
		width: 219.78%;
		height: 219.78%;
		transform: scale(0.455);
		transform-origin: top left;
		pointer-events: none;
		contain: strict;
	}

	.live-component {
		width: 100%;
		height: 100%;
		background: white;
	}

	.disabled-placeholder {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.6rem;
		color: #a0aec0;
		font-style: italic;
	}

	.card-footer {
		display: flex;
		flex-direction: column;
		gap: 8px;
		border-top: 1px solid #edf2f7;
		padding-top: 0.8rem;
	}
	.module-desc {
		margin: 0;
		font-size: 1.4rem;
		color: #4a5568;
		line-height: 1.4;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.path-badge {
		background: #edf2f7;
		color: #4a5568;
		padding: 3px 6px;
		border-radius: 4px;
		font-size: 1.4rem;
		font-family: monospace;
		align-self: flex-start;
	}

	.list-view .preview-container {
		display: none;
	}
	.list-view .module-card {
		padding: 1rem;
		flex-direction: row;
		align-items: center;
		gap: 1rem;
	}
	.list-view .card-header {
		margin: 0;
		width: 250px;
	}
	.list-view .card-body {
		margin: 0;
		flex: none;
	}
	.list-view .card-footer {
		border: none;
		padding: 0;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		flex: 1;
	}
	.list-view .module-desc {
		white-space: normal;
	}
</style>
