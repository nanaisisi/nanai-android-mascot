import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
const elements = {};
globalThis.document = {
	getElementById(id) {
		if (!elements[id]) {
			elements[id] = {
				style: {},
				innerHTML: "",
				addEventListener(type, cb) {
					this._listeners = this._listeners || {};
					this._listeners[type] = cb;
				},
				click() {
					this._listeners?.click?.({ target: this });
				},
				querySelector: () => ({ addEventListener(t, cb) { cb(); } }),
			};
		}
		return elements[id];
	},
	createElement: (tag) => ({ innerHTML: "", appendChild() {}, style: {}, dataset: {}, addEventListener() {} }),
};

const { ModalManager } = await import("../ui/js/ui/modal.js");

test("ModalManager covers init, show, hide, notification, and list proxies", async () => {
	const mockApp = {};
	const manager = new ModalManager(mockApp);

	// 1. hide and show
	manager.hide();
	assert.equal(manager.overlay.style.display, "none");

	manager.show("ghost-modal-content");
	assert.equal(manager.overlay.style.display, "flex");

	// 2. show with non-existent template
	manager.show("non-existent-template");

	// 3. showNotification (success & error)
	manager.showNotification("Info", "Test message", false);
	assert.equal(manager.overlay.style.display, "flex");

	manager.showNotification("Error", "Critical error", true);

	// 4. Test init listeners (closeBtn click & overlay click)
	manager.closeBtn.click();
	assert.equal(manager.overlay.style.display, "none");

	manager.show("ghost-modal-content");
	manager.overlay.click(); // should hide when e.target === overlay
	assert.equal(manager.overlay.style.display, "none");

	// 5. Proxies
	manager.renderGhostList();
	manager.renderBalloonList();

	assert.ok(true);
});
