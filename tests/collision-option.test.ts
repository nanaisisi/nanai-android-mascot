import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { surfaceCollisionMethods } from "../ui/ts/surface/surface-collision.js";

describe("collisionoption-brace (nodrag* / nocontextmenu*)", () => {
	it("checks nodrag and nocontextmenu collisions per scope case-insensitively", () => {
		const manager = {
			...surfaceCollisionMethods,
			nodragCollisions: {
				sakura: ["Knob"],
				kero: ["Tail"],
				char2: ["Wing"],
			},
			nocontextmenuCollisions: {
				sakura: ["Head"],
			},
		};

		assert.equal(
			surfaceCollisionMethods.isNoDragCollision.call(manager, 0, "knob"),
			true,
		);
		assert.equal(
			surfaceCollisionMethods.isNoDragCollision.call(manager, 0, "Tail"),
			false,
		);
		assert.equal(
			surfaceCollisionMethods.isNoDragCollision.call(manager, 1, "TAIL"),
			true,
		);
		assert.equal(
			surfaceCollisionMethods.isNoDragCollision.call(manager, 2, "wing"),
			true,
		);

		assert.equal(
			surfaceCollisionMethods.isNoContextMenuCollision.call(manager, 0, "HEAD"),
			true,
		);
		assert.equal(
			surfaceCollisionMethods.isNoContextMenuCollision.call(manager, 1, "Head"),
			false,
		);
	});
});
