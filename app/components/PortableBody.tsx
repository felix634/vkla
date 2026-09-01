import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import YouTubeEmbed from "./YouTubeEmbed";
import { sized } from "../lib/sanity/imageUrl";

function instagramEmbedUrl(url: string): string | null {
  const m = url.match(/instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
  if (!m) return null;
  return `https://www.instagram.com/${m[1]}/${m[2]}/embed`;
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-navy/80 leading-relaxed mb-5 text-justify hyphens-auto">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="font-display font-bold text-2xl md:text-3xl text-navy mt-10 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-display font-bold text-xl md:text-2xl text-navy mt-8 mb-3">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gold pl-5 my-6 font-display italic text-xl text-navy/85">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 mb-5 space-y-1.5 text-navy/80">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 mb-5 space-y-1.5 text-navy/80">{children}</ol>
    ),
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-royal font-semibold underline decoration-royal/30 hover:decoration-royal transition"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => {
      const url: string | undefined = value?.url ?? value?.asset?.url;
      if (!url) return null;
      return (
        <figure className="my-8">
          <div className="relative w-full rounded-md overflow-hidden bg-navy/5">
            {/* A cikk-képek eredeti aránnyal jelennek meg */}
            <Image
              src={sized(url, 1400)!}
              alt={value?.alt ?? ""}
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          </div>
          {value?.caption && (
            <figcaption className="text-xs text-navy/50 mt-2 text-center">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    youtube: ({ value }) => (value?.url ? <YouTubeEmbed url={value.url} /> : null),
    instagram: ({ value }) => {
      const src = value?.url ? instagramEmbedUrl(value.url) : null;
      if (!src) return null;
      return (
        <div className="my-8 flex justify-center">
          <iframe
            src={src}
            title="Instagram poszt"
            className="w-full max-w-[540px] rounded-md border border-gray-100 bg-white"
            height={620}
            loading="lazy"
          />
        </div>
      );
    },
  },
};

export default function PortableBody({ value }: { value: unknown[] }) {
  return <PortableText value={value as never} components={components} />;
}
