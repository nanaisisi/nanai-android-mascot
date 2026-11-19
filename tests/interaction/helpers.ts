/**
 * Interaction test helpers and global DOM environment setup
 */

export function setupInteractionDomGlobals() {
	globalThis.window = globalThis as unknown as Window & typeof globalThis;
	globalThis.innerWidth = 800;
	globalThis.innerHeight = 600;
	if (!globalThis.document) {
		globalThis.document = {
			createElement(tag: string) {
				if (tag === "canvas") {
					return {
						width: 0,
						height: 0,
						getContext() {
							return {
								drawImage() {},
								getImageData: () => ({
									data: [255, 255, 255, 255],
								}),
							};
						},
					};
				}
				return {};
			},
		} as unknown as Document;
	}
	if (!globalThis.addEventListener) {
		globalThis.addEventListener = () => {};
		globalThis.removeEventListener = () => {};
	}
}
