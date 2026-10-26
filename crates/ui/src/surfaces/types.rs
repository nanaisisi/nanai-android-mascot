//! `surfaces.txt` 関連の型定義

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

// ---------------------------------------------------------------- 描画メソッド

/// `element[N]` / `animation[N].pattern[K]` の第1パラメータ（描画メソッド）
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum DrawMethod {
    /// `base`：下地として描画する
    Base,
    /// `overlay`：現在の絵の上に重ねる
    Overlay,
    /// `overlayfast`（`fast`）: 下の同一領域を消して重ねる
    OverlayFast,
    /// `interpolate`：下の絵と同一色の部分を透過して重ねる
    Interpolate,
    /// `replace`：既存要素を差し替える
    Replace,
    /// `add`：着せ替え用パーツの追加（overlay 相当）
    Add,
    /// `bind`：着せ替えパーツのトグル
    Bind,
    /// `blend-xxx`：各種アルファブレンド合成（例: `blend-multiply`）
    Blend(String),
    /// その他の拡張メソッド（`start` / `stop` / `move` / `import` 等）
    Custom(String),
}

impl DrawMethod {
    /// 文字列から描画メソッドを構築する（大文字小文字は無視）
    pub fn parse(method: &str) -> Self {
        let m = method.trim().to_lowercase();
        match m.as_str() {
            "base" => Self::Base,
            "overlay" => Self::Overlay,
            "overlayfast" | "fast" | "overlay-fast" => Self::OverlayFast,
            "interpolate" => Self::Interpolate,
            "replace" => Self::Replace,
            "add" => Self::Add,
            "bind" => Self::Bind,
            s if s.starts_with("blend-") => Self::Blend(s.trim_start_matches("blend-").to_string()),
            other => Self::Custom(other.to_string()),
        }
    }
}

// ---------------------------------------------------------------- SERIKO インターバル

/// `animation[N].interval` の種別（ukadoc: h-animationinterval 系）
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum Interval {
    /// `always`：常時ループ
    Always,
    /// `sometimes`：短い乱数周期で発火（約数秒に1回程度）
    Sometimes,
    /// `rarely`：まれに発火（より長い乱数周期）
    Rarely,
    /// `random,N`：約N秒に1回の割合で発火
    Random(u32),
    /// `periodic,N`：一定周期（Nミリ秒）ごとに発火
    Periodic(u32),
    /// `runonce`：サーフィス切替時に必ず1回だけ実行
    RunOnce,
    /// `never`：自動発火しない（SHIORI からの強制実行用）
    Never,
    /// `bind`：着せ替えパーツ装着時に発火
    Bind,
    /// `talk`：発話中ループ
    Talk,
    /// `starttalk`：発話開始時に1回
    StartTalk,
    /// `endtalk`：発話終了時に1回
    EndTalk,
    /// `\e`（yen-e）：さくらスクリプト `\e` 到達時に強制実行
    YenE,
    /// その他の拡張種別
    Custom(String),
}

impl Interval {
    /// `random,3` / `periodic,1000` のような値を解析する（大文字小文字は無視）
    pub fn parse(value: &str) -> Self {
        let v = value.trim();
        let lower = v.to_lowercase();
        let (head, param) = if let Some((h, p)) = lower.split_once(',') {
            (h.trim(), Some(p.trim().to_string()))
        } else {
            (lower.as_str(), None)
        };
        match head {
            "always" => Self::Always,
            "sometimes" => Self::Sometimes,
            "rarely" => Self::Rarely,
            "never" => Self::Never,
            "runonce" => Self::RunOnce,
            "bind" => Self::Bind,
            "talk" => Self::Talk,
            "starttalk" => Self::StartTalk,
            "endtalk" => Self::EndTalk,
            "\\e" | "/e" => Self::YenE,
            "random" => Self::Random(param.and_then(|p| p.parse().ok()).unwrap_or(10)),
            "periodic" => Self::Periodic(param.and_then(|p| p.parse().ok()).unwrap_or(1000)),
            other => Self::Custom(other.to_string()),
        }
    }
}

// ---------------------------------------------------------------- 当たり判定

/// collision の形状（`rect` 固定5点 / `polygon` 多角形）
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum CollisionShape {
    /// 矩形（始点X, 始点Y, 終点X, 終点Y）
    Rect { x1: i32, y1: i32, x2: i32, y2: i32 },
    /// 多角形（頂点座標列）
    Polygon { vertices: Vec<(i32, i32)> },
}

impl CollisionShape {
    /// 座標がこの shape に含まれるか（矩形内側 or 多角形の奇偶規則）
    pub fn contains(&self, x: i32, y: i32) -> bool {
        match self {
            CollisionShape::Rect { x1, y1, x2, y2 } => {
                let (x1, y1, x2, y2) = (*x1, *y1, *x2, *y2);
                x >= x1.min(x2) && x <= x1.max(x2) && y >= y1.min(y2) && y <= y1.max(y2)
            }
            CollisionShape::Polygon { vertices } if vertices.len() >= 3 => {
                let mut inside = false;
                let n = vertices.len();
                let mut j = n - 1;
                for i in 0..n {
                    let (xi, yi) = vertices[i];
                    let (xj, yj) = vertices[j];
                    if ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi) {
                        inside = !inside;
                    }
                    j = i;
                }
                inside
            }
            _ => false,
        }
    }
}

/// 一つの当たり判定領域
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CollisionArea {
    /// `collision[N]` 形式時の通しID（collisionex では省略され得る）
    pub id: Option<u32>,
    /// 部位名（head, bust, skirt...）
    pub name: String,
    pub shape: CollisionShape,
}

impl CollisionArea {
    /// 座標が当たり判定領域内にあるか
    pub fn contains(&self, x: i32, y: i32) -> bool {
        self.shape.contains(x, y)
    }
}

// ---------------------------------------------------------------- サーフィス構成要素

/// `element[N]` の1行分の定義
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ElementDef {
    pub id: u32,
    pub method: DrawMethod,
    /// 描画する画像ファイル（シェル相対パス）
    pub file: String,
    pub x: i32,
    pub y: i32,
    /// 追加オプション（トリミング等）
    pub options: Vec<String>,
}

/// `animation[N].pattern[K]` の1コマ分の定義
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AnimationPattern {
    pub index: u32,
    pub method: DrawMethod,
    /// 表示するサーフィス番号（-1 はここまでのアニメ結果のクリア）
    pub surface: i32,
    /// このフレームの待ち時間（ミリ秒）
    pub wait: u32,
    pub x: i32,
    pub y: i32,
    /// 追加オプション
    pub options: Vec<String>,
}

/// 一つの SERIKO アニメーション定義
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct SerikoAnimation {
    pub id: u32,
    pub interval: Option<Interval>,
    /// メニュー等で表示される アニメーション名（`animation[N].name`）
    pub name: Option<String>,
    pub patterns: Vec<AnimationPattern>,
    /// `animation[N].option` 系に指定された内容（元のトークン列）
    pub options: Vec<Vec<String>>,
}

/// サーフィスの基準点情報（`point.*`）
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct Points {
    pub center_x: Option<i32>,
    pub center_y: Option<i32>,
    pub basepos_x: Option<i32>,
    pub basepos_y: Option<i32>,
    pub kinoko_center_x: Option<i32>,
    pub kinoko_center_y: Option<i32>,
}

/// バルーン位置オフセット（`<char>.balloon.offsetx/y` / `balloon.offsetx/y`）
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct BalloonOffset {
    pub x: Option<i32>,
    pub y: Option<i32>,
}

/// `surface[N]` / `surface.append[N]` の1サーフィス分の定義
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct SurfaceDefinition {
    pub elements: Vec<ElementDef>,
    pub collisions: Vec<CollisionArea>,
    /// アニメーション定義（ID 順）
    pub animations: BTreeMap<u32, SerikoAnimation>,
    pub points: Points,
    /// キーは `sakura` / `kero` / `*`（共通指定）
    pub balloon_offsets: BTreeMap<String, BalloonOffset>,
    /// サーフィス表示名（`name,`）
    pub name: Option<String>,
    /// 未分類のキー・バリュー（拡張記載の退避先）
    pub properties: BTreeMap<String, String>,
}

impl SurfaceDefinition {
    /// 座標に該当する当たり判定（先に定義されたものを優先）を返す
    pub fn hit_test(&self, x: i32, y: i32) -> Option<&CollisionArea> {
        self.collisions.iter().find(|c| c.contains(x, y))
    }

    /// 指定 elementID の要素を取得
    pub fn element(&self, id: u32) -> Option<&ElementDef> {
        self.elements.iter().find(|e| e.id == id)
    }
}

// ---------------------------------------------------------------- 並べ替え指定

/// `descript` ブロックの `animation.sort` / `collision.sort` 値
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum SortKind {
    /// `id`：アニメーションID順（ collision は当たり判定ID順）
    Id,
    /// `unique-junk`：ジャンクな重複を弾く
    UniqueJunk,
    /// `u-scoped`：U スコープ順
    UScoped,
    /// その他の拡張値
    Custom(String),
}

impl SortKind {
    pub fn parse(value: &str) -> Self {
        let v = value.trim().to_lowercase();
        match v.as_str() {
            "id" => Self::Id,
            "unique-junk" => Self::UniqueJunk,
            "u-scoped" => Self::UScoped,
            other => Self::Custom(other.to_string()),
        }
    }
}

// ---------------------------------------------------------------- 合成計画 (MAYUNA)

/// 合成計画の1レイヤー
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum CompositionLayer {
    /// surface ブロックの element（base / overlay 等）
    Element(ElementDef),
    /// 装着された着せ替え（bind）アニメーションの pattern
    Pattern(AnimationPattern),
}

/// `SurfacesTxt::plan_composition` の結果（下から上への描画順）
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CompositionPlan {
    /// 対象サーフィス番号
    pub surface: u32,
    /// 描画順に並んだレイヤー列
    pub layers: Vec<CompositionLayer>,
}

impl CompositionPlan {
    /// レイヤーの参照列（表示ファイル名と描画地点の確認用）
    pub fn layer_files(&self) -> Vec<String> {
        self.layers
            .iter()
            .map(|l| match l {
                CompositionLayer::Element(e) => e.file.clone(),
                CompositionLayer::Pattern(p) => p.surface.to_string(),
            })
            .collect()
    }

    /// 装着 pattern レイヤーの数
    pub fn bind_pattern_count(&self) -> usize {
        self.layers
            .iter()
            .filter(|l| matches!(l, CompositionLayer::Pattern(_)))
            .count()
    }
}

// ---------------------------------------------------------------- surfaces.txt 全体

/// `surfaces.txt` のパース結果
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct SurfacesTxt {
    /// `charset,` 指定（例: Shift_JIS）
    pub charset: Option<String>,
    /// `descript` ブロック内の `version,` 指定（0: 旧形式 / 1: 新形式・推奨）
    pub version: u32,
    /// `descript` ブロック内の `maxwidth,`
    pub maxwidth: Option<i32>,
    pub animation_sort: Option<SortKind>,
    pub collision_sort: Option<SortKind>,
    /// サーフィス番号 → 定義
    pub surfaces: BTreeMap<u32, SurfaceDefinition>,
    /// `surface.alias` ブロックの エイリアス名 → サーフィス番号列
    pub aliases: BTreeMap<String, Vec<u32>>,
    /// `kero.surface.alias` / `char1.surface.alias` ブロックのエイリアス名 → 番号列
    #[serde(default)]
    pub kero_aliases: BTreeMap<String, Vec<u32>>,
    /// ルート（ブロック外）の未分類キー・バリュー
    pub properties: BTreeMap<String, String>,
}

impl SurfacesTxt {
    /// テキスト内容から `surfaces.txt` をパースする
    pub fn parse(text: &str) -> Self {
        crate::surfaces::parser::parse_surfaces_txt(text)
    }

    /// サーフィス番号に対応する定義を取得
    pub fn surface(&self, number: u32) -> Option<&SurfaceDefinition> {
        self.surfaces.get(&number)
    }

    /// 合成計画（MAYUNA / 着せ替え表示のレイヤー列）を立てる
    pub fn plan_composition(&self, number: u32, binds: &[u32]) -> Option<CompositionPlan> {
        let def = self.surface(number)?;

        let mut elements: Vec<&ElementDef> = def.elements.iter().collect();
        elements.sort_by_key(|e| e.id);

        let mut layers: Vec<CompositionLayer> = elements
            .into_iter()
            .cloned()
            .map(CompositionLayer::Element)
            .collect();

        let mut bind_ids: Vec<u32> = binds.to_vec();
        bind_ids.sort_unstable();
        for bind_id in bind_ids {
            let Some(anim) = def.animations.get(&bind_id) else {
                continue;
            };
            if anim.interval.as_ref() != Some(&Interval::Bind) {
                continue;
            }
            let mut patterns: Vec<&AnimationPattern> = anim.patterns.iter().collect();
            patterns.sort_by_key(|p| p.index);
            layers.extend(patterns.into_iter().cloned().map(CompositionLayer::Pattern));
        }

        Some(CompositionPlan {
            surface: number,
            layers,
        })
    }

    /// エイリアス名に対応するサーフィス番号列を取得
    pub fn alias_numbers(&self, name: &str) -> Option<&Vec<u32>> {
        for (key, list) in &self.aliases {
            if key.eq_ignore_ascii_case(name) {
                return Some(list);
            }
        }
        None
    }

    /// 相方（kero / char1）のエイリアス名に対応するサーフィス番号列を取得
    pub fn kero_alias_numbers(&self, name: &str) -> Option<&Vec<u32>> {
        for (key, list) in &self.kero_aliases {
            if key.eq_ignore_ascii_case(name) {
                return Some(list);
            }
        }
        None
    }

    /// エイリアス名から最初の有効なサーフィス定義を解決する
    pub fn resolve_alias(&self, name: &str) -> Option<&SurfaceDefinition> {
        let list = self.alias_numbers(name)?;
        list.iter().find_map(|n| self.surfaces.get(n))
    }

    /// 相方（kero / char1）のエイリアス名から最初の有効なサーフィス定義を解決する
    pub fn resolve_kero_alias(&self, name: &str) -> Option<&SurfaceDefinition> {
        let list = self.kero_alias_numbers(name)?;
        list.iter().find_map(|n| self.surfaces.get(n))
    }
}
