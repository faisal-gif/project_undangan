import { Html5Qrcode } from 'html5-qrcode';
import React, { useEffect, useState, useRef } from 'react';
import { Camera } from 'lucide-react'; // icon kamera

function QrCode({ onScanSuccess }) {
  const [cameras, setCameras] = useState([]);
  const [selectedCameraIndex, setSelectedCameraIndex] = useState(0);
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then(devices => {
        if (devices && devices.length) {
          setCameras(devices);
          setSelectedCameraIndex(0); // default kamera pertama
          startScanner(devices[0].id);
        }
      })
      .catch(err => {
        console.error('Camera access error:', err);
      });

    return () => stopScanner();
  }, []);

  const startScanner = cameraId => {
    const scannerId = 'qr-reader';

    // Hentikan scanner sebelumnya jika ada
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
    }

    const scanner = new Html5Qrcode(scannerId);

    scanner
      .start(
        cameraId,
        { fps: 10, qrbox: 250 },
        decodedText => {
          setIsScanning(false);
          scanner.stop().then(() => onScanSuccess(decodedText));
        },
        () => {}
      )
      .then(() => {
        scannerRef.current = scanner;
        setIsScanning(true);
      })
      .catch(err => {
        console.error('Start camera failed:', err);
      });
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => setIsScanning(false));
    }
  };

  const switchCamera = () => {
    if (cameras.length > 1) {
      const nextIndex = (selectedCameraIndex + 1) % cameras.length;
      setSelectedCameraIndex(nextIndex);
      startScanner(cameras[nextIndex].id);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative">
      {/* Scanner area */}
      <div id="qr-reader" className="border border-gray-300 rounded-md overflow-hidden"></div>

      {/* Tombol ganti kamera (floating button) */}
      {cameras.length > 1 && isScanning && (
        <button
          onClick={switchCamera}
          className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition"
          title="Ganti Kamera"
        >
          <Camera size={20} />
        </button>
      )}
    </div>
  );
}

export default QrCode;
