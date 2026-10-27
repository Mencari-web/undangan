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

  function aturFokus(img, fokus) {
    if (!/^\s*-?\d+(\.\d+)?%\s+-?\d+(\.\d+)?%\s*$/.test(fokus || "")) return;
    img.style.objectPosition = fokus;
    img.style.transformOrigin = fokus;
  }

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
      var f = img.getAttribute("data-fokus") && ambil(C, img.getAttribute("data-fokus"));
      if (f) aturFokus(img, f);
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
      fotoSampul: C.fotoUtama,
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

  /* ---------- kupu-kupu (sayap 3D mengepak) ---------- */
  function lepasKupu() {
    var tpl = $("#tpl-kupu");
    if (!tpl) return;
    var acak = function (a, b) { return a + Math.random() * (b - a); };
    $$("[data-kupu]").forEach(function (titik) {
      var n = Number(titik.getAttribute("data-kupu")) || 1;
      var jenis = (titik.getAttribute("data-jenis") || "emas").split(",");
      for (var i = 0; i < n; i++) {
        var k = tpl.content.firstElementChild.cloneNode(true);
        k.classList.add("kupu-" + (jenis[i % jenis.length] || "emas").trim());
        var sisi = titik.hasAttribute("data-sisi");
        k.style.left = (sisi ? (i % 2 ? acak(70, 86) : acak(4, 18)) : acak(6, 84)).toFixed(1) + "%";
        k.style.top = acak(8, 70).toFixed(1) + "%";
        k.style.width = acak(32, 50).toFixed(0) + "px";
        k.style.setProperty("--dur", acak(13, 22).toFixed(1) + "s");
        k.style.setProperty("--tunda", (-acak(0, 12)).toFixed(1) + "s");
        k.style.setProperty("--kepak", acak(0.24, 0.36).toFixed(2) + "s");
        ["1", "2", "3"].forEach(function (j) {
          k.style.setProperty("--dx" + j, acak(-80, 80).toFixed(0) + "px");
          k.style.setProperty("--dy" + j, acak(-100, 40).toFixed(0) + "px");
        });
        titik.parentNode.insertBefore(k, titik);
      }
      titik.remove();
    });
  }

  /* ---------- kelopak & bunga bertaburan ---------- */
  var kelopakJalan = false;   // kanvas sampul
  function taburBunga(kanvas, opsi) {
    if (!kanvas || mf.matches || !kanvas.getContext) return null;
    var ctx = kanvas.getContext("2d");
    var KELOPAK = [["#3E0915", "#7A1A30"], ["#5E0F22", "#A8304A"], ["#C9677A", "#F3C3CB"], ["#E8A2AE", "#FCE6E9"], ["#F6EEE2", "#FFFFFF"]];
    var BUNGA = [["#F4C3CB", "#E8A2AE", "#E2BD72"], ["#FFFDF8", "#F3E6D8", "#E2BD72"], ["#C9677A", "#8E2A40", "#F3DFA2"]];
    var dpr = Math.min(2, window.devicePixelRatio || 1), W = 0, H = 0, daftar = [], jalan = false;
    // lembar sprite kelopak ilustrasi (4 x 2 sel): 0-4 kelopak, 5-7 bunga kecil
    var atlas = new Image(), atlasSiap = false;
    atlas.onload = function () { atlasSiap = true; };
    atlas.src = "assets/img/hiasan/tabur-kelopak.webp";
    function ukur() {
      W = kanvas.clientWidth; H = kanvas.clientHeight;
      kanvas.width = W * dpr; kanvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function baru(awal) {
      var bunga = Math.random() < (opsi.bunga || 0.25);
      return {
        bunga: bunga, x: Math.random() * W, y: awal ? Math.random() * H : -24,
        r: (bunga ? 5 : 5) + Math.random() * (opsi.besar || 7), vy: (opsi.laju || 0.5) * (0.6 + Math.random() * 0.9),
        ayun: Math.random() * 6.28, putar: Math.random() * 6.28, vp: (Math.random() - 0.5) * 0.035,
        balik: Math.random() * 6.28, vb: 0.02 + Math.random() * 0.03,
        w: bunga ? BUNGA[Math.floor(Math.random() * BUNGA.length)] : KELOPAK[Math.floor(Math.random() * KELOPAK.length)],
        sel: bunga ? 5 + Math.floor(Math.random() * 3) : [0, 0, 1, 1, 2, 3, 4][Math.floor(Math.random() * 7)]
      };
    }
    function kelopak(p, r) {
      var g = ctx.createLinearGradient(0, -r, 0, r);
      g.addColorStop(0, p.w[1]); g.addColorStop(1, p.w[0]);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.bezierCurveTo(r, -r * 0.6, r * 0.7, r * 0.8, 0, r);
      ctx.bezierCurveTo(-r * 0.7, r * 0.8, -r, -r * 0.6, 0, -r);
      ctx.fill();
    }
    function bunga(p) {
      for (var k = 0; k < 5; k++) {
        ctx.save(); ctx.rotate(k * 1.2566);
        var g = ctx.createLinearGradient(0, 0, 0, -p.r);
        g.addColorStop(0, p.w[1]); g.addColorStop(1, p.w[0]);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.ellipse(0, -p.r * 0.55, p.r * 0.36, p.r * 0.55, 0, 0, 6.283); ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = p.w[2]; ctx.beginPath(); ctx.arc(0, 0, p.r * 0.2, 0, 6.283); ctx.fill();
    }
    function langkah() {
      if (!jalan) return;
      ctx.clearRect(0, 0, W, H);
      daftar.forEach(function (p, i) {
        p.ayun += 0.018; p.balik += p.vb; p.y += p.vy; p.x += Math.sin(p.ayun) * 0.55; p.putar += p.vp;
        if (p.y > H + 24) daftar[i] = baru(false);
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.putar);
        ctx.scale(0.35 + 0.65 * Math.abs(Math.cos(p.balik)), 0.6 + 0.4 * Math.abs(Math.sin(p.ayun)));
        ctx.globalAlpha = opsi.alpha || 0.9;
        if (atlasSiap) {
          var ss = atlas.naturalWidth / 4, d = p.r * (p.bunga ? 2.5 : 2.8);
          ctx.drawImage(atlas, (p.sel % 4) * ss, Math.floor(p.sel / 4) * ss, ss, ss, -d / 2, -d / 2, d, d);
        } else if (p.bunga) bunga(p); else kelopak(p, p.r);
        ctx.restore();
      });
      requestAnimationFrame(langkah);
    }
    window.addEventListener("resize", ukur);
    return {
      mulai: function () {
        if (jalan) return;
        ukur();
        if (!daftar.length) for (var i = 0; i < (opsi.jumlah || 18); i++) daftar.push(baru(true));
        jalan = true; requestAnimationFrame(langkah);
      },
      henti: function () { jalan = false; ctx.clearRect(0, 0, W, H); }
    };
  }
  var taburSampul = null, taburIsi = null;
  function kelopakJatuh() {
    taburSampul = taburBunga($("#kelopak-jatuh"), { jumlah: 22, bunga: 0.3 });
    if (taburSampul) { taburSampul.mulai(); kelopakJalan = true; }
    taburIsi = taburBunga($("#kelopak-isi"), { jumlah: 11, bunga: 0.35, laju: 0.42, besar: 6, alpha: 0.82 });
  }

  /* ---------- mempelai ---------- */
  function isiMempelai() {
    var wadah = $("#profil-wadah"), tpl = $("#tpl-profil");
    var pakaiFoto = (C.tampilkan || {}).fotoMempelai === true;
    urutan().forEach(function (kunci, i) {
      var o = (C.mempelai || {})[kunci];
      if (!o) return;
      if (i > 0) {
        var dan = document.createElement("p");
        dan.className = "antara-profil";
        dan.setAttribute("aria-hidden", "true");
        dan.textContent = "&";
        wadah.appendChild(dan);
      }
      var n = tpl.content.cloneNode(true);
      if (pakaiFoto && o.foto) {
        var fig = $(".profil-foto", n), img = $(".foto-dalam img", fig);
        img.src = o.foto; img.alt = "Foto " + (o.panggilan || "");
        if (o.fokus) aturFokus(img, o.fokus);
        fig.hidden = false;
      }
      isi($(".nama-lengkap", n), o.namaLengkap || o.panggilan || "");
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
  var GAMBAR = {
    cincin: '<svg viewBox="0 0 120 84"><ellipse cx="46" cy="54" rx="27" ry="19" transform="rotate(-14 46 54)"/><ellipse cx="46" cy="54" rx="22" ry="14.5" transform="rotate(-14 46 54)"/><ellipse cx="77" cy="50" rx="27" ry="19" transform="rotate(16 77 50)"/><ellipse cx="77" cy="50" rx="22" ry="14.5" transform="rotate(16 77 50)"/><path d="M33 31l5-8h12l5 8-11 11zM33 31h22M38 23l6 8 6-8M44 31v11"/><path d="M66 12v8M62 16h8M98 24v6M95 27h6"/></svg>',
    kue: '<svg viewBox="0 0 120 84"><path d="M28 78h64M34 78V60h52v18M34 64c6 4 11 4 17 0s11-4 17 0 11 4 18 0M42 60V46h36v14M42 50c6 3 12 3 18 0s12-3 18 0M50 46V35h20v11M60 35v-5"/><path d="M60 29c-3-4-9-1-6 3l6 5 6-5c3-4-3-7-6-3z"/><circle cx="40" cy="71" r="1.2"/><circle cx="52" cy="71" r="1.2"/><circle cx="64" cy="71" r="1.2"/><circle cx="76" cy="71" r="1.2"/><path d="M86 22v6M83 25h6M32 30v5M29.5 32.5h5"/></svg>',
    pin: '<svg viewBox="0 0 120 84"><path d="M60 76S40 57 40 40a20 20 0 0 1 40 0c0 17-20 36-20 36z"/><path d="M60 45c-4-5-11-2-8 4l8 7 8-7c3-6-4-9-8-4z"/><ellipse cx="60" cy="78" rx="17" ry="3.2"/><path d="M86 20v6M83 23h6"/></svg>'
  };
  function isiAcara() {
    var wadah = $("#daftar-acara"), tpl = $("#tpl-acara");
    var daftar = C.acara || [];
    var kunciTempat = function (ev) { return [ev.tempat || "", ev.alamat || ""].join("|"); };
    var tempatUnik = [];
    daftar.forEach(function (ev) { if (tempatUnik.map(kunciTempat).indexOf(kunciTempat(ev)) < 0 && (ev.tempat || ev.alamat)) tempatUnik.push(ev); });
    daftar.forEach(function (ev, i) {
      var n = tpl.content.cloneNode(true);
      var d = keTanggal(ev.tanggal, ev.mulai, ev);
      $(".ikon-acara", n).innerHTML = i % 2 ? GAMBAR.kue : GAMBAR.cincin;
      isi($(".nama-acara", n), ev.nama || "");
      isi($(".hari-tanggal", n), d ? formatTanggal(d, ev) : "");
      var z = (ev.zonaWaktu || "WIB").toUpperCase();
      var akhir = /^\d{1,2}:\d{2}$/.test(ev.selesai || "") ? formatJam(ev.selesai) + " " + z : (ev.selesai ? "Selesai" : "");
      isi($(".jam", n), "Pukul " + formatJam(ev.mulai || "") + (akhir ? " – " + akhir : " " + z));
      if (tempatUnik.length > 1 && ev.tempat) { isi($(".tempat", n), ev.tempat); $(".tempat-acara", n).hidden = false; }
      var kal = $(".link-kalender", n), urlKal = tautanKalender(ev);
      if (urlKal) kal.href = urlKal; else kal.hidden = true;
      wadah.appendChild(n);
    });

    var lok = $("#lokasi"), tplL = $("#tpl-lokasi");
    tempatUnik.forEach(function (ev) {
      var n = tplL.content.cloneNode(true);
      $(".ikon-acara", n).innerHTML = GAMBAR.pin;
      isi($(".tempat", n), ev.tempat || "");
      isi($(".alamat", n), ev.alamat || "");
      var maps = $(".link-maps", n);
      if (ev.maps) maps.href = ev.maps; else maps.hidden = true;
      if (ev.petaEmbed && /^https:\/\/(www\.)?google\.com\/maps\/embed/.test(ev.petaEmbed)) {
        var peta = $(".peta", n), fr = document.createElement("iframe");
        fr.src = ev.petaEmbed; fr.loading = "lazy"; fr.title = "Peta " + (ev.tempat || "");
        fr.referrerPolicy = "no-referrer-when-downgrade";
        peta.appendChild(fr); peta.hidden = false;
      }
      lok.appendChild(n);
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

  /* ---------- galeri: dinding kenangan interaktif + lightbox ---------- */
  var fotoAktif = 0;
  var HIASAN_DINDING = ["rose", "calla", "lily", "hydr", "pearl", "fern", "lilypink", "anth"];
  function isiGaleri() {
    var daftar = (C.galeri || []).filter(Boolean);
    var dinding = $("#dinding"), dunia = $("#kisi-foto");
    if (!dinding || !daftar.length) return;

    /* --- susun benda di dinding --- */
    var SEL_L = 300, SEL_T = 330, TEPI = 70;
    var benda = [], W = 0, H = 0;
    daftar.forEach(function (src, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "foto";
      b.setAttribute("aria-label", "Buka foto " + (i + 1));
      var img = document.createElement("img");
      img.src = src; img.alt = "Foto galeri " + (i + 1); img.loading = "lazy"; img.decoding = "async"; img.draggable = false;
      img.addEventListener("load", function () {
        var r = img.naturalWidth / img.naturalHeight;
        if (r) img.style.aspectRatio = Math.max(0.66, Math.min(1.5, r)).toFixed(3);
      });
      b.appendChild(img);
      b.addEventListener("click", function () { if (!digeser) bukaLightbox(i); });
      dunia.appendChild(b);
      benda.push({ el: b, jenis: "foto", lebar: [205, 250] });
    });
    if (adaIsi(C.kutipanGaleri)) {
      var q = document.createElement("figure");
      q.className = "kartu-kutipan";
      var qp = document.createElement("blockquote"); isi(qp, C.kutipanGaleri);
      var qc = document.createElement("figcaption"); qc.textContent = namaPanggilan().join(" & ");
      q.appendChild(qp); q.appendChild(qc);
      dunia.appendChild(q);
      benda.push({ el: q, jenis: "kutipan", lebar: [220, 240] });
    }
    var segel = document.createElement("img");
    segel.className = "tabur segel"; segel.src = "assets/img/hiasan/tabur-segel.webp"; segel.alt = ""; segel.draggable = false;
    dunia.appendChild(segel);
    benda.push({ el: segel, jenis: "segel", lebar: [130, 150] });

    var bunga = [];
    function acakDari(seed) { var a = seed >>> 0; return function () { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; }
    function tata(seed, lembut) {
      var R = acakDari(seed);
      var n = benda.length, rasio = (dinding.clientWidth || 360) / (dinding.clientHeight || 450);
      var kol = Math.max(2, Math.round(Math.sqrt(n * rasio * SEL_T / SEL_L)));
      var bar = Math.ceil(n / kol);
      W = kol * SEL_L + TEPI * 2; H = bar * SEL_T + TEPI * 2;
      dunia.style.width = W + "px"; dunia.style.height = H + "px";
      var urut = benda.map(function (_, i) { return i; });
      for (var i = urut.length - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)); var t = urut[i]; urut[i] = urut[j]; urut[j] = t; }
      var sel = [];
      for (var r = 0; r < bar; r++) for (var c = 0; c < kol; c++) sel.push([c, r]);
      urut.forEach(function (bi, k) {
        var o = benda[bi], cr = sel[k];
        var x = TEPI + cr[0] * SEL_L + SEL_L / 2 + (R() - 0.5) * SEL_L * 0.22;
        var y = TEPI + cr[1] * SEL_T + SEL_T / 2 + (R() - 0.5) * SEL_T * 0.18;
        var w = o.lebar[0] + R() * (o.lebar[1] - o.lebar[0]);
        o.el.style.left = x.toFixed(0) + "px"; o.el.style.top = y.toFixed(0) + "px";
        o.el.style.width = w.toFixed(0) + "px";
        o.el.style.setProperty("--r", ((R() - 0.5) * (o.jenis === "segel" ? 30 : 15)).toFixed(1) + "deg");
        o.el.style.setProperty("--d", (0.08 * k).toFixed(2) + "s");
        o.el.style.zIndex = String(2 + Math.floor(R() * 3));
      });
      // bunga & mutiara di sela-sela (di sudut sel dan sel kosong)
      bunga.forEach(function (e) { e.remove(); }); bunga = [];
      var titik = [];
      for (var rr = 0; rr <= bar; rr++) for (var cc = 0; cc <= kol; cc++) if ((rr + cc) % 2 === (seed % 2)) titik.push([TEPI + cc * SEL_L, TEPI + rr * SEL_T, 1]);
      sel.slice(n).forEach(function (cr) { titik.push([TEPI + cr[0] * SEL_L + SEL_L / 2, TEPI + cr[1] * SEL_T + SEL_T / 2, 1.5]); });
      titik.forEach(function (p, k) {
        var e = document.createElement("img");
        var nama = HIASAN_DINDING[(k + seed) % HIASAN_DINDING.length];
        e.className = "tabur bunga-tabur"; e.src = "assets/img/hiasan/tabur-" + nama + ".webp"; e.alt = ""; e.draggable = false;
        var w = (nama === "pearl" ? 150 : 110 + R() * 50) * p[2];
        e.style.left = (p[0] + (R() - 0.5) * 50).toFixed(0) + "px"; e.style.top = (p[1] + (R() - 0.5) * 50).toFixed(0) + "px";
        e.style.width = w.toFixed(0) + "px";
        e.style.setProperty("--r", ((R() - 0.5) * 80).toFixed(0) + "deg");
        e.style.setProperty("--d", (0.4 + 0.05 * k).toFixed(2) + "s");
        e.style.zIndex = "6";
        dunia.appendChild(e); bunga.push(e);
      });
      if (lembut) { dunia.classList.add("menata"); setTimeout(function () { dunia.classList.remove("menata"); }, 1000); }
    }

    /* --- geser & perbesar --- */
    var s = 1, tx = 0, ty = 0, sPas = 1, sMin = 0.3, sMax = 3, anim = 0, digeser = false;
    var sentuh = window.matchMedia && matchMedia("(pointer: coarse)").matches;
    if (!sentuh) $("[data-petunjuk]", dinding).textContent = "Klik dua kali untuk zoom · Seret untuk jelajah";
    function ukur() { return { w: dinding.clientWidth, h: dinding.clientHeight }; }
    function batasi() {
      var v = ukur(), w = W * s, h = H * s;
      tx = w <= v.w ? (v.w - w) / 2 : Math.min(0, Math.max(v.w - w, tx));
      ty = h <= v.h ? (v.h - h) / 2 : Math.min(0, Math.max(v.h - h, ty));
    }
    function terapkan() {
      dunia.style.transform = "translate3d(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px,0) scale(" + s.toFixed(4) + ")";
      var besar = s > sPas * 1.04;
      dinding.classList.toggle("diperbesar", besar);
      dinding.style.touchAction = besar ? "none" : "pan-y";
    }
    function hitungPas() {
      var v = ukur();
      sPas = Math.min(v.w / W, v.h / H);
      sMin = sPas * 0.9; sMax = Math.max(sPas * 5, 1.6);
    }
    function keTarget(s2, px, py) {
      s2 = Math.max(sMin, Math.min(sMax, s2));
      return { s: s2, tx: px - (px - tx) * s2 / s, ty: py - (py - ty) * s2 / s };
    }
    function tween(t, dur) {
      cancelAnimationFrame(anim);
      var s0 = s, x0 = tx, y0 = ty, t0 = performance.now();
      if (mf.matches) dur = 1;
      (function langkah(now) {
        var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        s = s0 + (t.s - s0) * e; tx = x0 + (t.tx - x0) * e; ty = y0 + (t.ty - y0) * e;
        if (k >= 1) batasi();
        terapkan();
        if (k < 1) anim = requestAnimationFrame(langkah);
      })(t0);
    }
    function pas(halus) {
      hitungPas();
      var v = ukur(), t = { s: sPas, tx: (v.w - W * sPas) / 2, ty: (v.h - H * sPas) / 2 };
      if (halus) tween(t, 450); else { s = t.s; tx = t.tx; ty = t.ty; terapkan(); }
    }
    function zoomTengah(f) { var v = ukur(); tween(keTarget(s * f, v.w / 2, v.h / 2), 380); dipakai(); }
    function dipakai() { dinding.classList.add("dipakai"); }

    var jari = {}, gerak = null, ketukTerakhir = 0, ketukX = 0, ketukY = 0, kec = { x: 0, y: 0 }, tAkhir = 0;
    function posisi(e) { var r = dinding.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function daftarJari() { return Object.keys(jari).map(function (k) { return jari[k]; }); }
    function mulaiGerak() {
      var p = daftarJari();
      if (p.length >= 2) {
        var m = { x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 };
        gerak = { jenis: "cubit", d0: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1, s0: s, wx: (m.x - tx) / s, wy: (m.y - ty) / s };
      } else if (p.length === 1) {
        gerak = { jenis: "geser", x0: p[0].x, y0: p[0].y, tx0: tx, ty0: ty, t0: performance.now(), jauh: 0 };
      } else gerak = null;
    }
    dinding.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".dinding-kontrol")) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      cancelAnimationFrame(anim);
      if (!Object.keys(jari).length) digeser = false;
      jari[e.pointerId] = posisi(e);
      mulaiGerak();
      kec = { x: 0, y: 0 }; tAkhir = performance.now();
      window.addEventListener("pointermove", saatGerak, { passive: false });
      window.addEventListener("pointerup", saatLepas);
      window.addEventListener("pointercancel", saatLepas);
    });
    function saatGerak(e) {
      if (!(e.pointerId in jari)) return;
      var lama = jari[e.pointerId], baru = posisi(e);
      jari[e.pointerId] = baru;
      if (!gerak) return;
      if (gerak.jenis === "cubit") {
        var p = daftarJari(); if (p.length < 2) return;
        var d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
        var m = { x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 };
        s = Math.max(sMin * 0.85, Math.min(sMax * 1.15, gerak.s0 * d / gerak.d0));
        tx = m.x - gerak.wx * s; ty = m.y - gerak.wy * s;
        digeser = true; dipakai();
        terapkan();
        if (e.cancelable) e.preventDefault();
        return;
      }
      var dx = baru.x - gerak.x0, dy = baru.y - gerak.y0;
      gerak.jauh = Math.max(gerak.jauh, Math.hypot(dx, dy));
      if (gerak.jauh > 7) digeser = true;
      if (s <= sPas * 1.04 && e.pointerType !== "mouse") return;   // belum diperbesar: biarkan halaman bergulir
      tx = gerak.tx0 + dx; ty = gerak.ty0 + dy;
      var now = performance.now(), dt = Math.max(1, now - tAkhir);
      kec = { x: (baru.x - lama.x) / dt, y: (baru.y - lama.y) / dt }; tAkhir = now;
      batasi(); terapkan();
      if (digeser) dipakai();
      if (e.cancelable) e.preventDefault();
    }
    function saatLepas(e) {
      if (!(e.pointerId in jari)) return;
      var p = jari[e.pointerId];
      delete jari[e.pointerId];
      var sisa = Object.keys(jari).length;
      if (gerak && gerak.jenis === "cubit") {
        if (s < sMin || s > sMax) { var m = p; tween(keTarget(s, m.x, m.y), 300); } else { batasi(); terapkan(); }
        if (sisa) mulaiGerak(); else gerak = null;
      } else if (gerak && gerak.jenis === "geser") {
        var cepat = performance.now() - tAkhir < 60;
        if (!digeser && e.type === "pointerup") ketuk(p, e);
        else if (cepat && (Math.abs(kec.x) + Math.abs(kec.y)) > 0.25) luncur();
        gerak = null;
      }
      if (!sisa) {
        window.removeEventListener("pointermove", saatGerak);
        window.removeEventListener("pointerup", saatLepas);
        window.removeEventListener("pointercancel", saatLepas);
      }
    }
    function luncur() {
      var vx = kec.x * 16, vy = kec.y * 16;
      (function langkah() {
        vx *= 0.93; vy *= 0.93; tx += vx; ty += vy;
        batasi(); terapkan();
        if (Math.abs(vx) + Math.abs(vy) > 0.4) anim = requestAnimationFrame(langkah);
      })();
    }
    function ketuk(p, e) {
      var now = performance.now();
      var diFoto = e.target.closest && e.target.closest(".foto");
      if (!diFoto && now - ketukTerakhir < 320 && Math.hypot(p.x - ketukX, p.y - ketukY) < 40) {
        ketukTerakhir = 0;
        tween(s > sPas * 1.3 ? { s: sPas, tx: (ukur().w - W * sPas) / 2, ty: (ukur().h - H * sPas) / 2 } : keTarget(s * 2.4, p.x, p.y), 420);
        dipakai();
        return;
      }
      ketukTerakhir = now; ketukX = p.x; ketukY = p.y;
    }
    dinding.addEventListener("dblclick", function (e) {
      if (e.target.closest(".dinding-kontrol") || e.target.closest(".foto")) return;
      if (sentuh) return;
      var p = posisi(e);
      tween(s > sPas * 1.3 ? { s: sPas, tx: (ukur().w - W * sPas) / 2, ty: (ukur().h - H * sPas) / 2 } : keTarget(s * 2.4, p.x, p.y), 420);
      dipakai();
    });
    dinding.addEventListener("wheel", function (e) {
      if (!e.ctrlKey && !e.metaKey) return;   // pinch trackpad / Ctrl+scroll
      e.preventDefault();
      var p = posisi(e);
      cancelAnimationFrame(anim);
      var t = keTarget(s * Math.exp(-e.deltaY * 0.01), p.x, p.y);
      s = t.s; tx = t.tx; ty = t.ty; batasi(); terapkan(); dipakai();
    }, { passive: false });
    dinding.addEventListener("gesturestart", function (e) { e.preventDefault(); });   // Safari: cegah zoom halaman
    // dua jari = cubit dinding, bukan menggulir/memperbesar halaman
    dinding.addEventListener("touchmove", function (e) { if (e.touches.length > 1 && e.cancelable) e.preventDefault(); }, { passive: false });
    $("#dinding-plus").addEventListener("click", function () { zoomTengah(1.6); });
    $("#dinding-minus").addEventListener("click", function () { zoomTengah(1 / 1.6); });
    $("#dinding-pusat").addEventListener("click", function () { pas(true); dipakai(); });
    var seed = 7;
    $("#dinding-acak").addEventListener("click", function () {
      seed += 1;
      tata(seed, true);
      hitungPas(); pas(true); dipakai();
    });
    // foto yang mendapat fokus keyboard digeser ke tengah
    dunia.addEventListener("focusin", function (e) {
      var f = e.target.closest(".foto"); if (!f || s <= sPas * 1.04) return;
      var v = ukur(), x = parseFloat(f.style.left), y = parseFloat(f.style.top);
      tween({ s: s, tx: v.w / 2 - x * s, ty: v.h / 2 - y * s }, 350);
    });

    tata(seed, false);
    pas(false);
    if ("ResizeObserver" in window) {
      var lebarLama = 0;
      new ResizeObserver(function () {
        var w = dinding.clientWidth;
        if (!w || Math.abs(w - lebarLama) < 2) return;
        lebarLama = w; pas(false);
      }).observe(dinding);
    }
    // kupu-kupu yang hinggap di dinding
    var k = document.createElement("span");
    k.setAttribute("data-kupu", "2"); k.setAttribute("data-jenis", "pink,emas");
    dunia.appendChild(k);
    lepasKupu();

    /* --- lightbox --- */
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

  /* ---------- musik & piringan hitam ---------- */
  var audio = $("#audio"), tMusik = $("#tombol-musik"), pemutar = $("#pemutar");
  function segarkanStatus() {
    var main = !audio.paused;
    tMusik.classList.toggle("berputar", main);
    tMusik.classList.toggle("jeda", !main);
    tMusik.setAttribute("aria-label", main ? "Jeda musik" : "Putar musik");
    pemutar.classList.toggle("main", main);
    pemutar.setAttribute("aria-label", main ? "Jeda lagu" : "Putar lagu");
    var st = $(".piringan-status", pemutar);
    if (st) st.textContent = main ? "Sedang diputar" : "Ketuk untuk memutar";
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
    pemutar.hidden = false;
    tMusik.addEventListener("click", function () { aturMusik(audio.paused); });
    pemutar.addEventListener("click", function () { aturMusik(audio.paused); });
    audio.addEventListener("play", segarkanStatus);
    audio.addEventListener("pause", segarkanStatus);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && !audio.paused) { audio.pause(); audio.dataset.lanjut = "1"; }
      else if (!document.hidden && audio.dataset.lanjut) { delete audio.dataset.lanjut; aturMusik(true); }
    });
  }

  /* ---------- kedalaman 3D: parallax sampul & gulir ---------- */
  function kedalaman() {
    var adegan = $("[data-adegan]");
    $$("[data-dalam]").forEach(function (el) { el.style.setProperty("--d", el.getAttribute("data-dalam")); });
    if (mf.matches) return;
    var tx = 0, ty = 0, x = 0, y = 0, jalan = false;
    function langkah() {
      x += (tx - x) * 0.08; y += (ty - y) * 0.08;
      adegan.style.setProperty("--px", x.toFixed(3));
      adegan.style.setProperty("--py", y.toFixed(3));
      if (Math.abs(tx - x) > 0.002 || Math.abs(ty - y) > 0.002) requestAnimationFrame(langkah); else jalan = false;
    }
    function arah(nx, ny) {
      tx = Math.max(-1, Math.min(1, nx)); ty = Math.max(-1, Math.min(1, ny));
      if (!jalan && !sudahDibuka) { jalan = true; requestAnimationFrame(langkah); }
    }
    window.addEventListener("pointermove", function (e) {
      arah(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1);
    }, { passive: true });
    window.addEventListener("deviceorientation", function (e) {
      if (e.gamma == null) return;
      arah(e.gamma / 25, (e.beta - 45) / 30);
    }, { passive: true });

    var el = $$("[data-parallax]");
    if (!el.length) return;
    var antre = false;
    function gulir() {
      antre = false;
      var vh = innerHeight;
      el.forEach(function (e) {
        var r = e.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var p = (r.top + r.height / 2 - vh / 2) / vh;
        e.style.setProperty("--geser", (p * Number(e.getAttribute("data-parallax")) * -160).toFixed(1) + "px");
      });
    }
    window.addEventListener("scroll", function () { if (!antre) { antre = true; requestAnimationFrame(gulir); } }, { passive: true });
    gulir();
  }

  /* ---------- animasi muncul ---------- */
  function tampakkan(daftar) { daftar.forEach(function (e) { e.classList.add("tampak"); }); }
  function mulaiAnimasi() {
    var el = $$(".kolom .muncul, .kolom .dari-kiri, .kolom .dari-kanan, .kolom .tumbuh, .kolom .muncul-gapura");
    if (!bisaAnimasi) { tampakkan(el); return; }
    var io = new IntersectionObserver(function (entri) {
      entri.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("tampak"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    el.forEach(function (e) { io.observe(e); });
  }

  /* ---------- tirai teater & amplop ---------- */
  var P = C.pembukaan || {};
  var modeAwal = P.awal === undefined ? "tirai" : String(P.awal || "");
  var modeBuka = String(P.buka || "amplop");
  function nanti(ms, fn) { return setTimeout(fn, mf.matches ? 0 : ms); }
  function mulaiMusikDariKetukan() {
    if (!C.musik) return;
    tMusik.hidden = false; aturMusik(true);
  }
  // tirai: buka dari keadaan tertutup
  function tiraiBuka(selesai) {
    var t = $("#tirai");
    t.hidden = false;
    t.classList.remove("siap-tutup", "keluar");
    t.classList.add("membuka");
    nanti(1450, function () { t.classList.add("keluar"); });
    nanti(2300, function () { t.hidden = true; t.classList.remove("membuka", "keluar"); if (selesai) selesai(); });
  }
  // tirai: menutup dari keadaan terbuka (untuk efek "Buka Undangan")
  function tiraiTutup(selesai) {
    var t = $("#tirai");
    t.classList.remove("membuka", "keluar");
    t.classList.add("siap-tutup", "transisi");
    t.hidden = false;
    t.style.opacity = "0";
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        t.style.transition = "opacity .3s"; t.style.opacity = "1";
        t.classList.remove("siap-tutup");     // kain kembali melebar = tirai menutup
        nanti(1800, function () { t.style.transition = ""; t.style.opacity = ""; if (selesai) selesai(); });
      });
    });
  }
  // amplop: naik, segel lepas, tutup terbuka, surat keluar lalu membesar
  function amplopMain(diTengah, selesai) {
    var L = $("#amplop-layar"), surat = $(".amplop-surat", L);
    L.classList.remove("awal");
    nanti(10, function () { L.classList.add("segel-lepas"); });
    nanti(380, function () { L.classList.add("tutup-buka"); });
    nanti(760, function () { L.classList.add("tutup-belakang"); });
    nanti(900, function () { L.classList.add("surat-naik"); });
    nanti(1750, function () {
      var r = surat.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
      L.style.setProperty("--zx", (vw / 2 - (r.left + r.width / 2)).toFixed(1) + "px");
      L.style.setProperty("--zy", (vh / 2 - (r.top + r.height / 2)).toFixed(1) + "px");
      L.style.setProperty("--zz", (Math.max(vw / r.width, vh / r.height) * 1.08).toFixed(3));
      L.classList.add("surat-penuh");
    });
    nanti(2650, function () { if (diTengah) diTengah(); L.classList.add("selesai"); });
    nanti(3300, function () {
      L.hidden = true;
      L.className = "amplop-layar";
      if (selesai) selesai();
    });
  }
  function amplopTampil(awal) {
    var L = $("#amplop-layar");
    L.className = "amplop-layar" + (awal ? " awal" : "");
    L.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { L.classList.add("tampil"); }); });
  }
  // tampilan paling awal sebelum sampul
  function siapkanPembuka() {
    var t = $("#tirai");
    var mono = $(".plakat-mono", t);
    if (mono) {
      var nama = namaPanggilan();
      mono.textContent = "";
      nama.forEach(function (n, i) {
        if (i) { var a = document.createElement("span"); a.className = "amp"; a.textContent = " & "; mono.appendChild(a); }
        mono.appendChild(document.createTextNode(n.charAt(0).toUpperCase()));
      });
    }
    if (modeAwal === "tirai") {
      var sudah = false;
      var buka = function () {
        if (sudah) return; sudah = true;
        mulaiMusikDariKetukan();
        $("#sampul").classList.add("dari-tirai");
        tiraiBuka();
      };
      t.addEventListener("click", buka);
      t.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); buka(); } });
      return;
    }
    t.hidden = true;
    if (modeAwal === "amplop") {
      amplopTampil(true);
      var sekali = false;
      $("#amplop-layar").addEventListener("click", function () {
        if (sekali || !$("#amplop-layar").classList.contains("awal")) return; sekali = true;
        mulaiMusikDariKetukan();
        amplopMain(function () { $("#sampul").classList.add("dari-tirai"); });
      });
    }
  }

  /* ---------- buka undangan ---------- */
  var sudahDibuka = false;
  function tampilkanIsi() {
    var s = $("#sampul");
    document.documentElement.classList.remove("terkunci");
    $("#nav-bawah").hidden = !$("#nav-bawah").children.length;
    s.hidden = true;
    window.scrollTo(0, 0);
    if (taburSampul) taburSampul.henti();
    if (taburIsi) taburIsi.mulai();
    mulaiAnimasi();
  }
  function bukaUndangan(langsung) {
    if (sudahDibuka) return;
    sudahDibuka = true;
    mulaiMusikDariKetukan();   // harus di dalam ketukan agar musik boleh berbunyi
    if (langsung === true || mf.matches) {
      $("#tirai").hidden = true; $("#amplop-layar").hidden = true;
      tampilkanIsi(); return;
    }
    if (modeBuka === "amplop") {
      amplopTampil(false);
      nanti(800, function () { amplopMain(tampilkanIsi); });
    } else if (modeBuka === "tirai") {
      tiraiTutup(function () { tampilkanIsi(); tiraiBuka(); });
    } else {
      var s = $("#sampul");
      s.classList.add("membuka");
      nanti(900, function () {
        document.documentElement.classList.remove("terkunci");
        $("#nav-bawah").hidden = !$("#nav-bawah").children.length;
        window.scrollTo(0, 0);
        if (taburIsi) taburIsi.mulai();
        mulaiAnimasi();
      });
      nanti(1900, function () { s.hidden = true; if (taburSampul) taburSampul.henti(); });
    }
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
    kedalaman();
    $("#buka-undangan").addEventListener("click", bukaUndangan);
    if (!(location.hash && location.hash.length > 1)) siapkanPembuka();
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
