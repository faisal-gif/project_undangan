import { Html5Qrcode } from "html5-qrcode";
import React, { useEffect, useRef, useState } from "react";

function QrCode({ onScanSuccess }) {
  const [cameras, setCameras] = useState([]);
  const [currentCamera, setCurrentCamera] = useState(null);
  const scannerRef = useRef(null);      // simpan instance scanner
  const scanningRef = useRef(false);    // cegah double-scan

  /**
   * AMBIL LIST KAMERA
   */
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices.length > 0) {
          setCameras(devices);
          setCurrentCamera(devices[0].id);
        }
      })
      .catch((err) => console.error("Camera access error:", err));

    return () => {
      stopScanner();
    };
  }, []);

  /**
   * FUNGSI STOP SCANNER AMAN
   */
  const stopScanner = async () => {
    scanningRef.current = false;

    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {}
      scannerRef.current = null;
    }
  };

  /**
   * START SCANNER SAAT currentCamera BERUBAH
   */
  useEffect(() => {
    if (!currentCamera) return;

    const scannerId = "qr-reader";
    const scanner = new Html5Qrcode(scannerId);

    scannerRef.current = scanner;
    scanningRef.current = true;

    scanner
      .start(
        currentCamera,
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          if (!scanningRef.current) return;

          scanningRef.current = false;

          stopScanner().then(() => {
            onScanSuccess(decodedText);
          });
        }
      )
      .catch((err) => {
        console.error("Start camera failed:", err);
      });

    return () => {
      stopScanner();
    };
  }, [currentCamera]);

  return (
    <div className="space-y-2">
      {/* Kamera Selector */}
      {cameras.length > 1 && (
        <select
          className="select select-bordered w-full max-w-xs"
          value={currentCamera || ""}
          onChange={(e) => setCurrentCamera(e.target.value)}
        >
          {cameras.map((cam) => (
            <option key={cam.id} value={cam.id}>
              {cam.label || `Camera ${cam.id}`}
            </option>
          ))}
        </select>
      )}

      <div
        id="qr-reader"
        className="w-full max-w-md mx-auto border border-gray-300 rounded-md"
      ></div>
    </div>
  );
}

export default QrCode;
