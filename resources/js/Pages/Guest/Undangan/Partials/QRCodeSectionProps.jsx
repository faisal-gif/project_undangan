import { QrCode, Ticket } from "lucide-react";
import Card from "@/Components/Card";
import { usePage } from "@inertiajs/react";

export const QRCodeSection = ({ guestName, guestCode }) => {
  const { acara } = usePage().props;

  const eventLabel = [acara?.nama, acara?.tahun].filter(Boolean).join(" ");
  const jadwalLabel = [acara?.tanggal_singkat, acara?.jam_label].filter(Boolean).join(" - ");

  // Dibuat saat diminta oleh server; tidak ada berkas tersimpan.
  const qrUrl = route('tamu.qr', guestCode);

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
            Tunjukkan QR code ini dari layar ponsel Anda saat registrasi.
          </p>
        </div>

        <Card className="p-8 md:p-12 bg-white text-black/60 shadow-2xl max-w-md mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">E-Ticket</h3>
            <p className="text-sm text-muted-foreground">{eventLabel}</p>
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
              <p className="text-xs text-muted-foreground font-mono mb-3">{guestCode}</p>
              <div className="border-t pt-3">
                <p className="text-sm text-muted-foreground">{acara?.tanggal_label}</p>
                <p className="text-sm text-muted-foreground">{acara?.jam_label}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {acara?.tempat}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-4">
              <div className="flex gap-3">
                <QrCode className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Petunjuk Penggunaan:</p>
                  <ul className="text-muted-foreground space-y-1 text-xs">
                    <li>• Tunjukkan QR ini dari layar ponsel saat registrasi</li>
                    <li>• Simpan tautan undangan ini agar mudah dibuka lagi</li>
                    <li>• Datang 30 menit sebelum acara</li>
                    <li>• Dress code: Batik</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="text-center mt-8 text-white/60 text-sm">
          <p>Jika ada pertanyaan, hubungi panitia:</p>
          <p className="text-gold">redaksi@timesindonesia.co.id | +62 857-3508-4947</p>
        </div>
      </div>
    </section>
  );
};
