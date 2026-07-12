<script setup>
	import { ref } from "vue";

	const email = ref("");
	const password = ref("");
	const errorMessage = ref("");

	const handleLogin = async () => {
		if (!email.value || !password.value) {
			errorMessage.value = "Please fill in all fields.";
			return;
		}

		const response = await fetch("/api/auth/", {
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
			errorMessage.value = data.message;
		}
	};
</script>

<template>
	<header>
		<h1 class="traffix">TRAFFIX</h1>
	</header>

	<main>
		<div class="login-wrapper">
			<div class="login-box">
				<div class="logo-circle">
					<img src="../../assets/Images/logo.png" alt="Traffix Logo" />
				</div>
				<h2>Accedi al tuo account</h2>

				<form @submit.prevent="handleLogin">
					<label v-if="errorMessage" style="color: red">
						{{ errorMessage }}
					</label>
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

<style>
	:root {
		--login-visual-image: url("https://hips.hearstapps.com/hmg-prod/images/lake-carezza-karersee-trentino-alto-adige-italy-royalty-free-image-1755119336.pjpeg");
		--login-background-color: linear-gradient(
			rgba(17, 40, 53),
			rgba(24, 25, 41)
		);
	}

	header {
		position: sticky;
		width: 100%;
		height: 7rem;
		background-color: var(--dark-blue-500);
		color: white;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 1.6rem;
		z-index: 1000;
		flex-shrink: 0;
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

	header h1 {
		display: block;
	}

	body {
		font-size: 1.6rem;
	}

	main {
		flex: 1;
		padding: 2rem;
		background: var(--body-background);
		min-height: calc(100vh - 10rem);
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.login-box {
		border-radius: 1.6rem;
		width: 100%;
		padding: 4.8rem 4rem;
		color: white;
		text-align: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 2.4rem;
		animation: loginSlideIn var(--anim-slow) ease;
	}

	.login-box h2 {
		font-family: var(--Traffix-font);
		background: var(--Traffix-color);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		margin-bottom: 1rem;
	}

	.login-box form {
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
	}

	.login-box input {
		width: 100%;
		padding: 1.3rem 1.6rem;
		border-radius: 0.8rem;
		border: none;
		background: var(--dark-blue-100);
		color: white;
		font-size: 1.6rem;
		transition: background 0.2s;
	}

	.login-box input:focus {
		outline: none;
		background: var(--lighter-blue-700);
	}

	.login-box button {
		width: 100%;
		padding: 1.6rem;
		margin-block: 3rem;
		background: linear-gradient(90deg, #09aebf, #9b61c2);
		border: none;
		border-radius: 0.8rem;
		color: white;
		font-weight: bold;
		cursor: pointer;
		transition: opacity 0.3s;
	}

	.login-box button:hover {
		opacity: 0.9;
	}

	.options {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 1.44rem;
		margin-top: 0.8rem;
	}

	.options label {
		display: flex;
		align-items: center;
		gap: 0.64rem;
	}

	.signup {
		margin-top: 1.6rem;
		font-size: 1.44rem;
	}

	.logo-circle {
		width: 10rem;
		height: 10rem;
		border-radius: 50%;
		background: var(--Traffix-color);
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 1.6rem;
		box-shadow: 0 0.4rem 1.5rem rgba(0 0 0 / 0.3);
	}
	.logo-circle img {
		width: 9rem;
		height: 9rem;
		object-fit: contain;
		filter: drop-shadow(0.1rem 0.1rem 0.2rem rgba(0 0 0 / 0.4));
	}

	@keyframes loginSlideIn {
		from {
			opacity: 0;
			transform: translateY(1.5rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.login-wrapper {
		width: min(130rem, 100%);
		min-height: 65rem;
		display: grid;
		border-radius: 1.6rem;
		overflow: hidden;
		box-shadow: 0 0 2.5rem rgba(0, 0, 0, 0.4);
		border: 0.1rem solid rgba(255, 255, 255, 0.06);
		background: var(--login-background-color);
	}

	@media (width >= 900px) {
		.login-wrapper {
			grid-template-columns: 1fr 1.4fr;
		}
	}

	@media (width < 900px) {
		.login-wrapper {
			grid-template-columns: 1fr;
			min-height: auto;
		}
	}

	.composite-visual {
		background-image: var(--login-visual-image);
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
	}

	.login-wrapper .login-box {
		background: transparent;
		box-shadow: none;
		border-radius: 0;
		width: 100%;
		padding: 4.8rem;
		color: white;
		text-align: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 2.4rem;
		animation: loginSlideIn var(--anim-slow) ease;
	}
</style>
