import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { actionMethods } from "../../ui/ts/core/app-actions.js";

describe("core-coverage-boost: app-actions edge cases", () => {
	it("handles action: talk with payload object scope", () => {
		let calledScope: number | undefined;
		const app = {
			...actionMethods,
			ghostController: {},
			onGhostClick: (
				_clientX?: unknown,
				_clientY?: unknown,
				_rect?: unknown,
				scopeId?: number,
			) => {
				calledScope = scopeId;
			},
		};

		app.handleMenuAction("talk", { scope: 1 });
		assert.equal(calledScope, 1);

		app.handleMenuAction("talk", "invalid_scope_type");
		assert.equal(calledScope, 0);
	});

	it("handles action: keep-temporary-ghost (active vs inactive)", () => {
		let bootedSent = false;
		const app = {
			...actionMethods,
			ghostController: {
				currentGhost: { isTemporary: true },
				sendShioriEvent: (evt: string) => {
					if (evt === "OnBoot") bootedSent = true;
				},
			},
			showBalloon: (_msg: string) => {},
			hideBalloon: () => {},
		};

		app.handleMenuAction("keep-temporary-ghost");
		assert.equal(app.ghostController.currentGhost.isTemporary, false);
		assert.equal(bootedSent, true);

		// Run again when not temporary (no-op, does not re-send OnBoot)
		bootedSent = false;
		app.handleMenuAction("keep-temporary-ghost");
		assert.equal(app.ghostController.currentGhost.isTemporary, false);
		assert.equal(bootedSent, false);
	});

	it("handles action: reset-shell-position and reset-balloon-position", () => {
		const ghostDisplay = {
			style: { left: "10px", top: "20px", transform: "scale(1.2)" },
			classList: {
				classes: new Set(["is-docked-left", "is-docked-right"]),
				remove(...cls: string[]) {
					for (const c of cls) this.classes.delete(c);
				},
			},
		};
		const interactionManager = {
			balloonOffsetX: 50,
			balloonOffsetY: 60,
		};

		const app = {
			...actionMethods,
			elements: { ghostDisplay },
			interactionManager,
			showBalloon: () => {},
			hideBalloon: () => {},
		};

		app.handleMenuAction("reset-shell-position");
		assert.equal(ghostDisplay.style.left, "");
		assert.equal(ghostDisplay.style.top, "");
		assert.equal(ghostDisplay.style.transform, "");
		assert.equal(ghostDisplay.classList.classes.has("is-docked-left"), false);

		app.handleMenuAction("reset-balloon-position");
		assert.equal(interactionManager.balloonOffsetX, 0);
		assert.equal(interactionManager.balloonOffsetY, 0);
	});

	it("handles ghost call, switch-to-shell, recent-ghost, and dressup-toggle", () => {
		let calledGhost: string | null = null;
		let calledShell: string | null = null;
		let toggledPayload: unknown = null;

		const app = {
			...actionMethods,
			ghostController: {
				selectGhost: async (name: string) => {
					calledGhost = name;
				},
				selectShell: async (name: string) => {
					calledShell = name;
				},
			},
			callGhost: (name: string) => {
				calledGhost = `called_${name}`;
			},
			handleDressupToggle: (payload: unknown) => {
				toggledPayload = payload;
			},
		};

		app.handleMenuAction("call-ghost", "Kero");
		assert.equal(calledGhost, "called_Kero");

		app.handleMenuAction("recent-ghost", { name: "Sakura" });
		assert.equal(calledGhost, "Sakura");

		app.handleMenuAction("switch-to-shell", { shellName: "winter" });
		assert.equal(calledShell, "winter");

		app.handleMenuAction("dressup-toggle", {
			category: "hat",
			part: "beret",
		});
		assert.deepEqual(toggledPayload, { category: "hat", part: "beret" });
	});

	it("falls back to modalManager for unhandled actions", () => {
		let shownModal: string | null = null;
		const app = {
			...actionMethods,
			modalManager: {
				show: (content: string) => {
					shownModal = content;
				},
			},
		};

		app.handleMenuAction("ghost-switch");
		assert.equal(shownModal, "ghost-modal-content");

		app.handleMenuAction("custom-menu");
		assert.equal(shownModal, "custom-menu-modal-content");
	});
});
