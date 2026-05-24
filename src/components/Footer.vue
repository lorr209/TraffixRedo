<template>
	<footer class="view-options">
		<div>
			<span>Visualizzazione: </span>
			<button id="grid-view-btn">Griglia</button>
			<button id="list-view-btn">Lista</button>
		</div>

		<div class="zoom-controls">
			<span>Zoom: </span>
			<button id="zoom-out">-</button>
			<input
				type="range"
				id="zoom-range"
				min="0.5"
				max="2"
				step="0.1"
				value="1"
			/>
			<button id="zoom-in">+</button>
			<span id="zoom-value">100%</span>
		</div>
	</footer>
</template>

<style scoped>
	/* ========== FOOTER (MODULES OPTIONS) ========== */
	footer {
		position: sticky;
		background: var(--dark-blue-500);
		color: white;
		padding: 0.8rem 1.6rem;
		width: 100%;
		height: 5rem;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: 1.6rem;
	}

	footer div {
		display: flex;
		flex-direction: row;
		gap: 1.2rem;
		align-items: center;
	}

	footer button {
		background: var(--dark-blue-100);
		border: none;
		color: white;
		padding: 0.8rem;
		border-radius: 0.8rem;
	}

	.zoom-controls {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		padding: 0.8rem 1.6rem;
		font-family: sans-serif;
	}

	#zoom-range {
		flex: 1;
		accent-color: var(--dark-blue-100);
	}

	.zoom-controls button {
		width: 3rem;
		height: 3rem;
	}
</style>
