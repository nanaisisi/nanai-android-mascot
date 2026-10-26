import { parseSakuraScript } from "./sakura-parser.js";

/**
 * Nanai Android Mascot - さくらスクリプト（SakuraScript）プレイヤー
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
		return parseSakuraScript(script);
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
		let currentAnchor = null;

		for (let j = 0; j < tokens.length; j++) {
			if (this.playbackId !== currentId) break; // 新しい再生で中断

			const token = tokens[j];

			switch (token.type) {
				case "scope":
					this.currentScope = token.value;
					if (this.currentScope === 1) {
						if (keroDisplay && keroText) {
							keroDisplay.style.display = "block";
							currentBalloonText = keroText;
						}
					} else {
						sakuraDisplay.style.display = "block";
						currentBalloonText = sakuraText;
					}
					break;

				case "char": {
					const span = document.createElement("span");
					span.textContent = token.value;
					if (currentAnchor) {
						currentAnchor.appendChild(span);
					} else {
						currentBalloonText.appendChild(span);
					}

					// 文字送り時の口パク連動
					this.app.surfaceManager?.onCharSpoken(this.currentScope);

					if (!this.skipRequested && !isQuickMode) {
						await this.sleep(40);
					}
					break;
				}

				case "newline":
					if (token.half) {
						const halfBr = document.createElement("span");
						halfBr.style.display = "block";
						halfBr.style.height = "0.4em";
						currentBalloonText.appendChild(halfBr);
					} else {
						currentBalloonText.appendChild(document.createElement("br"));
					}
					break;

				case "clear":
					currentBalloonText.innerHTML = "";
					break;

				case "pause":
					// \x: クリックまたはタイムアウト待ち
					if (!this.skipRequested && !isQuickMode) {
						const activeDisplay =
							this.currentScope === 1 ? keroDisplay : sakuraDisplay;
						await this.waitForClickOrTimeout(activeDisplay);
					}
					break;

				case "anchor_begin": {
					const anchorSpan = document.createElement("span");
					anchorSpan.className = "balloon-anchor";
					anchorSpan.dataset.anchorId = token.id;
					anchorSpan.addEventListener("click", (e) => {
						e.stopPropagation();
						console.log(`🔗 アンカークリック: ${token.id}`);
						this.app.ghostController.sendShioriEvent("OnAnchorSelect", [
							token.id,
							...token.args,
						]);
					});
					currentBalloonText.appendChild(anchorSpan);
					currentAnchor = anchorSpan;
					break;
				}

				case "anchor_end":
					currentAnchor = null;
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
					this.app.ghostController.updateSurface(token.value, this.currentScope);
					break;

				case "animation":
					// \i[ID] / \i[ID,wait]: アニメーション直接再生
					await this.app.surfaceManager?.playAnimationById(
						token.animId,
						this.currentScope,
						token.wait,
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
		const rawCmd = (args[0] ?? "").toLowerCase();
		const rawSub = (args[1] ?? "").toLowerCase();

		if (rawCmd === "open" && rawSub === "inputbox") {
			this.openInputBox(args.slice(2));
		} else if (rawCmd === "raise") {
			// \![raise,EventName,Ref0,Ref1...]
			const eventName = args[1];
			if (eventName) {
				await this.app.ghostController.sendShioriEvent(eventName, args.slice(2));
			}
		} else if (rawCmd === "bind" || rawCmd === "bind-noevent") {
			// \![bind,category,part,status]
			const [category, part, statusVal] = args.slice(1);
			await this.app.surfaceManager?.bindDressup(
				category,
				part,
				statusVal,
				this.currentScope,
				rawCmd !== "bind-noevent",
			);
		} else if (rawCmd === "set" && rawSub === "alignmenttodesktop") {
			await this.setAlignmentToDesktop(args[2]);
		} else if (rawCmd === "update" || rawCmd === "updatebymyself") {
			await this.app.startNetworkUpdate?.();
		} else {
			console.debug("未対応の \\! コマンド:", args);
		}
	}

	/**
	 * \![open,inputbox,ID,...] の処理 (UKADOC準拠)
	 */
	openInputBox(params) {
		const id = params[0] || "UserInput";
		let timeoutMs = 0;
		let defaultText = "";
		let placeholder = "";

		for (let i = 1; i < params.length; i++) {
			const p = params[i] ?? "";
			if (p.startsWith("--timeout=")) {
				timeoutMs = Number.parseInt(p.replace("--timeout=", ""), 10) || 0;
			} else if (p.startsWith("--text=")) {
				defaultText = p.replace("--text=", "");
			} else if (p.startsWith("--placeholder=")) {
				placeholder = p.replace("--placeholder=", "");
			} else if (i === 1 && !p.startsWith("--")) {
				timeoutMs = Number.parseInt(p, 10) || 0;
			} else if (i === 2 && !p.startsWith("--")) {
				defaultText = p;
			}
		}

		const balloon =
			this.currentScope === 1
				? this.app.elements.keroBalloonText
				: this.app.elements.balloonText;
		if (!balloon) return;

		const form = document.createElement("div");
		form.className = "balloon-inputbox-form";
		form.style.marginTop = "0.5rem";
		form.style.display = "flex";
		form.style.gap = "0.25rem";

		const input = document.createElement("input");
		input.type = "text";
		input.className = "balloon-input";
		input.value = defaultText;
		input.placeholder = placeholder;
		input.style.flex = "1";
		input.style.fontSize = "0.8rem";
		input.style.padding = "0.2rem 0.4rem";
		input.style.borderRadius = "0.25rem";
		input.style.border = "1px solid var(--balloon-border-color, #888)";
		input.style.background = "var(--balloon-bg, #fff)";
		input.style.color = "var(--balloon-text-color, #000)";

		const submitBtn = document.createElement("button");
		submitBtn.textContent = "OK";
		submitBtn.className = "balloon-choice-btn";
		submitBtn.style.marginTop = "0";

		let timer = null;
		const cleanup = () => {
			if (timer) clearTimeout(timer);
			form.remove();
		};

		const submit = async () => {
			const val = input.value;
			cleanup();
			if (id.startsWith("On")) {
				await this.app.ghostController.sendShioriEvent(id, [val]);
			} else {
				await this.app.ghostController.sendShioriEvent("OnUserInput", [id, val]);
			}
		};

		const cancel = async () => {
			cleanup();
			await this.app.ghostController.sendShioriEvent("OnUserInputCancel", [id]);
		};

		submitBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			submit();
		});

		input.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				e.stopPropagation();
				submit();
			} else if (e.key === "Escape") {
				e.stopPropagation();
				cancel();
			}
		});

		form.appendChild(input);
		form.appendChild(submitBtn);
		balloon.appendChild(form);
		setTimeout(() => input.focus(), 50);

		if (timeoutMs > 0) {
			timer = setTimeout(() => {
				cleanup();
				this.app.ghostController.sendShioriEvent("OnUserInputCancel", [id]);
			}, timeoutMs);
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
		if (choiceId.startsWith("On")) {
			// SSP拡張: Onで始まるIDは直接そのイベントを発行
			await this.app.ghostController.sendShioriEvent(choiceId, [choiceText]);
		} else {
			await this.app.ghostController.sendShioriEvent("OnChoiceSelect", [
				choiceId,
				choiceText,
			]);
		}
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

export { parseSakuraScript } from "./sakura-parser.js";
