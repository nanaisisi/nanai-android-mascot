import { emit, isTauriAvailable, listen } from "../core/tauri-helper.js";
import { SakuraCommandHandler } from "./sakura-command-handler.js";
import { parseSakuraScriptAsync } from "./sakura-parser.js";
import { playScript } from "./sakura-play.js";

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
		/**
		 * `\t` タイムクリティカルセクション (UKADOC準拠)。
		 * スクリプトブレークか \e までマウス系イベント通知を抑止する。
		 * @type {boolean}
		 */
		this.timeCritical = false;

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
	 * トークン列をバルーンにアニメーション再生（本体は sakura-play.js）
	 */
	async play(script) {
		return await playScript(this, script);
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
	/**
	 * アニメーション早送り（スキップ）
	 */
	skip() {
		if (this.isPlaying) {
			this.skipRequested = true;
			if (typeof this._pauseResolver === "function") {
				const resolve = this._pauseResolver;
				this._pauseResolver = null;
				resolve();
			}
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
	waitForClickOrTimeout(element, timeoutMs = 15000) {
		return new Promise((resolve) => {
			let timer = null;
			let resolved = false;

			const done = () => {
				if (resolved) return;
				resolved = true;
				this._pauseResolver = null;
				if (timer) clearTimeout(timer);
				element?.removeEventListener("click", onClick);
				document.removeEventListener("keydown", onKey);
				resolve();
			};

			this._pauseResolver = done;

			const onClick = (e) => {
				e.stopPropagation();
				done();
			};
			const onKey = (e) => {
				if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
					done();
				}
			};

			element?.addEventListener("click", onClick);
			document.addEventListener("keydown", onKey);
			timer = setTimeout(done, timeoutMs);
		});
	}
}

export { parseSakuraScript } from "./sakura-parser.js";
