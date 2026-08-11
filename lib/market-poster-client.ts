"use client";

import {
  MARKET_POSTER_ALLOWED_TYPES,
  MARKET_POSTER_EXTENSION_TYPES,
  MAX_MARKET_POSTER_BYTES,
  posterSizeLabel,
} from "@/lib/market-poster-limits";

const ALLOWED_TYPES = new Set<string>(MARKET_POSTER_ALLOWED_TYPES);

function extensionFromName(name: string): string | null {
  const match = name.trim().toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? null;
}

function resolveContentType(file: File): string | null {
  if (file.type && ALLOWED_TYPES.has(file.type)) {
    return file.type;
  }
  const ext = extensionFromName(file.name);
  if (!ext) return null;
  return MARKET_POSTER_EXTENSION_TYPES[ext] ?? null;
}

export function validatePosterFileClient(file: File): string | null {
  const contentType = resolveContentType(file);
  if (!contentType) {
    return `Use a JPG, PNG, WebP, or GIF image (${posterSizeLabel()} max). iPhone HEIC photos are not supported — export as JPEG first.`;
  }
  return null;
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image."));
    };
    img.src = url;
  });
}

async function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality);
  });
  if (!blob) throw new Error("Could not compress image.");
  return blob;
}

async function compressPosterImage(file: File): Promise<File> {
  const image = await loadImageElement(file);
  const maxDim = 2200;
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > maxDim || height > maxDim) {
    const scale = maxDim / Math.max(width, height);
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not process image.");
  }

  ctx.drawImage(image, 0, 0, width, height);

  let quality = 0.88;
  let blob = await canvasToJpegBlob(canvas, quality);
  while (blob.size > MAX_MARKET_POSTER_BYTES && quality > 0.45) {
    quality -= 0.08;
    blob = await canvasToJpegBlob(canvas, quality);
  }

  if (blob.size > MAX_MARKET_POSTER_BYTES) {
    throw new Error(`Image is still too large after compression. Use a smaller photo (${posterSizeLabel()} max).`);
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "poster";
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}

/** Validates type and compresses large photos before upload. */
export async function preparePosterForUpload(file: File): Promise<File> {
  const validationError = validatePosterFileClient(file);
  if (validationError) {
    throw new Error(validationError);
  }

  if (file.size <= MAX_MARKET_POSTER_BYTES) {
    return file;
  }

  if (file.type === "image/gif") {
    throw new Error(`GIF must be ${posterSizeLabel()} or smaller.`);
  }

  return compressPosterImage(file);
}
