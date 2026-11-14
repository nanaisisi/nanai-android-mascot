import fs from "node:fs";
import path from "node:path";
import { projectRoot, setHasError } from "./config.ts";

export function runModuleExistenceCheck(): void {
	console.log(
		"4️⃣ [UKADOC / UI Modules] 主要モジュール & UI検証ランナー実装確認...",
	);
	const checkFiles: string[] = [
		"src-tauri/src/commands/shell/balloon.rs",
		"src-tauri/src/commands/window/character_window.rs",
		"src-tauri/src/shiori/dynamic/host.rs",
		"ui/ts/core/actions/balloon-descript/assets.ts",
		"ui/ts/core/actions/balloon-descript/layout/rect.ts",
		"ui/ts/core/actions/balloon-descript/layout/position.ts",
		"ui/ts/ghost/balloon-window/theme.ts",
		"ui/css/balloon-window.css",
		"tests/balloon-descript/recommended-ghost.test.ts",
		"ui/ts/ui/spec-compliance-runner.ts",
		"ui/ts/ui/modal.ts",
		"ui/ts/ui/modal-settings-handlers.ts",
		"ui/ts/ui/templates/system-templates.ts",
		"ui/ts/ui/test-menu.ts",
		"ui/test-menu.html",
	];

	for (const relPath of checkFiles) {
		const absPath = path.join(projectRoot, relPath);
		if (fs.existsSync(absPath)) {
			console.log(`  ✓ ${relPath}`);
		} else {
			console.error(`  ✗ [MISSING] ${relPath}`);
			setHasError(true);
		}
	}
}
