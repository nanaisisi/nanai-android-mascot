/**
 * @file dialog.js
 * @brief \![open,dialog,type,...] システムダイアログコマンドハンドラ
 */

/**
 * システムダイアログを開く (\![open,dialog,type,...])
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleOpenDialogCommand(handler, args) {
	const dialogType = args[2] || "open";
	const dialogParams = args.slice(3);

	if (handler.app?.modalDialogController?.openSystemDialog) {
		return await handler.app.modalDialogController.openSystemDialog(
			dialogType,
			dialogParams,
			handler.player?.currentScope,
		);
	}
}
