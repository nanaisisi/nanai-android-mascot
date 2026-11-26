import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ALLOW_FILE = ".deslop-please.allow";

const args = new Set(process.argv.slice(2));
const onlyCoupling = args.has("--coupling") && !args.has("--deslop");
const onlyDeslop = args.has("--deslop") && !args.has("--coupling");
const updateAllow = args.has("--update-allow");

function runCommand(label, command, commandArgs, installHint) {
	console.log(`\n▶ [Rust Lint] ${label}...`);
	const res = spawnSync(command, commandArgs, {
		stdio: "inherit",
		shell: false,
	});
	if (res.error) {
		if (res.error.code === "ENOENT") {
			console.error(
				`❌ [Rust Lint] ${command} が見つかりません。${installHint}`,
			);
		} else {
			console.error(
				`❌ [Rust Lint] ${label} の起動に失敗しました: ${res.error.message}`,
			);
		}
		return false;
	}
	if (res.status !== 0) {
		console.error(`❌ [Rust Lint] 失敗: ${label} (exit=${res.status})`);
		if (installHint && command === "cargo") {
			console.error(`   ヒント: 未インストールの場合は ${installHint}`);
		}
		return false;
	}
	console.log(`✅ [Rust Lint] 成功: ${label}`);
	return true;
}

if (updateAllow) {
	const ok = runCommand(
		`deslop-please allowlist 更新 (${ALLOW_FILE})`,
		"deslop-please",
		["--update-allow", ALLOW_FILE],
		"`cargo install deslop-please` と `rustup component add rust-analyzer rust-src` を実行してください。",
	);
	process.exit(ok ? 0 : 1);
}

let allPassed = true;

if (!onlyDeslop) {
	const couplingOk = runCommand(
		"cargo coupling 品質ゲート (Grade B+, Critical/High/Circular 0)",
		"cargo",
		[
			"coupling",
			"--check",
			"--min-grade",
			"B",
			"--max-critical",
			"0",
			"--max-circular",
			"0",
			"--fail-on",
			"high",
			"--exclude-tests",
			".",
		],
		"`cargo install cargo-coupling` を実行してください。",
	);
	if (!couplingOk) {
		allPassed = false;
	}
}

if (!onlyCoupling) {
	const allowPath = path.resolve(process.cwd(), ALLOW_FILE);
	const deslopArgs = fs.existsSync(allowPath) ? ["--allow", ALLOW_FILE] : [];
	const deslopOk = runCommand(
		fs.existsSync(allowPath)
			? `deslop-please 構造チェック (--allow ${ALLOW_FILE})`
			: "deslop-please 構造チェック",
		"deslop-please",
		deslopArgs,
		"`cargo install deslop-please` と `rustup component add rust-analyzer rust-src` を実行してください。",
	);
	if (!deslopOk) {
		allPassed = false;
	}
}

if (!allPassed) {
	process.exit(1);
}

console.log("\n✅ [Rust Lint] すべての Rust 構造リンターを通過しました!");
