/**
 * @file sakura-play.ts
 * @brief トークン列をバルーンにアニメーション再生するさくらスクリプトプレイヤー本体
 */

import { isTauriAvailable } from "../core/tauri-helper.js";
import { handleToken } from "./sakura-play/handlers.js";
import { translateScript } from "./sakura-play/translator.js";
import { initBalloonWindows } from "./sakura-play/window.js";
import { createBalloonSyncManager } from "./sakura-play-sync.js";

export { SakuraPlaybackController } from "./sakura-play/controller.js";

export async function playScript(player: any, script: string) {
	const finalScript = await translateScript(player, script);

	const tokens = await player.parse(finalScript);
	player.playbackId++;
	const currentId = player.playbackId;
	player.isPlaying = true;
	player.skipRequested = false;
	player.timeCritical = false;
	player.currentScope = 0;
	player.isSyncMode = false;
	player.lastScript = script;
	if (player.choiceTimeoutTimer) {
		clearTimeout(player.choiceTimeoutTimer);
		player.choiceTimeoutTimer = null;
	}
	if (player.balloonTimeoutTimer) {
		clearTimeout(player.balloonTimeoutTimer);
		player.balloonTimeoutTimer = null;
	}

	const app = player.app;
	const fallbackEl =
		typeof document !== "undefined" &&
		typeof document.getElementById === "function"
			? document.getElementById("balloon-text") ||
				(typeof document.createElement === "function"
					? document.createElement("div")
					: null)
			: null;
	const sakuraText = app?.elements?.balloonText || fallbackEl;
	const sakuraDisplay =
		app?.elements?.balloonDisplay ||
		(typeof document !== "undefined" &&
		typeof document.getElementById === "function"
			? document.getElementById("balloon-display")
			: null);
	const keroText =
		app?.elements?.keroBalloonText ||
		(typeof document !== "undefined" &&
		typeof document.getElementById === "function"
			? document.getElementById("kero-balloon-text")
			: null);
	const keroDisplay =
		app?.elements?.keroBalloonDisplay ||
		(typeof document !== "undefined" &&
		typeof document.getElementById === "function"
			? document.getElementById("kero-balloon-display")
			: null);

	const hasTextContent = tokens.some((t: unknown) => {
		const tok = t as { type?: string };
		return (
			tok.type === "char" ||
			tok.type === "choice" ||
			tok.type === "choice_scope_begin" ||
			tok.type === "anchor_begin"
		);
	});

	const shownScopes = new Set<number>();
	await initBalloonWindows(app, tokens, hasTextContent, shownScopes);

	const currentBalloonText = sakuraText;
	const isQuickMode = false;
	const isRawMode = false;
	const ended = false;
	const currentAnchor = null;
	const currentChoiceScope = null;

	const { flushDesktopBalloon, scheduleDesktopBalloonSync } =
		createBalloonSyncManager(player, app, sakuraText, keroText);

	const context = {
		sakuraText,
		keroText,
		sakuraDisplay,
		keroDisplay,
		hasTextContent,
		shownScopes,
		flushDesktopBalloon,
		scheduleDesktopBalloonSync,
		currentBalloonText,
		isQuickMode,
		isRawMode,
		ended,
		currentAnchor,
		currentChoiceScope,
	};

	for (let j = 0; j < tokens.length; j++) {
		if (player.playbackId !== currentId) break;
		if (context.ended) break;

		player.currentProgressIndex = j;
		await handleToken(player, app, tokens[j], context);
	}

	context.flushDesktopBalloon();

	// 外部要因で再生が打ち切られた場合は OnBalloonBreak を通知する
	if (player.playbackId !== currentId) {
		try {
			await app?.ghostController?.sendBalloonBreakNotify?.(
				script,
				player.currentScope || 0,
				player.currentProgressIndex || 0,
			);
		} catch (_e) {}
	}

	if (!context.ended) {
		app.surfaceManager?.onTalkEnd(player.currentScope);
		app.surfaceManager?.onScriptEnd(0);
		app.surfaceManager?.onScriptEnd(1);
	}
	player.isPlaying = false;
	player.scheduleSurfaceRestore(currentId);

	player.playbackController?.resetBalloonWait?.();

	const hasChoices = tokens.some((t: unknown) => {
		const tok = t as { type?: string };
		return tok.type === "choice" || tok.type === "choice_scope_begin";
	});

	if (hasChoices && player.choiceTimeout > 0) {
		if (player.choiceTimeoutTimer) clearTimeout(player.choiceTimeoutTimer);
		player.choiceTimeoutTimer = setTimeout(() => {
			if (player.playbackId === currentId) {
				player.onChoiceTimeout?.();
			}
		}, player.choiceTimeout);
	}

	if (!hasChoices && !player.timeCritical && player.balloonTimeout > 0) {
		if (player.balloonTimeoutTimer) clearTimeout(player.balloonTimeoutTimer);
		player.balloonTimeoutTimer = setTimeout(async () => {
			if (player.playbackId === currentId && !player.isPlaying) {
				try {
					if (sakuraDisplay) sakuraDisplay.style.display = "none";
					if (keroDisplay) keroDisplay.style.display = "none";
					app.hideBalloon?.(0, "timeout");
					app.hideBalloon?.(1, "timeout");
					if (app.ghostController?.sendBalloonTimeoutNotify) {
						await app.ghostController.sendBalloonTimeoutNotify(
							player.lastScript || "",
							"0",
						);
					} else {
						await app.ghostController?.sendShioriEvent?.("OnBalloonTimeout", [
							player.lastScript || "",
							"0",
						]);
					}
					if (app.ghostController?.sendBalloonCloseNotify) {
						await app.ghostController.sendBalloonCloseNotify(
							player.lastScript || "",
						);
					}
				} catch (_e) {}
			}
		}, player.balloonTimeout);
	} else if (!hasChoices && !player.timeCritical && isTauriAvailable()) {
		setTimeout(() => {
			if (player.playbackId === currentId && !player.isPlaying) {
				app.hideBalloon?.(0);
				app.hideBalloon?.(1);
			}
		}, 4000);
	}
}
