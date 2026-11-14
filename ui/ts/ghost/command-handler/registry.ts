/**
 * @file registry.ts
 * @brief さくらスクリプト拡張コマンド (\![...], \j[...]) のハンドラ登録・管理 (CommandHandlerMap)
 */

import type { SakuraCommandName } from "../../core/wasm/pkg/nanai_core.js";

export type CommandHandlerFn = (
	handler: import("../sakura-command-handler.js").SakuraCommandHandler,
	args: string[],
) => Promise<void> | void;

export const CommandHandlerMap = new Map<string, CommandHandlerFn>();

export function normalizeCommandKey(cmd: SakuraCommandName | string, subCmd: string = ""): string {
	const c = (cmd ?? "").toLowerCase().trim();
	const s = (subCmd ?? "").toLowerCase().trim();
	return s ? `${c}:${s}` : c;
}

export function registerCommandHandler(cmd: SakuraCommandName | string, fn: CommandHandlerFn) {
	if (typeof fn !== "function") {
		throw new TypeError(`Handler for command "${cmd}" must be a function`);
	}
	CommandHandlerMap.set(cmd.toLowerCase().trim(), fn);
}

export function getCommandHandler(
	cmd: SakuraCommandName | string,
	subCmd: string = "",
): CommandHandlerFn | undefined {
	const combinedKey = normalizeCommandKey(cmd, subCmd);
	if (CommandHandlerMap.has(combinedKey)) {
		return CommandHandlerMap.get(combinedKey);
	}
	const baseKey = (cmd ?? "").toLowerCase().trim();
	return CommandHandlerMap.get(baseKey);
}

export function unregisterCommandHandler(
	cmd: SakuraCommandName | string,
	subCmd: string = "",
): boolean {
	const key = normalizeCommandKey(cmd, subCmd);
	return CommandHandlerMap.delete(key);
}

export function clearCommandHandlers() {
	CommandHandlerMap.clear();
}
