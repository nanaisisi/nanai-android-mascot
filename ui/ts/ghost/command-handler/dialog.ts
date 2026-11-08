/**
 * @file dialog.ts
 * @brief \![open,dialog,type,...] システムダイアログコマンドハンドラ
 */


export async function handleOpenDialogCommand(
	_handler: unknown,
	_args: string[],
) {


export async function _handleOpenDialogCommand(handler: any, args: string[]) {

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
