/**
 * @file text-format.js
 * @brief 改行・クリア・ポーズ・描画速度・フォントタグのトークナイズ処理 (\n, \c, \x, \_q, \f)
 */

import { readBracketContent, splitBracketArgs } from "../bracket-utils.js";

/**
 * 改行・クリア・ポーズ・描画速度・フォントタグを解析
 * @param {string} script - スクリプト文字列
 * @param {number} i - `\` 直後のインデックス
 * @param {number} _len - スクリプト長
 * @returns {{ tokens: import('../../sakura-parser.js').SakuraScriptToken[], nextIdx: number } | null}
 */
export function tokenizeTextFormatTag(script, i, _len) {
	const char = script[i];

	// \_n (自動改行無効トグル: NewLineNoPause)
	if (char === "_" && script[i + 1] === "n") {
		return {
			tokens: [{ type: "no_autowrap" }],
			nextIdx: i + 2,
		};
	}

	// \_? / \_! (生テキスト・スクリプト無効化トグル)
	if (char === "_" && (script[i + 1] === "?" || script[i + 1] === "!")) {
		return {
			tokens: [
				{
					type: "raw_toggle",
					active: true,
					delimiter: `_${script[i + 1]}`,
				},
			],
			nextIdx: i + 2,
		};
	}

	// \n (改行)
	if (char === "n") {
		i++;
		if (script.substr(i, 6) === "[half]") {
			return {
				tokens: [{ type: "newline", half: true }],
				nextIdx: i + 6,
			};
		}
		return {
			tokens: [{ type: "newline", half: false }],
			nextIdx: i,
		};
	}

	// \c (クリア: \c, \c[char,N], \c[line,N])
	if (char === "c") {
		i++;
		if (script[i] === "[") {
			const parsed = readBracketContent(script, i);
			if (parsed) {
				const parts = splitBracketArgs(parsed.content);
				if (parts[0] === "char" || parts[0] === "line") {
					return {
						tokens: [
							{
								type: "clear",
								mode: parts[0],
								count: Number.parseInt(parts[1], 10) || 1,
							},
						],
						nextIdx: parsed.nextIdx,
					};
				}
				return {
					tokens: [{ type: "clear" }],
					nextIdx: parsed.nextIdx,
				};
			}
			return { tokens: [{ type: "clear" }], nextIdx: i };
		}
		return { tokens: [{ type: "clear" }], nextIdx: i };
	}

	// \x (クリック待ち・改ページ: \x, \x[noclear])
	if (char === "x") {
		i++;
		if (script[i] === "[") {
			const parsed = readBracketContent(script, i);
			if (parsed) {
				const opt = parsed.content.trim().toLowerCase();
				return {
					tokens: [
						{
							type: "pause",
							noClear: opt === "noclear",
						},
					],
					nextIdx: parsed.nextIdx,
				};
			}
			return { tokens: [{ type: "pause" }], nextIdx: i };
		}
		return { tokens: [{ type: "pause" }], nextIdx: i };
	}

	// \_q / \_q[1] / \_q[0] (クイック描画切替)
	if (char === "_" && script[i + 1] === "q") {
		if (script[i + 2] === "[") {
			const parsed = readBracketContent(script, i + 2);
			if (parsed) {
				const val = parsed.content.trim();
				return {
					tokens: [
						{
							type: "quick_toggle",
							value: val !== "0" && val !== "false",
						},
					],
					nextIdx: parsed.nextIdx,
				};
			}
			return {
				tokens: [{ type: "quick_toggle", value: true }],
				nextIdx: i + 2,
			};
		}
		return {
			tokens: [{ type: "quick_toggle", value: undefined }],
			nextIdx: i + 2,
		};
	}

	// \_u[0xXXXX] または \_u[XXXX] (UCS-2 / Unicode 文字コード埋め込み)
	if (char === "_" && script[i + 1] === "u" && script[i + 2] === "[") {
		const parsed = readBracketContent(script, i + 2);
		if (parsed) {
			const raw = parsed.content.trim();
			const code =
				raw.startsWith("0x") || raw.startsWith("0X")
					? Number.parseInt(raw.slice(2), 16)
					: Number.parseInt(raw, 10);
			if (!Number.isNaN(code) && code >= 0 && code <= 0x10ffff) {
				return {
					tokens: [{ type: "char", value: String.fromCodePoint(code) }],
					nextIdx: parsed.nextIdx,
				};
			}
			return { tokens: [], nextIdx: parsed.nextIdx };
		}
		return { tokens: [], nextIdx: i + 2 };
	}

	// \_m[0xXX] または \_m[XX] (ASCII 文字コード埋め込み)
	if (char === "_" && script[i + 1] === "m" && script[i + 2] === "[") {
		const parsed = readBracketContent(script, i + 2);
		if (parsed) {
			const raw = parsed.content.trim();
			const code =
				raw.startsWith("0x") || raw.startsWith("0X")
					? Number.parseInt(raw.slice(2), 16)
					: Number.parseInt(raw, 10);
			if (!Number.isNaN(code) && code >= 0 && code <= 0xff) {
				return {
					tokens: [{ type: "char", value: String.fromCharCode(code) }],
					nextIdx: parsed.nextIdx,
				};
			}
			return { tokens: [], nextIdx: parsed.nextIdx };
		}
		return { tokens: [], nextIdx: i + 2 };
	}

	// \f (フォント指定: \f[tag,param], \f[tag])
	if (char === "f" && script[i + 1] === "[") {
		const parsed = readBracketContent(script, i + 1);
		if (parsed) {
			const parts = splitBracketArgs(parsed.content);
			return {
				tokens: [
					{
						type: "font",
						tag: parts[0] || "",
						param: parts.length > 1 ? parts.slice(1).join(",") : null,
					},
				],
				nextIdx: parsed.nextIdx,
			};
		}
		return { tokens: [], nextIdx: i + 1 };
	}

	return null;
}
