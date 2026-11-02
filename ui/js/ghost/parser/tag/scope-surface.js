/**
 * @file scope-surface.js
 * @brief スコープ・サーフィス・アニメーションタグのトークナイズ処理 (\0, \1, \p, \s, \i)
 */

import { readBracketContent, splitBracketArgs } from "../bracket-utils.js";

/**
 * スコープ・サーフィス・アニメーションタグを解析
 * @param {string} script - スクリプト文字列
 * @param {number} i - `\` 直後のインデックス
 * @param {number} _len - スクリプト長
 * @returns {{ tokens: import('../../sakura-parser.js').SakuraScriptToken[], nextIdx: number } | null}
 */
export function tokenizeScopeSurfaceTag(script, i, _len) {
	const char = script[i];

	// \0 または \h (メインキャラ指定)
	if (char === "0" || char === "h") {
		return {
			tokens: [{ type: "scope", value: 0 }],
			nextIdx: i + 1,
		};
	}

	// \1 または \u (サブキャラ指定)
	if (char === "1" || char === "u") {
		return {
			tokens: [{ type: "scope", value: 1 }],
			nextIdx: i + 1,
		};
	}

	// \p[n] または \p0..\p9 (スコープ指定)
	if (char === "p") {
		i++;
		if (script[i] === "[") {
			const parsed = readBracketContent(script, i);
			if (parsed) {
				const scopeVal = Number.parseInt(parsed.content.trim(), 10) || 0;
				return {
					tokens: [{ type: "scope", value: scopeVal }],
					nextIdx: parsed.nextIdx,
				};
			}
			return { tokens: [], nextIdx: i + 1 };
		}
		if (/\d/.test(script[i])) {
			return {
				tokens: [{ type: "scope", value: Number.parseInt(script[i], 10) }],
				nextIdx: i + 1,
			};
		}
		return { tokens: [], nextIdx: i };
	}

	// \s (サーフィス指定: \s0 または \s[10], \s[-1])
	if (char === "s") {
		i++;
		if (script[i] === "[") {
			const parsed = readBracketContent(script, i);
			if (parsed) {
				const val = parsed.content.trim();
				const parsedId = Number.parseInt(val, 10);
				return {
					tokens: [
						{
							type: "surface",
							value: Number.isNaN(parsedId) ? 0 : parsedId,
						},
					],
					nextIdx: parsed.nextIdx,
				};
			}
			return { tokens: [], nextIdx: i + 1 };
		}
		if (/\d/.test(script[i])) {
			return {
				tokens: [{ type: "surface", value: Number.parseInt(script[i], 10) }],
				nextIdx: i + 1,
			};
		}
		return { tokens: [], nextIdx: i };
	}

	// \i (アニメーション呼出: \i[ID], \i[ID,wait], \i[name], \i1〜\i9)
	if (char === "i") {
		i++;
		if (script[i] === "[") {
			const parsed = readBracketContent(script, i);
			if (parsed) {
				const parts = splitBracketArgs(parsed.content);
				const rawTarget = parts[0] ? parts[0].trim() : "";
				const animId = Number.parseInt(rawTarget, 10);
				const wait = parts[1]?.toLowerCase() === "wait";
				return {
					tokens: [
						{
							type: "animation",
							animId: Number.isNaN(animId) ? rawTarget : animId,
							wait,
						},
					],
					nextIdx: parsed.nextIdx,
				};
			}
			return { tokens: [], nextIdx: i + 1 };
		}
		if (/\d/.test(script[i])) {
			return {
				tokens: [
					{
						type: "animation",
						animId: Number.parseInt(script[i], 10),
						wait: false,
					},
				],
				nextIdx: i + 1,
			};
		}
		return { tokens: [], nextIdx: i };
	}

	return null;
}
