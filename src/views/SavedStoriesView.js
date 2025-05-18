import SavedStoryDB from '../utils/db.js';

const SavedStoriesView = {
  async render(container) {
    const stories = await SavedStoryDB.getAll();

    container.innerHTML = `
      <section>
        <h2>❤️ Cerita Tersimpan</h2>
        <button id="back-to-stories" class="back-btn">⬅️ Kembali ke Daftar Cerita</button>
        <div id="saved-stories-container"></div>
      </section>
    `;
    document
      .getElementById("back-to-stories")
      .addEventListener("click", () => {
        location.hash = "#/";
      });

    const listContainer = document.getElementById('saved-stories-container');

    if (!stories.length) {
      listContainer.innerHTML = '<p>Belum ada cerita yang disimpan.</p>';
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
            <button class="delete-btn" data-id="${story.id}">❌ Hapus</button>
          </div>
        </div>
      `;

      card.querySelector('.delete-btn').addEventListener('click', async () => {
        await SavedStoryDB.delete(story.id);
        alert('✅ Cerita dihapus dari Favorite');
        this.render(container); // re-render
      });

      listContainer.appendChild(card);
    });
  }
};

export default SavedStoriesView;
