/**
 * @file control.ts
 * @brief さくらスクリプト再生時のポーズ(\x)、ウェイト(\w)、モード切替、タイムアウト、終了処理ハンドラ
 */

export async function handlePause(
	player: unknown,
	_app: unknown,
	token: unknown,
	context: unknown,
) {
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
		if (player.waitForClickOrTimeout) {
			await player.waitForClickOrTimeout(activeDisplay);
		} else if (player.sleep) {
			await player.sleep(100);
		}
	}
	if (!token.noClear) {
		context.currentBalloonText.innerHTML = "";
		player.currentScope = 0;
		context.currentBalloonText = sakuraText;
		player.currentFontStyles = {};
		scheduleDesktopBalloonSync(true);
	}
}

export function handleQuickToggle(
	player: unknown,
	_app: unknown,
	token: unknown,
	context: unknown,
) {
	if (typeof token.value === "boolean") {
		context.isQuickMode = token.value;
	} else {
		context.isQuickMode = !context.isQuickMode;
	}
	player.playbackController?.setQuickMode?.(context.isQuickMode);
}

export async function handleWait(
	player: unknown,
	_app: unknown,
	token: unknown,
	context: unknown,
) {
	player.playbackController?.notifyWait?.(token.value);
	if (!player.skipRequested && !context.isQuickMode) {
		const waitMs = player.playbackController?.calculateWait
			? player.playbackController.calculateWait(token.value)
			: token.value;
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
	player: unknown,
	_app: unknown,
	_token: unknown,
	_context: unknown,
) {
	player.timeCritical = true;
}

export function handleChoiceTimeout(
	player: unknown,
	_app: unknown,
	token: unknown,
	_context: unknown,
) {
	player.choiceTimeout = token.timeout;
}

export function handleBalloonTimeout(
	player: unknown,
	_app: unknown,
	token: unknown,
	_context: unknown,
) {
	player.balloonTimeout = token.timeout;
}

export async function handleHalt(
	_player: unknown,
	app: unknown,
	_token: unknown,
	_context: unknown,
) {
	await app.ghostController?.closeGhost?.();
}

export function handleSyncToggle(
	player: unknown,
	_app: unknown,
	token: unknown,
	_context: unknown,
) {
	if (typeof token.value === "boolean") {
		player.isSyncMode = token.value;
	} else {
		player.isSyncMode = !player.isSyncMode;
	}
	player.playbackController?.emit?.("playback:sync-mode", {
		enabled: player.isSyncMode,
	});
}

export async function handleCommand(
	player: unknown,
	_app: unknown,
	token: unknown,
	_context: unknown,
) {
	await player.commandHandler.runCommand(token.args);
}

export function handleEnd(
	player: unknown,
	app: unknown,
	_token: unknown,
	context: unknown,
) {
	app.surfaceManager?.onTalkEnd(player.currentScope);
	app.surfaceManager?.onScriptEnd(0);
	app.surfaceManager?.onScriptEnd(1);
	context.ended = true;
}
