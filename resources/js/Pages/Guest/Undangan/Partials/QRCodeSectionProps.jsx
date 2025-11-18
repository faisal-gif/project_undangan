import { useState } from "react";

import { Download, QrCode, Ticket } from "lucide-react";
import { toast } from "sonner";
import Card from "@/Components/Card";

export const QRCodeSection = ({ guestName,guestId,qr_code }) => {
  

  const qrData = JSON.stringify({
    eventId: "ANUGERAH-TIMES-INDONESIA-2025",
    guestName,
    guestId,
    eventDate: "2025-11-27",
    eventTime: "18:00",
    venue: "Grand Mercure Malang Mirama"
  });

  const qrUrl = `/storage/${qr_code}`;

  const downloadQRCode = async () => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = qrUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 500;

      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw QR
      ctx.drawImage(img, 50, 80, 300, 300);

      // Text
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 20px Inter";
      ctx.textAlign = "center";
      ctx.fillText("E-Ticket", 200, 40);

      ctx.font = "16px Inter";
      ctx.fillText("Anugerah Times Indonesia 2025", 200, 65);

      ctx.font = "14px Inter";
      ctx.fillText(guestName, 200, 410);

      ctx.font = "12px Inter";
      ctx.fillStyle = "#64748b";
      ctx.fillText(guestId, 200, 430);
      ctx.fillText("27 November 2025 - 18:00 WIB", 200, 450);

      const link = document.createElement("a");
      link.download = `e-ticket-${guestName.replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast.success("E-Ticket berhasil diunduh!");
    };
  };

  return (
    <section className="py-16 md:py-24 px-4 bg-gradient-burgundy text-white">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Ticket className="h-12 w-12 text-amber-400" />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl mb-4">E-Ticket Anda</h2>
          <div className="w-24 h-1 bg-amber-400 mx-auto mb-6" />
          <p className="text-white/70 max-w-2xl mx-auto">
            Silakan simpan atau unduh QR code ini. Tunjukkan pada saat registrasi.
          </p>
        </div>

        <Card className="p-8 md:p-12 bg-white text-black/60 shadow-2xl max-w-md mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">E-Ticket</h3>
            <p className="text-sm text-muted-foreground">Anugerah Times Indonesia 2025</p>
          </div>

          <div className="bg-base-100/30 p-6 rounded-lg mb-6">
            <div className="flex justify-center mb-4">
              <img
                src={qrUrl}
                alt="qr-code"
                width={256}
                height={256}
                className="rounded"
              />
            </div>

            <div className="text-center">
              <p className="text-lg font-semibold mb-1">{guestName}</p>
              <p className="text-xs text-muted-foreground font-mono mb-3">{guestId}</p>
              <div className="border-t pt-3">
                <p className="text-sm text-muted-foreground">Kamis, 27 November 2025</p>
                <p className="text-sm text-muted-foreground">18:00 WIB</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Grand Mercure Malang Mirama
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={downloadQRCode}
              className="w-full bg-amber-400 hover:bg-amber-500 text-primary font-semibold py-3 rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Download className="h-5 w-5" />
              Unduh E-Ticket
            </button>

            <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-4">
              <div className="flex gap-3">
                <QrCode className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Petunjuk Penggunaan:</p>
                  <ul className="text-muted-foreground space-y-1 text-xs">
                    <li>• Unduh dan simpan QR code ini</li>
                    <li>• Tunjukkan saat registrasi</li>
                    <li>• Datang 30 menit sebelum acara</li>
                    <li>• Dress code: Black Tie</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="text-center mt-8 text-white/60 text-sm">
          <p>Jika ada pertanyaan, hubungi panitia:</p>
          <p className="text-gold">redaksi@timesindonesia.co.id | +62 812-3456-7890</p>
        </div>
      </div>
    </section>
  );
};
