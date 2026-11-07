import assert from "node:assert/strict";
import { test } from "vitest";

const {
	TouchGestureRecognizer,
	TouchGestureEvent,
	TOUCH_GESTURE_TYPES,
	getTouchDistance,
	getTouchAngle,
	getTouchCenter,
} = await import("../../ui/js/ui/touch/index.js");

test("TouchGestureRecognizer and mobile gesture event stream fuzzing", () => {
	// 1. Math helper fuzzing with NaN, null, and extreme boundaries
	assert.equal(getTouchDistance(null, null), 0);
	assert.equal(getTouchDistance({ clientX: 0, clientY: 0 }, null), 0);
	// When clientX is NaN, Number.isFinite falls back to 0 (hypot(0 - 10, 10 - 10) = 10)
	assert.equal(
		getTouchDistance(
			{ clientX: NaN, clientY: 10 },
			{ clientX: 10, clientY: 10 },
		),
		10,
	);
	assert.equal(
		getTouchDistance(
			{ clientX: 1e6, clientY: 1e6 },
			{ clientX: 1e6 + 3, clientY: 1e6 + 4 },
		),
		5,
	);

	assert.equal(getTouchAngle(null, null), 0);
	assert.equal(getTouchAngle({ clientX: 0, clientY: 0 }, null), 0);
	assert.equal(
		getTouchAngle({ clientX: 10, clientY: 10 }, { clientX: 10, clientY: 10 }),
		0,
	);

	assert.deepEqual(getTouchCenter(null, null), { x: 0, y: 0 });
	assert.deepEqual(
		getTouchCenter({ clientX: 10, clientY: 20 }, { clientX: 30, clientY: 40 }),
		{ x: 20, y: 30 },
	);

	// 2. TouchGestureEvent defensive properties with malformed details
	const malformedEvent = new TouchGestureEvent("nam:touch:fuzz", {
		scale: -5,
		deltaX: NaN,
		tapCount: -1,
	});
	assert.ok(malformedEvent);
	assert.equal(malformedEvent.scale, -5);
	assert.equal(malformedEvent.tapCount, -1);

	// 3. Fuzzing TouchGestureRecognizer event streams
	const listeners = {};
	const mockContainer = {
		addEventListener(type, fn) {
			if (!listeners[type]) listeners[type] = [];
			listeners[type].push(fn);
		},
		removeEventListener(type, fn) {
			if (!listeners[type]) return;
			listeners[type] = listeners[type].filter((f) => f !== fn);
		},
		dispatchEvent(event, type) {
			const fns = listeners[type || event.type] || [];
			for (const fn of fns) fn(event);
		},
	};

	const recognizer = new TouchGestureRecognizer(mockContainer, {
		minScale: 0.2,
		maxScale: 4.0,
	});

	const capturedEvents = [];
	for (const type of Object.values(TOUCH_GESTURE_TYPES)) {
		recognizer.on(type, (e) => capturedEvents.push(e));
	}

	// Pseudo-random event generator for stream fuzzing
	let pseudoRand = 987654321;
	const rng = () => {
		pseudoRand = (pseudoRand * 1103515245 + 12345) & 0x7fffffff;
		return pseudoRand / 0x7fffffff;
	};

	const touchTypes = ["touchstart", "touchmove", "touchend", "touchcancel"];
	for (let i = 0; i < 80; i++) {
		const type = touchTypes[Math.floor(rng() * touchTypes.length)];
		const touchCount = Math.floor(rng() * 4); // 0 to 3 touches
		const touches = [];
		for (let t = 0; t < touchCount; t++) {
			touches.push({
				clientX: (rng() - 0.5) * 1000,
				clientY: (rng() - 0.5) * 1000,
			});
		}

		// Dispatch without throwing
		assert.doesNotThrow(() => {
			mockContainer.dispatchEvent(
				{
					type,
					touches,
					changedTouches: touches,
					preventDefault() {},
				},
				type,
			);
		});
	}

	// Recognizer clean reset
	recognizer.reset();
	assert.equal(recognizer._isPinching, false);
	assert.equal(recognizer._isDragging, false);
});
