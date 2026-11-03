/**
 * @file ghost.js
 * @brief ゴースト操作・イベント送信コマンド (\![raise,...], \![change,ghost,...], \![call,ghost,...])
 */

/**
 * SHIORI イベント発火コマンド (\![raise,イベント名,r0,r1,...])
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleRaiseCommand(handler, args) {
	const eventName = args[1];
	if (eventName) {
		await handler.app.ghostController?.sendShioriEvent?.(
			eventName,
			args.slice(2),
		);
	}
}

/**
 * ゴースト・シェル・バルーン切り替えコマンド
 * (\![change,ghost,ゴースト名], \![change,shell,シェル名(,--option=raise-event)], \![change,balloon,バルーン名])
 * [bang-change-ghost-option-eq-raise-event.md], [bang-change-shell-option-eq-raise-event.md], [bang-change-balloon.md]
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleChangeCommand(handler, args) {
	const target = (args[1] ?? "").toLowerCase();
	const name = args[2] ?? "";
	const options = args.slice(3);
	const gc = handler.app.ghostController;

	if (target === "ghost" && name) {
		await gc?.switchGhost?.(name);
	} else if (target === "shell" && name) {
		const shouldRaiseEvent = options.some(
			(opt) => opt.toLowerCase() === "--option=raise-event",
		);
		const fromShell = gc?.currentShell ?? "";
		if (shouldRaiseEvent && gc?.sendShioriEvent) {
			await gc.sendShioriEvent("OnShellChanging", [name, fromShell]);
		}
		if (gc?.selectShell) {
			await gc.selectShell(name);
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

/**
 * 自律消滅・終了コマンド (\![vanishbymyself])
 * [bang-vanishbymyself.md]
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} [_args]
 */
export async function handleVanishByMyself(handler, _args) {
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

/**
 * ゴースト呼び出しコマンド (\![call,ghost,ゴースト名])
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleCallCommand(handler, args) {
	const [target, name] = args.slice(1);
	if (target === "ghost" && name) {
		await handler.app.ghostController?.callGhost?.(name);
	}
}

/**
 * 他ゴーストへのイベント発火コマンド (\![raiseother,ゴースト名,イベント名,r0,r1,...])
 * [bang-raiseother-r0-r1-r2.md]
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleRaiseOtherCommand(handler, args) {
	const ghostName = args[1];
	const eventName = args[2];
	const references = args.slice(3);
	if (!ghostName || !eventName) return;

	const gc = handler.app.ghostController;
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

/**
 * 他ゴーストへのNotify送信コマンド (\![notifyother,ゴースト名,イベント名,r0,r1,...])
 * [bang-notifyother-r0-r1-r2.md]
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleNotifyOtherCommand(handler, args) {
	const ghostName = args[1];
	const eventName = args[2];
	const references = args.slice(3);
	if (!ghostName || !eventName) return;

	const gc = handler.app.ghostController;
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

/**
 * 埋め込みイベント評価コマンド (\![embed,イベント名,r0,r1,...])
 * [bang-embed-r0-r1-r2.md]
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleEmbedCommand(handler, args) {
	const eventName = args[1];
	if (!eventName) return;
	const references = args.slice(2);
	const gc = handler.app.ghostController;
	if (gc?.sendShioriEvent) {
		const res = await gc.sendShioriEvent(eventName, references);
		const embeddedScript = res?.response?.value;
		if (embeddedScript && handler.player?.playScript) {
			await handler.player.playScript(embeddedScript);
		}
	}
}
