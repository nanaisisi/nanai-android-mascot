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
				const val = parsed.content.trim();
				return {
					tokens: [
						{
							type: "sync_toggle",
							value: val !== "0" && val !== "false",
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
		let curr = i + 1;
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
