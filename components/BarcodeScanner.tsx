"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";
import { X } from "lucide-react";

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const detectedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    detectedRef.current = false;

    const start = async () => {
      try {
        setError(null);

        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        const backCamera =
          devices.find((d) =>
            /back|rear|environment/i.test(d.label)
          ) ?? devices[0];

        if (!backCamera) {
          setError("لم يتم العثور على كاميرا");
          return;
        }

        await codeReader.decodeFromVideoDevice(
          backCamera.deviceId,
          videoRef.current!,
          (result, err) => {
            if (result && !detectedRef.current) {
              detectedRef.current = true;
              BrowserMultiFormatReader.releaseAllStreams();
              onDetected(result.getText());
            }
            if (err && !(err instanceof NotFoundException)) {
              console.error("Scanner error:", err);
            }
          },
        );
      } catch (e) {
        const name = e instanceof Error ? e.name : "";
        setError(
          name === "NotAllowedError"
            ? "يرجى السماح بالوصول إلى الكاميرا"
            : "تعذّر تشغيل الكاميرا"
        );
      }
    };

    start();

    return () => {
      BrowserMultiFormatReader.releaseAllStreams();
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm">
      <button
        onClick={onClose}
        className="absolute top-5 left-5 rounded-full bg-white/15 p-2.5 text-white hover:bg-white/25 transition-colors"
        aria-label="إغلاق الماسح"
      >
        <X className="h-5 w-5" />
      </button>

      <p className="mb-5 text-sm font-medium text-white/80">
        وجّه الكاميرا نحو الباركود
      </p>

      <div className="relative w-[min(90vw,360px)] overflow-hidden rounded-2xl border-2 border-brand-400 shadow-2xl">
        <video
          ref={videoRef}
          className="h-56 w-full object-cover"
          autoPlay
          muted
          playsInline
        />
        <div className="pointer-events-none absolute inset-0">
          <span className="absolute top-3 left-3 h-6 w-6 border-t-2 border-l-2 border-brand-400 rounded-tl" />
          <span className="absolute top-3 right-3 h-6 w-6 border-t-2 border-r-2 border-brand-400 rounded-tr" />
          <span className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-brand-400 rounded-bl" />
          <span className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-brand-400 rounded-br" />
          <div className="absolute inset-x-6 top-1/2 h-px -translate-y-1/2 bg-brand-400/70 animate-pulse" />
        </div>
      </div>

      {error && (
        <p className="mt-5 rounded-xl bg-red-500/80 px-5 py-2.5 text-sm text-white">
          {error}
        </p>
      )}

      <button
        onClick={onClose}
        className="mt-6 rounded-xl border border-white/25 px-6 py-2.5 text-sm text-white/80 hover:bg-white/10 transition-colors"
      >
        إلغاء
      </button>
    </div>
  );
}