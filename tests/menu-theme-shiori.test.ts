import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	extractEdgeColorFromImage,
	menuThemeRenderer,
	mergeShioriMenuTheme,
} from "../ui/ts/ui/renderers/menu-theme-renderer.js";

function createMockDocument() {
	const props = new Map<string, string>();
	const classes = new Set<string>();
	const style = {
		setProperty: (k: string, v: string) => props.set(k, v),
		getPropertyValue: (k: string) => props.get(k) ?? "",
		removeProperty: (k: string) => props.delete(k),
	};
	return {
		documentElement: {
			style,
			setAttribute: vi.fn(),
		},
		body: {
			classList: {
				add: (c: string) => classes.add(c),
				remove: (c: string) => classes.delete(c),
				[Symbol.iterator]: () => classes.values(),
			},
		},
		createElement: vi.fn(),
	};
}

describe("menu-theme-renderer SHIORI Resource priority & edge-color fallback", () => {
	let mockDoc: ReturnType<typeof createMockDocument>;

	beforeEach(() => {
		mockDoc = createMockDocument();
		(globalThis as unknown as { document: unknown }).document = mockDoc;
	});

	it("mergeShioriMenuTheme overrides shell theme with SHIORI Resource values", () => {
		const merged = mergeShioriMenuTheme(
			{
				background_color: "#111111",
				background_bitmap: "shell_bg.png",
				font_name: "MS Gothic",
			},
			{
				"menu.background.color": "#222222",
				"menu.background.bitmap.filename": "master_bg.png",
				"menu.font.height": "14",
			},
		);

		expect(merged).toEqual({
			background_color: "#222222",
			background_bitmap: "master_bg.png",
			font_name: "MS Gothic",
			font_height: "14",
		});
	});

	it("applyShellTheme prioritizes SHIORI Resource and resolves bitmap relative to ghost/master", () => {
		menuThemeRenderer.applyShellTheme(
			{
				path: "C:/ghosts/test/shell/master",
				menu_theme: {
					background_color: "rgb(10, 20, 30)",
					background_bitmap: "shell_bg.png",
				},
			},
			{
				"menu.background.color": "rgb(40, 50, 60)",
				"menu.background.bitmap.filename": "override_bg.png",
			},
		);

		const style = mockDoc.documentElement.style;
		expect(style.getPropertyValue("--balloon-bg")).toBe("rgb(40, 50, 60)");
		expect(style.getPropertyValue("--menu-bg-image")).toContain(
			"ghost/master/override_bg.png",
		);
	});

	it("fetchShioriMenuTheme queries menu.* resources from ghostController", async () => {
		const requester = vi.fn(async (res: string) => {
			if (res === "menu.background.color") return "rgb(1, 2, 3)";
			if (res === "menu.font.name") return "Meiryo";
			return "";
		});
		const result = await menuThemeRenderer.fetchShioriMenuTheme({
			requestShioriResource: requester,
		});
		expect(result).toEqual({
			"menu.background.color": "rgb(1, 2, 3)",
			"menu.font.name": "Meiryo",
		});
	});

	it("extractEdgeColorFromImage samples edge pixel according to alignment", () => {
		const mockCtx = {
			drawImage: vi.fn(),
			getImageData: vi.fn((x: number, y: number) => ({
				data: x === 0 && y === 0 ? [12, 34, 56, 255] : [200, 150, 100, 255],
			})),
		};
		mockDoc.createElement.mockImplementation((tag: string) => {
			if (tag === "canvas") {
				return {
					width: 0,
					height: 0,
					getContext: () => mockCtx,
				};
			}
			return {};
		});

		const img = { naturalWidth: 10, naturalHeight: 10 } as HTMLImageElement;
		expect(extractEdgeColorFromImage(img, "left top")).toBe(
			"rgb(200, 150, 100)",
		);
		expect(extractEdgeColorFromImage(img, "right bottom")).toBe(
			"rgb(12, 34, 56)",
		);
	});

	it("applies custom menu.sidebar.* properties and falls back to NANAI baseware sidebar", () => {
		const labelEl = { textContent: "NANAI" };
		(
			mockDoc as unknown as {
				getElementById?: (id: string) => unknown;
			}
		).getElementById = (id: string) =>
			id === "menu-sidebar-label" ? labelEl : null;

		menuThemeRenderer.applyShellTheme({
			path: "C:/ghosts/test/shell/master",
			menu_theme: {
				sidebar_color: "rgb(30, 40, 50)",
				sidebar_font_color: "rgb(220, 230, 240)",
				sidebar_text: "TEST-GHOST",
				sidebar_width: "26",
			},
		});

		const style = mockDoc.documentElement.style;
		expect(style.getPropertyValue("--menu-sidebar-bg")).toBe("rgb(30, 40, 50)");
		expect(style.getPropertyValue("--menu-sidebar-color")).toBe(
			"rgb(220, 230, 240)",
		);
		expect(style.getPropertyValue("--menu-sidebar-width")).toBe("26px");
		expect(labelEl.textContent).toBe("TEST-GHOST");
		expect(Array.from(mockDoc.body.classList)).toContain("has-sidebar-custom");
		expect(Array.from(mockDoc.body.classList)).not.toContain("has-sidebar");

		// サイドバー設定のないテーマへ切り替えるとベースウェアデフォルト ("NANAI") に戻る
		menuThemeRenderer.applyShellTheme({
			path: "C:/ghosts/test/shell/plain",
			menu_theme: {},
		});
		expect(style.getPropertyValue("--menu-sidebar-bg")).toBe("");
		expect(style.getPropertyValue("--menu-sidebar-color")).toBe("");
		expect(style.getPropertyValue("--menu-sidebar-width")).toBe("");
		expect(labelEl.textContent).toBe("NANAI");
		expect(Array.from(mockDoc.body.classList)).not.toContain(
			"has-sidebar-custom",
		);
	});

	it("clears previous shell menu images when switching to a shell without menu_theme and marks menu-theme-ready", () => {
		menuThemeRenderer.applyShellTheme({
			path: "C:/ghosts/mock_nanai/shell/master",
			menu_theme: {
				background_bitmap: "menu_background.png",
				sidebar_bitmap: "menu_sidebar.png",
			},
		});

		const style = mockDoc.documentElement.style;
		expect(style.getPropertyValue("--menu-bg-image")).toContain(
			"menu_background.png",
		);
		expect(style.getPropertyValue("--menu-sidebar-image")).toContain(
			"menu_sidebar.png",
		);
		expect(Array.from(mockDoc.body.classList)).toContain("menu-theme-ready");

		// メニューテーマを持たない別ゴースト/シェルへ切り替えた場合、前の画像が引き継がれないこと
		menuThemeRenderer.applyShellTheme({
			path: "C:/ghosts/other_ghost/shell/master",
			menu_theme: null,
		});
		expect(style.getPropertyValue("--menu-bg-image")).toBe("");
		expect(style.getPropertyValue("--menu-sidebar-image")).toBe("");
		expect(Array.from(mockDoc.body.classList)).not.toContain("has-sidebar");
		expect(Array.from(mockDoc.body.classList)).toContain("menu-theme-ready");
	});
});
