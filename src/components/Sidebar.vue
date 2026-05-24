<script setup>
	defineProps({
		isOpen: {
			type: Boolean,
			default: false,
		},
		modules: {
			type: Array,
			default: [],
		},
	});

	const emit = defineEmits(["close-sidebar", "change-view"]);
</script>

<template>
	<div class="overlay" :class="{ 'overlay-visible': isOpen }"></div>

	<aside class="sidebar" :class="{ open: isOpen }">
		<div class="sidebar-top">
			<h1 class="traffix">TRAFFIX</h1>
			<button id="close-sidebar-button" @click="emit('close-sidebar')">
				✕
			</button>
		</div>

		<nav class="sidebar-middle">
			<ul>
				<li @click.prevent="emit('change-view', 'ModulesView')">Homepage</li>
				<li
					v-for="module in modules"
					:key="module.self"
					@click.prevent="emit('change-view', module.percorso)"
				>
					{{ module.nome }}
				</li>
			</ul>
		</nav>

		<!--TODO ------------->
		<div class="sidebar-bottom">
			<div class="user"></div>
			<div class="home-button"></div>
			<div class="settings"></div>
		</div>
		<!--TODO ------------->
	</aside>
</template>

<style scoped>
	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: black;
		opacity: 0;
		z-index: 900;
		transition: opacity 450ms;
		pointer-events: none;
	}
	.overlay-visible {
		opacity: 0.5;
		pointer-events: auto;
	}

	aside {
		position: fixed;
		top: 0;
		left: -30rem;
		width: 30rem;
		height: 100%;
		background: var(--dark-blue-500);
		color: white;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		transition: left 0.3s ease;
		z-index: 1001;

		border-right: 0.2rem solid teal;
	}

	.sidebar.open {
		left: 0;
	}

	.sidebar-top,
	.sidebar-middle,
	.sidebar-bottom {
		padding: 1rem;
		padding-top: 3rem;
	}

	.sidebar-top {
		border-bottom: 0.1rem solid teal;
		margin-top: 0.8rem;
		padding-top: 0;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}

	nav > ul {
		overflow-y: auto;
		flex-grow: 1;
		scrollbar-width: none;
	}

	nav > ul li {
		background: var(--dark-blue-100);
		padding: 1.3rem;
		margin-bottom: 0.8rem;
		border-radius: 0.8rem;
		cursor: pointer;
	}

	.sidebar-bottom {
		border-top: 0.1rem solid teal;
		margin-bottom: 0.8rem;
	}

	.sidebar-bottom .user {
		margin-bottom: 1.6rem;
	}

	#close-sidebar-button {
		background: none;
		border: none;
		color: white;
		font-size: 2.4rem;
		cursor: pointer;
	}

	.sidebar-top .traffix {
		font-size: 2.4rem;
	}
</style>
