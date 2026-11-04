import { emit, isTauriAvailable, listen } from "../core/tauri-helper.js";
import { SakuraCommandHandler } from "./sakura-command-handler.js";
import { parseSakuraScriptAsync } from "./sakura-parser.js";
import { playScript } from "./sakura-play.js";

/**
 * Nanai Android Mascot - さくらスクリプト（SakuraScript）プレイヤー
 */
export class SakuraScriptPlayer {
	app: any;
	isPlaying: boolean;
	skipRequested: boolean;
	currentScope: number;
	playbackId: number;
	timeCritical: boolean;
	choiceTimeout: number;
	choiceTimeoutTimer: any;
	balloonTimeout: number;
	balloonTimeoutTimer: any;
	lastScript: string;
	commandHandler: SakuraCommandHandler;
	_restoreTimer?: any;

	constructor(app: any) {
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
			listen("balloon-choice-selected", (event: any) => {
				const { choiceId, choiceText } = event.payload || {};
				if (choiceId) {
					(this as any).onChoiceSelected(choiceId, choiceText || "");
				}
			});
			listen("balloon-anchor-selected", (event: any) => {
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
			listen("balloon-ready", (event: any) => {
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
		}, 300);
	}

	skip() {
		this.skipRequested = true;
	}
}
