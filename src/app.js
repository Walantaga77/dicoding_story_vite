import routes from './router/routes.js';

function renderWithTransition(callback) {
    if (document.startViewTransition) {
        document.startViewTransition(callback);
    } else {
        callback();
    }
}

function route() {
    const app = document.getElementById('app');
    let hash = window.location.hash || '#/';
    const path = hash.split('?')[0];

    const token = localStorage.getItem('token');
    const protectedRoutes = ['#/upload', '#/detail', '#/notifications'];

    if (!token && protectedRoutes.some(route => path.startsWith(route))) {
        location.hash = '#/login';
        return;
    }

    const View = routes[path] || routes['#/login'];

    renderWithTransition(() => {
        app.innerHTML = '';
        View.render(app);
        console.log('✅ View rendered with transition');
        updateNavVisibility();
    });
}

function updateNavVisibility() {
    const isLoggedIn = !!localStorage.getItem('token');

    document.querySelectorAll('.nav-auth').forEach(el => {
        el.style.display = isLoggedIn ? 'inline' : 'none';
    });

    document.querySelectorAll('.nav-guest').forEach(el => {
        el.style.display = isLoggedIn ? 'none' : 'inline';
    });

    // Tampilkan tombol subscribe/unsubscribe hanya saat login
    document.getElementById('btn-subscribe')?.classList.toggle('hidden', !isLoggedIn);
    document.getElementById('btn-unsubscribe')?.classList.toggle('hidden', !isLoggedIn);
}

function setupSkipLink() {
    document.querySelector('.skip-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        const main = document.getElementById('main-content');
        if (main) main.focus();
    });
}

// Logout global
window.logout = function () {
    if (confirm('Yakin ingin logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('name');
        updateNavVisibility();
        location.hash = '#/login';
    }
};

// ✅ Push Notification via Tombol
async function subscribePushNotification() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert('🔕 Push notification tidak didukung di browser ini.');
        return;
    }

    try {
        const reg = await navigator.serviceWorker.ready;

        const subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
                'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk'
            ),
        });

        const token = localStorage.getItem('token');
        if (!token) {
            alert('❗ Token tidak ditemukan');
            return;
        }

        // 🔧 Kirim hanya properti yang dibutuhkan
        const { endpoint, keys } = subscription.toJSON();
        const filteredSubscription = { endpoint, keys };

        const res = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(filteredSubscription),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message);

        alert('✅ Berhasil subscribe notifikasi!');
    } catch (err) {
        console.error('❌ Gagal subscribe:', err.message);
        alert('❌ Gagal subscribe: ' + err.message);
    }
}


async function unsubscribePushNotification() {
    try {
        const reg = await navigator.serviceWorker.ready;
        const subscription = await reg.pushManager.getSubscription();

        if (subscription) {
            await subscription.unsubscribe();
            alert('🚫 Notifikasi telah dihentikan.');
        } else {
            alert('❌ Belum ada langganan aktif.');
        }
    } catch (err) {
        console.error('❌ Gagal unsubscribe:', err.message);
        alert('❌ Gagal unsubscribe: ' + err.message);
    }
}

// Helper konversi VAPID key
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}

// Inisialisasi
window.addEventListener('DOMContentLoaded', () => {
    updateNavVisibility();
    route();
    setupSkipLink();

    document.getElementById('btn-subscribe')?.addEventListener('click', subscribePushNotification);
    document.getElementById('btn-unsubscribe')?.addEventListener('click', unsubscribePushNotification);
});

window.addEventListener('hashchange', route);

// Ekspor jika dibutuhkan
window.subscribePushNotification = subscribePushNotification;
