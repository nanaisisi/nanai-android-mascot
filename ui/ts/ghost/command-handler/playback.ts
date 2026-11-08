/**
 * @file playback.ts
 * @brief 再生・タイムアウト・ウェイト制御コマンド
 */

<<<<<<< HEAD
export async function handleSetChoiceTimeout(handler: unknown, args: string[]) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handleSetChoiceTimeout(handler: any, args: string[]) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	const timeout = Number.parseInt(args[2] ?? "", 10);
	handler.player.choiceTimeout = Number.isFinite(timeout) ? timeout : 0;
}

<<<<<<< HEAD
export async function handleSetBalloonTimeout(
	handler: unknown,
	args: string[],
) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handleSetBalloonTimeout(handler: any, args: string[]) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	const timeout = Number.parseInt(args[2] ?? "", 10);
	handler.player.balloonTimeout = Number.isFinite(timeout) ? timeout : 0;
}

<<<<<<< HEAD
export async function handleSetBalloonWait(handler: unknown, args: string[]) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handleSetBalloonWait(handler: any, args: string[]) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	const param = args[2];
	handler.player.playbackController?.setBalloonWait?.(param);
}

<<<<<<< HEAD
export async function handleQuickSection(handler: unknown, args: string[]) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handleQuickSection(handler: any, args: string[]) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	const val = String(args[1] ?? "").toLowerCase();
	const enable = val === "1" || val === "true";
	handler.player.playbackController?.setQuickMode?.(enable);
}

<<<<<<< HEAD
export async function handleSetSyncObject(handler: unknown, args: string[]) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handleSetSyncObject(handler: any, args: string[]) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	const name = args[2];
	if (name) {
		const syncMgr =
			handler.player?.playbackController?.syncObjects ??
			handler.app?.syncObjectManager ??
			handler.player?.app?.syncObjectManager;
		syncMgr?.set(name);
	}
}

<<<<<<< HEAD
export async function handleResetSyncObject(handler: unknown, args: string[]) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handleResetSyncObject(handler: any, args: string[]) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	const name = args[2];
	if (name) {
		const syncMgr =
			handler.player?.playbackController?.syncObjects ??
			handler.app?.syncObjectManager ??
			handler.player?.app?.syncObjectManager;
		syncMgr?.reset(name);
	}
}

<<<<<<< HEAD
export async function handleWaitSyncObject(handler: unknown, args: string[]) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handleWaitSyncObject(handler: any, args: string[]) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
