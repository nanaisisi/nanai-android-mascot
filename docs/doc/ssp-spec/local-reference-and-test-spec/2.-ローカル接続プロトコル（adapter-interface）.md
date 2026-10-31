## 2. ローカル接続プロトコル（Adapter Interface）

リポジトリルート直下の抽象パス `../../../local`（`.gitignore` 対象）を通じて、各開発環境の外部リソースを透過的にマッピングします。

### 2.1 抽象インターフェース規約

プロジェクトのビルドシステムおよびランタイムは、以下のディレクトリ構成規約に従って `../../../local` を解釈します：

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

個々のマシン環境に合わせる際、以下のいずれかの方法で `../../../local` を接続します。

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
