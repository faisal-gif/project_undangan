import { Html5Qrcode } from "html5-qrcode";
import React, { useEffect, useState } from "react";

function QrCode({ onScanSuccess }) {
  const [cameras, setCameras] = useState([]);
  const [currentCamera, setCurrentCamera] = useState(null);
  const [qrCodeScanner, setQrCodeScanner] = useState(null);

  useEffect(() => {
    // ambil daftar kamera
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
          setCurrentCamera(devices[0].id); // default kamera pertama
        }
      })
      .catch((err) => console.error("Camera access error:", err));

    return () => {
      if (qrCodeScanner) {
        qrCodeScanner.stop().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (!currentCamera) return;

    const scannerId = "qr-reader";
    const scanner = new Html5Qrcode(scannerId);

    let isScanning = true;

    scanner
      .start(
        currentCamera,
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          if (!isScanning) return;
          isScanning = false;

          scanner
            .stop()
            .then(() => {
              onScanSuccess(decodedText);
            })
            .catch((err) => {
              console.warn("Stop error:", err);
              onScanSuccess(decodedText);
            });
        },
        () => {}
      )
      .catch((err) => console.error("Start camera failed:", err));

    setQrCodeScanner(scanner);

    return () => {
      isScanning = false;
      scanner.stop().catch(() => {});
    };
  }, [currentCamera]);

  return (
    <div className="space-y-2">
      {/* Dropdown untuk pilih kamera */}
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
