/**
 * @file menu-caption-renderer.ts
 * @brief UKADOC ownerdraw-item-name 準拠のメニュー項目キャプション動的解決・反映モジュール
 */
import { MENU_CAPTION_DEFINITIONS } from "./menu-caption-definitions.js";

export { MENU_CAPTION_DEFINITIONS };

export const menuCaptionRenderer = {
	applyCaptions(
		captions: Record<string, string> = {},
		rootEl: ParentNode = document,
	) {
		if (!captions || typeof captions !== "object") return;

		for (const def of MENU_CAPTION_DEFINITIONS) {
			const _customVal = captions[def.resource] || captions[def.id];
			const _el =
<<<<<<< HEAD
				(rootEl as unknown).getElementById?.(def.id) ||
				(rootEl as unknown).querySelector?.(`#${def.id}`);
=======
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(rootEl as any).getElementById?.(def.id) ||
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(rootEl as any).querySelector?.(`#$def.id`);
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
			if (!el) continue;

			if (customVal && typeof customVal === "string" && customVal.trim()) {
				const textSpan = el.querySelector?.("span:not(.shortcut-key)") || el;
				if (textSpan) {
					textSpan.textContent = customVal.trim();
				}
			}
		}
	},

	async fetchShioriCaptions(
<<<<<<< HEAD
		ghostController: unknown,
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		ghostController: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	): Promise<Record<string, string>> {
		if (!ghostController?.requestShioriResource) return {};
		const captions: Record<string, string> = {};
		for (const def of MENU_CAPTION_DEFINITIONS) {
			try {
				const res = await ghostController.requestShioriResource(
					def.resource,
					"",
				);
				if (res && res !== "1" && res !== "0") {
					captions[def.resource] = res;
				}
			} catch (_err) {
				// フォールバック継続
			}
		}
		return captions;
	},
};
