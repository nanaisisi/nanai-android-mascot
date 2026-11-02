/**
 * Interaction test helpers and global DOM environment setup
 */

export function setupInteractionDomGlobals() {
	globalThis.window = globalThis;
	globalThis.innerWidth = 800;
	globalThis.innerHeight = 600;
	if (!globalThis.document) {
		globalThis.document = /** @type {any} */ ({
			createElement(tag) {
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
		});
	}
	if (!globalThis.addEventListener) {
		globalThis.addEventListener = () => {};
		globalThis.removeEventListener = () => {};
	}
}
