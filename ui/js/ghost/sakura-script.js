import {
	emit,
	invoke,
	isTauriAvailable,
	listen,
} from "../core/tauri-helper.js";
import { SakuraCommandHandler } from "./sakura-command-handler.js";
import { parseSakuraScriptAsync } from "./sakura-parser.js";

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

		this.commandHandler = new SakuraCommandHandler(this);

		if (isTauriAvailable()) {
			listen("balloon-choice-selected", (event) => {
				const { choiceId, choiceText } = event.payload || {};
				if (choiceId) {
					this.onChoiceSelected(choiceId, choiceText || "");
				}
			});
			listen("balloon-anchor-selected", (event) => {
				const { anchorId } = event.payload || {};
				if (anchorId) {
					this.app.ghostController.sendShioriEvent("OnAnchorSelect", [
						anchorId,
					]);
				}
			});
			listen("balloon-clicked", () => {
				this.skip();
			});
			listen("balloon-ready", (event) => {
				const sid = event.payload?.scopeId ?? 0;
				const html =
					(sid === 1
						? this.app.elements.keroBalloonText
						: this.app.elements.balloonText
					)?.innerHTML || "";
				emit(`update-balloon-content-${sid}`, {
					html,
					theme: this.app.currentBalloonTheme || "default",
				});
			});
		}
	}

	/**
	 * さくらスクリプト文字列を解析してトークン列に変換
	 */
	async parse(script) {
		return await parseSakuraScriptAsync(script);
	}

	/**
	 * トークン列をバルーンにアニメーション再生
	 */
	async play(script) {
		const tokens = await this.parse(script);
		this.playbackId++;
		const currentId = this.playbackId;
		this.isPlaying = true;
		this.skipRequested = false;
		this.currentScope = 0;

		const sakuraText = this.app.elements.balloonText;
		const sakuraDisplay = this.app.elements.balloonDisplay;
		const keroText = this.app.elements.keroBalloonText;
		const keroDisplay = this.app.elements.keroBalloonDisplay;

		const hasTextContent = tokens.some(
			(t) =>
				t.type === "char" || t.type === "choice" || t.type === "anchor_begin",
		);

		// 発話文字や選択肢がある場合のみバルーンの内容を初期化・表示
		if (hasTextContent) {
			sakuraText.innerHTML = "";
			if (keroText) keroText.innerHTML = "";
			sakuraDisplay.style.display = "block";
			if (isTauriAvailable()) {
				invoke("show_balloon_window", { scopeId: 0 }).catch(() => {});
			}
		}

		let currentBalloonText = sakuraText;
		let isQuickMode = false;
		let currentAnchor = null;

		// 独立バルーン同期用ヘルパー
		const syncDesktopBalloon = () => {
			if (isTauriAvailable()) {
				emit(`update-balloon-content-${this.currentScope}`, {
					html:
						(this.currentScope === 1 ? keroText : sakuraText)?.innerHTML || "",
					theme: this.app.currentBalloonTheme || "default",
				});
			}
		};

		for (let j = 0; j < tokens.length; j++) {
			if (this.playbackId !== currentId) break; // 新しい再生で中断

			const token = tokens[j];

			switch (token.type) {
				case "scope":
					this.currentScope = token.value;
					if (this.currentScope === 1) {
						if (this.app.elements.keroSlot) {
							this.app.elements.keroSlot.style.display = "flex";
						}
						if (keroDisplay && keroText) {
							keroDisplay.style.display = "block";
							currentBalloonText = keroText;
						}
						if (isTauriAvailable() && hasTextContent) {
							invoke("show_balloon_window", { scopeId: 1 }).catch(() => {});
						}
					} else {
						if (this.app.elements.sakuraSlot) {
							this.app.elements.sakuraSlot.style.display = "flex";
						}
						sakuraDisplay.style.display = "block";
						currentBalloonText = sakuraText;
						if (isTauriAvailable() && hasTextContent) {
							invoke("show_balloon_window", { scopeId: 0 }).catch(() => {});
						}
					}
					break;

				case "char": {
					const span = document.createElement("span");
					span.textContent = token.value;
					if (this.currentFontStyles) {
						Object.assign(span.style, this.currentFontStyles);
					}
					if (currentAnchor) {
						currentAnchor.appendChild(span);
					} else {
						currentBalloonText.appendChild(span);
					}
					syncDesktopBalloon();

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
					syncDesktopBalloon();
					break;

				case "clear":
					currentBalloonText.innerHTML = "";
					syncDesktopBalloon();
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
					anchorSpan.setAttribute("data-anchor-id", token.id);
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
					syncDesktopBalloon();
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
					this.app.ghostController.updateSurface(
						token.value,
						this.currentScope,
					);
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
					choiceBtn.setAttribute("data-choice-id", token.id);
					choiceBtn.textContent = token.text;
					choiceBtn.addEventListener("click", (e) => {
						e.stopPropagation();
						this.onChoiceSelected(token.id, token.text);
					});
					currentBalloonText.appendChild(document.createElement("br"));
					currentBalloonText.appendChild(choiceBtn);
					syncDesktopBalloon();
					break;
				}

				case "balloon": {
					// \b[-1] でバルーン非表示、その他は表示
					const balloonDisplay =
						this.currentScope === 1 ? keroDisplay : sakuraDisplay;
					if (token.value === -1) {
						if (balloonDisplay) balloonDisplay.style.display = "none";
					} else {
						if (balloonDisplay) balloonDisplay.style.display = "block";
					}
					break;
				}

				case "timeout":
					// \t: タイムアウト抑止（自動消去の無効化）
					this.hasTimeoutSuppressed = true;
					break;

				case "halt":
					// \-: ゴースト終了
					await this.app.ghostController?.closeGhost?.();
					break;

				case "offset": {
					// \_l[x,y] バルーン内座標オフセット指定（spanのstyle指定で実現）
					const spacer = document.createElement("span");
					spacer.style.display = "inline-block";
					if (token.x.startsWith("@")) {
						spacer.style.marginLeft = `${token.x.slice(1)}px`;
					} else {
						spacer.style.position = "relative";
						spacer.style.left = `${token.x}px`;
					}
					if (token.y.startsWith("@")) {
						spacer.style.marginTop = `${token.y.slice(1)}px`;
					} else {
						spacer.style.top = `${token.y}px`;
					}
					currentBalloonText.appendChild(spacer);
					syncDesktopBalloon();
					break;
				}

				case "font": {
					// \f[color,red], \f[bold,1], \f[default]
					if (token.tag === "default") {
						this.currentFontStyles = {};
					} else if (token.tag === "color" && token.param) {
						this.currentFontStyles = this.currentFontStyles || {};
						this.currentFontStyles.color = token.param;
					} else if (token.tag === "bold") {
						this.currentFontStyles = this.currentFontStyles || {};
						this.currentFontStyles.fontWeight =
							token.param === "0" ? "normal" : "bold";
					} else if (token.tag === "italic") {
						this.currentFontStyles = this.currentFontStyles || {};
						this.currentFontStyles.fontStyle =
							token.param === "0" ? "normal" : "italic";
					}
					break;
				}

				case "command":
					await this.commandHandler.runCommand(token.args);
					break;

				case "end":
					break;
			}
		}

		syncDesktopBalloon();
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
