import { spawnSync } from "node:child_process";

const steps = [
	{
		label: "純 Rust 5 クレート単体テスト実行",
		args: [
			"--config",
			'build.rustc-wrapper=""',
			"--config",
			'profile.dev.codegen-backend="llvm"',
			"test",
			"-p",
			"nanai-vfs",
			"-p",
			"nanai-surface",
			"-p",
			"nanai-core",
			"-p",
			"nanai-shiori-vm",
			"-p",
			"nanai-android-mascot-ui",
		],
	},
	{
		label:
			"src-tauri テストコンパイル検証 (Windows 0xc0000139 制約のため check --tests)",
		args: [
			"--config",
			'build.rustc-wrapper=""',
			"check",
			"--tests",
			"--manifest-path",
			"src-tauri/Cargo.toml",
		],
	},
];

for (const step of steps) {
	console.log(`\n▶ [Rust] ${step.label}...`);
	const res = spawnSync("cargo", step.args, {
		stdio: "inherit",
		shell: false,
	});
	if (res.status !== 0) {
		console.error(`❌ [Rust] 失敗: ${step.label} (exit=${res.status})`);
		process.exit(res.status ?? 1);
	}
}

console.log(
	"\n✅ [Rust] 全純 Rust クレートテスト & src-tauri コンパイル検証成功!",
);
