-- Szülői fiók + képzési díj számlák (Neon Postgres).
-- Idempotens: többször is lefuttatható (scripts/db-migrate.mjs).
--
-- A szülői fiókot az e-mail-cím azonosítja: az a szülő látja a számlát,
-- akinek az e-mail-címére a pénzügy kiállította. Külön regisztráció nincs —
-- az első belépés maga a regisztráció (jelszó nélküli, e-mailes linkkel).

CREATE TABLE IF NOT EXISTS szamla (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  szamlaszam    text NOT NULL UNIQUE,
  email         text NOT NULL,              -- kisbetűsítve; ez köti a szülői fiókhoz
  vevo_nev      text,
  gyermek_nev   text,
  korosztaly    text,
  idoszak       text,                       -- "2026-10" (vagy szabad szöveg)
  osszeg        integer NOT NULL,           -- Ft
  kelt          date,
  hatarido      date,
  pdf_pathname  text NOT NULL,              -- privát Vercel Blob
  fizetve_at    timestamptz,
  ertesitve_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS szamla_email_idx ON szamla (email);

-- Egyszer használatos belépési linkek (csak a token hash-e tárolódik).
CREATE TABLE IF NOT EXISTS belepo_token (
  token_hash    text PRIMARY KEY,
  email         text NOT NULL,
  lejar         timestamptz NOT NULL,
  felhasznalva  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS belepo_token_email_idx ON belepo_token (email, created_at);

-- Munkamenetek (a sütiben csak a véletlen azonosító van, itt a hash-e).
CREATE TABLE IF NOT EXISTS munkamenet (
  id_hash       text PRIMARY KEY,
  email         text NOT NULL,
  lejar         timestamptz NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);
