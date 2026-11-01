/**
 * @file registry.js
 * @brief さくらスクリプト拡張コマンド (\![...], \j[...]) のハンドラ登録・管理 (CommandHandlerMap)
 */

/**
 * コマンドハンドラ型定義
 * @callback CommandHandlerFn
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 * @returns {Promise<void> | void}
 */

/**
 * コマンドハンドラレジストリ
 * @type {Map<string, CommandHandlerFn>}
 */
export const CommandHandlerMap = new Map();

/**
 * コマンドキーの正規化 (例: "open", "inputbox" -> "open:inputbox", "raise" -> "raise")
 * @param {string} cmd
 * @param {string} [subCmd]
 * @returns {string}
 */
export function normalizeCommandKey(cmd, subCmd = "") {
	const c = (cmd ?? "").toLowerCase().trim();
	const s = (subCmd ?? "").toLowerCase().trim();
	return s ? `${c}:${s}` : c;
}

/**
 * コマンドハンドラを登録
 * @param {string} cmd - コマンド名 (例: "raise", "open:inputbox", "jump")
 * @param {CommandHandlerFn} fn - ハンドラ関数
 */
export function registerCommandHandler(cmd, fn) {
	if (typeof fn !== "function") {
		throw new TypeError(`Handler for command "${cmd}" must be a function`);
	}
	CommandHandlerMap.set(cmd.toLowerCase().trim(), fn);
}

/**
 * 登録されているコマンドハンドラを取得
 * @param {string} cmd
 * @param {string} [subCmd]
 * @returns {CommandHandlerFn | undefined}
 */
export function getCommandHandler(cmd, subCmd = "") {
	const combinedKey = normalizeCommandKey(cmd, subCmd);
	if (CommandHandlerMap.has(combinedKey)) {
		return CommandHandlerMap.get(combinedKey);
	}
	const baseKey = (cmd ?? "").toLowerCase().trim();
	return CommandHandlerMap.get(baseKey);
}

/**
 * コマンドハンドラを解除
 * @param {string} cmd
 * @param {string} [subCmd]
 * @returns {boolean}
 */
export function unregisterCommandHandler(cmd, subCmd = "") {
	const key = normalizeCommandKey(cmd, subCmd);
	return CommandHandlerMap.delete(key);
}

/**
 * コマンドハンドラをクリア (テスト用)
 */
export function clearCommandHandlers() {
	CommandHandlerMap.clear();
}
