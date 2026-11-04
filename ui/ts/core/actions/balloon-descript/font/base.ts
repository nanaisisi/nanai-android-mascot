// @ts-nocheck
import { rgbFromComponents } from "../utils.js";

export function applyBaseFontProperties(root, props) {
	if (props.id) root.style.setProperty("--balloon-id", props.id);
}
