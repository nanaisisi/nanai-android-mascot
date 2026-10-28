# spec/saori-ex/internal_crypto 項目別突合

実装コードの文字列検索による一次調査です。

| 項目                                                                                    | 検索語          |     対応状況      |
| :-------------------------------------------------------------------------------------- | :-------------- | :---------------: |
| [共通鍵暗号（Encrypt / Decrypt）](internal_crypto_cipher.md)                            | Encrypt         |    ❌ 検出なし    |
| [公開鍵暗号（GenerateKeyPair / Sign / Verify / KeyAgreement）](internal_crypto_pkey.md) | GenerateKeyPair |    ❌ 検出なし    |
| [Compare](internal_crypto.Compare.md)                                                   | Compare         | ❌ 未実装(誤検出) |
| [Decrypt](internal_crypto.Decrypt.md)                                                   | Decrypt         |    ❌ 検出なし    |
| [DeriveKey](internal_crypto.DeriveKey.md)                                               | DeriveKey       |    ❌ 検出なし    |
| [Digest](internal_crypto.Digest.md)                                                     | Digest          | ❌ 未実装(誤検出) |
| [Encrypt](internal_crypto.Encrypt.md)                                                   | Encrypt         |    ❌ 検出なし    |
| [GenerateKeyPair](internal_crypto.GenerateKeyPair.md)                                   | GenerateKeyPair |    ❌ 検出なし    |
| [HashPassword](internal_crypto.HashPassword.md)                                         | HashPassword    |    ❌ 検出なし    |
| [HMAC](internal_crypto.HMAC.md)                                                         | HMAC            |    ❌ 検出なし    |
| [KeyAgreement](internal_crypto.KeyAgreement.md)                                         | KeyAgreement    |    ❌ 検出なし    |
| [Protect](internal_crypto.Protect.md)                                                   | Protect         |    ❌ 検出なし    |
| [Sign](internal_crypto.Sign.md)                                                         | Sign            |    ❌ 検出なし    |
| [TOTP](internal_crypto.TOTP.md)                                                         | TOTP            |    ❌ 検出なし    |
| [Unprotect](internal_crypto.Unprotect.md)                                               | Unprotect       |    ❌ 検出なし    |
| [Verify](internal_crypto.Verify.md)                                                     | Verify          |    ❌ 検出なし    |
| [VerifyPassword](internal_crypto.VerifyPassword.md)                                     | VerifyPassword  |    ❌ 検出なし    |
