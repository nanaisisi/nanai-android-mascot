/**
 * @file media.ts
 * @brief 壁紙設定・アーカイブ生成・ネットワーク処理・ファイル実行等のメディア/システム操作コマンド
 */

import { invoke, isTauriAvailable } from "../../core/tauri-helper.js";


export async function handleSetWallpaper(_handler: unknown, args: string[]) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleSetWallpaper(_handler: any, args: string[]) {

	const [filename, option] = args.slice(1);
	console.log(`🖼️ Wallpaper set: ${filename} (option: ${option})`);
}


export async function _handleSaveWallpaper(_handler: unknown, _args: string[]) {
	console.log("🖼️ Wallpaper savewallpaper executed");
}

export async function _handleRestoreWallpaper(
	_handler: unknown,
	_args: string[],
) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleSaveWallpaper(_handler: any, _args: string[]) {
	console.log("🖼️ Wallpaper savewallpaper executed");
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleRestoreWallpaper(_handler: any, _args: string[]) {

	console.log("🖼️ Wallpaper restorewallpaper executed");
}

export async function handleCancelNetworkService(

	_handler: unknown,

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_handler: any,

	args: string[],
) {
	const [service, target] = args.slice(1);
	console.log(`🛑 Network service cancel: ${service} (${target})`);
}


export async function _handleCloseNetworkService(
	_handler: unknown,
	args: string[],
) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleCloseNetworkService(_handler: any, args: string[]) {

	const [service, target] = args.slice(1);
	console.log(`🛑 Network service close: ${service} (${target})`);
}

export async function handleFileWatchCommand(

	_handler: unknown,

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	_handler: any,

	args: string[],
	isCancel: boolean = false,
) {
	const path = args.slice(1).join(",") || args[0] || "";
	console.log(`👁️ File watch ${isCancel ? "cancel" : "execute"}: path=${path}`);
	if (isTauriAvailable()) {
		try {
			await invoke(isCancel ? "cancel_file_watch" : "execute_file_watch", {
				path,
			});
		} catch (err) {
			console.warn("File watch operation failed:", err);
		}
	}
}


export async function _handleEmptyRecycleBin(
	_handler: unknown,
	_args: string[],
) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handleEmptyRecycleBin(_handler: any, _args: string[]) {

	console.log("🗑️ Empty recycle bin requested");
	if (isTauriAvailable()) {
		try {
			await invoke("empty_recycle_bin");
		} catch (err) {
			console.warn("empty_recycle_bin failed:", err);
		}
	}
}


export async function _handlePingCommand(_handler: unknown, _args: string[]) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handlePingCommand(handler: any, args: string[]) {

	const host = args[1] ?? args[0] ?? "";
	console.log(`📡 Ping requested: host=${host}`);
	if (isTauriAvailable()) {
		try {
			const res = await invoke("execute_ping", { host });
			if (handler?.app?.ghostController?.sendShioriEvent) {
				await handler.app.ghostController.sendShioriEvent("OnPingComplete", [
					host,
					String(res ?? ""),
				]);
			}
		} catch (err) {
			console.warn("Ping failed:", err);
			if (handler?.app?.ghostController?.sendShioriEvent) {
				await handler.app.ghostController.sendShioriEvent("OnPingFailure", [
					host,
					String(err),
				]);
			}
		}
	}
}


export async function _handleNslookupCommand(_handler: unknown, _args: string[]) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handleNslookupCommand(handler: any, args: string[]) {

	const host = args[1] ?? args[0] ?? "";
	console.log(`🔍 Nslookup requested: host=${host}`);
	if (isTauriAvailable()) {
		try {
			const res = await invoke("execute_nslookup", { host });
			if (handler?.app?.ghostController?.sendShioriEvent) {
				await handler.app.ghostController.sendShioriEvent(
					"OnNslookupComplete",
					[host, String(res ?? "")],
				);
			}
		} catch (err) {
			console.warn("Nslookup failed:", err);
			if (handler?.app?.ghostController?.sendShioriEvent) {
				await handler.app.ghostController.sendShioriEvent("OnNslookupFailure", [
					host,
					String(err),
				]);
			}
		}
	}
}


export async function _handleScheduleAddCommand(
	_handler: unknown,
	_args: string[],
) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handleScheduleAddCommand(handler: any, args: string[]) {

	const rawArgs = args[0]?.toLowerCase().includes("schedule")
		? args.slice(1)
		: args;
	const date = rawArgs[0] ?? "";
	const time = rawArgs[1] ?? "";
	const title = rawArgs[2] ?? "スケジュール";
	const memo = rawArgs[3] ?? "";
	console.log(
		`📅 Schedule add: date=${date}, time=${time}, title=${title}, memo=${memo}`,
	);
	if (isTauriAvailable()) {
		try {
			await invoke("add_schedule", { date, time, title, memo });
		} catch (err) {
			console.warn("add_schedule failed:", err);
		}
	}
	if (handler?.app?.ghostController?.sendShioriEvent) {
		await handler.app.ghostController.sendShioriEvent("OnScheduleAdd", [
			date,
			time,
			title,
			memo,
		]);
	}
}


export async function _handleExecuteCommand(_handler: unknown, _args: string[]) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleExecuteCommand(handler: any, args: string[]) {

	const subCmd = (args[1] ?? "").toLowerCase();
	const restArgs = args.slice(1);

	switch (subCmd) {
		case "emptyrecyclebin":
			await handleEmptyRecycleBin(handler, restArgs);
			break;
		case "filewatch":
			await handleFileWatchCommand(handler, restArgs, false);
			break;
		case "ping":
			await handlePingCommand(handler, restArgs);
			break;
		case "nslookup":
			await handleNslookupCommand(handler, restArgs);
			break;
		case "schedule-add":
		case "schedule_add":
			await handleScheduleAddCommand(handler, restArgs);
			break;
		case "createnar":
		case "createupdatedata":
		case "compressarchive":
		case "extractarchive":
			await handleArchiveExec(handler, [args[0], subCmd, ...args.slice(2)]);
			break;
		case "download":
		case "http-get":
			await handleDownloadExec(handler, restArgs);
			break;
		case "upload":
		case "http-post":
			await handleUploadExec(handler, restArgs);
			break;
		case "mailcheck":
			await handleMailCheckExec(handler, restArgs);
			break;
		case "mailsend":
		case "mailsettings":
			await handleMailExec(handler, restArgs);
			break;
		case "deletefile":
		case "renamefile":
		case "copyfile":
		case "movefile":
			await handleFileExec(handler, restArgs);
			break;
		case "sntp": {
			const { handleExecuteSntpCommand } = await import("./system/target.js");
			await handleExecuteSntpCommand(handler, restArgs);
			break;
		}
		case "resetwindowpos": {
			const { handleExecuteResetWindowPos } = await import(
				"./system/desktop.js"
			);
			await handleExecuteResetWindowPos(handler, restArgs);
			break;
		}
		case "resetballoonpos": {
			const { handleExecuteResetBalloonPos } = await import(
				"./system/desktop.js"
			);
			await handleExecuteResetBalloonPos(handler, restArgs);
			break;
		}
		default:
			console.debug(`未対応の \\![execute,...] サブコマンド: ${subCmd}`);
			break;
	}
}


export async function handleArchiveExec(_handler: unknown, _args: string[]) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleArchiveExec(handler: any, args: string[]) {

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


export async function _handleDownloadExec(_handler: unknown, _args: string[]) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleDownloadExec(_handler: any, args: string[]) {

	const [url, savePath] = args.slice(1);
	console.log(`📥 Download requested: url=${url}, savePath=${savePath}`);
}


export async function _handleUploadExec(_handler: unknown, _args: string[]) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleUploadExec(_handler: any, args: string[]) {

	const [url, filePath] = args.slice(1);
	console.log(`📤 Upload requested: url=${url}, filePath=${filePath}`);
}


export async function _handleMailCheckExec(_handler: unknown, _args: string[]) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleMailCheckExec(handler: any, args: string[]) {

	const [account] = args.slice(1);
	console.log(`✉️ Mail check requested for account: ${account}`);
	await handler.app.networkActions?.checkEmail?.(account);
}


export async function _handleMailExec(_handler: unknown, _args: string[]) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleMailExec(_handler: any, args: string[]) {

	const [action, target] = args.slice(1);
	console.log(`✉️ Mail action ${action}: target=${target}`);
}


export async function _handleFileExec(_handler: unknown, _args: string[]) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleFileExec(_handler: any, args: string[]) {

	const [action, path, dest] = args.slice(1);
	console.log(`📁 File action ${action}: path=${path}, dest=${dest}`);
}


export async function _handleSetHttpTimeout(_handler: unknown, _args: string[]) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleSetHttpTimeout(_handler: any, args: string[]) {

	const [timeout] = args.slice(1);
	console.log(`⏱️ HTTP timeout set: ${timeout}s`);
}


export async function _handleSetProxy(_handler: unknown, _args: string[]) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleSetProxy(_handler: any, args: string[]) {

	const [server, port] = args.slice(1);
	console.log(`🌐 Proxy set: ${server}:${port}`);
}


export async function _handleUpdate(handler: unknown) {
	await handler.app.startNetworkUpdate?.();
}

export async function _handleUpdateByMyself(handler: unknown) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleUpdate(handler: any) {
	await handler.app.startNetworkUpdate?.();
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleUpdateByMyself(_handler: any) {

	await handler.app.startNetworkUpdate?.();
}

export async function handleSoundEventNotify(

	handler: unknown,

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	handler: any,

	action: string,
	params: string[] = [],
) {
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
