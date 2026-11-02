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
