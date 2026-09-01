"use client";

import { useState } from "react";

function videoId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  return m ? m[1] : null;
}

// Kattintásra töltődő YouTube-lejátszó: amíg nem indítják el, csak egy
// előnézeti kép látszik — így a cikkoldal gyors marad, és külső script
// sem töltődik feleslegesen.
export default function YouTubeEmbed({ url }: { url: string }) {
  const [playing, setPlaying] = useState(false);
  const id = videoId(url);
  if (!id) return null;

  return (
    <div className="relative aspect-video rounded-md overflow-hidden bg-navy my-8">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
          title="YouTube videó"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 w-full"
          aria-label="Videó lejátszása"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt="Videó előnézet"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="h-16 w-16 rounded-full bg-vasasRed/90 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <polygon points="6 4 20 12 6 20 6 4" />
              </svg>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
