# Panduan Undangan Digital

Template undangan pernikahan yang bisa Anda ubah sendiri, plus sambungan ke Google Sheets untuk:

- membuat **link undangan pribadi** untuk setiap tamu (nama tamu tampil di sampul),
- **mengirim undangan lewat WhatsApp** dari spreadsheet,
- mencatat **siapa yang sudah membuka** undangan,
- menyimpan **RSVP & ucapan** langsung ke spreadsheet.

Semua platform yang dipakai gratis.

> **Versi "Taman Beludru"** — lukisan hutan vintage, gapura janur, bunga 3D marun (calla, mawar, hydrangea, lily), lumut, beludru damask, untaian mutiara, dan bingkai besi tempa. Sambungan Google Sheets, link per tamu, RSVP, dan ucapan sama persis dengan versi sebelumnya.

## Sudah memakai versi sebelumnya? (update cepat)

Spreadsheet, Apps Script, dan link tamu **tidak perlu diubah**. Cukup ganti file website di GitHub:

1. Buka repository `undangan` Anda di GitHub → **Add file** → **Upload files**.
2. Seret **semua isi** folder hasil ekstrak (`index.html`, `config.js`, `README.md`, folder `assets`, folder `google-apps-script`) ke halaman tersebut, lalu **Commit changes**. File dengan nama sama akan tertimpa.
3. **Penting — `config.js`:** file baru ini sudah berisi data Anda (Devi & Faiz, foto, acara, alamat, lagu) **dan beberapa isian baru** (`bismillah`, `kutipan.arab`, `fotoUtamaFokus`, `fokus`, `labelMusik`, `judulPenutup`, `tampilkan.fotoSampul`). Jika sebelumnya Anda sudah mengisi `apiUrl` atau mengubah teks lain di GitHub, salin ulang perubahan itu ke `config.js` baru sebelum diunggah, atau edit lagi setelah diunggah.
4. Tunggu ±1 menit, lalu buka undangan dan muat ulang (tarik layar ke bawah di HP).

File gambar lama di `assets/img/hiasan/` (rangkaian-*.webp, gapura-kayu.webp, latar-putih.webp, lily-*.webp) tidak dipakai lagi. Boleh dibiarkan atau dihapus.

| Keperluan | Platform | Catatan |
|---|---|---|
| Hosting website | **GitHub Pages** | Gratis, link seperti `namaanda.github.io/undangan` |
| Database tamu, RSVP, ucapan | **Google Sheets** | Spreadsheet wedding planner yang sudah Anda pakai |
| Penghubung website ↔ Sheets | **Google Apps Script** | Sudah ada di dalam Google Sheets |
| Mengirim undangan | **WhatsApp** (link wa.me) | Satu klik per tamu, pesan sudah terisi |
| Edit kode | Langsung di GitHub (browser) atau **VS Code** | VS Code opsional |
| Kompres foto | **squoosh.app** | Agar undangan cepat dibuka |

---

## Isi folder

```
undangan-digital/
├── index.html              ← kerangka halaman (urutan bagian, teks judul)
├── config.js               ← SEMUA ISI UNDANGAN: nama, tanggal, lokasi, teks, dll.
├── assets/
│   ├── css/style.css       ← warna, huruf, tampilan
│   ├── js/main.js          ← logika (biasanya tidak perlu diubah)
│   ├── img/                ← foto (ganti file contoh dengan foto Anda)
│   │   └── hiasan/         ← bunga 3D, gapura, kartu, beludru, mutiara, latar
│   └── musik/              ← taruh file .mp3 di sini
└── google-apps-script/
    ├── Code.gs             ← ditempel ke Apps Script di spreadsheet
    └── Kirim.html          ← panel "Kirim Undangan" di spreadsheet
```

---

## Langkah 1 — Coba di komputer

1. Ekstrak file zip.
2. Klik dua kali `index.html`. Undangan terbuka di browser dalam **mode demo** (RSVP belum tersimpan ke mana-mana).

## Langkah 2 — Ganti isi undangan

1. Buka `config.js` dengan Notepad (Windows), TextEdit (Mac), atau VS Code.
2. Lengkapi bagian yang masih bertanda `[kurung siku]` (nama lengkap, nama orang tua, keluarga), cek jam acara, lalu ubah teks lain sesuai keinginan.
   - Teks selalu di antara tanda kutip `"..."` dan setiap baris diakhiri koma.
   - Tanggal ditulis `"2026-12-12"`, jam `"08:00"`.
   - Link Google Maps: buka lokasi di Google Maps → **Bagikan** → **Salin link**.
   - Bagian yang tidak dipakai: ubah ke `false` di bagian `tampilkan`.
3. **Foto**: kompres dulu di squoosh.app (lebar ±1200 px, format JPG), lalu ganti file di `assets/img/` **dengan nama yang sama** (`utama.jpg` untuk sampul, `pria.jpg`, `wanita.jpg`, `galeri-1.jpg` dst.). Foto tampil di bingkai melengkung bermutiara; bila wajah terpotong, ubah titik fokusnya lewat `fotoUtamaFokus` dan `fokus` di tiap mempelai (contoh `"50% 30%"`: angka pertama kiri-kanan, kedua atas-bawah). Mau lebih banyak foto galeri? Tambahkan nama filenya di daftar `galeri` di `config.js`.
4. **Musik** (opsional): taruh file `.mp3` di `assets/musik/`, lalu isi `musik: "assets/musik/namafile.mp3"`. Judul yang tampil di bawah piringan hitam diisi lewat `judulLagu`. Pakai musik bebas royalti atau yang Anda punya izinnya.
5. **Pratinjau link di WhatsApp**: buka `index.html`, ubah 4 baris `og:` di bagian atas (judul, deskripsi, alamat gambar). Alamat gambar harus lengkap, misalnya `https://namaanda.github.io/undangan/assets/img/og-image.jpg`. Ganti juga `assets/img/og-image.jpg` dengan gambar Anda (1200×630 px).
6. Simpan, lalu muat ulang browser untuk melihat hasilnya.

> Jika halaman tiba-tiba kosong setelah mengedit `config.js`, biasanya ada tanda kutip atau koma yang hilang. Cek baris terakhir yang Anda ubah.

## Langkah 3 — Online-kan dengan GitHub Pages

1. Daftar akun gratis di **github.com**. Nama pengguna Anda akan menjadi bagian link (`namaanda.github.io`).
2. Klik **+** (kanan atas) → **New repository**.
   - Repository name: `undangan`
   - Pilih **Public**
   - Klik **Create repository**.
3. Di halaman repository, klik link **uploading an existing file**.
4. Buka folder hasil ekstrak, **pilih semua isinya** (bukan file zip-nya), lalu seret ke halaman GitHub. Tunggu sampai semua file terunggah, lalu klik **Commit changes**.
5. Buka **Settings** → **Pages** (menu kiri).
   - Source: **Deploy from a branch**
   - Branch: **main**, folder **/ (root)** → **Save**.
6. Tunggu 1–3 menit, lalu muat ulang halaman Settings → Pages. Link undangan Anda muncul di atas, misalnya `https://namaanda.github.io/undangan/`.

**Mengubah isi setelah online:** buka file di GitHub (misalnya `config.js`) → ikon pensil → edit → **Commit changes**. Tunggu ±1 menit, lalu muat ulang undangan.

> Alternatif: **Netlify** (app.netlify.com/drop) — seret folder ke halaman tersebut. Buat akun gratis agar website tidak hilang.

## Langkah 4 — Pasang script di Google Sheets

1. Buka spreadsheet wedding planner Anda.
2. Menu **Ekstensi** (Extensions) → **Apps Script**.
3. Di editor yang terbuka:
   - Hapus semua isi file `Code.gs`, lalu tempel seluruh isi `google-apps-script/Code.gs`.
   - Klik **+** di sebelah "File" → **HTML** → beri nama `Kirim` (persis, tanpa `.html`) → tempel seluruh isi `google-apps-script/Kirim.html`.
   - Klik ikon **Simpan** (disket).
4. Kembali ke tab spreadsheet dan **muat ulang** halaman. Menu baru **Undangan Digital** muncul di samping menu Bantuan (tunggu beberapa detik).
5. Klik **Undangan Digital → 1. Siapkan kolom & pengaturan**.
   - Google akan meminta izin. Klik **Lanjutkan**, pilih akun Anda.
   - Muncul peringatan "Google belum memverifikasi aplikasi ini". Ini normal untuk script buatan sendiri. Klik **Lanjutan** (Advanced) → **Buka … (tidak aman)** → **Izinkan**.
   - Klik menu yang sama sekali lagi bila belum berjalan.
6. Hasilnya:
   - Di sheet **Daftar Tamu** muncul kolom baru di sebelah kanan: Kode, Link Undangan, Kirim WA, Waktu Dikirim, Dibuka, Jumlah Dibuka, Konfirmasi (RSVP) (bila belum ada), Jumlah Hadir (RSVP), Waktu RSVP.
   - Sheet baru **Ucapan & RSVP** dan **Pengaturan Undangan**.

> Script mencari kolom berdasarkan **judul** (`Nama Tamu`, `No. HP / WA`, `Sapaan`, `Status Undangan`, `Kemungkinan Hadir`), jadi urutan kolom bebas. Jangan ubah judul kolom-kolom itu.

## Langkah 5 — Sambungkan website ke spreadsheet

1. Di editor Apps Script, klik **Deploy** (Terapkan) → **New deployment** (Deployment baru).
2. Klik ikon roda gigi di samping "Select type" → **Web app** (Aplikasi web).
3. Isi:
   - Description: `undangan`
   - Execute as: **Me** (Saya)
   - Who has access: **Anyone** (Siapa saja)
4. Klik **Deploy**. Salin **Web app URL** (berakhiran `/exec`).
5. Buka `config.js` (di GitHub: ikon pensil), tempel URL tadi:
   ```js
   apiUrl: "https://script.google.com/macros/s/XXXXXXXX/exec",
   ```
   lalu **Commit changes**.
6. Buka undangan Anda. Tulisan "Mode demo" di bagian ucapan seharusnya sudah hilang.

> **Penting:** setiap kali `Code.gs` diubah, buat versi baru: **Deploy → Manage deployments** → ikon pensil → Version: **New version** → **Deploy**. URL-nya tetap sama.

## Langkah 6 — Buat link & kirim undangan

1. Buka sheet **Pengaturan Undangan**, isi sel kuning:
   - **Link website undangan**: link dari Langkah 3.
   - **Nama mempelai**: dipakai di akhir pesan.
   - **Template pesan WhatsApp**: ubah sesuka Anda. Kata `{sapaan}`, `{nama}`, `{link}`, `{mempelai}` diganti otomatis. Teks di antara `*bintang*` jadi tebal di WhatsApp.
2. Pastikan kolom **No. HP / WA** terisi. Format apa pun boleh (`0812…`, `+62 812…`, `812…`).
3. Klik **Undangan Digital → 2. Buat / perbarui link undangan**. Setiap tamu mendapat kode unik dan link pribadi, misalnya:
   `https://namaanda.github.io/undangan/?to=P+Jiat&k=7KQ2MD`
   Status Undangan yang masih kosong / "Belum Disiapkan" berubah menjadi "Siap Dikirim".
   Jalankan menu ini lagi setiap kali menambah tamu atau mengubah template pesan. Kode yang sudah ada tidak berubah, jadi link yang sudah terkirim tetap berlaku.
4. Kirim undangan:
   - **Di laptop:** **Undangan Digital → 3. Kirim undangan (WhatsApp)**. Panel muncul di kanan. Klik **Kirim WA** pada tamu → WhatsApp Web/Desktop terbuka dengan pesan sudah terisi → tekan kirim. Status otomatis menjadi "Sudah Dikirim" beserta waktunya.
   - **Di HP (aplikasi Google Sheets):** ketuk link di kolom **Kirim WA** → WhatsApp terbuka → kirim. Ubah kolom Status Undangan menjadi "Sudah Dikirim" secara manual (menu & panel tidak tersedia di aplikasi HP).
   - Tamu tanpa nomor: tombolnya membuka WhatsApp dan Anda memilih kontak sendiri.

## Langkah 7 — Pantau tamu

| Yang ingin dicek | Lihat di |
|---|---|
| Undangan sudah dikirim | Kolom **Status Undangan** & **Waktu Dikirim** |
| Tamu sudah membuka undangan | Kolom **Dibuka** (waktu pertama) & **Jumlah Dibuka** |
| Konfirmasi hadir / tidak | Kolom **Konfirmasi (RSVP)** & **Jumlah Hadir (RSVP)** |
| Semua ucapan & RSVP | Sheet **Ucapan & RSVP** |
| Ringkasan cepat | Bagian atas panel **Kirim Undangan** |

Saat tamu mengisi RSVP, kolom **Kemungkinan Hadir** ikut berubah menjadi "Pasti Hadir" atau "Tidak Hadir", sehingga estimasi tamu di sheet Ringkasan ikut akurat.

Untuk menyembunyikan ucapan tertentu dari website, ubah kolom **Tampilkan** di sheet Ucapan & RSVP menjadi `Tidak` (website diperbarui dalam ±1 menit).

---

## Tes dulu sebelum disebar

1. Tambah satu baris tamu, misalnya "Tes Undangan" dengan nomor WA Anda sendiri.
2. Jalankan menu **2. Buat / perbarui link undangan**, lalu kirim ke diri sendiri dari panel.
3. Buka link dari WhatsApp di HP: cek nama di sampul, buka undangan, isi RSVP dan ucapan.
4. Cek spreadsheet: kolom Dibuka, Konfirmasi (RSVP), dan sheet Ucapan & RSVP harus terisi.
5. Hapus baris "Tes Undangan" dan baris tesnya di sheet Ucapan & RSVP.

> Membuka link pribadi tamu akan tercatat sebagai "Dibuka". Untuk melihat undangan tanpa tercatat, tambahkan `&preview=1` di akhir link.

## Mengubah tampilan

- **Warna & huruf:** blok `:root` paling atas di `assets/css/style.css`: `--marun`, `--beludru`, `--pink`, `--emas`, `--kertas`, `--kabut`. Huruf (Parisienne, Cormorant Garamond, dan Amiri untuk teks Arab) diambil dari Google Fonts lewat link di `index.html`.
- **Urutan bagian:** di `index.html`, setiap bagian dibungkus `<section id="...">`. Pindahkan blok `<section>…</section>` untuk mengubah urutan.
- **Tampilan profil mempelai, kartu acara, lokasi, ucapan:** blok `<template>` di bagian bawah `index.html`.
- **Gambar hiasan** ada di `assets/img/hiasan/` (WebP transparan, dirender sebagai objek 3D). Ganti file dengan nama yang sama untuk memakai gambar lain:
  - Sampul: `latar-toile.webp` (lukisan hutan, juga latar seluruh halaman), `pohon-kiri/kanan.webp`, `janur-kiri/kanan.webp` (gapura merah berumbai), `taman.webp` (taman depan).
  - Bunga: `kolom-gelap-*.webp` & `kolom-terang-*.webp` (rangkaian tegak di sisi kartu), `bed-1/2.webp` (lumut + calla di bawah kartu).
  - Kartu: `kartu-ayat-*.webp` dan `kartu-pink-*.webp` (dipotong atas/tengah/bawah agar tinggi kartu bisa menyesuaikan isi), `gapura-pink.webp`.
  - Pembuka: `tirai-kain.webp` (beludru berlipit), `tirai-atas.webp` (kanopi), `tirai-mutiara.webp`, `tirai-rumbai.webp`, `tirai-plakat.webp`.
  - Lainnya: `bingkai-foto.webp` (bingkai foto beludru bermutiara), `beludru.webp` (tekstur damask), `tetes.webp`, `gebyok.webp` (kayu ukir), `mutiara.webp`, `ornamen-tetes.webp`, `piringan.webp` (piringan hitam).
- **Animasi pembuka** (`pembukaan` di `config.js`): `awal` adalah tampilan pertama sebelum sampul, yaitu `"tirai"` (tirai teater beludru dengan plakat monogram; diketuk, tirai tersingkap dan lagu mulai), `"amplop"` (amplop bersegel), atau `""` untuk langsung ke sampul. `buka` adalah efek tombol "Buka Undangan": `"amplop"` (amplop naik, segel lepas, kartu keluar lalu membesar memenuhi layar), `"tirai"` (tirai menutup lalu terbuka ke isi undangan), atau `"zoom"`. Link yang memakai `#bagian` (misalnya `#rsvp`) melewati semua animasi ini.
- **Gerak & efek 3D:** sampul bergerak mengikuti gerakan mouse/kemiringan HP (Android); pohon, gapura janur, rangkaian bunga, dan bedeng calla bergoyang tertiup angin; mutiara dan bingkai foto berkilau; foto perlahan memperbesar; kartu muncul dengan sudut miring. Semua efek otomatis mati bila HP tamu mengaktifkan "kurangi gerakan".
- **Kupu-kupu & bunga bertaburan:** kupu-kupu (emas, pink, marun) dengan sayap 3D yang mengepak muncul di sampul dan beberapa bagian. Jumlah & warnanya diatur lewat penanda `<span data-kupu="3" data-jenis="emas,pink,emas">` di `index.html` (hapus penandanya bila tidak ingin). Kelopak dan bunga kecil berjatuhan di sampul dan sepanjang undangan.
- **Piringan hitam:** ketuk untuk memutar/menjeda lagu; piringan kecil di pojok kanan bawah juga bisa dipakai. Tulisan "Play the music!" diubah lewat `labelMusik`.
- **Galeri "dinding kenangan":** foto tampil berserakan di atas beludru bermotif timbul. Tamu bisa mencubit untuk zoom, menggeser saat sudah diperbesar, ketuk dua kali (atau klik dua kali di komputer) untuk zoom cepat, dan mengetuk foto untuk layar penuh. Tombol di kanan bawah: perbesar, perkecil, lihat semua, dan acak susunan. Selama belum diperbesar, usapan di dinding tetap menggulir halaman seperti biasa. Saat ini dinding berisi 10 foto: 4 foto asli Anda (`galeri-1.jpg`, `utama.jpg`, `wanita.jpg`, `pria.jpg`) dan 6 foto contoh (`galeri-2.jpg` s.d. `galeri-7.jpg`) yang tinggal ditimpa dengan foto Anda. Mau lebih banyak? Tambahkan nama file di daftar `galeri`; susunan dinding menyesuaikan sendiri. Kutipan kecil di dinding diatur lewat `kutipanGaleri`; hiasan bunga, mutiara, dan segel lilin ada di `assets/img/hiasan/tabur-*.webp` dan teksturnya `beludru-timbul.webp`.
- **Foto:** sembunyikan foto sampul dengan `tampilkan.fotoSampul: false`, atau foto mempelai dengan `tampilkan.fotoMempelai: false` (gaya "tanpa foto" seperti referensi).
- **Untuk acara non-Muslim:** kosongkan `bismillah` dan `kutipan.arab`, lalu ubah `salamPembuka`, `kutipan`, `salamPenutup`, dan `rsvp.labelHadir` di `config.js`.
- **Peta di dalam halaman** (opsional): Google Maps → Bagikan → **Sematkan peta** → salin isi `src="..."` ke `petaEmbed` di `config.js`.

## Jika ada masalah

| Masalah | Penyebab & solusi |
|---|---|
| Halaman kosong / putih | Ada salah ketik di `config.js` (tanda kutip, koma). Bandingkan dengan file asli. |
| Foto tidak muncul | Nama file atau huruf besar-kecil tidak sama (`Pria.JPG` ≠ `pria.jpg`). |
| "Gagal mengirim" saat RSVP | `apiUrl` belum benar (harus berakhiran `/exec`), akses web app bukan **Anyone**, atau `Code.gs` diubah tanpa membuat versi baru. |
| Menu "Undangan Digital" tidak muncul | Muat ulang spreadsheet dan tunggu beberapa detik. Pastikan `Code.gs` sudah disimpan. |
| Muncul pesan "Jalankan dulu menu 1" | Klik **1. Siapkan kolom & pengaturan** dulu. |
| Pratinjau link WhatsApp tidak bergambar | Alamat `og:image` harus lengkap (diawali `https://`). WhatsApp menyimpan pratinjau lama; coba kirim link dengan tambahan `&v=2`. |
| Nomor WA salah negara | Ubah **Kode negara WhatsApp** di sheet Pengaturan Undangan. |

## Batasan yang perlu diketahui

- **Pengiriman WhatsApp tetap satu per satu** (satu klik per tamu). Kirim otomatis massal memerlukan WhatsApp Business API yang berbayar; aplikasi kirim massal tidak resmi berisiko nomor Anda diblokir.
- Status "Sudah Dikirim" dicatat saat tombol **Kirim WA** diklik, bukan saat pesan benar-benar terkirim.
- Repository GitHub bersifat publik: isi `config.js` bisa dilihat orang (sama dengan yang tampil di undangan). Data tamu tetap aman di Google Sheets Anda.
- URL web app tersimpan di `config.js`. RSVP hanya mengubah baris tamu bila kodenya cocok; ucapan yang tidak pantas bisa disembunyikan lewat kolom **Tampilkan**.
- Kuota Google Apps Script gratis cukup untuk ratusan tamu.
