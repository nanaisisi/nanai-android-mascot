#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
#[serde(default)]
pub struct ShowCharacterWindowParams {
    #[serde(alias = "scopeId")]
    scope_id: Option<i32>,
    x: Option<f64>,
    y: Option<f64>,
    width: Option<f64>,
    height: Option<f64>,
}

impl ShowCharacterWindowParams {
    pub fn new(
        scope_id: i32,
        x: Option<f64>,
        y: Option<f64>,
        width: Option<f64>,
        height: Option<f64>,
    ) -> Self {
        Self {
            scope_id: Some(scope_id),
            x,
            y,
            width,
            height,
        }
    }

    pub fn scope_id(&self) -> i32 {
        self.scope_id.unwrap_or(0)
    }

    pub fn x(&self) -> Option<f64> {
        self.x
    }

    pub fn y(&self) -> Option<f64> {
        self.y
    }

    pub fn width(&self) -> Option<f64> {
        self.width
    }

    pub fn height(&self) -> Option<f64> {
        self.height
    }
}

#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
#[serde(default)]
pub struct ShowSubcharWindowParams {
    #[serde(alias = "scopeId")]
    scope_id: Option<i32>,
    x: Option<f64>,
    y: Option<f64>,
    width: Option<f64>,
    height: Option<f64>,
}

impl ShowSubcharWindowParams {
    #[allow(dead_code)]
    pub fn new(
        scope_id: i32,
        x: Option<f64>,
        y: Option<f64>,
        width: Option<f64>,
        height: Option<f64>,
    ) -> Self {
        Self {
            scope_id: Some(scope_id),
            x,
            y,
            width,
            height,
        }
    }

    pub fn scope_id(&self) -> i32 {
        self.scope_id.unwrap_or(0)
    }

    pub fn x(&self) -> Option<f64> {
        self.x
    }

    pub fn y(&self) -> Option<f64> {
        self.y
    }

    pub fn width(&self) -> Option<f64> {
        self.width
    }

    pub fn height(&self) -> Option<f64> {
        self.height
    }
}
