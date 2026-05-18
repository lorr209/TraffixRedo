<script setup>
	import { ref } from "vue";

	const email = ref("");
	const password = ref("");
	const errorMessage = ref("");
	const isLoading = ref(false);

	const handleLogin = async () => {
		errorMessage.value = "";

		if (!email.value || !password.value) {
			errorMessage.value = "Please fill in all fields.";
			return;
		}

		isLoading.value = true;

		const response = await fetch("/auth/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: email.value,
				password: password.value,
			}),
		});

		const data = await response.json();

		if (data.success) {
			window.location.href = "/";
		} else {
			alert(data.message);
		}
	};
</script>

<template>
	<div>
		<h2>Login</h2>

		<div v-if="errorMessage" style="color: red">
			{{ errorMessage }}
		</div>

		<form @submit.prevent="handleLogin">
			<div>
				<label>Email:</label>
				<input type="email" v-model="email" :disabled="isLoading" />
			</div>

			<div>
				<label>Password:</label>
				<input type="password" v-model="password" :disabled="isLoading" />
			</div>

			<button type="submit" :disabled="isLoading">
				{{ isLoading ? "Logging in..." : "Submit" }}
			</button>
		</form>
	</div>
</template>
