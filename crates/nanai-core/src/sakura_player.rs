//! さくらスクリプト (Sakura Script) 状態駆動再生エンジン
//! トークン列を順次実行し、テキスト追加・サーフィス変更・ウェイト等の状態変更を生成

use crate::sakura_script::{SakuraToken, parse_sakura_script};
use serde::{Deserialize, Serialize};
use tsify::Tsify;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
#[serde(tag = "action", content = "data")]
pub enum StepOutput {
    /// テキストの追加 (\0 こんにちは)
    TextAppend { scope: u32, text: String },
    /// サーフィスの切り替え (\s[0])
    SurfaceChange { scope: u32, surface_id: i32 },
    /// バルーンの切り替え (\b[0])
    BalloonChange { scope: u32, balloon_id: i32 },
    /// アニメーション再生 (\i[10])
    AnimationTrigger { scope: u32, animation_id: i32 },
    /// バルーンクリア (\c)
    Clear { scope: u32 },
    /// スコープ変更 (\0, \1, \p[N])
    ScopeChange { scope: u32 },
    /// 選択肢 (\q[title,id])
    Choice {
        scope: u32,
        title: String,
        id: String,
    },
    /// アンカー (\_a[id]title\_a)
    Anchor {
        scope: u32,
        id: String,
        text: String,
    },
    /// ウェイト実行 (\w5, \_w[500])
    Wait { duration_ms: u32 },
    /// 拡張コマンド (\![...])
    Command {
        scope: u32,
        command: String,
        args: Vec<String>,
    },
    /// スクリプト再生終了 (\e)
    Halt,
    /// 終了/無効ステップ
    None,
}

#[wasm_bindgen]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SakuraPlayerEngine {
    tokens: Vec<SakuraToken>,
    current_index: usize,
    current_scope: u32,
    surfaces: std::collections::BTreeMap<u32, i32>,
    balloons: std::collections::BTreeMap<u32, i32>,
    display_texts: std::collections::BTreeMap<u32, String>,
    is_halted: bool,
}

#[wasm_bindgen]
impl SakuraPlayerEngine {
    #[wasm_bindgen(constructor)]
    pub fn new(script: &str) -> Self {
        let tokens = parse_sakura_script(script);
        Self {
            tokens,
            current_index: 0,
            current_scope: 0,
            surfaces: std::collections::BTreeMap::new(),
            balloons: std::collections::BTreeMap::new(),
            display_texts: std::collections::BTreeMap::new(),
            is_halted: false,
        }
    }

    /// スクリプトを 1 ステップ進行し、発生した変更出力を返却
    pub fn step(&mut self) -> Result<JsValue, JsValue> {
        let output = self.step_internal();
        Ok(serde_wasm_bindgen::to_value(&output)?)
    }
}

impl SakuraPlayerEngine {
    pub fn step_internal(&mut self) -> StepOutput {
        if this_is_halted(self) {
            return StepOutput::Halt;
        }

        if self.current_index >= self.tokens.len() {
            self.is_halted = true;
            return StepOutput::Halt;
        }

        let token = self.tokens[self.current_index].clone();
        self.current_index += 1;

        match token {
            SakuraToken::Text(txt) => {
                let entry = self.display_texts.entry(self.current_scope).or_default();
                entry.push_str(&txt);
                StepOutput::TextAppend {
                    scope: self.current_scope,
                    text: txt,
                }
            }
            SakuraToken::Scope(s) => {
                self.current_scope = s;
                StepOutput::ScopeChange { scope: s }
            }
            SakuraToken::Surface(s_id) => {
                self.surfaces.insert(self.current_scope, s_id);
                StepOutput::SurfaceChange {
                    scope: self.current_scope,
                    surface_id: s_id,
                }
            }
            SakuraToken::Balloon(b_id) => {
                self.balloons.insert(self.current_scope, b_id);
                StepOutput::BalloonChange {
                    scope: self.current_scope,
                    balloon_id: b_id,
                }
            }
            SakuraToken::Animation(anim_id) => StepOutput::AnimationTrigger {
                scope: self.current_scope,
                animation_id: anim_id,
            },
            SakuraToken::Newline => {
                let entry = self.display_texts.entry(self.current_scope).or_default();
                entry.push('\n');
                StepOutput::TextAppend {
                    scope: self.current_scope,
                    text: "\n".to_string(),
                }
            }
            SakuraToken::Clear => {
                self.display_texts.insert(self.current_scope, String::new());
                StepOutput::Clear {
                    scope: self.current_scope,
                }
            }
            SakuraToken::Wait(ms) => StepOutput::Wait { duration_ms: ms },
            SakuraToken::Choice { title, id } => StepOutput::Choice {
                scope: self.current_scope,
                title,
                id,
            },
            SakuraToken::Anchor { id, text } => StepOutput::Anchor {
                scope: self.current_scope,
                id,
                text,
            },
            SakuraToken::Command { command, args } => StepOutput::Command {
                scope: self.current_scope,
                command,
                args,
            },
            SakuraToken::Font { .. } | SakuraToken::Sync(_) | SakuraToken::Quick(_) | SakuraToken::ChoiceScopeBegin { .. } | SakuraToken::ChoiceScopeEnd => {
                self.step_internal()
            }
            SakuraToken::Halt => {
                self.is_halted = true;
                StepOutput::Halt
            }
        }
    }

    pub fn is_halted(&self) -> bool {
        self.is_halted
    }

    pub fn get_current_scope(&self) -> u32 {
        self.current_scope
    }

    pub fn get_surface(&self, scope: u32) -> Option<i32> {
        self.surfaces.get(&scope).copied()
    }

    pub fn get_display_text(&self, scope: u32) -> &str {
        self.display_texts
            .get(&scope)
            .map(|s| s.as_str())
            .unwrap_or("")
    }
}

fn this_is_halted(engine: &SakuraPlayerEngine) -> bool {
    engine.is_halted
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sakura_player_engine_flow() {
        let script = "\\0\\s[0]Hello\\n\\1\\s[10]World\\e";
        let mut engine = SakuraPlayerEngine::new(script);

        assert_eq!(engine.step_internal(), StepOutput::ScopeChange { scope: 0 });
        assert_eq!(
            engine.step_internal(),
            StepOutput::SurfaceChange {
                scope: 0,
                surface_id: 0
            }
        );
        assert_eq!(
            engine.step_internal(),
            StepOutput::TextAppend {
                scope: 0,
                text: "Hello".to_string()
            }
        );
        assert_eq!(
            engine.step_internal(),
            StepOutput::TextAppend {
                scope: 0,
                text: "\n".to_string()
            }
        );
        assert_eq!(engine.step_internal(), StepOutput::ScopeChange { scope: 1 });
        assert_eq!(
            engine.step_internal(),
            StepOutput::SurfaceChange {
                scope: 1,
                surface_id: 10
            }
        );
        assert_eq!(
            engine.step_internal(),
            StepOutput::TextAppend {
                scope: 1,
                text: "World".to_string()
            }
        );
        assert_eq!(engine.step_internal(), StepOutput::Halt);
        assert!(engine.is_halted());
    }
}
