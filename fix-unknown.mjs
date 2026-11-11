import fs from "node:fs";
import path from "node:path";

// Define a map of common replacements based on the codebase conventions
const _replacements = [
	// (this as unknown).something -> (this as import("../../main.js").NanaiAndroidMascotApp).something
	{
		find: /\(this as unknown\)/g,
		replace: '(this as import("../../../main.js").NanaiAndroidMascotApp)',
	},
	{
		find: /handler:\s*unknown/g,
		replace: 'handler: import("../../../ghost.js").SakuraCommandHandler',
	},
	// We can run these multiple times or carefully
];

function processDir(dir) {
	const files = fs.readdirSync(dir);
	for (const file of files) {
		const fullPath = path.join(dir, file);
		const stat = fs.statSync(fullPath);
		if (stat.isDirectory()) {
			processDir(fullPath);
		} else if (fullPath.endsWith(".ts")) {
			let content = fs.readFileSync(fullPath, "utf8");
			const original = content;

			// replace `(this as unknown)`
			content = content.replace(
				/\(this as unknown\)/g,
				'(this as import("../../../main.js").NanaiAndroidMascotApp)',
			);

			// replace `handler: unknown` in ghost command-handlers
			if (fullPath.includes("command-handler")) {
				content = content.replace(
					/handler:\s*unknown/g,
					'handler: import("../../ghost.js").SakuraCommandHandler',
				);
			}

			if (content !== original) {
				fs.writeFileSync(fullPath, content, "utf8");
			}
		}
	}
}

processDir(path.resolve("ui/ts"));
console.log("Done replacing common unknowns");
