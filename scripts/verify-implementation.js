/**
 * @file verify-implementation.js
 * @brief 実装確認スクリプト - Rustビルド、全Vitest単体テスト、UKADOC仕様準拠状況を一括検証
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();

console.log("==================================================");
console.log("🚀 Nanai Android Mascot - 実装確認スクリプト");
console.log("==================================================\n");

let hasError = false;

// 1. Rust バックエンドビルド検証 (cargo check)
console.log("1️⃣ [Cargo Check] Rust バックエンド & FFI コンパイル検証...");
try {
	execSync("cargo check", { stdio: "inherit", cwd: projectRoot });
	console.log("✅ Cargo Check: エラーなしでビルド成功!\n");
} catch (err) {
	console.error("❌ Cargo Check: コンパイルエラーが発生しました。");
	hasError = true;
}

// 2. Vitest テストスイート検証
console.log("2️⃣ [Vitest] フロントエンド・各種単体テスト検証...");
try {
	execSync("npx vitest run", { stdio: "inherit", cwd: projectRoot });
	console.log("✅ Vitest: 全テスト通過!\n");
} catch (err) {
	console.error("❌ Vitest: テスト失敗が発生しました。");
	hasError = true;
}

// 3. 主要UKADOC実装ファイルの存在および設定チェック
console.log("3️⃣ [UKADOC / Modules] 主要モジュール実装確認...");
const checkFiles = [
	"src-tauri/src/commands/shell/balloon.rs",
	"src-tauri/src/commands/window/character_window.rs",
	"src-tauri/src/shiori/dynamic/host.rs",
	"ui/ts/core/actions/balloon-descript/assets.ts",
	"ui/ts/core/actions/balloon-descript/layout/rect.ts",
	"ui/ts/core/actions/balloon-descript/layout/position.ts",
	"ui/ts/ghost/balloon-window/theme.ts",
	"ui/css/balloon-window.css",
	"tests/balloon-descript/recommended-ghost.test.ts",
];

for (const relPath of checkFiles) {
	const absPath = path.join(projectRoot, relPath);
	if (fs.existsSync(absPath)) {
		console.log(`  ✓ ${relPath}`);
	} else {
		console.error(`  ✗ [MISSING] ${relPath}`);
		hasError = true;
	}
}

console.log("\n==================================================");
if (hasError) {
	console.error("❌ 実装確認: いくつかの検証項目で失敗が発生しました。");
	process.exit(1);
} else {
	console.log("✨ 実装確認完了: すべてのコンパイル・テスト・モジュールが正常です！");
	process.exit(0);
}
