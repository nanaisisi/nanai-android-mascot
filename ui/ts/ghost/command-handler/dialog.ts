/**
 * @file dialog.ts
 * @brief \![open,dialog,type,...] システムダイアログコマンドハンドラ
 */

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handleOpenDialogCommand(handler: any, args: string[]) {
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
