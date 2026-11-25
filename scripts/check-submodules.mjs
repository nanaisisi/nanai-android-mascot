import { spawnSync } from "node:child_process";

const strict = process.argv.includes("--strict");
const res = spawnSync("git", ["submodule", "status"], {
	encoding: "utf8",
	shell: false,
});

if (res.status !== 0) {
	console.error("❌ git submodule status の実行に失敗しました。");
	if (res.stderr) console.error(res.stderr.trim());
	process.exit(res.status ?? 1);
}

const lines = (res.stdout ?? "")
	.split(/\r?\n/)
	.map((l) => l.trimEnd())
	.filter((l) => l.length > 0);

let hasIssue = false;
console.log("📦 サブモジュール状態一覧:");
for (const line of lines) {
	const prefix = line[0];
	const rest = line.slice(1).trim();
	const state =
		prefix === " "
			? "clean"
			: prefix === "+"
				? "modified (+)"
				: prefix === "-"
					? "uninitialized (-)"
					: prefix === "U"
						? "conflict (U)"
						: `unknown (${prefix})`;
	if (prefix === "-" || prefix === "U") {
		hasIssue = true;
	}
	console.log(`  - [${state}] ${rest}`);
}

console.log("\n📋 更新後の推奨確認コマンド:");
console.log("  - 仕様系 (docs/ukadoc-*, docs/doc-*): npm run verify:spec");
console.log("  - C++ SHIORI系 (cpp/*): npm run test:rust");

if (strict && hasIssue) {
	console.error("\n❌ 未初期化または競合状態のサブモジュールが存在します。");
	process.exit(1);
}
