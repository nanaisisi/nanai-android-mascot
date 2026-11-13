//! 描画メソッド・アニメーションインターバルの型

mod interval;
mod method;

#[cfg(test)]
mod tests;

pub use interval::Interval;
pub use method::DrawMethod;
