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
			const customVal = captions[def.resource] || captions[def.id];
			const el =
				(
					rootEl as unknown as {
						getElementById?: (id: string) => Element | null;
					}
				).getElementById?.(def.id) || rootEl.querySelector?.(`#${def.id}`);
			if (!el) continue;

			if (customVal && typeof customVal === "string" && customVal.trim()) {
				const parts = customVal.trim().split("\t");
				const textSpan = el.querySelector?.("span:not(.shortcut-key)") || el;
				if (textSpan) {
					textSpan.textContent = parts[0] || "";
				}
				if (parts[1]) {
					let shortcutSpan = el.querySelector?.(
						".shortcut-key",
					) as HTMLElement | null;
					if (!shortcutSpan && typeof el.appendChild === "function") {
						shortcutSpan = document.createElement("span");
						shortcutSpan.className = "shortcut-key";
						el.appendChild(shortcutSpan);
					}
					if (shortcutSpan) {
						shortcutSpan.textContent = parts[1];
					}
				}
			}
		}
	},

	async fetchShioriCaptions(
		ghostController: unknown,
	): Promise<Record<string, string>> {
		if (
			!(
				ghostController as {
					requestShioriResource?: (
						res: string,
						defaultVal: string,
					) => Promise<string>;
				}
			)?.requestShioriResource
		) {
			return {};
		}
		const captions: Record<string, string> = {};
		for (const def of MENU_CAPTION_DEFINITIONS) {
			try {
				const res = await (
					ghostController as {
						requestShioriResource: (
							res: string,
							defaultVal: string,
						) => Promise<string>;
					}
				).requestShioriResource(def.resource, "");
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
