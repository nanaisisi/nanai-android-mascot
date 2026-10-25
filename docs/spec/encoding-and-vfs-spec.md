# 文字コード変換（Shift_JIS ↔ UTF-8）& 仮想ファイルシステム（VFS）仕様書

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **SHIORI 仕様 / 各種サブシステム**:
    - **SHIORI/3.0 規格**: [ukadoc-spec: shiori3](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/) - © UKADOC project (CC BY 4.0)
    - **里々 (SATORI)**: [ukatech/satori-docs](https://ukatech.shillest.net/satori-docs/) - © Kusigahama Yagi / SEIBIHAN (BSD 2-Clause License)
    - **YAYA**: [YAYA-shiori/yaya-docs](https://yaya-shiori.github.io/yaya-docs/) - (The Unlicense / Public Domain)
    - **華和梨 (KAWARI)**: [ukatech/kawari-docs](https://ukatech.shillest.net/kawari-docs/) - © KAWARI Development Team (BSD 2-Clause License)
  - **伺か標準仕様 / ゴースト / シェル**: [ukatech/ukadoc-spec (UKADOC project)](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)
  - **surfaces.txt / アニメーション合成 / 当たり判定**: [ukadoc-spec: surfaces.txt](https://ukatech.shillest.net/ukadoc-spec/spec/surfaces/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

本仕様書は、**nanai-android-mascot** において、歴史的な伺かゴースト資産（Shift_JIS/CP932）をモダンな UTF-8 環境（Rust / Tauri / Web / Android）で文字化けなく読み込み、また OS ごとのファイルパス差異（大文字・小文字、区切り文字）を吸収する **仮想ファイルシステム（Virtual File System: VFS）** の仕様を定義します。

---

## 1. 背景と課題

伺かゴーストのファイル群（`descript.txt`, `surfaces.txt`, 各種辞書ファイル `dic_*.txt`）には、クロスプラットフォーム化における 2 つの大きな壁が存在します：

1. **文字コードの不一致**:
   - 既存の Windows 向けゴーストは **Shift_JIS (CP932)** で記述されている。
   - Tauri (Rust) やブラウザ（JavaScript）の標準文字列は **UTF-8**。
   - 単純に読み込むと、文字化けや JSON シリアライズ時のクラッシュを引き起こす。
2. **ファイルパスの大文字・小文字問題**:
   - Windows は大文字・小文字を区別しない（Case-insensitive: `Surface0.png` と `surface0.png` は同一）。
   - Android (Linux ext4/f2fs) や Web サーバーは **大文字・小文字を厳格に区別する（Case-sensitive）**。
   - 辞書やスクリプト内の参照パスと実際のファイル名で大文字・小文字が異なると、Android 上でファイル未検出エラーが発生する。

---

## 2. 文字コード変換アーキテクチャ

```mermaid
flowchart LR
    A["Shift_JIS テキストファイル<br>(descript.txt / 辞書)"] --> B{charset 判定}
    B -->|Shift_JIS / CP932| C["デコーダー<br>(Rust: encoding_rs<br>JS: TextDecoder)"]
    B -->|UTF-8 (BOM有/無)| D[UTF-8 パススルー]
    C --> E["正規化された UTF-8 文字列<br>(内部処理・UI描画)"]
    D --> E
    
    E -->|SHIORI 3.0 通信 (Win32 DLL)| F["エンコーダー<br>(UTF-8 → Shift_JIS)"]
    E -->|SHIORI 3.0 通信 (WASM / JS)| G[UTF-8 そのまま送受信]
```

### 2.1 自動文字コード判定ルール

1. **BOM（Byte Order Mark）チェック**:
   - `0xEF, 0xBB, 0xBF` で始まる場合は **UTF-8**。
2. **ヘッダー宣言チェック**:
   - 先頭行付近に `charset,Shift_JIS` または `charset,CP932` が存在する場合は **Shift_JIS**。
   - `charset,UTF-8` が明示されている場合は **UTF-8**。
3. **フォールバック判定**:
   - UTF-8 としてパースを試行し、不正バイト列（エラー）が検出された場合は自動的に **Shift_JIS (encoding_rs::SHIFT_JIS)** としてデコード。

---

## 3. 仮想ファイルシステム（VFS）仕様

ゴーストディレクトリへのアクセスは、OS 直接のファイル操作ではなく、VFS レイヤーを経由して透過的に解決します。

### 3.1 大文字・小文字吸収（Case-Insensitive Resolver）

Android / Linux 上でファイルを探す際、指定されたパスで見つからない場合は、ディレクトリ内のエントリ一覧を取得して **小文字変換比較（ASCII Lowercase Match）** を行います。

```rust
// VFS パス解決のロジック仕様
pub fn resolve_vfs_path(base_dir: &Path, relative_path: &str) -> Option<PathBuf> {
    let mut current = base_dir.to_path_buf();
    for part in relative_path.split(['/', '\\']) {
        if part.is_empty() || part == "." { continue; }
        if part == ".." { current.pop(); continue; }

        // 完全一致を試行
        let direct = current.join(part);
        if direct.exists() {
            current = direct;
            continue;
        }

        // 大文字小文字を無視して探索
        let target_lower = part.to_lowercase();
        let found = std::fs::read_dir(&current).ok()?.find_map(|entry| {
            let entry = entry.ok()?;
            let file_name = entry.file_name().to_string_lossy().to_string();
            if file_name.to_lowercase() == target_lower {
                Some(entry.path())
            } else {
                None
            }
        });

        match found {
            Some(p) => current = p,
            None => return None, // 見つからない
        }
    }
    Some(current)
}
```

### 3.2 パス区切り文字の正規化

- Windows のバックスラッシュ（`\`）と Android/Web のスラッシュ（`/`）を相互変換。
- 内部では常にスラッシュ（`/`）で統一。

---

## 4. WASM / インメモリ展開（Memory VFS）

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
