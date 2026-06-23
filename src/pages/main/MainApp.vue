<script setup>
	import { onBeforeMount, ref, computed } from "vue";
	import AppLayout from "../../components/AppLayout.vue";
	import ModulesView from "../../modules/ModulesView.vue";
	import PrizesView from "../../modules/PrizesView.vue";
	import MapView from "../.././modules/MapView.vue";
	import ManageModulesView from "../../modules/ManageModulesView.vue";
	import RolesView from "../../modules/RolesView.vue";
	import UsersView from "../../modules/UsersView.vue";
	import TrafficStatsView from "../../modules/TrafficStatsView.vue";
	import LogsView from "../../modules/LogsView.vue";
	import ComplaintsView from "../../modules/ComplaintsView.vue";

	const current = ref("ModulesView");

	const changeView = (viewName) => {
		current.value = viewName;
	};
</script>

<template>
	<AppLayout v-slot="{ modules }" @change-view="changeView">
		<ModulesView
			v-if="current === 'ModulesView'"
			:modules="modules"
			@change-view="changeView"
		/>
		<PrizesView v-else-if="current === 'PrizesView'" />
		<!--TODO: parte -->
		<MapView v-else-if="current === 'MapView'" />
		
		<ManageModulesView v-else-if="current === 'ManageModulesView'" />
		<!--TODO: totale -->
		<RolesView v-else-if="current === 'RolesView'" />
		
		<UsersView v-else-if="current === 'UsersView'" />

		<TrafficStatsView v-else-if="current === 'TrafficStatsView'" />
		
		<LogsView v-else-if="current === 'LogsView'" />
		
		<ComplaintsView v-else-if="current === 'ComplaintsView'" />
		
	</AppLayout>
</template>
