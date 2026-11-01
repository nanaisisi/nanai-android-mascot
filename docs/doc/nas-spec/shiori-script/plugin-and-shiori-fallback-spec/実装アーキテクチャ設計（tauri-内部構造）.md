# 6. 実装アーキテクチャ設計（Tauri 内部構造）

```text
[ Frontend (WebView) ]
      ▲
      │ (JSON-RPC / postMessage)
      ▼
[ Tauri Core Router (Rust) ]
      ├── NativeDllLoader (Windowsのみ / cfg(target_os="windows"))
      ├── WasmEngineManager (Wasmtime / WebAssembly Instance)
      ├── JsPluginHost (WebView内サンドボックス実行)
      └── VirtualFileSystem (VFS: メモリ上での辞書・アセット展開)
```

### コア利点

- **絶対的な安定性**: 壊れた DLL や未対応プラットフォームでも、親プロセスがクラッシュせず上位フォールバックへ安全に縮退。
- **コミュニティ資産の保全**: 既存の膨大なゴースト資産（テキスト・辞書）を無駄にせず、Android / Web へそのまま移行可能。
- **新規開発の容易さ**: 新しい拡張機能は、ブラウザ技術（JavaScript/CSS）だけで簡単に作成・即時リロード可能。
