import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		{
			name: "alias-ui-js-to-ts",
			enforce: "pre",
			resolveId(source, importer) {
				if (
					source.includes("ui/js/") ||
					source.includes("ui\\js\\") ||
					source.includes("ui/ts/") ||
					source.includes("ui\\ts\\")
				) {
					const tsRel = source
						.replace(/ui\/js\//g, "ui/ts/")
						.replace(/ui\\js\\/g, "ui\\ts\\");
					if (importer) {
						const resolved = path.resolve(path.dirname(importer), tsRel);
						if (fs.existsSync(resolved)) return resolved;
						const withTs = resolved.replace(/\.js$/, ".ts");
						if (fs.existsSync(withTs)) return withTs;
					}
					const abs = path.resolve(process.cwd(), tsRel.replace(/^\.\//, ""));
					if (fs.existsSync(abs)) return abs;
					const absWithTs = abs.replace(/\.js$/, ".ts");
					if (fs.existsSync(absWithTs)) return absWithTs;
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
			include: ["ui/ts/**/*.ts", "ui/js/**/*.js", "ui/windows/*.ts"],
		},
	},
});
