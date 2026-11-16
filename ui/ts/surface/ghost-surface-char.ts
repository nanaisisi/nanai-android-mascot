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

	// スコープ 0 (メイン) とスコープ 1 (サブ) の両方を独立して並行初期化・更新
	const promises = [
		thisObj.updateSurface(0, 0),
		thisObj.updateSurface(10, 1),
	];
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
