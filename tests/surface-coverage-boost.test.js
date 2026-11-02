import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { ghostSurfaceMethods } from "../ui/js/surface/ghost-surface.js";
import { SurfaceManager } from "../ui/js/surface/surface-manager.js";

describe("Surface Subsystem Coverage", () => {
	it("SurfaceManager delegates all animation methods to animationManager", async () => {
		const calls = [];
		const mockAnimMgr = {
			activeAnimationTimers: new Map([["1", 1]]),
			playAnimationPatterns: async (...args) =>
				calls.push(["playPatterns", args]),
			playAnimationById: async (...args) => calls.push(["playById", args]),
			stopAnimation: (...args) => calls.push(["stop", args]),
			setAnimationOffset: (...args) => calls.push(["setOffset", args]),
			waitForAnimation: async (...args) => calls.push(["wait", args]),
			onTalkEnd: (...args) => calls.push(["onTalkEnd", args]),
			onScriptEnd: (...args) => calls.push(["onScriptEnd", args]),
			onCharSpoken: (...args) => calls.push(["onCharSpoken", args]),
			pauseAnimation: (...args) => calls.push(["pause", args]),
			resumeAnimation: (...args) => calls.push(["resume", args]),
		};

		const sm = new SurfaceManager({});
		sm.animationManager = mockAnimMgr;

		assert.equal(sm.activeAnimationTimers, mockAnimMgr.activeAnimationTimers);
		await sm.playAnimationPatterns({ id: 1 }, 0, 0);
		await sm.playAnimationById(1, 0, false);
		sm.pauseAnimationById(1, 0);
		sm.resumeAnimationById(1, 0);
		sm.stopAnimationById(1, 0);
		sm.setAnimationOffset(1, 10, 20, 0);
		await sm.waitForAnimation(1, 0);
		sm.onTalkEnd(0);
		sm.onScriptEnd(0);
		sm.onCharSpoken(0);

		assert.equal(calls.length, 10);
	});

	it("ghostSurfaceMethods covers visibility, placeholder clear, and ghost text updates", async () => {
		// Mock DOM elements
		const elements = {
			"sakura-placeholder": { style: {}, innerHTML: "", title: "" },
			"kero-placeholder": { style: {}, innerHTML: "", title: "" },
			"kero-slot": { style: {} },
			"current-ghost": { textContent: "" },
		};
		const doc = {
			getElementById: (id) => elements[id] || null,
			querySelector: () => elements["sakura-placeholder"],
			createElement: () => ({
				getContext: () => ({ drawImage: () => {}, clearRect: () => {} }),
				style: {},
			}),
		};

		const originalDoc = globalThis.document;
		globalThis.document = doc;

		const gsm = Object.create(ghostSurfaceMethods);
		gsm.updateSurface = async () => {};

		// Set ghost name to null -> clears placeholders
		await gsm.updateGhostCharacter(null);
		assert.equal(elements["sakura-placeholder"].innerHTML, "");

		// Set ghost name with kero -> updates title and promises
		gsm.currentGhost = { name: "TestGhost", kero_name: "TestKero" };
		await gsm.updateGhostCharacter("TestGhost");
		assert.equal(elements["sakura-placeholder"].title, "TestGhost");

		// Set ghost name without kero -> hides kero slot
		gsm.currentGhost = { name: "TestGhostSolo" };
		await gsm.updateGhostCharacter("TestGhostSolo");

		// updateCurrentGhostDisplay
		gsm.updateCurrentGhostDisplay();
		assert.equal(elements["current-ghost"].textContent, "TestGhostSolo");

		globalThis.document = originalDoc;
	});

	it("surfaceRenderMethods covers composeFrameOnBase", async () => {
		const canvasMock = {
			getContext: () => ({
				drawImage: () => {},
				clearRect: () => {},
			}),
			width: 100,
			height: 100,
			toDataURL: () => "data:image/png;base64,mockResult",
		};

		const doc = {
			createElement: () => canvasMock,
		};
		const originalDoc = globalThis.document;
		const originalImage = globalThis.Image;
		globalThis.document = doc;
		globalThis.Image = class {
			set src(_v) {
				setTimeout(() => this.onload?.(), 0);
			}
		};

		const sm = new SurfaceManager({});
		sm.app = {
			ghostController: {
				currentGhost: { ghost_path: "/test/ghost" },
			},
		};

		// composeFrameOnBase
		const res = await sm.composeFrameOnBase(
			canvasMock,
			[{ file: "frame.png" }],
			async (_file) => "mock_data_url",
		);
		assert.ok(res);

		globalThis.document = originalDoc;
		globalThis.Image = originalImage;
	});
});
