<script setup>
	import { ref } from "vue";

	const email = ref("");
	const password = ref("");
	const errorMessage = ref("");

	const handleLogin = async () => {
		errorMessage.value = "";

		if (!email.value || !password.value) {
			errorMessage.value = "Please fill in all fields.";
			return;
		}

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
	<header>
		<h1 class="traffix">TRAFFIX</h1>
	</header>

	<main>
		<div v-if="errorMessage" style="color: red">
			{{ errorMessage }}
		</div>

		<div class="login-wrapper">
			<div class="login-box">
				<div class="logo-circle">
					<img src="../../assets/Images/logo.png" alt="Traffix Logo" />
				</div>
				<h2>Accedi al tuo account</h2>

				<form @submit.prevent="handleLogin">
					<input type="email" v-model="email" placeholder="Email" required />
					<input
						type="password"
						v-model="password"
						placeholder="Password"
						required
					/>

					<button type="submit">Login</button>
				</form>
			</div>
			<div class="composite-visual" aria-hidden="true"></div>
		</div>
	</main>
</template>
