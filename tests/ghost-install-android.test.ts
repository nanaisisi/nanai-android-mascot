import assert from "node:assert/strict";
import { test } from "vitest";

const g = globalThis as unknown as Record<string, unknown>;
const origIsAndroid = g.__IS_ANDROID__;
const origIsWindows = g.__IS_WINDOWS__;
const origWindow = g.window;
const origDocument = g.document;
const origTauri = g.__TAURI_INTERNALS__;

type MockInput = {
	type: string;
	accept: string;
	style: { display: string };
	files?: File[];
	addEventListener: (ev: string, cb: () => void) => void;
	click: () => void;
	remove: () => void;
};

test("pickAndInstallGhostArchive uses accept=*/* and install_ghost_archive_bytes on Android", async () => {
	const invoked: Array<{ cmd: string; args: unknown }> = [];
	const listeners: Record<string, () => void> = {};
	let createdInput: MockInput | null = null;

	g.__IS_ANDROID__ = true;
	g.__IS_WINDOWS__ = false;
	g.window = globalThis;
	g.__TAURI_INTERNALS__ = {
		invoke: async (cmd: string, args: unknown) => {
			invoked.push({ cmd, args });
			return { name: "mock_nar_ghost" };
		},
		transformCallback: (cb: unknown) => cb,
	};
	g.document = {
		body: { appendChild() {} },
		createElement(tag: string) {
			if (tag !== "input") return {};
			createdInput = {
				type: "",
				accept: "",
				style: { display: "" },
				addEventListener(ev: string, cb: () => void) {
					listeners[ev] = cb;
				},
				click() {
					const bytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
					this.files = [
						{
							name: "sample.nar",
							arrayBuffer: async () => bytes.buffer,
						} as unknown as File,
					];
					listeners.change?.();
				},
				remove() {},
			};
			return createdInput;
		},
	};

	try {
		const { pickAndInstallGhostArchive } = await import(
			"../ui/ts/core/actions/ghost-install-action.js"
		);
		const result = await pickAndInstallGhostArchive();
		assert.equal(result?.name, "mock_nar_ghost");
		assert.equal((createdInput as MockInput | null)?.accept, "*/*");
		assert.equal(invoked.length, 1);
		assert.equal(invoked[0].cmd, "install_ghost_archive_bytes");
		assert.deepEqual(invoked[0].args, {
			fileName: "sample.nar",
			bytes: [0x50, 0x4b, 0x03, 0x04],
		});
	} finally {
		if (origIsAndroid === undefined) delete g.__IS_ANDROID__;
		else g.__IS_ANDROID__ = origIsAndroid;
		if (origIsWindows === undefined) delete g.__IS_WINDOWS__;
		else g.__IS_WINDOWS__ = origIsWindows;
		if (origWindow === undefined) delete g.window;
		else g.window = origWindow;
		if (origDocument === undefined) delete g.document;
		else g.document = origDocument;
		if (origTauri === undefined) delete g.__TAURI_INTERNALS__;
		else g.__TAURI_INTERNALS__ = origTauri;
	}
});
