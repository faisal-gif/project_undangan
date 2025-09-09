"use client";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import {
    User,
    MapPin,
    Phone,
    Mail,
    Calendar,
    CreditCard,
    Heart,
    Users,
    AlertCircle,
    Shield,
    Shirt,
    QrCode,
    CheckCircle,
    Clock,
} from "lucide-react";


const Show = ({participant}) => {

    const getStatusText = (status) => {
        return status === "ambil" ? (
            <span className="flex items-center px-3 py-1 rounded bg-green-100 text-green-700 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-1" /> Sudah Diambil
            </span>
        ) : (
            <span className="flex items-center px-3 py-1 rounded bg-gray-100 text-gray-700 text-sm font-medium">
                <Clock className="w-4 h-4 mr-1" /> Belum Diambil
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Tamu" />
            <div className="max-w-6xl mx-auto py-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow">
                    <div>
                        <h1 className="text-2xl font-bold">{participant.nama}</h1>
                        <p className="text-gray-500">ID: {participant.id}</p>
                    </div>
                    {getStatusText(participant.status)}
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Personal */}
                    <div className="md:col-span-2 bg-white p-5 rounded-lg shadow">
                        <h2 className="flex items-center text-lg font-semibold mb-4">
                            <User className="w-5 h-5 mr-2 text-blue-500" />
                            Informasi Pribadi
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoItem icon={<MapPin />} label="Alamat" value={participant.alamat} />
                            <InfoItem icon={<Calendar />} label="Tempat, Tanggal Lahir" value={participant.tempat_tanggal_lahir} />
                            <InfoItem icon={<Phone />} label="Telepon" value={participant.telepon} />
                            <InfoItem icon={<Mail />} label="Email" value={participant.email} />
                        </div>
                    </div>

                    {/* Identitas */}
                    <div className="bg-white p-5 rounded-lg shadow">
                        <h2 className="flex items-center text-lg font-semibold mb-4">
                            <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
                            Identitas
                        </h2>
                        <InfoBlock label="Jenis Kartu" value={participant.kartu_identitas} />
                        <InfoBlock label="Nomor" value={participant.no_kartu_identitas} />
                        <InfoBlock label="Jenis Kelamin" value={participant.jenis_kelamin} />
                    </div>

                    {/* Medis */}
                    <div className="bg-white p-5 rounded-lg shadow">
                        <h2 className="flex items-center text-lg font-semibold mb-4">
                            <Heart className="w-5 h-5 mr-2 text-blue-500" />
                            Informasi Medis
                        </h2>
                        <InfoBlock label="Golongan Darah" value={participant.golongan_darah} />
                        <InfoBlock label="Penyakit" value={participant.penyakit} />
                        <InfoBlock label="Disabilitas" value={participant.apakah_penyandang_disabilitas} />
                    </div>

                    {/* Emergency */}
                    <div className="md:col-span-2 bg-white p-5 rounded-lg shadow">
                        <h2 className="flex items-center text-lg font-semibold mb-4">
                            <AlertCircle className="w-5 h-5 mr-2 text-blue-500" />
                            Kontak Darurat
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <InfoBlock label="Nama" value={participant.nama_kontak_darurat} />
                            <InfoBlock label="Hubungan" value={participant.hubungan_kontak_darurat} />
                            <InfoBlock label="Nomor Telepon" value={participant.nomor_kontak_darurat} />
                        </div>
                    </div>

                    {/* Komunitas */}
                    <div className="bg-white p-5 rounded-lg shadow">
                        <h2 className="flex items-center text-lg font-semibold mb-4">
                            <Users className="w-5 h-5 mr-2 text-blue-500" />
                            Komunitas
                        </h2>
                        <p>{participant.nama_komunitas}</p>
                    </div>

                    {/* Jersey */}
                    <div className="bg-white p-5 rounded-lg shadow">
                        <h2 className="flex items-center text-lg font-semibold mb-4">
                            <Shirt className="w-5 h-5 mr-2 text-blue-500" />
                            Jersey
                        </h2>
                        <span className="px-4 py-2 border rounded text-blue-600 font-semibold">
                            {participant.ukuran_jersey}
                        </span>
                    </div>

                    {/* Pembayaran */}
                    <div className="md:col-span-3 bg-white p-5 rounded-lg shadow">
                        <h2 className="flex items-center text-lg font-semibold mb-4">
                            <Shield className="w-5 h-5 mr-2 text-blue-500" />
                            Informasi Pembayaran
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoBlock label="Atas Nama" value={participant.atas_nama} />
                          <PaymentProof url={participant.bukti_pembayaran} />
                        </div>
                    </div>
                   

                    {/* QR Code */}
                    <div className="bg-white p-5 rounded-lg shadow text-center">
                        <h2 className="flex items-center justify-center text-lg font-semibold mb-4">
                            <QrCode className="w-5 h-5 mr-2 text-blue-500" />
                            QR Code
                        </h2>
                        <div className="flex items-center justify-center p-4 border rounded bg-gray-50">
                            <QrCode className="w-16 h-16 text-blue-500" />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{participant.qrcode}</p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>

    );
};

// Helper Component
const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start space-x-2">
        <span className="text-blue-500">{icon}</span>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-gray-800">{value}</p>
        </div>
    </div>
);

const InfoBlock = ({ label, value }) => (
    <div className="mb-3">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{value}</p>
    </div>
);


const PaymentProof = ({ url }) => {
  const extractFileId = (driveUrl) => {
    const match = driveUrl.match(/[-\w]{25,}/);
    return match ? match[0] : null;
  };

  const fileId = extractFileId(url);
  const previewUrl = fileId
    ? `https://drive.google.com/file/d/${fileId}/preview`
    : null;

  return (
    <div>
      <p className="text-sm text-gray-500 mb-2">Bukti Pembayaran</p>
      {previewUrl ? (
        <iframe
          src={previewUrl}
          className="w-full max-w-sm h-64 border rounded"
          allow="autoplay"
        />
      ) : (
        <p className="text-red-500">Link tidak valid</p>
      )}
    </div>
  );
};


export default Show;
