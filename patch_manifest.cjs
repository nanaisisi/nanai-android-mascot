const fs = require("node:fs");
const file = "ui/ts/surface/shell-manifest.ts";
let code = fs.readFileSync(file, "utf8");

const importStatement = `import { invoke } from "../core/tauri-helper.js";`;
const newImportsAndVariables = `import { invoke } from "../core/tauri-helper.js";

const sortedElementsCache = new WeakMap<unknown[], unknown[]>();
const sortedAnimationsCache = new WeakMap<unknown[], unknown[]>();
const sortedPatternsCache = new WeakMap<unknown[], unknown[]>();`;

code = code.replace(importStatement, newImportsAndVariables);

code = code.replace(
	/elements\[sid\] = \(def\.elements \?\? \[\]\)[\s\S]*?\.map\(\(e: unknown\) => \(\{/,
	`const rawElements = def.elements ?? [];
		let sortedElements = sortedElementsCache.get(rawElements);
		if (!sortedElements && rawElements.length > 0) {
			sortedElements = rawElements.slice().sort((a: unknown, b: unknown) => ((a as { id?: number }).id ?? 0) - ((b as { id?: number }).id ?? 0));
			sortedElementsCache.set(rawElements, sortedElements);
		} else if (!sortedElements) {
            sortedElements = [];
        }

		elements[sid] = sortedElements.map((e: { id?: number; method?: unknown; file?: string; x?: number; y?: number } | unknown) => ({`,
);

code = code.replace(
	/animations\[sid\] = Object\.values\(def\.animations \?\? \{\}\)[\s\S]*?\.map\(\(anim: unknown\) => \(\{/,
	`const rawAnimations = Object.values(def.animations ?? {});
		let sortedAnimations = sortedAnimationsCache.get(rawAnimations);
		if (!sortedAnimations && rawAnimations.length > 0) {
			sortedAnimations = rawAnimations.slice().sort((a: unknown, b: unknown) => ((a as { id?: number }).id ?? 0) - ((b as { id?: number }).id ?? 0));
			sortedAnimationsCache.set(rawAnimations, sortedAnimations);
		} else if (!sortedAnimations) {
			sortedAnimations = [];
		}

		animations[sid] = sortedAnimations.map((anim: { id?: number; interval?: unknown; collisions?: unknown[]; patterns?: unknown[] } | unknown) => ({`,
);

code = code.replace(
	/patterns: \(anim\.patterns \?\? \[\]\)[\s\S]*?\.map\(\(p: unknown\) => \(\{/,
	`patterns: (() => {
					const animTyped = anim as { patterns?: unknown[] };
					const rawPatterns = animTyped.patterns ?? [];
					let sortedPatterns = sortedPatternsCache.get(rawPatterns);
					if (!sortedPatterns && rawPatterns.length > 0) {
						sortedPatterns = rawPatterns.slice().sort((a: unknown, b: unknown) => ((a as { index?: number }).index ?? 0) - ((b as { index?: number }).index ?? 0));
						sortedPatternsCache.set(rawPatterns, sortedPatterns);
					} else if (!sortedPatterns) {
						sortedPatterns = [];
					}
					return sortedPatterns.map((p: { surface?: unknown; wait?: number; wait_max?: number; method?: unknown; x?: number; y?: number } | unknown) => ({`,
);

code = code.replace(
	`					})),
			}));`,
	`					}));
				})(),
			}));`,
);

fs.writeFileSync(file, code, "utf8");
