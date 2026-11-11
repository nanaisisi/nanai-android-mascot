/**
 * @file control.ts
 * @brief さくらスクリプト再生時のポーズ(\x)、ウェイト(\w)、モード切替、タイムアウト、終了処理ハンドラ
 */

import type { NanaiAndroidMascotApp } from "../../../../main.js";
import type { SakuraAstNode } from "../../parser/ast-types.js";
import type { SakuraScriptPlayer } from "../../sakura-script.js";
import type { SakuraPlayContext } from "./choice.js";

export async function handlePause(
	player: SakuraScriptPlayer,
	_app: NanaiAndroidMascotApp,
	token: SakuraAstNode,
	context: SakuraPlayContext,
) {
	const {
		sakuraText,
		sakuraDisplay,
		keroDisplay,
		flushDesktopBalloon,
		scheduleDesktopBalloonSync,
	} = context;

	let markerEl: HTMLElement | null = null;
	if (context.currentBalloonText && typeof document !== "undefined") {
		markerEl = document.createElement("span");
		markerEl.className = "clickwait-marker";
		markerEl.setAttribute("aria-hidden", "true");
		context.currentBalloonText.appendChild(markerEl);
		scheduleDesktopBalloonSync?.(false);
	}

	flushDesktopBalloon?.();
	player.playbackController?.notifyPause?.(Boolean(token.noClear));
	if (!player.skipRequested && !context.isQuickMode) {
		const activeDisplay =
			player.currentScope === 1 ? keroDisplay : sakuraDisplay;
		if (player.waitForClickOrTimeout) {
			await player.waitForClickOrTimeout(activeDisplay);
		} else if (player.sleep) {
			await player.sleep(100);
		}
	}

	if (markerEl?.parentNode) {
		markerEl.parentNode.removeChild(markerEl);
	}

	if (!token.noClear && context.currentBalloonText) {
		context.currentBalloonText.innerHTML = "";
		player.currentScope = 0;
		context.currentBalloonText = sakuraText;
		player.currentFontStyles = {};
		scheduleDesktopBalloonSync?.(true);
	}
}

export function handleQuickToggle(
	player: SakuraScriptPlayer,
	_app: NanaiAndroidMascotApp,
	token: SakuraAstNode,
	context: SakuraPlayContext,
) {
	if (typeof token.value === "boolean") {
		context.isQuickMode = token.value;
	} else {
		context.isQuickMode = !context.isQuickMode;
	}
	player.playbackController?.setQuickMode?.(Boolean(context.isQuickMode));
}

export async function handleWait(
	player: SakuraScriptPlayer,
	_app: NanaiAndroidMascotApp,
	token: SakuraAstNode,
	context: SakuraPlayContext,
) {
	player.playbackController?.notifyWait?.(token.value as number);
	if (!player.skipRequested && !context.isQuickMode) {
		const waitMs = player.playbackController?.calculateWait
			? player.playbackController.calculateWait(token.value as number)
			: (token.value as number);
		if (waitMs > 0) {
			if (player.sleep) {
				await player.sleep(waitMs);
			} else {
				await new Promise((r) => setTimeout(r, waitMs));
			}
		}
	}
}

export function handleTimeout(
	player: SakuraScriptPlayer,
	_app: NanaiAndroidMascotApp,
	_token: SakuraAstNode,
	_context: unknown,
) {
	if (player.playbackController) {
		player.playbackController.timeCritical = true;
	}
	player.timeCritical = true;
}

export function handleChoiceTimeout(
	player: SakuraScriptPlayer,
	_app: NanaiAndroidMascotApp,
	token: SakuraAstNode,
	_context: unknown,
) {
	player.choiceTimeout = token.timeout || 0;
}

export function handleBalloonTimeout(
	player: SakuraScriptPlayer,
	_app: NanaiAndroidMascotApp,
	token: SakuraAstNode,
	_context: unknown,
) {
	player.balloonTimeout = token.timeout || 0;
}

export async function handleHalt(
	_player: SakuraScriptPlayer,
	app: NanaiAndroidMascotApp,
	_token: SakuraAstNode,
	_context: unknown,
) {
	await app.ghostController?.closeGhost?.();
}

export function handleSyncToggle(
	player: SakuraScriptPlayer,
	_app: NanaiAndroidMascotApp,
	token: SakuraAstNode,
	_context: unknown,
) {
	if (typeof token.value === "boolean") {
		player.isSyncMode = token.value;
	} else {
		player.isSyncMode = !player.isSyncMode;
	}
	if (Array.isArray(token.scopes) && token.scopes.length > 0) {
		player.syncScopes = [...(token.scopes as number[])];
	} else if (!player.isSyncMode) {
		player.syncScopes = null;
	} else {
		player.syncScopes = null;
	}
	player.playbackController?.emit?.("playback:sync-mode", {
		enabled: player.isSyncMode,
		scopes: player.syncScopes,
	});
}

export async function handleCommand(
	player: SakuraScriptPlayer,
	_app: NanaiAndroidMascotApp,
	token: SakuraAstNode,
	_context: unknown,
) {
	const ch = player.commandHandler as { runCommand: (args?: string[]) => Promise<unknown> };
	await ch?.runCommand?.(token.args);
}

export function handleEnd(
	player: SakuraScriptPlayer,
	app: NanaiAndroidMascotApp,
	_token: SakuraAstNode,
	context: SakuraPlayContext,
) {
	app.surfaceManager?.onTalkEnd(player.currentScope);
	app.surfaceManager?.onScriptEnd(0);
	app.surfaceManager?.onScriptEnd(1);
	context.ended = true;
}

export function handleNoAutoWrap(
	player: SakuraScriptPlayer,
	_app: NanaiAndroidMascotApp,
	_token: SakuraAstNode,
	_context: unknown,
) {
	player.noAutoWrap = true;
	player.playbackController?.emit?.("playback:no-autowrap", { enabled: true });
}

export function handleRawToggle(
	player: SakuraScriptPlayer,
	_app: NanaiAndroidMascotApp,
	token: SakuraAstNode,
	context: SakuraPlayContext,
) {
	if (typeof token.value === "boolean") {
		context.isRawMode = token.value;
	} else {
		context.isRawMode = !context.isRawMode;
	}
	player.isRawMode = context.isRawMode;
	player.playbackController?.emit?.("playback:raw-toggle", {
		enabled: context.isRawMode,
	});
}

export function handleAutoPause(
	player: SakuraScriptPlayer,
	_app: NanaiAndroidMascotApp,
	_token: SakuraAstNode,
	_context: unknown,
) {
	player.playbackController?.emit?.("playback:auto-pause");
}
