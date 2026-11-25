# GHOST.md

このゴーストに固有の情報です。AI エージェントは、作業の前に、`ukagaka-developer` スキルの指示（`AGENTS.md` のスタブが案内します）とあわせて読みます。

## このゴーストについて

- 名前（`ghost/master/descript.txt` の `name`）: `mock_nanai`
- キャラクター（`sakura.name` / `kero.name`）: `ちぇっか` / `てすた`
- 作者（`craftman` / `craftmanw`）: `nanai-android-mascot`
- 配布先・ネットワーク更新の URL: 未設定（`dic_network.txt` の `＠homeurl` は空）
- 用途: `nanai-android-mascot` 同梱の標準・動作確認用ゴースト
- SHIORI: 里々（`satori.dll` phase Mc206-9 / Unicode build）。文字コード: `Shift_JIS`（`ghost/master/descript.txt` の `charset,Shift_JIS` に合わせる）
- 里々の仕様書: https://github.com/ukatech/satori-docs （構文は推測で書かず、ここで確かめる）

## ライセンス

- `satori.dll`: `satori_license.txt` の条件（再配布・改変は自由。ライセンス文書を同梱する）
- 辞書・シェル: `nanai-android-mascot` リポジトリのライセンスに準拠

## 辞書の構成

- 読み込む辞書（`ghost/master/dic*.txt`）:
  - `dic_base.txt`
  - `dic_talk.txt`
  - `dic_menu.txt`
  - `dic_advanced.txt`
  - `dic_extraevent.txt`
  - `dic_network.txt`
  - `dic_resource.txt`
- `satori_conf.txt`（`＊初期化` の初期値）:
  - `＄喋り間隔` `１８０秒`、`＄喋り間隔誤差` `１０％`
  - `＄デフォルトサーフェス0` `0`、`＄デフォルトサーフェス1` `10`
  - `＄スコープ切り換え時` `\n[half]`、`＄ユーザ名` `ユーザー`
- `replace.txt` / `replace_after.txt`: 全角タブ・ウェイト展開および句読点ウェイト調整

## イベントと辞書ファイルの対応

| ファイル（`ghost/master/`） | 主な中身 |
|---|---|
| `dic_base.txt` | 初回起動・起動・終了・ゴースト切り替え・消滅指示 |
| `dic_talk.txt` | ランダムトーク（名前のない `＊`） |
| `dic_menu.txt` | メインメニュー・喋り頻度変更・ユーザー名入力・マウス反応 |
| `dic_advanced.txt` | マウス振り分け・時刻・インストール・選択肢・キー入力・`OnSatoriLoad` / `OnSatoriUnload` |
| `dic_extraevent.txt` | SNTP（時計合わせ）・BIFF（メール）・ヘッドライン |
| `dic_network.txt` | ネットワーク更新関連 |
| `dic_resource.txt` | オーナードローメニュー表示設定・リンク集 |

## キャラクターとサーフェス

| スコープ | キャラクター | 人物像（一人称、口調、性格） | 使えるサーフェス |
|---|---|---|---|
| `\0`（`：` の 1 人目） | ちぇっか | 一人称「ぼく」。丁寧語で素直・好奇心旺盛なロボット。 | `0`, `1`, `2` |
| `\1`（`：` の 2 人目） | てすた | クールでサポート上手な小型浮遊ドローン。 | `10` |

デフォルトのサーフェス（`satori_conf.txt` の `＄デフォルトサーフェス0` / `1`）: `0` / `10`

| 番号 | キャラクター | 表情・内容 | 使い方の例 |
|---|---|---|---|
| `0` | ちぇっか | 通常（青い丸目、水色アンテナ） | 基本立ち絵・案内時 |
| `1` | ちぇっか | 笑顔（にっこり目、両手上げ） | 挨拶・喜び・なでられ反応 |
| `2` | ちぇっか | 驚き（黄色い丸目、オレンジアンテナ） | びっくり・警告・エラー時 |
| `10` | てすた | 通常（単眼コア、浮遊ドローン） | 相方側の通常会話 |

- 当たり判定（`shell/master/surfaces.txt` の `collisionex`）:
  - `\0`（`surface0-2`）: `head`（アンテナ・頭部）、`face`（ディスプレイ顔）、`body`（胴体パネル）
  - `\1`（`surface10`）: `head`（アンテナ・上部）、`body`（本体ディスプレイ）
- シェルの一覧: `shell/master`（`nanai-android-mascot`）

## トークの書き方

- `：` で話者を切り替える（`：` なしで行頭から書くと相方側 `\1` のてすたが話す）。
- 表情は `（0）` `（1）` `（2）` `（10）` で切り替える。
- 自動改行と自動ウェイトがあるため、行末の `\n` や過剰な `\w` は入れず、1 行 20〜25 文字程度を目安に改行する。
- 文字として `（` `）` `：` `＃` を出すときは直前に `φ` を付ける。

```text
＊
：（0）いま、内部ログを確認しています。
（10）異常なし？
：（1）はい、今日もオールグリーンです！
```
