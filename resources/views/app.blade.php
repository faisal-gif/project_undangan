<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-theme="light">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    @php
        $metaJudul = $ogTitle ?? config('app.name', 'Anugerah TIMES Indonesia');
        $metaKeterangan = $ogDescription ?? 'Anugerah TIMES Indonesia, penghargaan bagi insan inspiratif yang membawa dampak positif bagi banyak orang.';
        $metaGambar = $ogImage ?? asset('og-image.jpg');
        $metaUrl = $ogUrl ?? url()->current();
        // Undangan tamu dan widget tidak boleh masuk hasil pencarian.
        $metaRobots = $robots ?? 'index, follow';
    @endphp

    <title inertia>{{ $metaJudul }}</title>
    <meta name="description" content="{{ $metaKeterangan }}">
    <link rel="canonical" href="{{ $metaUrl }}">

    <meta property="og:site_name" content="{{ config('app.name', 'Anugerah TIMES Indonesia') }}">
    <meta property="og:title" content="{{ $metaJudul }}">
    <meta property="og:description" content="{{ $metaKeterangan }}">
    <meta property="og:image" content="{{ $metaGambar }}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="{{ $metaJudul }}">
    <meta property="og:url" content="{{ $metaUrl }}">
    <meta property="og:type" content="{{ $ogType ?? 'website' }}">
    <meta property="og:locale" content="id_ID">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $metaJudul }}">
    <meta name="twitter:description" content="{{ $metaKeterangan }}">
    <meta name="twitter:image" content="{{ $metaGambar }}">

    <meta name="copyright" content="TIMES Indonesia">
    <meta name="robots" content="{{ $metaRobots }}">
    <meta name="googlebot" content="{{ $metaRobots }}, max-image-preview:large">

    {{-- icon --}}
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('icon/apple-touch-icon.png') }}">
    <link rel="icon" type="image/png" href="{{ asset('logo-ati-kosongan.png') }}">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600|fraunces:400,500,600,700&display=swap" rel="stylesheet" />


    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>
