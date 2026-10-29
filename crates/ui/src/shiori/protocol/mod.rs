//! SHIORI/3.0 リクエストおよびレスポンスの構築・パース処理

pub mod request;
pub mod response;

pub use request::ShioriRequest;
pub use response::ShioriResponse;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_protocol_reexports_and_building() {
        let req = ShioriRequest::default();
        let built = req.build();
        assert!(built.contains("SHIORI/3.0"));

        let resp = ShioriResponse::default();
        let built_resp = resp.build();
        assert!(built_resp.contains("SHIORI/3.0"));
    }
}
