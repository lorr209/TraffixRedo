<!-- components/UserProfileDropdown.vue -->
<script setup>
	import { ref, onMounted, onUnmounted, watch } from "vue";

	const props = defineProps({
		user: {
			type: Object,
			default: null,
		},
	});

	const isOpen = ref(false);
	const dropdownRef = ref(null);

	const toggleDropdown = () => {
		isOpen.value = !isOpen.value;
	};

	const handleClickOutside = (event) => {
		if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
			isOpen.value = false;
		}
	};

	const ruolo = ref("");

	watch(
		() => props.user,
		async (newValue) => {
			if (newValue) {
				const response = await fetch(`/api/roles/${newValue.ruolo}`, {
					method: "GET",
					headers: { "Content-Type": "application/json" },
				});
				const data = await response.json();
				ruolo.value = data.nome;
			}
		},
		{ immediate: true },
	);

	onMounted(() => {
		document.addEventListener("click", handleClickOutside);
	});

	onUnmounted(() => {
		document.removeEventListener("click", handleClickOutside);
	});
</script>

<template>
	<div class="user-profile-container" ref="dropdownRef">
		<div id="user" @click="toggleDropdown" :class="{ active: isOpen }">
			👤 {{ user ? `${user.nome} ${user.cognome}` : "Caricamento..." }}
		</div>

		<div v-if="isOpen && user" class="user-popup">
			<div class="popup-header">
				<h4>{{ user.nome }} {{ user.cognome }}</h4>
				<span class="email-text">{{ user.email }}</span>
			</div>
			<hr />
			<div class="popup-body">
				<p>
					<strong>Account status:</strong>
					{{ user.attivo ? "Attivo" : "Inattivo" }}
				</p>
				<p>
					<strong>Ruolo:</strong>
					<span class="mono-text">{{ ruolo }}</span>
				</p>
			</div>
		</div>
	</div>
</template>

<style scoped>
	.user-profile-container {
		position: relative; /* Keeps the popup anchored below the button */
	}

	#user {
		cursor: pointer;
		padding: 0.8rem 1.2rem;
		border-radius: 0.8rem;
		transition: background-color 0.2s;
		user-select: none;
	}

	#user:hover,
	#user.active {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.user-popup {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		background-color: white;
		color: #333;
		width: 240px;
		border-radius: 0.8rem;
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05);
		border: 1px solid #e5e7eb;
		padding: 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.popup-header h4 {
		margin: 0;
		font-size: 1.1rem;
	}

	.email-text {
		font-size: 0.85rem;
		color: #6b7280;
	}

	hr {
		border: 0;
		border-top: 1px solid #e5e7eb;
		margin: 0.4rem 0;
	}

	.popup-body p {
		margin: 0.4rem 0;
		font-size: 0.9rem;
	}

	.mono-text {
		font-family: monospace;
		font-size: 0.8rem;
		background: #f3f4f6;
		padding: 0.2rem 0.4rem;
		border-radius: 0.4rem;
	}
</style>
