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
        root.classList.add('theme-anim');                    // aktifkan transisi warna
        root.setAttribute('data-theme', baru);
        try { localStorage.setItem('tema', baru); } catch (e) {}
        perbaruiTombolTema();
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

    // ---------- 4. MENU AKTIF MENGIKUTI BAGIAN YANG DIBACA (halaman utama) ----------
    var tautan = document.querySelectorAll('.nav a[href^="#"]:not(.logo)');
    var bagian = document.querySelectorAll('section[id]');
    if ('IntersectionObserver' in window && tautan.length) {
      var spy = new IntersectionObserver(function (daftar) {
        daftar.forEach(function (d) {
          if (!d.isIntersecting) return;
          tautan.forEach(function (a) {
            var aktif = a.getAttribute('href') === '#' + d.target.id;
            a.classList.toggle('active', aktif);
            if (aktif) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      bagian.forEach(function (s) { spy.observe(s); });
    }

    // ---------- 5. ELEMEN MUNCUL SAAT DI-SCROLL (halaman utama) ----------
    if ('IntersectionObserver' in window && !kurangiGerak) {
      var target = document.querySelectorAll(
        '.about .wrap > *, .info, .facts .wrap > h2, .facts .wrap > .lead, .card, ' +
        '.care .head, .care-box, .note, .gallery .wrap > h2, .gallery .wrap > .lead, .ph, ' +
        '.contact .head, .ask-card, #askBody .field, #askBody .btn.submit'
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
      }, { threshold: 0.15 });

      target.forEach(function (el) {
        var urutan = Array.prototype.indexOf.call(el.parentNode.children, el);
        el.style.setProperty('--d', (urutan % 6) * 0.1 + 's');
        el.classList.add('reveal');
        muncul.observe(el);
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
      var jebakan    = document.getElementById('askJebakan');
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

        // Robot spam biasanya mengisi kolom jebakan: pura-pura berhasil, tapi tidak dikirim
        if (jebakan.value) { setTimeout(sukses, 1000); return; }

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
      tombol.classList.remove('loading');
      tombol.textContent = 'Berhasil ✓';
      aturStatus('Berhasil masuk. Mengalihkan…', 'ok');
      setTimeout(function () { window.location.href = 'index.html'; }, 900);
    }
    function gagal() {
      tombol.disabled = false;
      tombol.classList.remove('loading');
      tombol.textContent = 'Masuk';
      aturStatus('Username atau kata sandi salah. Silakan coba lagi.', 'err');
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

      // Simpan / hapus username sesuai "Ingat saya"
      try {
        if (ingat.checked) localStorage.setItem('ingatUsername', username.value.trim());
        else localStorage.removeItem('ingatUsername');
      } catch (err) {}

      // ================================================================
      // DEMO: bagian di bawah ini hanya simulasi, BELUM memeriksa akun sungguhan.
      // Ganti dengan permintaan ke server Anda, contohnya:
      //
      //   fetch('/api/login', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({ username: username.value.trim(), password: sandi.value })
      //   })
      //   .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
      //   .then(berhasil)
      //   .catch(gagal);
      // ================================================================
      setTimeout(berhasil, 1200);
    });
  });
})();
