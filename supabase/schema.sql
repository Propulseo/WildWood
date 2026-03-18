-- ============================================================
-- WildWood ERP — Schéma SQL complet
-- Ordre strict : respecter les dépendances FK
-- ============================================================

-- Extension nécessaire pour EXCLUDE USING gist
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================================
-- 1.1 — Tables de référence (aucune dépendance)
-- ============================================================

-- Staff
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prenom TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  poste TEXT CHECK (poste IN ('admin', 'reception', 'bar')) NOT NULL,
  avatar_initiales TEXT,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Templates messages WhatsApp
CREATE TABLE message_templates (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  contenu TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tarifs bungalow
CREATE TABLE tarifs (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  prix_nuit_thb INTEGER NOT NULL,
  commission_booking NUMERIC(6,4) DEFAULT 0.8142,
  prix_nuit_net INTEGER GENERATED ALWAYS AS (
    CAST(ROUND(prix_nuit_thb * 0.8142) AS INTEGER)
  ) STORED,
  annulation TEXT,
  modifiable BOOLEAN DEFAULT true
);

-- Produits (gym + F&B)
CREATE TABLE produits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  categorie TEXT NOT NULL,
  sous_categorie TEXT,
  prix_thb INTEGER NOT NULL,
  duree_jours INTEGER DEFAULT 1,
  actif BOOLEAN DEFAULT true,
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 1.2 — Bungalows & Réservations
-- ============================================================

CREATE TABLE bungalows (
  id INTEGER PRIMARY KEY CHECK (id BETWEEN 1 AND 6),
  nom TEXT NOT NULL DEFAULT 'Bungalow',
  statut TEXT DEFAULT 'disponible'
);

INSERT INTO bungalows (id, nom) VALUES
  (1, 'Bungalow 1'), (2, 'Bungalow 2'), (3, 'Bungalow 3'),
  (4, 'Bungalow 4'), (5, 'Bungalow 5'), (6, 'Bungalow 6');

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  email TEXT,
  telephone TEXT,
  nationalite TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bungalow_id INTEGER REFERENCES bungalows(id),
  client_id UUID REFERENCES clients(id),
  client_nom TEXT NOT NULL,
  client_email TEXT,
  client_telephone TEXT,
  date_arrivee DATE NOT NULL,
  date_depart DATE NOT NULL,
  nb_nuits INTEGER GENERATED ALWAYS AS (date_depart - date_arrivee) STORED,
  nb_adultes INTEGER DEFAULT 1,
  nb_enfants INTEGER DEFAULT 0,
  tarif_type TEXT REFERENCES tarifs(id),
  prix_nuit_brut INTEGER,
  prix_nuit_net INTEGER,
  prix_total_brut INTEGER GENERATED ALWAYS AS (
    prix_nuit_brut * (date_depart - date_arrivee)
  ) STORED,
  prix_total_net INTEGER GENERATED ALWAYS AS (
    prix_nuit_net * (date_depart - date_arrivee)
  ) STORED,
  source TEXT DEFAULT 'booking'
    CHECK (source IN ('booking', 'manuel', 'direct', 'telephone', 'walk_in')),
  statut TEXT DEFAULT 'confirme'
    CHECK (statut IN ('confirme', 'no_show', 'checked_out')),
  checkin_fait BOOLEAN DEFAULT false,
  tm30_fait BOOLEAN DEFAULT false,
  clef_remise BOOLEAN DEFAULT false,
  clef_recuperee BOOLEAN DEFAULT false,
  bungalow_inspecte BOOLEAN DEFAULT false,
  checked_out_at TIMESTAMPTZ,
  checked_out_by UUID REFERENCES staff(id),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT no_overlap EXCLUDE USING gist (
    bungalow_id WITH =,
    daterange(date_arrivee, date_depart) WITH &&
  ) WHERE (statut != 'no_show')
);

-- ============================================================
-- 1.3 — Finances & Transactions
-- ============================================================

CREATE TABLE cashbox_journees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  cash_start_thb INTEGER DEFAULT 2000,
  cash_counted_thb INTEGER,
  cash_withdrawn_thb INTEGER DEFAULT 0,
  cash_remaining_thb INTEGER,
  ecart_thb INTEGER DEFAULT 0,
  note_ecart TEXT,
  revenus_total_thb INTEGER DEFAULT 0,
  revenus_gym_thb INTEGER DEFAULT 0,
  revenus_fnb_thb INTEGER DEFAULT 0,
  revenus_resort_thb INTEGER DEFAULT 0,
  depenses_black_box_thb INTEGER DEFAULT 0,
  closing_note TEXT,
  closed BOOLEAN DEFAULT false,
  closed_by UUID REFERENCES staff(id),
  closed_at TIMESTAMPTZ
);

CREATE TABLE changebox_mouvements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT CHECK (type IN ('entree', 'sortie', 'reinjection_caisse')),
  montant_thb INTEGER NOT NULL,
  raison TEXT,
  note TEXT,
  created_by UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  heure TIME DEFAULT CURRENT_TIME,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  business_unit TEXT CHECK (business_unit IN ('gym', 'resort', 'fnb')),
  categorie TEXT NOT NULL,
  montant_thb INTEGER NOT NULL,
  source_fonds TEXT CHECK (source_fonds IN ('black_box', 'change_box', 'cb_scan')),
  saisie_type TEXT DEFAULT 'manuel'
    CHECK (saisie_type IN ('auto_fnb', 'auto_resort', 'auto_gym', 'manuel')),
  reservation_id UUID REFERENCES reservations(id),
  client_id UUID REFERENCES clients(id),
  room_charge_id UUID,
  staff_id UUID REFERENCES staff(id),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE depenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  titre TEXT,
  grande_categorie TEXT CHECK (grande_categorie IN ('gym', 'resort', 'fnb')) NOT NULL,
  categorie TEXT NOT NULL,
  montant_thb INTEGER NOT NULL,
  mode_paiement TEXT CHECK (mode_paiement IN ('black_box', 'change_box', 'cb_scan')) NOT NULL,
  photo_url TEXT,
  admin_only BOOLEAN DEFAULT false,
  auto_generated BOOLEAN DEFAULT false,
  staff_id UUID REFERENCES staff(id),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE depenses_mensuelles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mois TEXT NOT NULL,
  business_unit TEXT CHECK (business_unit IN ('gym', 'resort')),
  categorie TEXT NOT NULL,
  montant_thb INTEGER NOT NULL,
  source_fonds TEXT CHECK (source_fonds IN ('black_box', 'change_box', 'cb_scan')),
  note TEXT,
  created_by UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 1.4 — F&B & Room Charges
-- ============================================================

CREATE TABLE tables_bar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_table TEXT NOT NULL,
  client_nom TEXT,
  type_client TEXT CHECK (type_client IN ('externe', 'gym', 'hotel')),
  reservation_id UUID REFERENCES reservations(id),
  statut TEXT DEFAULT 'ouverte'
    CHECK (statut IN ('ouverte', 'payee')),
  staff_id UUID REFERENCES staff(id),
  opened_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ,
  total_thb INTEGER DEFAULT 0
);

CREATE TABLE table_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES tables_bar(id),
  room_charge_id UUID REFERENCES room_charges(id),
  produit_id UUID REFERENCES produits(id),
  nom TEXT NOT NULL,
  prix_unitaire INTEGER NOT NULL,
  quantite INTEGER DEFAULT 1,
  sous_total INTEGER GENERATED ALWAYS AS (prix_unitaire * quantite) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE room_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES reservations(id) NOT NULL,
  bungalow_id INTEGER REFERENCES bungalows(id),
  table_id UUID REFERENCES tables_bar(id),
  statut TEXT DEFAULT 'en_attente'
    CHECK (statut IN ('en_attente', 'paye')),
  total_thb INTEGER NOT NULL,
  signature_base64 TEXT,
  signed_at TIMESTAMPTZ,
  signed_by TEXT,
  staff_id UUID REFERENCES staff(id),
  date_paiement TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- FK différée sur transactions
ALTER TABLE transactions
  ADD CONSTRAINT fk_room_charge
  FOREIGN KEY (room_charge_id) REFERENCES room_charges(id);

-- ============================================================
-- 1.5 — Gym & Check-ins
-- ============================================================

CREATE TABLE gym_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  client_nom TEXT NOT NULL,
  type_pass TEXT NOT NULL,
  prix_paye INTEGER NOT NULL,
  date_debut DATE NOT NULL DEFAULT CURRENT_DATE,
  date_expiration DATE NOT NULL,
  actif BOOLEAN DEFAULT true,
  upgrade_from UUID REFERENCES gym_passes(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  client_id UUID REFERENCES clients(id),
  client_nom TEXT NOT NULL,
  gym_pass_id UUID REFERENCES gym_passes(id),
  type_entree TEXT CHECK (type_entree IN ('gym_pass', 'hotel_resident')),
  heure_entree TIME DEFAULT CURRENT_TIME,
  reservation_id UUID REFERENCES reservations(id),
  upgrade_effectue JSONB,
  staff_id UUID REFERENCES staff(id)
);

CREATE TABLE serviettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT,
  statut TEXT DEFAULT 'disponible'
    CHECK (statut IN ('disponible', 'en_cours', 'rendue', 'perdue')),
  etat TEXT DEFAULT 'propre'
    CHECK (etat IN ('propre', 'sale', 'en_lavage')),
  client_nom TEXT,
  client_id UUID REFERENCES clients(id),
  depot_thb INTEGER DEFAULT 100,
  emprunt_at TIMESTAMPTZ,
  retour_at TIMESTAMPTZ,
  staff_emprunt UUID REFERENCES staff(id),
  staff_retour UUID REFERENCES staff(id)
);

CREATE TABLE reception_lavage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMPTZ DEFAULT NOW(),
  nb_comptees INTEGER NOT NULL,
  nb_remises_stock INTEGER NOT NULL DEFAULT 0,
  nb_creees INTEGER NOT NULL DEFAULT 0,
  staff_id UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 1.6 — Planning & Présence
-- ============================================================

CREATE TABLE planning_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff(id) NOT NULL,
  date DATE NOT NULL,
  heure_debut TIME NOT NULL,
  heure_fin TIME NOT NULL,
  poste_shift TEXT CHECK (poste_shift IN ('reception', 'bar', 'admin')),
  repas_inclus BOOLEAN DEFAULT false,
  note TEXT,
  publie BOOLEAN DEFAULT false,
  created_by UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (staff_id, date)
);

CREATE TABLE pointages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff(id) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  heure_arrivee TIME,
  heure_depart TIME,
  duree_minutes INTEGER,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE shifts_actifs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff(id) NOT NULL,
  poste TEXT CHECK (poste IN ('reception', 'bar')),
  debut_at TIMESTAMPTZ DEFAULT now(),
  note_transmission TEXT,
  remplace_staff_id UUID REFERENCES staff(id)
);

-- ============================================================
-- 1.7 — Maintenance & Communications
-- ============================================================

CREATE TABLE maintenance_taches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bungalow_id INTEGER REFERENCES bungalows(id),
  titre TEXT NOT NULL,
  description TEXT,
  priorite TEXT DEFAULT 'normale'
    CHECK (priorite IN ('haute', 'normale', 'basse')),
  statut TEXT DEFAULT 'a_faire'
    CHECK (statut IN ('a_faire', 'en_cours', 'fait')),
  created_by UUID REFERENCES staff(id),
  resolved_by UUID REFERENCES staff(id),
  date_creation TIMESTAMPTZ DEFAULT now(),
  date_resolution TIMESTAMPTZ
);

CREATE TABLE messages_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES reservations(id),
  client_nom TEXT,
  telephone TEXT,
  type TEXT CHECK (type IN ('j_moins_2', 'j_plus_3', 'manuel')),
  statut TEXT DEFAULT 'planifie'
    CHECK (statut IN ('planifie', 'envoye', 'repondu')),
  message_contenu TEXT,
  reponse_client TEXT,
  envoye_par UUID REFERENCES staff(id),
  planifie_le TIMESTAMPTZ,
  envoye_le TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE closings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  ca_jour INTEGER NOT NULL,
  cash_compte INTEGER NOT NULL,
  ecart INTEGER DEFAULT 0,
  note_ecart TEXT,
  soumis_par UUID REFERENCES staff(id),
  soumis_at TIMESTAMPTZ DEFAULT now(),
  statut TEXT DEFAULT 'soumis'
    CHECK (statut IN ('soumis', 'valide_admin', 'litige')),
  valide_par UUID REFERENCES staff(id),
  valide_at TIMESTAMPTZ
);

-- ============================================================
-- 1.8 — Vues SQL calculées
-- ============================================================

CREATE VIEW v_revenus_journaliers AS
SELECT
  date,
  business_unit,
  SUM(montant_thb) AS total_thb,
  COUNT(*) AS nb_transactions
FROM transactions
WHERE type = 'income'
GROUP BY date, business_unit;

CREATE VIEW v_depenses_journalieres AS
SELECT
  date,
  grande_categorie,
  SUM(montant_thb) AS total_thb,
  SUM(CASE WHEN mode_paiement = 'black_box' THEN montant_thb ELSE 0 END) AS total_cashbox,
  SUM(CASE WHEN mode_paiement = 'change_box' THEN montant_thb ELSE 0 END) AS total_changebox
FROM depenses
GROUP BY date, grande_categorie;

CREATE VIEW v_daily_report AS
SELECT
  t.date,
  COALESCE(rev.total_thb, 0) AS revenus_thb,
  COALESCE(dep.total_cashbox, 0) AS depenses_cashbox_thb,
  COALESCE(rev.total_thb, 0) - COALESCE(dep.total_cashbox, 0) AS profit_brut_thb,
  cj.cash_start_thb,
  cj.cash_counted_thb,
  cj.cash_withdrawn_thb,
  cj.closed
FROM generate_series(
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE,
  '1 day'::interval
) t(date)
LEFT JOIN (
  SELECT date, SUM(montant_thb) AS total_thb
  FROM transactions WHERE type = 'income' GROUP BY date
) rev ON rev.date = t.date
LEFT JOIN (
  SELECT date,
    SUM(CASE WHEN mode_paiement = 'black_box' THEN montant_thb ELSE 0 END) AS total_cashbox
  FROM depenses GROUP BY date
) dep ON dep.date = t.date
LEFT JOIN cashbox_journees cj ON cj.date = t.date;

CREATE VIEW v_room_charges_attente AS
SELECT
  rc.bungalow_id,
  r.client_nom,
  COUNT(rc.id) AS nb_charges,
  SUM(rc.total_thb) AS total_en_attente
FROM room_charges rc
JOIN reservations r ON r.id = rc.reservation_id
WHERE rc.statut = 'en_attente'
GROUP BY rc.bungalow_id, r.client_nom;

CREATE VIEW v_occupation_mois AS
SELECT
  b.id AS bungalow_id,
  b.nom,
  COUNT(r.id) AS nb_reservations,
  COALESCE(SUM(r.nb_nuits), 0) AS nuits_vendues,
  EXTRACT(DAY FROM DATE_TRUNC('month', CURRENT_DATE)
    + INTERVAL '1 month' - INTERVAL '1 day') AS nuits_disponibles,
  ROUND(
    COALESCE(SUM(r.nb_nuits), 0) * 100.0 /
    EXTRACT(DAY FROM DATE_TRUNC('month', CURRENT_DATE)
      + INTERVAL '1 month' - INTERVAL '1 day'),
    1
  ) AS taux_occupation
FROM bungalows b
LEFT JOIN reservations r ON r.bungalow_id = b.id
  AND EXTRACT(MONTH FROM r.date_arrivee) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND r.statut != 'no_show'
GROUP BY b.id, b.nom;

-- ============================================================
-- 1.9 — RLS (Row Level Security)
-- ============================================================

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarifs ENABLE ROW LEVEL SECURITY;
ALTER TABLE produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE bungalows ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashbox_journees ENABLE ROW LEVEL SECURITY;
ALTER TABLE changebox_mouvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE depenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE depenses_mensuelles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables_bar ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE serviettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reception_lavage ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pointages ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts_actifs ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_taches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE closings ENABLE ROW LEVEL SECURITY;

-- Politique lecture : tous les rôles authentifiés voient tout
CREATE POLICY "Authenticated read all" ON staff FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON message_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON tarifs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON produits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON bungalows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON reservations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON cashbox_journees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON changebox_mouvements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON depenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON depenses_mensuelles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON tables_bar FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON table_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON room_charges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON gym_passes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON checkins FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON serviettes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON reception_lavage FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON planning_shifts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON pointages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON shifts_actifs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON maintenance_taches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON messages_clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON closings FOR SELECT TO authenticated USING (true);

-- Politique écriture : authenticated peut insérer/modifier sur la plupart des tables
CREATE POLICY "Authenticated write all" ON staff FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON message_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON tarifs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON produits FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON bungalows FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON reservations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON cashbox_journees FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON changebox_mouvements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON depenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON tables_bar FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON table_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON room_charges FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON gym_passes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON checkins FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON serviettes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON reception_lavage FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON planning_shifts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON pointages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON shifts_actifs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON maintenance_taches FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON messages_clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated write all" ON closings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Politique spéciale : dépenses mensuelles admin only
CREATE POLICY "Admin only monthly expenses" ON depenses_mensuelles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE id = auth.uid()::uuid AND poste = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE id = auth.uid()::uuid AND poste = 'admin'
    )
  );
