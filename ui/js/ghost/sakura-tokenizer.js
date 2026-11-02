/**
 * @file sakura-tokenizer.js
 * @brief さくらスクリプト（SakuraScript）トークナイザー（JS フォールバック）
 *
 * モジュール構成:
 * - `parser/bracket-utils.js`: 括弧 `[...]` 引数パースおよびクォート/エスケープ解決
 * - `parser/tag-tokenizer.js`: `\` タグおよびエスケープ文字のトークナイズ処理
 */

import {
	readBracketContent,
	splitBracketArgs,
} from "./parser/bracket-utils.js";
import { tokenizeTag } from "./parser/tag-tokenizer.js";

export { readBracketContent, splitBracketArgs };

/**
 * さくらスクリプト文字列を解析してトークン列に変換（JSフォールバックパーサー）
 * @typedef {import('./sakura-parser.js').SakuraScriptToken} SakuraScriptToken
 * @param {string} script
 * @returns {SakuraScriptToken[]}
 */
export function parseSakuraScript(script) {
	const tokens = [];
	let i = 0;
	const len = script.length;

	while (i < len) {
		if (script[i] === "\\") {
			const res = tokenizeTag(script, i, len);
			if (res.tokens.length > 0) {
				tokens.push(...res.tokens);
			}
			i = res.nextIdx;
			if (res.haltParsing) {
				break;
			}
		} else {
			// 通常テキスト文字
			tokens.push({ type: "char", value: script[i] });
			i++;
		}
	}

	return tokens;
}
