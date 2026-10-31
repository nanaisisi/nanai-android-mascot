# 1. サイト型仕様マップ（Sitemap & Matrix）

```mermaid
flowchart TD
    SSP[SSP 2.7.x 互換仕様体系] --> RClick[1. 右クリックメニュー / 操作系]
    SSP --> Func[2. 内蔵機能 / ツール群]
    SSP --> Config[3. 本体設定 / コンフィグ]
    SSP --> Event[4. SHIORI 3.0 / イベント通信]
    SSP --> Dev[5. 開発者向け支援ツール]

    RClick --> M1[おすすめ / ポータル]
    RClick --> M2[ゴースト・シェル・バルーン切り替え]
    RClick --> M3[シェル倍率 50%〜200%]
    RClick --> M4[アイコン化 / 終了]

    Func --> F1[バックログ / 発言履歴]
    Func --> F2[カレンダー / スケジュール]
    Func --> F3[音声合成 / 認識]
    Func --> F4[FMO / キャッシュ開放]

    Config --> C1[一般・表示・喋り]
    Config --> C2[接続・POP・プロキシ]
    Config --> C3[文字コード判別・フォールバック]

    Event --> E1[OnBoot / OnClose]
    Event --> E2[OnMouseClick / OnMouseMove]
    Event --> E3[OnSecondChange / OnMinuteChange]
```

### 1.1 標準ディレクトリ構成・アセット分離仕様マッピング

SSP 標準の配置構造との互換性を確保しつつ、Git リポジトリ汚染を防ぐアセット分離仕様です（詳細は [ghost-import-and-asset-separation-spec.md](../ghost/ghost-import-and-asset-separation-spec.md) 参照）。

|   ディレクトリ    | SSP 標準の役割                        | Nanai 実装仕様                                       | Git 管理ポリシー                               |
| :---------------: | :------------------------------------ | :--------------------------------------------------- | :--------------------------------------------- |
|  `../../../assets/ghost`  | ゴースト格納ディレクトリ (`ghost/`)   | 各ゴースト (`ghost/master/`, `shell/master/`) を配置 | `mock_nanai` のみ追跡。導入ゴーストは Git 除外 |
| `../../../assets/balloon` | バルーン格納ディレクトリ (`balloon/`) | 吹き出しスキン (`descript.txt`, 画像アセット) を配置 | `default` のみ追跡。追加バルーンは Git 除外    |
|    `userData/`    | ユーザー設定・セーブデータ (`data/`)  | 設定・セーブデータ・一時インポートファイル           | 完全除外（ローカル専用データ領域）             |

---
