let progressCb:
	| ((arg0: {
			payload:
				| { phase: string; path: string }
				| { phase: string; path: string }
				| { phase: string; path: string }
				| { phase: string; path: string };
	  }) => void)
	| null = null;

export const getProgressCb = () => progressCb;
export const setProgressCb = (cb: typeof progressCb) => {
	progressCb = cb;
};

export const createPersistentListenersProxy = () => {
	const map = {};
	return new Proxy(map, {
		get(target, prop) {
			if (!(prop in target)) {
				const eventMap = {};
				target[prop] = new Proxy(eventMap, {
					get(t, p) {
						if (!(p in t)) {
							t[p] = { unregisterListener: () => {} };
						}
						return t[p];
					},
				});
			}
			return target[prop];
		},
	});
};

globalThis.__TAURI_INTERNALS__ = {
	metadata: { currentWindow: { label: "main" } },
	invoke: async () => null,
	transformCallback: (cb: unknown) => cb,
	plugins: {
		event: {
			listeners: createPersistentListenersProxy(),
			listen: async (_eventName: unknown, handler: unknown) => {
				progressCb = handler as typeof progressCb;
				return () => {};
			},
			emit: async () => {},
			unregisterListener: () => {},
		},
	},
};
