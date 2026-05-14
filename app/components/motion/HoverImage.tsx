"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image, { type ImageProps } from "next/image";

interface HoverImageProps extends Omit<ImageProps, "alt"> {
  alt: string;
  containerClassName?: string;
  zoom?: number;
  overlay?: boolean;
}

export default function HoverImage({
  containerClassName,
  zoom = 1.08,
  overlay = false,
  ...imageProps
}: HoverImageProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={containerClassName}
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      <motion.div
        variants={{
          rest: { scale: 1 },
          hover: reduced ? { scale: 1 } : { scale: zoom },
        }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
      >
        <Image {...imageProps} alt={imageProps.alt} fill={imageProps.fill} />
      </motion.div>
      {overlay && (
        <motion.div
          variants={{
            rest: { opacity: 0 },
            hover: { opacity: 1 },
          }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent pointer-events-none"
        />
      )}
    </motion.div>
  );
}
