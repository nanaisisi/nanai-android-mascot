import { runStepCommand } from "./config.ts";

export function runBuildAndTestVerification(): void {
	console.log("1️⃣ [Cargo Check] Rust バックエンド & FFI コンパイル検証...");
	runStepCommand(
		"cargo check",
		"✅ Cargo Check: エラーなしでビルド成功!\n",
		"❌ Cargo Check: コンパイルエラーが発生しました。\n",
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
