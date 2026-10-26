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
			// \p[n] (スコープ指定: \p[0], \p[1] 等)
			else if (char === "p" && script[i + 1] === "[") {
				const end = script.indexOf("]", i + 1);
				if (end !== -1) {
					const scopeVal =
						Number.parseInt(script.substring(i + 2, end), 10) || 0;
					tokens.push({ type: "scope", value: scopeVal });
					i = end + 1;
				} else {
					i++;
				}
			}
			// \s (サーフィス指定: \s0 または \s[10], \s[-1])
			else if (char === "s") {
				i++;
				if (script[i] === "[") {
					const end = script.indexOf("]", i);
					if (end !== -1) {
						const val = script.substring(i + 1, end).trim();
						const parsedId = Number.parseInt(val, 10);
						tokens.push({
							type: "surface",
							value: Number.isNaN(parsedId) ? 0 : parsedId,
						});
						i = end + 1;
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
			// \i (アニメーション呼出: \i[ID], \i[ID,wait], \i1〜\i9)
			else if (char === "i") {
				i++;
				if (script[i] === "[") {
					const end = script.indexOf("]", i);
					if (end !== -1) {
						const val = script.substring(i + 1, end).trim();
						const parts = val.split(",");
						const animId = Number.parseInt(parts[0], 10);
						const wait = parts[1]?.trim().toLowerCase() === "wait";
						tokens.push({
							type: "animation",
							animId: Number.isNaN(animId) ? 0 : animId,
							wait,
						});
						i = end + 1;
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
				const start = i + 3;
				const end = script.indexOf("]", start);
				if (end !== -1) {
					const ms = Number.parseInt(script.substring(start, end), 10) || 100;
					tokens.push({ type: "wait", value: ms });
					i = end + 1;
				} else {
					i += 2;
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
			// \c (クリア)
			else if (char === "c") {
				tokens.push({ type: "clear" });
				i++;
			}
			// \x (クリック待ち・改ページ)
			else if (char === "x") {
				tokens.push({ type: "pause" });
				i++;
			}
			// \_q (クイック描画切替)
			else if (char === "_" && script[i + 1] === "q") {
				tokens.push({ type: "quick_toggle" });
				i += 2;
			}
			// \_a[ID,arg...] / \_a (アンカーリンク)
			else if (char === "_" && script[i + 1] === "a") {
				if (script[i + 2] === "[") {
					const start = i + 3;
					const end = script.indexOf("]", start);
					if (end !== -1) {
						const content = script.substring(start, end);
						const args = content.split(",").map((s) => s.trim());
						tokens.push({
							type: "anchor_begin",
							id: args[0] || "",
							args,
						});
						i = end + 1;
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
				let j = i + 2;
				let content = "";
				while (j < len && script[j] !== "]") {
					// \] はエスケープされた ]
					if (script[j] === "\\" && script[j + 1] === "]") j++;
					content += script[j];
					j++;
				}
				const args = content
					.split(",")
					.map((s) => s.trim().replace(/^"|"$/g, ""));
				tokens.push({ type: "command", args });
				i = j + 1;
			}
			// \q[テキスト,ID] (選択肢)
			else if (char === "q" && script[i + 1] === "[") {
				const start = i + 2;
				const end = script.indexOf("]", start);
				if (end !== -1) {
					const content = script.substring(start, end);
					const comma = content.indexOf(",");
					const text = comma !== -1 ? content.substring(0, comma) : content;
					const id = comma !== -1 ? content.substring(comma + 1) : content;
					tokens.push({ type: "choice", text: text.trim(), id: id.trim() });
					i = end + 1;
				} else {
					i++;
				}
			}
			// \_l[x,y] (座標移動)
			else if (char === "_" && script[i + 1] === "l" && script[i + 2] === "[") {
				const start = i + 3;
				const end = script.indexOf("]", start);
				if (end !== -1) {
					const coords = script.substring(start, end).split(",");
					tokens.push({
						type: "offset",
						x: coords[0]?.trim() || "0",
						y: coords[1]?.trim() || "0",
					});
					i = end + 1;
				} else {
					i += 2;
				}
			}
			// \_s (複数キャラ同期表示トグル)
			else if (char === "_" && script[i + 1] === "s") {
				tokens.push({ type: "sync_toggle" });
				i += 2;
			}
			// \b (バルーン指定: \b[0], \b[-1], \b0..\b9)
			else if (char === "b") {
				i++;
				if (script[i] === "[") {
					const end = script.indexOf("]", i);
					if (end !== -1) {
						const val = Number.parseInt(
							script.substring(i + 1, end).trim(),
							10,
						);
						tokens.push({
							type: "balloon",
							value: Number.isNaN(val) ? 0 : val,
						});
						i = end + 1;
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
				const start = i + 2;
				const end = script.indexOf("]", start);
				if (end !== -1) {
					const content = script.substring(start, end);
					const parts = content.split(",").map((s) => s.trim());
					tokens.push({
						type: "font",
						tag: parts[0] || "",
						param: parts.length > 1 ? parts.slice(1).join(",") : null,
					});
					i = end + 1;
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
					let j = i + 1;
					while (j < len && script[j] !== "]") {
						if (script[j] === "\\" && script[j + 1] === "]") j++;
						j++;
					}
					i = j + 1;
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
