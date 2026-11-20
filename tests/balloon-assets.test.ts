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
import { invoke } from "../ui/ts/core/tauri-helper.js";

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

	it("falls back markers.png -> marker.png -> sstp.png for scopeId 0", async () => {
		const mockedInvoke = vi.mocked(invoke);
		mockedInvoke.mockImplementation((_cmd: string, args: unknown) => {
			const file = (args as { file?: string })?.file;
			if (file === "marker.png") {
				return Promise.resolve(`data:image/png;base64,${file}`);
			}
			return Promise.resolve(null);
		});

		const root = makeFakeRoot();
		applyAssetProperties(root, {}, { currentBalloonTheme: "test-balloon" });
		await new Promise((r) => setTimeout(r, 20));
		expect(root.props.get("--balloon-marker-image")).toContain(
			"data:image/png;base64,marker.png",
		);

		mockedInvoke.mockImplementation((_cmd: string, args: unknown) => {
			const file = (args as { file?: string })?.file;
			if (file === "sstp.png") {
				return Promise.resolve(`data:image/png;base64,${file}`);
			}
			return Promise.resolve(null);
		});

		const root2 = makeFakeRoot();
		applyAssetProperties(root2, {}, { currentBalloonTheme: "test-balloon" });
		await new Promise((r) => setTimeout(r, 20));
		expect(root2.props.get("--balloon-marker-image")).toContain(
			"data:image/png;base64,sstp.png",
		);
	});

	it("resolves markerk.png / markerp*def.png and sstp_newk.png / sstp_newp*def.png with fallbacks", async () => {
		const mockedInvoke = vi.mocked(invoke);
		mockedInvoke.mockImplementation((_cmd: string, args: unknown) => {
			const file = (args as { file?: string })?.file;
			if (file === "sstp_new.png" || file === "markerp2def.png") {
				return Promise.resolve(`data:image/png;base64,${file}`);
			}
			return Promise.resolve(null);
		});

		const root1 = makeFakeRoot();
		applyAssetProperties(root1, {}, {
			currentBalloonTheme: "test-balloon",
			currentScopeId: 1,
		} as never);
		await new Promise((r) => setTimeout(r, 20));
		expect(root1.props.get("--balloon-sstpmarker-image")).toContain(
			"data:image/png;base64,sstp_new.png",
		);

		const root2 = makeFakeRoot();
		applyAssetProperties(root2, {}, {
			currentBalloonTheme: "test-balloon",
			currentScopeId: 2,
		} as never);
		await new Promise((r) => setTimeout(r, 20));
		expect(root2.props.get("--balloon-marker-image")).toContain(
			"data:image/png;base64,markerp2def.png",
		);
		expect(root2.props.get("--balloon-sstpmarker-image")).toContain(
			"data:image/png;base64,sstp_new.png",
		);
	});
});
