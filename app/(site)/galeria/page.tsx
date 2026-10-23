import type { Metadata } from "next";
import GaleriaClient from "../../components/GaleriaClient";
import { getGaleriaAlbumok } from "../../lib/sanity/tartalom";

export const metadata: Metadata = {
  title: "Galéria — Vasas Kubala Akadémia",
};

export const revalidate = 300;

export default async function GaleriaPage({
  searchParams,
}: {
  searchParams: { kategoria?: string; album?: string };
}) {
  const albumok = await getGaleriaAlbumok();
  return <GaleriaClient albumok={albumok} kategoria={searchParams.kategoria} albumId={searchParams.album} />;
}
