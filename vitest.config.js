import { defineConfig } from "vitest/config";
import fs from "node:fs";
import path from "node:path";

export default defineConfig({
	plugins: [
		{
			name: "resolve-ui-js-to-ts",
			enforce: "pre",
			resolveId(source, importer) {
				if (source.includes("ui/js/") || source.includes("ui\\js\\")) {
					const converted = source
						.replace(/ui\/js\//g, "ui/ts/")
						.replace(/ui\\js\\/g, "ui\\ts\\");
					if (importer) {
						const resolvedPath = path.resolve(path.dirname(importer), converted);
						if (fs.existsSync(resolvedPath)) {
							return resolvedPath;
						}
						if (!resolvedPath.endsWith(".ts") && !resolvedPath.endsWith(".js") && fs.existsSync(resolvedPath + ".ts")) {
							return resolvedPath + ".ts";
						}
						// also try changing extension from .js to .ts
						const tsPath = resolvedPath.replace(/\.js$/, ".ts");
						if (fs.existsSync(tsPath)) {
							return tsPath;
						}
					}
					const absPath = path.resolve(process.cwd(), converted.replace(/^\.\//, ""));
					if (fs.existsSync(absPath)) {
						return absPath;
					}
					const absTs = absPath.replace(/\.js$/, ".ts");
					if (fs.existsSync(absTs)) {
						return absTs;
					}
				}
				return null;
			},
		},
	],
	test: {
		root: ".",
		include: ["tests/**/*.test.ts", "tests/**/*.test.js"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: [
				"ui/ts/**/*.ts",
				"ui/js/**/*.js",
				"ui/windows/*.js",
			],
		},
	},
});
