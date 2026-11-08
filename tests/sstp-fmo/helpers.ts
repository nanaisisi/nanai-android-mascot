/**
 * @file tests/sstp-fmo/helpers.ts
 * @description Helper utilities and Tauri mock setup for SSTP/FMO tests
 */

import { vi } from "vitest";

export const mockInvoke = vi.fn();

export function setupTauriMock() {
	globalThis.window = globalThis as unknown as Window & typeof globalThis;
	(globalThis as unknown as Record<string, unknown>).__TAURI_INTERNALS__ = {
		transformCallback: (cb: unknown) => cb,
		invoke: (cmd: string, args: Record<string, unknown>) =>
			mockInvoke(cmd, args),
	};
}

export function teardownTauriMock() {
	delete (globalThis as unknown as Record<string, unknown>).__TAURI_INTERNALS__;
}

export function createMockRoot() {
	const vars: Record<string, string> = {};
	return {
		style: {
			setProperty(k: string, v: string) {
				vars[k] = v;
			},
			removeProperty(k: string) {
				delete vars[k];
			},
			getPropertyValue(k: string) {
				return vars[k] || "";
			},
		},
		vars,
	};
}
