import fs from "node:fs";
import path from "node:path";

const handlersDir = path.resolve("ui/ts/ghost/sakura-play/handlers");
const files = fs.readdirSync(handlersDir).filter((f) => f.endsWith(".ts"));

for (const file of files) {
	const fullPath = path.join(handlersDir, file);
	let content = fs.readFileSync(fullPath, "utf8");

	// Replace the signature of handlers:
	// (player: unknown, app: unknown, token: unknown, context: unknown)
	content = content.replace(
		/player:\s*unknown,\s*_*app:\s*unknown,\s*token:\s*unknown,\s*_*context:\s*unknown,?/g,
		'player: import("../controller.js").SakuraPlayController, app: import("../../../main.js").NanaiAndroidMascotApp, token: import("../../parser/ast.js").ASTNode, context: import("../sync-object.js").SakuraPlayContext',
	);

	content = content.replace(
		/_*player:\s*unknown,\s*_*app:\s*unknown,\s*token:\s*unknown,\s*_*context:\s*unknown,?/g,
		'player: import("../controller.js").SakuraPlayController, app: import("../../../main.js").NanaiAndroidMascotApp, token: import("../../parser/ast.js").ASTNode, context: import("../sync-object.js").SakuraPlayContext',
	);

	// Some have `_app` or `_player`
	content = content.replace(
		/_?player:\s*unknown,\s*_?app:\s*unknown,\s*_?token:\s*unknown,\s*_?context:\s*unknown,?/g,
		'player: import("../controller.js").SakuraPlayController, app: import("../../../main.js").NanaiAndroidMascotApp, token: import("../../parser/ast.js").ASTNode, context: import("../sync-object.js").SakuraPlayContext',
	);

	fs.writeFileSync(fullPath, content, "utf8");
}
console.log("Fixed handlers");
