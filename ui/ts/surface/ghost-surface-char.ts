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
	const keroPlaceholder = byId("kero-placeholder");
	const keroSlot = byId("kero-slot");
	if (!sakuraPlaceholder) return;

	if (!ghostName) {
		sakuraPlaceholder.innerHTML = "";
		if (keroPlaceholder) keroPlaceholder.innerHTML = "";
		if (keroSlot) keroSlot.style.display = "none";
		return;
	}
	sakuraPlaceholder.title = ghostName;
	if (keroSlot) keroSlot.style.display = "none";
	if (keroPlaceholder) keroPlaceholder.innerHTML = "";

	const promises = [thisObj.updateSurface(0, 0)];

	const hasKero = Boolean(thisObj.currentGhost?.kero_name);
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
