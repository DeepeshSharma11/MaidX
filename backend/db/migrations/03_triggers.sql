-- Migration 03: Triggers
-- Run AFTER 02_tables.sql

-- Auto-update maid rating after review
CREATE OR REPLACE FUNCTION update_maid_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    UPDATE profiles
    SET rating = (SELECT AVG(rating) FROM reviews WHERE maid_id = NEW.maid_id),
        reviews_count = (SELECT COUNT(*) FROM reviews WHERE maid_id = NEW.maid_id),
        updated_at = NOW()
    WHERE id = NEW.maid_id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_review_insert ON reviews;
CREATE TRIGGER on_review_insert
    AFTER INSERT ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_maid_rating();
