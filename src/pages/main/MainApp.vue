<script setup>
	import { onBeforeMount, ref } from "vue";
	import HeaderMain from "../../components/HeaderMain.vue";
	import SidebarMain from "../../components/SidebarMain.vue";

	const isSidebarOpen = ref(false);

	const toggleSidebar = () => {
		isSidebarOpen.value = !isSidebarOpen.value;
	};
</script>

<template>
	<HeaderMain @toggle-sidebar="toggleSidebar" />

	<SidebarMain :isOpen="isSidebarOpen" @close-sidebar="isSidebarOpen = false" />

	<main>
		<div class="modules">
			<div class="body-modules">Modulo 1</div>
			<div class="body-modules w2 h2">Modulo 2</div>
			<div class="body-modules h2">Modulo 3</div>
			<div class="body-modules">Modulo 4</div>
			<div class="body-modules w2 h3">Modulo 5</div>
			<div class="body-modules h3">Modulo 6</div>
		</div>
	</main>

	<footer class="view-options">
		<div>
			<span>Visualizzazione: </span>
			<button id="grid-view-btn">Griglia</button>
			<button id="list-view-btn">Lista</button>
		</div>

		<div class="zoom-controls">
			<span>Zoom: </span>
			<button id="zoom-out">−</button>
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
