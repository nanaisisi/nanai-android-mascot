/**
 * @file ghost.ts
 * @brief ゴースト操作・イベント送信コマンド (\![raise,...], \![change,ghost,...], \![call,ghost,...])
 */

<<<<<<< HEAD
export async function handleRaiseCommand(_handler: unknown, _args: string[]) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleRaiseCommand(handler: any, args: string[]) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	const eventName = args[1];
	if (eventName) {
		await handler.app.ghostController?.sendShioriEvent?.(
			eventName,
			args.slice(2),
		);
	}
}

<<<<<<< HEAD
export async function _handleChangeCommand(_handler: unknown, _args: string[]) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleChangeCommand(handler: any, args: string[]) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	const target = (args[1] ?? "").toLowerCase();
	const name = args[2] ?? "";
	const options = args.slice(3);
	const gc = handler.app.ghostController;

	if (target === "ghost" && name) {
		const shouldRaiseEvent = options.some(
			(opt) => opt.toLowerCase() === "--option=raise-event",
		);
		const fromGhost = gc?.currentGhost?.name ?? "";
		if (shouldRaiseEvent && gc?.sendGhostChanging) {
			await gc.sendGhostChanging(name, fromGhost, "manual");
		} else if (shouldRaiseEvent && gc?.sendShioriEvent) {
			await gc.sendShioriEvent("OnGhostChanging", [name, "manual", fromGhost]);
		}
		await gc?.switchGhost?.(name);
		if (shouldRaiseEvent && gc?.sendGhostChanged) {
			await gc.sendGhostChanged(name, fromGhost);
		} else if (shouldRaiseEvent && gc?.sendShioriEvent) {
			await gc.sendShioriEvent("OnGhostChanged", [name, fromGhost]);
		}
	} else if (target === "shell" && name) {
		const shouldRaiseEvent = options.some(
			(opt) => opt.toLowerCase() === "--option=raise-event",
		);
		const fromShell = gc?.currentShell ?? "";
		if (shouldRaiseEvent && gc?.sendShellChanging) {
			await gc.sendShellChanging(name, fromShell);
		} else if (shouldRaiseEvent && gc?.sendShioriEvent) {
			await gc.sendShioriEvent("OnShellChanging", [name, fromShell]);
		}
		if (gc?.selectShell) {
			await gc.selectShell(name);
		}
		if (shouldRaiseEvent && gc?.sendShellChanged) {
			await gc.sendShellChanged(name, fromShell);
		} else if (shouldRaiseEvent && gc?.sendShioriEvent) {
			await gc.sendShioriEvent("OnShellChanged", [name, fromShell]);
		}
	} else if (target === "balloon" && name) {
		const fromBalloon =
			handler.app.balloonTheme ||
			handler.app.settings?.balloonTheme ||
			"default";
		if (handler.app.setBalloonTheme) {
			await handler.app.setBalloonTheme(name);
		}
		if (gc?.sendShioriEvent) {
			await gc.sendShioriEvent("OnBalloonChange", [name, fromBalloon]);
		}
	}
}

<<<<<<< HEAD
export async function _handleVanishByMyself(_handler: unknown, _args: string[]) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleVanishByMyself(handler: any, _args: string[]) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	console.log("👻 Vanish by myself requested");
	const gc = handler.app.ghostController;
	if (gc?.sendShioriEvent) {
		try {
			await gc.sendShioriEvent("OnVanishSelected", []);
		} catch (e) {
			console.warn("OnVanishSelected event failed:", e);
		}
	}
	if (handler.app.closeApp) {
		await handler.app.closeApp();
	} else if (gc?.closeGhost) {
		await gc.closeGhost();
	}
}

<<<<<<< HEAD
export async function _handleCallCommand(_handler: unknown, _args: string[]) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleCallCommand(handler: any, args: string[]) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	const [target, name] = args.slice(1);
	if (target === "ghost" && name) {
		await handler.app.ghostController?.callGhost?.(name);
	}
}

<<<<<<< HEAD
export async function _handleRaiseOtherCommand(
	_handler: unknown,
	_args: string[],
) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleRaiseOtherCommand(handler: any, args: string[]) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	const ghostName = args[1];
	const eventName = args[2];
	const references = args.slice(3);
	if (!ghostName || !eventName) return;

	const gc =
		handler.app?.ghostController ?? handler.player?.app?.ghostController;
	if (gc?.sendRaiseOther) {
		await gc.sendRaiseOther(ghostName, eventName, references);
	} else if (gc?.sendShioriEvent) {
		await gc.sendShioriEvent("OnRaiseOther", [
			ghostName,
			eventName,
			...references,
		]);
	}
}

<<<<<<< HEAD
export async function _handleNotifyOtherCommand(
	_handler: unknown,
	_args: string[],
) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleNotifyOtherCommand(handler: any, args: string[]) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	const ghostName = args[1];
	const eventName = args[2];
	const references = args.slice(3);
	if (!ghostName || !eventName) return;

	const gc =
		handler.app?.ghostController ?? handler.player?.app?.ghostController;
	if (gc?.sendNotifyOther) {
		await gc.sendNotifyOther(ghostName, eventName, references);
	} else if (gc?.sendShioriNotify) {
		await gc.sendShioriNotify("OnNotifyOther", [
			ghostName,
			eventName,
			...references,
		]);
	} else if (gc?.sendShioriEvent) {
		await gc.sendShioriEvent("OnNotifyOther", [
			ghostName,
			eventName,
			...references,
		]);
	}
}

<<<<<<< HEAD
export async function _handleEmbedCommand(_handler: unknown, _args: string[]) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleEmbedCommand(handler: any, args: string[]) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	const eventName = args[1];
	if (!eventName) return;
	const references = args.slice(2);
	const gc = handler.app.ghostController;
	if (gc?.sendShioriEvent) {
<<<<<<< HEAD
		const _res: unknown = await gc.sendShioriEvent(eventName, references);
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const res: any = await gc.sendShioriEvent(eventName, references);
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		const embeddedScript = res?.response?.value;
		if (embeddedScript && handler.player?.playScript) {
			await handler.player.playScript(embeddedScript);
		}
	}
}
