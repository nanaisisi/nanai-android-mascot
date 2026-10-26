//! `surfaces.txt` パーサー（ukadoc-spec / descript / shell-surfaces 準拠）
//!
//! シェルのサーフィス定義（Element 描画 / SERIKO アニメーション / Collision 当たり判定 /
//! Alias・範囲指定・surface.append マージ）を Rust 構造体群へとパースする。
//! パーサーはテキスト評価のみを担当し、描画・アニメーション再生は UI 実装側が行う。

use std::collections::BTreeMap;

// ---------------------------------------------------------------- 描画メソッド

/// `element[N]` / `animation[N].pattern[K]` の第1パラメータ（描画メソッド）
#[derive(Debug, Clone, PartialEq, Eq)]
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
            s if s.starts_with("blend-") => {
                Self::Blend(s.trim_start_matches("blend-").to_string())
            }
            other => Self::Custom(other.to_string()),
        }
    }
}

// ---------------------------------------------------------------- SERIKO インターバル

/// `animation[N].interval` の種別（ukadoc: h-animationinterval 系）
#[derive(Debug, Clone, PartialEq, Eq)]
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
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum CollisionShape {
    /// 矩形（始点X, 始点Y, 終点X, 終点Y）
    Rect { x1: i32, y1: i32, x2: i32, y2: i32 },
    /// 多角形（頂点座標列）
    Polygon { vertices: Vec<(i32, i32)> },
}

/// 一つの当たり判定領域
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CollisionArea {
    /// `collision[N]` 形式時の通しID（collisionex では省略され得る）
    pub id: Option<u32>,
    /// 部位名（head, bust, skirt...）
    pub name: String,
    pub shape: CollisionShape,
}

impl CollisionShape {
    /// 座標がこの shape に含まれるか（矩形内側 or 多角形の奇偶規則）
    pub fn contains(&self, x: i32, y: i32) -> bool {
        match self {
            CollisionShape::Rect { x1, y1, x2, y2 } => {
                let (x1, y1, x2, y2) = (*x1, *y1, *x2, *y2);
                x >= x1.min(x2) && x <= x1.max(x2) && y >= y1.min(y2) && y <= y1.max(y2)
            }
            CollisionShape::Polygon { vertices } if vertices.len() >= 3 => {                // 偶奇規則（Even–Odd rule）によるポリゴン内外判定
                let mut inside = false;
                let n = vertices.len();
                let mut j = n - 1;
                for i in 0..n {
                    let (xi, yi) = vertices[i];
                    let (xj, yj) = vertices[j];
                    if ((yi > y) != (yj > y))
                        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
                    {
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

impl CollisionArea {
    /// 座標が当たり判定領域内にあるか
    pub fn contains(&self, x: i32, y: i32) -> bool {
        self.shape.contains(x, y)
    }
}

// ---------------------------------------------------------------- サーフィス構成要素

/// `element[N]` の1行分の定義
#[derive(Debug, Clone, PartialEq, Eq)]
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
#[derive(Debug, Clone, PartialEq, Eq)]
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
#[derive(Debug, Clone, Default, PartialEq, Eq)]
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
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct Points {
    pub center_x: Option<i32>,
    pub center_y: Option<i32>,
    pub basepos_x: Option<i32>,
    pub basepos_y: Option<i32>,
    pub kinoko_center_x: Option<i32>,
    pub kinoko_center_y: Option<i32>,
}

/// バルーン位置オフセット（`<char>.balloon.offsetx/y` / `balloon.offsetx/y`）
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct BalloonOffset {
    pub x: Option<i32>,
    pub y: Option<i32>,
}

/// `surface[N]` / `surface.append[N]` の1サーフィス分の定義
#[derive(Debug, Clone, Default)]
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
#[derive(Debug, Clone, PartialEq, Eq)]
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
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum CompositionLayer {
    /// surface ブロックの element（base / overlay 等）
    Element(ElementDef),
    /// 装着された着せ替え（bind）アニメーションの pattern
    Pattern(AnimationPattern),
}

/// `SurfacesTxt::plan_composition` の結果（下から上への描画順）
#[derive(Debug, Clone, PartialEq, Eq)]
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
#[derive(Debug, Clone, Default)]
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
    /// ルート（ブロック外）の未分類キー・バリュー
    pub properties: BTreeMap<String, String>,
}

impl SurfacesTxt {
    /// テキスト内容から `surfaces.txt` をパースする
    pub fn parse(text: &str) -> Self {
        parse_surfaces_txt(text)
    }

    /// サーフィス番号に対応する定義を取得
    pub fn surface(&self, number: u32) -> Option<&SurfaceDefinition> {
        self.surfaces.get(&number)
    }

    /// 合成計画（MAYUNA / 着せ替え表示のレイヤー列）を立てる
    ///
    /// `binds` は装着する着せ替えアニメーションID（descript の bindgroup 番号）。
    /// 要素ID順に base レイヤーを積み、その後装着された `interval,bind`
    /// アニメの pattern を index 順に積み上げ、`CompositionPlan` で返す。
    /// 未定義サーフィスは None、bind 以外のID・未定義IDは無視される。
    pub fn plan_composition(&self, number: u32, binds: &[u32]) -> Option<CompositionPlan> {
        let def = self.surface(number)?;

        // element をID順（安定ソート）で並べ替え
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

    /// エイリアス名から最初の有効なサーフィス定義を解決する
    pub fn resolve_alias(&self, name: &str) -> Option<&SurfaceDefinition> {
        let list = self.alias_numbers(name)?;
        list.iter().find_map(|n| self.surfaces.get(n))
    }
}

// ---------------------------------------------------------------- パース本体

/// ブロック種別
#[derive(Clone, Debug)]
enum BlockKind {
    /// `descript {}` ブロック
    Descript,
    /// `surface.alias {}` ブロック
    Alias,
    /// `surface[N...]` / `surface.append[N...]` ブロック
    Surface { ids: Vec<u32>, append: bool },
}

/// テキスト内容から `surfaces.txt` をパースする
pub fn parse_surfaces_txt(text: &str) -> SurfacesTxt {
    let mut txt = SurfacesTxt::default();
    let mut scope: Option<BlockKind> = None;

    for raw in text.lines() {
        let line = raw.trim();
        if line.is_empty() || line.starts_with("//") {
            continue;
        }

        // ブロックの開始 brace（単独行）
        if line == "{" {
            continue;
        }
        if line == "}" {
            scope = None;
            continue;
        }

        // ブロック開始行の検出（scope にいない場合のみ）
        if scope.is_none() && let Some(kind) = parse_block_opener(line) {
            prepare_block(&mut txt, &kind);
            scope = Some(kind);
            continue;
        }

        match &scope {
            Some(BlockKind::Descript) => handle_descript_line(&mut txt, line),
            Some(BlockKind::Alias) => handle_alias_line(&mut txt, line),
            Some(BlockKind::Surface { ids, .. }) => {
                let ids = ids.clone();
                handle_surface_line(&mut txt, &ids, line);
            }
            None => handle_root_line(&mut txt, line),
        }
    }

    txt
}

/// ブロックに入る際の初期化（surface の定義クリア / マージ準備）
fn prepare_block(txt: &mut SurfacesTxt, kind: &BlockKind) {
    if let BlockKind::Surface { ids, append } = kind
        && !*append
    {
        // surface ブロックは既存定義を上書き（append は追記）
        for id in ids {
            txt.surfaces.insert(*id, SurfaceDefinition::default());
        }
    }
}

/// ブロック開始行（`surface[N]` / `surface.append[N]` / `surface.alias` / `descript`）を判定する
fn parse_block_opener(line: &str) -> Option<BlockKind> {
    if let Some(rest) = line.strip_prefix("surface") {
        let rest = rest.replace('[', " ").replace(']', " ");
        if let Some(spec) = rest.strip_prefix(".append") {
            if spec.trim().starts_with(|c: char| c.is_ascii_digit() || c == ',') {
                return Some(BlockKind::Surface {
                    ids: expand_range(spec.trim().trim_end_matches('{')),
                    append: true,
                });
            }
            return None;
        }
        if let Some(spec) = rest.strip_prefix(".alias") {
            // `surface.alias {` / `surface.alias{`
            if spec.trim().is_empty() || spec.trim() == "{" {
                return Some(BlockKind::Alias);
            }
            return None;
        }
        if rest.strip_prefix('.').is_some() {
            // 未知の surface.xxx ブロックは無視
            return None;
        }
        let spec = rest.trim();
        if spec.starts_with(|c: char| c.is_ascii_digit() || c == ',') {
            return Some(BlockKind::Surface {
                ids: expand_range(spec.trim_end_matches('{')),
                append: false,
            });
        }
        return None;
    }
    if line.strip_prefix("descript").is_some() {
        let after = line["descript".len()..].trim();
        if after.is_empty() || after == "{" {
            return Some(BlockKind::Descript);
        }
    }
    None
}

fn split_id_suffix(token: &str) -> (&str, Option<u32>) {
    let token = token.trim();
    match token.find(|c: char| c.is_ascii_digit()) {
        Some(pos) => {
            let (word, num) = token.split_at(pos);
            (word, num.parse().ok())
        }
        None => (token, None),
    }
}

/// ルート（ブロック外）の行を処理する
fn handle_root_line(txt: &mut SurfacesTxt, line: &str) {
    let Some((key, value)) = split_key_value(line) else {
        return;
    };
    if key.is_empty() {
        return;
    }
    if key.to_lowercase() == "charset" {
        txt.charset = Some(value.trim().to_string());
    } else {
        txt.properties.insert(key.to_string(), value.trim().to_string());
    }
}

/// `descript {}` ブロック内の行を処理する
fn handle_descript_line(txt: &mut SurfacesTxt, line: &str) {
    let Some((key, value)) = split_key_value(line) else {
        return;
    };
    match key.to_lowercase().as_str() {
        "version" => txt.version = value.trim().parse().unwrap_or(0),
        "maxwidth" => txt.maxwidth = value.trim().parse().ok(),
        "animation.sort" => txt.animation_sort = Some(SortKind::parse(value)),
        "collision.sort" => txt.collision_sort = Some(SortKind::parse(value)),
        k => {
            txt.properties.insert(k.to_string(), value.trim().to_string());
        }
    }
}

/// `surface.alias {}` ブロック内の行を処理する（`エイリアス名, 番号, 番号...`）
fn handle_alias_line(txt: &mut SurfacesTxt, line: &str) {
    let Some((name, rest)) = split_key_value(line) else {
        return;
    };
    let name = name.trim().to_string();
    if name.is_empty() {
        return;
    }
    txt.aliases.insert(name, expand_range(rest));
}

/// `surface[N] {}` / `surface.append[N] {}` ブロック内の行を処理する
fn handle_surface_line(txt: &mut SurfacesTxt, ids: &[u32], line: &str) {
    let Some((key, value)) = split_key_value(line) else {
        return;
    };
    if key.is_empty() {
        return;
    }
    let key_lower = key.to_lowercase();

    if key_lower.starts_with("collisionex") {
        apply_collisionex(txt, ids, &key_lower["collisionex".len()..], value);
    } else if key_lower.starts_with("collision") {
        apply_collision(txt, ids, &key_lower["collision".len()..], value);
    } else if let Some(rest) = key_lower.strip_prefix("element") {
        apply_element(txt, ids, rest, value);
    } else if let Some(rest) = key_lower.strip_prefix("animation") {
        apply_animation_line(txt, ids, rest, value);
    } else if key_lower == "name" {
        for id in ids {
            txt.surfaces.entry(*id).or_default().name = Some(value.trim().to_string());
        }
    } else if let Some(rest) = key_lower.strip_prefix("point.") {
        apply_point(txt, ids, rest, value);
    } else if let Some(offset) = parse_balloon_offset_key(&key_lower) {
        for id in ids {
            let def = txt.surfaces.entry(*id).or_default();
            let entry = def.balloon_offsets.entry(offset.0.clone()).or_default();
            if offset.1 == 'x' {
                entry.x = first_i32(value);
            } else {
                entry.y = first_i32(value);
            }
        }
    } else {
        for id in ids {
            txt.surfaces
                .entry(*id)
                .or_default()
                .properties
                .insert(key.to_string(), value.trim().to_string());
        }
    }
}

/// `key,value` 形式の行を分割する
fn split_key_value(line: &str) -> Option<(&str, &str)> {
    let line = line.trim().trim_end_matches('{').trim();
    let (key, value) = line.split_once(',')?;
    Some((key.trim(), value.trim()))
}

/// 先頭から見つかった最初の数値を返す
fn first_i32(value: &str) -> Option<i32> {
    value
        .split(',')
        .map(str::trim)
        .find_map(|t| t.parse::<i32>().ok())
}

/// `sakura.balloon.offsetx` / `balloon.offsety` 等を (キャラキー, 'x' or 'y') へ変換
fn parse_balloon_offset_key(key: &str) -> Option<(String, char)> {
    if let Some(axis_str) = key.strip_prefix("balloon.offset") {
        let axis = axis_str.trim().chars().next()?;
        return Some(("*".to_string(), axis));
    }
    let (head, rest) = key.split_once(".balloon.offset")?;
    if head.is_empty() {
        return None;
    }
    let axis = rest.trim().chars().next()?;
    Some((head.to_string(), axis))
}

/// `collisionex[ID],name,shape,coords...` を適用
fn apply_collisionex(txt: &mut SurfacesTxt, ids: &[u32], id_part: &str, value: &str) {
    let (_word, id) = split_id_suffix(id_part);
    let tokens: Vec<&str> = value.split(',').map(str::trim).collect();
    if tokens.len() < 3 {
        return;
    }
    let name = tokens[0].to_string();
    let shape_kind = tokens[1].to_lowercase();
    let coords: Vec<i32> = tokens[2..].iter().filter_map(|t| t.parse().ok()).collect();

    let shape = match shape_kind.as_str() {
        "rect" if coords.len() >= 4 => Some(CollisionShape::Rect {
            x1: coords[0],
            y1: coords[1],
            x2: coords[2],
            y2: coords[3],
        }),
        "polygon" if coords.len() >= 6 => Some(CollisionShape::Polygon {
            vertices: coords
                .chunks(2)
                .filter(|c| c.len() == 2)
                .map(|c| (c[0], c[1]))
                .collect(),
        }),
        // 形状指定が未記載の撤退表記: 4点なら rect、6点以上なら polygon とみなす
        _ => {
            if coords.len() >= 6 {
                Some(CollisionShape::Polygon {
                    vertices: coords
                        .chunks(2)
                        .filter(|c| c.len() == 2)
                        .map(|c| (c[0], c[1]))
                        .collect(),
                })
            } else if coords.len() == 4 {
                Some(CollisionShape::Rect {
                    x1: coords[0],
                    y1: coords[1],
                    x2: coords[2],
                    y2: coords[3],
                })
            } else {
                None
            }
        }
    };

    let Some(shape) = shape else { return };
    for num in ids {
        txt.surfaces.entry(*num).or_default().collisions.push(CollisionArea { id, name: name.clone(), shape: shape.clone() });
    }
}

/// `collision[ID],x1,y1,x2,y2,name` を適用
fn apply_collision(txt: &mut SurfacesTxt, ids: &[u32], id_part: &str, value: &str) {
    let (_word, mut id) = split_id_suffix(id_part);
    let tokens: Vec<&str> = value.split(',').map(str::trim).collect();

    // ID 記載なしで 6トークンある形は `collision,x1,y1,x2,y2,name`
    if id.is_none() && tokens.len() >= 6 {
        id = tokens[0].parse().ok();
        apply_collision_body(txt, ids, id, &tokens[1..]);
    } else {
        apply_collision_body(txt, ids, id, &tokens);
    }
}

fn apply_collision_body(txt: &mut SurfacesTxt, ids: &[u32], id: Option<u32>, tokens: &[&str]) {
    if tokens.len() < 5 {
        return;
    }
    let Ok(x1) = tokens[0].parse::<i32>() else { return };
    let Ok(y1) = tokens[1].parse::<i32>() else { return };
    let Ok(x2) = tokens[2].parse::<i32>() else { return };
    let Ok(y2) = tokens[3].parse::<i32>() else { return };
    let name = tokens[4].trim().to_string();
    for num in ids {
        txt.surfaces.entry(*num).or_default().collisions.push(CollisionArea {
            id,
            name: name.clone(),
            shape: CollisionShape::Rect { x1, y1, x2, y2 },
        });
    }
}

/// `element[ID],method,file,x,y(,options...)` を適用
fn apply_element(txt: &mut SurfacesTxt, ids: &[u32], id_part: &str, value: &str) {
    let (_word, id) = split_id_suffix(id_part);
    let tokens: Vec<String> = value.split(',').map(|t| t.trim().to_string()).collect();
    if tokens.len() < 3 {
        return;
    }
    let element = ElementDef {
        id: id.unwrap_or(0),
        method: DrawMethod::parse(&tokens[0]),
        file: tokens[1].clone(),
        x: tokens.get(2).and_then(|t| t.parse().ok()).unwrap_or(0),
        y: tokens.get(3).and_then(|t| t.parse().ok()).unwrap_or(0),
        options: tokens.iter().skip(4).cloned().collect(),
    };
    for num in ids {
        txt.surfaces.entry(*num).or_default().elements.push(element.clone());
    }
}

/// `animation[N].field,value...` を適用
fn apply_animation_line(txt: &mut SurfacesTxt, ids: &[u32], rest: &str, value: &str) {
    let Some((id_part, field)) = rest.split_once('.') else {
        return;
    };
    let Ok(id) = id_part.trim().parse::<u32>() else {
        return;
    };
    let field = field.trim();
    let field_lower = field.to_lowercase();

    for num in ids {
        let def = txt.surfaces.entry(*num).or_default();
        let anim = def.animations.entry(id).or_default();
        anim.id = id;

        if field_lower == "interval" {
            anim.interval = Some(Interval::parse(value));
        } else if field_lower.starts_with("name") {
            anim.name = Some(value.trim().to_string());
        } else if field_lower.starts_with("option") {
            anim.options.push(value.split(',').map(|t| t.trim().to_string()).collect());
        } else if field_lower.starts_with("pattern") {
            let index = if field_lower == "pattern" {
                // 無番号 pattern は連番で付番
                anim.patterns.len() as u32
            } else {
                split_id_suffix(&field["pattern".len()..]).1.unwrap_or(0)
            };
            let tokens: Vec<&str> = value.split(',').map(str::trim).collect();
            if tokens.is_empty() {
                continue;
            }
            let pattern = AnimationPattern {
                index,
                method: DrawMethod::parse(tokens[0]),
                surface: tokens.get(1).and_then(|t| t.parse().ok()).unwrap_or(0),
                wait: tokens.get(2).and_then(|t| t.parse().ok()).unwrap_or(0),
                x: tokens.get(3).and_then(|t| t.parse().ok()).unwrap_or(0),
                y: tokens.get(4).and_then(|t| t.parse().ok()).unwrap_or(0),
                options: tokens.iter().skip(5).map(|t| t.to_string()).collect(),
            };
            anim.patterns.push(pattern);
        }
    }
}

/// `point.*` を適用
fn apply_point(txt: &mut SurfacesTxt, ids: &[u32], field: &str, value: &str) {
    let parsed = first_i32(value);
    for num in ids {
        let points = &mut txt.surfaces.entry(*num).or_default().points;
        match field {
            "centerx" => points.center_x = parsed,
            "centery" => points.center_y = parsed,
            "basepos.x" => points.basepos_x = parsed,
            "basepos.y" => points.basepos_y = parsed,
            "kinoko.centerx" => points.kinoko_center_x = parsed,
            "kinoko.centery" => points.kinoko_center_y = parsed,
            _ => {}
        }
    }
}

/// `0-9,20-22` のような範囲文字列をサーフィス番号列へ展開する
pub fn expand_range(spec: &str) -> Vec<u32> {
    let mut out = Vec::new();
    for part in spec.split(',') {
        let part = part.trim().trim_start_matches('[').trim_end_matches(']');
        if part.is_empty() {
            continue;
        }
        if let Some((start, end)) = part.split_once('-') {
            if let (Ok(s), Ok(e)) = (start.trim().parse::<u32>(), end.trim().parse::<u32>()) {
                if s <= e {
                    out.extend(s..=e);
                    continue;
                }
            }
        }
        if let Ok(n) = part.parse::<u32>() {
            out.push(n);
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_expand_range() {
        assert_eq!(expand_range("0-9,20-22"), (0..10).chain(20..23).collect::<Vec<u32>>());
        assert_eq!(expand_range("19,100,101"), [19, 100, 101]);
        assert_eq!(expand_range("[7]"), [7]);
        assert!(expand_range("abc").is_empty());
    }

    #[test]
    fn test_parse_interval_variants() {
        assert_eq!(Interval::parse("random,3"), Interval::Random(3));
        assert_eq!(Interval::parse("periodic,1000"), Interval::Periodic(1000));
        assert_eq!(Interval::parse("sometimes"), Interval::Sometimes);
        assert_eq!(Interval::parse("rarely"), Interval::Rarely);
        assert_eq!(Interval::parse("always"), Interval::Always);
        assert_eq!(Interval::parse("never"), Interval::Never);
        assert_eq!(Interval::parse("runonce"), Interval::RunOnce);
        assert_eq!(Interval::parse("bind"), Interval::Bind);
        assert_eq!(Interval::parse("talk"), Interval::Talk);
        assert_eq!(Interval::parse("starttalk"), Interval::StartTalk);
        assert_eq!(Interval::parse("endtalk"), Interval::EndTalk);
        assert_eq!(Interval::parse(r"\e"), Interval::YenE);
    }

    #[test]
    fn test_parse_mock_surfaces() {
        // mock_nanai surfaces.txt を模したサンプル（コメント・範囲・append・-1クリアを含む）
        let sample = r"// シェルの表示設定
charset,Shift_JIS

descript
{
version,1
animation.sort,id
}

surface0-9,20-22
{
element0,base,surface0.png,0,0
collisionex0,head,rect,34,20,157,72
collisionex1,bust,rect,63,159,122,198
collisionex2,skirt,rect,24,301,163,383
collisionex3,hand,rect,132,252,157,304
animation100.interval,bind
animation100.pattern0,add,100,0,0,0
}

surface.append0
{
animation0.interval,random,3
animation0.pattern0,base,6,0,0,0
animation0.pattern1,base,-1,85,0,0
element1,overlay,surface01.png,0,0
point.centerx,96
sakura.balloon.offsetx,-10
";
        let txt = SurfacesTxt::parse(sample);

        assert_eq!(txt.charset.as_deref(), Some("Shift_JIS"));
        assert_eq!(txt.version, 1);
        assert_eq!(txt.animation_sort, Some(SortKind::Id));

        let def0 = txt.surface(0).unwrap();
        // 範囲指定により表面の共通 base が入る
        assert_eq!(
            def0.element(0).map(|e| e.file.as_str()),
            Some("surface0.png")
        );
        let head = def0.collisions.iter().find(|c| c.name == "head").unwrap();
        assert_eq!(
            head.shape,
            CollisionShape::Rect { x1: 34, y1: 20, x2: 157, y2: 72 }
        );

        // surface.append0 による追加要素とアニメーション
        assert_eq!(
            def0.element(1).map(|e| e.method.clone()),
            Some(DrawMethod::Overlay)
        );
        let anim0 = &def0.animations[&0];
        assert_eq!(anim0.interval, Some(Interval::Random(3)));
        assert_eq!(anim0.patterns[0].surface, 6);
        assert_eq!(anim0.patterns[1].surface, -1);
        assert_eq!(anim0.patterns[1].wait, 85);

        // bind 用アニメーション
        let anim100 = &def0.animations[&100];
        assert_eq!(anim100.interval, Some(Interval::Bind));

        // point / balloon offset
        assert_eq!(def0.points.center_x, Some(96));
        assert_eq!(def0.balloon_offsets["sakura"].x, Some(-10));

        // 範囲指定が他のサーフィスにも適用されている
        assert!(txt.surface(22).is_some());
        assert_eq!(
            txt.surface(22).unwrap().element(0).unwrap().method,
            DrawMethod::Base
        );

        // 当たり判定ヒットテスト
        assert_eq!(def0.hit_test(90, 40).map(|c| c.name.as_str()), Some("head"));
        assert_eq!(def0.hit_test(90, 170).map(|c| c.name.as_str()), Some("bust"));
        assert_eq!(def0.hit_test(5, 5), None);
    }

    #[test]
    fn test_parse_polygon_and_alias() {
        let sample = r"surface1
{
collisionex0,arm,polygon,10,10,30,10,30,30,10,30
name,腕あげ
}

surface.alias
{
笑顔,1,2
にこにこ,3
}
";
        let txt = SurfacesTxt::parse(sample);

        let def1 = txt.surface(1).unwrap();
        match def1.collisions[0].shape.clone() {
            CollisionShape::Polygon { vertices } => {
                assert_eq!(vertices.len(), 4);
                assert_eq!(vertices[0], (10, 10));
            }
            other => panic!("unexpected: {other:?}"),
        }
        // 多角形内側・外側の判定
        assert!(def1.hit_test(15, 15).is_some());
        assert!(def1.hit_test(200, 200).is_none());
        assert_eq!(def1.name.as_deref(), Some("腕あげ"));

        assert_eq!(txt.alias_numbers("笑顔").unwrap(), &[1u32, 2][..]);
        assert_eq!(txt.alias_numbers("にこにこ").unwrap(), &[3u32][..]);
        assert!(txt.resolve_alias("笑顔").is_some());
    }

    #[test]
    fn test_pattern_bare_and_blend() {
        let sample = r"surface5
{
animation1.interval,periodic,500
animation1.pattern,blend-multiply,11,40,5,6
animation1.pattern,overlayfast,-1,40,0,0
animation2.name,まばたき
}
";
        let txt = SurfacesTxt::parse(sample);
        let def = txt.surface(5).unwrap();
        let anim1 = &def.animations[&1];
        assert_eq!(anim1.interval, Some(Interval::Periodic(500)));
        assert_eq!(anim1.patterns[0].index, 0);
        assert_eq!(anim1.patterns[0].method, DrawMethod::Blend("multiply".into()));
        assert_eq!(anim1.patterns[0].x, 5);
        assert_eq!(anim1.patterns[1].method, DrawMethod::OverlayFast);
        assert_eq!(anim1.patterns[1].index, 1);
        assert_eq!(def.animations[&2].name.as_deref(), Some("まばたき"));
    }

    #[test]
    fn test_parse_mock_nanai_file() {
        // 実プロジェクトのサンプルゴーストに対する結合テスト（存在時のみ）
        let path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../assets/ghost/mock_nanai/shell/master/surfaces.txt");
        if !path.exists() {
            return;
        }
        let content = crate::vfs::open_text_file(&path).unwrap();
        let txt = SurfacesTxt::parse(&content);

        assert_eq!(txt.version, 1);
        let def0 = txt.surface(0).unwrap();
        let names: Vec<&str> = def0.collisions.iter().map(|c| c.name.as_str()).collect();
        assert!(names.contains(&"head") && names.contains(&"bust") && names.contains(&"skirt"));
        assert!(def0.animations.contains_key(&0));
        assert!(txt.surface(100).is_some());
    }

    #[test]
    fn test_plan_composition() {
        let sample = r"charset,Shift_JIS
surface0
{
element0,base,surface0.png,0,0
collisionex0,head,rect,0,0,10,10
animation100.interval,bind
animation100.pattern0,add,100,0,0,0
animation100.pattern1,add,101,0,0,0
animation200.interval,sometimes
animation200.pattern0,overlay,9,500,0,0
}

surface.append0
{
element1,overlay,surface01.png,0,0
}
";
        let txt = SurfacesTxt::parse(sample);

        // bind なし: base 要素のみ
        let plan = txt.plan_composition(0, &[]).unwrap();
        assert_eq!(plan.layers.len(), 2);
        assert_eq!(
            plan.layer_files(),
            vec!["surface0.png".to_string(), "surface01.png".to_string()]
        );

        // bind あり: bind アニメの pattern が後段に積まれる
        let plan = txt.plan_composition(0, &[100]).unwrap();
        assert_eq!(plan.bind_pattern_count(), 2);
        assert_eq!(
            plan.layers[2],
            CompositionLayer::Pattern(AnimationPattern {
                index: 0,
                method: DrawMethod::Add,
                surface: 100,
                wait: 0,
                x: 0,
                y: 0,
                options: vec![],
            })
        );

        // non-bind / 未定義IDは無視
        let plan = txt.plan_composition(0, &[200, 999]).unwrap();
        assert_eq!(plan.bind_pattern_count(), 0);

        // 未定義サーフィスは None
        assert!(txt.plan_composition(42, &[]).is_none());
    }

    #[test]
    fn test_plan_composition_mock_nanai() {
        // 実シェルに対する結合テスト（存在時のみ）
        let path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../assets/ghost/mock_nanai/shell/master/surfaces.txt");
        if !path.exists() {
            return;
        }
        let content = crate::vfs::open_text_file(&path).unwrap();
        let txt = SurfacesTxt::parse(&content);

        let plan = txt.plan_composition(0, &[100]).unwrap();
        // 着袖 bind (animation100) の add pattern が積まれる
        assert_eq!(plan.bind_pattern_count(), 1);
        assert!(matches!(plan.layers.last(), Some(CompositionLayer::Pattern(p)) if p.surface == 100));
    }
}
