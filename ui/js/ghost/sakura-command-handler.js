/**
 * さくらスクリプトの \! 拡張コマンドおよび入力ボックス (\![open,inputbox]) ハンドラ
 */

import {
	closeCommunicateBox,
	openCommunicateBox,
} from "./command-handler/communicatebox.js";
import { initDefaultCommandHandlers } from "./command-handler/defaults.js";
import {
	expandSakuraScriptEnv,
	resetScriptScopeState,
	scriptLifetimeState,
} from "./command-handler/env.js";
import { openInputBox } from "./command-handler/inputbox.js";
import { handleJumpCommand } from "./command-handler/jump.js";
import {
	CommandHandlerMap,
	getCommandHandler,
	registerCommandHandler,
} from "./command-handler/registry.js";
import { clearAllScriptTimers } from "./command-handler/system.js";
import { closeTeachBox, openTeachBox } from "./command-handler/teachbox.js";
import {
	handleWindowState,
	setAlignmentToDesktop,
} from "./command-handler/window.js";

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
			lastghostname: this.player?.app?.ghostController?.lastGhostName,
			lastobjectname: this.player?.app?.ghostController?.lastObjectName,
			...options,
		});
	}

	resetLifetimeState() {
		resetScriptScopeState();
		clearAllScriptTimers();
	}
}

export {
	CommandHandlerMap,
	clearAllScriptTimers,
	expandSakuraScriptEnv,
	getCommandHandler,
	initDefaultCommandHandlers,
	registerCommandHandler,
	resetScriptScopeState,
	scriptLifetimeState,
};
