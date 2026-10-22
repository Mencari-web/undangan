/* ==========================================================================
   CONFIG UNDANGAN — cukup ubah file ini untuk mengganti isi undangan.

   Aturan menulis:
   - Teks selalu di antara tanda kutip "..." dan setiap baris diakhiri koma.
   - Untuk ganti baris di dalam teks, tulis \n
   - Bagian yang tidak dipakai: kosongkan ("") atau ubah di "tampilkan" jadi false.
   - Teks di dalam [kurung siku] masih perlu Anda isi.
   ========================================================================== */

window.UNDANGAN = {

  /* 1. KONEKSI GOOGLE SHEETS ------------------------------------------------
     Tempel URL Web App dari Google Apps Script (berakhiran /exec).
     Selama masih kosong, undangan berjalan dalam MODE DEMO:
     RSVP & ucapan tidak tersimpan ke mana-mana. */
  apiUrl: "",

  /* 2. JUDUL & MEMPELAI ---------------------------------------------------- */
  judulKecil: "The Wedding of",
  urutanMempelai: ["wanita", "pria"],       // Devi tampil lebih dulu. Tukar jadi ["pria", "wanita"] bila ingin sebaliknya
  mempelai: {
    wanita: {
      panggilan: "Devi",
      namaLengkap: "Rahma Sadevi Puspaleni, S.Ak.",
      keterangan: "Putri pertama dari",
      orangTua: "Bapak Sulani\n& Ibu Eni",
      instagram: "",                           // contoh: "devi" (tanpa @). Kosongkan bila tidak ada.
      foto: "assets/img/wanita.jpg",
      fokus: "62% 38%"                         // titik fokus foto di bingkai (kiri-kanan, atas-bawah)
    },
    pria: {
      panggilan: "Faiz",
      namaLengkap: "Achmed Faiz Yudha Siregar, S.Sos.",
      keterangan: "Putra ketiga dari",
      orangTua: "Bapak Saleh\n& Ibu Susilawati",
      instagram: "",
      foto: "assets/img/pria.jpg",
      fokus: "50% 32%"
    }
  },
  fotoUtama: "assets/img/utama.jpg",          // foto di bingkai mutiara pada sampul
  fotoUtamaFokus: "50% 40%",                  // titik fokus foto: geser angka bila wajah terpotong

  /* 3. PEMBUKA -------------------------------------------------------------
     bismillah & kutipan.arab: teks Arab (boleh dikosongkan bila tidak dipakai). */
  bismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  salamPembuka: "Assalamu'alaikum Warahmatullahi Wabarakatuh",
  kalimatPembuka: "Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di hari bahagia kami.",
  kutipan: {
    arab: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا لِتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِقَوْمٍ يَتَفَكَّرُونَ",
    teks: "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.",
    sumber: "QS. Ar-Rum : 21"
  },

  /* 4. ACARA ----------------------------------------------------------------
     tanggal: "TAHUN-BULAN-HARI", jam: "JJ:MM" (24 jam)
     zonaWaktu: "WIB", "WITA", atau "WIT"
     selesai: jam ("10:00") atau tulis "selesai"
     maps: link dari Google Maps (Bagikan > Salin link)
     petaEmbed: (opsional) Google Maps > Bagikan > Sematkan peta > ambil isi src="..."
     JAM DI BAWAH MASIH CONTOH — sesuaikan dengan jadwal Anda. */
  acara: [
    {
      nama: "Akad Nikah",
      tanggal: "2027-07-17",
      mulai: "08:00",
      selesai: "10:00",
      zonaWaktu: "WIB",
      tempat: "Wajawa Kopi",
      alamat: "Gg. Jl. Cisadane, Bendo, Kec. Kepanjenkidul, Kota Blitar, Jawa Timur 66116",
      maps: "https://maps.app.goo.gl/bhrttWrsDJNAsFZv9",
      petaEmbed: ""
    },
    {
      nama: "Resepsi",
      tanggal: "2027-07-17",
      mulai: "11:00",
      selesai: "selesai",
      zonaWaktu: "WIB",
      tempat: "Wajawa Kopi",
      alamat: "Gg. Jl. Cisadane, Bendo, Kec. Kepanjenkidul, Kota Blitar, Jawa Timur 66116",
      maps: "https://maps.app.goo.gl/bhrttWrsDJNAsFZv9",
      petaEmbed: ""
    }
  ],

  // Dress code (opsional). Isi teks & warna bila ada, contoh warna: ["#111111", "#FFFFFF", "#C5A15A"]
  dressCode: {
    teks: "",
    warna: []
  },

  /* 5. CERITA CINTA (opsional) ----------------------------------------------
     Isi lalu ubah tampilkan.ceritaCinta menjadi true. */
  ceritaCinta: [
    { waktu: "[tahun]", judul: "Pertama Bertemu", cerita: "[ceritakan singkat]" },
    { waktu: "[tahun]", judul: "Lamaran", cerita: "[ceritakan singkat]" }
  ],

  /* 6. GALERI ---------------------------------------------------------------
     Taruh foto di folder assets/img lalu tulis namanya di sini.
     Foto tampil berserakan di "dinding kenangan" yang bisa dicubit/digeser.
     Makin banyak foto, makin ramai dindingnya (6–30 foto ideal).
     Kompres dulu foto Anda (lebar ±1200px) agar undangan cepat dibuka. */
  // Kutipan kecil yang ikut terselip di dinding foto (kosongkan bila tidak perlu)
  kutipanGaleri: "Setiap foto adalah doa kecil yang kami simpan, agar perjalanan ini selalu kami kenang dengan syukur.",
  galeri: [
    "assets/img/galeri-1.jpg",
    "assets/img/utama.jpg",
    "assets/img/galeri-2.jpg",
    "assets/img/wanita.jpg",
    "assets/img/galeri-3.jpg",
    "assets/img/pria.jpg",
    "assets/img/galeri-4.jpg",
    "assets/img/galeri-5.jpg",
    "assets/img/galeri-6.jpg",
    "assets/img/galeri-7.jpg"
  ],

  /* 7. SIARAN LANGSUNG (opsional) ------------------------------------------ */
  streaming: {
    teks: "Bagi yang berhalangan hadir, akad nikah dapat disaksikan secara langsung melalui tautan berikut.",
    link: "",                                   // contoh: link YouTube/Instagram Live. Kosong = bagian disembunyikan
    label: "Tonton Siaran Langsung"
  },

  /* 8. RSVP & UCAPAN -------------------------------------------------------- */
  rsvp: {
    teks: "Mohon konfirmasi kehadiran Anda dan tuliskan doa serta ucapan untuk kami.",
    labelHadir: "Insya Allah hadir",
    labelTidak: "Maaf, tidak bisa hadir",
    maksimalTamu: 4                             // pilihan jumlah orang yang hadir (1 sampai angka ini)
  },
  // Contoh ucapan yang tampil HANYA di mode demo (apiUrl kosong)
  contohUcapan: [
    { nama: "Contoh: Ilham", hadir: true, ucapan: "Selamat menempuh hidup baru! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.", waktu: "2026-10-20T09:15:00+07:00" },
    { nama: "Contoh: Cahya & keluarga", hadir: false, ucapan: "Mohon maaf belum bisa hadir. Doa terbaik untuk kalian berdua.", waktu: "2026-10-19T20:40:00+07:00" }
  ],

  /* 9. PENUTUP --------------------------------------------------------------- */
  judulPenutup: "Terima Kasih",
  kalimatPenutup: "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.",
  salamPenutup: "Wassalamu'alaikum Warahmatullahi Wabarakatuh",
  keluarga: "Keluarga Bapak Sulani \n& Keluarga Bapak Saleh",
  turutMengundang: [],                          // contoh: ["Keluarga Besar ...", "Keluarga Besar ..."]
  tagar: "#DeviFaiz2027",

  /* 10. MUSIK -----------------------------------------------------------------
     Taruh file .mp3 di folder assets/musik lalu tulis namanya, misalnya:
     "assets/musik/lagu.mp3". Pakai musik bebas royalti / milik sendiri.
     Kosong = tombol musik disembunyikan. */
  musik: "assets/musik/lagu-kami.mp3",
  judulLagu: "Ordinary — Alex Warren",        // tampil di bawah piringan hitam. Kosongkan bila tidak perlu
  labelMusik: "Play the music!",

  /* 11. TAMPILKAN / SEMBUNYIKAN BAGIAN --------------------------------------- */
  tampilkan: {
    kutipan: true,
    fotoSampul: true,                           // foto di sampul
    fotoMempelai: true,                         // foto di atas nama mempelai
    ceritaCinta: false,
    galeri: true,
    streaming: true,
    rsvp: true,
    turutMengundang: true
  },

  /* 12. ANIMASI PEMBUKA ----------------------------------------------------
     awal: tampilan pertama sebelum sampul -> "tirai" (tirai teater), "amplop", atau "" (langsung sampul)
     buka: efek tombol "Buka Undangan"   -> "amplop", "tirai", atau "zoom" */
  pembukaan: {
    awal: "tirai",
    buka: "amplop"
  },

  /* 13. TEKS SAMPUL ---------------------------------------------------------- */
  sampul: {
    sapaan: "Kepada Yth.",
    sapaanTamu: "Bapak/Ibu/Saudara/i",       // tampil bila link tidak memuat nama tamu
    catatan: "Mohon maaf bila ada kesalahan penulisan nama atau gelar",
    tombol: "Buka Undangan"
  }
};
