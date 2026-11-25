import fs from "node:fs";
import path from "node:path";
import { projectRoot, setHasError } from "./config.ts";

/**
 * Phase B 解消対象の Write-only `--balloon-*` CSS 変数ラチェット上限。
 * 既実装の消費側接続を進めるたびにこの上限を引き下げる。
 */
export const MAX_UNCONSUMED_BALLOON_CSS_VARS = 5;

const METADATA_ONLY_VARS = new Set([
	"--balloon-id",
	"--balloon-readme",
	"--balloon-readme-charset",
	"--balloon-recommended-ghost-path",
	"--balloon-recommended-warning",
]);

function collectFiles(
	dirAbs: string,
	exts: ReadonlySet<string>,
	excludeDirNames: ReadonlySet<string> = new Set(),
): string[] {
	if (!fs.existsSync(dirAbs)) {
		return [];
	}
	const results: string[] = [];
	const visit = (cur: string) => {
		for (const entry of fs.readdirSync(cur, { withFileTypes: true })) {
			if (entry.isDirectory()) {
				if (!excludeDirNames.has(entry.name)) {
					visit(path.join(cur, entry.name));
				}
			} else if (entry.isFile()) {
				const ext = path.extname(entry.name).toLowerCase();
				if (exts.has(ext)) {
					results.push(path.join(cur, entry.name));
				}
			}
		}
	};
	visit(dirAbs);
	return results;
}

export function runWiringAudit(): void {
	console.log(
		"\n🔌 [Wiring Audit] Write-only CSS 変数（未消費）ラチェット監査...",
	);

	const balloonDescriptDir = path.join(
		projectRoot,
		"ui/ts/core/actions/balloon-descript",
	);
	const tsFiles = collectFiles(balloonDescriptDir, new Set([".ts"]));
	const writtenVars = new Set<string>();
	const cssVarPattern = /--balloon-[a-z0-9-]+/g;

	for (const file of tsFiles) {
		const content = fs.readFileSync(file, "utf-8");
		for (const match of content.matchAll(cssVarPattern)) {
			writtenVars.add(match[0]);
		}
	}

	const uiDir = path.join(projectRoot, "ui");
	const consumerFiles = collectFiles(
		uiDir,
		new Set([".css", ".ts", ".html"]),
		new Set(["balloon-descript"]),
	);
	const consumerCorpus = consumerFiles
		.map((f) => fs.readFileSync(f, "utf-8"))
		.join("\n");
	const selfVarRefs = new Set<string>();
	for (const file of tsFiles) {
		const content = fs.readFileSync(file, "utf-8");
		for (const m of content.matchAll(/var\(\s*(--balloon-[a-z0-9-]+)\b/g)) {
			selfVarRefs.add(m[1]);
		}
	}

	const unconsumed: string[] = [];
	for (const varName of [...writtenVars].sort()) {
		if (!consumerCorpus.includes(varName) && !selfVarRefs.has(varName)) {
			unconsumed.push(varName);
		}
	}

	const consumedCount = writtenVars.size - unconsumed.length;
	const metaCount = unconsumed.filter((v) => METADATA_ONLY_VARS.has(v)).length;
	const behaviorCount = unconsumed.length - metaCount;
	console.log(
		`  書き出し変数: ${writtenVars.size} / 消費済: ${consumedCount} / 未消費(Write-only): ${unconsumed.length} (上限: ${MAX_UNCONSUMED_BALLOON_CSS_VARS}) [挙動連携残: ${behaviorCount}, メタデータ保持のみ: ${metaCount}]`,
	);

	if (unconsumed.length > MAX_UNCONSUMED_BALLOON_CSS_VARS) {
		console.error(
			`  ❌ 未消費 CSS 変数が上限 (${MAX_UNCONSUMED_BALLOON_CSS_VARS}) を超えました: ${unconsumed.length} 件`,
		);
		for (const v of unconsumed.slice(0, 15)) {
			console.error(`    - ${v}`);
		}
		setHasError(true);
		return;
	}

	if (unconsumed.length > 0) {
		console.log(
			`  ⚠️ Phase B 解消対象の未消費変数 (先頭5件): ${unconsumed.slice(0, 5).join(", ")}`,
		);
	}
	console.log("✅ Wiring Audit: 未消費 CSS 変数の増加なし!\n");
}
