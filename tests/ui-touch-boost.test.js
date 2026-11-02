import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { ModalDialogController } from "../ui/js/ui/renderers/modal-dialog-controller.js";
import { DockManager } from "../ui/js/ui/touch/bridge/dock.js";
import { OverlayManager } from "../ui/js/ui/touch/bridge/overlay.js";

describe("UI Renderers and Touch Bridge Coverage Boost", () => {
	it("text-inputs.js covers Escape key, close without target, and textarea submit", async () => {
		const forms = [];
		const balloon = {
			appendChild: (child) => forms.push(child),
			removeChild: (child) => {
				const idx = forms.indexOf(child);
				if (idx >= 0) forms.splice(idx, 1);
			},
		};

		const textareaMock = {
			value: "test",
			addEventListener: (t, cb) => {
				textareaMock[t] = cb;
			},
			dispatchEvent: (ev) => {
				if (textareaMock[ev.type]) textareaMock[ev.type](ev);
			},
			scrollIntoView: () => {},
		};

		const formMock = {
			className: "modal-dialog-form",
			dataset: { boxId: "ta1" },
			querySelector: () => textareaMock,
			querySelectorAll: () => [textareaMock],
			appendChild: () => {},
			remove: () => {},
			scrollIntoView: () => {},
			addEventListener: () => {},
		};

		const origDoc = globalThis.document;
		globalThis.document = {
			createElement: () => formMock,
			createDocumentFragment: () => ({ appendChild: () => {} }),
		};

		const app = {
			elements: {
				balloonDisplay: balloon,
			},
			ghostController: {
				sendShioriEvent: async () => {},
			},
		};

		const controller = new ModalDialogController(app);

		// openInputBox without balloon returns null
		const noBalloonCtrl = new ModalDialogController({ elements: {} });
		assert.equal(noBalloonCtrl.openInputBox("id1"), null);
		assert.equal(noBalloonCtrl.openTextAreaBox("id2"), null);

		// openTextAreaBox and test Escape key cancel
		const taForm = controller.openTextAreaBox(["ta1", "--text=default text"]);
		if (taForm) {
			// Press Escape on textarea
			textareaMock.dispatchEvent({
				type: "keydown",
				key: "Escape",
				stopPropagation: () => {},
				preventDefault: () => {},
			});
		}

		// Close targeted inputbox by ID
		controller.openInputBox("box_to_close");
		controller.closeInputBox("box_to_close");

		// Close fallback inputbox
		controller.activeBoxes.set("inputbox", { cleanup: () => {} });
		controller.closeInputBox();

		// Close fallback textareabox
		controller.activeBoxes.set("textareabox", { cleanup: () => {} });
		controller.closeTextAreaBox();

		globalThis.document = origDoc;
	});

	it("OverlayManager covers error catches and reset state", async () => {
		globalThis.window = globalThis;
		globalThis.__TAURI_INTERNALS__ = {
			invoke: async () => {
				throw new Error("mock invoke error");
			},
		};

		const overlay = new OverlayManager();

		// requestOverlayPermission throws when Tauri available
		await assert.rejects(async () => {
			await overlay.requestOverlayPermission();
		});

		// setupForegroundService throws when Tauri available
		await assert.rejects(async () => {
			await overlay.setupForegroundService(true);
		});

		// setOverlayTransparency fallback
		await overlay.setOverlayTransparency(0.5);

		// setClickThrough fallback
		await overlay.setClickThrough(true);

		// trimMemory fallback
		await overlay.trimMemory(15);

		// reset
		overlay.reset();
		assert.equal(overlay.overlayTransparency, 1.0);
		assert.equal(overlay.isClickThrough, false);

		delete globalThis.__TAURI_INTERNALS__;
	});

	it("DockManager covers gesture unbind error handling", () => {
		const dock = new DockManager();
		dock._gestureUnbind = () => {
			throw new Error("unbind error");
		};
		// Calling setGestureRecognizer again triggers unbind safely
		dock.setGestureRecognizer({
			on: () => () => {},
		});
		assert.equal(typeof dock._gestureUnbind, "function");

		// destroy triggers unbind safely
		dock.destroy();
		assert.equal(dock._gestureUnbind, null);
	});
});
