/**
 * @file bracket-utils.ts
 * @brief さくらスクリプトのブラケット `[...]` 引数パースおよびクォート・エスケープ処理ユーティリティ
 */

export function splitBracketArgs(content: string): string[] {
	const args: string[] = [];
	let current = "";
	let inQuotes = false;
	const len = content.length;
	let idx = 0;

	while (idx < len) {
		const ch = content[idx];
		if (ch === '"') {
			if (inQuotes) {
				if (idx + 1 < len && content[idx + 1] === '"') {
					current += '"';
					idx += 2;
					continue;
				}
				inQuotes = false;
			} else {
				inQuotes = true;
			}
		} else if (ch === "," && !inQuotes) {
			args.push(current.trim());
			current = "";
		} else {
			current += ch;
		}
		idx++;
	}
	args.push(current.trim());
	return args;
}

export function readBracketContent(script: string, startIdx: number): { content: string; nextIdx: number } | null {
	if (script[startIdx] !== "[") return null;
	let j = startIdx + 1;
	let content = "";
	const len = script.length;

	while (j < len) {
		if (script[j] === "\\" && script[j + 1] === "]") {
			content += "]";
			j += 2;
			continue;
		}
		if (script[j] === "]") {
			return { content, nextIdx: j + 1 };
		}
		content += script[j];
		j++;
	}
	return null;
}
