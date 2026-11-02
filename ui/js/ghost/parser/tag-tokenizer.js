/**
 * @file tag-tokenizer.js
 * @brief さくらスクリプト（SakuraScript）タグ個別解析・トークナイザー
 */

import { readBracketContent, splitBracketArgs } from "./bracket-utils.js";

/**
 * \ で始まるタグまたはエスケープ文字を解析し、生成されたトークン列と次のインデックスを返す
 * @param {string} script - スクリプト文字列
 * @param {number} backslashIdx - `\` の位置
 * @param {number} len - スクリプト長
 * @returns {{ tokens: import('../sakura-parser.js').SakuraScriptToken[], nextIdx: number, haltParsing?: boolean }}
 */
export function tokenizeTag(script, backslashIdx, len) {
	let i = backslashIdx + 1;
	if (i >= len) {
		return { tokens: [], nextIdx: len };
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

	// \w1 〜 \w9 (ウェイト)
	if (char === "w" && /\d/.test(script[i + 1])) {
		i++;
		const weight = Number.parseInt(script[i], 10);
		return {
			tokens: [{ type: "wait", value: weight * 50 }],
			nextIdx: i + 1,
		};
	}

	// \_w[ms] (ミリ秒ウェイト)
	if (char === "_" && script[i + 1] === "w" && script[i + 2] === "[") {
		const parsed = readBracketContent(script, i + 2);
		if (parsed) {
			const ms = Number.parseInt(parsed.content.trim(), 10) || 100;
			return {
				tokens: [{ type: "wait", value: ms }],
				nextIdx: parsed.nextIdx,
			};
		}
		return { tokens: [], nextIdx: i + 2 };
	}

	// \__w[animation,ID] (アニメーション再生終了待ち)
	if (
		char === "_" &&
		script[i + 1] === "_" &&
		script[i + 2] === "w" &&
		script[i + 3] === "["
	) {
		const parsed = readBracketContent(script, i + 3);
		if (parsed) {
			const parts = splitBracketArgs(parsed.content);
			if (parts[0]?.toLowerCase() === "animation" && parts[1]) {
				const rawTarget = parts[1];
				const num = Number.parseInt(rawTarget, 10);
				return {
					tokens: [
						{
							type: "wait_animation",
							animId: Number.isNaN(num) ? rawTarget : num,
						},
					],
					nextIdx: parsed.nextIdx,
				};
			}
			return { tokens: [], nextIdx: parsed.nextIdx };
		}
		return { tokens: [], nextIdx: i + 3 };
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

	// \t (タイムアウト抑止)
	if (char === "t") {
		return {
			tokens: [{ type: "timeout" }],
			nextIdx: i + 1,
		};
	}

	// \- (ゴースト終了)
	if (char === "-") {
		return {
			tokens: [{ type: "halt" }],
			nextIdx: i + 1,
		};
	}

	// \e (終了)
	if (char === "e") {
		return {
			tokens: [{ type: "end" }],
			nextIdx: i + 1,
			haltParsing: true,
		};
	}

	// その他タグはスキップ
	i++;
	// \_x や \__v のようなアンダースコアで始まるタグ名（[ 直前まで）をスキップ
	if (char === "_") {
		while (i < len && script[i] !== "[" && script[i] !== "\\") {
			i++;
		}
	}
	// 引数 [ ... ] があれば本文に出さず読み飛ばす
	if (i < len && script[i] === "[") {
		const parsed = readBracketContent(script, i);
		if (parsed) {
			i = parsed.nextIdx;
		} else {
			i++;
		}
	}

	return {
		tokens: [],
		nextIdx: i,
	};
}
