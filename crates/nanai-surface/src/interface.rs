//! Stable public API interface for `nanai-surface` to decouple dependent components

use crate::compositor::{SurfaceFrameBuffer, composite_elements};
use crate::parser::parse_surfaces_txt;
use crate::types::{DrawMethod, HitTestResult, SurfaceDefinition, SurfacesTxt};

#[allow(non_camel_case_types)]
pub trait Nanai_surfaceInterface: Send + Sync {
    // Define stable public API

    /// Parses a `surfaces.txt` formatted text into a `SurfacesTxt` struct
    fn parse_surfaces_txt(&self, text: &str) -> SurfacesTxt;

    /// Resolves a surface definition by surface ID or alias name
    fn resolve_surface(&self, txt: &SurfacesTxt, number_or_alias: &str) -> Option<SurfaceDefinition>;

    /// Performs hit test on a specific surface
    fn hit_test(&self, txt: &SurfacesTxt, surface_id: u32, x: i32, y: i32) -> Option<HitTestResult>;

    /// Composites multiple layers over a base surface frame buffer
    fn composite_elements(
        &self,
        base: &SurfaceFrameBuffer,
        layers: &[(&SurfaceFrameBuffer, i32, i32, DrawMethod)],
    ) -> SurfaceFrameBuffer;
}

/// Default implementation facade for `Nanai_surfaceInterface`
#[derive(Debug, Clone, Copy, Default)]
pub struct NanaiSurfaceFacade;

impl Nanai_surfaceInterface for NanaiSurfaceFacade {
    fn parse_surfaces_txt(&self, text: &str) -> SurfacesTxt {
        parse_surfaces_txt(text)
    }

    fn resolve_surface(&self, txt: &SurfacesTxt, number_or_alias: &str) -> Option<SurfaceDefinition> {
        if let Ok(id) = number_or_alias.parse::<u32>() {
            txt.surface(id).cloned()
        } else {
            txt.resolve_alias(number_or_alias).cloned()
        }
    }

    fn hit_test(&self, txt: &SurfacesTxt, surface_id: u32, x: i32, y: i32) -> Option<HitTestResult> {
        txt.hit_test(surface_id, x, y)
    }

    fn composite_elements(
        &self,
        base: &SurfaceFrameBuffer,
        layers: &[(&SurfaceFrameBuffer, i32, i32, DrawMethod)],
    ) -> SurfaceFrameBuffer {
        composite_elements(base, layers)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_nanai_surface_facade_interface() {
        let facade = NanaiSurfaceFacade;
        let text = "surface0 {\n  name,SurfaceZero\n}";
        let txt = facade.parse_surfaces_txt(text);
        assert_eq!(txt.surfaces.len(), 1);

        let def = facade.resolve_surface(&txt, "0");
        assert!(def.is_some());
        assert_eq!(def.unwrap().name.as_deref(), Some("SurfaceZero"));

        let hit = facade.hit_test(&txt, 0, 10, 10);
        assert!(hit.is_none());
    }

    #[test]
    fn test_nanai_surface_interface_trait_object() {
        let facade = NanaiSurfaceFacade;
        let trait_obj: &dyn Nanai_surfaceInterface = &facade;
        let txt = trait_obj.parse_surfaces_txt("");
        assert!(txt.surfaces.is_empty());
    }
}
