import fs from "node:fs";
import path from "node:path";
import { projectRoot, setHasError } from "./config.ts";

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

export function runListAndComparisonAudit(): void {
	console.log(
		"\n📋 [Comparison & Compliance File Lists] 実装対照ファイル・各リスト整合性確認...",
	);

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
			setHasError(true);
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
			setHasError(true);
		}
	}

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
			setHasError(true);
		}
		if (
			content.includes("[こ](の.md)") ||
			content.includes("[❌](.md)") ||
			/\[\]\(\.md\)/.test(content)
		) {
			console.error(`  ✗ [CORRUPTED TABLE ROWS] ${relCat}`);
			categoryCorruptedCount++;
			setHasError(true);
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
					setHasError(true);
				}
			}
		}
	}

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

	const migratedPaths: Record<string, string> = {
		"ui/ts/ghost/sakura-play.ts": "crates/nanai-core/src/sakura_player.rs",
		"ui/ts/ghost/sakura-play/handlers.ts": "crates/nanai-core/src/sakura_script.rs",
		"ui/ts/surface/surface-load.ts": "ui/ts/surface/ghost-surface-loader.ts",
		"ui/ts/surface/surface-dressup.ts": "crates/nanai-surface/src/types/txt/surfaces_txt/alias.rs",
		"ui/ts/surface/compositor/chromakey.ts": "crates/nanai-surface/src/compositor/blend/chromakey.rs",
		"tests/ghost.test.ts": "tests/ghost-actions.test.ts",
	};

	for (const relDoc of implRefSourceDocs) {
		const absDoc = path.join(projectRoot, relDoc);
		if (!fs.existsSync(absDoc)) continue;
		const content = fs.readFileSync(absDoc, "utf-8");
		for (const match of content.matchAll(implPathRegex)) {
			const rawPath = match[1].replace(/[.,;:)\]`]+$/, "");
			if (!rawPath || rawPath.includes("*")) continue;
			const targetPath = migratedPaths[rawPath] || rawPath;
			const resolvedImpl = path.join(projectRoot, targetPath);
			if (fs.existsSync(resolvedImpl)) {
				verifiedImplPathCount++;
			} else {
				console.error(`  ✗ [MISSING IMPL PATH] ${relDoc} -> ${rawPath}`);
				missingImplPathCount++;
				setHasError(true);
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
}
