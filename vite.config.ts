import { resolve } from "node:path";
import { defineConfig } from "vite";

const host = process.env.TAURI_DEV_HOST;

// https://v2.tauri.app/start/frontend/vite/
export default defineConfig({
	root: "ui",
	base: "./",
	// TauriのRustエラー表示を妨げないようにする
	// prevent vite from obscuring rust errors
	clearScreen: false,
	server: {
		// TauriのdevUrlとポートを合わせる (Windowsの除外ポート帯域を避けるため1420を使用)
		// make sure this port matches the devUrl port in tauri.conf.json file
		port: 1420,
		// Tauri expects a fixed port, fail if that port is not available
		strictPort: true,
		// TauriのdevUrl (http://localhost:1420) とホスト名を100%合致させる
		host: host || "localhost",
		hmr: host
			? {
					protocol: "ws",
					host,
					port: 1421,
				}
			: undefined,
		watch: {
			// src-tauri の監視を除外
			// tell vite to ignore watching `src-tauri`
			ignored: ["**/src-tauri/**"],
		},
	},
	// Env variables starting with the item of `envPrefix` will be exposed in tauri's source code through `import.meta.env`.
	envPrefix: ["VITE_", "TAURI_ENV_*"],
	define: {
		__TARGET_PLATFORM__: JSON.stringify(
			process.env.TAURI_ENV_PLATFORM ||
				(process.platform === "win32" ? "windows" : "android"),
		),
		__IS_WINDOWS__: JSON.stringify(
			(process.env.TAURI_ENV_PLATFORM ||
				(process.platform === "win32" ? "windows" : "android")) === "windows",
		),
		__IS_ANDROID__: JSON.stringify(
			process.env.TAURI_ENV_PLATFORM === "android",
		),
	},
	build: {
		outDir: "../dist",
		emptyOutDir: true,
		// Tauri uses Chromium on Windows and WebKit on macOS and Linux
		target:
			process.env.TAURI_ENV_PLATFORM === "windows" ||
			process.platform === "win32"
				? "chrome105"
				: "safari13",
		// don't minify for debug builds
		minify: !process.env.TAURI_ENV_DEBUG,
		// produce sourcemaps for debug builds
		sourcemap: !!process.env.TAURI_ENV_DEBUG,
		rollupOptions: {
			input: {
				main: resolve(import.meta.dirname, "ui/index.html"),
				menu: resolve(import.meta.dirname, "ui/menu-iframe.html"),
				submenu: resolve(import.meta.dirname, "ui/submenu-iframe.html"),
				character: resolve(import.meta.dirname, "ui/character.html"),
				balloon: resolve(import.meta.dirname, "ui/balloon.html"),
				loadingBanner: resolve(import.meta.dirname, "ui/loading-banner.html"),
				testMenu: resolve(import.meta.dirname, "ui/test-menu.html"),
				desktopFeatures: resolve(
					import.meta.dirname,
					"ui/windows/desktop-features.html",
				),
				multiWindow: resolve(
					import.meta.dirname,
					"ui/windows/multi-window.html",
				),
				splashscreen: resolve(
					import.meta.dirname,
					"ui/windows/splashscreen.html",
				),
			},
		},
	},
});
