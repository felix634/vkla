import { useEffect, useState } from "react";
import { set, unset, useClient, type StringInputProps } from "sanity";
import { Select } from "@sanity/ui";
import { HIR_FO_KATEGORIAK, HIR_KOROSZTALYOK_ALAP, type HirKorosztaly } from "../constants";

// A hír Kategória-választója. A fő kategóriák fixek, a korosztályok az Oldal
// beállítások „Hírek — korosztály-szűrő” listájából jönnek — így egy ott
// felvett új korosztály (pl. U20) itt is azonnal választható.
export default function HirKategoriaInput(props: StringInputProps) {
  const client = useClient({ apiVersion: "2024-01-01" });
  const [korosztalyok, setKorosztalyok] = useState<HirKorosztaly[]>(HIR_KOROSZTALYOK_ALAP);

  useEffect(() => {
    client
      .fetch<HirKorosztaly[] | null>(`*[_id == "beallitasok"][0].hirKorosztalyok[]{ kod, nev }`)
      .then((lista) => {
        if (lista && lista.length > 0) setKorosztalyok(lista.filter((k) => k.kod));
      })
      .catch(() => {});
  }, [client]);

  const value = props.value ?? "";
  const ismert = new Set<string>([...HIR_FO_KATEGORIAK, ...korosztalyok.map((k) => k.kod)]);

  return (
    <Select
      id={props.elementProps.id}
      ref={props.elementProps.ref as React.Ref<HTMLSelectElement>}
      onBlur={props.elementProps.onBlur}
      onFocus={props.elementProps.onFocus}
      disabled={props.readOnly}
      value={value}
      onChange={(e) => {
        const v = e.currentTarget.value;
        props.onChange(v ? set(v) : unset());
      }}
    >
      <option value="">Válassz kategóriát…</option>
      <optgroup label="Fő kategóriák">
        {HIR_FO_KATEGORIAK.map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </optgroup>
      <optgroup label="Korosztályok">
        {korosztalyok.map((k) => (
          <option key={k.kod} value={k.kod}>
            {k.nev ? `${k.nev} (${k.kod})` : k.kod}
          </option>
        ))}
      </optgroup>
      {/* A régi oldalról átjött, ma már nem használt kategória is megmaradjon. */}
      {value && !ismert.has(value) && <option value={value}>{value} (régi kategória)</option>}
    </Select>
  );
}
