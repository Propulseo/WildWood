-- ============================================================
-- Migration: Comptabilité + Revenus business logic
-- Adds saisie_type on transactions, snapshot columns on cashbox_journees
-- ============================================================

-- 1. saisie_type sur transactions (sans CHECK d'abord, données existantes)
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS saisie_type TEXT;

UPDATE transactions SET saisie_type = 'manuel'
WHERE saisie_type IS NULL OR saisie_type = 'auto';

ALTER TABLE transactions
  ADD CONSTRAINT transactions_saisie_type_check
    CHECK (saisie_type IN ('auto_fnb', 'auto_resort', 'auto_gym', 'manuel'));

-- 2. Colonnes snapshot sur cashbox_journees
ALTER TABLE cashbox_journees
  ADD COLUMN IF NOT EXISTS revenus_total_thb      INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revenus_gym_thb         INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revenus_fnb_thb         INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revenus_resort_thb      INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS depenses_black_box_thb  INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS closing_note            TEXT;
