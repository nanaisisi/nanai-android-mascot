/**
 * @file verify-implementation.ts
 * @brief 実装確認スクリプト - Rustビルド、全Vitest単体テスト、UKADOC仕様準拠・レイヤー監査、モジュール確認、ライセンス更新 & UI半自動確認ガイドを一括検証
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();

console.log("==================================================");
console.log("🚀 Nanai Android Mascot - 実装確認スクリプト");
console.log("==================================================\n");

let hasError = false;

function runStepCommand(
	command: string,
	successMessage: string,
	errorMessage: string,
): boolean {
	try {
		execSync(command, { stdio: "inherit", cwd: projectRoot });
		if (successMessage) {
			console.log(successMessage);
		}
		return true;
	} catch (_err) {
		console.error(errorMessage);
		hasError = true;
		return false;
	}
}

// 1. Rust バックエンドビルド検証 (cargo check)
console.log("1️⃣ [Cargo Check] Rust バックエンド & FFI コンパイル検証...");
runStepCommand(
	"cargo check",
	"✅ Cargo Check: エラーなしでビルド成功!\n",
	"❌ Cargo Check: コンパイルエラーが発生しました。\n",
);

// 2. Vitest テストスイート検証
console.log(
	"2️⃣ [Vitest & UI Pipeline] フロントエンド・全使用部〜UI検証スイート実行...",
);
runStepCommand(
	"npx vitest run",
	"✅ Vitest & UI Pipeline: 全テスト通過!\n",
	"❌ Vitest & UI Pipeline: テスト失敗が発生しました。\n",
);

// 3. UKADOC/SSP 仕様適合 & レイヤー到達度監査
console.log(
	"3️⃣ [Spec Compliance & Layer Audit] UKADOC/SSP 仕様適合 & レイヤー到達度監査...",
);
const auditOk = runStepCommand(
	"python scripts/verify_spec_compliance.py --dry-run --check-layers",
	"",
	"❌ Spec Compliance Audit: verify_spec_compliance.py でエラーが発生しました。",
);
const auditTestOk = runStepCommand(
	"python -m unittest tests/test_verify_spec_compliance.py",
	"",
	"❌ Spec Compliance Unit Tests: test_verify_spec_compliance.py でエラーが発生しました。",
);
if (auditOk && auditTestOk) {
	console.log(
		"✅ Spec Compliance & Layer Audit: 仕様適合・レイヤー到達度監査および単体テスト通過!\n",
	);
} else {
	console.log("");
}

// 4. 主要UKADOC実装ファイル & UI検証ランナーの存在チェック
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
		hasError = true;
	}
}

// 5. サードパーティライセンス情報の自動更新 & UI半自動確認ガイド表示
console.log(
	"\n5️⃣ [Licenses & Semi-Auto UI Guide] サードパーティライセンス更新 & UI半自動確認ガイド表示...",
);
try {
	execSync("cargo about generate about.hbs -o THIRD-PARTY-NOTICES.md", {
		stdio: "inherit",
		cwd: projectRoot,
	});
	const uiAssetsDir = path.join(projectRoot, "ui/assets");
	if (!fs.existsSync(uiAssetsDir)) {
		fs.mkdirSync(uiAssetsDir, { recursive: true });
	}
	execSync(
		"cargo about generate about.hbs -o ui/assets/LICENSE-3RD-PARTY.html",
		{ stdio: "inherit", cwd: projectRoot },
	);
	console.log(
		"✅ Licenses: サードパーティライセンス通知ファイルの自動更新に成功!\n",
	);
} catch (_err) {
	console.warn(
		"⚠️ Cargo About: ライセンスファイルの更新をスキップしました (cargo-about 未インストール等)。\n",
	);
}

console.log("🖥️ [UI半自動確認ガイド (Semi-Auto Visual Check)]");
console.log("  1. Vite 開発サーバーを起動: `npm run dev` (または `npx vite`)");
console.log(
	"  2. メインUIの `🧪 テスト` モーダルを開き、仕様適合・UI半自動検証ボタンを実行",
);
console.log(
	"  3. 単体メニュー確認ページ (`ui/test-menu.html`) をブラウザで開き、`テスト` メニューからも実行・目視チェック可能",
);
console.log(
	"  4. CLI短縮コマンド: `npm run verify:ui` / `npm run verify:spec`\n",
);

console.log("==================================================");
if (hasError) {
	console.error("❌ 実装確認: いくつかの検証項目で失敗が発生しました。");
	process.exit(1);
} else {
	console.log(
		"✨ 実装確認完了: すべてのコンパイル・テスト・モジュール・監査が正常です！",
	);
	process.exit(0);
}
