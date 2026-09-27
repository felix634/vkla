-- Szülői fiók + képzési díj számlák (Neon Postgres).
-- Idempotens: többször is lefuttatható (scripts/db-migrate.mjs).
--
-- A számla a GYERMEKHEZ tartozik (a Nagy Machinátorban a vevő a gyermek).
-- A pénzügy vezeti a családi névjegyzéket: melyik gyermekhez melyik szülői
-- e-mail-cím(ek) tartoznak. Egy szülő azokat a gyermekeket és számlákat
-- látja, amelyekhez a névjegyzékben az ő e-mail-címe szerepel — így mindkét
-- szülő saját fiókkal láthatja ugyanannak a gyermeknek a számláit.

-- Szülői fiókok (e-mail + jelszó). A jelszót a szülő mindig az e-mailben
-- kapott linken állítja be, így csak a postafiók tulajdonosa hozhat létre fiókot.
CREATE TABLE IF NOT EXISTS szulo (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email              text NOT NULL UNIQUE,     -- kisbetűsítve
  nev                text,
  jelszo_hash        text,                     -- NULL, amíg a jelszó nincs beállítva
  megerositve_at     timestamptz,
  hibas_probalkozas  integer NOT NULL DEFAULT 0,
  zarolva_eddig      timestamptz,
  utolso_belepes     timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- Egyszer használatos jelszó-beállító linkek (regisztráció és elfelejtett
-- jelszó); csak a token hash-e tárolódik.
CREATE TABLE IF NOT EXISTS fiok_token (
  token_hash    text PRIMARY KEY,
  email         text NOT NULL,
  lejar         timestamptz NOT NULL,
  felhasznalva  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS fiok_token_email_idx ON fiok_token (email, created_at);

-- Családi névjegyzék
CREATE TABLE IF NOT EXISTS gyermek (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nev         text NOT NULL,
  korosztaly  text,
  vevokod     text UNIQUE,                     -- Machinátor-azonosító, ha van
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS gyermek_nev_idx ON gyermek (lower(nev));

CREATE TABLE IF NOT EXISTS gyermek_email (
  gyermek_id  uuid NOT NULL REFERENCES gyermek(id) ON DELETE CASCADE,
  email       text NOT NULL,                   -- kisbetűsítve
  PRIMARY KEY (gyermek_id, email)
);
CREATE INDEX IF NOT EXISTS gyermek_email_email_idx ON gyermek_email (email);

-- Számlák
CREATE TABLE IF NOT EXISTS szamla (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  szamlaszam    text NOT NULL UNIQUE,
  gyermek_id    uuid NOT NULL REFERENCES gyermek(id) ON DELETE RESTRICT,
  gyermek_nev   text,                          -- a feltöltéskori név (megjelenítéshez)
  korosztaly    text,
  idoszak       text,                          -- "2026-10" (vagy szabad szöveg)
  osszeg        integer NOT NULL,              -- Ft
  kelt          date,
  hatarido      date,
  pdf_pathname  text NOT NULL,                 -- privát Vercel Blob
  fizetve_at    timestamptz,
  ertesitve_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);
-- Átállás az első (e-mail-alapú) változatról: a számla már a gyermekhez kötődik.
ALTER TABLE szamla ADD COLUMN IF NOT EXISTS gyermek_id uuid REFERENCES gyermek(id) ON DELETE RESTRICT;
ALTER TABLE szamla DROP COLUMN IF EXISTS email;
ALTER TABLE szamla DROP COLUMN IF EXISTS vevo_nev;
ALTER TABLE szamla ALTER COLUMN gyermek_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS szamla_gyermek_idx ON szamla (gyermek_id);

-- Munkamenetek (a sütiben csak a véletlen azonosító van, itt a hash-e).
CREATE TABLE IF NOT EXISTS munkamenet (
  id_hash       text PRIMARY KEY,
  email         text NOT NULL,
  lejar         timestamptz NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS munkamenet_email_idx ON munkamenet (email);

-- Az első változat e-mailes belépő linkjei — jelszavas belépésre álltunk át.
DROP TABLE IF EXISTS belepo_token;
