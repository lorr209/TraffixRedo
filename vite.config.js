import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
	plugins: [vue()],
	build: {
		rollupOptions: {
			input: {
				// Assign names to your HTML entry files
				main: resolve(__dirname, "index.html"),
				login: resolve(__dirname, "login.html"),
				// To add a third page later, just add it here:
				// admin: resolve(__dirname, 'admin.html')
			},
		},
	},
});
