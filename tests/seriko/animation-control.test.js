import assert from "node:assert/strict";
import { test } from "vitest";
import { SurfaceAnimationManager } from "../../ui/js/surface/surface-animation-manager.js";
import { animationFixture } from "./helpers.js";

test("SERIKO option exclusive stops other animations and blocks new ones", async () => {
	const { animation } = animationFixture();
	const events = [];
	animation.scheduler.onFrameStep((ev) => {
		events.push(ev);
	});

	// background アニメーション開始
	animation.playAnimationPatterns(
		{
			id: 1,
			options: ["background"],
			patterns: [
				{ surface: 101, wait: 0 },
				{ surface: 102, wait: 100 },
			],
		},
		0,
		0,
	);

	// exclusive アニメーション開始
	const exclusivePromise = animation.playAnimationPatterns(
		{
			id: 2,
			options: ["exclusive"],
			patterns: [
				{ surface: 201, wait: 20 },
				{ surface: -1, wait: 0 },
			],
		},
		0,
		0,
	);

	// exclusive 実行中に通常アニメーションを要求してもブロックされる
	const blockedPromise = animation.playAnimationPatterns(
		{
			id: 3,
			patterns: [{ surface: 301, wait: 0 }],
		},
		0,
		0,
	);
	await blockedPromise;
	await exclusivePromise;

	assert.ok(events.some((e) => e.animationId === 1 && e.isBackground === true));
	assert.ok(events.some((e) => e.animationId === 2));
	assert.equal(
		events.some((e) => e.animationId === 3),
		false,
	);
});

test("SurfaceAnimationManager findAnimation supports both numeric ID and name", () => {
	const manager = {
		animations: {
			0: [
				{ id: 10, name: "blink", patterns: [] },
				{ id: 20, name: "mouth", patterns: [] },
			],
		},
		currentSurfaceIdFor: () => 0,
	};
	const animManager = new SurfaceAnimationManager(manager);
	assert.equal(animManager.findAnimation(10)?.name, "blink");
	assert.equal(animManager.findAnimation("blink")?.id, 10);
	assert.equal(animManager.findAnimation("MOUTH")?.id, 20);
	assert.equal(animManager.findAnimation("nonexistent"), null);
});

test("SurfaceAnimationManager stopAnimation stops running animation by ID or name", async () => {
	const { animation, frames } = animationFixture();
	const animDef = {
		id: 99,
		name: "long_running",
		patterns: [
			{ surface: 101, wait: 0 },
			{ surface: 102, wait: 100 },
			{ surface: 103, wait: 100 },
		],
	};
	animation.manager.animations = { 0: [animDef] };

	const playPromise = animation.playAnimationPatterns(animDef, 0, 0);
	await new Promise((resolve) => setTimeout(resolve, 20));

	// 名前で停止
	animation.stopAnimation(0, "long_running");
	await playPromise;

	// 102, 103 は停止されたため描画されない
	assert.equal(
		frames.some(([, , layers]) => layers?.[0]?.file?.includes("103")),
		false,
	);
});

test("SurfaceAnimationManager setAnimationOffset shifts animation layer coordinates", async () => {
	const { animation, frames } = animationFixture();
	const animDef = {
		id: 55,
		name: "shifted",
		patterns: [{ surface: 105, wait: 0, x: 10, y: 20 }],
	};
	animation.manager.animations = { 0: [animDef] };

	animation.setAnimationOffset(0, "shifted", 30, 40);
	await animation.playAnimationPatterns(animDef, 0, 0);

	const layer = frames[0][2][0];
	assert.equal(layer.x, 40); // 10 + 30
	assert.equal(layer.y, 60); // 20 + 40
});

test("SurfaceAnimationManager pattern execution handles start and stop control methods", async () => {
	const { animation } = animationFixture();

	const targetAnim = {
		id: 10,
		interval: "never",
		patterns: [
			{ surface: 101, wait: 0 },
			{ surface: 102, wait: 150 },
		],
	};

	const controllerAnim = {
		id: 1,
		interval: "runonce",
		patterns: [
			{ type: "start", targetParam: "10", wait: 0 },
			{ type: "stop", targetParam: "10", wait: 50 },
		],
	};

	animation.manager.animations = { 0: [targetAnim, controllerAnim] };

	// controllerAnim を再生
	await animation.playAnimationPatterns(controllerAnim, 0, 0);

	// targetAnim は開始されたが 50ms 後に stop されたため実行中リストに残らない
	assert.equal(animation.isAnimationRunning(0, 10), false);
});

test("SurfaceAnimationManager pattern execution handles move draw method", async () => {
	const { animation } = animationFixture();

	const moveAnim = {
		id: 8,
		interval: "runonce",
		patterns: [
			{ type: "move", x: 25, y: -15, wait: 0 },
			{ type: "move", x: 0, y: 0, wait: 50 },
		],
	};

	animation.manager.animations = { 0: [moveAnim] };

	const events = [];
	animation.scheduler.onFrameStep((e) => events.push(e));

	await animation.playAnimationPatterns(moveAnim, 0, 0);

	assert.equal(animation.getBaseMoveOffset(0).x, 0);
	assert.equal(animation.getBaseMoveOffset(0).y, 0);
	assert.ok(events.some((e) => e.pattern.type === "move" && e.offsetX === 25));
});

test("SurfaceAnimationManager active animation count, list, and dynamic collision integration", async () => {
	const { animation } = animationFixture();

	const animWithCollision = {
		id: 77,
		name: "shield_animation",
		interval: "runonce",
		collisions: [
			{
				id: 900,
				name: "ActiveShield",
				shape: "rect",
				x1: 10,
				y1: 10,
				x2: 100,
				y2: 100,
				minX: 10,
				minY: 10,
				maxX: 100,
				maxY: 100,
			},
		],
		patterns: [
			{ surface: 701, wait: 60 },
			{ surface: -1, wait: 0 },
		],
	};

	animation.manager.animations = { 0: [animWithCollision] };
	animation.manager.animationManager = animation;
	animation.manager.baseWidth = 200;
	animation.manager.baseHeight = 200;
	animation.manager.collisions = {
		0: [
			{
				id: 1,
				name: "BaseBody",
				shape: "rect",
				x1: 0,
				y1: 0,
				x2: 200,
				y2: 200,
				minX: 0,
				minY: 0,
				maxX: 200,
				maxY: 200,
			},
		],
	};

	assert.equal(animation.getActiveAnimationCount(0), 0);
	assert.equal(animation.getActiveAnimations(0).length, 0);
	assert.equal(animation.getActiveCollisions(0).length, 0);

	// アニメーション再生開始（非同期）
	const playPromise = animation.playAnimationPatterns(animWithCollision, 0, 0);
	await new Promise((r) => setTimeout(r, 15));

	// 再生中確認
	assert.equal(animation.getActiveAnimationCount(0), 1);
	assert.equal(animation.getActiveAnimations(0).length, 1);
	assert.equal(animation.getActiveAnimations(0)[0].id, 77);
	assert.equal(animation.getActiveCollisions(0).length, 1);
	assert.equal(animation.getActiveCollisions(0)[0].name, "ActiveShield");

	// 当たり判定テスト (SurfaceManager.detectCollision 連携)
	// targetRect: (0, 0, 200, 200) -> clickX=50, clickY=50 -> canvasX=50, canvasY=50
	const { surfaceCollisionMethods } = await import(
		"../../ui/js/surface/surface-collision.js"
	);
	const hitResult = surfaceCollisionMethods.detectCollision.call(
		animation.manager,
		50,
		50,
		{ left: 0, top: 0, width: 200, height: 200 },
		0,
		0,
	);
	assert.equal(hitResult.name, "ActiveShield");
	assert.equal(hitResult.id, 900);

	await playPromise;

	// 再生終了後はアクティブリストおよび動的当たり判定から解除
	assert.equal(animation.getActiveAnimationCount(0), 0);
	assert.equal(animation.getActiveAnimations(0).length, 0);
	assert.equal(animation.getActiveCollisions(0).length, 0);

	const hitAfter = surfaceCollisionMethods.detectCollision.call(
		animation.manager,
		50,
		50,
		{ left: 0, top: 0, width: 200, height: 200 },
		0,
		0,
	);
	assert.equal(hitAfter.name, "BaseBody");
});
