export const elementMethods = {
	attachInternals: (): ElementInternals => {
		throw new Error("Function not implemented.");
	},
	click: (): void => {
		throw new Error("Function not implemented.");
	},
	hidePopover: (): void => {
		throw new Error("Function not implemented.");
	},
	showPopover: (): void => {
		throw new Error("Function not implemented.");
	},
	togglePopover: (_options?: boolean): boolean => {
		throw new Error("Function not implemented.");
	},
	addEventListener: <K extends keyof HTMLElementEventMap>(
		_type: K,
		_listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown,
		_options?: boolean | AddEventListenerOptions,
	): void => {
		throw new Error("Function not implemented.");
	},
	removeEventListener: <K extends keyof HTMLElementEventMap>(
		_type: K,
		_listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown,
		_options?: boolean | EventListenerOptions,
	): void => {
		throw new Error("Function not implemented.");
	},
	attachShadow: (_init: ShadowRootInit): ShadowRoot => {
		throw new Error("Function not implemented.");
	},
	checkVisibility: (_options?: CheckVisibilityOptions): boolean => {
		throw new Error("Function not implemented.");
	},
	closest: <K extends keyof HTMLElementTagNameMap>(
		_selector: K,
	): HTMLElementTagNameMap[K] | null => {
		throw new Error("Function not implemented.");
	},
	computedStyleMap: (): StylePropertyMapReadOnly => {
		throw new Error("Function not implemented.");
	},
	getAttribute: (_qualifiedName: string): string | null => {
		throw new Error("Function not implemented.");
	},
	getAttributeNS: (
		_namespace: string | null,
		_localName: string,
	): string | null => {
		throw new Error("Function not implemented.");
	},
	getAttributeNames: (): string[] => {
		throw new Error("Function not implemented.");
	},
	getAttributeNode: (_qualifiedName: string): Attr | null => {
		throw new Error("Function not implemented.");
	},
	getAttributeNodeNS: (
		_namespace: string | null,
		_localName: string,
	): Attr | null => {
		throw new Error("Function not implemented.");
	},
	getBoundingClientRect: (): DOMRect => {
		throw new Error("Function not implemented.");
	},
	getClientRects: (): DOMRectList => {
		throw new Error("Function not implemented.");
	},
	getElementsByClassName: (
		_classNames: string,
	): HTMLCollectionOf<Element> => {
		throw new Error("Function not implemented.");
	},
	getElementsByTagName: <K extends keyof HTMLElementTagNameMap>(
		_qualifiedName: K,
	): HTMLCollectionOf<HTMLElementTagNameMap[K]> => {
		throw new Error("Function not implemented.");
	},
	getElementsByTagNameNS: (
		_namespaceURI: "http://www.w3.org/1999/xhtml",
		_localName: string,
	): HTMLCollectionOf<HTMLElement> => {
		throw new Error("Function not implemented.");
	},
	getHTML: (_options?: GetHTMLOptions): string => {
		throw new Error("Function not implemented.");
	},
	hasAttribute: (_qualifiedName: string): boolean => {
		throw new Error("Function not implemented.");
	},
	hasAttributeNS: (
		_namespace: string | null,
		_localName: string,
	): boolean => {
		throw new Error("Function not implemented.");
	},
	hasAttributes: (): boolean => {
		throw new Error("Function not implemented.");
	},
	hasPointerCapture: (_pointerId: number): boolean => {
		throw new Error("Function not implemented.");
	},
	insertAdjacentElement: (
		_where: InsertPosition,
		_element: Element,
	): Element | null => {
		throw new Error("Function not implemented.");
	},
	insertAdjacentHTML: (_position: InsertPosition, _string: string): void => {
		throw new Error("Function not implemented.");
	},
	insertAdjacentText: (_where: InsertPosition, _data: string): void => {
		throw new Error("Function not implemented.");
	},
	matches: (_selectors: string): boolean => {
		throw new Error("Function not implemented.");
	},
	releasePointerCapture: (_pointerId: number): void => {
		throw new Error("Function not implemented.");
	},
	removeAttribute: (_qualifiedName: string): void => {
		throw new Error("Function not implemented.");
	},
	removeAttributeNS: (
		_namespace: string | null,
		_localName: string,
	): void => {
		throw new Error("Function not implemented.");
	},
	removeAttributeNode: (_attr: Attr): Attr => {
		throw new Error("Function not implemented.");
	},
	requestFullscreen: (_options?: FullscreenOptions): Promise<void> => {
		throw new Error("Function not implemented.");
	},
	requestPointerLock: (_options?: PointerLockOptions): Promise<void> => {
		throw new Error("Function not implemented.");
	},
	scroll: (_options?: ScrollToOptions): void => {
		throw new Error("Function not implemented.");
	},
	scrollBy: (_options?: ScrollToOptions): void => {
		throw new Error("Function not implemented.");
	},
	scrollIntoView: (_arg?: boolean | ScrollIntoViewOptions): void => {
		throw new Error("Function not implemented.");
	},
	scrollTo: (_options?: ScrollToOptions): void => {
		throw new Error("Function not implemented.");
	},
	setAttribute: (_qualifiedName: string, _value: string): void => {
		throw new Error("Function not implemented.");
	},
	setAttributeNS: (
		_namespace: string | null,
		_qualifiedName: string,
		_value: string,
	): void => {
		throw new Error("Function not implemented.");
	},
	setAttributeNode: (_attr: Attr): Attr | null => {
		throw new Error("Function not implemented.");
	},
	setAttributeNodeNS: (_attr: Attr): Attr | null => {
		throw new Error("Function not implemented.");
	},
	setHTMLUnsafe: (_html: string): void => {
		throw new Error("Function not implemented.");
	},
	setPointerCapture: (_pointerId: number): void => {
		throw new Error("Function not implemented.");
	},
	toggleAttribute: (_qualifiedName: string, _force?: boolean): boolean => {
		throw new Error("Function not implemented.");
	},
	webkitMatchesSelector: (_selectors: string): boolean => {
		throw new Error("Function not implemented.");
	},
	appendChild: <T extends Node>(_node: T): T => {
		throw new Error("Function not implemented.");
	},
	cloneNode: (_subtree?: boolean): Node => {
		throw new Error("Function not implemented.");
	},
	compareDocumentPosition: (_other: Node): number => {
		throw new Error("Function not implemented.");
	},
	contains: (_other: Node | null): boolean => {
		throw new Error("Function not implemented.");
	},
	getRootNode: (_options?: GetRootNodeOptions): Node => {
		throw new Error("Function not implemented.");
	},
	hasChildNodes: (): boolean => {
		throw new Error("Function not implemented.");
	},
	insertBefore: <T extends Node>(_node: T, _child: Node | null): T => {
		throw new Error("Function not implemented.");
	},
	isDefaultNamespace: (_namespace: string | null): boolean => {
		throw new Error("Function not implemented.");
	},
	isEqualNode: (_otherNode: Node | null): boolean => {
		throw new Error("Function not implemented.");
	},
	isSameNode: (_otherNode: Node | null): boolean => {
		throw new Error("Function not implemented.");
	},
	lookupNamespaceURI: (_prefix: string | null): string | null => {
		throw new Error("Function not implemented.");
	},
	lookupPrefix: (_namespace: string | null): string | null => {
		throw new Error("Function not implemented.");
	},
	normalize: (): void => {
		throw new Error("Function not implemented.");
	},
	removeChild: <T extends Node>(_child: T): T => {
		throw new Error("Function not implemented.");
	},
	replaceChild: <T extends Node>(_node: Node, _child: T): T => {
		throw new Error("Function not implemented.");
	},
	dispatchEvent: (_event: Event): boolean => {
		throw new Error("Function not implemented.");
	},
	animate: (
		_keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
		_options?: number | KeyframeAnimationOptions,
	): Animation => {
		throw new Error("Function not implemented.");
	},
	getAnimations: (_options?: GetAnimationsOptions): Animation[] => {
		throw new Error("Function not implemented.");
	},
	after: (..._nodes: (Node | string)[]): void => {
		throw new Error("Function not implemented.");
	},
	before: (..._nodes: (Node | string)[]): void => {
		throw new Error("Function not implemented.");
	},
	remove: (): void => {
		throw new Error("Function not implemented.");
	},
	replaceWith: (..._nodes: (Node | string)[]): void => {
		throw new Error("Function not implemented.");
	},
	append: (..._nodes: (Node | string)[]): void => {
		throw new Error("Function not implemented.");
	},
	prepend: (..._nodes: (Node | string)[]): void => {
		throw new Error("Function not implemented.");
	},
	querySelector: <K extends keyof HTMLElementTagNameMap>(
		_selectors: K,
	): HTMLElementTagNameMap[K] | null => {
		throw new Error("Function not implemented.");
	},
	querySelectorAll: <K extends keyof HTMLElementTagNameMap>(
		_selectors: K,
	): NodeListOf<HTMLElementTagNameMap[K]> => {
		throw new Error("Function not implemented.");
	},
	replaceChildren: (..._nodes: (Node | string)[]): void => {
		throw new Error("Function not implemented.");
	},
	blur: (): void => {
		throw new Error("Function not implemented.");
	},
	focus: (_options?: FocusOptions): void => {
		throw new Error("Function not implemented.");
	},
};
