/**
 * @file sakura-script.ts
 * @brief Nanai Android Mascot - さくらスクリプト（SakuraScript）プレイヤー
 */

import { emit, isTauriAvailable, listen } from "../core/tauri-helper.js";
import { SakuraCommandHandler } from "./sakura-command-handler.js";
import { parseSakuraScriptAsync } from "./sakura-parser.js";
import { playScript } from "./sakura-play.js";

export class SakuraScriptPlayer {
	app: unknown;
	isPlaying: boolean;
	skipRequested: boolean;
	currentScope: number;
	playbackId: number;
	timeCritical: boolean;
	choiceTimeout: number;
	choiceTimeoutTimer: unknown;
	balloonTimeout: number;
	balloonTimeoutTimer: unknown;
	lastScript: string;
	commandHandler: SakuraCommandHandler;
	currentProgressIndex?: number;
	_restoreTimer?: unknown;
	_pauseResolver?: unknown;
	_sleepResolvers?: Set<(...args: unknown[]) => any>;
	[key: string]: unknown;

	constructor(app: unknown) {
		this.app = app;
		this.isPlaying = false;
		this.skipRequested = false;
		this.currentScope = 0;
		this.playbackId = 0;
		this.timeCritical = false;
		this.choiceTimeout = 0;
		this.choiceTimeoutTimer = null;
		this.balloonTimeout = 0;
		this.balloonTimeoutTimer = null;
		this.lastScript = "";

		this.commandHandler = new SakuraCommandHandler(this);

		if (isTauriAvailable()) {
			listen("balloon-choice-selected", (event: unknown) => {
				const { choiceId, choiceText } = event.payload || {};
				if (choiceId) {
					this.onChoiceSelected(choiceId, choiceText || "");
				}
			});
			listen("balloon-anchor-selected", (event: unknown) => {
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
			listen("balloon-ready", (event: unknown) => {
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

	async parse(script: string) {
		return await parseSakuraScriptAsync(script);
	}

	async play(script: string) {
		return await playScript(this, script);
	}

	scheduleSurfaceRestore(targetPlaybackId: number) {
		if (this._restoreTimer) {
			clearTimeout(this._restoreTimer);
		}
		this._restoreTimer = setTimeout(async () => {
			if (this.playbackId === targetPlaybackId && !this.isPlaying) {
				try {
					await this.app.ghostController.sendShioriEvent("OnSurfaceRestore");
				} catch (_e) {}
			}
		}, 8000);
	}

	skip() {
		if (this.isPlaying) {
			this.skipRequested = true;
			if (this.app?.ghostController?.sendBalloonBreakNotify) {
				const script = this.lastScript || "";
				const scopeId = this.currentScope || 0;
				const position = this.currentProgressIndex || 0;
				this.app.ghostController.sendBalloonBreakNotify(
					script,
					scopeId,
					position,
				);
			}
			if (typeof this._pauseResolver === "function") {
				const resolve = this._pauseResolver;
				this._pauseResolver = null;
				resolve();
			}
		}
	}

	async onChoiceTimeout() {
		if (this.choiceTimeoutTimer) {
			clearTimeout(this.choiceTimeoutTimer);
			this.choiceTimeoutTimer = null;
		}
		try {
			await this.app.ghostController?.sendShioriEvent("OnChoiceTimeout", [
				this.lastScript || "",
			]);
		} catch (_e) {}
	}

	async onChoiceSelected(
		choiceId: string,
		choiceText: string,
		extraArgs: string[] = [],
		choiceArgs: string[] = [],
	) {
		console.log(`💡 選択肢選択: ${choiceId} (${choiceText})`);
		if (this.choiceTimeoutTimer) {
			clearTimeout(this.choiceTimeoutTimer);
			this.choiceTimeoutTimer = null;
		}
		const allExtraArgs = choiceArgs.length > 0 ? choiceArgs : extraArgs;
		if (choiceId.startsWith("On")) {
			await this.app.ghostController.sendShioriEvent(choiceId, [
				choiceText,
				...allExtraArgs,
			]);
		} else {
			// UKADOC: OnChoiceSelectEx is sent first (Reference0: text, Reference1: ID, Reference2..N: args)
			try {
				const resEx: unknown = await this.app.ghostController?.sendShioriEvent?.(
					"OnChoiceSelectEx",
					[choiceText, choiceId, ...allExtraArgs],
				);
				if (resEx && (resEx.response || resEx.script)) {
					return;
				}
			} catch (_e) {}
			await this.app.ghostController.sendShioriEvent("OnChoiceSelect", [
				choiceId,
				choiceText,
			]);
		}
	}

	sleep(ms: number) {
		return new Promise<void>((resolve) => {
			let timer: unknown = null;
			const onCancel = () => {
				if (timer) clearTimeout(timer);
				resolve();
			};
			timer = setTimeout(() => {
				this._sleepResolvers?.delete(onCancel);
				resolve();
			}, ms);
			if (!this._sleepResolvers) this._sleepResolvers = new Set();
			this._sleepResolvers.add(onCancel);
		});
	}

	destroy() {
		this.isPlaying = false;
		this.playbackId++;
		if (this._restoreTimer) {
			clearTimeout(this._restoreTimer);
			this._restoreTimer = null;
		}
		if (this.choiceTimeoutTimer) {
			clearTimeout(this.choiceTimeoutTimer);
			this.choiceTimeoutTimer = null;
		}
		if (this.balloonTimeoutTimer) {
			clearTimeout(this.balloonTimeoutTimer);
			this.balloonTimeoutTimer = null;
		}
		if (typeof this._pauseResolver === "function") {
			const resolve = this._pauseResolver;
			this._pauseResolver = null;
			resolve();
		}
		if (this._sleepResolvers) {
			for (const cancel of this._sleepResolvers) {
				cancel();
			}
			this._sleepResolvers.clear();
		}
	}

	waitForClickOrTimeout(element: HTMLElement | null, timeoutMs = 15000) {
		return new Promise<void>((resolve) => {
			let timer: unknown = null;
			let resolved = false;

			const done = () => {
				if (resolved) return;
				resolved = true;
				this._pauseResolver = null;
				if (timer) clearTimeout(timer);
				element?.removeEventListener?.("click", onClick);
				if (typeof document !== "undefined" && document.removeEventListener) {
					document.removeEventListener("keydown", onKey);
				}
				resolve();
			};

			this._pauseResolver = done;

			const onClick = (e: MouseEvent) => {
				e.stopPropagation();
				done();
			};
			const onKey = (e: KeyboardEvent) => {
				if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
					done();
				}
			};

			element?.addEventListener?.("click", onClick as EventListener);
			if (typeof document !== "undefined" && document.addEventListener) {
				document.addEventListener("keydown", onKey as EventListener);
			}
			if (!this.timeCritical && timeoutMs > 0) {
				timer = setTimeout(done, timeoutMs);
			}
		});
	}
}

export { parseSakuraScript } from "./sakura-tokenizer.js";
