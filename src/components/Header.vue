<script setup>
	import User from "./User.vue";

	const emit = defineEmits(["toggle-sidebar"]);

	defineProps({
		user: {
			type: Object,
			default: null,
		},
	});
</script>

<template>
	<header>
		<button id="open-sidebar-button" @click="emit('toggle-sidebar')">☰</button>

		<h1 class="traffix">TRAFFIX</h1>

		<User :user="user" />
	</header>
</template>

<style scoped>
	header {
		position: sticky;
		width: 100%;
		height: 6rem;
		background-color: var(--dark-blue-500);
		color: white;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 1.6rem;
		z-index: 1000;
	}

	.header-left,
	.header-center,
	.header-right {
		display: flex;
		align-items: center;
	}

	#open-sidebar-button {
		background: none;
		border: none;
		color: white;
		font-size: 2.4rem;
		cursor: pointer;
	}

	.header-center {
		flex: 1;
		justify-content: center;
		overflow-x: auto;
		scrollbar-width: none;
	}

	.header-center::-webkit-scrollbar {
		display: none;
	}

	.header-modules {
		background: var(--dark-blue-100);
		padding: 0.8rem 1.6rem;
		border-radius: 0.8rem;
		margin: 0 0.8rem;
		white-space: nowrap;
	}

	.header-right {
		justify-content: flex-end;
	}
</style>
