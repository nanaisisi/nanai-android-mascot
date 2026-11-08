import { cssStyleStub } from "./css-style.js";

export const documentElementStub = {
	style: cssStyleStub,
	accessKey: "",
	accessKeyLabel: "",
	autocapitalize: "",
	autocorrect: false,
	dir: "",
	draggable: false,
	hidden: false,
	inert: false,
	innerText: "",
	lang: "",
	offsetHeight: 0,
	offsetLeft: 0,
	offsetParent: null,
	offsetTop: 0,
	offsetWidth: 0,
	outerText: "",
	popover: null,
	spellcheck: false,
	title: "",
	translate: false,
	writingSuggestions: "",
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
	attributes: undefined,
	classList: undefined,
	className: "",
	clientHeight: 0,
	clientLeft: 0,
	clientTop: 0,
	clientWidth: 0,
	currentCSSZoom: 0,
	id: "",
	innerHTML: "",
	localName: "",
	namespaceURI: null,
	onfullscreenchange: null,
	onfullscreenerror: null,
	outerHTML: "",
	ownerDocument: undefined,
	part: undefined,
	prefix: null,
	scrollHeight: 0,
	scrollLeft: 0,
	scrollTop: 0,
	scrollWidth: 0,
	shadowRoot: null,
	slot: "",
	tagName: "",
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
	textContent: "",
	baseURI: "",
	childNodes: undefined,
	firstChild: null,
	isConnected: false,
	lastChild: null,
	nextSibling: null,
	nodeName: "",
	nodeType: 0,
	nodeValue: null,
	parentElement: null,
	parentNode: null,
	previousSibling: null,
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
	ELEMENT_NODE: 1,
	ATTRIBUTE_NODE: 2,
	TEXT_NODE: 3,
	CDATA_SECTION_NODE: 4,
	ENTITY_REFERENCE_NODE: 5,
	ENTITY_NODE: 6,
	PROCESSING_INSTRUCTION_NODE: 7,
	COMMENT_NODE: 8,
	DOCUMENT_NODE: 9,
	DOCUMENT_TYPE_NODE: 10,
	DOCUMENT_FRAGMENT_NODE: 11,
	NOTATION_NODE: 12,
	DOCUMENT_POSITION_DISCONNECTED: 1,
	DOCUMENT_POSITION_PRECEDING: 2,
	DOCUMENT_POSITION_FOLLOWING: 4,
	DOCUMENT_POSITION_CONTAINS: 8,
	DOCUMENT_POSITION_CONTAINED_BY: 16,
	DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 32,
	dispatchEvent: (_event: Event): boolean => {
		throw new Error("Function not implemented.");
	},
	ariaActiveDescendantElement: null,
	ariaAtomic: null,
	ariaAutoComplete: null,
	ariaBrailleLabel: null,
	ariaBrailleRoleDescription: null,
	ariaBusy: null,
	ariaChecked: null,
	ariaColCount: null,
	ariaColIndex: null,
	ariaColIndexText: null,
	ariaColSpan: null,
	ariaControlsElements: null,
	ariaCurrent: null,
	ariaDescribedByElements: null,
	ariaDescription: null,
	ariaDetailsElements: null,
	ariaDisabled: null,
	ariaErrorMessageElements: null,
	ariaExpanded: null,
	ariaFlowToElements: null,
	ariaHasPopup: null,
	ariaHidden: null,
	ariaInvalid: null,
	ariaKeyShortcuts: null,
	ariaLabel: null,
	ariaLabelledByElements: null,
	ariaLevel: null,
	ariaLive: null,
	ariaModal: null,
	ariaMultiLine: null,
	ariaMultiSelectable: null,
	ariaOrientation: null,
	ariaOwnsElements: null,
	ariaPlaceholder: null,
	ariaPosInSet: null,
	ariaPressed: null,
	ariaReadOnly: null,
	ariaRelevant: null,
	ariaRequired: null,
	ariaRoleDescription: null,
	ariaRowCount: null,
	ariaRowIndex: null,
	ariaRowIndexText: null,
	ariaRowSpan: null,
	ariaSelected: null,
	ariaSetSize: null,
	ariaSort: null,
	ariaValueMax: null,
	ariaValueMin: null,
	ariaValueNow: null,
	ariaValueText: null,
	role: null,
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
	nextElementSibling: null,
	previousElementSibling: null,
	childElementCount: 0,
	children: undefined,
	firstElementChild: null,
	lastElementChild: null,
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
	assignedSlot: null,
	attributeStyleMap: undefined,
	contentEditable: "",
	enterKeyHint: "",
	inputMode: "",
	isContentEditable: false,
	onabort: null,
	onanimationcancel: null,
	onanimationend: null,
	onanimationiteration: null,
	onanimationstart: null,
	onauxclick: null,
	onbeforeinput: null,
	onbeforematch: null,
	onbeforetoggle: null,
	onblur: null,
	oncancel: null,
	oncanplay: null,
	oncanplaythrough: null,
	onchange: null,
	onclick: null,
	onclose: null,
	oncontextlost: null,
	oncontextmenu: null,
	oncontextrestored: null,
	oncopy: null,
	oncuechange: null,
	oncut: null,
	ondblclick: null,
	ondrag: null,
	ondragend: null,
	ondragenter: null,
	ondragleave: null,
	ondragover: null,
	ondragstart: null,
	ondrop: null,
	ondurationchange: null,
	onemptied: null,
	onended: null,
	onerror: null,
	onfocus: null,
	onformdata: null,
	ongotpointercapture: null,
	oninput: null,
	oninvalid: null,
	onkeydown: null,
	onkeypress: null,
	onkeyup: null,
	onload: null,
	onloadeddata: null,
	onloadedmetadata: null,
	onloadstart: null,
	onlostpointercapture: null,
	onmousedown: null,
	onmouseenter: null,
	onmouseleave: null,
	onmousemove: null,
	onmouseout: null,
	onmouseover: null,
	onmouseup: null,
	onpaste: null,
	onpause: null,
	onplay: null,
	onplaying: null,
	onpointercancel: null,
	onpointerdown: null,
	onpointerenter: null,
	onpointerleave: null,
	onpointermove: null,
	onpointerout: null,
	onpointerover: null,
	onpointerrawupdate: null,
	onpointerup: null,
	onprogress: null,
	onratechange: null,
	onreset: null,
	onresize: null,
	onscroll: null,
	onscrollend: null,
	onsecuritypolicyviolation: null,
	onseeked: null,
	onseeking: null,
	onselect: null,
	onselectionchange: null,
	onselectstart: null,
	onslotchange: null,
	onstalled: null,
	onsubmit: null,
	onsuspend: null,
	ontimeupdate: null,
	ontoggle: null,
	ontransitioncancel: null,
	ontransitionend: null,
	ontransitionrun: null,
	ontransitionstart: null,
	onvolumechange: null,
	onwaiting: null,
	onwebkitanimationend: null,
	onwebkitanimationiteration: null,
	onwebkitanimationstart: null,
	onwebkittransitionend: null,
	onwheel: null,
	autofocus: false,
	dataset: undefined,
	tabIndex: 0,
	blur: (): void => {
		throw new Error("Function not implemented.");
	},
	focus: (_options?: FocusOptions): void => {
		throw new Error("Function not implemented.");
	},
};
