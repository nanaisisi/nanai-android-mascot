export async function translateScript(player, script) {
	let finalScript = script;
	try {
		const app = player.app;
		if (app?.ghostController?.sendShioriEvent && !script.includes("\\_q")) {
			const transRes = await app.ghostController.sendShioriEvent(
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
