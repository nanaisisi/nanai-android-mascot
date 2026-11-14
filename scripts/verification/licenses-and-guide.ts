import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { projectRoot } from "./config.ts";

export function runLicensesAndGuide(): void {
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
	console.log(
		"  1. Vite 開発サーバーを起動: `npm run dev` (または `npx vite`)",
	);
	console.log(
		"  2. メインUIの `🧪 テスト` モーダルを開き、仕様適合・UI半自動検証ボタンを実行",
	);
	console.log(
		"  3. 単体メニュー確認ページ (`ui/test-menu.html`) をブラウザで開き、`テスト` メニューからも実行・目視チェック可能",
	);
	console.log(
		"  4. CLI短縮コマンド: `npm run verify:ui` / `npm run verify:spec`\n",
	);
}
