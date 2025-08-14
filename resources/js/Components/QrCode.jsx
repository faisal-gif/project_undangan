
import { Html5Qrcode } from 'html5-qrcode';
import React, { useEffect } from 'react'

function QrCode({ onScanSuccess }) {
    useEffect(() => {

        const scannerId = "qr-reader";
        const qrCodeScanner = new Html5Qrcode(scannerId);
        let isScanning = false;

        Html5Qrcode.getCameras().then(cameras => {
            if (cameras && cameras.length) {
                const cameraId = cameras[1].id;
                qrCodeScanner.start(
                    cameraId,
                    {
                        fps: 10,
                        qrbox: 250,
                    },
                    (decodedText) => {
                        if (!isScanning) return; // sudah dihentikan
                        isScanning = false;

                        qrCodeScanner.stop()
                            .then(() => {
                                onScanSuccess(decodedText);
                            })
                            .catch((err) => {
                                console.warn("Stop error:", err);
                                onScanSuccess(decodedText); // tetap lanjut
                            });
                    },
                    (errorMessage) => {
                        // bisa di-log kalau perlu
                    }
                ).then(() => {
                    isScanning = true;
                }).catch(err => {
                    console.error("Start camera failed:", err);
                });
            } else {
                console.error("No cameras found.");
            }
        }).catch(err => {
            console.error("Camera access error:", err);
        });

        return () => {
            if (isScanning) {
                qrCodeScanner.stop().catch(() => { });
            }
        };

    }, []);

    return (
        <div>
            <div id="qr-reader" className="w-full max-w-md mx-auto border border-gray-300 rounded-md"></div>
        </div>
    )
}

export default QrCode