/**
 * @file sakura-command-handler.ts
 * @brief さくらスクリプトの \! 拡張コマンドおよび入力ボックス (\![open,inputbox]) ハンドラ
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

initDefaultCommandHandlers();

export class SakuraCommandHandler {
	player: any;
	app: any;
	teachForm: any;
	communicateForm: any;
	[key: string]: any;

	constructor(player: any) {
		this.player = player;
		this.app = player.app;
		this.teachForm = null;
		this.communicateForm = null;
		initDefaultCommandHandlers();
	}

	async runCommand(args: string[]) {
		const rawCmd = (args[0] ?? "").toLowerCase();
		const rawSub = (args[1] ?? "").toLowerCase();

		const handler = getCommandHandler(rawCmd, rawSub);
		if (handler) {
			await handler(this, args);
		} else {
			console.debug("未対応の \\! コマンド:", args);
		}
	}

	openInputBox(params: string[]) {
		openInputBox(this, params);
	}

	openTeachBox(params: string[] = [], options: unknown = {}) {
		openTeachBox(this, params, options);
	}

	closeTeachBox() {
		closeTeachBox(this);
	}

	openCommunicateBox(params: string[] = []) {
		openCommunicateBox(this, params);
	}

	closeCommunicateBox(notifyCancel: boolean = false) {
		closeCommunicateBox(this, notifyCancel);
	}

	async setAlignmentToDesktop(mode: string) {
		await setAlignmentToDesktop(this, mode);
	}

	async handleWindowState(state: string) {
		await handleWindowState(state);
	}

	async handleJump(target: string, args: string[] = []) {
		await handleJumpCommand(this, target, args);
	}

	expandEnv(script: string, options: any = {}) {
		return expandSakuraScriptEnv(script, {
			username: this.player?.app?.ghostController?.username,
			selfname: this.player?.app?.ghostController?.currentGhost?.name,
			lastghostname: this.player?.app?.ghostController?.lastGhostName,
			lastobjectname: this.player?.app?.ghostController?.lastObjectName,
			...(options as Record<string, any>),
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
