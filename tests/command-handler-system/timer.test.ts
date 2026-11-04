import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

globalThis.window = globalThis;

import {
	clearAllScriptTimers,
	handleNotifyCommand,
	handleTimerRaiseCommand,
} from "../../ui/js/ghost/command-handler/system/timer.js";

describe("system/timer.js", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		clearAllScriptTimers();
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("handleNotifyCommand sends notify or event without throwing", async () => {
		const calls = [];
		const handlerWithNotify = {
			app: {
				ghostController: {
					sendShioriNotify: async (ev, refs) => {
						calls.push({ type: "notify", ev, refs });
					},
				},
			},
		};

		await handleNotifyCommand(handlerWithNotify, [
			"notify",
			"OnTest",
			"ref0",
			"ref1",
		]);
		expect(calls).toEqual([
			{ type: "notify", ev: "OnTest", refs: ["ref0", "ref1"] },
		]);

		// Fallback to sendShioriEvent if sendShioriNotify is missing
		calls.length = 0;
		const handlerWithEvent = {
			app: {
				ghostController: {
					sendShioriEvent: async (ev, refs) => {
						calls.push({ type: "event", ev, refs });
					},
				},
			},
		};
		await handleNotifyCommand(handlerWithEvent, [
			"notify",
			"OnTestFallback",
			"a",
		]);
		expect(calls).toEqual([
			{ type: "event", ev: "OnTestFallback", refs: ["a"] },
		]);

		// Empty event does nothing
		await handleNotifyCommand(handlerWithEvent, ["notify"]);
		expect(calls.length).toBe(1);

		// Warning handled if controller rejects
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		const handlerFail = {
			app: {
				ghostController: {
					sendShioriNotify: async () => {
						throw new Error("fail");
					},
				},
			},
		};
		await handleNotifyCommand(handlerFail, ["notify", "OnFail"]);
		expect(warnSpy).toHaveBeenCalledWith(
			"Notify event failed (OnFail):",
			expect.any(Error),
		);
	});

	it("handleTimerRaiseCommand schedules timeout and interval correctly", async () => {
		const fired = [];
		const handler = {
			app: {
				ghostController: {
					sendShioriEvent: async (ev, refs) => {
						fired.push({ ev, refs });
					},
				},
			},
		};

		// 1. One-shot timeout (repeatFlag = 1)
		await handleTimerRaiseCommand(handler, [
			"timerraise",
			"500",
			"1",
			"OnTimerOneShot",
			"arg1",
		]);
		expect(fired.length).toBe(0);

		vi.advanceTimersByTime(499);
		expect(fired.length).toBe(0);

		vi.advanceTimersByTime(2);
		expect(fired.length).toBe(1);
		expect(fired[0]).toEqual({ ev: "OnTimerOneShot", refs: ["arg1"] });

		// 2. Interval repeat (repeatFlag = 0)
		fired.length = 0;
		await handleTimerRaiseCommand(handler, [
			"timerraise",
			"200",
			"0",
			"OnTimerInterval",
			"intervalArg",
		]);
		vi.advanceTimersByTime(200);
		expect(fired.length).toBe(1);
		vi.advanceTimersByTime(200);
		expect(fired.length).toBe(2);

		// Cancelling with delay <= 0
		await handleTimerRaiseCommand(handler, [
			"timerraise",
			"0",
			"0",
			"OnTimerInterval",
		]);
		vi.advanceTimersByTime(400);
		expect(fired.length).toBe(2);

		// Empty eventName does nothing
		await handleTimerRaiseCommand(handler, ["timerraise", "200", "1", ""]);
	});
});
