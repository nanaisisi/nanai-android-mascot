import { describe, expect, it } from "vitest";
import { applyAssetProperties } from "../../ui/ts/core/actions/balloon-descript/assets.js";
import { applySpecialFontProperties } from "../../ui/ts/core/actions/balloon-descript/font/special.js";
import { applyPositionProperties } from "../../ui/ts/core/actions/balloon-descript/layout/position.js";
import { createMockRoot } from "./helpers.js";

describe("SSTP Balloon Descript Styling & Font bindings", () => {
	it("applies sstpmessage.font.* properties to CSS custom properties", () => {
		const el = createMockRoot();
		const props: Record<string, string> = {
			"sstpmessage.font.name": "MS Gothic",
			"sstpmessage.font.height": "14",
			"sstpmessage.font.color.r": "255",
			"sstpmessage.font.color.g": "100",
			"sstpmessage.font.color.b": "50",
		};

		applySpecialFontProperties(el, props);
		expect(el.style.getPropertyValue("--balloon-sstp-font-family")).toBe(
			'"MS Gothic", sans-serif',
		);
		expect(el.style.getPropertyValue("--balloon-sstp-font-size")).toBe("14px");
		expect(el.style.getPropertyValue("--balloon-sstp-font-color")).toBe(
			"rgb(255, 100, 50)",
		);
	});

	it("applies sstpmessage position and sstpmarker coordinates", () => {
		const el = createMockRoot();
		const instance: Record<string, unknown> = {};
		const props: Record<string, string> = {
			"sstpmessage.x": "12",
			"sstpmessage.y": "24",
			"sstpmessage.xr": "80",
			"sstpmessage.yb": "90",
			"sstpmarker.x": "5",
			"sstpmarker.y": "10",
		};

		applyPositionProperties(el, props, instance);
		expect(el.style.getPropertyValue("--balloon-sstpmessage-x")).toBe("12px");
		expect(el.style.getPropertyValue("--balloon-sstpmessage-y")).toBe("24px");
		expect(el.style.getPropertyValue("--balloon-sstpmessage-xr")).toBe("80px");
		expect(el.style.getPropertyValue("--balloon-sstpmessage-yb")).toBe("90px");

		applyAssetProperties(el, props, instance);
		expect(el.style.getPropertyValue("--balloon-sstpmarker-x")).toBe("5px");
		expect(el.style.getPropertyValue("--balloon-sstpmarker-y")).toBe("10px");
	});
});
