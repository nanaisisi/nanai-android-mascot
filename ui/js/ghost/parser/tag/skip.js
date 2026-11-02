/**
 * @file skip.js
 * @brief 未知タグ・引数ブラケットのスキップ処理
 */

import { readBracketContent } from "../bracket-utils.js";

/**
 * 未知タグおよび引数ブラケットを読み飛ばす
 * @param {string} script - スクリプト文字列
 * @param {number} i - `\` 直後のインデックス
 * @param {number} len - スクリプト長
 * @returns {{ tokens: import('../../sakura-parser.js').SakuraScriptToken[], nextIdx: number }}
 */
export function skipUnknownTag(script, i, len) {
	const char = script[i];
	let nextIdx = i + 1;

	// \_x や \__v のようなアンダースコアで始まるタグ名（[ 直前まで）をスキップ
	if (char === "_") {
		while (
			nextIdx < len &&
			script[nextIdx] !== "[" &&
			script[nextIdx] !== "\\"
		) {
			nextIdx++;
		}
	}

	// 引数 [ ... ] があれば本文に出さず読み飛ばす
	if (nextIdx < len && script[nextIdx] === "[") {
		const parsed = readBracketContent(script, nextIdx);
		if (parsed) {
			nextIdx = parsed.nextIdx;
		} else {
			nextIdx++;
		}
	}

	return {
		tokens: [],
		nextIdx,
	};
}
