import UploadPresenter from '../presenters/UploadPresenter.js';

const UploadView = {
  async render(container) {
    const token = localStorage.getItem('token');
    if (!token) {
      container.innerHTML = `
        <section>
          <p style="color: red;">🚫 Anda harus login terlebih dahulu untuk mengunggah cerita.</p>
          <a href="#/login">➡️ Klik di sini untuk login</a>
        </section>
      `;
      return;
    }

    container.innerHTML = `
      <section>
        <button id="back-button" class="back-btn">⬅️ Kembali ke Daftar Cerita</button>

        <h2>📤 Upload Cerita</h2>
        <form id="upload-form">
          <div>
            <label for="description">Deskripsi:</label>
            <textarea id="description" required></textarea>
          </div>

          <div>
            <label for="file-upload">Atau Upload dari File:</label>
            <input type="file" id="file-upload" accept="image/*" />
          </div>

          <div>
            <label for="camera">Ambil Gambar dari Kamera:</label>
            <video id="camera" autoplay playsinline width="320" height="240" style="border-radius: 8px;"></video>
            <br />
            <button type="button" id="take-picture">📸 Ambil Foto</button>
            <canvas id="snapshot" width="320" height="240" style="display:none;"></canvas>
          </div>

          <div>
            <label for="preview">Preview Gambar:</label>
            <img id="preview-image" src="" alt="Preview Gambar" style="max-width: 100%; height: auto; margin-top: 1rem; display:none;" />
            <button type="button" id="clear-photo" style="display:none; margin-top: 0.5rem;">❌ Hapus Gambar</button>
          </div>

          <div>
            <label for="location">Pilih Lokasi:</label>
            <div id="map" style="height: 300px; margin-bottom: 1rem;"></div>
            <input type="hidden" id="lat" />
            <input type="hidden" id="lon" />
          </div>

          <button type="submit" id="submit-btn">Kirim Cerita</button>
        </form>
        <div id="result" role="alert" style="margin-top: 1rem;"></div>
      </section>
    `;

    // Callback supaya Presenter bisa memberi update lokasi ke View (update input lat/lon)
    UploadPresenter.initMap('map', (lat, lon) => {
      document.getElementById('lat').value = lat;
      document.getElementById('lon').value = lon;
    });

    const video = document.getElementById('camera');
    const canvas = document.getElementById('snapshot');
    const ctx = canvas.getContext('2d');
    const preview = document.getElementById('preview-image');
    const clearBtn = document.getElementById('clear-photo');
    const fileUpload = document.getElementById('file-upload');
    const submitBtn = document.getElementById('submit-btn');
    const resultEl = document.getElementById('result');

    let currentPhotoBlob = null;
    let cameraStream = null;
    let previewUrl = null;

    function stopCamera() {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
        video.srcObject = null;
      }
    }

    // Revoke object URL untuk menghindari memory leak
    function revokePreviewUrl() {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrl = null;
      }
    }

    // Inisialisasi kamera
    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        console.warn('Browser tidak mendukung akses kamera.');
        return;
      }
      try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = cameraStream;
      } catch (err) {
        console.error('Gagal akses kamera:', err);
      }
    }
    startCamera();

    // Ambil foto dari kamera
    document.getElementById('take-picture').addEventListener('click', () => {
      if (!cameraStream) {
        alert('Kamera belum aktif.');
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        currentPhotoBlob = blob;
        revokePreviewUrl();
        previewUrl = URL.createObjectURL(blob);
        preview.src = previewUrl;
        preview.style.display = 'block';
        clearBtn.style.display = 'inline-block';

        // Reset file upload supaya tidak bentrok
        fileUpload.value = '';
      }, 'image/jpeg');
    });

    // Upload dari file
    fileUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        currentPhotoBlob = file;
        revokePreviewUrl();
        previewUrl = URL.createObjectURL(file);
        preview.src = previewUrl;
        preview.style.display = 'block';
        clearBtn.style.display = 'inline-block';
      }
    });

    // Clear preview & reset photo
    clearBtn.addEventListener('click', () => {
      currentPhotoBlob = null;
      revokePreviewUrl();
      preview.src = '';
      preview.style.display = 'none';
      clearBtn.style.display = 'none';
      fileUpload.value = '';
    });

    // Tombol kembali
    document.getElementById('back-button').addEventListener('click', () => {
      stopCamera();
      location.hash = '#/';
    });

    // Submit form
    document.getElementById('upload-form').addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!currentPhotoBlob) {
        resultEl.textContent = '❌ Silakan ambil gambar dari kamera atau unggah file.';
        resultEl.style.color = 'red';
        return;
      }

      const description = document.getElementById('description').value.trim();
      const lat = document.getElementById('lat').value;
      const lon = document.getElementById('lon').value;

      if (!description) {
        resultEl.textContent = '❌ Deskripsi tidak boleh kosong.';
        resultEl.style.color = 'red';
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Mengunggah...';

        await UploadPresenter.uploadStory(description, currentPhotoBlob, lat, lon);

        resultEl.textContent = '✅ Cerita berhasil diunggah!';
        resultEl.style.color = 'green';

        // Reset form
        e.target.reset();
        currentPhotoBlob = null;
        revokePreviewUrl();
        preview.src = '';
        preview.style.display = 'none';
        clearBtn.style.display = 'none';

        stopCamera();

      } catch (err) {
        resultEl.textContent = `❌ ${err.message}`;
        resultEl.style.color = 'red';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Kirim Cerita';
      }
    });

    // Pastikan kamera dimatikan saat pindah halaman
    window.addEventListener('beforeunload', stopCamera);
    window.addEventListener('hashchange', stopCamera);
  }
};

export default UploadView;
