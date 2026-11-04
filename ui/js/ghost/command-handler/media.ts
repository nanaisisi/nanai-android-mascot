/**
 * @file media.ts
 * @brief 壁紙設定・アーカイブ生成・ネットワーク処理・ファイル実行等のメディア/システム操作コマンド
 */

import { invoke, isTauriAvailable } from "../../core/tauri-helper.js";

export async function handleSetWallpaper(_handler: any, args: string[]) {
	const [filename, option] = args.slice(1);
	console.log(`🖼️ Wallpaper set: ${filename} (option: ${option})`);
}

export async function handleSaveWallpaper(_handler: any, _args: string[]) {
	console.log("🖼️ Wallpaper savewallpaper executed");
}

export async function handleRestoreWallpaper(_handler: any, _args: string[]) {
	console.log("🖼️ Wallpaper restorewallpaper executed");
}

export async function handleCancelNetworkService(_handler: any, args: string[]) {
	const [service, target] = args.slice(1);
	console.log(`🛑 Network service cancel: ${service} (${target})`);
}

export async function handleCloseNetworkService(_handler: any, args: string[]) {
	const [service, target] = args.slice(1);
	console.log(`🛑 Network service close: ${service} (${target})`);
}

export async function handleArchiveExec(handler: any, args: string[]) {
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

export async function handleDownloadExec(_handler: any, args: string[]) {
	const [url, savePath] = args.slice(1);
	console.log(`📥 Download requested: url=${url}, savePath=${savePath}`);
}

export async function handleUploadExec(_handler: any, args: string[]) {
	const [url, filePath] = args.slice(1);
	console.log(`📤 Upload requested: url=${url}, filePath=${filePath}`);
}

export async function handleMailCheckExec(handler: any, args: string[]) {
	const [account] = args.slice(1);
	console.log(`✉️ Mail check requested for account: ${account}`);
	await handler.app.networkActions?.checkEmail?.(account);
}

export async function handleMailExec(_handler: any, args: string[]) {
	const [action, target] = args.slice(1);
	console.log(`✉️ Mail action ${action}: target=${target}`);
}

export async function handleFileExec(_handler: any, args: string[]) {
	const [action, path, dest] = args.slice(1);
	console.log(`📁 File action ${action}: path=${path}, dest=${dest}`);
}

export async function handleSetHttpTimeout(_handler: any, args: string[]) {
	const [timeout] = args.slice(1);
	console.log(`⏱️ HTTP timeout set: ${timeout}s`);
}

export async function handleSetProxy(_handler: any, args: string[]) {
	const [server, port] = args.slice(1);
	console.log(`🌐 Proxy set: ${server}:${port}`);
}

export async function handleUpdate(handler: any) {
	await handler.app.startNetworkUpdate?.();
}

export async function handleUpdateByMyself(handler: any) {
	await handler.app.startNetworkUpdate?.();
}

export async function handleSoundEventNotify(handler: any, action: string, params: string[] = []) {
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
