-- Migration 03: Triggers
-- Run AFTER 02_tables.sql

-- Auto-create profile on signup (safe role casting)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    _role user_role := 'client';
    _raw_role TEXT;
BEGIN
    _raw_role := NEW.raw_user_meta_data->>'role';
    IF _raw_role IN ('admin', 'maid', 'client') THEN
        _role := _raw_role::user_role;
    END IF;

    INSERT INTO profiles (id, role, full_name)
    VALUES (
        NEW.id,
        _role,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

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
