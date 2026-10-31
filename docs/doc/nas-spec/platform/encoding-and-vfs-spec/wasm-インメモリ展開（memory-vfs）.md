# 4. WASM / インメモリ展開（Memory VFS）

Android の Scoped Storage（外部ストレージ制限）や将来のブラウザ版を見据え、ゴーストの `.nar` アーカイブ（Zip形式）またはディレクトリを、**メモリ上の仮想ファイルマップ** として保持できる構造を定義します。

```typescript
// メモリ VFS インターフェース
export interface VirtualFileSystem {
	readFile(path: string): Uint8Array | null;
	readTextFile(path: string, defaultCharset?: string): string | null;
	exists(path: string): boolean;
	listDir(dirPath: string): string[];
}
```

- **メリット**:
  - 端末のローカルストレージにファイルを物理展開することなく、メモリ上で直接 SHIORI (WASM) に引き渡せる。
  - 高速な読み込みと安全なサンドボックス実行を実現。
