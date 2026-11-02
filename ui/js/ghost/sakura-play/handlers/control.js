/**
 * @file control.js
 * @brief さくらスクリプト再生時のポーズ(\x)、ウェイト(\w)、モード切替、タイムアウト、終了処理ハンドラ
 */

export async function handlePause(player, _app, token, context) {
	const {
		sakuraText,
		sakuraDisplay,
		keroDisplay,
		flushDesktopBalloon,
		scheduleDesktopBalloonSync,
	} = context;

	flushDesktopBalloon();
	player.playbackController?.notifyPause?.(Boolean(token.noClear));
	if (!player.skipRequested && !context.isQuickMode) {
		const activeDisplay =
			player.currentScope === 1 ? keroDisplay : sakuraDisplay;
		await player.waitForClickOrTimeout(activeDisplay);
	}
	if (!token.noClear) {
		// \x: クリック後にスコープをリセット (\0)、フォント装飾を解除、バルーン内容をクリア
		context.currentBalloonText.innerHTML = "";
		player.currentScope = 0;
		context.currentBalloonText = sakuraText;
		player.currentFontStyles = {};
		scheduleDesktopBalloonSync(true);
	}
}

export function handleQuickToggle(player, _app, token, context) {
	if (typeof token.value === "boolean") {
		context.isQuickMode = token.value;
	} else {
		context.isQuickMode = !context.isQuickMode;
	}
	player.playbackController?.setQuickMode?.(context.isQuickMode);
}

export async function handleWait(player, _app, token, context) {
	player.playbackController?.notifyWait?.(token.value);
	if (!player.skipRequested && !context.isQuickMode) {
		const waitMs = player.playbackController?.calculateWait
			? player.playbackController.calculateWait(token.value)
			: token.value;
		if (waitMs > 0) {
			await player.sleep(waitMs);
		}
	}
}

export function handleTimeout(player, _app, _token, _context) {
	player.timeCritical = true;
}

export function handleChoiceTimeout(player, _app, token, _context) {
	player.choiceTimeout = token.timeout;
}

export function handleBalloonTimeout(player, _app, token, _context) {
	player.balloonTimeout = token.timeout;
}

export async function handleHalt(_player, app, _token, _context) {
	await app.ghostController?.closeGhost?.();
}

export function handleSyncToggle(player, _app, token, _context) {
	if (typeof token.value === "boolean") {
		player.isSyncMode = token.value;
	} else {
		player.isSyncMode = !player.isSyncMode;
	}
	player.playbackController?.emit?.("playback:sync-mode", {
		enabled: player.isSyncMode,
	});
}

export async function handleCommand(player, _app, token, _context) {
	await player.commandHandler.runCommand(token.args);
}

export function handleEnd(player, app, _token, context) {
	app.surfaceManager?.onTalkEnd(player.currentScope);
	app.surfaceManager?.onScriptEnd(0);
	app.surfaceManager?.onScriptEnd(1);
	context.ended = true;
}
