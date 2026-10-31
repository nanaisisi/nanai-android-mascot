/**
 * @file sakura-play.js
 * @brief トークン列をバルーンにアニメーション再生するさくらスクリプトプレイヤー本体
 */
import { createBalloonSyncManager } from "./sakura-play-sync.js";
import { translateScript } from "./sakura-play/translator.js";
import { initBalloonWindows } from "./sakura-play/window.js";
import { handleToken } from "./sakura-play/handlers.js";

/**
 * トークン列をバルーンにアニメーション再生（SakuraScriptPlayer.play の本体）
 *
 * @param {import('./sakura-script.js').SakuraScriptPlayer} player
 * @param {string} script
 */
export async function playScript(player, script) {
	const finalScript = await translateScript(player, script);

	const tokens = await player.parse(finalScript);
	player.playbackId++;
	const currentId = player.playbackId;
	player.isPlaying = true;
	player.skipRequested = false;
	player.timeCritical = false;
	player.currentScope = 0;

	const app = player.app;
	const sakuraText = app.elements.balloonText;
	const sakuraDisplay = app.elements.balloonDisplay;
	const keroText = app.elements.keroBalloonText;
	const keroDisplay = app.elements.keroBalloonDisplay;

	const hasTextContent = tokens.some(
		(t) =>
			t.type === "char" || t.type === "choice" || t.type === "anchor_begin",
	);

	const shownScopes = new Set();
	await initBalloonWindows(app, tokens, hasTextContent, shownScopes);

	let currentBalloonText = sakuraText;
	let isQuickMode = false;
	let ended = false;
	let currentAnchor = null;

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
		ended,
		currentAnchor,
	};

	for (let j = 0; j < tokens.length; j++) {
		if (player.playbackId !== currentId) break;
		if (context.ended) break;

		await handleToken(player, app, tokens[j], context);
	}

	context.flushDesktopBalloon();
	if (!context.ended) {
		app.surfaceManager?.onTalkEnd(player.currentScope);
		app.surfaceManager?.onScriptEnd(0);
		app.surfaceManager?.onScriptEnd(1);
	}
	player.isPlaying = false;
	player.scheduleSurfaceRestore(currentId);
}
