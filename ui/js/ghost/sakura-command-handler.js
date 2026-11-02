/**
 * さくらスクリプトの \! 拡張コマンドおよび入力ボックス (\![open,inputbox]) ハンドラ
 */

import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import {
	closeCommunicateBox,
	openCommunicateBox,
} from "./command-handler/communicatebox.js";
import {
	expandSakuraScriptEnv,
	resetScriptScopeState,
	scriptLifetimeState,
} from "./command-handler/env.js";
import {
	closeDialog,
	closeInputBox,
	closeTextAreaBox,
	openInputBox,
	openPasswordInput,
	openSliderInput,
	openTextAreaBox,
} from "./command-handler/inputbox.js";
import { handleJumpCommand } from "./command-handler/jump.js";
import {
	CommandHandlerMap,
	getCommandHandler,
	registerCommandHandler,
} from "./command-handler/registry.js";
import {
	handleBiffCommand,
	handleExecuteSntpCommand,
	handleOpenSystemTarget,
	handleSetAlignmentOnDesktop,
	handleSetTaskTrayIcon,
	handleSetTrayBalloon,
} from "./command-handler/system.js";
import { closeTeachBox, openTeachBox } from "./command-handler/teachbox.js";
import {
	handleWindowState,
	setAlignmentToDesktop,
} from "./command-handler/window.js";

/**
 * 標準コマンド群を CommandHandlerMap へ初期登録
 */
function initDefaultCommandHandlers() {
	if (CommandHandlerMap.size > 0) return;

	registerCommandHandler("open:inputbox", async (handler, args) => {
		openInputBox(handler, args.slice(2));
	});

	registerCommandHandler("open:passwordinput", async (handler, args) => {
		openPasswordInput(handler, args.slice(2));
	});

	registerCommandHandler("open:textareabox", async (handler, args) => {
		openTextAreaBox(handler, args.slice(2));
	});

	registerCommandHandler("open:sliderinput", async (handler, args) => {
		openSliderInput(handler, args.slice(2));
	});

	registerCommandHandler("close:inputbox", async (handler, args) => {
		closeInputBox(handler, args[2]);
	});

	registerCommandHandler("close:textareabox", async (handler, args) => {
		closeTextAreaBox(handler, args[2]);
	});

	registerCommandHandler("close:dialog", async (handler, args) => {
		closeDialog(handler, args[2]);
	});

	registerCommandHandler("open:teachbox", async (handler, args) => {
		openTeachBox(handler, args.slice(2));
	});

	registerCommandHandler("close:teachbox", async (handler) => {
		closeTeachBox(handler);
	});

	registerCommandHandler("open:communicatebox", async (handler, args) => {
		openCommunicateBox(handler, args.slice(2));
	});

	registerCommandHandler("close:communicatebox", async (handler) => {
		closeCommunicateBox(handler, false);
	});

	registerCommandHandler("open:dressupexplorer", async (handler) => {
		handler.app.toggleMenu?.();
	});

	registerCommandHandler("jump", async (handler, args) => {
		const target = args[1] ?? "";
		await handleJumpCommand(handler, target, args.slice(2));
	});

	registerCommandHandler("raise", async (handler, args) => {
		const eventName = args[1];
		if (eventName) {
			await handler.app.ghostController?.sendShioriEvent?.(
				eventName,
				args.slice(2),
			);
		}
	});

	registerCommandHandler("raiseplugin", handlePluginEvent);
	registerCommandHandler("notifyplugin", handlePluginEvent);
	registerCommandHandler("timerraiseplugin", handlePluginEvent);
	registerCommandHandler("timernotifyplugin", handlePluginEvent);

	registerCommandHandler("bind", async (handler, args) => {
		const [category, part, statusVal] = args.slice(1);
		await handler.app.surfaceManager?.bindDressup?.(
			category,
			part,
			statusVal,
			handler.player.currentScope,
			true,
		);
	});

	registerCommandHandler("bind-noevent", async (handler, args) => {
		const [category, part, statusVal] = args.slice(1);
		await handler.app.surfaceManager?.bindDressup?.(
			category,
			part,
			statusVal,
			handler.player.currentScope,
			false,
		);
	});

	registerCommandHandler("anim", async (handler, args) => {
		const [verbRaw, idVal, arg3, arg4] = args.slice(1);
		const targetStr = String(idVal ?? "").trim();
		const animIdNum = Number.parseInt(targetStr, 10);
		const animTarget = Number.isNaN(animIdNum) ? targetStr : animIdNum;
		const verb = String(verbRaw ?? "").toLowerCase();
		const sm = handler.app.surfaceManager;
		const scope = handler.player.currentScope;

		if (verb === "pause" || verb === "pouse") {
			sm?.pauseAnimationById?.(animTarget, scope);
		} else if (verb === "resume") {
			sm?.resumeAnimationById?.(animTarget, scope);
		} else if (verb === "stop" || verb === "clear") {
			sm?.stopAnimationById?.(animTarget, scope);
		} else if (verb === "offset") {
			const x = Number.parseInt(String(arg3 ?? "0"), 10) || 0;
			const y = Number.parseInt(String(arg4 ?? "0"), 10) || 0;
			sm?.setAnimationOffset?.(animTarget, x, y, scope);
		}
	});

	registerCommandHandler("set:choicetimeout", async (handler, args) => {
		const timeout = Number.parseInt(args[2] ?? "", 10);
		handler.player.choiceTimeout = Number.isFinite(timeout) ? timeout : 0;
	});

	registerCommandHandler("set:balloontimeout", async (handler, args) => {
		const timeout = Number.parseInt(args[2] ?? "", 10);
		handler.player.balloonTimeout = Number.isFinite(timeout) ? timeout : 0;
	});

	registerCommandHandler("set:alignmenttodesktop", async (handler, args) => {
		await setAlignmentToDesktop(handler, args[2]);
	});

	registerCommandHandler("set:alignmentondesktop", async (handler, args) => {
		await handleSetAlignmentOnDesktop(handler, args);
	});

	registerCommandHandler("set:tasktrayicon", async (handler, args) => {
		await handleSetTaskTrayIcon(handler, args);
	});

	registerCommandHandler("set:trayballoon", async (handler, args) => {
		await handleSetTrayBalloon(handler, args);
	});

	registerCommandHandler("biff", async (handler, args) => {
		await handleBiffCommand(handler, args);
	});

	registerCommandHandler("executesntp", async (handler, args) => {
		await handleExecuteSntpCommand(handler, args);
	});

	registerCommandHandler("open:explorer", handleOpenSystemTarget);
	registerCommandHandler("open:shellexplorer", handleOpenSystemTarget);
	registerCommandHandler("open:balloonexplorer", handleOpenSystemTarget);
	registerCommandHandler("open:ghostexplorer", handleOpenSystemTarget);
	registerCommandHandler("open:file", handleOpenSystemTarget);
	registerCommandHandler("open:browser", handleOpenSystemTarget);

	registerCommandHandler("windowstate", async (_handler, args) => {
		const state = args[1];
		if (state) {
			await handleWindowState(state);
		}
	});

	registerCommandHandler("change", async (handler, args) => {
		const [target, name] = args.slice(1);
		if (target === "ghost" && name) {
			await handler.app.ghostController?.switchGhost?.(name);
		}
	});

	registerCommandHandler("call", async (handler, args) => {
		const [target, name] = args.slice(1);
		if (target === "ghost" && name) {
			await handler.app.ghostController?.callGhost?.(name);
		}
	});

	registerCommandHandler("setwallpaper", async (_handler, args) => {
		const [filename, option] = args.slice(1);
		console.log(`🖼️ Wallpaper set: ${filename} (option: ${option})`);
	});

	registerCommandHandler("savewallpaper", async (_handler, _args) => {
		console.log("🖼️ Wallpaper savewallpaper executed");
	});

	registerCommandHandler("restorewallpaper", async (_handler, _args) => {
		console.log("🖼️ Wallpaper restorewallpaper executed");
	});

	registerCommandHandler("cancel", async (_handler, args) => {
		const [service, target] = args.slice(1);
		console.log(`🛑 Network service cancel: ${service} (${target})`);
	});

	registerCommandHandler("close", async (_handler, args) => {
		const [service, target] = args.slice(1);
		console.log(`🛑 Network service close: ${service} (${target})`);
	});

	registerCommandHandler("archiveexec", async (handler, args) => {
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
	});

	registerCommandHandler("downloadexec", async (_handler, args) => {
		const [url, savePath] = args.slice(1);
		console.log(`📥 Download requested: url=${url}, savePath=${savePath}`);
	});

	registerCommandHandler("uploadexec", async (_handler, args) => {
		const [url, filePath] = args.slice(1);
		console.log(`📤 Upload requested: url=${url}, filePath=${filePath}`);
	});

	registerCommandHandler("mailcheckexec", async (handler, args) => {
		const [account] = args.slice(1);
		console.log(`✉️ Mail check requested for account: ${account}`);
		await handler.app.networkActions?.checkEmail?.(account);
	});

	registerCommandHandler("mailexec", async (_handler, args) => {
		const [action, target] = args.slice(1);
		console.log(`✉️ Mail action ${action}: target=${target}`);
	});

	registerCommandHandler("fileexec", async (_handler, args) => {
		const [action, path, dest] = args.slice(1);
		console.log(`📁 File action ${action}: path=${path}, dest=${dest}`);
	});

	registerCommandHandler("sethttptimeout", async (_handler, args) => {
		const [timeout] = args.slice(1);
		console.log(`⏱️ HTTP timeout set: ${timeout}s`);
	});

	registerCommandHandler("setproxy", async (_handler, args) => {
		const [server, port] = args.slice(1);
		console.log(`🌐 Proxy set: ${server}:${port}`);
	});

	registerCommandHandler("update", async (handler) => {
		await handler.app.startNetworkUpdate?.();
	});

	registerCommandHandler("updatebymyself", async (handler) => {
		await handler.app.startNetworkUpdate?.();
	});
}

async function handlePluginEvent(_handler, args) {
	const rawCmd = (args[0] ?? "").toLowerCase();
	const isTimer = rawCmd.startsWith("timer");
	const pluginName = isTimer ? args[3] : args[1];
	const eventId = isTimer ? args[4] : args[2];
	const references = isTimer ? args.slice(5) : args.slice(3);
	if (pluginName && eventId && isTauriAvailable()) {
		try {
			await invoke("execute_plugin_event", {
				request: {
					pluginName,
					eventId,
					references,
				},
			});
		} catch (err) {
			console.warn(`Plugin event execution failed (${pluginName}):`, err);
		}
	}
}

// 起動時にデフォルトハンドラを登録
initDefaultCommandHandlers();

export class SakuraCommandHandler {
	/**
	 * @param {import('./sakura-script.js').SakuraScriptPlayer} player
	 */
	constructor(player) {
		this.player = player;
		this.app = player.app;
		this.teachForm = null;
		this.communicateForm = null;
		// 必要に応じてハンドラ初期化
		initDefaultCommandHandlers();
	}

	/**
	 * \![...] 内部コマンドの実行 (CommandHandlerMap 経由)
	 * @param {string[]} args
	 */
	async runCommand(args) {
		const rawCmd = (args[0] ?? "").toLowerCase();
		const rawSub = (args[1] ?? "").toLowerCase();

		const handler = getCommandHandler(rawCmd, rawSub);
		if (handler) {
			await handler(this, args);
		} else {
			console.debug("未対応の \\! コマンド:", args);
		}
	}

	openInputBox(params) {
		openInputBox(this, params);
	}

	openTeachBox(params = [], options = {}) {
		openTeachBox(this, params, options);
	}

	closeTeachBox() {
		closeTeachBox(this);
	}

	openCommunicateBox(params = []) {
		openCommunicateBox(this, params);
	}

	closeCommunicateBox(notifyCancel = false) {
		closeCommunicateBox(this, notifyCancel);
	}

	async setAlignmentToDesktop(mode) {
		await setAlignmentToDesktop(this, mode);
	}

	async handleWindowState(state) {
		await handleWindowState(state);
	}

	async handleJump(target, args = []) {
		await handleJumpCommand(this, target, args);
	}

	expandEnv(script, options = {}) {
		return expandSakuraScriptEnv(script, {
			username: this.player?.app?.ghostController?.username,
			selfname: this.player?.app?.ghostController?.currentGhost?.name,
			...options,
		});
	}

	resetLifetimeState() {
		resetScriptScopeState();
	}
}

export {
	CommandHandlerMap,
	expandSakuraScriptEnv,
	getCommandHandler,
	initDefaultCommandHandlers,
	registerCommandHandler,
	resetScriptScopeState,
	scriptLifetimeState,
};
