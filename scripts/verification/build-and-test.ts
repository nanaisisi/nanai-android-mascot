import { runStepCommand } from "./config.ts";

export function runBuildAndTestVerification(): void {
	console.log(
		"1️⃣ [Rust Tests & Check] 純 Rust クレート実テスト & src-tauri コンパイル検証...",
	);
	runStepCommand(
		"node scripts/run-rust-tests.mjs",
		"✅ Rust Tests & Check: 純 Rust テスト & src-tauri 検証成功!\n",
		"❌ Rust Tests & Check: Rust テストまたはコンパイル検証に失敗しました。\n",
	);

	console.log(
		"2️⃣ [Vitest & UI Pipeline] フロントエンド・全使用部〜UI検証スイート実行...",
	);
	runStepCommand(
		"npx vitest run",
		"✅ Vitest & UI Pipeline: 全テスト通過!\n",
		"❌ Vitest & UI Pipeline: テスト失敗が発生しました。\n",
	);
}
