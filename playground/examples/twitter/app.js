import {
    Router, Out, layout, modal, context,
    auth, notify, on, keys, component, ui
} from '../../../build/oja.core.esm.js';
import { mockData } from './data/mock.js';

// ===== GLOBAL STATE (Oja context) =====
export const [currentUser, setCurrentUser] = context('user', mockData.users[0]);
export const [tweets, setTweets] = context('tweets', mockData.tweets);
export const [trends] = context('trends', mockData.trends);
export const [notifications, setNotifications] = context('notifications', []);

// ===== AUTH SETUP =====
auth.level('public', () => true);
auth.level('protected', () => currentUser() !== null);

auth.session.OnStart(async () => {
    notify.success('Welcome back!');
    const dest = auth.session.intendedPath() || '/';
    auth.session.clearIntendedPath();
    router.navigate(dest);
});

auth.session.OnExpiry(() => {
    notify.warn('Session expired. Please log in again.');
    setCurrentUser(null);
    router.navigate('/login');
});

// ===== LAYOUT =====
await layout.apply('#layout', 'layouts/main.html', {
    currentUser,
    trends,
    whoToFollow: mockData.whoToFollow,
    unreadCount: notifications().filter(n => !n.read).length
});

// ===== ROUTER =====
const router = new Router({
    mode: 'hash',
    outlet: '#main-outlet'
});

// Global middleware for logging
router.Use(async (ctx, next) => {
    console.log(`📍 Navigating to: ${ctx.path}`);
    await next();
});

// ===== ROUTES =====
// Public routes
router.Get('/login', Out.component('pages/login.html'));

// Protected routes group with auth middleware
const app = router.Group('/');
app.Use(async (ctx, next) => {
    if (!currentUser() && ctx.path !== '/login') {
        auth.session.setIntendedPath(ctx.path);
        ctx.redirect('/login');
        return;
    }
    await next();
});

app.Get('/', Out.component('pages/home.html', {
    currentUser,
    tweets: tweets().sort((a, b) => b.timestamp - a.timestamp)
}));

app.Get('/explore', Out.component('pages/explore.html', {
    currentUser,
    tweets,
    trends
}));

app.Get('/profile', Out.component('pages/profile.html', {
    currentUser,
    tweets: tweets().filter(t => t.userId === currentUser()?.id)
}));

app.Get('/tweet/:id', Out.component('pages/tweet.html', {
    currentUser,
    tweets
}));

// 404 handler
router.NotFound(Out.component('pages/404.html'));

// ===== GLOBAL EVENT HANDLERS =====
// Compose tweet - opens modal with compose component
on('[data-action="compose"]', 'click', () => {
    modal.open('compose-modal', {
        body: Out.component('components/compose.html', { currentUser: currentUser() })
    });
});

// Close modal handlers
on('[data-action="modal-close"]', 'click', () => {
    modal.close();
});

// Keyboard shortcuts for navigation and actions
keys({
    'n': () => modal.open('compose-modal', {
        body: Out.component('components/compose.html', { currentUser: currentUser() })
    }),
    'g h': () => router.navigate('/'),
    'g e': () => router.navigate('/explore'),
    'g p': () => router.navigate('/profile'),
    '?': () => notify.info('n: Compose · g h: Home · g e: Explore · g p: Profile')
});

// ===== START =====
router.start('/');

// Auto-wire UI components after mount for data-loading attributes
component.onMount(() => {
    setTimeout(() => {
        ui.wire();
    }, 100);
});