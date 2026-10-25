/**
 * Nanai Android Mascot - さくらスクリプト（SakuraScript）パーサー & プレイヤー
 */

/**
 * @typedef {Object} SakuraScriptToken
 * @property {string} type - トークン種別 ('scope'|'surface'|'wait'|'text'|'balloon'|'choice'|'reset'|'sync'等)
 * @property {any} [value] - トークンの値 (スコープ番号、サーフェス番号、テキスト等)
 * @property {Record<string, any>} [params] - オプションパラメータ
 */

export class SakuraScriptPlayer {
	/**
	 * @param {import('../../main.js').NanaiAndroidMascotApp} app
	 */
	constructor(app) {
		/** @type {import('../../main.js').NanaiAndroidMascotApp} */
		this.app = app;
		/** @type {boolean} */
		this.isPlaying = false;
		/** @type {boolean} */
		this.skipRequested = false;
		/** @type {number} */
		this.currentScope = 0; // 0: sakura, 1: kero
		/** @type {number} */
		this.playbackId = 0;
	}

	/**
	 * さくらスクリプト文字列を解析してトークン列に変換
	 */
	parse(script) {
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
						const scopeVal = parseInt(script.substring(i + 2, end), 10) || 0;
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
							const parsedId = parseInt(val, 10);
							tokens.push({
								type: "surface",
								value: Number.isNaN(parsedId) ? 0 : parsedId,
							});
							i = end + 1;
						} else {
							i++;
						}
					} else if (/\d/.test(script[i])) {
						tokens.push({ type: "surface", value: parseInt(script[i], 10) });
						i++;
					}
				}
				// \w1 〜 \w9 (ウェイト)
				else if (char === "w" && /\d/.test(script[i + 1])) {
					i++;
					const weight = parseInt(script[i], 10);
					tokens.push({ type: "wait", value: weight * 50 });
					i++;
				}
				// \_w[ms] (ミリ秒ウェイト)
				else if (
					char === "_" &&
					script[i + 1] === "w" &&
					script[i + 2] === "["
				) {
					const start = i + 3;
					const end = script.indexOf("]", start);
					if (end !== -1) {
						const ms = parseInt(script.substring(start, end), 10) || 100;
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

	/**
	 * トークン列をバルーンにアニメーション再生
	 */
	async play(script) {
		const tokens = this.parse(script);
		this.playbackId++;
		const currentId = this.playbackId;
		this.isPlaying = true;
		this.skipRequested = false;
		this.currentScope = 0;

		const sakuraText = this.app.elements.balloonText;
		const sakuraDisplay = this.app.elements.balloonDisplay;
		const keroText = this.app.elements.keroBalloonText;
		const keroDisplay = this.app.elements.keroBalloonDisplay;

		if (!sakuraText || !sakuraDisplay) return;

		sakuraText.innerHTML = "";
		sakuraDisplay.style.display = "block";
		if (keroText) keroText.innerHTML = "";

		let currentBalloonText = sakuraText;
		let isQuickMode = false;

		for (let j = 0; j < tokens.length; j++) {
			if (this.playbackId !== currentId) break; // 新しい再生で中断

			const token = tokens[j];

			switch (token.type) {
				case "scope":
					this.currentScope = token.value;
					if (this.currentScope === 1) {
						const keroSlot = document.getElementById("kero-slot");
						if (keroSlot && keroSlot.style.display === "none") {
							keroSlot.style.display = "flex";
						}
						if (keroText && keroDisplay) {
							currentBalloonText = keroText;
							keroDisplay.style.display = "block";
						}
					} else {
						currentBalloonText = sakuraText;
						sakuraDisplay.style.display = "block";
					}
					break;

				case "char":
					currentBalloonText.appendChild(document.createTextNode(token.value));
					if (!this.skipRequested && !isQuickMode) {
						const delay = /^[、。！？.?!]/.test(token.value) ? 120 : 40;
						await this.sleep(delay);
					}
					break;

				case "newline": {
					const br = document.createElement("br");
					if (token.half) br.className = "half-br";
					currentBalloonText.appendChild(br);
					break;
				}

				case "clear":
					currentBalloonText.innerHTML = "";
					break;

				case "pause":
					// \x: クリック待ち（またはスキップ/タイムアウト）
					if (!this.skipRequested) {
						await this.waitForClickOrTimeout(currentBalloonText, 10000);
					}
					currentBalloonText.innerHTML = "";
					break;

				case "quick_toggle":
					// \_q: クイック描画トグル
					isQuickMode = !isQuickMode;
					break;

				case "wait":
					if (!this.skipRequested && !isQuickMode) {
						await this.sleep(token.value);
					}
					break;

				case "surface":
					// 表情切り替え（スコープ別）
					this.app.ghostController.updateSurface(
						token.value,
						this.currentScope,
					);
					break;

				case "choice": {
					const choiceBtn = document.createElement("button");
					choiceBtn.className = "balloon-choice-btn";
					choiceBtn.textContent = token.text;
					choiceBtn.addEventListener("click", (e) => {
						e.stopPropagation();
						this.onChoiceSelected(token.id, token.text);
					});
					currentBalloonText.appendChild(document.createElement("br"));
					currentBalloonText.appendChild(choiceBtn);
					break;
				}

				case "command":
					await this.runCommand(token.args);
					break;

				case "end":
					break;
			}
		}

		this.isPlaying = false;
		this.scheduleSurfaceRestore(currentId);
	}

	/**
	 * 発話終了後のサーフィス自動復帰タイマー (OnSurfaceRestore)
	 */
	scheduleSurfaceRestore(targetPlaybackId) {
		if (this._restoreTimer) {
			clearTimeout(this._restoreTimer);
		}
		this._restoreTimer = setTimeout(async () => {
			if (this.playbackId === targetPlaybackId && !this.isPlaying) {
				try {
					await this.app.ghostController.sendShioriEvent("OnSurfaceRestore");
				} catch (_e) {
					// 復帰エラーは無視
				}
			}
		}, 8000);
	}

	/**
	 * \![...] 内部コマンドの実行
	 */
	async runCommand(args) {
		const [cmd, sub, value] = args.map((a) => (a ?? "").toLowerCase());
		if (cmd === "set" && sub === "alignmenttodesktop") {
			await this.setAlignmentToDesktop(value);
		} else if (cmd === "update" || cmd === "updatebymyself") {
			await this.app.startNetworkUpdate?.();
		} else {
			console.debug("未対応の \\! コマンド:", args);
		}
	}

	/**
	 * ウィンドウをデスクトップの端に揃える (free / top / bottom / left / right)
	 */
	async setAlignmentToDesktop(mode) {
		this.app.alignmentToDesktop = mode;
		if (mode === "free") return; // 自由配置: 何もしない
		try {
			const api = globalThis.__TAURI__?.window;
			if (!api) return;
			const win = api.getCurrentWindow();
			const monitor = await api.currentMonitor();
			if (!monitor) return;
			const size = await win.outerSize();
			const pos = await win.outerPosition();
			const { x: mx, y: my } = monitor.position;
			const { width: mw, height: mh } = monitor.size;
			let x = pos.x;
			let y = pos.y;
			if (mode === "bottom") y = my + mh - size.height;
			else if (mode === "top") y = my;
			else if (mode === "left") x = mx;
			else if (mode === "right") x = mx + mw - size.width;
			await win.setPosition(new api.PhysicalPosition(x, y));
		} catch (e) {
			console.warn("alignmenttodesktop 失敗:", e);
		}
	}

	/**
	 * アニメーション早送り（スキップ）
	 */
	skip() {
		if (this.isPlaying) {
			this.skipRequested = true;
		}
	}

	/**
	 * 選択肢クリック時の処理
	 */
	async onChoiceSelected(choiceId, choiceText) {
		console.log(`🎯 選択肢選択: ${choiceId} (${choiceText})`);
		// SHIORIにOnChoiceSelectイベント送信
		await this.app.ghostController.sendShioriEvent("OnChoiceSelect", [
			choiceId,
			choiceText,
		]);
	}

	sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * バルーンのクリックまたはタイムアウトを待つ (\x 制御)
	 */
	waitForClickOrTimeout(element, timeoutMs = 10000) {
		return new Promise((resolve) => {
			let timer = null;
			const cleanup = () => {
				if (timer) clearTimeout(timer);
				element?.removeEventListener("click", onClick);
				document.removeEventListener("keydown", onKey);
			};
			const onClick = (e) => {
				e.stopPropagation();
				cleanup();
				resolve();
			};
			const onKey = (e) => {
				if (e.key === "Enter" || e.key === " ") {
					cleanup();
					resolve();
				}
			};

			element?.addEventListener("click", onClick);
			document.addEventListener("keydown", onKey);
			timer = setTimeout(() => {
				cleanup();
				resolve();
			}, timeoutMs);
		});
	}
}
