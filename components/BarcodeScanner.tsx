"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";
import { X, Camera } from "lucide-react";

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    readerRef.current = codeReader;

    const start = async () => {
      try {
        setScanning(true);
        setError(null);

        // Get available cameras — prefer back camera on mobile
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        const backCamera =
          devices.find(
            (d) =>
              d.label.toLowerCase().includes("back") ||
              d.label.toLowerCase().includes("rear") ||
              d.label.toLowerCase().includes("environment"),
          ) ?? devices[0];

        if (!backCamera) {
          setError("لم يتم العثور على كاميرا");
          return;
        }

        await codeReader.decodeFromVideoDevice(
          backCamera.deviceId,
          videoRef.current!,
          (result, err) => {
            if (result) {
              onDetected(result.getText());
            }
            if (err && !(err instanceof NotFoundException)) {
              console.error("Scanner error:", err);
            }
          },
        );
      } catch (e: any) {
        if (e?.name === "NotAllowedError") {
          setError("يرجى السماح بالوصول إلى الكاميرا");
        } else {
          setError("تعذّر تشغيل الكاميرا");
        }
      }
    };

    start();

    return () => {
      // Clean up stream on unmount
      BrowserMultiFormatReader.releaseAllStreams();
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
      >
        <X className="h-5 w-5" />
      </button>

      <p className="mb-4 text-sm text-white">وجّه الكاميرا نحو الباركود</p>

      <div className="relative w-full max-w-sm overflow-hidden rounded-xl border-2 border-brand-400">
        <video
          ref={videoRef}
          className="h-64 w-full object-cover"
          autoPlay
          muted
          playsInline // critical for iOS Safari
        />
        {/* Scan-line overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-px w-3/4 animate-ping bg-brand-400 opacity-75" />
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-500/80 px-4 py-2 text-sm text-white">
          {error}
        </p>
      )}

      <button
        onClick={onClose}
        className="mt-6 rounded-lg border border-white/40 px-4 py-2 text-sm text-white hover:bg-white/10"
      >
        إلغاء
      </button>
    </div>
  );
}
