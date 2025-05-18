import { openDB } from 'idb';

const DB_NAME = 'story-db';
const DB_VERSION = 1;
const STORE_NAME = 'saved-stories';

const dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
    },
});

const SavedStoryDB = {
    async save(story) {
        if (!story.id) return;
        const db = await dbPromise;
        return db.put(STORE_NAME, story);
    },

    async get(id) {
        if (!id) return null;
        const db = await dbPromise;
        return db.get(STORE_NAME, id);
    },

    async getAll() {
        const db = await dbPromise;
        return db.getAll(STORE_NAME);
    },

    async delete(id) {
        const db = await dbPromise;
        return db.delete(STORE_NAME, id);
    },

    async clearAll() {
        const db = await dbPromise;
        return db.clear(STORE_NAME);
    },
};

export default SavedStoryDB;
