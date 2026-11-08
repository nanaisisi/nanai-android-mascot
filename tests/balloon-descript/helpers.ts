export const cssVars: Record<string, string> = {};

export function setupBalloonDescriptMockEnvironment() {
	globalThis.window = globalThis;
	globalThis.document = {
		documentElement: {
			style: {
				setProperty(k: string, v: string) {
					cssVars[k] = v;
				},
				removeProperty(k: string) {
					delete cssVars[k];
				},
			},
		},
		querySelector(_sel: string) {
			return {
				style: {} as Record<string, string>,
				setProperty(k: string, v: string) {
					this.style[k] = v;
				},
			};
		},
	} as unknown as Document;

	return {
		cssVars,
		clearVars() {
			for (const key of Object.keys(cssVars)) {
				delete cssVars[key];
			}
		},
	};
}
