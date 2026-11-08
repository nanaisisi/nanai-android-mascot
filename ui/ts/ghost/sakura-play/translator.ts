export async function translateScript(

	player: unknown,

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	player: any,

	script: string,
): Promise<string> {
	let finalScript = script;
	try {
		const app = player.app;
		if (app?.ghostController?.sendShioriEvent && !script.includes("\\_q")) {

			const _transRes: unknown = await app.ghostController.sendShioriEvent(

			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			const transRes: any = await app.ghostController.sendShioriEvent(

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
