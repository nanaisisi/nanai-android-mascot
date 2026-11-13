//! Nanai Surface - `surfaces.txt` parser, SERIKO surface types, and 32-bit RGBA compositor

pub mod compositor;
pub mod parser;
pub mod types;

pub use compositor::{GLOBAL_SURFACE_CACHE, SurfaceFrameBuffer, SurfaceLruCache, composite_elements};
pub use parser::{expand_range, parse_surfaces_txt};
pub use types::{
    AnimationPattern, BalloonOffset, CollisionArea, CollisionShape, CompositionLayer,
    CompositionPlan, CursorDefinition, DrawMethod, ElementDef, HitTestResult, Interval, Points,
    SerikoAnimation, SortKind, SurfaceDefinition, SurfacesTxt,
};
