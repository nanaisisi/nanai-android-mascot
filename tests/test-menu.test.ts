import assert from "node:assert/strict";
import { test } from "vitest";

interface MockMenuElement {
	textContent: string;
	classes: Set<string>;
	classList: {
		add(c: string): void;
		remove(c: string): void;
		contains(c: string): boolean;
	};
	contains: () => boolean;
}

globalThis.window = globalThis as unknown as Window & typeof globalThis;
const documentListeners: Record<string, (ev: unknown) => void> = {};
const elements: Record<string, MockMenuElement> = {};

const getEl = (idOrClass: string): MockMenuElement => {
	const key = idOrClass.replace("#", "").replace(".", "");
	if (!elements[key]) {
		const classes = new Set<string>();
		elements[key] = {
			textContent: "",
			classes,
			classList: {
				add(c: string) {
					classes.add(c);
				},
				remove(c: string) {
					classes.delete(c);
				},
				contains(c: string) {
					return classes.has(c);
				},
			},
			contains: () => false,
		};
	}
	return elements[key];
};

globalThis.document = {
	getElementById(id: string) {
		return getEl(id);
	},
	querySelector(sel: string) {
		return getEl(sel);
	},
	addEventListener(type: string, cb: (ev: unknown) => void) {
		documentListeners[type] = cb;
	},
} as unknown as Document;

const { toggleMenu, openModal, closeModal } = await import(
	"../ui/ts/ui/test-menu.js"
);

test("test-menu covers toggleMenu, openModal, closeModal, and document listeners", () => {
	// 1. toggleMenu (show -> remove, remove -> show)
	toggleMenu();
	assert.equal(getEl("dropdown").classList.contains("show"), true);
	toggleMenu();
	assert.equal(getEl("dropdown").classList.contains("show"), false);

	// 2. openModal
	openModal("TestFeature");
	assert.equal(getEl("modal-text").textContent, "TestFeature の機能です");
	assert.equal(getEl("modal").classList.contains("show"), true);

	// 3. closeModal
	closeModal();
	assert.equal(getEl("modal").classList.contains("show"), false);

	// 4. Document click outside dropdown and menuBtn
	const dropdown = getEl("dropdown");
	const _menuBtn = getEl(".menu-btn");
	dropdown.classList.add("show");
	documentListeners.click?.({ target: { closest: () => null } });
	assert.equal(dropdown.classList.contains("show"), false);

	// 5. Document keydown Escape
	dropdown.classList.add("show");
	documentListeners.keydown?.({ key: "Escape" });
	assert.equal(dropdown.classList.contains("show"), false);

	assert.ok(true);
});
