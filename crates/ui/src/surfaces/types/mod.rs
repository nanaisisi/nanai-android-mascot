//! `surfaces.txt` 関連の型定義

pub mod collision;
pub mod composition;
pub mod draw;
pub mod surface;
pub mod txt;

pub use collision::{CollisionArea, CollisionShape};
pub use composition::{CompositionLayer, CompositionPlan};
pub use draw::{DrawMethod, Interval};
pub use surface::{AnimationPattern, BalloonOffset, ElementDef, Points, SerikoAnimation, SortKind, SurfaceDefinition};
pub use txt::SurfacesTxt;
