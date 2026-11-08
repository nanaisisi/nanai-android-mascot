/**
 * @file playback.ts
 * @brief 再生・タイムアウト・ウェイト制御コマンド
 */


export async function handleSetChoiceTimeout(_handler: unknown, _args: string[]) {


export async function _handleSetChoiceTimeout(handler: any, args: string[]) {

	const timeout = Number.parseInt(args[2] ?? "", 10);
	handler.player.choiceTimeout = Number.isFinite(timeout) ? timeout : 0;
}


export async function _handleSetBalloonTimeout(
	_handler: unknown,
	_args: string[],
) {


export async function _handleSetBalloonTimeout(handler: any, args: string[]) {

	const timeout = Number.parseInt(args[2] ?? "", 10);
	handler.player.balloonTimeout = Number.isFinite(timeout) ? timeout : 0;
}


export async function _handleSetBalloonWait(_handler: unknown, _args: string[]) {


export async function _handleSetBalloonWait(handler: any, args: string[]) {

	const param = args[2];
	handler.player.playbackController?.setBalloonWait?.(param);
}


export async function _handleQuickSection(_handler: unknown, _args: string[]) {


export async function _handleQuickSection(handler: any, args: string[]) {

	const val = String(args[1] ?? "").toLowerCase();
	const enable = val === "1" || val === "true";
	handler.player.playbackController?.setQuickMode?.(enable);
}


export async function _handleSetSyncObject(_handler: unknown, _args: string[]) {


export async function _handleSetSyncObject(handler: any, args: string[]) {

	const name = args[2];
	if (name) {
		const syncMgr =
			handler.player?.playbackController?.syncObjects ??
			handler.app?.syncObjectManager ??
			handler.player?.app?.syncObjectManager;
		syncMgr?.set(name);
	}
}


export async function _handleResetSyncObject(_handler: unknown, _args: string[]) {


export async function _handleResetSyncObject(handler: any, args: string[]) {

	const name = args[2];
	if (name) {
		const syncMgr =
			handler.player?.playbackController?.syncObjects ??
			handler.app?.syncObjectManager ??
			handler.player?.app?.syncObjectManager;
		syncMgr?.reset(name);
	}
}


export async function _handleWaitSyncObject(_handler: unknown, _args: string[]) {


export async function _handleWaitSyncObject(handler: any, args: string[]) {

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

	const syncManager =
		handler.player?.playbackController?.syncObjects ??
		handler.app?.syncObjectManager ??
		handler.player?.app?.syncObjectManager;
	if (syncManager) {
		await syncManager.wait(name, { timeout, resetOnWait });
	}
}
