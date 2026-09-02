import type { Metadata } from "next";
import GaleriaClient from "../../components/GaleriaClient";
import { getGaleriaAlbumok, getVideok } from "../../lib/sanity/tartalom";

export const metadata: Metadata = {
  title: "Galéria — Vasas Kubala Akadémia",
};

export const revalidate = 300;

export default async function GaleriaPage() {
  const [albumok, videok] = await Promise.all([getGaleriaAlbumok(), getVideok()]);
  return <GaleriaClient albumok={albumok} videok={videok} />;
}
