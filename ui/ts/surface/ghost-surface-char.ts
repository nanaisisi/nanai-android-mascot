// @ts-nocheck
import { invoke, isTauriAvailable } from "../core/tauri-helper.js";

const byId = (id) => document.getElementById(id);

export async function updateGhostCharacter(
	thisObj: unknown,
	ghostName: string | null,
) {
	const sakuraPlaceholder =
		byId("sakura-placeholder") ||
		document.querySelector(".character-placeholder");
	if (!sakuraPlaceholder) return;

	if (!ghostName) {
		sakuraPlaceholder.innerHTML = "";
		return;
	}
	sakuraPlaceholder.title = ghostName;

	const promises = [thisObj.updateSurface(0, 0)];

	const hasKero = Boolean(
		thisObj.currentGhost?.kero_name ||
			thisObj.currentGhost?.keroName ||
			(Array.isArray(thisObj.shells) && thisObj.shells.length > 1),
	);

	if (hasKero) {
		promises.push(thisObj.updateSurface(10, 1));
	} else if (isTauriAvailable()) {
		invoke("hide_subchar_window", { scopeId: 1 }).catch(() => {});
	}

	await Promise.all(promises);
}

export function updateCurrentGhostDisplay(thisObj: unknown) {
	const el = byId("current-ghost");
	if (el) {
		el.textContent = thisObj.currentGhost
			? thisObj.currentGhost.name
			: "未選択";
	}
}
