import SavedStoryDB from '../utils/db.js';

const StoriesView = {
  currentPage: 1,
  pageSize: 10,

  async render(container) {
    const token = localStorage.getItem('token');
    if (!token) {
      container.innerHTML = '<p style="color:red;">Silakan login untuk melihat cerita.</p>';
      return;
    }

    container.innerHTML = `
      <section>
        <h2>📚 Semua Postingan</h2>
        <div id="stories-container">Memuat cerita...</div>
        <div id="pagination-controls" style="margin-top: 1rem; display: flex; gap: 1rem;">
          <button id="prev-btn">⬅️ Sebelumnya</button>
          <button id="next-btn">Selanjutnya ➡️</button>
        </div>
      </section>
    `;

    document.getElementById('prev-btn').addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadStories();
      }
    });

    document.getElementById('next-btn').addEventListener('click', () => {
      this.currentPage++;
      this.loadStories();
    });

    this.loadStories();
  },

  async loadStories() {
    const storiesContainer = document.getElementById('stories-container');
    storiesContainer.innerHTML = 'Memuat...';

    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const res = await fetch(`https://story-api.dicoding.dev/v1/stories?page=${this.currentPage}&size=${this.pageSize}&location=0`, {
        headers,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      this.displayStories(data.listStory);
    } catch (err) {
      storiesContainer.innerHTML = `<p style="color:red;">🌐 Gagal memuat cerita: ${err.message}</p>`;
    }
  },

  displayStories(stories) {
    const storiesContainer = document.getElementById('stories-container');
    storiesContainer.innerHTML = '';

    if (stories.length === 0) {
      storiesContainer.innerHTML = '<p>Tidak ada cerita ditemukan.</p>';
      return;
    }

    stories.forEach((story) => {
      const card = document.createElement('div');
      card.className = 'story-card';
      card.innerHTML = `
      <div class="story-card-content">
        <img src="${story.photoUrl}" alt="Foto oleh ${story.name}" class="story-image" />
        <div class="story-info">
          <h3>${story.name}</h3>
          <p>${story.description}</p>
          <small><em>${new Date(story.createdAt).toLocaleString()}</em></small>
          <a href="#/detail?id=${story.id}" class="detail-link">Lihat Detail ➜</a>
          <button class="save-btn" data-id="${story.id}">❤️ Simpan</button>
        </div>
      </div>
    `;
      storiesContainer.appendChild(card);

      // Tambahkan event listener untuk tombol "Simpan"
      const saveBtn = card.querySelector('.save-btn');
      saveBtn.addEventListener('click', async () => {
        await SavedStoryDB.save(story);
        alert('✅ Cerita disimpan ke Favorite!');
      });
    });

    document.getElementById('prev-btn').disabled = this.currentPage === 1;
    document.getElementById('next-btn').disabled = stories.length < this.pageSize;
  }
};

export default StoriesView;
