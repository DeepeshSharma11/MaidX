-- Migration 08: Extend OTP Column Length
-- Extends the otp column from VARCHAR(6) to VARCHAR(255) to support cryptographically secure reset confirmation tokens.

ALTER TABLE otp_codes ALTER COLUMN otp TYPE VARCHAR(255);
