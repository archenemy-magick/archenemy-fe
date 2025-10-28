"use client";

import { useEffect, useRef } from "react";
import { Box } from "@mantine/core";

interface GoogleAdProps {
  slot: string;
  format?: "auto" | "rectangle" | "vertical" | "horizontal" | "fluid";
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function GoogleAd({
  slot,
  format = "auto",
  responsive = true,
  style,
  className,
}: GoogleAdProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      if (adRef.current && typeof window !== "undefined") {
        ((window as Window).adsbygoogle =
          (window as Window).adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  return (
    <Box className={className} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </Box>
  );
}
