<script setup>
	import { ref, watch } from "vue";

	const call = ref("");
	const result = ref("");

	//const token = window.localStorage.getItem("user_token");

	/**
	 * Per passare il token o mettiamo nell'header x-access-token, possibile farlo nella fetch con
	 *  const response = await fetch("*api*", {
	 *  method: "GET",
	 *  headers: {
	 *    "x-access-token": localStorage.getItem("userToken"), Se c'è
	 *    "Content-Type": "application/json"
	 *  }
	 *  });
	 *
	 *  oppure come parametro di query ?token=TOKEN
	 */
	watch(call, async (newValue) => {
		fetch(call.value, {
			headers: {
				"Content-Type": "application/json",
			},
		})
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
