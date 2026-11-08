import assert from "node:assert/strict";

export function testApplyBalloonDescript(
	balloonDescriptActions: any,
	mockProps: any,
	cssVars: any,
) {
	const mockInstance = {
		currentBalloonTheme: "ivory",
		balloonUserScale: 1.2,
		elements: { balloonDisplay: { style: {} } },
	};

	(globalThis as unknown as { __TAURI__: unknown }).__TAURI__ = {
		core: {
			convertFileSrc: (p: string) => `tauri://${p}`,
		},
	};

	balloonDescriptActions.applyBalloonDescript.call(mockInstance, mockProps);

	assert.equal(cssVars["--balloon-dpi"], "120");
	assert.equal(
		cssVars["--balloon-font-family"],
		'"Meiryo", Meiryo, sans-serif',
	);
	assert.equal(cssVars["--balloon-font-size"], "14px");
	assert.equal(cssVars["--balloon-font-outline"], "1");
	assert.equal(cssVars["--balloon-font-shadow-color"], "rgb(200, 200, 200)");
	assert.equal(cssVars["--balloon-font-shadowstyle"], "outline");
	assert.equal(cssVars["--balloon-anchor-style"], "square+underline");
	assert.equal(cssVars["--balloon-anchor-visited-style"], "underline");
	assert.equal(cssVars["--balloon-anchor-notselect-style"], "none");
	assert.equal(cssVars["--balloon-cursor-style"], "square");
	assert.equal(cssVars["--balloon-anchor-blendmethod"], "overlay");
	assert.equal(cssVars["--balloon-anchor-pen-color"], "rgb(10, 20, 30)");
	assert.equal(cssVars["--balloon-anchor-brush-color"], "rgb(40, 50, 60)");
	assert.equal(cssVars["--balloon-anchor-shadow-color"], "rgb(11, 22, 33)");
	assert.equal(cssVars["--balloon-anchor-shadow-style"], "underline");
	assert.equal(
		cssVars["--balloon-anchor-visited-shadow-color"],
		"rgb(44, 55, 66)",
	);
	assert.equal(cssVars["--balloon-anchor-visited-shadow-style"], "outline");
	assert.equal(
		cssVars["--balloon-anchor-visited-pen-color"],
		"rgb(15, 25, 35)",
	);
	assert.equal(
		cssVars["--balloon-anchor-visited-brush-color"],
		"rgb(45, 55, 65)",
	);
	assert.equal(
		cssVars["--balloon-anchor-notselect-shadow-color"],
		"rgb(77, 88, 99)",
	);
	assert.equal(cssVars["--balloon-anchor-notselect-shadow-style"], "square");
	assert.equal(
		cssVars["--balloon-anchor-notselect-pen-color"],
		"rgb(12, 24, 36)",
	);
	assert.equal(
		cssVars["--balloon-anchor-notselect-brush-color"],
		"rgb(48, 60, 72)",
	);

	assert.equal(cssVars["--balloon-cursor-blendmethod"], "multiply");
	assert.equal(cssVars["--balloon-cursor-pen-color"], "rgb(70, 80, 90)");
	assert.equal(cssVars["--balloon-cursor-brush-color"], "rgb(100, 110, 120)");
	assert.equal(cssVars["--balloon-cursor-shadow-color"], "rgb(101, 102, 103)");
	assert.equal(cssVars["--balloon-cursor-shadow-style"], "outline");
	assert.equal(
		cssVars["--balloon-cursor-notselect-shadow-color"],
		"rgb(104, 105, 106)",
	);
	assert.equal(cssVars["--balloon-cursor-notselect-shadow-style"], "none");
	assert.equal(
		cssVars["--balloon-cursor-notselect-pen-color"],
		"rgb(17, 27, 37)",
	);
	assert.equal(
		cssVars["--balloon-cursor-notselect-brush-color"],
		"rgb(47, 57, 67)",
	);

	assert.equal(cssVars["--balloon-number-x"], "10px");
	assert.equal(cssVars["--balloon-sstpmarker-x"], "15px");
	assert.equal(cssVars["--balloon-sstpmessage-x"], "30px");
	assert.equal(cssVars["--balloon-writing-mode"], "vertical-rl");
	assert.equal(cssVars["--balloon-paint-black"], "1");
	assert.equal(cssVars["--balloon-dontmove"], "1");
	assert.equal(cssVars["--balloon-syncscale"], "1");
	assert.equal(cssVars["--balloon-alignment"], "left,bottom");
	assert.equal(cssVars["--balloon-offset-x"], "25px");
	assert.equal(cssVars["--balloon-offset-y"], "-15px");
	assert.equal(mockInstance.balloonDontMove, true);
	assert.equal(mockInstance.balloonSyncScale, true);
	assert.equal(mockInstance.balloonAlignment, "left,bottom");

	// 9-slice tokens validation
	assert.equal(cssVars["--balloon-border-image-slice"], "12 14 16 10 fill");
	assert.equal(cssVars["--balloon-border-image-width"], "12px 14px 16px 10px");
	assert.equal(cssVars["--balloon-border-image-repeat"], "repeat");

	delete (globalThis as unknown as { __TAURI__?: unknown }).__TAURI__;
}
