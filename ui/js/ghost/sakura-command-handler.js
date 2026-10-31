/**
 * さくらスクリプトの \! 拡張コマンドおよび入力ボックス (\![open,inputbox]) ハンドラ
 */
import { openInputBox } from "./command-handler/inputbox.js";
import { openTeachBox, closeTeachBox } from "./command-handler/teachbox.js";
import { handleWindowState, setAlignmentToDesktop } from "./command-handler/window.js";

export class SakuraCommandHandler {
	/**
	 * @param {import('./sakura-script.js').SakuraScriptPlayer} player
	 */
	constructor(player) {
		this.player = player;
		this.app = player.app;
		this.teachForm = null;
	}

	/**
	 * \![...] 内部コマンドの実行
	 */
	async runCommand(args) {
		const rawCmd = (args[0] ?? "").toLowerCase();
		const rawSub = (args[1] ?? "").toLowerCase();

		if (rawCmd === "open" && rawSub === "inputbox") {
			openInputBox(this, args.slice(2));
		} else if (rawCmd === "open" && rawSub === "teachbox") {
			openTeachBox(this, args.slice(2));
		} else if (rawCmd === "close" && rawSub === "teachbox") {
			closeTeachBox(this);
		} else if (rawCmd === "open" && rawSub === "dressupexplorer") {
			this.app.toggleMenu?.();
		} else if (rawCmd === "raise") {
			const eventName = args[1];
			if (eventName) {
				await this.app.ghostController.sendShioriEvent(
					eventName,
					args.slice(2),
				);
			}
		} else if (rawCmd === "bind" || rawCmd === "bind-noevent") {
			const [category, part, statusVal] = args.slice(1);
			await this.app.surfaceManager?.bindDressup(
				category,
				part,
				statusVal,
				this.player.currentScope,
				rawCmd !== "bind-noevent",
			);
		} else if (rawCmd === "anim") {
			const [verbRaw, idVal] = args.slice(1);
			const animId = Number.parseInt(String(idVal ?? ""), 10);
			const verb = String(verbRaw ?? "").toLowerCase();
			if (Number.isFinite(animId)) {
				const sm = this.app.surfaceManager;
				if (verb === "pause" || verb === "pouse") {
					sm?.pauseAnimationById(animId, this.player.currentScope);
				} else if (verb === "resume") {
					sm?.resumeAnimationById(animId, this.player.currentScope);
				}
			}
		} else if (rawCmd === "set" && rawSub === "alignmenttodesktop") {
			await setAlignmentToDesktop(this, args[2]);
		} else if (rawCmd === "windowstate") {
			const state = args[1];
			if (state) {
				await handleWindowState(state);
			}
		} else if (rawCmd === "change") {
			const [target, name] = args.slice(1);
			if (target === "ghost" && name) {
				await this.app.ghostController?.switchGhost?.(name);
			}
		} else if (rawCmd === "call") {
			const [target, name] = args.slice(1);
			if (target === "ghost" && name) {
				await this.app.ghostController?.callGhost?.(name);
			}
		} else if (rawCmd === "setwallpaper") {
			const [filename, option] = args.slice(1);
			console.log(`🖼️ Wallpaper set: ${filename} (option: ${option})`);
		} else if (rawCmd === "savewallpaper" || rawCmd === "restorewallpaper") {
			console.log(`🖼️ Wallpaper ${rawCmd} executed`);
		} else if (rawCmd === "cancel" || rawCmd === "close") {
			const [service, target] = args.slice(1);
			console.log(`🛑 Network service ${rawCmd}: ${service} (${target})`);
		} else if (rawCmd === "archiveexec") {
			const [action, filename, dest] = args.slice(1);
			console.log(`📦 Archive action ${action}: file=${filename}, dest=${dest}`);
		} else if (rawCmd === "downloadexec") {
			const [url, savePath] = args.slice(1);
			console.log(`📥 Download requested: url=${url}, savePath=${savePath}`);
		} else if (rawCmd === "uploadexec") {
			const [url, filePath] = args.slice(1);
			console.log(`📤 Upload requested: url=${url}, filePath=${filePath}`);
		} else if (rawCmd === "mailcheckexec") {
			const [account] = args.slice(1);
			console.log(`✉️ Mail check requested for account: ${account}`);
			await this.app.networkActions?.checkEmail?.(account);
		} else if (rawCmd === "mailexec") {
			const [action, target] = args.slice(1);
			console.log(`✉️ Mail action ${action}: target=${target}`);
		} else if (rawCmd === "fileexec") {
			const [action, path, dest] = args.slice(1);
			console.log(`📁 File action ${action}: path=${path}, dest=${dest}`);
		} else if (rawCmd === "sethttptimeout") {
			const [timeout] = args.slice(1);
			console.log(`⏱️ HTTP timeout set: ${timeout}s`);
		} else if (rawCmd === "setproxy") {
			const [server, port] = args.slice(1);
			console.log(`🌐 Proxy set: ${server}:${port}`);
		} else if (rawCmd === "update" || rawCmd === "updatebymyself") {
			await this.app.startNetworkUpdate?.();
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

	async setAlignmentToDesktop(mode) {
		await setAlignmentToDesktop(this, mode);
	}

	async handleWindowState(state) {
		await handleWindowState(state);
	}
}
