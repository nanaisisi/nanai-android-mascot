export async function translateScript(
<<<<<<< HEAD
	player: unknown,
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	player: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	script: string,
): Promise<string> {
	let finalScript = script;
	try {
		const app = player.app;
		if (app?.ghostController?.sendShioriEvent && !script.includes("\\_q")) {
<<<<<<< HEAD
			const transRes: unknown = await app.ghostController.sendShioriEvent(
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			const transRes: any = await app.ghostController.sendShioriEvent(
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
				"OnTranslate",
				[script],
			);
			if (transRes?.script?.trim()) {
				finalScript = transRes.script;
			}
		}
	} catch (_e) {
		// OnTranslate failure falls back to original script
	}
	return finalScript;
}
