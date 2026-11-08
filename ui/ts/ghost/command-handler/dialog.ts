/**
 * @file dialog.ts
 * @brief \![open,dialog,type,...] システムダイアログコマンドハンドラ
 */

<<<<<<< HEAD
export async function handleOpenDialogCommand(
	handler: unknown,
	args: string[],
) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handleOpenDialogCommand(handler: any, args: string[]) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
