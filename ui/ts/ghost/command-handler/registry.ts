/**
 * @file registry.ts
 * @brief さくらスクリプト拡張コマンド (\![...], \j[...]) のハンドラ登録・管理 (CommandHandlerMap)
 */

export type CommandHandlerFn = (
	handler: import("../../ghost.js").SakuraCommandHandler,
	args: string[],
) => Promise<void> | void;

export const CommandHandlerMap = new Map<string, CommandHandlerFn>();

export function normalizeCommandKey(cmd: string, subCmd: string = ""): string {
	const c = (cmd ?? "").toLowerCase().trim();
	const s = (subCmd ?? "").toLowerCase().trim();
	return s ? `${c}:${s}` : c;
}

export function registerCommandHandler(cmd: string, fn: CommandHandlerFn) {
	if (typeof fn !== "function") {
		throw new TypeError(`Handler for command "${cmd}" must be a function`);
	}
	CommandHandlerMap.set(cmd.toLowerCase().trim(), fn);
}

export function getCommandHandler(
	cmd: string,
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
	cmd: string,
	subCmd: string = "",
): boolean {
	const key = normalizeCommandKey(cmd, subCmd);
	return CommandHandlerMap.delete(key);
}

export function clearCommandHandlers() {
	CommandHandlerMap.clear();
}
