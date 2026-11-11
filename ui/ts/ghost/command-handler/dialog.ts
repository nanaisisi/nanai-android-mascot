/**
 * @file dialog.ts
 * @brief \![open,dialog,type,...] システムダイアログコマンドハンドラ
 */

export async function handleOpenDialogCommand(
	handler: import("../../ghost.js").SakuraCommandHandler,
	args: string[],
) {
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
