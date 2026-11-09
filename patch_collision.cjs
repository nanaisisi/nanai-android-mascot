const fs = require("node:fs");
const file = "ui/ts/surface/surface-collision.ts";
let code = fs.readFileSync(file, "utf8");

const importStatement = `import { collisionContains } from "./shell-manifest.js";`;

const newImportsAndVariables = `import { collisionContains } from "./shell-manifest.js";

const sortedAscendCache = new WeakMap<unknown[], unknown[]>();
const sortedDescendCache = new WeakMap<unknown[], unknown[]>();`;

code = code.replace(importStatement, newImportsAndVariables);

const _searchBlock1 = `		if (sortKind === "ascend" || sortKind === "id") {
			candidates = colList.slice().sort((a: unknown, b: unknown) => {
				const idA = a.id != null ? a.id : Number.MAX_SAFE_INTEGER;
				const idB = b.id != null ? b.id : Number.MAX_SAFE_INTEGER;
				return idA - idB;
			});
		}`;

const replaceBlock1 = `		if (sortKind === "ascend" || sortKind === "id") {
			candidates = sortedAscendCache.get(colList) || [];
			if (candidates.length === 0 && colList.length > 0) {
				candidates = colList.slice().sort((a: unknown, b: unknown) => {
					const idA = (a as { id?: number }).id ?? Number.MAX_SAFE_INTEGER;
					const idB = (b as { id?: number }).id ?? Number.MAX_SAFE_INTEGER;
					return idA - idB;
				});
				sortedAscendCache.set(colList, candidates);
			}
		}`;

// Use Regex to be robust
code = code.replace(
	/if \(sortKind === "ascend" \|\| sortKind === "id"\) \{\s*candidates = colList\.slice\(\)\.sort\(\(a: unknown, b: unknown\) => \{\s*const idA = [^\n]+\n\s*const idB = [^\n]+\n\s*return idA - idB;\s*\}\);\s*\}/,
	replaceBlock1,
);

const _searchBlock2 = `else if (sortKind === "descend") {
			candidates = colList.slice().sort((a: unknown, b: unknown) => {
				const idA = (a as { id?: number }).id ?? -1;
				const idB = (b as { id?: number }).id ?? -1;
				return idB - idA;
			});
		}`;

const replaceBlock2 = `else if (sortKind === "descend") {
			candidates = sortedDescendCache.get(colList) || [];
			if (candidates.length === 0 && colList.length > 0) {
				candidates = colList.slice().sort((a: unknown, b: unknown) => {
					const idA = (a as { id?: number }).id ?? -1;
					const idB = (b as { id?: number }).id ?? -1;
					return idB - idA;
				});
				sortedDescendCache.set(colList, candidates);
			}
		}`;

code = code.replace(
	/else if \(sortKind === "descend"\) \{\s*candidates = colList\.slice\(\)\.sort\(\(a: unknown, b: unknown\) => \{\s*const idA = [^\n]+\n\s*const idB = [^\n]+\n\s*return idB - idA;\s*\}\);\s*\}/,
	replaceBlock2,
);

fs.writeFileSync(file, code, "utf8");
