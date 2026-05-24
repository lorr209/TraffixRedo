<script setup>
	import Footer from "../components/Footer.vue";

	defineProps({
		modules: {
			type: Array,
			default: [],
		},
	});

	const emit = defineEmits(["change-view"]);
</script>

<template>
	<main>
		<div class="modules">
			<div
				class="body-modules h3"
				v-for="module in modules"
				:key="module.self"
				@click.prevent="emit('change-view', module.percorso)"
			>
				{{ module.nome }}
			</div>
		</div>
	</main>
	<Footer />
</template>
<style scoped>
	/* ========== MAIN BODY ========== */

	.modules {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(30rem, 1fr));
		gap: 1.6rem;
		padding: 1.6rem;
		grid-auto-rows: 15rem;
		grid-auto-flow: dense;
		overflow-y: auto;
		scrollbar-width: none;
	}

	.body-modules {
		transition: transform 0.2s ease-in-out;
		transform-origin: center center;
		color: black;
		background: whitesmoke;
		border: 0.3rem solid;
		border-color: var(--orange-300);
		padding: 1.6rem;
		min-height: 15rem;
		box-shadow: 0 0.2rem 0.6rem rgba(0 0 0 / 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow-y: auto;
		zoom: 1;
		border-radius: 1rem;
		cursor: pointer;
	}

	/* classi utili per dimensioni diverse */
	.w2 {
		grid-column: span 2;
	} /* occupa 2 colonne */
	.w3 {
		grid-column: span 3;
	} /* occupa 3 colonne */
	.h2 {
		grid-row: span 2;
	} /* occupa 2 righe (alte) */
	.h3 {
		grid-row: span 3;
	} /* occupa 3 righe (molto alte) */

	.list-view .h2 {
		min-height: 35rem;
	}
	.list-view .h3 {
		min-height: 65rem;
	}

	/* ========== MODALITÀ VISUALIZZAZIONE LISTA ========== */
	.list-view {
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		scrollbar-width: none;
	}

	.list-view .body-modules {
		width: 100%;
	}
</style>
