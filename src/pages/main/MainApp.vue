<script setup>
	import { onBeforeMount, ref, computed } from "vue";
	import AppLayout from "../../components/AppLayout.vue";
	import ModulesView from "../../modules/ModulesView.vue";
	import PrizesView from "../../modules/PrizesView.vue";
	import MapView from "../.././modules/MapView.vue";
	const current = ref("ModulesView");

	const changeView = (viewName) => {
		current.value = viewName;
	};
</script>

<template>
	<AppLayout v-slot="{ modules }">
		<ModulesView
			v-if="current === 'ModulesView'"
			:modules="modules"
			@change-view="changeView"
		/>
		<PrizesView v-else-if="current === 'PrizesView'" />
		<MapView v-else-if="current === 'MapView'" />
	</AppLayout>
</template>
