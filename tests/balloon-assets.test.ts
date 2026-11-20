import { describe, expect, it, vi } from "vitest";

vi.mock("../ui/ts/core/tauri-helper.js", () => ({
	invoke: vi.fn((_cmd: string, args: { file?: string }) => {
		if (args?.file === "arrows0.png" || args?.file === "arrows1.png") {
			return Promise.resolve(`data:image/png;base64,${args.file}`);
		}
		if (args?.file === "online0.png" || args?.file === "custom_online.png") {
			return Promise.resolve(`data:image/png;base64,${args.file}`);
		}
		return Promise.resolve(null);
	}),
}));

import { applyAssetProperties } from "../ui/ts/core/actions/balloon-descript/assets.js";

function makeFakeRoot() {
	const props = new Map<string, string>();
	return {
		props,
		style: {
			setProperty(k: string, v: string) {
				props.set(k, v);
			},
			getPropertyValue(k: string) {
				return props.get(k) ?? "";
			},
		},
	} as unknown as HTMLElement & { props: Map<string, string> };
}

describe("applyAssetProperties", () => {
	it("sets fallback arrow and online marker assets", async () => {
		const root = makeFakeRoot();
		applyAssetProperties(root, {}, { currentBalloonTheme: "test-balloon" });
		await new Promise((r) => setTimeout(r, 10));
		expect(root.props.get("--balloon-arrow0-image")).toContain(
			"data:image/png;base64,arrows0.png",
		);
		expect(root.props.get("--balloon-arrow1-image")).toContain(
			"data:image/png;base64,arrows1.png",
		);
		expect(root.props.get("--balloon-online-image")).toContain(
			"data:image/png;base64,online0.png",
		);
	});

	it("uses explicit onlinemarker.filename when provided", async () => {
		const root = makeFakeRoot();
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		applyAssetProperties(
			root,
			{ "onlinemarker.filename": "custom_online.png" },
			{ currentBalloonTheme: "test-balloon" },
		);
		await new Promise((r) => setTimeout(r, 10));
		expect(root.props.get("--balloon-online-image")).toContain(
			"data:image/png;base64,custom_online.png",
		);
		warnSpy.mockRestore();
	});
});
