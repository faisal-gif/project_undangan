import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

/**
 * Pialanya hiasan, bukan isi: kalau tidak jadi dimuat, halaman tetap utuh dan
 * tak ada keterangan yang hilang. Karena itu ia mengalah pada tamu yang sedang
 * menghemat kuota, dan berkasnya baru diunduh saat hampir masuk layar.
 *
 * Berkasnya sendiri sudah ringan - sekitar 670 KB, setara satu foto - jadi
 * tidak perlu dihalangi hanya karena jaringannya lambat.
 */
const bolehMuat = () => {
    const koneksi = navigator.connection ?? navigator.mozConnection ?? navigator.webkitConnection;

    return !koneksi?.saveData;
};

const kurangiGerak = () => typeof matchMedia !== 'undefined'
    && matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function PialaTiga({
    sumber = '/piala1baru.glb',
    tunda = 0,
    className = '',
    tinggi = '320px',
    alt = 'Piala Anugerah TIMES Indonesia',
    interaktif = true,
    kilau = 0.35,
    ...sisa
}) {
    const wadah = useRef(null);
    const penampil = useRef(null);
    const [siap, setSiap] = useState(false);
    const [modelSiap, setModelSiap] = useState(false);
    const [terlihat, setTerlihat] = useState(false);
    const [mendarat, setMendarat] = useState(false);
    const [gagal, setGagal] = useState(false);
    const sudahJatuh = useRef(false);

    useEffect(() => {
        if (!bolehMuat()) {
            setGagal(true);
            return;
        }

        const el = wadah.current;
        if (!el) return;

        let batal = false;

        // Pustaka model-viewer ikut diunduh belakangan, bukan dibundel ke
        // berkas utama: halaman tetap ringan bagi yang tak pernah melihatnya.
        let sudahMulai = false;
        const mulai = () => {
            if (sudahMulai) return;
            sudahMulai = true;

            import('@google/model-viewer').then(
                () => !batal && setSiap(true),
                () => !batal && setGagal(true)
            );
        };

        // Dua ambang yang berbeda, karena dua hal yang berbeda:
        //
        //   muat  - 300px sebelum masuk layar, supaya berkasnya sudah siap
        //           ketika tamu sampai ke sana.
        //   jatuh - saat pialanya benar-benar terlihat, supaya tamu menyaksikan
        //           jatuhnya. Kalau dipicu oleh selesainya unduhan, piala di
        //           bagian bawah sudah mendarat jauh sebelum tamu menggulir
        //           ke sana, dan geraknya terlewat.
        //
        // Diperiksa lewat satu penyimak gulir, bukan IntersectionObserver:
        // lebih sedikit kode untuk dua ambang sekaligus, berjalan saat dipasang
        // tanpa menunggu putaran pengamat, dan tidak pernah diam di peramban
        // yang pengamatnya tidak berbunyi. Penyimaknya dilepas begitu kedua
        // ambang terlewati.
        const lepas = () => {
            removeEventListener('scroll', periksa);
            removeEventListener('resize', periksa);
        };

        function periksa() {
            const kotak = el.getBoundingClientRect();

            if (kotak.top < innerHeight + 300 && kotak.bottom > -300) mulai();

            if (kotak.top < innerHeight * 0.92 && kotak.bottom > innerHeight * 0.1) {
                setTerlihat(true);
                lepas();
            }
        }

        periksa();
        addEventListener('scroll', periksa, { passive: true });
        addEventListener('resize', periksa);

        return () => {
            batal = true;
            lepas();
        };
    }, []);

    /**
     * Pialanya jatuh dari atas sambil berputar, lalu mendarat.
     *
     * Dua gerak yang dijalankan bersamaan: wadahnya dijatuhkan oleh motion
     * dengan pegas supaya mendaratnya memantul sedikit, dan kameranya diputar
     * satu setengah putaran lewat camera-orbit. Memutar wadah saja tidak cukup
     * - itu cuma memutar gambar datar, bukan pialanya.
     *
     * reveal="manual": modelnya ditahan sampai kamera dilompatkan ke posisi
     * awal. Tanpa itu ada satu bingkai di mana piala tampil di posisi
     * istirahat sebelum sempat dilempar ke atas.
     */
    const saatMuat = () => {
        const mv = penampil.current;
        if (!mv) return;

        // Emasnya ditulis sebagai logam kasar (roughnessFactor 1), sehingga
        // terlihat seperti cat kuning rata, bukan logam. Pengali ini
        // menurunkan kekasaran seluruh bahan sehingga permukaannya memantulkan
        // cahaya dan punya gradasi - itu yang membuatnya terbaca halus.
        //
        // 0.35, bukan lebih rendah: di bawah itu pantulannya meniru lingkungan
        // bawaan yang datar, dan emasnya kembali terlihat rata.
        if (kilau != null && mv.model) {
            mv.model.materials.forEach((bahan) => {
                bahan.pbrMetallicRoughness.setRoughnessFactor(kilau);
            });
        }

        setModelSiap(true);
    };

    // Jatuhnya dijalankan ketika modelnya sudah siap DAN pialanya sudah masuk
    // layar - mana pun yang datang belakangan. Sampai saat itu reveal="manual"
    // menahan modelnya tetap tak terlihat, jadi tamu tidak pernah melihat piala
    // yang diam lebih dulu lalu tiba-tiba melompat ke atas.
    useEffect(() => {
        const mv = penampil.current;
        if (!mv || !modelSiap || !terlihat || sudahJatuh.current) return;

        sudahJatuh.current = true;

        if (kurangiGerak()) {
            mv.dismissPoster();
            setMendarat(true);
            return;
        }

        // Lompat ke sudut awal, lalu langsung tetapkan sudut istirahat: sisanya
        // diantar model-viewer sendiri. Jangan bungkus dengan rAF - kalau
        // bingkainya sedang beku (tab di latar, elemen di luar layar) pialanya
        // tidak pernah turun sama sekali.
        mv.interpolationDecay = 260;
        mv.cameraOrbit = '-540deg 54deg 118%';
        mv.jumpCameraToGoal();
        mv.dismissPoster();
        mv.cameraOrbit = '0deg 78deg 118%';
        setMendarat(true);

        // Putaran pelan baru diserahkan setelah jatuhnya selesai; kalau
        // dinyalakan sejak awal, keduanya berebut sudut kamera yang sama.
        setTimeout(() => mv.setAttribute('auto-rotate', ''), 1700 + tunda * 1000);
    }, [modelSiap, terlihat, tunda]);

    // Peristiwa "load" model-viewer adalah CustomEvent yang tidak menggelembung,
    // jadi onLoad di JSX tidak menangkapnya pada React 18. Dipasang langsung.
    useEffect(() => {
        const mv = penampil.current;
        if (!siap || !mv) return;

        if (mv.loaded) {
            saatMuat();
            return;
        }

        mv.addEventListener('load', saatMuat, { once: true });
        return () => mv.removeEventListener('load', saatMuat);
    }, [siap]);

    if (gagal) return null;

    const diam = kurangiGerak();

    // loading="eager", bukan "lazy": elemen ini baru dipasang setelah penjagaan
    // di atas memutuskan berkasnya layak diunduh. Menyerahkannya lagi ke
    // penundaan bawaan model-viewer cuma mengulang gerbang yang sama - dan
    // menggantung tanpa akhir kalau pengamatnya tidak pernah berbunyi.
    //
    // touchAction pan-y: piala diputar dengan seret mendatar, sementara gulir
    // halaman tetap jalan saat tamu menggeser atas-bawah di atasnya.
    return (
        <motion.div
            ref={wadah}
            className={className}
            style={{ height: tinggi }}
            initial="melayang"
            animate={mendarat || diam ? 'mendarat' : 'melayang'}
            variants={{
                melayang: { y: '-62%', rotate: -15, opacity: 0, scale: 0.9 },
                mendarat: diam
                    ? { y: 0, rotate: 0, opacity: 1, scale: 1, transition: { duration: 0 } }
                    : {
                        // Jatuh beneran: makin ke bawah makin cepat (easeIn),
                        // menghantam di 52%, memantul sekali kecil, lalu diam.
                        // Miringnya ikut hilang di hantaman itu - setelah
                        // mendarat pialanya berdiri tegak.
                        y: ['-62%', '0%', '-5%', '0%'],
                        rotate: [-15, 3, -1, 0],
                        opacity: [0, 1, 1, 1],
                        scale: [0.9, 1.03, 0.99, 1],
                        transition: {
                            duration: 1.5,
                            delay: tunda,
                            times: [0, 0.52, 0.76, 1],
                            ease: ['easeIn', 'easeOut', 'easeInOut'],
                        },
                    },
            }}
            {...sisa}
        >
            {siap && (
                <model-viewer
                    ref={penampil}
                    src={sumber}
                    alt={alt}
                    loading="eager"
                    reveal="manual"
                    tone-mapping="aces"
                    exposure="1.3"
                    shadow-intensity="0.9"
                    shadow-softness="0.8"
                    camera-orbit="0deg 78deg 118%"
                    min-camera-orbit="auto 58deg auto"
                    max-camera-orbit="auto 95deg auto"
                    interaction-prompt="none"
                    rotation-per-second="16deg"
                    disable-zoom=""
                    disable-pan=""
                    {...(interaktif ? { 'camera-controls': '' } : {})}
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'transparent',
                        '--poster-color': 'transparent',
                        touchAction: 'pan-y',
                    }}
                />
            )}
        </motion.div>
    );
}
