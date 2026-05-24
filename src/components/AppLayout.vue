<script setup>
	import { onBeforeMount, ref, computed } from "vue";
	import Header from "./Header.vue";
	import Sidebar from "./Sidebar.vue";
	import Footer from "./Footer.vue";

	const isSidebarOpen = ref(false);
	const user = ref(null);
	const modules = ref([]);

	onBeforeMount(async () => {
		const [userRes, modulesRes] = await Promise.all([
			fetch("/api/users/me", {
				method: "GET",
				headers: { "Content-Type": "application/json" },
			}),
			fetch("/api/modules", {
				method: "GET",
				headers: { "Content-Type": "application/json" },
			}),
		]);

		user.value = await userRes.json();
		modules.value = await modulesRes.json();
	});

	const userModules = computed(() => {
		if (!user.value) {
			return [];
		}

		return modules.value.filter((module) => {
			return user.value.moduli.some(
				(id) => module.self === `/api/modules/${id}`,
			);
		});
	});
</script>

<template>
	<Header :user="user" @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
	<Sidebar
		:modules="userModules"
		:isOpen="isSidebarOpen"
		@close-sidebar="isSidebarOpen = false"
	/>
	<slot :modules="userModules"></slot>
</template>
