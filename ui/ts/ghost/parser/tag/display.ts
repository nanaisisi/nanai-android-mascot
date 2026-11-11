/**
 * @file display.ts
 * @brief 座標移動・同期表示・バルーンタグのトークナイズ処理 (\_l, \_s, \b)
 */

import { readBracketContent, splitBracketArgs } from "../bracket-utils.js";

export function tokenizeDisplayTag(script: string, i: number, _len: number) {
	const char = script[i];

	if (char === "_" && script[i + 1] === "l" && script[i + 2] === "[") {
		const parsed = readBracketContent(script, i + 2);
		if (parsed) {
			const coords = splitBracketArgs(parsed.content);
			return {
				tokens: [
					{
						type: "offset",
						x: coords[0] || "0",
						y: coords[1] || "0",
					},
				],
				nextIdx: parsed.nextIdx,
			};
		}
		return { tokens: [], nextIdx: i + 2 };
	}

	if (char === "_" && script[i + 1] === "s") {
		if (script[i + 2] === "[") {
			const parsed = readBracketContent(script, i + 2);
			if (parsed) {
				const raw = parsed.content.trim();
				if (raw === "0" || raw === "false") {
					return {
						tokens: [{ type: "sync_toggle", value: false, scopes: [] }],
						nextIdx: parsed.nextIdx,
					};
				}
				const parts = splitBracketArgs(raw);
				const numericScopes: number[] = [];
				for (const p of parts) {
					const num = Number.parseInt(p, 10);
					if (!Number.isNaN(num) && num >= 0) {
						numericScopes.push(num);
					}
				}
				return {
					tokens: [
						{
							type: "sync_toggle",
							value: true,
							scopes: numericScopes.length > 0 ? numericScopes : undefined,
						},
					],
					nextIdx: parsed.nextIdx,
				};
			}
			return {
				tokens: [{ type: "sync_toggle", value: true }],
				nextIdx: i + 2,
			};
		}
		return {
			tokens: [{ type: "sync_toggle", value: undefined }],
			nextIdx: i + 2,
		};
	}

	if (char === "b") {
		const curr = i + 1;
		if (script[curr] === "[") {
			const parsed = readBracketContent(script, curr);
			if (parsed) {
				const val = Number.parseInt(parsed.content.trim(), 10);
				return {
					tokens: [
						{
							type: "balloon",
							value: Number.isNaN(val) ? 0 : val,
						},
					],
					nextIdx: parsed.nextIdx,
				};
			}
			return { tokens: [], nextIdx: curr + 1 };
		}
		if (/\d/.test(script[curr])) {
			return {
				tokens: [{ type: "balloon", value: Number.parseInt(script[curr], 10) }],
				nextIdx: curr + 1,
			};
		}
		return { tokens: [], nextIdx: i };
	}

	return null;
}
