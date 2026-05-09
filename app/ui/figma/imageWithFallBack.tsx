"use client";
import React, { useMemo, useState } from "react";
import { Image, ImageKitProvider } from "@imagekit/next";
import { API_BASE_URL } from "@/server/server";

const ERROR_IMG_SRC =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==";

export function ImageWithFallback(
  props: React.ImgHTMLAttributes<HTMLImageElement>,
) {
  const [didError, setDidError] = useState(false);

  const handleError = () => {
    setDidError(true);
  };

  const { src, alt, style, className, width, height, ...rest } = props;

  const numericWidth = useMemo(() => {
    if (typeof width === "number") return width;
    if (typeof width === "string") {
      const parsed = Number(width);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  }, [width]);

  const numericHeight = useMemo(() => {
    if (typeof height === "number") return height;
    if (typeof height === "string") {
      const parsed = Number(height);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  }, [height]);

  const optimizedSrc =
    typeof src === "string" && src.startsWith("//") ? `https:${src}` : src;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? API_BASE_URL;

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ""}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img
          src={ERROR_IMG_SRC}
          alt="Error loading image"
          {...rest}
          data-original-url={src}
        />
      </div>
    </div>
  ) : (
    <ImageKitProvider urlEndpoint={urlEndpoint}>
      <Image
        src={(optimizedSrc as string) || ERROR_IMG_SRC}
        alt={alt || "image"}
        className={className}
        style={style}
        width={numericWidth ?? 1200}
        height={numericHeight ?? 900}
        sizes={(rest as { sizes?: string }).sizes ?? "100vw"}
        loading={(rest as { loading?: "eager" | "lazy" | undefined }).loading ?? "lazy"}
        onError={handleError}
        {...rest}
      />
    </ImageKitProvider>
  );
}
