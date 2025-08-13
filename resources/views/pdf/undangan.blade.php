<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <style>
        @page {
            size: A4 portrait;
            margin: 0;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: DejaVu Sans, sans-serif;
        }

        .page {
            width: 210mm;
            height: 297mm;
            position: relative;
            background-size: 210mm 297mm;
            background-repeat: no-repeat;
            background-position: center top;
        }

        .page1 {
            background-image: url('{{ public_path('templates/undangan_page_1.png') }}');
        }

        .page2 {
            background-image: url('{{ public_path('templates/undangan_page_2.png') }}');
        }

        .page3 {
            background-image: url('{{ public_path('templates/undangan_page_3.png') }}');
        }

        .page4 {
            background-image: url('{{ public_path('templates/undangan_page_4.png') }}');
        }


        .nomor {
            position: absolute;
            top: 62mm;
            /* sesuaikan */
            left: 48mm;
            font-size: 12pt;
            width: 100mm;
        }

        .kepada {
            position: absolute;
            top: 76mm;
            /* sesuaikan */
            left: 33mm;
            font-size: 12pt;

            width: 120mm;

        }

        .yth {
            position: absolute;
            bottom: 100mm;
            left: 36%;
            font-size: 12pt;
            width: 70mm;
        }

        .lembaga {
            position: absolute;
            bottom: 90mm;
            left: 36%;
            font-size: 12pt;
            width: 70mm;
        }

        .image {
            position: absolute;
            bottom: 35mm;
            left: 40%;
            width: 40mm;
            height: 40mm;
        }

        .break {
            page-break-after: always;
        }
    </style>
</head>

<body>
    <!-- Halaman 1 -->
    <div class="page page1">
        <div class="yth">{{ $data['nama'] }}</div>
        <div class="lembaga">({{ $data['lembaga'] }})</div>
        <img class="image" src="{{ public_path('storage/' . $data['qrCode']) }}" alt="QR Code">
    </div>
    <div class="break"></div>
    <!-- Halaman 1 -->
    <div class="page page2">
        <div class="kepada">{{ $data['nama'] }}</div>
    </div>

    <div class="break"></div>
    <!-- Halaman 2 -->
    <div class="page page3"></div>

    <div class="break"></div>
    <!-- Halaman 2 -->
    <div class="page page4"></div>
</body>

</html>
