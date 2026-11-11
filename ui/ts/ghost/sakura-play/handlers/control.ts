/**
 * @file control.ts
 * @brief さくらスクリプト再生時のポーズ(\x)、ウェイト(\w)、モード切替、タイムアウト、終了処理ハンドラ
 */

export async function handlePause(
	player: any,
	_app: any,
	token: any,
	context: any,
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
		scheduleDesktopBalloonSync(false);
	}

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

	if (markerEl?.parentNode) {
		markerEl.parentNode.removeChild(markerEl);
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
	player: any,
	_app: any,
	token: any,
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
	player: any,
	_app: any,
	token: any,
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
	player: any,
	_app: any,
	_token: any,
	_context: any,
) {
	if (player.playbackController) {
		player.playbackController.timeCritical = true;
	}
	player.timeCritical = true;
}

export function handleChoiceTimeout(
	player: any,
	_app: any,
	token: any,
	_context: any,
) {
	player.choiceTimeout = token.timeout;
}

export function handleBalloonTimeout(
	player: any,
	_app: any,
	token: any,
	_context: any,
) {
	player.balloonTimeout = token.timeout;
}

export async function handleHalt(
	_player: any,
	app: any,
	_token: any,
	_context: any,
) {
	await app.ghostController?.closeGhost?.();
}

export function handleSyncToggle(
	player: any,
	_app: any,
	token: any,
	_context: any,
) {
	if (typeof token.value === "boolean") {
		player.isSyncMode = token.value;
	} else {
		player.isSyncMode = !player.isSyncMode;
	}
	if (Array.isArray(token.scopes) && token.scopes.length > 0) {
		player.syncScopes = [...token.scopes];
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
	player: any,
	_app: any,
	token: any,
	_context: any,
) {
	await player.commandHandler.runCommand(token.args);
}

export function handleEnd(player: any, app: any, _token: any, context: any) {
	app.surfaceManager?.onTalkEnd(player.currentScope);
	app.surfaceManager?.onScriptEnd(0);
	app.surfaceManager?.onScriptEnd(1);
	context.ended = true;
}

export function handleNoAutoWrap(
	player: unknown,
	_app: unknown,
	_token: unknown,
	_context: unknown,
) {
	player.noAutoWrap = true;
	player.playbackController?.emit?.("playback:no-autowrap", { enabled: true });
}

export function handleRawToggle(
	player: unknown,
	_app: unknown,
	token: unknown,
	context: unknown,
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
	player: unknown,
	_app: unknown,
	_token: unknown,
	_context: unknown,
) {
	player.playbackController?.emit?.("playback:auto-pause");
}
