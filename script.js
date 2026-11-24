// ===== JAVASCRIPT UNTUK SEMUA HALAMAN (index.html & login.html) =====
// Dimuat di <head> supaya tema terpasang sebelum halaman tampil.
// Bagian yang butuh elemen halaman dijalankan setelah halaman siap,
// dan setiap fitur dilewati otomatis jika elemennya tidak ada di halaman itu.
(function () {
  var root = document.documentElement;

  // ---------- PENGATURAN FORMULIR PERTANYAAN ----------
  // Isi salah satu agar pesan pengunjung benar-benar sampai ke Anda:
  //  1) FORM_ENDPOINT : alamat layanan formulir, mis. 'https://formspree.io/f/xxxxxxx'
  //  2) EMAIL_TUJUAN  : email Anda, mis. 'nama@email.com' (membuka aplikasi email pengunjung)
  // Jika keduanya kosong, formulir hanya berjalan sebagai DEMO (pesan tidak dikirim ke mana pun).
  var FORM_ENDPOINT = '';
  var EMAIL_TUJUAN  = '';

  // ---------- 0. PASANG TEMA SECEPATNYA (anti-kedip) ----------
  // Urutan: pilihan tersimpan > pengaturan sistem perangkat.
  var tema = null;
  try { tema = localStorage.getItem('tema'); } catch (e) {}
  if (tema !== 'dark' && tema !== 'light') {
    tema = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  root.setAttribute('data-theme', tema);

  document.addEventListener('DOMContentLoaded', function () {
    var kurangiGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- 1. TAHUN DI FOOTER ----------
    var tahun = document.getElementById('tahun');
    if (tahun) tahun.textContent = new Date().getFullYear();

    // ---------- 2. TOMBOL GELAP / TERANG ----------
    var tombolTema = document.getElementById('themeToggle');
    function perbaruiTombolTema() {
      if (!tombolTema) return;
      var gelap = root.getAttribute('data-theme') === 'dark';
      tombolTema.setAttribute('aria-pressed', gelap ? 'true' : 'false');
      tombolTema.setAttribute('aria-label', gelap ? 'Ganti ke mode terang' : 'Ganti ke mode gelap');
    }
    if (tombolTema) {
      tombolTema.addEventListener('click', function () {
        var baru = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        var ganti = function () {
          root.setAttribute('data-theme', baru);
          try { localStorage.setItem('tema', baru); } catch (e) {}
          perbaruiTombolTema();
        };
        // Cara utama: View Transitions (crossfade mulus satu layar, tanpa patah-patah)
        if (document.startViewTransition && !kurangiGerak) { document.startViewTransition(ganti); return; }
        // Cadangan untuk browser lama
        root.classList.add('theme-anim');
        ganti();
        setTimeout(function () { root.classList.remove('theme-anim'); }, 600);
      });
    }
    // Ikuti tema sistem selama pengguna belum memilih sendiri
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      var tersimpan = null;
      try { tersimpan = localStorage.getItem('tema'); } catch (err) {}
      if (!tersimpan) { root.setAttribute('data-theme', e.matches ? 'dark' : 'light'); perbaruiTombolTema(); }
    });
    perbaruiTombolTema();

    // ---------- 2b. MENU SAMPING (tombol tiga garis) ----------
    var menuBtn   = document.getElementById('menuBtn');
    var menuClose = document.getElementById('menuClose');
    var menuOver  = document.getElementById('menuOverlay');
    var drawer    = document.getElementById('menu');
    if (menuBtn && drawer) {
      var bukaMenu = function () {
        root.classList.add('menu-open');
        menuBtn.setAttribute('aria-expanded', 'true');
        menuBtn.setAttribute('aria-label', 'Tutup menu');
        setTimeout(function () { menuClose.focus(); }, 60);
      };
      var tutupMenu = function (balikFokus) {
        root.classList.remove('menu-open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-label', 'Buka menu');
        if (balikFokus) menuBtn.focus();
      };
      var menuTerbuka = function () { return root.classList.contains('menu-open'); };

      menuBtn.addEventListener('click', function () { menuTerbuka() ? tutupMenu(true) : bukaMenu(); });
      menuClose.addEventListener('click', function () { tutupMenu(true); });
      menuOver.addEventListener('click', function () { tutupMenu(true); });
      // Memilih salah satu menu langsung menutup menu
      drawer.addEventListener('click', function (e) {
        if (e.target.closest('a')) tutupMenu(false);
      });
      document.addEventListener('keydown', function (e) {
        if (!menuTerbuka()) return;
        if (e.key === 'Escape') { tutupMenu(true); return; }
        // Tab berputar di dalam menu selama menu terbuka
        if (e.key === 'Tab') {
          var fokus = drawer.querySelectorAll('a[href], button');
          var awal = fokus[0], akhir = fokus[fokus.length - 1];
          if (e.shiftKey && document.activeElement === awal) { e.preventDefault(); akhir.focus(); }
          else if (!e.shiftKey && document.activeElement === akhir) { e.preventDefault(); awal.focus(); }
        }
      });
    }

    // ---------- 3. BAR PROGRES MEMBACA (halaman utama) ----------
    var bar = document.getElementById('progress');
    if (bar) {
      var menunggu = false;
      var ukurProgres = function () {
        var tinggi = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = 'scaleX(' + (tinggi > 0 ? window.scrollY / tinggi : 0) + ')';
        menunggu = false;
      };
      window.addEventListener('scroll', function () {
        if (!menunggu) { menunggu = true; requestAnimationFrame(ukurProgres); }
      }, { passive: true });
      ukurProgres();
    }

    // ---------- 4. ELEMEN MUNCUL SAAT DI-SCROLL ----------
    // (menu yang aktif sudah ditandai langsung di HTML setiap halaman)
    if ('IntersectionObserver' in window && !kurangiGerak) {
      var target = document.querySelectorAll(
        '.about .wrap > *, .info, .card, .care-box, .note, .callout, .explore-card, .stat, ' +
        '.morph, .step, .profile > div, .flow-row, .param, .q, .photo, .rf-card, .thermo, ' +
        '.checklist li, .pager, .quiz-end, .contact .head, .ask-card, #askBody .field, #askBody .btn.submit'
      );
      var muncul = new IntersectionObserver(function (daftar) {
        daftar.forEach(function (d) {
          if (!d.isIntersecting) return;
          var el = d.target;
          el.classList.add('in');
          muncul.unobserve(el);
          // Setelah selesai, lepas kelas supaya efek hover tidak ikut tertunda
          setTimeout(function () { el.classList.remove('reveal', 'in'); }, 1400);
        });
      }, { threshold: 0.12 });

      target.forEach(function (el) {
        var urutan = Array.prototype.indexOf.call(el.parentNode.children, el);
        el.style.setProperty('--d', (urutan % 6) * 0.09 + 's');
        el.classList.add('reveal');
        muncul.observe(el);
      });
    }

    // ---------- 5b. GARIS HIAS JUDUL MEMANJANG SAAT TERLIHAT ----------
    var judul = document.querySelectorAll('h2');
    if ('IntersectionObserver' in window) {
      var garis = new IntersectionObserver(function (daftar) {
        daftar.forEach(function (d) {
          if (d.isIntersecting) { d.target.classList.add('tampak'); garis.unobserve(d.target); }
        });
      }, { threshold: 0.6 });
      judul.forEach(function (h) { garis.observe(h); });
    }

    // ---------- 5c. TOMBOL KEMBALI KE ATAS ----------
    var keAtas = document.getElementById('toTop');
    if (keAtas) {
      var atur = function () { keAtas.classList.toggle('tampak', window.scrollY > 500); };
      window.addEventListener('scroll', atur, { passive: true });
      atur();
      keAtas.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: kurangiGerak ? 'auto' : 'smooth' });
      });
    }

    // ---------- 5d. ANGKA BERHITUNG NAIK (beranda) ----------
    var angka = document.querySelectorAll('[data-count]');
    if (angka.length) {
      var naikkan = function (el) {
        var akhir = parseFloat(el.getAttribute('data-count')), mulai = null, durasi = 1500;
        var langkah = function (t) {
          if (mulai === null) mulai = t;
          var p = Math.min((t - mulai) / durasi, 1);
          el.textContent = Math.round(akhir * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(langkah);
        };
        requestAnimationFrame(langkah);
      };
      if ('IntersectionObserver' in window && !kurangiGerak) {
        var hitungIO = new IntersectionObserver(function (daftar) {
          daftar.forEach(function (d) {
            if (d.isIntersecting) { naikkan(d.target); hitungIO.unobserve(d.target); }
          });
        }, { threshold: 0.6 });
        angka.forEach(function (a) { a.textContent = '0'; hitungIO.observe(a); });
      }
    }

    // ---------- 5e. FAKTA ACAK (beranda) ----------
    var rfBtn = document.getElementById('rfBtn');
    if (rfBtn) {
      var rfTeks = document.getElementById('rfText');
      var daftarFakta = [
        'Axolotl bisa menumbuhkan lagi kaki yang hilang, lengkap dengan tulang dan jarinya!',
        'Mulutnya yang melengkung itu bawaan lahir. Axolotl tidak sedang tersenyum padamu (tapi tetap menggemaskan).',
        'Axolotl tidak punya kelopak mata, jadi ia tidak bisa berkedip.',
        'DNA axolotl sekitar 10 kali lebih besar daripada DNA manusia.',
        'Axolotl bukan ikan. Ia amfibi, sepupu jauh katak.',
        'Di alam liar, axolotl hanya hidup di kanal-kanal Xochimilco, Meksiko.',
        'Axolotl makan dengan cara menyedot: mulutnya dibuka cepat, dan mangsa ikut tersedot masuk.',
        'Insang berbulu di kepalanya ada tiga pasang, kiri dan kanan.',
        'Wajah axolotl menghiasi uang kertas 50 peso Meksiko.',
        'Suhu favorit axolotl hanya 16–18 °C, jauh lebih sejuk daripada akuarium ikan hias biasa.',
        'Axolotl bisa hidup 10–15 tahun di akuarium, jadi memeliharanya itu komitmen jangka panjang.'
      ];
      var terakhir = -1;
      rfBtn.addEventListener('click', function () {
        var i;
        do { i = Math.floor(Math.random() * daftarFakta.length); } while (i === terakhir);
        terakhir = i;
        rfTeks.textContent = daftarFakta[i];
        rfTeks.classList.remove('pop'); void rfTeks.offsetWidth; rfTeks.classList.add('pop');
        rfBtn.textContent = 'Fakta lainnya! 🐚';
      });
    }

    // ---------- 5f. KUIS MITOS ATAU FAKTA ----------
    var soal = document.querySelectorAll('.quiz .q');
    if (soal.length) {
      var skor = 0, terjawab = 0;
      var akhirKuis = document.getElementById('quizEnd');
      var teksSkor  = document.getElementById('quizScore');
      var ulangKuis = document.getElementById('quizReset');
      var pesanSkor = function (s, n) {
        if (s === n) return 'Sempurna! Kamu calon pakar axolotl 🐋';
        if (s >= n - 2) return 'Keren! Tinggal sedikit lagi jadi pakar 🫧';
        if (s >= 2) return 'Lumayan! Baca halaman Tentang dulu, yuk 🌱';
        return 'Tenang, semua pakar dulunya pemula 🌊 Coba lagi, yuk!';
      };
      soal.forEach(function (q) {
        q.querySelectorAll('.opt').forEach(function (btn) {
          btn.addEventListener('click', function () {
            if (q.classList.contains('done')) return;
            var kunci = q.getAttribute('data-jawab');
            var benar = btn.getAttribute('data-pilih') === kunci;
            q.classList.add('done');
            btn.classList.add(benar ? 'benar' : 'salah');
            if (!benar) q.querySelector('.opt[data-pilih="' + kunci + '"]').classList.add('benar');
            var ex = q.querySelector('.expl');
            ex.querySelector('.hasil').textContent = benar ? 'Benar! 🫧 ' : 'Hampir! 🌊 ';
            ex.hidden = false;
            if (benar) skor++;
            terjawab++;
            if (terjawab === soal.length) {
              teksSkor.textContent = 'Skormu: ' + skor + ' dari ' + soal.length + '. ' + pesanSkor(skor, soal.length);
              akhirKuis.hidden = false;
            }
          });
        });
      });
      ulangKuis.addEventListener('click', function () {
        skor = 0; terjawab = 0;
        soal.forEach(function (q) {
          q.classList.remove('done');
          q.querySelectorAll('.opt').forEach(function (b) { b.classList.remove('benar', 'salah'); });
          q.querySelector('.expl').hidden = true;
        });
        akhirKuis.hidden = true;
        soal[0].scrollIntoView({ behavior: kurangiGerak ? 'auto' : 'smooth', block: 'center' });
      });
    }

    // ---------- 5g. CEK SUHU AIR (perawatan) ----------
    var penggeser = document.getElementById('suhu');
    if (penggeser) {
      var bacaan = document.getElementById('suhuBaca');
      var emoji  = document.getElementById('suhuEmoji');
      var pesan  = document.getElementById('suhuPesan');
      var sub    = document.getElementById('suhuSub');
      var pin    = document.getElementById('suhuPin');
      var kondisi = function (t) {
        if (t < 14)  return ['🧊', 'Dingin banget', 'Masih bisa bertahan, tapi nafsu makannya turun dan geraknya melambat.'];
        if (t < 16)  return ['💧', 'Sejuk, masih aman', 'Sedikit di bawah ideal, tapi axolotl umumnya baik-baik saja.'];
        if (t <= 18) return ['🌊', 'Pas banget!', 'Inilah zona nyaman axolotl. Pertahankan!'];
        if (t <= 20) return ['🌤️', 'Agak hangat', 'Masih bisa, tapi pantau terus dan cari cara menurunkannya.'];
        if (t < 22)  return ['☀️', 'Mulai gerah', 'Segera dinginkan sebelum ia stres.'];
        if (t < 24)  return ['🔥', 'Stres!', 'Risiko sakit meningkat. Turunkan suhu secepatnya, tapi pelan-pelan.'];
        return ['🚨', 'Bahaya!', 'Di atas 24 °C axolotl mudah sakit. Turunkan maksimal sekitar 2 °C per jam, jangan mendadak.'];
      };
      var perbaruiSuhu = function () {
        var t = parseFloat(penggeser.value);
        var s = kondisi(t);
        bacaan.textContent = t.toFixed(1).replace('.', ',') + ' °C';
        if (emoji.textContent !== s[0]) {
          emoji.textContent = s[0];
          emoji.classList.remove('bump'); void emoji.offsetWidth; emoji.classList.add('bump');
        }
        pesan.textContent = s[1];
        sub.textContent = s[2];
        pin.style.setProperty('--p', ((t - 10) / 20 * 100) + '%');
        penggeser.setAttribute('aria-valuetext', t.toFixed(1) + ' derajat Celsius, ' + s[1]);
      };
      penggeser.addEventListener('input', perbaruiSuhu);
      perbaruiSuhu();
    }

    // ---------- 5h. CHECKLIST BELANJA (perawatan) ----------
    var kotakCek = document.querySelectorAll('.checklist input');
    if (kotakCek.length) {
      var barCek = document.getElementById('clBar');
      var tekCek = document.getElementById('clText');
      var tersimpan = [];
      try { tersimpan = JSON.parse(localStorage.getItem('cekBelanja') || '[]'); } catch (e) {}
      var perbaruiCek = function () {
        var n = 0, pilih = [];
        kotakCek.forEach(function (c, i) { if (c.checked) { n++; pilih.push(i); } });
        barCek.style.width = (n / kotakCek.length * 100) + '%';
        tekCek.textContent = n === kotakCek.length
          ? 'Semua siap! Waktunya menjemput si naga air 🫧'
          : n + ' dari ' + kotakCek.length + ' perlengkapan siap';
        try { localStorage.setItem('cekBelanja', JSON.stringify(pilih)); } catch (e) {}
      };
      kotakCek.forEach(function (c, i) {
        if (tersimpan.indexOf(i) > -1) c.checked = true;
        c.addEventListener('change', perbaruiCek);
      });
      perbaruiCek();
    }

    // ---------- 5i. LIGHTBOX GALERI ----------
    var fotoBuka = document.querySelectorAll('.photo-open');
    var kotakFoto = document.getElementById('lightbox');
    if (fotoBuka.length && kotakFoto) {
      var lbImg = document.getElementById('lbImg');
      var lbCap = document.getElementById('lbCap');
      var lbTutup = document.getElementById('lbClose');
      var lbPrev = document.getElementById('lbPrev');
      var lbNext = document.getElementById('lbNext');
      var indeks = 0, pemicu = null;

      // Pastikan kotak foto berada langsung di <body>, bukan di dalam <main> yang beranimasi
      // (elemen fixed di dalam induk bertransform hanya menutupi induknya, bukan layar).
      if (kotakFoto.parentNode !== document.body) document.body.appendChild(kotakFoto);

      // Jika file foto tidak ditemukan, beri tahu alih-alih menampilkan kotak kosong
      lbImg.addEventListener('error', function () {
        if (!lbImg.getAttribute('src')) return;
        lbCap.textContent = 'Foto tidak dapat dimuat. Periksa nama file & folder gambar.';
      });

      var tampilFoto = function (i) {
        indeks = (i + fotoBuka.length) % fotoBuka.length;
        var tautanFoto = fotoBuka[indeks];
        var thumb = tautanFoto.querySelector('img');
        lbCap.textContent = tautanFoto.getAttribute('data-cap') || '';
        lbImg.alt = thumb.alt;
        lbImg.src = tautanFoto.getAttribute('href');
      };
      var bukaFoto = function (i) {
        pemicu = fotoBuka[i];
        tampilFoto(i);
        kotakFoto.classList.add('open');
        kotakFoto.setAttribute('aria-hidden', 'false');
        root.classList.add('kunci');               // kunci scroll halaman di belakang
        setTimeout(function () { lbTutup.focus(); }, 60);
      };
      var tutupFoto = function () {
        kotakFoto.classList.remove('open');
        kotakFoto.setAttribute('aria-hidden', 'true');
        root.classList.remove('kunci');
        if (pemicu) pemicu.focus();
      };
      fotoBuka.forEach(function (a, i) {
        a.addEventListener('click', function (e) { e.preventDefault(); bukaFoto(i); });
      });
      lbTutup.addEventListener('click', tutupFoto);
      lbPrev.addEventListener('click', function () { tampilFoto(indeks - 1); });
      lbNext.addEventListener('click', function () { tampilFoto(indeks + 1); });
      kotakFoto.addEventListener('click', function (e) { if (e.target === kotakFoto) tutupFoto(); });
      document.addEventListener('keydown', function (e) {
        if (!kotakFoto.classList.contains('open')) return;
        if (e.key === 'Escape') tutupFoto();
        else if (e.key === 'ArrowLeft') tampilFoto(indeks - 1);
        else if (e.key === 'ArrowRight') tampilFoto(indeks + 1);
        else if (e.key === 'Tab') {
          var f = [lbTutup, lbPrev, lbNext];
          var pos = f.indexOf(document.activeElement);
          e.preventDefault();
          f[(pos + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
        }
      });
    }

    // ---------- 5j. AXOLOTL BISA DICOLEK (beranda & masuk) ----------
    var seni = document.querySelector('.art');
    if (seni && seni.querySelector('.eye')) {
      var svgA = seni.querySelector('svg');
      var pupil = seni.querySelectorAll('.eye circle');
      seni.setAttribute('data-colek', ''); seni.setAttribute('tabindex', '0'); seni.setAttribute('role', 'button');
      seni.setAttribute('aria-label', 'Colek axolotl');
      // Mata mengikuti kursor / jari
      if (!kurangiGerak) document.addEventListener('pointermove', function (e) {
        var r = svgA.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        var j = Math.hypot(dx, dy) || 1, k = Math.min(5, j / 40);
        pupil.forEach(function (c) { c.style.transform = 'translate(' + (dx / j * k) + 'px,' + (dy / j * k) + 'px)'; });
      }, { passive: true });
      var ikon = ['🫧', '💧', '🫧', '🐚'], hitungC = 0;
      var colek = function (e) {
        hitungC++;
        if (kurangiGerak || !seni.animate) return;
        seni.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1,.88)' }, { transform: 'scale(.94,1.08)' }, { transform: 'scale(1)' }],
          { duration: 600, easing: 'ease-out' });
        seni.classList.add('senang');
        clearTimeout(seni._t); seni._t = setTimeout(function () { seni.classList.remove('senang'); }, 1400);
        var r = seni.getBoundingClientRect(), p = seni.offsetParent || document.body, pr = p.getBoundingClientRect();
        for (var i = 0; i < 6; i++) {
          var f = document.createElement('span');
          f.className = 'fx'; f.textContent = ikon[i % ikon.length]; f.setAttribute('aria-hidden', 'true');
          f.style.left = (r.left - pr.left + r.width * (0.25 + Math.random() * 0.5)) + 'px';
          f.style.top = (r.top - pr.top + r.height * 0.3) + 'px';
          p.appendChild(f);
          var x = (Math.random() - .5) * 120;
          f.animate([{ transform: 'translate(0,0) scale(.6)', opacity: 1 }, { transform: 'translate(' + x + 'px,-' + (90 + Math.random() * 70) + 'px) scale(1.2)', opacity: 0 }],
            { duration: 1100 + Math.random() * 500, easing: 'ease-out' }).onfinish = (function (el) { return function () { el.remove(); }; })(f);
        }
      };
      seni.addEventListener('click', colek);
      seni.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); colek(); } });
    }

    // ---------- 5k. PENJELAJAH ANATOMI (tentang) ----------
    var titik = document.querySelectorAll('.hs'), infoA = document.getElementById('anatInfo');
    if (titik.length && infoA) {
      var bagian = {
        insang: ['Insang luar berbulu', 'Tiga pasang insang di kiri-kanan kepala menyerap oksigen langsung dari air. Warnanya merah muda karena banyak pembuluh darah.'],
        mata: ['Mata kecil tanpa kelopak', 'Penglihatannya terbatas dan tidak bisa berkedip. Axolotl lebih mengandalkan penciuman dan getaran air untuk mencari makan.'],
        mulut: ['Mulut lebar penyedot', 'Mulutnya dibuka cepat untuk menyedot mangsa. Giginya sangat kecil, jadi makanan ditelan bulat-bulat.'],
        pipi: ['Kulit halus tanpa sisik', 'Kulitnya tipis dan ikut membantu bernapas. Karena itu axolotl sangat sensitif terhadap air kotor dan sentuhan tangan.']
      };
      var dilihat = {}, titikPoin = document.querySelectorAll('#anatDots i');
      var pilihA = function (g) {
        var k = g.getAttribute('data-k');
        titik.forEach(function (t) { t.classList.toggle('on', t.getAttribute('data-k') === k); });
        dilihat[k] = true;
        var n = Object.keys(dilihat).length;
        titikPoin.forEach(function (d, i) { d.classList.toggle('on', i < n); });
        infoA.querySelector('h3').textContent = bagian[k][0];
        infoA.querySelector('p').textContent = bagian[k][1] + (n === 4 ? ' Kamu sudah mengenal semua bagian! 🐚' : '');
        infoA.classList.remove('pop'); void infoA.offsetWidth; infoA.classList.add('pop');
      };
      titik.forEach(function (g) {
        g.addEventListener('click', function () { pilihA(g); });
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pilihA(g); } });
      });
    }

    // ---------- 6. FORMULIR PERTANYAAN (hanya di index.html) ----------
    var formTanya = document.getElementById('askForm');
    if (formTanya) {
      var kartuTanya = document.getElementById('askCard');
      var badanTanya = document.getElementById('askBody');
      var selesaiBox = document.getElementById('askDone');
      var nmTanya    = document.getElementById('askNama');
      var emTanya    = document.getElementById('askEmail');
      var psTanya    = document.getElementById('askPesan');
      var hitung     = document.getElementById('askHitung');
      var pencacah   = document.getElementById('askCounter');
      var btnTanya   = document.getElementById('askBtn');
      var labelBtn   = btnTanya.querySelector('.label');
      var stTanya    = document.getElementById('askStatus');

      var tandai = function (input, pesan) {
        document.getElementById(input.id + '-error').textContent = pesan;
        if (pesan) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
        return !pesan;
      };
      var cekNama   = function () { return tandai(nmTanya, nmTanya.value.trim() ? '' : 'Nama wajib diisi.'); };
      var cekEmailT = function () {
        var v = emTanya.value.trim();
        if (!v) return tandai(emTanya, 'Email wajib diisi agar pertanyaanmu bisa dibalas.');
        return tandai(emTanya, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Format email belum benar, contoh: nama@email.com');
      };
      var cekPesan  = function () {
        var n = psTanya.value.trim().length;
        return tandai(psTanya, n === 0 ? 'Pertanyaan wajib diisi.' : (n < 10 ? 'Tulis minimal 10 karakter agar maksudmu jelas.' : ''));
      };
      var setStatus = function (teks, jenis) {
        stTanya.textContent = teks;
        stTanya.className = 'form-status' + (jenis ? ' ' + jenis : '');
      };
      var getarTanya = function () {
        kartuTanya.classList.remove('shake');
        void kartuTanya.offsetWidth;
        kartuTanya.classList.add('shake');
      };
      kartuTanya.addEventListener('animationend', function (e) {
        if (e.animationName === 'shake') kartuTanya.classList.remove('shake');
      });
      var bukaTombol = function () {
        btnTanya.disabled = false;
        btnTanya.classList.remove('loading');
        labelBtn.textContent = 'Kirim';
      };

      // Penghitung karakter: merah saat hampir mencapai batas 500
      psTanya.addEventListener('input', function () {
        hitung.textContent = psTanya.value.length;
        pencacah.classList.toggle('hampir', psTanya.value.length >= 450);
        if (psTanya.hasAttribute('aria-invalid')) cekPesan();
      });
      nmTanya.addEventListener('input', function () { if (nmTanya.hasAttribute('aria-invalid')) cekNama(); });
      emTanya.addEventListener('input', function () { if (emTanya.hasAttribute('aria-invalid')) cekEmailT(); });
      emTanya.addEventListener('blur',  function () { if (emTanya.value) cekEmailT(); });

      // Tampilkan layar sukses (lingkaran + centang + percikan)
      var tampilSukses = function (nama, teks) {
        bukaTombol();
        formTanya.reset();
        hitung.textContent = '0';
        pencacah.classList.remove('hampir');
        document.getElementById('askDoneNama').textContent = nama;
        document.getElementById('askDoneTeks').textContent = teks;
        badanTanya.hidden = true;
        selesaiBox.hidden = false;
        selesaiBox.focus();
      };

      // Tombol "Tulis pesan lain": kembali ke formulir kosong
      document.getElementById('askLagi').addEventListener('click', function () {
        selesaiBox.hidden = true;
        badanTanya.hidden = false;
        setStatus('', '');
        badanTanya.classList.remove('balik');
        void badanTanya.offsetWidth;
        badanTanya.classList.add('balik');
        nmTanya.focus();
      });

      formTanya.addEventListener('submit', function (e) {
        e.preventDefault();
        setStatus('', '');

        var okNama = cekNama(), okEmail = cekEmailT(), okPesan = cekPesan();
        if (!okNama || !okEmail || !okPesan) {
          (!okNama ? nmTanya : (!okEmail ? emTanya : psTanya)).focus();
          getarTanya();
          return;
        }

        var data = { nama: nmTanya.value.trim(), email: emTanya.value.trim(), pesan: psTanya.value.trim() };
        var sukses = function () { tampilSukses(data.nama, 'Pertanyaanmu sudah terkirim.'); };
        var gagal = function () {
          bukaTombol();
          setStatus('Pesan belum terkirim. Periksa koneksi internetmu lalu coba lagi.', 'err');
          getarTanya();
        };

        btnTanya.disabled = true;
        btnTanya.classList.add('loading');
        labelBtn.textContent = 'Mengirim…';

        if (FORM_ENDPOINT) {
          fetch(FORM_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(data)
          }).then(function (r) { if (!r.ok) throw new Error(); sukses(); }).catch(gagal);
        } else if (EMAIL_TUJUAN) {
          var badan = 'Nama: ' + data.nama + '\nEmail: ' + data.email + '\n\n' + data.pesan;
          window.location.href = 'mailto:' + EMAIL_TUJUAN +
            '?subject=' + encodeURIComponent('Pertanyaan axolotl dari ' + data.nama) +
            '&body=' + encodeURIComponent(badan);
          setTimeout(function () {
            tampilSukses(data.nama, 'Aplikasi emailmu terbuka. Tekan kirim di sana untuk menyelesaikan.');
          }, 700);
        } else {
          // DEMO: belum ada tujuan pengiriman (lihat pengaturan di bagian atas file ini)
          setTimeout(sukses, 1400);
        }
      });
    }

    // ---------- 6b. DATA AKUN (dipakai oleh halaman daftar & masuk) ----------
    // CATATAN: ini simulasi tanpa server. Akun disimpan di localStorage browser ini saja,
    // dan kata sandi disimpan dalam bentuk hash (bukan teks asli). Untuk situs sungguhan,
    // pendaftaran & login harus diproses di server.
    var KUNCI_AKUN = 'akunAxolotl';
    function bacaAkun() {
      try {
        var d = JSON.parse(localStorage.getItem(KUNCI_AKUN) || '{}');
        return (d && typeof d === 'object') ? d : {};
      } catch (e) { return {}; }
    }
    function simpanAkun(data) {
      try { localStorage.setItem(KUNCI_AKUN, JSON.stringify(data)); return true; }
      catch (e) { return false; }
    }
    function kunciUser(nama) { return String(nama).trim().toLowerCase(); }
    function buatGaram() {
      var a = '';
      for (var i = 0; i < 16; i++) a += Math.floor(Math.random() * 16).toString(16);
      return a;
    }
    // Hash SHA-256 bila tersedia; jika tidak (mis. halaman http biasa), pakai hash sederhana cadangan
    function hashSandi(garam, sandiTeks) {
      var teks = garam + ':' + sandiTeks;
      if (window.crypto && window.crypto.subtle && window.TextEncoder) {
        return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(teks)).then(function (buf) {
          return Array.prototype.map.call(new Uint8Array(buf), function (b) {
            return ('0' + b.toString(16)).slice(-2);
          }).join('');
        });
      }
      var h = 5381;
      for (var i = 0; i < teks.length; i++) h = ((h * 33) ^ teks.charCodeAt(i)) >>> 0;
      return Promise.resolve('x' + h.toString(16));
    }

    // ---------- 6c. FORMULIR DAFTAR (hanya di daftar.html) ----------
    var formDaftar = document.getElementById('registerForm');
    if (formDaftar) {
      var kartuD   = document.getElementById('registerCard');
      var userD    = document.getElementById('regUsername');
      var sandiD   = document.getElementById('regPassword');
      var ulangD   = document.getElementById('regConfirm');
      var tombolD  = document.getElementById('regBtn');
      var statusD  = document.getElementById('regStatus');
      var lihatD   = document.getElementById('pwToggle');

      lihatD.addEventListener('click', function () {
        var tampil = sandiD.type === 'password';
        sandiD.type = ulangD.type = tampil ? 'text' : 'password';
        lihatD.setAttribute('aria-pressed', tampil ? 'true' : 'false');
        lihatD.setAttribute('aria-label', tampil ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
      });

      var errD = function (input, pesan) {
        document.getElementById(input.id + '-error').textContent = pesan;
        if (pesan) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
        return !pesan;
      };
      var cekUserD = function () {
        var v = userD.value.trim();
        if (!v) return errD(userD, 'Username wajib diisi.');
        if (/\s/.test(v)) return errD(userD, 'Username tidak boleh memakai spasi.');
        if (v.length < 3) return errD(userD, 'Username minimal 3 karakter.');
        if (bacaAkun()[kunciUser(v)]) return errD(userD, 'Username ini sudah dipakai. Coba yang lain.');
        return errD(userD, '');
      };
      var cekSandiD = function () {
        if (!sandiD.value) return errD(sandiD, 'Kata sandi wajib diisi.');
        if (sandiD.value.length < 8) return errD(sandiD, 'Kata sandi minimal 8 karakter.');
        return errD(sandiD, '');
      };
      var cekUlangD = function () {
        if (!ulangD.value) return errD(ulangD, 'Ulangi kata sandi untuk memastikan.');
        if (ulangD.value !== sandiD.value) return errD(ulangD, 'Kata sandi tidak sama.');
        return errD(ulangD, '');
      };
      userD.addEventListener('input', function () { if (userD.hasAttribute('aria-invalid')) cekUserD(); });
      userD.addEventListener('blur', function () { if (userD.value) cekUserD(); });
      sandiD.addEventListener('input', function () {
        if (sandiD.hasAttribute('aria-invalid')) cekSandiD();
        if (ulangD.hasAttribute('aria-invalid')) cekUlangD();
      });
      ulangD.addEventListener('input', function () { if (ulangD.hasAttribute('aria-invalid')) cekUlangD(); });

      var statusDaftar = function (teks, jenis) {
        statusD.textContent = teks;
        statusD.className = 'form-status' + (jenis ? ' ' + jenis : '');
      };
      var getarD = function () {
        kartuD.classList.remove('shake');
        void kartuD.offsetWidth;
        kartuD.classList.add('shake');
      };
      kartuD.addEventListener('animationend', function (e) {
        if (e.animationName === 'shake') kartuD.classList.remove('shake');
      });

      formDaftar.addEventListener('submit', function (e) {
        e.preventDefault();
        statusDaftar('', '');
        var ok1 = cekUserD(), ok2 = cekSandiD(), ok3 = cekUlangD();
        if (!ok1 || !ok2 || !ok3) {
          (!ok1 ? userD : (!ok2 ? sandiD : ulangD)).focus();
          getarD();
          return;
        }

        tombolD.disabled = true;
        tombolD.classList.add('loading');
        tombolD.textContent = 'Mendaftarkan…';

        var namaAsli = userD.value.trim();
        var garam = buatGaram();
        hashSandi(garam, sandiD.value).then(function (hash) {
          var semua = bacaAkun();
          semua[kunciUser(namaAsli)] = { nama: namaAsli, garam: garam, hash: hash };
          if (!simpanAkun(semua)) throw new Error('simpan');
          tombolD.classList.remove('loading');
          tombolD.textContent = 'Berhasil ✓';
          statusDaftar('Akun berhasil dibuat. Mengalihkan ke halaman masuk…', 'ok');
          setTimeout(function () { window.location.href = 'login.html'; }, 1100);
        }).catch(function () {
          tombolD.disabled = false;
          tombolD.classList.remove('loading');
          tombolD.textContent = 'Daftar';
          statusDaftar('Pendaftaran gagal. Pastikan browser mengizinkan penyimpanan data, lalu coba lagi.', 'err');
          getarD();
        });
      });
    }

    // ---------- 7. FORMULIR LOGIN (hanya di login.html) ----------
    var form = document.getElementById('loginForm');
    if (!form) return;

    var kartu       = document.getElementById('loginCard');
    var username    = document.getElementById('username');
    var sandi       = document.getElementById('password');
    var ingat       = document.getElementById('ingat');
    var tombol      = document.getElementById('submitBtn');
    var pesanStatus = document.getElementById('status');
    var lihatSandi  = document.getElementById('pwToggle');

    // Isi username otomatis jika sebelumnya dicentang "Ingat saya" (kata sandi TIDAK pernah disimpan)
    try {
      var userTersimpan = localStorage.getItem('ingatUsername');
      if (userTersimpan) { username.value = userTersimpan; ingat.checked = true; }
    } catch (e) {}

    // Lihat / sembunyikan kata sandi
    lihatSandi.addEventListener('click', function () {
      var tampil = sandi.type === 'password';
      sandi.type = tampil ? 'text' : 'password';
      lihatSandi.setAttribute('aria-pressed', tampil ? 'true' : 'false');
      lihatSandi.setAttribute('aria-label', tampil ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
      sandi.focus();
    });
    
    // Validasi
    function tampilkanError(input, pesan) {
      document.getElementById(input.id + '-error').textContent = pesan;
      if (pesan) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    }
    function cekUsername() {
      var nilai = username.value.trim();
      if (!nilai) { tampilkanError(username, 'Username wajib diisi.'); return false; }
      if (/\s/.test(nilai)) { tampilkanError(username, 'Username tidak boleh memakai spasi.'); return false; }
      if (nilai.length < 3) { tampilkanError(username, 'Username minimal 3 karakter.'); return false; }
      tampilkanError(username, ''); return true;
    }
    function cekSandi() {
      if (!sandi.value) { tampilkanError(sandi, 'Kata sandi wajib diisi.'); return false; }
      if (sandi.value.length < 8) { tampilkanError(sandi, 'Kata sandi minimal 8 karakter.'); return false; }
      tampilkanError(sandi, ''); return true;
    }
    username.addEventListener('input', function () { if (username.hasAttribute('aria-invalid')) cekUsername(); });
    sandi.addEventListener('input', function () { if (sandi.hasAttribute('aria-invalid')) cekSandi(); });
    username.addEventListener('blur', function () { if (username.value) cekUsername(); });

    // Kartu bergetar saat ada kesalahan
    function getarKartu() {
      kartu.classList.remove('shake');
      void kartu.offsetWidth;             // mulai ulang animasi
      kartu.classList.add('shake');
    }
    kartu.addEventListener('animationend', function (e) {
      if (e.animationName === 'shake') kartu.classList.remove('shake');
    });

    function aturStatus(teks, jenis) {
      pesanStatus.textContent = teks;
      pesanStatus.className = 'form-status' + (jenis ? ' ' + jenis : '');
    }

    function berhasil() {
      // Simpan / hapus username sesuai "Ingat saya" (hanya setelah login benar)
      try {
        if (ingat.checked) localStorage.setItem('ingatUsername', username.value.trim());
        else localStorage.removeItem('ingatUsername');
      } catch (err) {}
      tombol.classList.remove('loading');
      tombol.textContent = 'Berhasil ✓';
      aturStatus('Berhasil masuk. Mengalihkan…', 'ok');
      setTimeout(function () { window.location.href = 'index.html'; }, 900);
    }
    function gagal(pesan) {
      tombol.disabled = false;
      tombol.classList.remove('loading');
      tombol.textContent = 'Masuk';
      aturStatus(pesan || 'Username atau kata sandi salah. Silakan coba lagi.', 'err');
      getarKartu();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      aturStatus('', '');

      var userOk  = cekUsername();
      var sandiOk = cekSandi();
      if (!userOk || !sandiOk) {
        (userOk ? sandi : username).focus();
        getarKartu();
        return;
      }

      // Status memuat: tombol dikunci agar tidak terkirim dua kali
      tombol.disabled = true;
      tombol.classList.add('loading');
      tombol.textContent = 'Memproses…';

      // Periksa ke daftar akun yang sudah terdaftar (lihat bagian 6b).
      // Username yang belum pernah didaftarkan tidak bisa masuk.
      var akun = bacaAkun()[kunciUser(username.value)];
      setTimeout(function () {
        if (!akun) {
          gagal('Akun belum terdaftar. Silakan daftar dulu lewat tombol "Daftar sekarang".');
          return;
        }
        hashSandi(akun.garam, sandi.value).then(function (hash) {
          if (hash === akun.hash) berhasil();
          else gagal('Kata sandi salah. Silakan coba lagi.');
        }).catch(function () { gagal(); });
      }, 700);
    });
  });
})();
