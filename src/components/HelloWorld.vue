<script setup>
	import { ref, watch } from "vue";

	const call = ref("");
	const result = ref("");

	watch(call, async (newValue) => {
		fetch(call.value)
			.then((r) => r.json())
			.then((data) => {
				console.log(data);
				result.value = data;
			});
	});
</script>

<template>
	<div class="card">
		<input v-model="call" placeholder="Type here" />
		<p id="Called">{{ call }}</p>
		<p id="Result">{{ result }}</p>
	</div>
</template>
