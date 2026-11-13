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

// 3. UKADOC/SSP 仕様適合 & レイヤー到達度・対照リスト監査
console.log(
	"3️⃣ [Spec Compliance & Layer Audit] UKADOC/SSP 仕様適合・レイヤー到達度・実装対照リスト監査...",
);
const auditOk = runStepCommand(
	"python scripts/verify_spec_compliance.py --dry-run --check-layers --check-lists",
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
		"✅ Spec Compliance & Layer Audit: 仕様適合・レイヤー到達度・実装対照リスト監査および単体テスト通過!\n",
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

// 4b. 実装対照ファイル & 各リスト整合性確認
console.log(
	"\n📋 [Comparison & Compliance File Lists] 実装対照ファイル・各リスト整合性確認...",
);

function walkMarkdownFiles(
	relDir: string,
	predicate: (relPath: string, entryName: string) => boolean,
): string[] {
	const rootAbs = path.join(projectRoot, relDir);
	if (!fs.existsSync(rootAbs)) {
		return [];
	}
	const results: string[] = [];
	const visit = (dirAbs: string) => {
		const entries = fs.readdirSync(dirAbs, { withFileTypes: true });
		for (const entry of entries) {
			const fullAbs = path.join(dirAbs, entry.name);
			if (entry.isDirectory()) {
				visit(fullAbs);
			} else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
				const rel = path.relative(projectRoot, fullAbs).replace(/\\/g, "/");
				if (predicate(rel, entry.name)) {
					results.push(rel);
				}
			}
		}
	};
	visit(rootAbs);
	return results.sort();
}

function hasValidMarkdownTable(content: string): boolean {
	const tableLines = content
		.split(/\r?\n/)
		.map((l) => l.trim())
		.filter((l) => l.startsWith("|") && l.endsWith("|"));
	return tableLines.length >= 3;
}

function hasValidListOrTableStructure(content: string): boolean {
	if (hasValidMarkdownTable(content)) {
		return true;
	}
	return /^\s*(?:[-*]|\d+\.)\s+\S+/m.test(content);
}

// a) Master & Compliance Comparison Documents list
const fixedComparisonDocs = [
	"docs/spec/SUMMARY.md",
	"docs/spec/ukadoc-and-ssp-master-comparison.md",
	"docs/doc/developer/strict-code-verification-system.md",
];
const complianceDocs = walkMarkdownFiles("docs/doc/compliance", () => true);
const sspImplDocs = walkMarkdownFiles("docs/doc/ssp-spec", (_rel, name) =>
	name.includes("実装"),
);
const allComparisonDocs = [
	...fixedComparisonDocs,
	...complianceDocs,
	...sspImplDocs,
];

let comparisonDocErrors = 0;
for (const relDoc of allComparisonDocs) {
	const absDoc = path.join(projectRoot, relDoc);
	if (!fs.existsSync(absDoc)) {
		console.error(`  ✗ [MISSING COMPARISON DOC] ${relDoc}`);
		comparisonDocErrors++;
		hasError = true;
		continue;
	}
	const content = fs.readFileSync(absDoc, "utf-8");
	const requiresTable =
		relDoc === "docs/spec/SUMMARY.md" ||
		relDoc === "docs/spec/ukadoc-and-ssp-master-comparison.md";
	const structureOk = requiresTable
		? hasValidMarkdownTable(content)
		: hasValidListOrTableStructure(content);
	if (!structureOk) {
		console.error(`  ✗ [EMPTY/INVALID LIST STRUCTURE] ${relDoc}`);
		comparisonDocErrors++;
		hasError = true;
	}
}

// b) Category List Files (docs/spec/**/README.md & docs/spec/ukadoc-spec/descript/**/index.md)
const specReadmeFiles = walkMarkdownFiles(
	"docs/spec",
	(_rel, name) => name === "README.md",
);
const descriptIndexFiles = walkMarkdownFiles(
	"docs/spec/ukadoc-spec/descript",
	(rel, name) => {
		if (name !== "index.md") return false;
		const content = fs.readFileSync(path.join(projectRoot, rel), "utf-8");
		return !content.includes("- **対応状況**:");
	},
);
const categoryListFiles = [...specReadmeFiles, ...descriptIndexFiles];

let categoryCorruptedCount = 0;
let brokenMdLinkCount = 0;
let verifiedMdLinkCount = 0;

for (const relCat of categoryListFiles) {
	const absCat = path.join(projectRoot, relCat);
	const content = fs.readFileSync(absCat, "utf-8");
	if (!hasValidMarkdownTable(content)) {
		console.error(`  ✗ [NO TABLE IN CATEGORY LIST] ${relCat}`);
		categoryCorruptedCount++;
		hasError = true;
	}
	if (
		content.includes("[こ](の.md)") ||
		content.includes("[❌](.md)") ||
		/\[\]\(\.md\)/.test(content)
	) {
		console.error(`  ✗ [CORRUPTED TABLE ROWS] ${relCat}`);
		categoryCorruptedCount++;
		hasError = true;
	}
	const dirAbs = path.dirname(absCat);
	for (const line of content.split(/\r?\n/)) {
		if (!line.trim().startsWith("|")) continue;
		for (const match of line.matchAll(
			/\[([^\]]*)\]\(([^)]+\.md(?:#[^)]*)?)\)/g,
		)) {
			const rawTarget = match[2].split("#")[0].trim();
			if (
				!rawTarget ||
				rawTarget.startsWith("http://") ||
				rawTarget.startsWith("https://")
			) {
				continue;
			}
			const resolvedAbs = path.resolve(dirAbs, rawTarget);
			if (fs.existsSync(resolvedAbs)) {
				verifiedMdLinkCount++;
			} else {
				console.error(`  ✗ [BROKEN SPEC LINK] ${relCat} -> ${rawTarget}`);
				brokenMdLinkCount++;
				hasError = true;
			}
		}
	}
}

// c) Implementation File Lists extracted from Comparison Docs
const implRefSourceDocs = [
	"docs/spec/ukadoc-and-ssp-master-comparison.md",
	"docs/doc/developer/strict-code-verification-system.md",
	...specReadmeFiles,
	...descriptIndexFiles,
	...complianceDocs,
	...sspImplDocs,
];
const implPathRegex =
	/(?:(?:\.\.\/)+)?((?:src-tauri|crates|ui|tests)\/[A-Za-z0-9_.*/-]+)/g;
let verifiedImplPathCount = 0;
let missingImplPathCount = 0;

for (const relDoc of implRefSourceDocs) {
	const absDoc = path.join(projectRoot, relDoc);
	if (!fs.existsSync(absDoc)) continue;
	const content = fs.readFileSync(absDoc, "utf-8");
	for (const match of content.matchAll(implPathRegex)) {
		const rawPath = match[1].replace(/[.,;:)\]`]+$/, "");
		if (!rawPath || rawPath.includes("*")) continue;
		const resolvedImpl = path.join(projectRoot, rawPath);
		if (fs.existsSync(resolvedImpl)) {
			verifiedImplPathCount++;
		} else {
			console.error(`  ✗ [MISSING IMPL PATH] ${relDoc} -> ${rawPath}`);
			missingImplPathCount++;
			hasError = true;
		}
	}
}

console.log(
	`  ✓ 実装対照ドキュメント確認: ${allComparisonDocs.length} ファイル (構造エラー: ${comparisonDocErrors})`,
);
console.log(
	`  ✓ カテゴリ一覧リスト確認: ${categoryListFiles.length} ファイル / 仕様リンク検証: ${verifiedMdLinkCount} 件 (破損行: ${categoryCorruptedCount}, リンク切れ: ${brokenMdLinkCount})`,
);
console.log(
	`  ✓ 実装対照ファイル内コードパス検証: ${verifiedImplPathCount} 件確認 (リンク切れパス: ${missingImplPathCount})`,
);
if (
	comparisonDocErrors === 0 &&
	categoryCorruptedCount === 0 &&
	brokenMdLinkCount === 0 &&
	missingImplPathCount === 0
) {
	console.log(
		"✅ Comparison & Compliance Lists: 全実装対照ファイル・リストの整合性検証に通過!\n",
	);
} else {
	console.error(
		"❌ Comparison & Compliance Lists: 実装対照リストに不整合または存在しないパスが含まれています。\n",
	);
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
