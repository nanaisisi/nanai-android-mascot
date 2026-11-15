//! `surface[N]` ブロック内の個別キー処理（collision / element / animation / point）モジュール

pub mod animation;
pub mod collision;
pub mod element;
pub mod point;
pub mod utils;

pub(crate) use animation::{Apply_animation_lineParams, apply_animation_line};
pub(crate) use collision::{
    Apply_collisionParams, Apply_collisionexParams, apply_collision, apply_collisionex,
};
pub(crate) use element::{Apply_elementParams, apply_element};
pub(crate) use point::{Apply_pointParams, apply_point};
pub use utils::expand_range;
pub(crate) use utils::{first_i32, parse_balloon_offset_key};

#[cfg(test)]
mod tests;
