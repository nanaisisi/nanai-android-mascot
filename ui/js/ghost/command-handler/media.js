/**
 * @file media.js
 * @brief 壁紙設定・アーカイブ生成・ネットワーク処理・ファイル実行等のメディア/システム操作コマンド
 */

import { invoke, isTauriAvailable } from "../../core/tauri-helper.js";

export async function handleSetWallpaper(_handler, args) {
	const [filename, option] = args.slice(1);
	console.log(`🖼️ Wallpaper set: ${filename} (option: ${option})`);
}

export async function handleSaveWallpaper(_handler, _args) {
	console.log("🖼️ Wallpaper savewallpaper executed");
}

export async function handleRestoreWallpaper(_handler, _args) {
	console.log("🖼️ Wallpaper restorewallpaper executed");
}

export async function handleCancelNetworkService(_handler, args) {
	const [service, target] = args.slice(1);
	console.log(`🛑 Network service cancel: ${service} (${target})`);
}

export async function handleCloseNetworkService(_handler, args) {
	const [service, target] = args.slice(1);
	console.log(`🛑 Network service close: ${service} (${target})`);
}

export async function handleArchiveExec(handler, args) {
	const [action, filename, dest] = args.slice(1);
	console.log(`📦 Archive action ${action}: file=${filename}, dest=${dest}`);
	if (action === "createnar" && isTauriAvailable()) {
		try {
			const ghostPath = handler.app.ghostController?.currentGhost?.path || "";
			const outputPath = filename || `${ghostPath}.nar`;
			await invoke("create_nar_archive", {
				folderPath: ghostPath,
				outputNarPath: outputPath,
			});
			console.log(`📦 Created NAR archive: ${outputPath}`);
		} catch (err) {
			console.warn("Failed to create NAR archive:", err);
		}
	}
}

export async function handleDownloadExec(_handler, args) {
	const [url, savePath] = args.slice(1);
	console.log(`📥 Download requested: url=${url}, savePath=${savePath}`);
}

export async function handleUploadExec(_handler, args) {
	const [url, filePath] = args.slice(1);
	console.log(`📤 Upload requested: url=${url}, filePath=${filePath}`);
}

export async function handleMailCheckExec(handler, args) {
	const [account] = args.slice(1);
	console.log(`✉️ Mail check requested for account: ${account}`);
	await handler.app.networkActions?.checkEmail?.(account);
}

export async function handleMailExec(_handler, args) {
	const [action, target] = args.slice(1);
	console.log(`✉️ Mail action ${action}: target=${target}`);
}

export async function handleFileExec(_handler, args) {
	const [action, path, dest] = args.slice(1);
	console.log(`📁 File action ${action}: path=${path}, dest=${dest}`);
}

export async function handleSetHttpTimeout(_handler, args) {
	const [timeout] = args.slice(1);
	console.log(`⏱️ HTTP timeout set: ${timeout}s`);
}

export async function handleSetProxy(_handler, args) {
	const [server, port] = args.slice(1);
	console.log(`🌐 Proxy set: ${server}:${port}`);
}

export async function handleUpdate(handler) {
	await handler.app.startNetworkUpdate?.();
}

export async function handleUpdateByMyself(handler) {
	await handler.app.startNetworkUpdate?.();
}

/**
 * サウンド停止・ループ・エラー・拡張再生SHIORIイベント通知ハンドラ
 * [OnSoundStop.md], [OnSoundLoop.md], [OnSoundError.md], [OnMusicPlayEx.md]
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {'stop' | 'loop' | 'error' | 'playex'} action
 * @param {string[]} [params=[]]
 */
export async function handleSoundEventNotify(handler, action, params = []) {
	const gc = handler?.app?.ghostController;
	if (!gc?.sendShioriEvent) return;

	switch (action) {
		case "stop":
			await gc.sendShioriEvent("OnSoundStop", params);
			break;
		case "loop":
			await gc.sendShioriEvent("OnSoundLoop", params);
			break;
		case "error":
			await gc.sendShioriEvent("OnSoundError", params);
			break;
		case "playex":
			await gc.sendShioriEvent("OnMusicPlayEx", params);
			break;
		default:
			break;
	}
}
