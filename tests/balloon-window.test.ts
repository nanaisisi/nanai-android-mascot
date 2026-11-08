import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.location = { search: "?scope=0&theme=ivory" };
globalThis.localStorage = { getItem: () => "ivory", setItem: () => {} };
globalThis.Image = class {
	naturalWidth: number;
	naturalHeight: number;
	constructor() {
		this.naturalWidth = 100;
		this.naturalHeight = 100;
		setTimeout(() => {
			this.onload?.();
		}, 0);
	}
	onload() {
		throw new Error("Method not implemented.");
	}
};

const emittedEvents: { event: unknown; payload: unknown }[] = [];
const listenHandlers = {};
const elements = {};

const getEl = (id: string) => {
	if (!elements[id]) {
		elements[id] = {
			style: { setProperty() {} },
			innerHTML: "",
			textContent: "",
			querySelectorAll: (sel: string) => {
				if (sel === ".balloon-choice-btn") {
					return [
						{
							getAttribute: (a: string) =>
								a === "data-choice-id" ? "choice1" : null,
							textContent: "Choice1",
							addEventListener(_t: unknown, cb: unknown) {
								this._cb = cb;
							},
							click() {
								this._cb?.({ stopPropagation() {} });
							},
						},
					];
				}
				if (sel === ".balloon-anchor") {
					return [
						{
							getAttribute: (a: string) =>
								a === "data-anchor-id" ? "anchor1" : null,
							addEventListener(_t: unknown, cb: unknown) {
								this._cb = cb;
							},
							click() {
								this._cb?.({ stopPropagation() {} });
							},
						},
					];
				}
				return [];
			},
			addEventListener(t: string | number, cb: unknown) {
				this._listeners = this._listeners || {};
				this._listeners[t] = cb;
			},
			click() {
				this._listeners?.click?.({});
			},
			mousedown() {
				this._listeners?.mousedown?.({ button: 0 });
			},
			mouseup() {
				this._listeners?.mouseup?.();
			},
		};
	}
	return elements[id];
};

const docListeners = {};
globalThis.document = {
	documentElement: {
		style: {
			setProperty() {},
			accentColor: "",
			alignContent: "",
			alignItems: "",
			alignSelf: "",
			alignmentBaseline: "",
			all: "",
			animation: "",
			animationComposition: "",
			animationDelay: "",
			animationDirection: "",
			animationDuration: "",
			animationFillMode: "",
			animationIterationCount: "",
			animationName: "",
			animationPlayState: "",
			animationTimingFunction: "",
			appearance: "",
			aspectRatio: "",
			backdropFilter: "",
			backfaceVisibility: "",
			background: "",
			backgroundAttachment: "",
			backgroundBlendMode: "",
			backgroundClip: "",
			backgroundColor: "",
			backgroundImage: "",
			backgroundOrigin: "",
			backgroundPosition: "",
			backgroundPositionX: "",
			backgroundPositionY: "",
			backgroundRepeat: "",
			backgroundSize: "",
			baselineShift: "",
			baselineSource: "",
			blockSize: "",
			border: "",
			borderBlock: "",
			borderBlockColor: "",
			borderBlockEnd: "",
			borderBlockEndColor: "",
			borderBlockEndStyle: "",
			borderBlockEndWidth: "",
			borderBlockStart: "",
			borderBlockStartColor: "",
			borderBlockStartStyle: "",
			borderBlockStartWidth: "",
			borderBlockStyle: "",
			borderBlockWidth: "",
			borderBottom: "",
			borderBottomColor: "",
			borderBottomLeftRadius: "",
			borderBottomRightRadius: "",
			borderBottomStyle: "",
			borderBottomWidth: "",
			borderCollapse: "",
			borderColor: "",
			borderEndEndRadius: "",
			borderEndStartRadius: "",
			borderImage: "",
			borderImageOutset: "",
			borderImageRepeat: "",
			borderImageSlice: "",
			borderImageSource: "",
			borderImageWidth: "",
			borderInline: "",
			borderInlineColor: "",
			borderInlineEnd: "",
			borderInlineEndColor: "",
			borderInlineEndStyle: "",
			borderInlineEndWidth: "",
			borderInlineStart: "",
			borderInlineStartColor: "",
			borderInlineStartStyle: "",
			borderInlineStartWidth: "",
			borderInlineStyle: "",
			borderInlineWidth: "",
			borderLeft: "",
			borderLeftColor: "",
			borderLeftStyle: "",
			borderLeftWidth: "",
			borderRadius: "",
			borderRight: "",
			borderRightColor: "",
			borderRightStyle: "",
			borderRightWidth: "",
			borderSpacing: "",
			borderStartEndRadius: "",
			borderStartStartRadius: "",
			borderStyle: "",
			borderTop: "",
			borderTopColor: "",
			borderTopLeftRadius: "",
			borderTopRightRadius: "",
			borderTopStyle: "",
			borderTopWidth: "",
			borderWidth: "",
			bottom: "",
			boxDecorationBreak: "",
			boxShadow: "",
			boxSizing: "",
			breakAfter: "",
			breakBefore: "",
			breakInside: "",
			captionSide: "",
			caretColor: "",
			clear: "",
			clip: "",
			clipPath: "",
			clipRule: "",
			color: "",
			colorInterpolation: "",
			colorInterpolationFilters: "",
			colorScheme: "",
			columnCount: "",
			columnFill: "",
			columnGap: "",
			columnRule: "",
			columnRuleColor: "",
			columnRuleStyle: "",
			columnRuleWidth: "",
			columnSpan: "",
			columnWidth: "",
			columns: "",
			contain: "",
			containIntrinsicBlockSize: "",
			containIntrinsicHeight: "",
			containIntrinsicInlineSize: "",
			containIntrinsicSize: "",
			containIntrinsicWidth: "",
			container: "",
			containerName: "",
			containerType: "",
			content: "",
			contentVisibility: "",
			counterIncrement: "",
			counterReset: "",
			counterSet: "",
			cssFloat: "",
			cssText: "",
			cursor: "",
			cx: "",
			cy: "",
			d: "",
			direction: "",
			display: "",
			dominantBaseline: "",
			emptyCells: "",
			fill: "",
			fillOpacity: "",
			fillRule: "",
			filter: "",
			flex: "",
			flexBasis: "",
			flexDirection: "",
			flexFlow: "",
			flexGrow: "",
			flexShrink: "",
			flexWrap: "",
			float: "",
			floodColor: "",
			floodOpacity: "",
			font: "",
			fontFamily: "",
			fontFeatureSettings: "",
			fontKerning: "",
			fontOpticalSizing: "",
			fontPalette: "",
			fontSize: "",
			fontSizeAdjust: "",
			fontStretch: "",
			fontStyle: "",
			fontSynthesis: "",
			fontSynthesisSmallCaps: "",
			fontSynthesisStyle: "",
			fontSynthesisWeight: "",
			fontVariant: "",
			fontVariantAlternates: "",
			fontVariantCaps: "",
			fontVariantEastAsian: "",
			fontVariantLigatures: "",
			fontVariantNumeric: "",
			fontVariantPosition: "",
			fontVariationSettings: "",
			fontWeight: "",
			forcedColorAdjust: "",
			gap: "",
			grid: "",
			gridArea: "",
			gridAutoColumns: "",
			gridAutoFlow: "",
			gridAutoRows: "",
			gridColumn: "",
			gridColumnEnd: "",
			gridColumnGap: "",
			gridColumnStart: "",
			gridGap: "",
			gridRow: "",
			gridRowEnd: "",
			gridRowGap: "",
			gridRowStart: "",
			gridTemplate: "",
			gridTemplateAreas: "",
			gridTemplateColumns: "",
			gridTemplateRows: "",
			height: "",
			hyphenateCharacter: "",
			hyphenateLimitChars: "",
			hyphens: "",
			imageOrientation: "",
			imageRendering: "",
			inlineSize: "",
			inset: "",
			insetBlock: "",
			insetBlockEnd: "",
			insetBlockStart: "",
			insetInline: "",
			insetInlineEnd: "",
			insetInlineStart: "",
			isolation: "",
			justifyContent: "",
			justifyItems: "",
			justifySelf: "",
			left: "",
			length: 0,
			letterSpacing: "",
			lightingColor: "",
			lineBreak: "",
			lineHeight: "",
			listStyle: "",
			listStyleImage: "",
			listStylePosition: "",
			listStyleType: "",
			margin: "",
			marginBlock: "",
			marginBlockEnd: "",
			marginBlockStart: "",
			marginBottom: "",
			marginInline: "",
			marginInlineEnd: "",
			marginInlineStart: "",
			marginLeft: "",
			marginRight: "",
			marginTop: "",
			marker: "",
			markerEnd: "",
			markerMid: "",
			markerStart: "",
			mask: "",
			maskClip: "",
			maskComposite: "",
			maskImage: "",
			maskMode: "",
			maskOrigin: "",
			maskPosition: "",
			maskRepeat: "",
			maskSize: "",
			maskType: "",
			mathDepth: "",
			mathStyle: "",
			maxBlockSize: "",
			maxHeight: "",
			maxInlineSize: "",
			maxWidth: "",
			minBlockSize: "",
			minHeight: "",
			minInlineSize: "",
			minWidth: "",
			mixBlendMode: "",
			objectFit: "",
			objectPosition: "",
			offset: "",
			offsetAnchor: "",
			offsetDistance: "",
			offsetPath: "",
			offsetPosition: "",
			offsetRotate: "",
			opacity: "",
			order: "",
			orphans: "",
			outline: "",
			outlineColor: "",
			outlineOffset: "",
			outlineStyle: "",
			outlineWidth: "",
			overflow: "",
			overflowAnchor: "",
			overflowBlock: "",
			overflowClipMargin: "",
			overflowInline: "",
			overflowWrap: "",
			overflowX: "",
			overflowY: "",
			overscrollBehavior: "",
			overscrollBehaviorBlock: "",
			overscrollBehaviorInline: "",
			overscrollBehaviorX: "",
			overscrollBehaviorY: "",
			padding: "",
			paddingBlock: "",
			paddingBlockEnd: "",
			paddingBlockStart: "",
			paddingBottom: "",
			paddingInline: "",
			paddingInlineEnd: "",
			paddingInlineStart: "",
			paddingLeft: "",
			paddingRight: "",
			paddingTop: "",
			page: "",
			pageBreakAfter: "",
			pageBreakBefore: "",
			pageBreakInside: "",
			paintOrder: "",
			parentRule: null,
			perspective: "",
			perspectiveOrigin: "",
			placeContent: "",
			placeItems: "",
			placeSelf: "",
			pointerEvents: "",
			position: "",
			printColorAdjust: "",
			quotes: "",
			r: "",
			resize: "",
			right: "",
			rotate: "",
			rowGap: "",
			rubyAlign: "",
			rubyPosition: "",
			rx: "",
			ry: "",
			scale: "",
			scrollBehavior: "",
			scrollMargin: "",
			scrollMarginBlock: "",
			scrollMarginBlockEnd: "",
			scrollMarginBlockStart: "",
			scrollMarginBottom: "",
			scrollMarginInline: "",
			scrollMarginInlineEnd: "",
			scrollMarginInlineStart: "",
			scrollMarginLeft: "",
			scrollMarginRight: "",
			scrollMarginTop: "",
			scrollPadding: "",
			scrollPaddingBlock: "",
			scrollPaddingBlockEnd: "",
			scrollPaddingBlockStart: "",
			scrollPaddingBottom: "",
			scrollPaddingInline: "",
			scrollPaddingInlineEnd: "",
			scrollPaddingInlineStart: "",
			scrollPaddingLeft: "",
			scrollPaddingRight: "",
			scrollPaddingTop: "",
			scrollSnapAlign: "",
			scrollSnapStop: "",
			scrollSnapType: "",
			scrollbarColor: "",
			scrollbarGutter: "",
			scrollbarWidth: "",
			shapeImageThreshold: "",
			shapeMargin: "",
			shapeOutside: "",
			shapeRendering: "",
			stopColor: "",
			stopOpacity: "",
			stroke: "",
			strokeDasharray: "",
			strokeDashoffset: "",
			strokeLinecap: "",
			strokeLinejoin: "",
			strokeMiterlimit: "",
			strokeOpacity: "",
			strokeWidth: "",
			tabSize: "",
			tableLayout: "",
			textAlign: "",
			textAlignLast: "",
			textAnchor: "",
			textBox: "",
			textBoxEdge: "",
			textBoxTrim: "",
			textCombineUpright: "",
			textDecoration: "",
			textDecorationColor: "",
			textDecorationLine: "",
			textDecorationSkipInk: "",
			textDecorationStyle: "",
			textDecorationThickness: "",
			textEmphasis: "",
			textEmphasisColor: "",
			textEmphasisPosition: "",
			textEmphasisStyle: "",
			textIndent: "",
			textOrientation: "",
			textOverflow: "",
			textRendering: "",
			textShadow: "",
			textTransform: "",
			textUnderlineOffset: "",
			textUnderlinePosition: "",
			textWrap: "",
			textWrapMode: "",
			textWrapStyle: "",
			top: "",
			touchAction: "",
			transform: "",
			transformBox: "",
			transformOrigin: "",
			transformStyle: "",
			transition: "",
			transitionBehavior: "",
			transitionDelay: "",
			transitionDuration: "",
			transitionProperty: "",
			transitionTimingFunction: "",
			translate: "",
			unicodeBidi: "",
			userSelect: "",
			vectorEffect: "",
			verticalAlign: "",
			viewTransitionClass: "",
			viewTransitionName: "",
			visibility: "",
			webkitAlignContent: "",
			webkitAlignItems: "",
			webkitAlignSelf: "",
			webkitAnimation: "",
			webkitAnimationDelay: "",
			webkitAnimationDirection: "",
			webkitAnimationDuration: "",
			webkitAnimationFillMode: "",
			webkitAnimationIterationCount: "",
			webkitAnimationName: "",
			webkitAnimationPlayState: "",
			webkitAnimationTimingFunction: "",
			webkitAppearance: "",
			webkitBackfaceVisibility: "",
			webkitBackgroundClip: "",
			webkitBackgroundOrigin: "",
			webkitBackgroundSize: "",
			webkitBorderBottomLeftRadius: "",
			webkitBorderBottomRightRadius: "",
			webkitBorderRadius: "",
			webkitBorderTopLeftRadius: "",
			webkitBorderTopRightRadius: "",
			webkitBoxAlign: "",
			webkitBoxFlex: "",
			webkitBoxOrdinalGroup: "",
			webkitBoxOrient: "",
			webkitBoxPack: "",
			webkitBoxShadow: "",
			webkitBoxSizing: "",
			webkitFilter: "",
			webkitFlex: "",
			webkitFlexBasis: "",
			webkitFlexDirection: "",
			webkitFlexFlow: "",
			webkitFlexGrow: "",
			webkitFlexShrink: "",
			webkitFlexWrap: "",
			webkitJustifyContent: "",
			webkitLineClamp: "",
			webkitMask: "",
			webkitMaskBoxImage: "",
			webkitMaskBoxImageOutset: "",
			webkitMaskBoxImageRepeat: "",
			webkitMaskBoxImageSlice: "",
			webkitMaskBoxImageSource: "",
			webkitMaskBoxImageWidth: "",
			webkitMaskClip: "",
			webkitMaskComposite: "",
			webkitMaskImage: "",
			webkitMaskOrigin: "",
			webkitMaskPosition: "",
			webkitMaskRepeat: "",
			webkitMaskSize: "",
			webkitOrder: "",
			webkitPerspective: "",
			webkitPerspectiveOrigin: "",
			webkitTextFillColor: "",
			webkitTextSizeAdjust: "",
			webkitTextStroke: "",
			webkitTextStrokeColor: "",
			webkitTextStrokeWidth: "",
			webkitTransform: "",
			webkitTransformOrigin: "",
			webkitTransformStyle: "",
			webkitTransition: "",
			webkitTransitionDelay: "",
			webkitTransitionDuration: "",
			webkitTransitionProperty: "",
			webkitTransitionTimingFunction: "",
			webkitUserSelect: "",
			whiteSpace: "",
			whiteSpaceCollapse: "",
			widows: "",
			width: "",
			willChange: "",
			wordBreak: "",
			wordSpacing: "",
			wordWrap: "",
			writingMode: "",
			x: "",
			y: "",
			zIndex: "",
			zoom: "",
			getPropertyPriority: (_property: string): string => {
				throw new Error("Function not implemented.");
			},
			getPropertyValue: (_property: string): string => {
				throw new Error("Function not implemented.");
			},
			item: (_index: number): string => {
				throw new Error("Function not implemented.");
			},
			removeProperty: (_property: string): string => {
				throw new Error("Function not implemented.");
			},
			[Symbol.iterator]: (): ArrayIterator<string> => {
				throw new Error("Function not implemented.");
			},
		},
		setAttribute() {},
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
	},
	body: {
		style: {
			setProperty() {},
			accentColor: "",
			alignContent: "",
			alignItems: "",
			alignSelf: "",
			alignmentBaseline: "",
			all: "",
			animation: "",
			animationComposition: "",
			animationDelay: "",
			animationDirection: "",
			animationDuration: "",
			animationFillMode: "",
			animationIterationCount: "",
			animationName: "",
			animationPlayState: "",
			animationTimingFunction: "",
			appearance: "",
			aspectRatio: "",
			backdropFilter: "",
			backfaceVisibility: "",
			background: "",
			backgroundAttachment: "",
			backgroundBlendMode: "",
			backgroundClip: "",
			backgroundColor: "",
			backgroundImage: "",
			backgroundOrigin: "",
			backgroundPosition: "",
			backgroundPositionX: "",
			backgroundPositionY: "",
			backgroundRepeat: "",
			backgroundSize: "",
			baselineShift: "",
			baselineSource: "",
			blockSize: "",
			border: "",
			borderBlock: "",
			borderBlockColor: "",
			borderBlockEnd: "",
			borderBlockEndColor: "",
			borderBlockEndStyle: "",
			borderBlockEndWidth: "",
			borderBlockStart: "",
			borderBlockStartColor: "",
			borderBlockStartStyle: "",
			borderBlockStartWidth: "",
			borderBlockStyle: "",
			borderBlockWidth: "",
			borderBottom: "",
			borderBottomColor: "",
			borderBottomLeftRadius: "",
			borderBottomRightRadius: "",
			borderBottomStyle: "",
			borderBottomWidth: "",
			borderCollapse: "",
			borderColor: "",
			borderEndEndRadius: "",
			borderEndStartRadius: "",
			borderImage: "",
			borderImageOutset: "",
			borderImageRepeat: "",
			borderImageSlice: "",
			borderImageSource: "",
			borderImageWidth: "",
			borderInline: "",
			borderInlineColor: "",
			borderInlineEnd: "",
			borderInlineEndColor: "",
			borderInlineEndStyle: "",
			borderInlineEndWidth: "",
			borderInlineStart: "",
			borderInlineStartColor: "",
			borderInlineStartStyle: "",
			borderInlineStartWidth: "",
			borderInlineStyle: "",
			borderInlineWidth: "",
			borderLeft: "",
			borderLeftColor: "",
			borderLeftStyle: "",
			borderLeftWidth: "",
			borderRadius: "",
			borderRight: "",
			borderRightColor: "",
			borderRightStyle: "",
			borderRightWidth: "",
			borderSpacing: "",
			borderStartEndRadius: "",
			borderStartStartRadius: "",
			borderStyle: "",
			borderTop: "",
			borderTopColor: "",
			borderTopLeftRadius: "",
			borderTopRightRadius: "",
			borderTopStyle: "",
			borderTopWidth: "",
			borderWidth: "",
			bottom: "",
			boxDecorationBreak: "",
			boxShadow: "",
			boxSizing: "",
			breakAfter: "",
			breakBefore: "",
			breakInside: "",
			captionSide: "",
			caretColor: "",
			clear: "",
			clip: "",
			clipPath: "",
			clipRule: "",
			color: "",
			colorInterpolation: "",
			colorInterpolationFilters: "",
			colorScheme: "",
			columnCount: "",
			columnFill: "",
			columnGap: "",
			columnRule: "",
			columnRuleColor: "",
			columnRuleStyle: "",
			columnRuleWidth: "",
			columnSpan: "",
			columnWidth: "",
			columns: "",
			contain: "",
			containIntrinsicBlockSize: "",
			containIntrinsicHeight: "",
			containIntrinsicInlineSize: "",
			containIntrinsicSize: "",
			containIntrinsicWidth: "",
			container: "",
			containerName: "",
			containerType: "",
			content: "",
			contentVisibility: "",
			counterIncrement: "",
			counterReset: "",
			counterSet: "",
			cssFloat: "",
			cssText: "",
			cursor: "",
			cx: "",
			cy: "",
			d: "",
			direction: "",
			display: "",
			dominantBaseline: "",
			emptyCells: "",
			fill: "",
			fillOpacity: "",
			fillRule: "",
			filter: "",
			flex: "",
			flexBasis: "",
			flexDirection: "",
			flexFlow: "",
			flexGrow: "",
			flexShrink: "",
			flexWrap: "",
			float: "",
			floodColor: "",
			floodOpacity: "",
			font: "",
			fontFamily: "",
			fontFeatureSettings: "",
			fontKerning: "",
			fontOpticalSizing: "",
			fontPalette: "",
			fontSize: "",
			fontSizeAdjust: "",
			fontStretch: "",
			fontStyle: "",
			fontSynthesis: "",
			fontSynthesisSmallCaps: "",
			fontSynthesisStyle: "",
			fontSynthesisWeight: "",
			fontVariant: "",
			fontVariantAlternates: "",
			fontVariantCaps: "",
			fontVariantEastAsian: "",
			fontVariantLigatures: "",
			fontVariantNumeric: "",
			fontVariantPosition: "",
			fontVariationSettings: "",
			fontWeight: "",
			forcedColorAdjust: "",
			gap: "",
			grid: "",
			gridArea: "",
			gridAutoColumns: "",
			gridAutoFlow: "",
			gridAutoRows: "",
			gridColumn: "",
			gridColumnEnd: "",
			gridColumnGap: "",
			gridColumnStart: "",
			gridGap: "",
			gridRow: "",
			gridRowEnd: "",
			gridRowGap: "",
			gridRowStart: "",
			gridTemplate: "",
			gridTemplateAreas: "",
			gridTemplateColumns: "",
			gridTemplateRows: "",
			height: "",
			hyphenateCharacter: "",
			hyphenateLimitChars: "",
			hyphens: "",
			imageOrientation: "",
			imageRendering: "",
			inlineSize: "",
			inset: "",
			insetBlock: "",
			insetBlockEnd: "",
			insetBlockStart: "",
			insetInline: "",
			insetInlineEnd: "",
			insetInlineStart: "",
			isolation: "",
			justifyContent: "",
			justifyItems: "",
			justifySelf: "",
			left: "",
			length: 0,
			letterSpacing: "",
			lightingColor: "",
			lineBreak: "",
			lineHeight: "",
			listStyle: "",
			listStyleImage: "",
			listStylePosition: "",
			listStyleType: "",
			margin: "",
			marginBlock: "",
			marginBlockEnd: "",
			marginBlockStart: "",
			marginBottom: "",
			marginInline: "",
			marginInlineEnd: "",
			marginInlineStart: "",
			marginLeft: "",
			marginRight: "",
			marginTop: "",
			marker: "",
			markerEnd: "",
			markerMid: "",
			markerStart: "",
			mask: "",
			maskClip: "",
			maskComposite: "",
			maskImage: "",
			maskMode: "",
			maskOrigin: "",
			maskPosition: "",
			maskRepeat: "",
			maskSize: "",
			maskType: "",
			mathDepth: "",
			mathStyle: "",
			maxBlockSize: "",
			maxHeight: "",
			maxInlineSize: "",
			maxWidth: "",
			minBlockSize: "",
			minHeight: "",
			minInlineSize: "",
			minWidth: "",
			mixBlendMode: "",
			objectFit: "",
			objectPosition: "",
			offset: "",
			offsetAnchor: "",
			offsetDistance: "",
			offsetPath: "",
			offsetPosition: "",
			offsetRotate: "",
			opacity: "",
			order: "",
			orphans: "",
			outline: "",
			outlineColor: "",
			outlineOffset: "",
			outlineStyle: "",
			outlineWidth: "",
			overflow: "",
			overflowAnchor: "",
			overflowBlock: "",
			overflowClipMargin: "",
			overflowInline: "",
			overflowWrap: "",
			overflowX: "",
			overflowY: "",
			overscrollBehavior: "",
			overscrollBehaviorBlock: "",
			overscrollBehaviorInline: "",
			overscrollBehaviorX: "",
			overscrollBehaviorY: "",
			padding: "",
			paddingBlock: "",
			paddingBlockEnd: "",
			paddingBlockStart: "",
			paddingBottom: "",
			paddingInline: "",
			paddingInlineEnd: "",
			paddingInlineStart: "",
			paddingLeft: "",
			paddingRight: "",
			paddingTop: "",
			page: "",
			pageBreakAfter: "",
			pageBreakBefore: "",
			pageBreakInside: "",
			paintOrder: "",
			parentRule: null,
			perspective: "",
			perspectiveOrigin: "",
			placeContent: "",
			placeItems: "",
			placeSelf: "",
			pointerEvents: "",
			position: "",
			printColorAdjust: "",
			quotes: "",
			r: "",
			resize: "",
			right: "",
			rotate: "",
			rowGap: "",
			rubyAlign: "",
			rubyPosition: "",
			rx: "",
			ry: "",
			scale: "",
			scrollBehavior: "",
			scrollMargin: "",
			scrollMarginBlock: "",
			scrollMarginBlockEnd: "",
			scrollMarginBlockStart: "",
			scrollMarginBottom: "",
			scrollMarginInline: "",
			scrollMarginInlineEnd: "",
			scrollMarginInlineStart: "",
			scrollMarginLeft: "",
			scrollMarginRight: "",
			scrollMarginTop: "",
			scrollPadding: "",
			scrollPaddingBlock: "",
			scrollPaddingBlockEnd: "",
			scrollPaddingBlockStart: "",
			scrollPaddingBottom: "",
			scrollPaddingInline: "",
			scrollPaddingInlineEnd: "",
			scrollPaddingInlineStart: "",
			scrollPaddingLeft: "",
			scrollPaddingRight: "",
			scrollPaddingTop: "",
			scrollSnapAlign: "",
			scrollSnapStop: "",
			scrollSnapType: "",
			scrollbarColor: "",
			scrollbarGutter: "",
			scrollbarWidth: "",
			shapeImageThreshold: "",
			shapeMargin: "",
			shapeOutside: "",
			shapeRendering: "",
			stopColor: "",
			stopOpacity: "",
			stroke: "",
			strokeDasharray: "",
			strokeDashoffset: "",
			strokeLinecap: "",
			strokeLinejoin: "",
			strokeMiterlimit: "",
			strokeOpacity: "",
			strokeWidth: "",
			tabSize: "",
			tableLayout: "",
			textAlign: "",
			textAlignLast: "",
			textAnchor: "",
			textBox: "",
			textBoxEdge: "",
			textBoxTrim: "",
			textCombineUpright: "",
			textDecoration: "",
			textDecorationColor: "",
			textDecorationLine: "",
			textDecorationSkipInk: "",
			textDecorationStyle: "",
			textDecorationThickness: "",
			textEmphasis: "",
			textEmphasisColor: "",
			textEmphasisPosition: "",
			textEmphasisStyle: "",
			textIndent: "",
			textOrientation: "",
			textOverflow: "",
			textRendering: "",
			textShadow: "",
			textTransform: "",
			textUnderlineOffset: "",
			textUnderlinePosition: "",
			textWrap: "",
			textWrapMode: "",
			textWrapStyle: "",
			top: "",
			touchAction: "",
			transform: "",
			transformBox: "",
			transformOrigin: "",
			transformStyle: "",
			transition: "",
			transitionBehavior: "",
			transitionDelay: "",
			transitionDuration: "",
			transitionProperty: "",
			transitionTimingFunction: "",
			translate: "",
			unicodeBidi: "",
			userSelect: "",
			vectorEffect: "",
			verticalAlign: "",
			viewTransitionClass: "",
			viewTransitionName: "",
			visibility: "",
			webkitAlignContent: "",
			webkitAlignItems: "",
			webkitAlignSelf: "",
			webkitAnimation: "",
			webkitAnimationDelay: "",
			webkitAnimationDirection: "",
			webkitAnimationDuration: "",
			webkitAnimationFillMode: "",
			webkitAnimationIterationCount: "",
			webkitAnimationName: "",
			webkitAnimationPlayState: "",
			webkitAnimationTimingFunction: "",
			webkitAppearance: "",
			webkitBackfaceVisibility: "",
			webkitBackgroundClip: "",
			webkitBackgroundOrigin: "",
			webkitBackgroundSize: "",
			webkitBorderBottomLeftRadius: "",
			webkitBorderBottomRightRadius: "",
			webkitBorderRadius: "",
			webkitBorderTopLeftRadius: "",
			webkitBorderTopRightRadius: "",
			webkitBoxAlign: "",
			webkitBoxFlex: "",
			webkitBoxOrdinalGroup: "",
			webkitBoxOrient: "",
			webkitBoxPack: "",
			webkitBoxShadow: "",
			webkitBoxSizing: "",
			webkitFilter: "",
			webkitFlex: "",
			webkitFlexBasis: "",
			webkitFlexDirection: "",
			webkitFlexFlow: "",
			webkitFlexGrow: "",
			webkitFlexShrink: "",
			webkitFlexWrap: "",
			webkitJustifyContent: "",
			webkitLineClamp: "",
			webkitMask: "",
			webkitMaskBoxImage: "",
			webkitMaskBoxImageOutset: "",
			webkitMaskBoxImageRepeat: "",
			webkitMaskBoxImageSlice: "",
			webkitMaskBoxImageSource: "",
			webkitMaskBoxImageWidth: "",
			webkitMaskClip: "",
			webkitMaskComposite: "",
			webkitMaskImage: "",
			webkitMaskOrigin: "",
			webkitMaskPosition: "",
			webkitMaskRepeat: "",
			webkitMaskSize: "",
			webkitOrder: "",
			webkitPerspective: "",
			webkitPerspectiveOrigin: "",
			webkitTextFillColor: "",
			webkitTextSizeAdjust: "",
			webkitTextStroke: "",
			webkitTextStrokeColor: "",
			webkitTextStrokeWidth: "",
			webkitTransform: "",
			webkitTransformOrigin: "",
			webkitTransformStyle: "",
			webkitTransition: "",
			webkitTransitionDelay: "",
			webkitTransitionDuration: "",
			webkitTransitionProperty: "",
			webkitTransitionTimingFunction: "",
			webkitUserSelect: "",
			whiteSpace: "",
			whiteSpaceCollapse: "",
			widows: "",
			width: "",
			willChange: "",
			wordBreak: "",
			wordSpacing: "",
			wordWrap: "",
			writingMode: "",
			x: "",
			y: "",
			zIndex: "",
			zoom: "",
			getPropertyPriority: (_property: string): string => {
				throw new Error("Function not implemented.");
			},
			getPropertyValue: (_property: string): string => {
				throw new Error("Function not implemented.");
			},
			item: (_index: number): string => {
				throw new Error("Function not implemented.");
			},
			removeProperty: (_property: string): string => {
				throw new Error("Function not implemented.");
			},
			[Symbol.iterator]: (): ArrayIterator<string> => {
				throw new Error("Function not implemented.");
			},
		},
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
	},
	getElementById(id) {
		return getEl(id);
	},
	querySelector(_selector: string) {
		return null;
	},
	readyState: "loading",
	addEventListener(type: string, cb: EventListener) {
		docListeners[type] = cb;
	},
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
};

globalThis.__TAURI_INTERNALS__ = {
	metadata: {
		currentWindow: { label: "balloon_window_0", startDragging: async () => {} },
	},
	invoke: async (
		cmd: string | string[],
		_args: { event: unknown; payload: unknown },
	) => {
		if (cmd === "balloon_manifest") {
			return {
				dpi: "120",
				"font.name": "Meiryo",
				"font.height": "12",
				"font.color.r": "100",
				"font.color.g": "150",
				"font.color.b": "200",
				"cursor.font.color.r": "50",
				"cursor.font.color.g": "50",
				"cursor.font.color.b": "50",
				"validrect.left": "10",
				"validrect.top": "10",
				"validrect.right": "10",
				"validrect.bottom": "10",
				"wordwrappoint.x": "-50",
				"balloon.dontmove": "1",
				"arrow.filename": "arrow",
				mousecursor: "cursor.png",
			};
		}
		if (cmd === "load_balloon_image") return "data:image/png;base64,bg";
		if (cmd === "save_balloon_offset_from_position") return;
		if (cmd === "plugin:event|emit" || cmd.includes("emit")) {
			emittedEvents.push(_args);
			return;
		}
		return null;
	},
	transformCallback: (cb: unknown) => cb,
	plugins: {
		event: {
			listen: async (event: string | number, cb: unknown) => {
				listenHandlers[event] = cb;
				return () => {};
			},
			emit: async (event: unknown, payload: unknown) => {
				emittedEvents.push({ event, payload });
			},
		},
	},
};

const {
	updateBalloonWindowScale,
	setupInteractiveElements,
	setupWindowGestures,
} = await import("../ui/js/ghost/balloon-window.js");
const { updateBalloonWindowScale: updateScaleDirect } = await import(
	"../ui/js/ghost/balloon-window/scale.js"
);
const { setupInteractiveElements: setupInteractiveDirect } = await import(
	"../ui/js/ghost/balloon-window/interactive.js"
);
const { loadBalloonSkinImages, applyBalloonDescript } = await import(
	"../ui/js/ghost/balloon-window/theme.js"
);
const { setupWindowGestures: setupGesturesDirect } = await import(
	"../ui/js/ghost/balloon-window/gesture.js"
);

test("balloon-window covers interactive elements, theme/manifest loading, and Tauri scale/drag events", async () => {
	// Trigger DOMContentLoaded listener
	docListeners.DOMContentLoaded?.();

	const balloonBox = getEl("balloon-box");
	const balloonText = getEl("balloon-text");

	// 1. Test click & mousedown/mouseup on balloonBox
	balloonBox.click();
	balloonBox.mousedown();
	balloonBox.mouseup();

	// 2. Test update-balloon-content-0 listener
	if (listenHandlers["update-balloon-content-0"]) {
		await listenHandlers["update-balloon-content-0"]({
			payload: {
				html: '<button class="balloon-choice-btn" data-choice-id="choice1">Choice1</button><a class="balloon-anchor" data-anchor-id="anchor1">Anchor1</a>',
				theme: "ivory",
			},
		});
	}

	// Trigger choice and anchor clicks inside balloonText
	const choices = balloonText.querySelectorAll(".balloon-choice-btn");
	choices[0]?.click();

	const anchors = balloonText.querySelectorAll(".balloon-anchor");
	anchors[0]?.click();

	// 3. Test balloon-theme-changed listener
	if (listenHandlers["balloon-theme-changed"]) {
		await listenHandlers["balloon-theme-changed"]({
			payload: { theme: "dark" },
		});
	}

	// 4. Test balloon-scale-changed listener
	if (listenHandlers["balloon-scale-changed"]) {
		await listenHandlers["balloon-scale-changed"]({
			payload: { userScale: 1.5 },
		});
	}

	// 5. Test touch events (Slot-10 Cycle 3)
	// Single touch drag
	balloonBox._listeners?.touchstart?.({
		touches: [{ clientX: 50, clientY: 50 }],
	});
	// Double tap within 300ms
	balloonBox._listeners?.touchstart?.({
		touches: [{ clientX: 50, clientY: 50 }],
	});
	// Pinch touchmove
	balloonBox._listeners?.touchstart?.({
		touches: [
			{ clientX: 50, clientY: 50 },
			{ clientX: 150, clientY: 50 },
		],
	});
	balloonBox._listeners?.touchmove?.({
		touches: [
			{ clientX: 20, clientY: 50 },
			{ clientX: 180, clientY: 50 },
		],
	});
	// Touchend
	balloonBox._listeners?.touchend?.({
		touches: [],
	});

	// 6. Test submodules directly
	// scale.js
	const mockBox = { style: { transform: "", transformOrigin: "" } };
	const scaleResult = updateBalloonWindowScale(mockBox, 1.25, 0.8);
	assert.strictEqual(scaleResult, 1);
	const scaleResult2 = updateScaleDirect(mockBox, 1.5, 1.0);
	assert.strictEqual(scaleResult2, 1.5);
	assert.strictEqual(mockBox.style.transform, "scale(1.5)");
	updateScaleDirect(null, 1.0, 1.0);

	// interactive.js
	setupInteractiveElements(null, 0);
	const choiceBtn = {
		getAttribute: () => "choice_direct",
		textContent: "Direct Choice",
		addEventListener(_t: unknown, cb: unknown) {
			this._cb = cb;
		},
	};
	const anchorLink = {
		getAttribute: () => "anchor_direct",
		addEventListener(_t: unknown, cb: unknown) {
			this._cb = cb;
		},
	};
	const mockText = {
		querySelectorAll: (selector: string) => {
			if (selector === ".balloon-choice-btn") {
				return [choiceBtn];
			}
			if (selector === ".balloon-anchor") {
				return [anchorLink];
			}
			return [];
		},
	};
	setupInteractiveDirect(mockText, 1);
	choiceBtn._cb?.({ stopPropagation() {} });
	anchorLink._cb?.({ stopPropagation() {} });

	// theme.js
	const loadedBg = await loadBalloonSkinImages("ivory", 0);
	assert.ok(loadedBg);
	const loadedKero = await loadBalloonSkinImages("ivory", 1);
	assert.ok(loadedKero);
	const loadedChar = await loadBalloonSkinImages("ivory", 2);
	assert.ok(loadedChar);

	let callbackDpi = 0;
	let callbackDontMove = null;
	const themeRes = await applyBalloonDescript({
		theme: "ivory",
		scopeId: 0,
		currentUserScale: 1.0,
		onDpiScaleChange: (dpi: number) => {
			callbackDpi = dpi;
		},
		onDontMoveChange: (dontMove: unknown) => {
			callbackDontMove = dontMove;
		},
	});
	assert.ok(themeRes);
	assert.strictEqual(callbackDpi, 0.8);
	assert.strictEqual(callbackDontMove, true);

	// gesture.js
	let userScaleState = 1.0;
	const mockGestureBox = {
		style: { transform: "", transformOrigin: "" },
		listeners: {},
		addEventListener(ev: string | number, cb: unknown) {
			this.listeners[ev] = cb;
		},
	};
	setupGesturesDirect(mockGestureBox, {
		scopeId: 0,
		getIsBalloonDontMove: () => false,
		getUserScale: () => userScaleState,
		getDpiScale: () => 1.0,
		onUserScaleChange: (s: number) => {
			userScaleState = s;
		},
	});
	// Click & Mouse events
	mockGestureBox.listeners.click();
	mockGestureBox.listeners.mousedown({ button: 0 });
	mockGestureBox.listeners.mouseup();
	// Touch pinch & tap
	mockGestureBox.listeners.touchstart({
		touches: [{ clientX: 10, clientY: 10 }],
	});
	mockGestureBox.listeners.touchstart({
		touches: [{ clientX: 10, clientY: 10 }],
	}); // double tap triggers 1.25 scale
	assert.strictEqual(userScaleState, 1.25);
	const requestScaleEvent = emittedEvents.find(
		(e) =>
			e.event === "request-balloon-scale-change" &&
			e.payload?.userScale === 1.25,
	);
	assert.ok(requestScaleEvent);

	mockGestureBox.listeners.touchstart({
		touches: [
			{ clientX: 10, clientY: 10 },
			{ clientX: 110, clientY: 10 },
		],
	});
	mockGestureBox.listeners.touchmove({
		touches: [
			{ clientX: 10, clientY: 10 },
			{ clientX: 160, clientY: 10 },
		],
	});
	mockGestureBox.listeners.touchend({ touches: [] });
	const pinchRequestEvent = emittedEvents.find(
		(e) =>
			e.event === "request-balloon-scale-change" && e.payload?.userScale > 1.25,
	);
	assert.ok(pinchRequestEvent);
	setupWindowGestures(null, {});

	// 7. Test Non-Tauri environment early return
	delete globalThis.__TAURI__;
	delete globalThis.__TAURI_INTERNALS__;
	docListeners.DOMContentLoaded?.();
	const nonTauriThemeRes = await applyBalloonDescript({
		theme: "ivory",
		scopeId: 0,
		currentUserScale: 1.0,
	});
	assert.strictEqual(nonTauriThemeRes, null);

	assert.ok(true);
});
