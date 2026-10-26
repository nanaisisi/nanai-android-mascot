# ローカル環境接続・外部参照アダプタ仕様書

- **言及規格の元ドキュメント・権利者・ライセンス**:
  - **SHIORI 仕様 / 各種サブシステム**:
    - **SHIORI/3.0 規格**: [ukadoc-spec: shiori3](https://ukatech.shillest.net/ukadoc-spec/spec/shiori3/) - © UKADOC project (CC BY 4.0)
    - **里々 (SATORI)**: [ukatech/satori-docs](https://ukatech.shillest.net/satori-docs/) - © Kusigahama Yagi / SEIBIHAN (BSD 2-Clause License)
    - **YAYA**: [YAYA-shiori/yaya-docs](https://yaya-shiori.github.io/yaya-docs/) - (The Unlicense / Public Domain)
    - **華和梨 (KAWARI)**: [ukatech/kawari-docs](https://ukatech.shillest.net/kawari-docs/) - © KAWARI Development Team (BSD 2-Clause License)
  - **SSP 拡張仕様 / メニュー規格**: [ukatech/ukadoc-ssp](https://github.com/ukatech/ukadoc-ssp) / [SSP BUG-SLIK-PRACTICE](http://ssp.shillest.net/) - © UKADOC project (CC BY 4.0) / © PONapook 氏
  - **伺か標準仕様 / ゴースト / シェル**: [ukatech/ukadoc-spec (UKADOC project)](https://ukatech.shillest.net/ukadoc-spec/) - © UKADOC project / Ukagaka Tech Team (CC BY 4.0)

> **ステータス**: 確定 (Approved)  
> **対象バージョン**: Nanai Android Mascot v0.2.0+  
> **役割**: **リポジトリ公開仕様**（各開発者の環境差分を吸収するプロトコル・インターフェース定義）  
> **関連仕様書**:
>
> - [ghost-import-and-asset-separation-spec.md](../ghost/ghost-import-and-asset-separation-spec.md)
> - [ssp-compatibility-reference.md](ssp-compatibility-reference.md)
> - [shiori-integration.md](../shiori-script/shiori-integration.md)

---

## 1. 責務の明確な分離（公開仕様 vs ローカルファイル）

本プロジェクトでは、**「リポジトリ内の文書」** と **「ローカルの文書・データ」** の責務を厳格に分離します。

```text
┌────────────────────────────────────────────────────────────────────────┐
│ リポジトリ側仕様書（本ドキュメント）                                    │
│ ・個々の環境差異を吸収するための「接続インターフェース（プロトコル）」を規定 │
│ ・抽象パス（local/）に対する命名規約、スキャン規約、フォールバック規約    │
│ ・ローカル側が満たすべきファイル配置の契約（Contract）を定義           │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │ 接続・適合
┌─────────────────────────────────▼──────────────────────────────────────┐
│ ローカル側ファイル（local/* / .gitignore 対象）                         │
│ ・特定の開発マシン固有の絶対パス（E:\... や /home/...）に直接適合        │
│ ・個々の環境に合わせたインデックスや手元テスト用ゴースト資産の実体      │
│ ・手元の作業環境に閉じたローカル文書（LOCAL_DEV_SPEC.md 等）            │
└────────────────────────────────────────────────────────────────────────┘
```

- **リポジトリ側の文書（公開仕様書）の目的**:
  - 特定のドライブ名や個人環境のパスを書かない。
  - 各開発者が自分の作業環境（Windows, Linux, macOS, WSL）に合わせて「どういう構造でローカル参照を接続すべきか」という**適合仕様（アダプタ規約）**を定義する。
- **ローカル側の文書（非公開リファレンス）の目的**:
  - そのマシン固有の絶対パス、特定ドライブの実体配置、開発者個人のゴーストコレクションやツールチェインに直接適合させる。

---

## 2. ローカル接続プロトコル（Adapter Interface）

リポジトリルート直下の抽象パス `local/`（`.gitignore` 対象）を通じて、各開発環境の外部リソースを透過的にマッピングします。

### 2.1 抽象インターフェース規約

プロジェクトのビルドシステムおよびランタイムは、以下のディレクトリ構成規約に従って `local/` を解釈します：

```text
<repository_root>/
└── local/                                  # 外部リソース接続点（Junction / Symlink）
    ├── REFERENCE_INDEX.md                  # [任意] 環境固有の仕様目次
    ├── LOCAL_DEV_SPEC.md                   # [任意] 環境固有の作業手順書
    ├── ukadoc-spec/                        # UKADOC 公式仕様書リポジトリ
    ├── satori-docs/                        # 里々公式マニュアルリポジトリ
    ├── yaya-docs/                          # YAYA 公式マニュアルリポジトリ
    ├── kawari-docs/                        # 華和梨 公式マニュアルリポジトリ (ukatech/kawari-docs)
    └── ghost/                              # 検証用ゴースト配置領域
        └── <ゴースト名>/
            ├── ghost/master/descript.txt
            └── shell/master/descript.txt
```

### 2.2 接続方式（プラットフォーム別適合手順）

個々のマシン環境に合わせる際、以下のいずれかの方法で `local/` を接続します。

#### A. Windows 環境（NTFS ジャンクション / ディレクトリシンボリックリンク）

管理者権限不要で動作するジャンクションを推奨します。

```powershell
# 外部リファレンス実体への接続例
New-Item -ItemType Junction -Path "local" -Target "<各自のリファレンス・作業フォルダパス>"
```

#### B. POSIX / macOS / Linux 環境（シンボリックリンク）

```bash
ln -s /path/to/your/reference/ukagaka ./local
```

#### C. 単独クローン環境（外部参照なし）

外部参照を作成しない場合でも、ランタイムは自動的にフォールバックするため特別な操作は不要です。

---

## 3. アプリケーション層（VFS / ゴースト探索）の動作保証規約

リポジトリ内のコード（Rust コア / フロントエンド）は、個々のローカル環境の有無に関わらず安全に動作するよう以下の振る舞いを保証します：

### 3.1 探索フォールバックマトリクス

| 優先度 | 対象パス          | 存在時の動作                                     | 不在時の動作               |
| :----: | :---------------- | :----------------------------------------------- | :------------------------- |
| **1**  | `local/ghost/`    | 配下の各ゴーストをスキャンして一覧に追加         | スキップ（エラーとしない） |
| **2**  | `assets/ghost/`   | リポジトリ組み込みゴースト（`mock_nanai`）を追加 | 警告ログを出力し次へ       |
| **3**  | `userData/ghost/` | ユーザーが実行時にインポートしたゴーストを追加   | スキップ                   |

### 3.2 パス透過性・シンボリックリンク追従

- Rust のファイルアクセスおよび Tauri コマンド（`resolve_vfs_path`, `scan_ghost_directory`）は、ジャンクションおよびシンボリックリンクのターゲットを正しく解決してファイルストリームを取得します。
- Git 追跡対象には絶対パスやリンク実体が含まれないため、個人の環境差分がコミットに漏洩しません。

---

## 4. ドキュメント参照の解決規約

1. **公開仕様書（docs/ 配下）における参照**:
   - Web 上の公開 URL（公式 GitHub / 公式サイト）を標準リンクとして記述する。
   - 例: [ukatech/kawari-docs](https://github.com/ukatech/kawari-docs)
2. **手元の開発時（IDE / エージェント）における解決**:
   - 各自の環境で `local/` が接続されている場合、IDE や開発支援エージェントは `local/kawari-docs/` 等のローカルキャッシュを優先してインデックス・高速検索に使用する。
