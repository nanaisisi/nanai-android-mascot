/**
 * Tauri API Helper
 * Tauri v2 では `globalThis.__TAURI__.core.invoke` または `globalThis.__TAURI__.invoke` に配置されます。
 * 両方のバージョンおよび Web/モック環境に対応するためのラッパー関数を提供します。
 */

export function isTauriAvailable() {
  return typeof globalThis !== "undefined" && !!globalThis.__TAURI__;
}

export async function invoke(cmd, args = {}) {
  const tauri = globalThis.__TAURI__;
  if (!tauri) {
    throw new Error(`Tauri is not available to invoke command: ${cmd}`);
  }

  // Tauri v2 では tauri.core.invoke、v1 や一部バインディングでは tauri.invoke
  const invokeFn = tauri.core?.invoke || tauri.invoke;
  if (typeof invokeFn === "function") {
    return await invokeFn(cmd, args);
  }

  throw new TypeError(`Tauri invoke function is not available on globalThis.__TAURI__ (cmd: ${cmd})`);
}

export function convertFileSrc(filePath, protocol = "asset") {
  if (!filePath) return "";
  const tauri = globalThis.__TAURI__;
  if (!tauri) {
    return filePath;
  }
  const convertFn = tauri.core?.convertFileSrc || tauri.tauri?.convertFileSrc || tauri.convertFileSrc;
  if (typeof convertFn === "function") {
    return convertFn(filePath, protocol);
  }
  // 相対パスまたはWeb URLはそのまま
  if (filePath.startsWith("http://") || filePath.startsWith("https://") || filePath.startsWith("asset://") || filePath.startsWith("./") || filePath.startsWith("/")) {
    return filePath;
  }
  // Windows絶対パスなどをアセットプロトコル形式に変換
  const normalized = filePath.replace(/\\/g, "/");
  return `asset://localhost/${encodeURI(normalized)}`;
}
