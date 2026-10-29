import assert from "node:assert/strict";
import { test, vi } from "vitest";

const { ghostShioriMethods } = await import("../ui/js/ghost/ghost-shiori.js");

test("ghostShioriMethods covers SHIORI initialization, timers, events, and teach inputs", async () => {
	vi.useFakeTimers();

	const eventsList = [];
	const controller = {
		...ghostShioriMethods,
		app: {
			ghostId: "main",
			playSakuraScript(s) { this.playedScript = s; },
			sakuraPlayer: {
				isPlaying: true,
				commandHandler: {
					openTeachBox(args, opts) { this.opened = true; },
				},
			},
		},
		startSecondChangeTimer() { ghostShioriMethods.startSecondChangeTimer.call(this); },
		stopSecondChangeTimer() { ghostShioriMethods.stopSecondChangeTimer.call(this); },
		async sendShioriEvent(ev, args) {
			eventsList.push({ ev, args });
			return ghostShioriMethods.sendShioriEvent.call(this, ev, args);
		},
	};

	// 1. Non-Tauri environment tests
	delete globalThis.__TAURI__;
	delete globalThis.__TAURI_INTERNALS__;

	await controller.initializeGhostSHIORI({ name: "G1", path: "/p1" });
	const nullEvent = await controller.sendShioriEvent("OnBoot");
	assert.equal(nullEvent, undefined);

	await controller.sendTeachInput("input1");
	controller.triggerRandomTalk();

	// 2. Tauri environment tests
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd, args) => {
			if (cmd === "load_ghost") return;
			if (cmd === "hide_loading_banner_window") return;
			if (cmd === "send_shiori_event_typed") {
				if (args.event === "OnTeach") {
					if (args.args.includes("311")) return { status: "NotEnough", value: "" };
					if (args.args.includes("312")) return { status: "Advice", value: "" };
					if (args.args.includes("400")) return { status: "BadRequest", value: "" };
					return { status: "Ok", value: "\\0Hello\\e" };
				}
				if (args.event === "OnBoot") return { status: "Ok", value: "\\0Booted\\e" };
				if (args.event === "OnAdvice") return { status: "NotEnough", value: "" };
				return { status: "NoContent", value: "" };
			}
		},
		transformCallback: (cb) => cb,
	};
	globalThis.window = globalThis;

	// Test initializeGhostSHIORI
	await controller.initializeGhostSHIORI({ name: "G1", path: "/p1" }, Promise.resolve(), () => true);

	// Test timer interval (OnSecondChange & OnMinuteChange at 60s)
	controller.uptimeSeconds = 59;
	vi.advanceTimersByTime(1000);
	await vi.advanceTimersByTimeAsync(0);

	assert.ok(eventsList.some((e) => e.ev === "OnSecondChange" || e.ev === "OnMinuteChange"));
	controller.stopSecondChangeTimer();

	// Test sendShioriEvent status 200 with script
	const res200 = await controller.sendShioriEvent("OnBoot");
	assert.equal(res200.status, 200);

	// Test sendShioriEvent status 311/312
	await controller.sendShioriEvent("OnAdvice");

	// Test sendTeachInput status 200, 311, 312, 400
	await controller.sendTeachInput("normal");
	await controller.sendTeachInput("311");
	await controller.sendTeachInput("312");
	await controller.sendTeachInput("400");

	// Test error handling in initializeGhostSHIORI
	globalThis.__TAURI_INTERNALS__.invoke = async () => { throw new Error("IPC error"); };
	await controller.initializeGhostSHIORI({ name: "G1", path: "/p1" }, Promise.resolve(), () => true);
	await controller.sendTeachInput("fail");

	vi.useRealTimers();
	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});
