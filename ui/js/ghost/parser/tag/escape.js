/**
 * @file escape.js
 * @brief エスケープ文字（\\, \%, \&[ID]）のトークナイズ処理
 */

import { readBracketContent } from "../bracket-utils.js";

/**
 * エスケープ文字および実体参照を解析
 * @param {string} script - スクリプト文字列
 * @param {number} i - `\` 直後のインデックス
 * @param {number} len - スクリプト長
 * @returns {{ tokens: import('../../sakura-parser.js').SakuraScriptToken[], nextIdx: number } | null}
 */
export function tokenizeEscapeTag(script, i, len) {
	if (i >= len) {
		return null;
	}

	// エスケープされたバックスラッシュ: \\ -> 通常文字 '\'
	if (script[i] === "\\") {
		return {
			tokens: [{ type: "char", value: "\\" }],
			nextIdx: i + 1,
		};
	}

	// エスケープされたパーセント: \% -> 通常文字 '%'
	if (script[i] === "%") {
		return {
			tokens: [{ type: "char", value: "%" }],
			nextIdx: i + 1,
		};
	}

	// \&[ID] 実体参照展開 (\&[amp], \&[lt], \&[gt], \&[quot], \&[apos], \&[nbsp])
	if (script[i] === "&" && script[i + 1] === "[") {
		const parsed = readBracketContent(script, i + 1);
		if (parsed) {
			const id = parsed.content.trim().toLowerCase();
			let resolved = "";
			switch (id) {
				case "amp":
					resolved = "&";
					break;
				case "lt":
					resolved = "<";
					break;
				case "gt":
					resolved = ">";
					break;
				case "quot":
					resolved = '"';
					break;
				case "apos":
					resolved = "'";
					break;
				case "nbsp":
					resolved = " ";
					break;
				default:
					resolved = `&[${parsed.content}]`;
					break;
			}
			return {
				tokens: resolved.split("").map((ch) => ({ type: "char", value: ch })),
				nextIdx: parsed.nextIdx,
			};
		}
		return { tokens: [], nextIdx: i + 1 };
	}

	return null;
}
