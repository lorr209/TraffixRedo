<script setup>
	import { onBeforeMount, ref, computed } from "vue";
	import AppLayout from "../../components/AppLayout.vue";
	import ModulesView from "../../modules/ModulesView.vue";
	import PrizesView from "../../modules/PrizesView.vue";
	import MapView from "../.././modules/MapView.vue";
	import ManageModulesView from "../../modules/ManageModulesView.vue";
	/*import RolesView from "../../modules/RolesView.vue";
	import UsersView from "../../modules/UsersView.vue";
	import TrafficStatsView from "../../modules/TrafficStatsView.vue";
	import LogsView from "../../modules/LogsView.vue";*/
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
		<!--TODO: totale -->
		<ManageModulesView v-else-if="current === 'ManageModulesView'" />
		<!--TODO: totale -->
		<!-- <RolesView v-else-if="current === 'RolesView'" /> -->
		<!--TODO: totale -->
		<!-- <UsersView v-else-if="current === 'UsersView'" /> -->
		<!--TODO: totale -->
		<!-- <TrafficStatsView v-else-if="current === 'TrafficStatsView'" /> -->
		<!--TODO: totale -->
		<!-- <LogsView v-else-if="current === 'LogsView'" /> -->
		<!--TODO: totale -->
		<!-- Whatever the hell is Visualizzazione traffico se c'è già la mappa-->
		<ComplaintsView v-else-if="current === 'ComplaintsView'" />
		<!--TODO: totale -->
	</AppLayout>
</template>
