/**
 * @file escape.js
 * @brief エスケープ文字（\\, \%）のトークナイズ処理
 */

/**
 * エスケープ文字を解析
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

	return null;
}
