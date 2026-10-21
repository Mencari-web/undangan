/**
 * ============================================================================
 *  UNDANGAN DIGITAL — penghubung Google Sheets
 * ============================================================================
 *  Script ini ditempel di spreadsheet wedding planner Anda
 *  (Ekstensi > Apps Script). Fungsinya:
 *   1. Membuat kode unik, link undangan pribadi, dan link WhatsApp untuk tiap tamu.
 *   2. Panel "Kirim Undangan" untuk mengirim lewat WhatsApp + menandai terkirim.
 *   3. Web App yang dipanggil website undangan untuk:
 *        - mencatat kapan tamu membuka undangan,
 *        - menyimpan RSVP & ucapan,
 *        - menampilkan daftar ucapan.
 *
 *  Kolom dicari berdasarkan JUDUL kolom (bukan posisi), jadi aman walau
 *  urutan kolom Anda berbeda. Kolom yang belum ada akan ditambahkan di kanan.
 *
 *  Setelah mengubah file ini dan sudah pernah Deploy:
 *  Deploy > Kelola deployment > ikon pensil > Versi: "Versi baru" > Deploy.
 * ============================================================================
 */

// ---------- Nama sheet (ubah bila nama tab Anda berbeda) ----------
var SHEET_TAMU = 'Daftar Tamu';
var SHEET_UCAPAN = 'Ucapan & RSVP';
var SHEET_PENGATURAN = 'Pengaturan Undangan';

// ---------- Nilai yang dipakai di kolom dropdown ----------
var NILAI = {
  belumDisiapkan: 'Belum Disiapkan',
  siapDikirim: 'Siap Dikirim',
  sudahDikirim: 'Sudah Dikirim',
  diantarLangsung: 'Diantar Langsung',
  rsvpBelum: 'Belum Konfirmasi',
  rsvpHadir: 'Konfirmasi Hadir',
  rsvpTidak: 'Konfirmasi Tidak Hadir',
  pastiHadir: 'Pasti Hadir',
  tidakHadir: 'Tidak Hadir'
};

// ---------- Kolom yang dikenali (judul ditulis tanpa spasi/tanda baca) ----------
var KOLOM = {
  nama:          { judul: 'Nama Tamu',           alias: ['namatamu', 'nama'] },
  sapaan:        { judul: 'Sapaan',              alias: ['sapaan'] },
  hp:            { judul: 'No. HP / WA',         alias: ['nohpwa', 'nohp', 'nowa', 'nomorhp', 'nomorwa', 'nomorhpwa', 'whatsapp', 'nowhatsapp', 'hp', 'wa', 'telepon'] },
  statusUndangan:{ judul: 'Status Undangan',     alias: ['statusundangan'] },
  kemungkinan:   { judul: 'Kemungkinan Hadir',   alias: ['kemungkinanhadir'] },
  rsvp:          { judul: 'Konfirmasi (RSVP)',   alias: ['konfirmasirsvp', 'rsvp', 'konfirmasi'], buat: true },
  kode:          { judul: 'Kode',                alias: ['kode', 'kodeundangan'], buat: true },
  link:          { judul: 'Link Undangan',       alias: ['linkundangan'], buat: true },
  kirimWa:       { judul: 'Kirim WA',            alias: ['kirimwa', 'linkwa'], buat: true },
  waktuKirim:    { judul: 'Waktu Dikirim',       alias: ['waktudikirim'], buat: true },
  dibuka:        { judul: 'Dibuka',              alias: ['dibuka', 'waktudibuka'], buat: true },
  jumlahDibuka:  { judul: 'Jumlah Dibuka',       alias: ['jumlahdibuka'], buat: true },
  jumlahHadir:   { judul: 'Jumlah Hadir (RSVP)', alias: ['jumlahhadirrsvp'], buat: true },
  waktuRsvp:     { judul: 'Waktu RSVP',          alias: ['waktursvp'], buat: true }
};
var URUTAN_KOLOM_BARU = ['kode', 'link', 'kirimWa', 'waktuKirim', 'dibuka', 'jumlahDibuka', 'rsvp', 'jumlahHadir', 'waktuRsvp'];

var TEMPLATE_PESAN_BAWAAN = [
  'Kepada Yth.',
  '{sapaan} *{nama}*',
  '',
  'Tanpa mengurangi rasa hormat, perkenankan kami mengundang {sapaan} untuk hadir di acara pernikahan kami.',
  '',
  'Info lengkap acara dapat dibuka melalui link berikut:',
  '{link}',
  '',
  'Merupakan kebahagiaan bagi kami apabila {sapaan} berkenan hadir dan memberikan doa restu.',
  '',
  'Mohon maaf undangan ini kami sampaikan melalui pesan singkat.',
  '',
  'Hormat kami,',
  '{mempelai}'
].join('\n');

/* ===================================================================
   MENU DI SPREADSHEET
   =================================================================== */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Undangan Digital')
    .addItem('1. Siapkan kolom & pengaturan', 'siapkan')
    .addItem('2. Buat / perbarui link undangan', 'perbaruiLink')
    .addItem('3. Kirim undangan (WhatsApp)', 'bukaPanelKirim')
    .addSeparator()
    .addItem('Cek koneksi web app', 'cekKoneksi')
    .addToUi();
}

/* ===================================================================
   ALAT BANTU
   =================================================================== */
function normal_(teks) {
  return String(teks == null ? '' : teks).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function aman_(teks, maks) {
  // bersihkan teks dari tamu: batasi panjang & cegah dibaca sebagai rumus
  var s = String(teks == null ? '' : teks).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
  if (maks) s = s.slice(0, maks);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function zonaWaktu_() {
  return SpreadsheetApp.getActive().getSpreadsheetTimeZone() || Session.getScriptTimeZone() || 'Asia/Jakarta';
}

function formatWaktu_(nilai, pola) {
  if (!(nilai instanceof Date)) return nilai ? String(nilai) : '';
  return Utilities.formatDate(nilai, zonaWaktu_(), pola || 'dd/MM/yyyy HH:mm');
}

function sheetTamu_() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(SHEET_TAMU);
  if (sh) return sh;
  // cadangan: cari sheet yang punya judul kolom "Nama Tamu"
  var semua = ss.getSheets();
  for (var i = 0; i < semua.length; i++) {
    if (cariBarisJudul_(semua[i])) return semua[i];
  }
  throw new Error('Sheet "' + SHEET_TAMU + '" tidak ditemukan. Ubah SHEET_TAMU di bagian atas script.');
}

function cariBarisJudul_(sh) {
  var baris = Math.min(15, sh.getLastRow());
  var kolom = Math.min(60, sh.getLastColumn());
  if (baris < 1 || kolom < 1) return 0;
  var nilai = sh.getRange(1, 1, baris, kolom).getValues();
  for (var r = 0; r < nilai.length; r++) {
    for (var c = 0; c < nilai[r].length; c++) {
      if (normal_(nilai[r][c]) === 'namatamu') return r + 1;
    }
  }
  return 0;
}

/** Peta kolom: { sheet, barisJudul, kol: {nama: 2, hp: 18, ...}, kolomTerakhir } */
function infoTamu_() {
  var sh = sheetTamu_();
  var barisJudul = cariBarisJudul_(sh);
  if (!barisJudul) throw new Error('Tidak menemukan judul kolom "Nama Tamu" di sheet ' + sh.getName() + '.');
  var lebar = sh.getLastColumn();
  var judul = sh.getRange(barisJudul, 1, 1, lebar).getValues()[0].map(normal_);
  var kol = {};
  Object.keys(KOLOM).forEach(function (k) {
    var alias = KOLOM[k].alias;
    for (var a = 0; a < alias.length && !kol[k]; a++) {
      var i = judul.indexOf(alias[a]);
      if (i >= 0) kol[k] = i + 1;
    }
  });
  var kolomTerakhir = 0;
  judul.forEach(function (j, i) { if (j) kolomTerakhir = i + 1; });
  return { sheet: sh, barisJudul: barisJudul, kol: kol, kolomTerakhir: kolomTerakhir };
}

/** Baris data tamu (nilai mentah) + nomor baris sheet */
function bacaTamu_(info) {
  var sh = info.sheet;
  var awal = info.barisJudul + 1;
  var jumlah = sh.getLastRow() - info.barisJudul;
  if (jumlah < 1) return { awal: awal, nilai: [] };
  var lebar = Math.max(info.kolomTerakhir, sh.getLastColumn());
  return { awal: awal, nilai: sh.getRange(awal, 1, jumlah, lebar).getValues() };
}

function ambil_(baris, info, kunci) {
  var c = info.kol[kunci];
  return c ? baris[c - 1] : '';
}

function bacaPengaturan_() {
  var sh = SpreadsheetApp.getActive().getSheetByName(SHEET_PENGATURAN);
  var hasil = { link: '', mempelai: '', sapaan: 'Bapak/Ibu/Saudara/i', kodeNegara: '62', template: TEMPLATE_PESAN_BAWAAN };
  if (!sh || sh.getLastRow() < 1) return hasil;
  var nilai = sh.getRange(1, 1, sh.getLastRow(), 2).getValues();
  nilai.forEach(function (r) {
    var k = normal_(r[0]), v = String(r[1] == null ? '' : r[1]).trim();
    if (!v) return;
    if (k === 'linkwebsiteundangan') hasil.link = v;
    else if (k === 'namamempelai') hasil.mempelai = v;
    else if (k === 'sapaanbawaan') hasil.sapaan = v;
    else if (k === 'kodenegarawhatsapp') hasil.kodeNegara = v.replace(/\D/g, '') || '62';
    else if (k === 'templatepesanwhatsapp') hasil.template = String(r[1]);
  });
  return hasil;
}

function normalHp_(hp, kodeNegara) {
  var s = String(hp == null ? '' : hp).replace(/[^\d+]/g, '');
  if (!s) return '';
  if (s.charAt(0) === '+') s = s.slice(1);
  else if (s.indexOf('00') === 0) s = s.slice(2);
  if (s.charAt(0) === '0') s = kodeNegara + s.slice(1);
  else if (s.charAt(0) === '8' && kodeNegara === '62') s = '62' + s;
  return (s.length >= 9 && s.length <= 15) ? s : '';
}

function buatKode_(dipakai) {
  var huruf = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (var coba = 0; coba < 1000; coba++) {
    var k = '';
    for (var i = 0; i < 6; i++) k += huruf.charAt(Math.floor(Math.random() * huruf.length));
    if (!dipakai[k]) { dipakai[k] = true; return k; }
  }
  throw new Error('Gagal membuat kode unik.');
}

function buatLink_(dasar, nama, kode) {
  var sambung = dasar.indexOf('?') >= 0 ? '&' : '?';
  return dasar + sambung + 'to=' + encodeURIComponent(String(nama).trim()).replace(/%20/g, '+') + '&k=' + kode;
}

function buatPesan_(p, tamu) {
  var data = {
    sapaan: String(tamu.sapaan || '').trim() || p.sapaan,
    nama: String(tamu.nama || '').trim(),
    link: tamu.link,
    mempelai: p.mempelai
  };
  return String(p.template).replace(/\{(\w+)\}/g, function (asli, kunci) {
    return Object.prototype.hasOwnProperty.call(data, kunci) ? data[kunci] : asli;
  });
}

function linkWa_(hp, pesan) {
  return 'https://wa.me/' + (hp || '') + '?text=' + encodeURIComponent(pesan);
}

function linkSiap_(p) {
  return /^https?:\/\/\S+$/i.test(p.link) && p.link.toLowerCase().indexOf('username') < 0;
}

/* ===================================================================
   1. SIAPKAN KOLOM & SHEET PENDUKUNG
   =================================================================== */
function siapkan() {
  var info = infoTamu_();
  var sh = info.sheet;
  var ditambah = [];
  var kolomBaru = info.kolomTerakhir;
  var sumberFormat = sh.getRange(info.barisJudul, info.kol.nama);

  URUTAN_KOLOM_BARU.forEach(function (k) {
    if (info.kol[k]) return;
    kolomBaru++;
    if (kolomBaru > sh.getMaxColumns()) sh.insertColumnsAfter(sh.getMaxColumns(), 1);
    var sel = sh.getRange(info.barisJudul, kolomBaru);
    sumberFormat.copyFormatToRange(sh, kolomBaru, kolomBaru, info.barisJudul, info.barisJudul);
    sel.setValue(KOLOM[k].judul);
    sh.setColumnWidth(kolomBaru, k === 'link' ? 260 : (k === 'rsvp' ? 170 : 120));
    info.kol[k] = kolomBaru;
    ditambah.push(KOLOM[k].judul);
  });

  if (ditambah.length) perluasFilter_(sh, kolomBaru);

  // dropdown untuk kolom RSVP bila kolom itu baru dibuat
  if (ditambah.indexOf(KOLOM.rsvp.judul) >= 0) {
    var aturan = SpreadsheetApp.newDataValidation()
      .requireValueInList([NILAI.rsvpBelum, NILAI.rsvpHadir, NILAI.rsvpTidak], true)
      .setAllowInvalid(true).build();
    var n = Math.max(1, sh.getMaxRows() - info.barisJudul);
    sh.getRange(info.barisJudul + 1, info.kol.rsvp, n, 1).setDataValidation(aturan);
  }

  siapkanSheetUcapan_();
  siapkanSheetPengaturan_();

  var pesan = ditambah.length
    ? 'Kolom baru ditambahkan di sheet ' + sh.getName() + ': ' + ditambah.join(', ') + '.'
    : 'Semua kolom sudah ada.';
  pesan += '\n\nLangkah berikutnya: isi "Link website undangan" dan "Nama mempelai" di sheet "' +
    SHEET_PENGATURAN + '", lalu jalankan menu "2. Buat / perbarui link undangan".';
  SpreadsheetApp.getUi().alert('Siap!', pesan, SpreadsheetApp.getUi().ButtonSet.OK);
}

/** Bila sheet memakai filter, perlebar agar kolom baru ikut tersaring (hanya jika filter sedang tidak dipakai) */
function perluasFilter_(sh, kolomAkhir) {
  var f = sh.getFilter();
  if (!f) return;
  var rg = f.getRange();
  if (rg.getLastColumn() >= kolomAkhir) return;
  for (var c = rg.getColumn(); c <= rg.getLastColumn(); c++) {
    if (f.getColumnFilterCriteria(c)) return;
  }
  var baris = rg.getRow(), kolomAwal = rg.getColumn(), barisAkhir = rg.getLastRow();
  f.remove();
  sh.getRange(baris, kolomAwal, barisAkhir - baris + 1, kolomAkhir - kolomAwal + 1).createFilter();
}

function siapkanSheetUcapan_() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(SHEET_UCAPAN);
  if (sh) return sh;
  sh = ss.insertSheet(SHEET_UCAPAN);
  var judul = ['Waktu', 'Nama', 'Kode', 'Nama di Daftar Tamu', 'Kehadiran', 'Jumlah Orang', 'Ucapan', 'Tampilkan'];
  sh.getRange(1, 1, 1, judul.length).setValues([judul])
    .setFontWeight('bold').setBackground('#7B4B5A').setFontColor('#FFFFFF');
  sh.setFrozenRows(1);
  [140, 160, 80, 160, 110, 100, 380, 90].forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });
  sh.getRange(2, 7, sh.getMaxRows() - 1, 1).setWrap(true);
  var aturan = SpreadsheetApp.newDataValidation().requireValueInList(['Ya', 'Tidak'], true).build();
  sh.getRange(2, 8, sh.getMaxRows() - 1, 1).setDataValidation(aturan);
  sh.getRange(1, 8).setNote('Ubah menjadi "Tidak" untuk menyembunyikan ucapan dari website.');
  return sh;
}

function siapkanSheetPengaturan_() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(SHEET_PENGATURAN);
  if (sh) return sh;
  sh = ss.insertSheet(SHEET_PENGATURAN);
  sh.getRange(1, 1).setValue('Pengaturan Undangan Digital').setFontSize(14).setFontWeight('bold');
  var isi = [
    ['Link website undangan', 'https://username.github.io/undangan/', 'Alamat website undangan Anda (dari GitHub Pages / Netlify).'],
    ['Nama mempelai', 'Devi & Faiz', 'Dipakai di akhir pesan WhatsApp.'],
    ['Sapaan bawaan', 'Bapak/Ibu/Saudara/i', 'Dipakai bila kolom Sapaan tamu kosong.'],
    ['Kode negara WhatsApp', '62', 'Nomor 08xx otomatis diubah menjadi 628xx.'],
    ['Template pesan WhatsApp', TEMPLATE_PESAN_BAWAAN, 'Kata yang otomatis diganti: {sapaan} {nama} {link} {mempelai}. Gunakan *teks* untuk huruf tebal di WhatsApp.']
  ];
  sh.getRange(3, 1, isi.length, 3).setValues(isi).setVerticalAlignment('top').setWrap(true);
  sh.getRange(3, 1, isi.length, 1).setFontWeight('bold');
  sh.getRange(3, 2, isi.length, 1).setBackground('#FFF6D5');
  sh.getRange(3, 3, isi.length, 1).setFontColor('#7F6F74').setFontStyle('italic');
  sh.setColumnWidth(1, 200); sh.setColumnWidth(2, 420); sh.setColumnWidth(3, 320);
  return sh;
}

/* ===================================================================
   2. BUAT / PERBARUI LINK
   =================================================================== */
function perbaruiLink() {
  var ui = SpreadsheetApp.getUi();
  var info = infoTamu_();
  var p = bacaPengaturan_();
  var kurang = URUTAN_KOLOM_BARU.filter(function (k) { return !info.kol[k]; });
  if (kurang.length) {
    ui.alert('Jalankan dulu menu "1. Siapkan kolom & pengaturan".');
    return;
  }
  if (!linkSiap_(p)) {
    ui.alert('Isi dulu "Link website undangan" di sheet "' + SHEET_PENGATURAN + '" dengan alamat website Anda (diawali https://).');
    return;
  }
  var hasil = perbaruiLinkInti_(info, p);
  SpreadsheetApp.getActive().toast(hasil.jumlah + ' link undangan siap (' + hasil.baru + ' kode baru).', 'Undangan Digital', 6);
}

function perbaruiLinkInti_(info, p) {
  var sh = info.sheet;
  var data = bacaTamu_(info);
  var n = data.nilai.length;
  if (!n) return { jumlah: 0, baru: 0 };

  var dipakai = {};
  data.nilai.forEach(function (r) { var k = String(ambil_(r, info, 'kode')).trim(); if (k) dipakai[k] = true; });

  var rgKode = sh.getRange(data.awal, info.kol.kode, n, 1);
  var rgLink = sh.getRange(data.awal, info.kol.link, n, 1);
  var rgWa = sh.getRange(data.awal, info.kol.kirimWa, n, 1);
  var kode = rgKode.getValues(), link = rgLink.getValues(), wa = rgWa.getRichTextValues();
  var status = info.kol.statusUndangan ? sh.getRange(data.awal, info.kol.statusUndangan, n, 1).getValues() : null;
  var jumlah = 0, baru = 0;

  for (var i = 0; i < n; i++) {
    var r = data.nilai[i];
    var nama = String(ambil_(r, info, 'nama')).trim();
    if (!nama) continue;
    var k = String(kode[i][0]).trim().toUpperCase();
    if (!k) { k = buatKode_(dipakai); baru++; }
    kode[i][0] = k;
    var url = buatLink_(p.link, nama, k);
    link[i][0] = url;
    var hp = normalHp_(ambil_(r, info, 'hp'), p.kodeNegara);
    var pesan = buatPesan_(p, { sapaan: ambil_(r, info, 'sapaan'), nama: nama, link: url });
    wa[i][0] = SpreadsheetApp.newRichTextValue()
      .setText(hp ? 'Kirim ke ' + hp : 'Pilih kontak')
      .setLinkUrl(linkWa_(hp, pesan))
      .build();
    if (status && (!String(status[i][0]).trim() || status[i][0] === NILAI.belumDisiapkan)) status[i][0] = NILAI.siapDikirim;
    jumlah++;
  }
  rgKode.setValues(kode);
  rgLink.setValues(link);
  rgWa.setRichTextValues(wa);
  if (status) sh.getRange(data.awal, info.kol.statusUndangan, n, 1).setValues(status);
  return { jumlah: jumlah, baru: baru };
}

/* ===================================================================
   3. PANEL KIRIM UNDANGAN (sidebar)
   =================================================================== */
function bukaPanelKirim() {
  var html = HtmlService.createHtmlOutputFromFile('Kirim').setTitle('Kirim Undangan');
  SpreadsheetApp.getUi().showSidebar(html);
}

/** Dipanggil oleh panel: daftar tamu + rekap */
function dataPanel() {
  var info = infoTamu_();
  var p = bacaPengaturan_();
  var data = bacaTamu_(info);
  var tamu = [];
  var rekap = { total: 0, adaLink: 0, terkirim: 0, dibuka: 0, rsvpHadir: 0, orangHadir: 0, rsvpTidak: 0 };
  data.nilai.forEach(function (r) {
    var nama = String(ambil_(r, info, 'nama')).trim();
    if (!nama) return;
    rekap.total++;
    var kode = String(ambil_(r, info, 'kode')).trim();
    var status = String(ambil_(r, info, 'statusUndangan')).trim();
    var waktuKirim = ambil_(r, info, 'waktuKirim');
    var dibuka = ambil_(r, info, 'dibuka');
    var rsvp = String(ambil_(r, info, 'rsvp')).trim();
    var terkirim = status === NILAI.sudahDikirim || status === NILAI.diantarLangsung || !!waktuKirim;
    var hp = normalHp_(ambil_(r, info, 'hp'), p.kodeNegara);
    var url = kode && linkSiap_(p) ? buatLink_(p.link, nama, kode) : '';
    if (kode) rekap.adaLink++;
    if (terkirim) rekap.terkirim++;
    if (dibuka) rekap.dibuka++;
    if (rsvp === NILAI.rsvpHadir) { rekap.rsvpHadir++; rekap.orangHadir += Number(ambil_(r, info, 'jumlahHadir')) || 0; }
    if (rsvp === NILAI.rsvpTidak) rekap.rsvpTidak++;
    tamu.push({
      kode: kode,
      nama: nama,
      hp: hp,
      status: status,
      terkirim: terkirim,
      waktuKirim: formatWaktu_(waktuKirim, 'dd/MM HH:mm'),
      dibuka: formatWaktu_(dibuka, 'dd/MM HH:mm'),
      jumlahDibuka: Number(ambil_(r, info, 'jumlahDibuka')) || 0,
      rsvp: rsvp,
      link: url,
      wa: url ? linkWa_(hp, buatPesan_(p, { sapaan: ambil_(r, info, 'sapaan'), nama: nama, link: url })) : ''
    });
  });
  return { tamu: tamu, rekap: rekap, linkSiap: linkSiap_(p) };
}

/** Dipanggil oleh panel setelah tombol "Kirim WA" diklik */
function tandaiTerkirim(kode) {
  var kunci = LockService.getScriptLock();
  kunci.waitLock(15000);
  try {
    var info = infoTamu_();
    var baris = cariBarisKode_(info, kode);
    if (!baris) throw new Error('Kode ' + kode + ' tidak ditemukan.');
    var sekarang = new Date();
    if (info.kol.statusUndangan) info.sheet.getRange(baris, info.kol.statusUndangan).setValue(NILAI.sudahDikirim);
    info.sheet.getRange(baris, info.kol.waktuKirim).setValue(sekarang);
    return { kode: kode, waktuKirim: formatWaktu_(sekarang, 'dd/MM HH:mm') };
  } finally {
    kunci.releaseLock();
  }
}

function cariBarisKode_(info, kode) {
  kode = String(kode || '').trim().toUpperCase();
  if (!kode || !info.kol.kode) return 0;
  var n = info.sheet.getLastRow() - info.barisJudul;
  if (n < 1) return 0;
  var nilai = info.sheet.getRange(info.barisJudul + 1, info.kol.kode, n, 1).getValues();
  for (var i = 0; i < n; i++) {
    if (String(nilai[i][0]).trim().toUpperCase() === kode) return info.barisJudul + 1 + i;
  }
  return 0;
}

/* ===================================================================
   4. WEB APP (dipanggil dari website undangan)
   =================================================================== */
function doGet(e) {
  var aksi = (e && e.parameter && (e.parameter.aksi || e.parameter.action)) || '';
  try {
    if (aksi === 'ucapan') return json_({ ok: true, data: daftarUcapan_() });
    return json_({ ok: true, pesan: 'Web app undangan aktif.' });
  } catch (err) {
    return json_({ ok: false, pesan: err.message });
  }
}

function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, pesan: 'Data tidak valid.' });
  }
  var kunci = LockService.getScriptLock();
  try {
    kunci.waitLock(20000);
  } catch (err) {
    return json_({ ok: false, pesan: 'Server sedang sibuk, coba lagi sebentar.' });
  }
  try {
    if (data.aksi === 'buka') return json_(catatDibuka_(data));
    if (data.aksi === 'rsvp') return json_(simpanRsvp_(data));
    return json_({ ok: false, pesan: 'Aksi tidak dikenal.' });
  } catch (err) {
    return json_({ ok: false, pesan: 'Terjadi kesalahan: ' + err.message });
  } finally {
    kunci.releaseLock();
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function catatDibuka_(data) {
  var kode = String(data.kode || '').toUpperCase();
  if (!/^[A-Z0-9]{4,12}$/.test(kode)) return { ok: false, pesan: 'Kode tidak valid.' };
  var info = infoTamu_();
  var baris = cariBarisKode_(info, kode);
  if (!baris) return { ok: false, pesan: 'Kode tidak ditemukan.' };
  var sh = info.sheet;
  if (info.kol.dibuka) {
    var sel = sh.getRange(baris, info.kol.dibuka);
    if (!sel.getValue()) sel.setValue(new Date());
  }
  if (info.kol.jumlahDibuka) {
    var j = sh.getRange(baris, info.kol.jumlahDibuka);
    j.setValue((Number(j.getValue()) || 0) + 1);
  }
  return { ok: true };
}

function simpanRsvp_(data) {
  var nama = aman_(data.nama, 60);
  var hadir = data.hadir === 'ya' ? true : (data.hadir === 'tidak' ? false : null);
  var ucapan = aman_(data.ucapan, 500);
  var jumlah = hadir ? Math.max(1, Math.min(20, parseInt(data.jumlah, 10) || 1)) : 0;
  if (!nama) return { ok: false, pesan: 'Nama wajib diisi.' };
  if (hadir === null) return { ok: false, pesan: 'Pilih konfirmasi kehadiran.' };

  var kode = String(data.kode || '').toUpperCase();
  var namaDaftar = '';
  var sekarang = new Date();
  if (/^[A-Z0-9]{4,12}$/.test(kode)) {
    var info = infoTamu_();
    var baris = cariBarisKode_(info, kode);
    if (baris) {
      var sh = info.sheet;
      namaDaftar = String(sh.getRange(baris, info.kol.nama).getValue());
      if (info.kol.rsvp) sh.getRange(baris, info.kol.rsvp).setValue(hadir ? NILAI.rsvpHadir : NILAI.rsvpTidak);
      if (info.kol.kemungkinan) sh.getRange(baris, info.kol.kemungkinan).setValue(hadir ? NILAI.pastiHadir : NILAI.tidakHadir);
      if (info.kol.jumlahHadir) sh.getRange(baris, info.kol.jumlahHadir).setValue(jumlah);
      if (info.kol.waktuRsvp) sh.getRange(baris, info.kol.waktuRsvp).setValue(sekarang);
    } else {
      kode = '';
    }
  } else {
    kode = '';
  }

  var log = siapkanSheetUcapan_();
  log.appendRow([sekarang, nama, kode, namaDaftar, hadir ? 'Hadir' : 'Tidak Hadir', jumlah, ucapan, 'Ya']);
  CacheService.getScriptCache().remove('ucapan');
  return { ok: true };
}

function daftarUcapan_() {
  var cache = CacheService.getScriptCache();
  var tersimpan = cache.get('ucapan');
  if (tersimpan) return JSON.parse(tersimpan);
  var sh = SpreadsheetApp.getActive().getSheetByName(SHEET_UCAPAN);
  var hasil = [];
  if (sh && sh.getLastRow() > 1) {
    var nilai = sh.getRange(2, 1, sh.getLastRow() - 1, 8).getValues();
    for (var i = nilai.length - 1; i >= 0 && hasil.length < 300; i--) {
      var r = nilai[i];
      var ucapan = String(r[6] || '').replace(/^'/, '').trim();
      if (!ucapan || normal_(r[7]) === 'tidak') continue;
      hasil.push({
        nama: String(r[1] || '').replace(/^'/, ''),
        hadir: r[4] === 'Hadir' ? true : (r[4] === 'Tidak Hadir' ? false : null),
        ucapan: ucapan,
        waktu: r[0] instanceof Date ? r[0].toISOString() : ''
      });
    }
  }
  try { cache.put('ucapan', JSON.stringify(hasil), 60); } catch (err) { /* terlalu besar untuk cache, abaikan */ }
  return hasil;
}

/* ===================================================================
   CEK KONEKSI
   =================================================================== */
function cekKoneksi() {
  var url = '';
  try { url = ScriptApp.getService().getUrl() || ''; } catch (err) { url = ''; }
  var ui = SpreadsheetApp.getUi();
  if (!url) {
    ui.alert('Web app belum di-deploy. Klik Deploy > Deployment baru > Aplikasi web (lihat panduan).');
    return;
  }
  if (/\/dev$/.test(url)) {
    ui.alert('Web app sudah ada', 'Ambil URL yang berakhiran /exec dari menu Deploy > Kelola deployment, lalu tempel ke apiUrl di config.js.', ui.ButtonSet.OK);
    return;
  }
  ui.alert('Web app aktif', 'URL web app Anda:\n\n' + url + '\n\nURL ini yang ditempel ke apiUrl di config.js website undangan.', ui.ButtonSet.OK);
}
