/**
 * @file tag-tokenizer.js
 * @brief さくらスクリプト（SakuraScript）タグ個別解析・トークナイザー（ファサード）
 *
 * モジュール構成:
 * - `tag/escape.js`: エスケープ文字（\\, \%）のトークナイズ
 * - `tag/scope-surface.js`: スコープ・サーフィス・アニメーション（\0, \1, \p, \s, \i）のトークナイズ
 * - `tag/wait.js`: ウェイト・タイムアウト・停止・終了（\w, \_w, \__w, \t, \-, \e）のトークナイズ
 * - `tag/text-format.js`: 改行・クリア・ポーズ・クイック・フォント（\n, \c, \x, \_q, \f）のトークナイズ
 * - `tag/interactive.js`: アンカー・コマンド・メッセージ・選択肢（\_a, \!, \m, \q）のトークナイズ
 * - `tag/display.js`: 座標移動・同期表示・バルーン（\_l, \_s, \b）のトークナイズ
 * - `tag/skip.js`: 未知タグ・引数ブラケットの読み飛ばし処理
 */

import { tokenizeDisplayTag } from "./tag/display.js";
import { tokenizeEscapeTag } from "./tag/escape.js";
import { tokenizeInteractiveTag } from "./tag/interactive.js";
import { tokenizeScopeSurfaceTag } from "./tag/scope-surface.js";
import { skipUnknownTag } from "./tag/skip.js";
import { tokenizeTextFormatTag } from "./tag/text-format.js";
import { tokenizeWaitTag } from "./tag/wait.js";

export {
	skipUnknownTag,
	tokenizeDisplayTag,
	tokenizeEscapeTag,
	tokenizeInteractiveTag,
	tokenizeScopeSurfaceTag,
	tokenizeTextFormatTag,
	tokenizeWaitTag,
};

/**
 * \ で始まるタグまたはエスケープ文字を解析し、生成されたトークン列と次のインデックスを返す
 * @param {string} script - スクリプト文字列
 * @param {number} backslashIdx - `\` の位置
 * @param {number} len - スクリプト長
 * @returns {{ tokens: import('../sakura-parser.js').SakuraScriptToken[], nextIdx: number, haltParsing?: boolean }}
 */
export function tokenizeTag(script, backslashIdx, len) {
	const i = backslashIdx + 1;
	if (i >= len) {
		return { tokens: [], nextIdx: len };
	}

	// 1. エスケープ文字 (\\, \%)
	const escapeRes = tokenizeEscapeTag(script, i, len);
	if (escapeRes) {
		return escapeRes;
	}

	// 2. スコープ・サーフィス・アニメーション (\0, \h, \1, \u, \p, \s, \i)
	const scopeSurfaceRes = tokenizeScopeSurfaceTag(script, i, len);
	if (scopeSurfaceRes) {
		return scopeSurfaceRes;
	}

	// 3. ウェイト・タイムアウト・停止・終了 (\w, \_w, \__w, \t, \-, \e)
	const waitRes = tokenizeWaitTag(script, i, len);
	if (waitRes) {
		return waitRes;
	}

	// 4. 改行・クリア・ポーズ・クイック・フォント (\n, \c, \x, \_q, \f)
	const textFormatRes = tokenizeTextFormatTag(script, i, len);
	if (textFormatRes) {
		return textFormatRes;
	}

	// 5. アンカー・コマンド・メッセージ・選択肢 (\_a, \!, \m, \q)
	const interactiveRes = tokenizeInteractiveTag(script, i, len);
	if (interactiveRes) {
		return interactiveRes;
	}

	// 6. 座標移動・同期表示・バルーン (\_l, \_s, \b)
	const displayRes = tokenizeDisplayTag(script, i, len);
	if (displayRes) {
		return displayRes;
	}

	// 7. 未知タグのスキップ
	return skipUnknownTag(script, i, len);
}
