/* ==========================================================================
   LOGIKA UNDANGAN
   Biasanya Anda tidak perlu mengubah file ini. Isi undangan ada di config.js.
   ========================================================================== */
(function () {
  "use strict";

  var C = window.UNDANGAN || {};
  var ZONA = {
    WIB: { offset: "+07:00", tz: "Asia/Jakarta" },
    WITA: { offset: "+08:00", tz: "Asia/Makassar" },
    WIT: { offset: "+09:00", tz: "Asia/Jayapura" }
  };
  var mf = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  var bisaAnimasi = !mf.matches && "IntersectionObserver" in window;

  /* ---------- alat bantu ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function ambil(obj, jalur) {
    return jalur.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
  }
  function isi(el, teks) {
    // menulis teks aman (bukan HTML); \n menjadi baris baru
    el.textContent = "";
    String(teks == null ? "" : teks).split("\n").forEach(function (bagian, i) {
      if (i) el.appendChild(document.createElement("br"));
      el.appendChild(document.createTextNode(bagian));
    });
  }
  function adaIsi(v) {
    if (Array.isArray(v)) return v.length > 0;
    return v != null && String(v).trim() !== "";
  }
  function pad(n) { return String(n).padStart(2, "0"); }
  function zona(ev) { return ZONA[(ev && ev.zonaWaktu || "WIB").toUpperCase()] || ZONA.WIB; }
  function keTanggal(tgl, jam, ev) {
    if (!tgl) return null;
    var j = /^\d{1,2}:\d{2}$/.test(jam || "") ? jam.padStart(5, "0") : "00:00";
    var d = new Date(tgl + "T" + j + ":00" + zona(ev).offset);
    return isNaN(d) ? null : d;
  }
  function formatTanggal(d, ev) {
    try {
      return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: zona(ev).tz }).format(d);
    } catch (e) { return d.toDateString(); }
  }
  function formatJam(jam) { return String(jam).replace(":", "."); }
  function urutan() { return Array.isArray(C.urutanMempelai) ? C.urutanMempelai : ["pria", "wanita"]; }
  function namaPanggilan() {
    return urutan().map(function (k) { return ((C.mempelai || {})[k] || {}).panggilan; }).filter(Boolean);
  }

  var notifTimer;
  function beriTahu(teks) {
    var n = $("#notifikasi");
    n.textContent = teks;
    n.classList.add("tampil");
    clearTimeout(notifTimer);
    notifTimer = setTimeout(function () { n.classList.remove("tampil"); }, 2400);
  }

  /* ---------- data tamu dari link (?to=Nama&k=KODE) ---------- */
  var param = new URLSearchParams(location.search);
  var tamu = {
    nama: (param.get("to") || "").trim().slice(0, 80),
    kode: (param.get("k") || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12)
  };

  /* ---------- isi teks dari config ---------- */
  function isiTeks() {
    $$("[data-isi]").forEach(function (el) {
      var v = ambil(C, el.getAttribute("data-isi"));
      if (adaIsi(v)) isi(el, v); else el.hidden = true;
    });

    var m = C.mempelai || {}, urut = urutan();
    $$("[data-nama]").forEach(function (el) {
      var orang = m[urut[Number(el.getAttribute("data-nama")) - 1]] || {};
      el.textContent = orang.panggilan || "";
    });
    var inisial = namaPanggilan().map(function (n) { return n.charAt(0).toUpperCase(); }).join("&");
    $$("[data-monogram]").forEach(function (el) { el.textContent = inisial; });

    $$("img[data-src]").forEach(function (img) {
      var src = ambil(C, img.getAttribute("data-src"));
      if (src) img.src = src;
    });
    $$("[data-ada]").forEach(function (el) { if (!adaIsi(ambil(C, el.getAttribute("data-ada")))) el.hidden = true; });

    var pertama = (C.acara || [])[0];
    var d = pertama && keTanggal(pertama.tanggal, pertama.mulai, pertama);
    if (d) {
      var b = pertama.tanggal.split("-");
      $$("[data-tanggal-singkat]").forEach(function (el) { el.textContent = b[2] + " . " + b[1] + " . " + b[0]; });
      $$("[data-tanggal-panjang]").forEach(function (el) { el.textContent = formatTanggal(d, pertama); });
    }

    // nama tamu; tanda & diberi huruf aksen
    var namaTamu = $("#nama-tamu");
    String(tamu.nama || (C.sampul && C.sampul.sapaanTamu) || "Bapak/Ibu/Saudara/i").split("&").forEach(function (bagian, i) {
      if (i) { var a = document.createElement("span"); a.className = "amp"; a.textContent = "&"; namaTamu.appendChild(a); }
      namaTamu.appendChild(document.createTextNode(bagian));
    });
    var mp = namaPanggilan().join(" & ");
    if (mp) document.title = (C.judulKecil || "The Wedding of") + " " + mp;
  }

  /* ---------- bagian yang bisa disembunyikan ---------- */
  function aturTampil() {
    var t = C.tampilkan || {};
    var data = {
      kutipan: C.kutipan && C.kutipan.teks,
      ceritaCinta: C.ceritaCinta,
      galeri: C.galeri,
      streaming: C.streaming && C.streaming.link,
      rsvp: true,
      turutMengundang: C.turutMengundang
    };
    $$("[data-tampil]").forEach(function (el) {
      var k = el.getAttribute("data-tampil");
      if (t[k] === false || (data[k] !== true && !adaIsi(data[k]))) el.hidden = true;
    });
  }

  /* ---------- kupu-kupu emas ---------- */
  function lepasKupu() {
    var tpl = $("#tpl-kupu");
    if (!tpl) return;
    var acak = function (a, b) { return a + Math.random() * (b - a); };
    $$("[data-kupu]").forEach(function (titik) {
      var n = Number(titik.getAttribute("data-kupu")) || 1;
      for (var i = 0; i < n; i++) {
        var k = tpl.content.firstElementChild.cloneNode(true);
        k.style.left = acak(8, 82).toFixed(1) + "%";
        k.style.top = acak(14, 62).toFixed(1) + "%";
        k.style.width = acak(26, 40).toFixed(0) + "px";
        k.style.setProperty("--dur", acak(12, 20).toFixed(1) + "s");
        k.style.setProperty("--tunda", (-acak(0, 10)).toFixed(1) + "s");
        ["1", "2", "3"].forEach(function (j) {
          k.style.setProperty("--dx" + j, acak(-70, 70).toFixed(0) + "px");
          k.style.setProperty("--dy" + j, acak(-90, 40).toFixed(0) + "px");
        });
        titik.parentNode.insertBefore(k, titik);
      }
      titik.remove();
    });
  }

  /* ---------- kelopak berjatuhan di sampul ---------- */
  var kelopakJalan = false;
  function kelopakJatuh() {
    var kanvas = $("#kelopak-jatuh");
    if (!kanvas || mf.matches || !kanvas.getContext) return;
    var ctx = kanvas.getContext("2d");
    var warna = ["#E0707E", "#F4B3BC", "#B0172F", "#FFFFFF", "#F2C6C8", "#8E1B2C"];
    var dpr = Math.min(2, window.devicePixelRatio || 1), W, H, daftar = [];
    function ukur() {
      W = kanvas.clientWidth; H = kanvas.clientHeight;
      kanvas.width = W * dpr; kanvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function baru(awal) {
      return {
        x: Math.random() * W, y: awal ? Math.random() * H : -20,
        r: 5 + Math.random() * 7, vy: 0.35 + Math.random() * 0.6, ayun: Math.random() * 6.28,
        putar: Math.random() * 6.28, vp: (Math.random() - 0.5) * 0.04, w: warna[Math.floor(Math.random() * warna.length)]
      };
    }
    ukur();
    window.addEventListener("resize", ukur);
    for (var i = 0; i < 18; i++) daftar.push(baru(true));
    kelopakJalan = true;
    (function langkah() {
      if (!kelopakJalan) return;
      ctx.clearRect(0, 0, W, H);
      daftar.forEach(function (p, i) {
        p.ayun += 0.02; p.y += p.vy; p.x += Math.sin(p.ayun) * 0.6; p.putar += p.vp;
        if (p.y > H + 20) daftar[i] = baru(false);
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.putar);
        ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(p.ayun)));
        ctx.fillStyle = p.w; ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.moveTo(0, -p.r);
        ctx.bezierCurveTo(p.r, -p.r * 0.6, p.r * 0.7, p.r * 0.8, 0, p.r);
        ctx.bezierCurveTo(-p.r * 0.7, p.r * 0.8, -p.r, -p.r * 0.6, 0, -p.r);
        ctx.fill();
        ctx.restore();
      });
      requestAnimationFrame(langkah);
    })();
  }

  /* ---------- mempelai ---------- */
  function isiMempelai() {
    var wadah = $("#profil-wadah"), tpl = $("#tpl-profil");
    urutan().forEach(function (kunci, i) {
      var o = (C.mempelai || {})[kunci];
      if (!o) return;
      if (i > 0) {
        var dan = document.createElement("p");
        dan.className = "antara-profil muncul";
        dan.setAttribute("aria-hidden", "true");
        dan.textContent = "&";
        wadah.appendChild(dan);
      }
      var n = tpl.content.cloneNode(true);
      var img = $(".foto-dalam img", n), bingkai = $(".bingkai-lengkung", n);
      if (o.foto) { img.src = o.foto; img.alt = "Foto " + (o.panggilan || ""); img.loading = "lazy"; }
      else bingkai.hidden = true;
      isi($(".panggilan", n), o.panggilan || "");
      isi($(".nama-lengkap", n), o.namaLengkap || "");
      isi($(".keterangan", n), o.keterangan || "");
      isi($(".orang-tua", n), o.orangTua || "");
      if (o.instagram) {
        var ig = $(".instagram", n), akun = String(o.instagram).replace(/^@/, "");
        ig.href = "https://instagram.com/" + encodeURIComponent(akun);
        $("span", ig).textContent = "@" + akun;
        ig.hidden = false;
      }
      wadah.appendChild(n);
    });
  }

  /* ---------- acara ---------- */
  function tautanKalender(ev) {
    var mulai = keTanggal(ev.tanggal, ev.mulai, ev);
    var selesai = /^\d{1,2}:\d{2}$/.test(ev.selesai || "") ? keTanggal(ev.tanggal, ev.selesai, ev) : null;
    if (!mulai) return "";
    if (!selesai || selesai <= mulai) selesai = new Date(mulai.getTime() + 3 * 3600 * 1000);
    function f(d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }
    return "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + encodeURIComponent((ev.nama || "Acara") + " " + namaPanggilan().join(" & ")) +
      "&dates=" + f(mulai) + "/" + f(selesai) +
      "&location=" + encodeURIComponent([ev.tempat, ev.alamat].filter(Boolean).join(", ")) +
      "&details=" + encodeURIComponent(location.href.split("#")[0]);
  }
  function isiAcara() {
    var wadah = $("#daftar-acara"), tpl = $("#tpl-acara");
    (C.acara || []).forEach(function (ev) {
      var n = tpl.content.cloneNode(true);
      var d = keTanggal(ev.tanggal, ev.mulai, ev);
      isi($(".nama-acara", n), ev.nama || "");
      isi($(".hari-tanggal", n), d ? formatTanggal(d, ev) : "");
      var z = (ev.zonaWaktu || "WIB").toUpperCase();
      var akhir = /^\d{1,2}:\d{2}$/.test(ev.selesai || "") ? formatJam(ev.selesai) + " " + z : (ev.selesai ? "Selesai" : "");
      isi($(".jam", n), "Pukul " + formatJam(ev.mulai || "") + (akhir ? " – " + akhir : " " + z));
      isi($(".tempat", n), ev.tempat || "");
      isi($(".alamat", n), ev.alamat || "");
      var maps = $(".link-maps", n);
      if (ev.maps) maps.href = ev.maps; else maps.hidden = true;
      var kal = $(".link-kalender", n), urlKal = tautanKalender(ev);
      if (urlKal) kal.href = urlKal; else kal.hidden = true;
      if (ev.petaEmbed && /^https:\/\/(www\.)?google\.com\/maps\/embed/.test(ev.petaEmbed)) {
        var peta = $(".peta", n), fr = document.createElement("iframe");
        fr.src = ev.petaEmbed; fr.loading = "lazy"; fr.title = "Peta " + (ev.tempat || "");
        fr.referrerPolicy = "no-referrer-when-downgrade";
        peta.appendChild(fr); peta.hidden = false;
      }
      wadah.appendChild(n);
    });

    var dc = C.dressCode;
    if (dc && (adaIsi(dc.teks) || adaIsi(dc.warna))) {
      $("#dress-code").hidden = false;
      (dc.warna || []).forEach(function (w) {
        if (!/^#[0-9a-f]{3,8}$/i.test(w)) return;
        var s = document.createElement("span");
        s.style.background = w; s.title = w;
        $("#swatch").appendChild(s);
      });
    }
    var linkS = C.streaming && C.streaming.link;
    if (linkS) $("#link-streaming").href = linkS;
  }

  /* ---------- hitung mundur ---------- */
  function hitungMundur() {
    var ev = (C.acara || [])[0];
    var target = ev && keTanggal(ev.tanggal, ev.mulai, ev);
    var wadah = $("#hitung-mundur");
    if (!target) { wadah.hidden = true; $("#simpan-tanggal").hidden = true; return; }
    $("#simpan-tanggal").href = tautanKalender(ev);
    var el = {};
    ["hari", "jam", "menit", "detik"].forEach(function (k) { el[k] = $('[data-hm="' + k + '"]'); });
    function jalan() {
      var sisa = target.getTime() - Date.now();
      if (sisa <= 0) {
        wadah.hidden = true;
        var s = $("#hm-selesai");
        s.textContent = sisa > -12 * 3600 * 1000 ? "Hari bahagia telah tiba" : "Terima kasih atas doa dan kehadirannya";
        s.hidden = false;
        return false;
      }
      var dtk = Math.floor(sisa / 1000);
      el.hari.textContent = Math.floor(dtk / 86400);
      el.jam.textContent = pad(Math.floor(dtk % 86400 / 3600));
      el.menit.textContent = pad(Math.floor(dtk % 3600 / 60));
      el.detik.textContent = pad(dtk % 60);
      return true;
    }
    if (jalan()) { var t = setInterval(function () { if (!jalan()) clearInterval(t); }, 1000); }
  }

  /* ---------- cerita cinta ---------- */
  function isiCerita() {
    var ol = $("#linimasa");
    (C.ceritaCinta || []).forEach(function (c) {
      var li = document.createElement("li");
      li.className = "muncul";
      var w = document.createElement("p"); w.className = "waktu"; isi(w, c.waktu || "");
      var h = document.createElement("h3"); isi(h, c.judul || "");
      var p = document.createElement("p"); isi(p, c.cerita || "");
      li.appendChild(w); li.appendChild(h); li.appendChild(p);
      ol.appendChild(li);
    });
  }

  /* ---------- galeri + lightbox ---------- */
  var fotoAktif = 0;
  function isiGaleri() {
    var kisi = $("#kisi-foto"), daftar = C.galeri || [];
    daftar.forEach(function (src, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "foto muncul";
      b.style.setProperty("--d", ((i % 3) * 0.12).toFixed(2) + "s");
      b.setAttribute("aria-label", "Buka foto " + (i + 1));
      var img = document.createElement("img");
      img.src = src; img.alt = "Foto galeri " + (i + 1); img.loading = "lazy"; img.decoding = "async";
      b.appendChild(img);
      b.addEventListener("click", function () { bukaLightbox(i); });
      kisi.appendChild(b);
    });
    var lb = $("#lightbox"), lbImg = $("#lightbox-img"), tGanti, tTutup;
    function pasang(i) {
      fotoAktif = (i + daftar.length) % daftar.length;
      lbImg.src = daftar[fotoAktif];
      lbImg.alt = "Foto galeri " + (fotoAktif + 1);
      $("#lb-urutan").textContent = (fotoAktif + 1) + " / " + daftar.length;
    }
    function tampil(i) {
      if (mf.matches) { pasang(i); return; }
      lbImg.classList.add("ganti");
      clearTimeout(tGanti);
      tGanti = setTimeout(function () {
        pasang(i);
        var selesai = function () { lbImg.classList.remove("ganti"); };
        if (lbImg.complete) requestAnimationFrame(selesai); else lbImg.onload = selesai;
      }, 220);
    }
    function bukaLightbox(i) {
      clearTimeout(tTutup);
      pasang(i);
      lbImg.classList.remove("ganti");
      lb.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { lb.classList.add("buka"); }); });
      $("#lb-tutup").focus();
    }
    function tutup() {
      lb.classList.remove("buka");
      tTutup = setTimeout(function () { lb.hidden = true; }, mf.matches ? 0 : 350);
    }
    $("#lb-tutup").addEventListener("click", tutup);
    $("#lb-kiri").addEventListener("click", function () { tampil(fotoAktif - 1); });
    $("#lb-kanan").addEventListener("click", function () { tampil(fotoAktif + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) tutup(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") tutup();
      if (e.key === "ArrowLeft") tampil(fotoAktif - 1);
      if (e.key === "ArrowRight") tampil(fotoAktif + 1);
    });
    var x0 = null;
    lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) tampil(fotoAktif + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  /* ---------- turut mengundang ---------- */
  function isiTurut() {
    var ul = $("#daftar-turut");
    (C.turutMengundang || []).forEach(function (t) {
      var li = document.createElement("li"); li.textContent = t; ul.appendChild(li);
    });
  }

  /* ---------- koneksi ke Google Sheets ---------- */
  var modeDemo = !C.apiUrl;
  function kirim(data) {
    return fetch(C.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // sengaja text/plain agar tidak diblokir CORS
      body: JSON.stringify(data)
    }).then(function (r) { return r.json(); });
  }
  function catatDibuka() {
    if (modeDemo || !tamu.kode || param.has("preview")) return;
    var kunci = "dibuka-" + tamu.kode;
    try { if (sessionStorage.getItem(kunci)) return; sessionStorage.setItem(kunci, "1"); } catch (e) { /* abaikan */ }
    kirim({ aksi: "buka", kode: tamu.kode }).catch(function () { /* abaikan */ });
  }

  /* ---------- ucapan ---------- */
  var semuaUcapan = [], tampilSampai = 10;
  var rtf = window.Intl && Intl.RelativeTimeFormat ? new Intl.RelativeTimeFormat("id", { numeric: "auto" }) : null;
  function waktuRelatif(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "";
    var dtk = (d.getTime() - Date.now()) / 1000;
    var satuan = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
    if (!rtf) return d.toLocaleString("id-ID");
    for (var i = 0; i < satuan.length; i++) {
      if (Math.abs(dtk) >= satuan[i][1]) return rtf.format(Math.round(dtk / satuan[i][1]), satuan[i][0]);
    }
    return "baru saja";
  }
  function tampilkanUcapan() {
    var ul = $("#daftar-ucapan"), tpl = $("#tpl-ucapan");
    ul.textContent = "";
    if (!semuaUcapan.length) {
      var kosong = document.createElement("li");
      kosong.className = "kosong";
      kosong.textContent = "Belum ada ucapan. Jadilah yang pertama mendoakan kami.";
      ul.appendChild(kosong);
    }
    semuaUcapan.slice(0, tampilSampai).forEach(function (u) {
      var n = tpl.content.cloneNode(true);
      $(".ucapan-nama", n).textContent = u.nama || "Tamu";
      var l = $(".lencana", n);
      if (u.hadir === true) l.textContent = "Hadir";
      else if (u.hadir === false) { l.textContent = "Tidak hadir"; l.classList.add("tidak"); }
      $(".ucapan-isi", n).textContent = u.ucapan || "";
      var t = $(".ucapan-waktu", n);
      t.textContent = waktuRelatif(u.waktu);
      if (u.waktu) t.dateTime = u.waktu;
      ul.appendChild(n);
    });
    $("#jumlah-ucapan").textContent = semuaUcapan.length ? semuaUcapan.length + " ucapan" : "";
    $("#ucapan-lagi").hidden = semuaUcapan.length <= tampilSampai;
  }
  function muatUcapan() {
    if (modeDemo) {
      semuaUcapan = (C.contohUcapan || []).slice();
      $("#label-demo").hidden = false;
      tampilkanUcapan();
      return;
    }
    var ul = $("#daftar-ucapan");
    ul.innerHTML = '<li class="kosong">Memuat ucapan…</li>';
    var sep = C.apiUrl.indexOf("?") >= 0 ? "&" : "?";
    fetch(C.apiUrl + sep + "aksi=ucapan")
      .then(function (r) { return r.json(); })
      .then(function (res) {
        semuaUcapan = (res && res.ok && Array.isArray(res.data)) ? res.data : [];
        tampilkanUcapan();
      })
      .catch(function () {
        ul.innerHTML = '<li class="kosong">Ucapan belum bisa dimuat. Coba muat ulang halaman.</li>';
      });
  }

  /* ---------- formulir RSVP ---------- */
  function siapkanRsvp() {
    var form = $("#form-rsvp");
    if (!form) return;
    var maks = Math.max(1, Math.min(20, Number(C.rsvp && C.rsvp.maksimalTamu) || 4));
    var sel = $("#rsvp-jumlah");
    for (var i = 1; i <= maks; i++) {
      var o = document.createElement("option"); o.value = i; o.textContent = i + " orang"; sel.appendChild(o);
    }
    if (tamu.nama) $("#rsvp-nama").value = tamu.nama;
    $$('input[name="hadir"]', form).forEach(function (r) {
      r.addEventListener("change", function () { $("#isian-jumlah").hidden = $("#rsvp-tidak").checked; });
    });
    var pesan = $("#pesan-form"), tombol = $("#kirim-rsvp");
    function tulisPesan(teks, jenis) { pesan.textContent = teks; pesan.className = "pesan-form " + (jenis || ""); }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nama = $("#rsvp-nama").value.trim();
      var pilih = $('input[name="hadir"]:checked', form);
      var ucapan = $("#rsvp-ucapan").value.trim();
      if (!nama) { tulisPesan("Mohon isi nama Anda.", "galat"); $("#rsvp-nama").focus(); return; }
      if (!pilih) { tulisPesan("Mohon pilih konfirmasi kehadiran.", "galat"); return; }
      var data = { aksi: "rsvp", kode: tamu.kode, nama: nama, hadir: pilih.value, jumlah: pilih.value === "ya" ? Number(sel.value) : 0, ucapan: ucapan };
      function berhasil() {
        if (ucapan) {
          semuaUcapan.unshift({ nama: nama, hadir: data.hadir === "ya", ucapan: ucapan, waktu: new Date().toISOString() });
          tampilkanUcapan();
        }
        $("#rsvp-ucapan").value = "";
        tulisPesan(modeDemo
          ? "Mode demo: jawaban tampil di halaman ini saja karena apiUrl di config.js belum diisi."
          : "Terima kasih, konfirmasi Anda sudah kami terima.", "sukses");
      }
      if (modeDemo) { berhasil(); return; }
      tombol.disabled = true; tombol.textContent = "Mengirim…"; tulisPesan("");
      kirim(data)
        .then(function (res) { if (!res || !res.ok) throw new Error(res && res.pesan || "Gagal"); berhasil(); })
        .catch(function (err) {
          tulisPesan("Gagal mengirim: " + (err && err.message && err.message !== "Failed to fetch" ? err.message : "periksa koneksi internet lalu coba lagi."), "galat");
        })
        .then(function () { tombol.disabled = false; tombol.textContent = "Kirim"; });
    });
    $("#ucapan-lagi").addEventListener("click", function () { tampilSampai += 10; tampilkanUcapan(); });
  }

  /* ---------- navigasi bawah ---------- */
  var IKON = {
    mempelai: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>',
    acara: '<path d="M7 3v3M17 3v3M4 9h16M5.5 5h13A1.5 1.5 0 0 1 20 6.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-12A1.5 1.5 0 0 1 5.5 5Z"/>',
    galeri: '<path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-11Z"/><path d="m4 16 4.5-4.5 4 4 2.5-2.5L20 18"/><circle cx="15.5" cy="9.5" r="1.3"/>',
    rsvp: '<path d="M5 5.5h14A1.5 1.5 0 0 1 20.5 7v8a1.5 1.5 0 0 1-1.5 1.5h-7l-4.5 3.5v-3.5H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5Z"/>'
  };
  var LABEL = { mempelai: "Mempelai", acara: "Acara", galeri: "Galeri", rsvp: "Ucapan" };
  function buatNav() {
    var nav = $("#nav-bawah");
    var ada = Object.keys(LABEL).filter(function (id) { var s = document.getElementById(id); return s && !s.hidden; });
    if (ada.length < 2) return;
    ada.forEach(function (id) {
      var a = document.createElement("a");
      a.href = "#" + id;
      a.setAttribute("data-ke", id);
      a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + IKON[id] + "</svg><span>" + LABEL[id] + "</span>";
      nav.appendChild(a);
    });
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entri) {
        entri.forEach(function (en) {
          if (!en.isIntersecting) return;
          $$("a", nav).forEach(function (a) { a.classList.toggle("aktif", a.getAttribute("data-ke") === en.target.id); });
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      ada.forEach(function (id) { io.observe(document.getElementById(id)); });
    }
  }

  /* ---------- musik & pemutar lagu ---------- */
  var audio = $("#audio"), tMusik = $("#tombol-musik"), pemutar = $("#pemutar");
  function menit(d) { d = Math.max(0, Math.floor(d || 0)); return Math.floor(d / 60) + ":" + pad(d % 60); }
  function segarkanStatus() {
    var main = !audio.paused;
    tMusik.classList.toggle("berputar", main);
    tMusik.classList.toggle("jeda", !main);
    tMusik.setAttribute("aria-label", main ? "Jeda musik" : "Putar musik");
    if (pemutar) {
      pemutar.classList.toggle("main", main);
      $("#lagu-putar").setAttribute("aria-label", main ? "Jeda lagu" : "Putar lagu");
    }
  }
  function aturMusik(main) {
    if (!C.musik) return;
    if (main) {
      var p = audio.play();
      if (p && p.catch) p.catch(segarkanStatus);
    } else {
      audio.pause();
    }
  }
  function siapkanMusik() {
    if (!C.musik) return;
    audio.src = C.musik;
    tMusik.addEventListener("click", function () { aturMusik(audio.paused); });
    audio.addEventListener("play", segarkanStatus);
    audio.addEventListener("pause", segarkanStatus);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && !audio.paused) { audio.pause(); audio.dataset.lanjut = "1"; }
      else if (!document.hidden && audio.dataset.lanjut) { delete audio.dataset.lanjut; aturMusik(true); }
    });
    if (!pemutar) return;
    pemutar.hidden = false;
    var posisi = $("#lagu-posisi"), geser = false;
    $("#lagu-putar").addEventListener("click", function () { aturMusik(audio.paused); });
    $("#lagu-mundur").addEventListener("click", function () { audio.currentTime = Math.max(0, audio.currentTime - 10); });
    $("#lagu-maju").addEventListener("click", function () { if (audio.duration) audio.currentTime = Math.min(audio.duration - 1, audio.currentTime + 10); });
    audio.addEventListener("loadedmetadata", function () { $("#lagu-total").textContent = menit(audio.duration); });
    audio.addEventListener("timeupdate", function () {
      $("#lagu-kini").textContent = menit(audio.currentTime);
      if (!geser && audio.duration) posisi.value = Math.round(audio.currentTime / audio.duration * 1000);
    });
    posisi.addEventListener("input", function () {
      geser = true;
      if (audio.duration) $("#lagu-kini").textContent = menit(posisi.value / 1000 * audio.duration);
    });
    posisi.addEventListener("change", function () {
      if (audio.duration) audio.currentTime = posisi.value / 1000 * audio.duration;
      geser = false;
    });
  }

  /* ---------- animasi muncul ---------- */
  function tampakkan(daftar) { daftar.forEach(function (e) { e.classList.add("tampak"); }); }
  function mulaiAnimasi() {
    var el = $$(".kolom .muncul, .kolom .bingkai-anim");
    if (!bisaAnimasi) { tampakkan(el); return; }
    var io = new IntersectionObserver(function (entri) {
      entri.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("tampak"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    el.forEach(function (e) { io.observe(e); });
  }

  /* ---------- buka undangan (amplop) ---------- */
  var sudahDibuka = false;
  function bukaUndangan(langsung) {
    if (sudahDibuka) return;
    sudahDibuka = true;
    var s = $("#sampul");
    if (C.musik) { tMusik.hidden = false; aturMusik(true); }   // harus di dalam ketukan agar musik boleh berbunyi
    document.documentElement.classList.remove("terkunci");
    $("#nav-bawah").hidden = !$("#nav-bawah").children.length;
    window.scrollTo(0, 0);
    if (langsung === true || mf.matches) {
      s.hidden = true; kelopakJalan = false; mulaiAnimasi(); return;
    }
    $("#amplop").classList.add("dibuka");
    s.classList.add("terbuka");
    setTimeout(mulaiAnimasi, 1500);
    setTimeout(function () { s.hidden = true; kelopakJalan = false; }, 2700);
  }

  /* ---------- jalankan ---------- */
  function mulai() {
    isiTeks();
    aturTampil();
    lepasKupu();
    isiMempelai();
    isiAcara();
    hitungMundur();
    isiCerita();
    isiGaleri();
    isiTurut();
    siapkanRsvp();
    muatUcapan();
    buatNav();
    siapkanMusik();
    catatDibuka();
    kelopakJatuh();
    document.documentElement.classList.add("terkunci");
    if (bisaAnimasi) document.documentElement.classList.add("siap-animasi");
    $("#buka-undangan").addEventListener("click", bukaUndangan);
    $("#segel").addEventListener("click", bukaUndangan);
    if (location.hash && location.hash.length > 1) {
      // link langsung ke bagian tertentu: lewati sampul
      bukaUndangan(true);
      var tujuan = document.getElementById(location.hash.slice(1));
      if (tujuan) setTimeout(function () { tujuan.scrollIntoView(); }, 60);
    }
  }

  window.UNDANGAN_SIAP = true;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mulai);
  else mulai();
})();
