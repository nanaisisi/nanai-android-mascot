pub use nanai_surface::{
    AnimationPattern, CompositionLayer, CompositionPlan, CursorDefinition, ElementDef,
    HitTestResult, NanaiSurfaceFacade, Nanai_surfaceInterface,
    SerikoAnimation, SurfaceDefinition, SurfaceFrameBuffer, SurfacesTxt,
};

/// Extract required methods
#[allow(non_camel_case_types)]
pub trait Surfaces_core_integrationTrait {
    // Extract required methods
}

/// Type alias for camelCase compatibility if referenced
#[allow(non_camel_case_types)]
pub trait SurfacesCoreIntegrationTrait: Surfaces_core_integrationTrait {}
impl<T: Surfaces_core_integrationTrait> SurfacesCoreIntegrationTrait for T {}
