import { afterEach, describe, expect, test, vi } from "vitest";
import { handleMenuActionImpl } from "../ui/ts/core/actions/menu-action-dispatcher.js";
import { ModalManager } from "../ui/ts/ui/modal.js";

function createMockDom() {
	const elements = new Map<string, Record<string, unknown>>();
	const listeners = new Map<string, Map<string, Array<() => void>>>();

	const ensureEl = (id: string) => {
		let el = elements.get(id);
		if (!el) {
			el = {
				id,
				value: "0",
				textContent: "",
				style: { display: "none" },
				_innerHTML: "",
				children: [] as unknown[],
				appendChild: (child: unknown) => {
					(el?.children as unknown[])?.push(child);
					return child;
				},
				addEventListener: (type: string, fn: () => void) => {
					let map = listeners.get(id);
					if (!map) {
						map = new Map();
						listeners.set(id, map);
					}
					if (!map.has(type)) map.set(type, []);
					map.get(type)?.push(fn);
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
		createElement: (_tag: string) => {
			const childListeners = new Map<string, Array<() => void>>();
			const node: Record<string, unknown> = {
				type: "",
				style: { cssText: "" },
				textContent: "",
				children: [] as unknown[],
				appendChild: (c: unknown) => {
					(node.children as unknown[]).push(c);
					return c;
				},
				addEventListener: (type: string, fn: () => void) => {
					if (!childListeners.has(type)) childListeners.set(type, []);
					childListeners.get(type)?.push(fn);
				},
				click: () => {
					for (const fn of childListeners.get("click") ?? []) fn();
				},
			};
			return node;
		},
	};

	return { elements };
}

describe("surface-test modal", () => {
	afterEach(() => {
		delete (globalThis as Record<string, unknown>).document;
	});

	test("menu-action-dispatcher opens surface-test-modal-content", () => {
		const show = vi.fn();
		handleMenuActionImpl(
			{ modalManager: { show } } as never,
			"open-surface-test",
		);
		expect(show).toHaveBeenCalledWith("surface-test-modal-content");
	});

	test("ModalManager renders surface-test-modal-content and applies surface ID by direct input and group button", () => {
		const { elements } = createMockDom();
		const setSurfaceId = vi.fn();

		const app = {
			surfaceManager: {
				shellManifest: {
					surface_table: {
						groups: [
							{
								name: "基本",
								entries: [{ surface_id: 10, name: "笑顔" }],
							},
						],
					},
					surfaces: {
						"10": { name: "笑顔" },
					},
				},
				setSurfaceId,
			},
		};

		const manager = new ModalManager(app as never);
		manager.show("surface-test-modal-content");

		const scopeEl = elements.get("surface-test-scope");
		const idInputEl = elements.get("surface-test-id-input");
		const applyBtn = elements.get("surface-test-apply-btn");
		const statusEl = elements.get("surface-test-status");
		const groupsEl = elements.get("surface-test-groups");

		if (scopeEl) scopeEl.value = "1";
		if (idInputEl) idInputEl.value = "25";
		(applyBtn?.click as (() => void) | undefined)?.();

		expect(setSurfaceId).toHaveBeenCalledWith(25, 1);
		expect(statusEl?.textContent).toBe("表示中: 25");

		// グループボタンクリックでも切り替わる
		const sections =
			(groupsEl?.children as Array<Record<string, unknown>>) ?? [];
		expect(sections.length).toBe(1);
		const list = (sections[0].children as Array<Record<string, unknown>>)[1];
		const btn = (list.children as Array<Record<string, unknown>>)[0];
		(btn.click as (() => void) | undefined)?.();

		expect(setSurfaceId).toHaveBeenCalledWith(10, 1);
		expect(idInputEl?.value).toBe("10");
		expect(statusEl?.textContent).toBe("表示中: 10 (笑顔)");
	});
});
