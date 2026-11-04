/**
 * @file control.ts
 * @brief さくらスクリプト再生時のポーズ(\x)、ウェイト(\w)、モード切替、タイムアウト、終了処理ハンドラ
 */

export async function handlePause(player: any, _app: any, token: any, context: any) {
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
		context.currentBalloonText.innerHTML = "";
		player.currentScope = 0;
		context.currentBalloonText = sakuraText;
		player.currentFontStyles = {};
		scheduleDesktopBalloonSync(true);
	}
}

export function handleQuickToggle(player: any, _app: any, token: any, context: any) {
	if (typeof token.value === "boolean") {
		context.isQuickMode = token.value;
	} else {
		context.isQuickMode = !context.isQuickMode;
	}
	player.playbackController?.setQuickMode?.(context.isQuickMode);
}

export async function handleWait(player: any, _app: any, token: any, context: any) {
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

export function handleTimeout(player: any, _app: any, _token: any, _context: any) {
	player.timeCritical = true;
}

export function handleChoiceTimeout(player: any, _app: any, token: any, _context: any) {
	player.choiceTimeout = token.timeout;
}

export function handleBalloonTimeout(player: any, _app: any, token: any, _context: any) {
	player.balloonTimeout = token.timeout;
}

export async function handleHalt(_player: any, app: any, _token: any, _context: any) {
	await app.ghostController?.closeGhost?.();
}

export function handleSyncToggle(player: any, _app: any, token: any, _context: any) {
	if (typeof token.value === "boolean") {
		player.isSyncMode = token.value;
	} else {
		player.isSyncMode = !player.isSyncMode;
	}
	player.playbackController?.emit?.("playback:sync-mode", {
		enabled: player.isSyncMode,
	});
}

export async function handleCommand(player: any, _app: any, token: any, _context: any) {
	await player.commandHandler.runCommand(token.args);
}

export function handleEnd(player: any, app: any, _token: any, context: any) {
	app.surfaceManager?.onTalkEnd(player.currentScope);
	app.surfaceManager?.onScriptEnd(0);
	app.surfaceManager?.onScriptEnd(1);
	context.ended = true;
}
