import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		root: ".",
		include: ["tests/**/*.test.js"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["ui/js/**/*.js"],
		},
	},
});
