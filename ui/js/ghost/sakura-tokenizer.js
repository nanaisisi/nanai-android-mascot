/**
 * 括弧内の引数文字列をカンマ区切りでパースする。
 * UKADOC [notes_escape.md]:
 * - ダブルクォート `"` で囲まれた区間では、カンマ `,` は区切り文字とみなされない。
 * - クォート内の `""` は単一の `"` としてエスケープ解決される。
 * - 外側クォートおよび前後の空白は除去される。
 * @param {string} content
 * @returns {string[]}
 */
export function splitBracketArgs(content) {
	const args = [];
	let current = "";
	let inQuotes = false;
	const len = content.length;
	let idx = 0;

	while (idx < len) {
		const ch = content[idx];
		if (ch === '"') {
			if (inQuotes) {
				if (idx + 1 < len && content[idx + 1] === '"') {
					current += '"';
					idx += 2;
					continue;
				}
				inQuotes = false;
			} else {
				inQuotes = true;
			}
		} else if (ch === "," && !inQuotes) {
			args.push(current.trim());
			current = "";
		} else {
			current += ch;
		}
		idx++;
	}
	args.push(current.trim());
	return args;
}

/**
 * [ ... ] の引数を安全に読み取り、`\]` エスケープを考慮する。
 * @param {string} script
 * @param {number} startIdx - `[` の位置
 * @returns {{ content: string, nextIdx: number } | null}
 */
function readBracketContent(script, startIdx) {
	if (script[startIdx] !== "[") return null;
	let j = startIdx + 1;
	let content = "";
	const len = script.length;

	while (j < len) {
		if (script[j] === "\\" && script[j + 1] === "]") {
			content += "]";
			j += 2;
			continue;
		}
		if (script[j] === "]") {
			return { content, nextIdx: j + 1 };
		}
		content += script[j];
		j++;
	}
	return null;
}

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
			i++;
			if (i >= len) break;

			// エスケープされたバックスラッシュ: \\ -> 通常文字 '\'
			if (script[i] === "\\") {
				tokens.push({ type: "char", value: "\\" });
				i++;
				continue;
			}

			// エスケープされたパーセント: \% -> 通常文字 '%'
			if (script[i] === "%") {
				tokens.push({ type: "char", value: "%" });
				i++;
				continue;
			}

			const char = script[i];

			// \0 または \h (メインキャラ指定)
			if (char === "0" || char === "h") {
				tokens.push({ type: "scope", value: 0 });
				i++;
			}
			// \1 または \u (サブキャラ指定)
			else if (char === "1" || char === "u") {
				tokens.push({ type: "scope", value: 1 });
				i++;
			}
			// \p[n] または \p0..\p9 (スコープ指定)
			else if (char === "p") {
				i++;
				if (script[i] === "[") {
					const parsed = readBracketContent(script, i);
					if (parsed) {
						const scopeVal = Number.parseInt(parsed.content.trim(), 10) || 0;
						tokens.push({ type: "scope", value: scopeVal });
						i = parsed.nextIdx;
					} else {
						i++;
					}
				} else if (/\d/.test(script[i])) {
					tokens.push({
						type: "scope",
						value: Number.parseInt(script[i], 10),
					});
					i++;
				}
			}
			// \s (サーフィス指定: \s0 または \s[10], \s[-1])
			else if (char === "s") {
				i++;
				if (script[i] === "[") {
					const parsed = readBracketContent(script, i);
					if (parsed) {
						const val = parsed.content.trim();
						const parsedId = Number.parseInt(val, 10);
						tokens.push({
							type: "surface",
							value: Number.isNaN(parsedId) ? 0 : parsedId,
						});
						i = parsed.nextIdx;
					} else {
						i++;
					}
				} else if (/\d/.test(script[i])) {
					tokens.push({
						type: "surface",
						value: Number.parseInt(script[i], 10),
					});
					i++;
				}
			}
			// \i (アニメーション呼出: \i[ID], \i[ID,wait], \i[name], \i1〜\i9)
			else if (char === "i") {
				i++;
				if (script[i] === "[") {
					const parsed = readBracketContent(script, i);
					if (parsed) {
						const parts = splitBracketArgs(parsed.content);
						const rawTarget = parts[0] || "";
						const animId = Number.parseInt(rawTarget, 10);
						const wait = parts[1]?.toLowerCase() === "wait";
						tokens.push({
							type: "animation",
							animId: Number.isNaN(animId) ? rawTarget : animId,
							wait,
						});
						i = parsed.nextIdx;
					} else {
						i++;
					}
				} else if (/\d/.test(script[i])) {
					tokens.push({
						type: "animation",
						animId: Number.parseInt(script[i], 10),
						wait: false,
					});
					i++;
				}
			}
			// \w1 〜 \w9 (ウェイト)
			else if (char === "w" && /\d/.test(script[i + 1])) {
				i++;
				const weight = Number.parseInt(script[i], 10);
				tokens.push({ type: "wait", value: weight * 50 });
				i++;
			}
			// \_w[ms] (ミリ秒ウェイト)
			else if (char === "_" && script[i + 1] === "w" && script[i + 2] === "[") {
				const parsed = readBracketContent(script, i + 2);
				if (parsed) {
					const ms = Number.parseInt(parsed.content.trim(), 10) || 100;
					tokens.push({ type: "wait", value: ms });
					i = parsed.nextIdx;
				} else {
					i += 2;
				}
			}
			// \__w[animation,ID] (アニメーション再生終了待ち)
			else if (
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
						tokens.push({
							type: "wait_animation",
							animId: Number.isNaN(num) ? rawTarget : num,
						});
					}
					i = parsed.nextIdx;
				} else {
					i += 3;
				}
			}
			// \n (改行)
			else if (char === "n") {
				i++;
				if (script.substr(i, 6) === "[half]") {
					tokens.push({ type: "newline", half: true });
					i += 6;
				} else {
					tokens.push({ type: "newline", half: false });
				}
			}
			// \c (クリア: \c, \c[char,N], \c[line,N])
			else if (char === "c") {
				i++;
				if (script[i] === "[") {
					const parsed = readBracketContent(script, i);
					if (parsed) {
						const parts = splitBracketArgs(parsed.content);
						if (parts[0] === "char" || parts[0] === "line") {
							tokens.push({
								type: "clear",
								mode: parts[0],
								count: Number.parseInt(parts[1], 10) || 1,
							});
						} else {
							tokens.push({ type: "clear" });
						}
						i = parsed.nextIdx;
					} else {
						tokens.push({ type: "clear" });
					}
				} else {
					tokens.push({ type: "clear" });
				}
			}
			// \x (クリック待ち・改ページ: \x, \x[noclear])
			else if (char === "x") {
				i++;
				if (script[i] === "[") {
					const parsed = readBracketContent(script, i);
					if (parsed) {
						const opt = parsed.content.trim().toLowerCase();
						tokens.push({
							type: "pause",
							noClear: opt === "noclear",
						});
						i = parsed.nextIdx;
					} else {
						tokens.push({ type: "pause" });
					}
				} else {
					tokens.push({ type: "pause" });
				}
			}
			// \_q / \_q[1] / \_q[0] (クイック描画切替)
			else if (char === "_" && script[i + 1] === "q") {
				if (script[i + 2] === "[") {
					const parsed = readBracketContent(script, i + 2);
					if (parsed) {
						const val = parsed.content.trim();
						tokens.push({
							type: "quick_toggle",
							value: val !== "0" && val !== "false",
						});
						i = parsed.nextIdx;
					} else {
						tokens.push({ type: "quick_toggle", value: true });
						i += 2;
					}
				} else {
					tokens.push({ type: "quick_toggle", value: undefined });
					i += 2;
				}
			}
			// \_a[ID,arg...] / \_a (アンカーリンク)
			else if (char === "_" && script[i + 1] === "a") {
				if (script[i + 2] === "[") {
					const parsed = readBracketContent(script, i + 2);
					if (parsed) {
						const args = splitBracketArgs(parsed.content);
						tokens.push({
							type: "anchor_begin",
							id: args[0] || "",
							args,
						});
						i = parsed.nextIdx;
					} else {
						i += 2;
					}
				} else {
					tokens.push({ type: "anchor_end" });
					i += 2;
				}
			}
			// \![command,arg,...] (内部コマンド)
			else if (char === "!" && script[i + 1] === "[") {
				const parsed = readBracketContent(script, i + 1);
				if (parsed) {
					const args = splitBracketArgs(parsed.content);
					tokens.push({ type: "command", args });
					i = parsed.nextIdx;
				} else {
					i++;
				}
			}
			// \m[umsg,wparam,lparam] (ウィンドウメッセージ送信 / PostMessage)
			else if (char === "m" && script[i + 1] === "[") {
				const parsed = readBracketContent(script, i + 1);
				if (parsed) {
					const parts = splitBracketArgs(parsed.content);
					tokens.push({
						type: "post_message",
						umsg: parts[0] || "",
						wparam: parts[1] || "",
						lparam: parts[2] || "",
					});
					i = parsed.nextIdx;
				} else {
					i++;
				}
			}
			// \q[テキスト,ID] (選択肢)
			else if (char === "q" && script[i + 1] === "[") {
				const parsed = readBracketContent(script, i + 1);
				if (parsed) {
					const parts = splitBracketArgs(parsed.content);
					if (parts.length >= 3 && parts[0] === "temp") {
						tokens.push({
							type: "choice",
							text: parts[1] || "",
							id: parts[2] || "",
							args: parts.slice(3),
						});
					} else {
						tokens.push({
							type: "choice",
							text: parts[0] || "",
							id: parts[1] || "",
							args: parts.slice(2),
						});
					}
					i = parsed.nextIdx;
				} else {
					i++;
				}
			}
			// \_l[x,y] (座標移動)
			else if (char === "_" && script[i + 1] === "l" && script[i + 2] === "[") {
				const parsed = readBracketContent(script, i + 2);
				if (parsed) {
					const coords = splitBracketArgs(parsed.content);
					tokens.push({
						type: "offset",
						x: coords[0] || "0",
						y: coords[1] || "0",
					});
					i = parsed.nextIdx;
				} else {
					i += 2;
				}
			}
			// \_s (複数キャラ同期表示トグル / \_s[1], \_s[0])
			else if (char === "_" && script[i + 1] === "s") {
				if (script[i + 2] === "[") {
					const parsed = readBracketContent(script, i + 2);
					if (parsed) {
						const val = parsed.content.trim();
						tokens.push({
							type: "sync_toggle",
							value: val !== "0" && val !== "false",
						});
						i = parsed.nextIdx;
					} else {
						tokens.push({ type: "sync_toggle", value: true });
						i += 2;
					}
				} else {
					tokens.push({ type: "sync_toggle", value: undefined });
					i += 2;
				}
			}
			// \b (バルーン指定: \b[0], \b[-1], \b0..\b9)
			else if (char === "b") {
				i++;
				if (script[i] === "[") {
					const parsed = readBracketContent(script, i);
					if (parsed) {
						const val = Number.parseInt(parsed.content.trim(), 10);
						tokens.push({
							type: "balloon",
							value: Number.isNaN(val) ? 0 : val,
						});
						i = parsed.nextIdx;
					} else {
						i++;
					}
				} else if (/\d/.test(script[i])) {
					tokens.push({
						type: "balloon",
						value: Number.parseInt(script[i], 10),
					});
					i++;
				}
			}
			// \f (フォント指定: \f[tag,param], \f[tag])
			else if (char === "f" && script[i + 1] === "[") {
				const parsed = readBracketContent(script, i + 1);
				if (parsed) {
					const parts = splitBracketArgs(parsed.content);
					tokens.push({
						type: "font",
						tag: parts[0] || "",
						param: parts.length > 1 ? parts.slice(1).join(",") : null,
					});
					i = parsed.nextIdx;
				} else {
					i++;
				}
			}
			// \t (タイムアウト抑止)
			else if (char === "t") {
				tokens.push({ type: "timeout" });
				i++;
			}
			// \- (ゴースト終了)
			else if (char === "-") {
				tokens.push({ type: "halt" });
				i++;
			}
			// \e (終了)
			else if (char === "e") {
				tokens.push({ type: "end" });
				break;
			}
			// その他タグはスキップ
			else {
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
			}
		} else {
			// 通常テキスト文字
			tokens.push({ type: "char", value: script[i] });
			i++;
		}
	}

	return tokens;
}
