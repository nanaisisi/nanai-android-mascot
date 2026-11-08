/**
 * @file control.ts
 * @brief さくらスクリプト再生時のポーズ(\x)、ウェイト(\w)、モード切替、タイムアウト、終了処理ハンドラ
 */

export async function handlePause(

	_player: unknown,
	_app: unknown,
	_token: unknown,
	_context: unknown,

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	context: any,

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

	_player: unknown,
	_app: unknown,
	_token: unknown,
	_context: unknown,

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	context: any,

) {
	if (typeof token.value === "boolean") {
		context.isQuickMode = token.value;
	} else {
		context.isQuickMode = !context.isQuickMode;
	}
	player.playbackController?.setQuickMode?.(context.isQuickMode);
}

export async function handleWait(

	_player: unknown,
	_app: unknown,
	_token: unknown,
	_context: unknown,

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	context: any,

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

	_player: unknown,
	_app: unknown,
	_token: unknown,
	_context: unknown,

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_context: any,

) {
	player.timeCritical = true;
}

export function handleChoiceTimeout(

	_player: unknown,
	_app: unknown,
	_token: unknown,
	_context: unknown,

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_context: any,

) {
	player.choiceTimeout = token.timeout;
}

export function handleBalloonTimeout(

	_player: unknown,
	_app: unknown,
	_token: unknown,
	_context: unknown,

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_context: any,

) {
	player.balloonTimeout = token.timeout;
}

export async function handleHalt(

	_player: unknown,
	_app: unknown,
	_token: unknown,
	_context: unknown,

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_context: any,

) {
	await app.ghostController?.closeGhost?.();
}

export function handleSyncToggle(

	_player: unknown,
	_app: unknown,
	_token: unknown,
	_context: unknown,

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_context: any,

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
	_token: unknown,
	_context: unknown,

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	player: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_app: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	token: any,
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_context: any,

) {
	await player.commandHandler.runCommand(token.args);
}


export function handleEnd(
	_player: unknown,
	_app: unknown,
	_token: unknown,
	_context: unknown,
) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _handleEnd(_player: any, app: any, _token: any, context: any) {

	app.surfaceManager?.onTalkEnd(player.currentScope);
	app.surfaceManager?.onScriptEnd(0);
	app.surfaceManager?.onScriptEnd(1);
	context.ended = true;
}
