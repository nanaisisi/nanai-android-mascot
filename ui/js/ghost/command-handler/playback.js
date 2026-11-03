/**
 * @file playback.js
 * @brief 再生・タイムアウト・ウェイト制御コマンド (\![set,choicetimeout,...], \![set,balloontimeout,...], \![set,balloonwait,...], \![quicksection,...])
 */

/**
 * 選択肢タイムアウト設定 (\![set,choicetimeout,ミリ秒])
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleSetChoiceTimeout(handler, args) {
	const timeout = Number.parseInt(args[2] ?? "", 10);
	handler.player.choiceTimeout = Number.isFinite(timeout) ? timeout : 0;
}

/**
 * バルーンタイムアウト設定 (\![set,balloontimeout,ミリ秒])
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleSetBalloonTimeout(handler, args) {
	const timeout = Number.parseInt(args[2] ?? "", 10);
	handler.player.balloonTimeout = Number.isFinite(timeout) ? timeout : 0;
}

/**
 * バルーンウェイト設定 (\![set,balloonwait,値])
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleSetBalloonWait(handler, args) {
	const param = args[2];
	handler.player.playbackController?.setBalloonWait?.(param);
}

/**
 * クイックセクション設定 (\![quicksection,true/false])
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleQuickSection(handler, args) {
	const val = String(args[1] ?? "").toLowerCase();
	const enable = val === "1" || val === "true";
	handler.player.playbackController?.setQuickMode?.(enable);
}

/**
 * 同期オブジェクトの活性化・シグナル状態設定 (\![set,syncobject,名前])
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleSetSyncObject(handler, args) {
	const name = args[2];
	if (name) {
		handler.player.playbackController?.syncObjects?.set(name);
	}
}

/**
 * 同期オブジェクトの非活性化・リセット (\![reset,syncobject,名前])
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleResetSyncObject(handler, args) {
	const name = args[2];
	if (name) {
		handler.player.playbackController?.syncObjects?.reset(name);
	}
}

/**
 * 同期オブジェクトのシグナル化待機 (\![wait,syncobject,名前,オプション])
 * オプション:
 * - 数値 または --timeout=ミリ秒: 待機タイムアウト (0または未指定で無限待機)
 * - --reset=0 または --reset=1: 待機直後に自動リセットするか (デフォルト 1)
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleWaitSyncObject(handler, args) {
	const name = args[2];
	if (!name) return;

	let timeout = 0;
	let resetOnWait = true;

	for (let i = 3; i < args.length; i++) {
		const arg = String(args[i] || "").trim();
		if (arg.startsWith("--timeout=")) {
			const parsed = Number.parseInt(arg.slice(10), 10);
			if (Number.isFinite(parsed) && parsed >= 0) {
				timeout = parsed;
			}
		} else if (arg.startsWith("--reset=")) {
			const val = arg.slice(8).trim();
			resetOnWait = val !== "0" && val !== "false";
		} else if (/^\d+$/.test(arg)) {
			const parsed = Number.parseInt(arg, 10);
			if (Number.isFinite(parsed) && parsed >= 0) {
				timeout = parsed;
			}
		}
	}

	const syncManager = handler.player.playbackController?.syncObjects;
	if (syncManager) {
		await syncManager.wait(name, { timeout, resetOnWait });
	}
}
