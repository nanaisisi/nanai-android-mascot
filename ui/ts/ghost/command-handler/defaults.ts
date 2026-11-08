/**
 * @file defaults.ts
 * @brief 標準さくらスクリプトコマンドハンドラ初期登録
 */

import { registerDialogCommandHandlers } from "./defaults/dialog-handlers.js";
import { registerGhostCommandHandlers } from "./defaults/ghost-handlers.js";
import { registerMediaCommandHandlers } from "./defaults/media-handlers.js";
import { registerSystemCommandHandlers } from "./defaults/system-handlers.js";
import { CommandHandlerMap } from "./registry.js";

export function initDefaultCommandHandlers() {
	if (CommandHandlerMap.size > 0) return;

	registerDialogCommandHandlers();
	registerGhostCommandHandlers();
	registerMediaCommandHandlers();
	registerSystemCommandHandlers();
}
