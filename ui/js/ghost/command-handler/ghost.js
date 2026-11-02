/**
 * @file ghost.js
 * @brief ゴースト操作・イベント送信コマンド (\![raise,...], \![change,ghost,...], \![call,ghost,...])
 */

/**
 * SHIORI イベント発火コマンド (\![raise,イベント名,r0,r1,...])
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleRaiseCommand(handler, args) {
	const eventName = args[1];
	if (eventName) {
		await handler.app.ghostController?.sendShioriEvent?.(
			eventName,
			args.slice(2),
		);
	}
}

/**
 * ゴースト切り替えコマンド (\![change,ghost,ゴースト名])
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleChangeCommand(handler, args) {
	const [target, name] = args.slice(1);
	if (target === "ghost" && name) {
		await handler.app.ghostController?.switchGhost?.(name);
	}
}

/**
 * ゴースト呼び出しコマンド (\![call,ghost,ゴースト名])
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleCallCommand(handler, args) {
	const [target, name] = args.slice(1);
	if (target === "ghost" && name) {
		await handler.app.ghostController?.callGhost?.(name);
	}
}
