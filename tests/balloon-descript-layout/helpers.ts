/**
 * @file helpers.ts
 * @brief Balloon descript layout tests mock root fixture
 */

export interface MockRoot {
	style: {
		setProperty: (k: string, v: string) => void;
		removeProperty: (k: string) => void;
		getPropertyValue: (k: string) => string | undefined;
	};
	vars: Record<string, string>;
}

export function createMockRoot(): HTMLElement & MockRoot {
	const vars: Record<string, string> = {};
	return {
		style: {
			setProperty(k: string, v: string) {
				vars[k] = v;
			},
			removeProperty(k: string) {
				delete vars[k];
			},
			getPropertyValue(k: string) {
				return vars[k];
			},
		},
		vars,
	} as unknown as HTMLElement & MockRoot;
}
