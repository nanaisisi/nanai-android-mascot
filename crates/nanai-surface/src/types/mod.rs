//! `surfaces.txt` 関連の型定義

pub mod animation;
pub mod collision;
pub mod composition;
pub mod draw;
pub mod surface;
pub mod txt;

pub use animation::{AnimationPattern, SerikoAnimation};
pub use collision::{CollisionArea, CollisionShape, HitTestResult};
pub use composition::{CompositionLayer, CompositionPlan};
pub use draw::{DrawMethod, Interval};
pub use surface::{BalloonOffset, ElementDef, Points, SortKind, SurfaceDefinition};
pub use txt::{CursorDefinition, SurfacesTxt};
