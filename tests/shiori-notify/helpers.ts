/**
 * @file tests/shiori-notify/helpers.ts
 * @description Helper functions and mock environments for SHIORI notify tests.
 */

import { shioriNotifyMethods } from "../../ui/ts/ghost/shiori-notify.js";

export interface MockIpcCall {
	cmd: string;
	args: {
		event?: string;
		references?: string[];
		ghostId?: string;
		[key: string]: unknown;
	};
}

export interface MockControllerOptions {
	ghostId?: string;
	ghostName?: string;
	sakuraName?: string;
	keroName?: string;
	ghostPath?: string;
	ghosts?: Array<{
		name: string;
		sakura_name: string;
		kero_name: string;
		path: string;
	}>;
	shells?: string[];
	balloons?: string[];
	balloonPaths?: string[];
}

export function createMockController(options: MockControllerOptions = {}) {
	const ghostName = options.ghostName ?? "Ghost1";
	const sakuraName = options.sakuraName ?? "Sakura1";
	const keroName = options.keroName ?? "Kero1";
	const ghostPath = options.ghostPath ?? "/assets/ghost/ghost1";

	return {
		...shioriNotifyMethods,
		app: { ghostId: options.ghostId ?? "main" },
		currentGhost: {
			name: ghostName,
			sakura_name: sakuraName,
			kero_name: keroName,
			path: ghostPath,
		},
		ghosts: options.ghosts ?? [
			{
				name: ghostName,
				sakura_name: sakuraName,
				kero_name: keroName,
				path: ghostPath,
			},
			{
				name: "Ghost2",
				sakura_name: "Sakura2",
				kero_name: "",
				path: "/assets/ghost/ghost2",
			},
		],
		shells: options.shells ?? ["master", "alt"],
		balloons: options.balloons ?? ["default", "modern"],
		balloonPaths: options.balloonPaths ?? [
			"assets/balloon/default",
			"assets/balloon/modern",
		],
	};
}

export function setupMockTauriIpc(
	calls: MockIpcCall[],
	handler?: (cmd: string, args: unknown) => Promise<unknown> | unknown,
) {
	globalThis.window = globalThis;
	(globalThis as unknown as Record<string, unknown>).__TAURI_INTERNALS__ = {
		invoke: async (cmd: string, args: unknown) => {
			calls.push({ cmd, args: args as MockIpcCall["args"] });
			if (handler) {
				return await handler(cmd, args);
			}
			if (cmd === "send_shiori_notify") return "ok";
			return "ok";
		},
		transformCallback: (cb: unknown) => cb,
	};
}

export function teardownMockTauriIpc() {
	delete (globalThis as unknown as Record<string, unknown>).__TAURI__;
	delete (globalThis as unknown as Record<string, unknown>).__TAURI_INTERNALS__;
}
