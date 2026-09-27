import type { Metadata } from "next";
import FiokOldal from "../../components/fiok/FiokOldal";
import ElfelejtettForm from "../../components/fiok/ElfelejtettForm";
import { emailEnabled } from "../../lib/email";
import { fiokEnabled } from "../../lib/fiok/db";

export const metadata: Metadata = {
  title: "Elfelejtett jelszó — Szülői fiók — Vasas Kubala Akadémia",
  robots: { index: false },
};

export default function ElfelejtettJelszoPage() {
  return (
    <FiokOldal
      cim="Elfelejtett jelszó"
      alcim="Add meg a fiókodhoz tartozó e-mail-címet, és küldünk egy linket, amellyel új jelszót állíthatsz be."
    >
      <ElfelejtettForm enabled={fiokEnabled && emailEnabled} />
    </FiokOldal>
  );
}
