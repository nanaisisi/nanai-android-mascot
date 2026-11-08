/**
 * @file control.ts
 * @brief さくらスクリプト再生時のポーズ(\x)、ウェイト(\w)、モード切替、タイムアウト、終了処理ハンドラ
 */

export async function handlePause(
<<<<<<< HEAD
	player: unknown,
	_app: unknown,
	token: unknown,
	context: unknown,
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	context: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
	player: unknown,
	_app: unknown,
	token: unknown,
	context: unknown,
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	context: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
) {
	if (typeof token.value === "boolean") {
		context.isQuickMode = token.value;
	} else {
		context.isQuickMode = !context.isQuickMode;
	}
	player.playbackController?.setQuickMode?.(context.isQuickMode);
}

export async function handleWait(
<<<<<<< HEAD
	player: unknown,
	_app: unknown,
	token: unknown,
	context: unknown,
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	context: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
	player: unknown,
	_app: unknown,
	_token: unknown,
	_context: unknown,
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_context: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
) {
	player.timeCritical = true;
}

export function handleChoiceTimeout(
<<<<<<< HEAD
	player: unknown,
	_app: unknown,
	token: unknown,
	_context: unknown,
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_context: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
) {
	player.choiceTimeout = token.timeout;
}

export function handleBalloonTimeout(
<<<<<<< HEAD
	player: unknown,
	_app: unknown,
	token: unknown,
	_context: unknown,
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_context: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
) {
	player.balloonTimeout = token.timeout;
}

export async function handleHalt(
<<<<<<< HEAD
	_player: unknown,
	app: unknown,
	_token: unknown,
	_context: unknown,
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_context: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
) {
	await app.ghostController?.closeGhost?.();
}

export function handleSyncToggle(
<<<<<<< HEAD
	player: unknown,
	_app: unknown,
	token: unknown,
	_context: unknown,
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_context: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
	player: unknown,
	_app: unknown,
	token: unknown,
	_context: unknown,
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_context: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
) {
	await player.commandHandler.runCommand(token.args);
}

<<<<<<< HEAD
export function handleEnd(
	player: unknown,
	app: unknown,
	_token: unknown,
	context: unknown,
) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function handleEnd(player: any, app: any, _token: any, context: any) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	app.surfaceManager?.onTalkEnd(player.currentScope);
	app.surfaceManager?.onScriptEnd(0);
	app.surfaceManager?.onScriptEnd(1);
	context.ended = true;
}
