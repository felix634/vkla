import type { Metadata } from "next";
import GaleriaClient from "../../components/GaleriaClient";
import { getGaleriaAlbum, getGaleriaAlbumok } from "../../lib/sanity/tartalom";

export const metadata: Metadata = {
  title: "Galéria – Vasas Kubala Akadémia",
};

export const revalidate = 300;

export default async function GaleriaPage({
  searchParams,
}: {
  searchParams: { kategoria?: string; album?: string };
}) {
  const [albumok, album] = await Promise.all([
    getGaleriaAlbumok(),
    searchParams.album ? getGaleriaAlbum(searchParams.album) : null,
  ]);
  return <GaleriaClient albumok={albumok} album={album} kategoria={searchParams.kategoria} />;
}
