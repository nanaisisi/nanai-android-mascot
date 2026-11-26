import { runStepCommand } from "./config.ts";

export function runRustArchitectureLintVerification(): void {
	console.log(
		"2️⃣.5 [Rust Architecture Lint] deslop-please & cargo coupling 構造・結合度チェック...",
	);
	runStepCommand(
		"node scripts/run-rust-linters.mjs",
		"✅ Rust Architecture Lint: deslop-please & cargo coupling 通過!\n",
		"❌ Rust Architecture Lint: deslop-please または cargo coupling でエラーが検出されました。\n",
	);
}
