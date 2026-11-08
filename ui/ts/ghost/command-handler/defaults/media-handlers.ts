import {
	handleArchiveExec,
	handleCancelNetworkService,
	handleCloseNetworkService,
	handleDownloadExec,
	handleEmptyRecycleBin,
	handleExecuteCommand,
	handleFileExec,
	handleFileWatchCommand,
	handleMailCheckExec,
	handleMailExec,
	handleNslookupCommand,
	handlePingCommand,
	handleRestoreWallpaper,
	handleSaveWallpaper,
	handleScheduleAddCommand,
	handleSetHttpTimeout,
	handleSetProxy,
	handleSetWallpaper,
	handleUpdate,
	handleUpdateByMyself,
	handleUploadExec,
} from "../media.js";
import { registerCommandHandler } from "../registry.js";

export function registerMediaCommandHandlers() {
	registerCommandHandler("update", async (handler, _args) => {
		await handleUpdate(handler);
	});

	registerCommandHandler("updatebymyself", async (handler, _args) => {
		await handleUpdateByMyself(handler);
	});

	registerCommandHandler("updateother", async (handler, _args) => {
		await handleUpdate(handler);
	});

	registerCommandHandler("mail", async (handler, args) => {
		await handleMailExec(handler, args);
	});

	registerCommandHandler("mailcheck", async (handler, args) => {
		await handleMailCheckExec(handler, args);
	});

	registerCommandHandler("file", async (handler, args) => {
		await handleFileExec(handler, args);
	});

	registerCommandHandler("download", async (handler, args) => {
		await handleDownloadExec(handler, args);
	});

	registerCommandHandler("upload", async (handler, args) => {
		await handleUploadExec(handler, args);
	});

	registerCommandHandler("archive", async (handler, args) => {
		await handleArchiveExec(handler, args);
	});

	registerCommandHandler("setproxy", async (handler, args) => {
		handleSetProxy(handler, args);
	});

	registerCommandHandler("sethttptimeout", async (handler, args) => {
		handleSetHttpTimeout(handler, args);
	});

	registerCommandHandler("savewallpaper", async (handler, args) => {
		await handleSaveWallpaper(handler, args);
	});

	registerCommandHandler("restorewallpaper", async (handler, args) => {
		await handleRestoreWallpaper(handler, args);
	});

	registerCommandHandler("setwallpaper", async (handler, args) => {
		await handleSetWallpaper(handler, args);
	});

	registerCommandHandler("cancelnetworkservice", async (handler, args) => {
		handleCancelNetworkService(handler, args);
	});

	registerCommandHandler("closenetworkservice", async (handler, args) => {
		handleCloseNetworkService(handler, args);
	});

	registerCommandHandler("execute", async (handler, args) => {
		await handleExecuteCommand(handler, args);
	});

	registerCommandHandler("execute:emptyrecyclebin", async (handler, args) => {
		await handleEmptyRecycleBin(handler, args);
	});

	registerCommandHandler("execute:filewatch", async (handler, args) => {
		await handleFileWatchCommand(handler, args, false);
	});

	registerCommandHandler("cancel:filewatch", async (handler, args) => {
		await handleFileWatchCommand(handler, args, true);
	});

	registerCommandHandler("execute:ping", async (handler, args) => {
		await handlePingCommand(handler, args.slice(1));
	});

	registerCommandHandler("execute:nslookup", async (handler, args) => {
		await handleNslookupCommand(handler, args.slice(1));
	});

	registerCommandHandler("execute:schedule-add", async (handler, args) => {
		await handleScheduleAddCommand(handler, args.slice(1));
	});
}

