/**
 * @file interactive.js
 * @brief アンカー・内部コマンド・メッセージ・選択肢タグのトークナイズ処理 (\_a, \!, \m, \q, \__q)
 */

import { readBracketContent, splitBracketArgs } from "../bracket-utils.js";

/**
 * アンカー・内部コマンド・メッセージ・選択肢タグを解析
 * @param {string} script - スクリプト文字列
 * @param {number} i - `\` 直後のインデックス
 * @param {number} _len - スクリプト長
 * @returns {{ tokens: import('../../sakura-parser.js').SakuraScriptToken[], nextIdx: number } | null}
 */
export function tokenizeInteractiveTag(script, i, _len) {
	const char = script[i];

	// \_a[ID,arg...] / \_a (アンカーリンク)
	if (char === "_" && script[i + 1] === "a") {
		if (script[i + 2] === "[") {
			const parsed = readBracketContent(script, i + 2);
			if (parsed) {
				const args = splitBracketArgs(parsed.content);
				return {
					tokens: [
						{
							type: "anchor_begin",
							id: args[0] || "",
							args,
						},
					],
					nextIdx: parsed.nextIdx,
				};
			}
			return { tokens: [], nextIdx: i + 2 };
		}
		return {
			tokens: [{ type: "anchor_end" }],
			nextIdx: i + 2,
		};
	}

	// \![command,arg,...] (内部コマンド)
	if (char === "!" && script[i + 1] === "[") {
		const parsed = readBracketContent(script, i + 1);
		if (parsed) {
			const args = splitBracketArgs(parsed.content);
			return {
				tokens: [{ type: "command", args }],
				nextIdx: parsed.nextIdx,
			};
		}
		return { tokens: [], nextIdx: i + 1 };
	}

	// \m[umsg,wparam,lparam] (ウィンドウメッセージ送信 / PostMessage)
	if (char === "m" && script[i + 1] === "[") {
		const parsed = readBracketContent(script, i + 1);
		if (parsed) {
			const parts = splitBracketArgs(parsed.content);
			return {
				tokens: [
					{
						type: "post_message",
						umsg: parts[0] || "",
						wparam: parts[1] || "",
						lparam: parts[2] || "",
					},
				],
				nextIdx: parsed.nextIdx,
			};
		}
		return { tokens: [], nextIdx: i + 1 };
	}

	// \__q[ID,...] / \__q (インライン選択肢スコープ)
	if (char === "_" && script[i + 1] === "_" && script[i + 2] === "q") {
		if (script[i + 3] === "[") {
			const parsed = readBracketContent(script, i + 3);
			if (parsed) {
				const args = splitBracketArgs(parsed.content);
				return {
					tokens: [
						{
							type: "choice_scope_begin",
							id: args[0] || "",
							args,
						},
					],
					nextIdx: parsed.nextIdx,
				};
			}
			return { tokens: [], nextIdx: i + 3 };
		}
		return {
			tokens: [{ type: "choice_scope_end" }],
			nextIdx: i + 3,
		};
	}

	// \q[テキスト,ID] (選択肢)
	if (char === "q" && script[i + 1] === "[") {
		const parsed = readBracketContent(script, i + 1);
		if (parsed) {
			const parts = splitBracketArgs(parsed.content);
			if (parts.length >= 3 && parts[0] === "temp") {
				return {
					tokens: [
						{
							type: "choice",
							text: parts[1] || "",
							id: parts[2] || "",
							args: parts.slice(3),
						},
					],
					nextIdx: parsed.nextIdx,
				};
			}
			return {
				tokens: [
					{
						type: "choice",
						text: parts[0] || "",
						id: parts[1] || "",
						args: parts.slice(2),
					},
				],
				nextIdx: parsed.nextIdx,
			};
		}
		return { tokens: [], nextIdx: i + 1 };
	}

	return null;
}
