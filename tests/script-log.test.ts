import { afterEach, describe, expect, test, vi } from "vitest";
import { handleMenuActionImpl } from "../ui/ts/core/actions/menu-action-dispatcher.js";
import {
	clearScriptLogs,
	getScriptLogs,
	recordScriptLog,
	subscribeScriptLogs,
} from "../ui/ts/core/diagnostics/script-log.js";
import { ModalManager } from "../ui/ts/ui/modal.js";

function createMockDom() {
	const elements = new Map<string, Record<string, unknown>>();
	const listeners = new Map<string, Map<string, Array<() => void>>>();

	const ensureEl = (id: string) => {
		let el = elements.get(id);
		if (!el) {
			el = {
				id,
				value: "all",
				textContent: "",
				style: { display: "none" },
				_innerHTML: "",
				addEventListener: (type: string, fn: () => void) => {
					let map = listeners.get(id);
					if (!map) {
						map = new Map();
						listeners.set(id, map);
					}
					if (!map.has(type)) map.set(type, []);
					map.get(type)?.push(fn);
				},
				dispatchEvent: (ev: { type: string }) => {
					const fns = listeners.get(id)?.get(ev.type) ?? [];
					for (const fn of fns) fn();
				},
				click: () => {
					const fns = listeners.get(id)?.get("click") ?? [];
					for (const fn of fns) fn();
				},
			};
			Object.defineProperty(el, "innerHTML", {
				get: () => el?._innerHTML ?? "",
				set: (html: string) => {
					if (el) el._innerHTML = html;
					// テンプレート内の主要IDを自動登録
					for (const match of html.matchAll(/id="([^"]+)"/g)) {
						ensureEl(match[1]);
					}
				},
			});
			elements.set(id, el);
		}
		return el;
	};

	ensureEl("modal-overlay");
	ensureEl("modal-content");

	(globalThis as Record<string, unknown>).document = {
		getElementById: (id: string) => elements.get(id) ?? null,
	};

	return { elements };
}

describe("script-log diagnostics & modal", () => {
	afterEach(() => {
		clearScriptLogs();
		delete (globalThis as Record<string, unknown>).document;
	});

	test("records, filters, subscribes, and clears script logs", () => {
		const snapshots: number[] = [];
		const unsubscribe = subscribeScriptLogs((entries) => {
			snapshots.push(entries.length);
		});

		recordScriptLog(
			"shiori",
			"OnBoot [200]",
			"\\h\\s[0]こんにちは\\e",
			"Emily",
		);
		recordScriptLog("sakura", "SakuraScript", "\\0\\s[0]テスト\\e");
		recordScriptLog("error", "SHIORI失敗: OnTest", "timeout");

		expect(getScriptLogs("all")).toHaveLength(3);
		expect(getScriptLogs("shiori")).toHaveLength(1);
		expect(getScriptLogs("sakura")).toHaveLength(1);
		expect(getScriptLogs("error")).toHaveLength(1);
		expect(snapshots).toEqual([1, 2, 3]);

		clearScriptLogs();
		expect(getScriptLogs("all")).toHaveLength(0);
		expect(snapshots).toEqual([1, 2, 3, 0]);
		unsubscribe();
	});

	test("menu-action-dispatcher opens script-log-modal-content for script-log and show-error-log", () => {
		const show = vi.fn();
		const context = {
			modalManager: { show },
		};

		handleMenuActionImpl(context as never, "script-log");
		handleMenuActionImpl(context as never, "show-error-log");

		expect(show).toHaveBeenNthCalledWith(1, "script-log-modal-content");
		expect(show).toHaveBeenNthCalledWith(2, "script-log-modal-content");
	});

	test("ModalManager renders script-log-modal-content and supports filter and clear", () => {
		const { elements } = createMockDom();

		recordScriptLog("shiori", "OnBoot [200]", "\\h\\s[0]Hello\\e");
		recordScriptLog("sakura", "SakuraScript", "\\0\\s[1]World\\e");

		const manager = new ModalManager({} as never);
		manager.show("script-log-modal-content");

		const countEl = elements.get("script-log-count");
		const listEl = elements.get("script-log-list");
		const filterEl = elements.get("script-log-filter");
		const clearBtn = elements.get("script-log-clear-btn");

		expect(countEl?.textContent).toBe("2 件");
		expect(String(listEl?.innerHTML)).toContain("OnBoot [200]");
		expect(String(listEl?.innerHTML)).toContain("SakuraScript");

		if (filterEl) {
			filterEl.value = "shiori";
			(filterEl.dispatchEvent as (ev: { type: string }) => void)({
				type: "change",
			});
		}
		expect(countEl?.textContent).toBe("1 件");
		expect(String(listEl?.innerHTML)).toContain("OnBoot [200]");
		expect(String(listEl?.innerHTML)).not.toContain("SakuraScript");

		(clearBtn?.click as (() => void) | undefined)?.();
		expect(countEl?.textContent).toBe("0 件");
		expect(String(listEl?.innerHTML)).toContain("ログはまだありません");
	});
});
