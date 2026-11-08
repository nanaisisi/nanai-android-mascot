/**
 * @file helpers.ts
 * @brief surface-compositor テスト用の共通 DOM/Canvas/Image モック環境設定
 */

export function setupSurfaceCompositorMockEnv() {
	globalThis.window = globalThis as unknown as Window & typeof globalThis;
	globalThis.Image = class {
		naturalWidth = 100;
		naturalHeight = 100;
		onload?: () => void;
		constructor() {
			setTimeout(() => {
				this.onload?.();
			}, 10);
		}
	} as unknown as typeof Image;

	globalThis.document = {
		createElement(tag: string) {
			if (tag === "canvas") {
				return {
					width: 0,
					height: 0,
					toDataURL: () => "data:image/png;base64,mock",
					getContext() {
						return {
							drawImage() {},
							clearRect() {},
							putImageData() {},
							getImageData: () => ({
								data: new Uint8Array([0, 255, 0, 255, 255, 255, 255, 255]),
							}),
						};
					},
				};
			}
			return {};
		},
	} as unknown as Document;
}
