import { useEffect, useState } from "react";
import { set, unset, useClient, type StringInputProps } from "sanity";
import { Select } from "@sanity/ui";

// A heti edzésrend korosztály-választója: a Csapatok között felvett
// korosztályokat kínálja, azok sorrendjében — így egy új korosztály (pl. U20)
// a Csapatok közé felvéve itt is azonnal választható.
export default function KorosztalyValasztoInput(props: StringInputProps) {
  const client = useClient({ apiVersion: "2024-01-01" });
  const [nevek, setNevek] = useState<string[]>([]);

  useEffect(() => {
    client
      .fetch<string[]>(`*[_type == "korosztaly" && defined(name) && !(_id in path("drafts.**"))] | order(order asc).name`)
      .then((lista) => setNevek(lista ?? []))
      .catch(() => {});
  }, [client]);

  const value = props.value ?? "";

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
      <option value="">Válassz korosztályt…</option>
      {nevek.map((n) => (
        <option key={n} value={n}>
          {n}
        </option>
      ))}
      {value && !nevek.includes(value) && <option value={value}>{value}</option>}
    </Select>
  );
}
