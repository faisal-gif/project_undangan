<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-theme="light">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title inertia>{{ config('app.name', 'ATI') }}</title>

    <meta property="og:title" content="{{ $ogTitle ?? config('app.name', 'ATI') }}">
    <meta property="og:description" content="{{ $ogDescription ?? 'ATI Anugrah TIMES Indonesia' }}">
    <meta property="og:image" content="{{ asset('logo-ati-kosongan.jpg') }}">
    <meta property="og:image:width" content="500">
    <meta property="og:image:height" content="500">
    <meta property="og:image:alt" content="TIMES Indonesia Logo">
    <meta property="og:url" content="{{ $ogUrl ?? url()->current() }}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="id_ID" />
    <meta name="twitter:card" content="summary_large_image">
    <meta name="copyright" content="TIMES Indonesia">
    <meta name="robots" content="index, follow">
    <meta name="googlebot" content="index, follow, max-image-preview:large">

    {{-- icon --}}
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('icon/apple-touch-icon.png') }}">
    <link rel="icon" type="image/png" href="{{ asset('logo-ati-kosongan.png') }}">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />


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
