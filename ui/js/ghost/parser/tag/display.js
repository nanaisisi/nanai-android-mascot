/**
 * @file display.js
 * @brief 座標移動・同期表示・バルーンタグのトークナイズ処理 (\_l, \_s, \b)
 */

import { readBracketContent, splitBracketArgs } from "../bracket-utils.js";

/**
 * 座標移動・同期表示・バルーンタグを解析
 * @param {string} script - スクリプト文字列
 * @param {number} i - `\` 直後のインデックス
 * @param {number} _len - スクリプト長
 * @returns {{ tokens: import('../../sakura-parser.js').SakuraScriptToken[], nextIdx: number } | null}
 */
export function tokenizeDisplayTag(script, i, _len) {
	const char = script[i];

	// \_l[x,y] (座標移動)
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

	// \_s (複数キャラ同期表示トグル / \_s[1], \_s[0])
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

	// \b (バルーン指定: \b[0], \b[-1], \b0..\b9)
	if (char === "b") {
		i++;
		if (script[i] === "[") {
			const parsed = readBracketContent(script, i);
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
			return { tokens: [], nextIdx: i + 1 };
		}
		if (/\d/.test(script[i])) {
			return {
				tokens: [{ type: "balloon", value: Number.parseInt(script[i], 10) }],
				nextIdx: i + 1,
			};
		}
		return { tokens: [], nextIdx: i };
	}

	return null;
}
