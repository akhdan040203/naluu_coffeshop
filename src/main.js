import { db } from './firebase.js';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

// ==========================================
// 1. NAVBAR SCROLL EFFECT
// ==========================================
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileMenu = document.getElementById('mobile-menu');
const closeBtn = document.getElementById('close-menu');

const updateNavbar = () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(252, 246, 240, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
        navbar.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
        navLinks.forEach(link => link.style.color = '#111827');
        if (hamburgerBtn) {
            hamburgerBtn.style.background = '#064E3B';
            hamburgerBtn.querySelector('span').style.color = 'white';
        }
    } else {
        navbar.style.background = 'transparent';
        navbar.style.backdropFilter = 'none';
        navbar.style.boxShadow = 'none';
        navLinks.forEach(link => link.style.color = 'white');
        if (hamburgerBtn) {
            hamburgerBtn.style.background = 'white';
            hamburgerBtn.querySelector('span').style.color = '#064E3B';
        }
    }
};

window.addEventListener('scroll', updateNavbar);
updateNavbar();

// ==========================================
// 2. MOBILE MENU TOGGLE
// ==========================================
if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', () => mobileMenu.classList.add('active'));
    closeBtn.addEventListener('click', () => mobileMenu.classList.remove('active'));
}

// ==========================================
// 3. DYNAMIC FULL MENU (from Firestore)
// ==========================================
const fullMenuGrid = document.getElementById('full-menu-grid');

let allMenus = [];
let allCategories = [];

const renderFullMenu = () => {
    if (!fullMenuGrid) return;
    fullMenuGrid.innerHTML = '';

    if (allCategories.length === 0) {
        fullMenuGrid.innerHTML = '<p style="grid-column:1/-1; text-align:center; opacity:0.5;">Belum ada kategori menu.</p>';
        return;
    }

    allCategories.forEach(catDoc => {
        const catName = catDoc.name;
        const catItems = allMenus.filter(m => m.fullCategory === catName);

        const col = document.createElement('div');
        col.innerHTML = `
            <h3 style="font-family: 'Paytone One', sans-serif; font-size: 24px; color: var(--primary-green); margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.03em;">${catName}</h3>
            <div style="display: flex; flex-direction: column; gap: 24px;">
                ${catItems.length > 0 ? catItems.map(item => `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px;">
                        <div style="flex: 1;">
                            <h4 style="font-weight: 800; font-size: 16px; margin: 0; color: var(--primary-green); line-height: 1.2;">${item.name}</h4>
                            ${item.desc ? `<p style="font-size: 13px; opacity: 0.6; margin: 5px 0 0; line-height: 1.5; font-weight: 500;">${item.desc}</p>` : ''}
                        </div>
                        <span style="font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 16px; color: var(--primary-green); white-space: nowrap;">${item.price}</span>
                    </div>
                `).join('') : '<p style="opacity:0.4; font-size:13px;">Belum ada menu di kategori ini.</p>'}
            </div>
        `;
        fullMenuGrid.appendChild(col);
    });
};

// Real-time Listeners
onSnapshot(query(collection(db, "categories"), orderBy("createdAt", "asc")), (snapshot) => {
    allCategories = [];
    snapshot.forEach(doc => allCategories.push({ id: doc.id, ...doc.data() }));
    renderFullMenu();
});

onSnapshot(query(collection(db, "menus"), orderBy("createdAt", "asc")), (snapshot) => {
    allMenus = [];
    snapshot.forEach(doc => allMenus.push(doc.data()));
    renderFullMenu();
});

// ==========================================
// 4. STATIC SLIDER - TOGGLE & NAVIGATION
// ==========================================
const productContainer = document.getElementById('product-container');
const toggleFood = document.getElementById('toggle-food');
const toggleCoffee = document.getElementById('toggle-coffee');
const prevItem = document.getElementById('prev-item');
const nextItem = document.getElementById('next-item');
const progressFilled = document.querySelector('.progress-filled');

// Toggle Coffee / Food filter
const filterSlider = (category) => {
    const cards = document.querySelectorAll('.product-card-v2');
    cards.forEach(card => {
        if (card.dataset.cat === category) {
            card.style.display = 'flex';
            card.classList.add('active');
        } else {
            card.style.display = 'none';
            card.classList.remove('active');
        }
    });
    if (productContainer) productContainer.scrollLeft = 0;
};

if (toggleFood && toggleCoffee) {
    toggleCoffee.addEventListener('click', () => {
        toggleCoffee.classList.add('active');
        toggleFood.classList.remove('active');
        filterSlider('coffee');
    });
    toggleFood.addEventListener('click', () => {
        toggleFood.classList.add('active');
        toggleCoffee.classList.remove('active');
        filterSlider('food');
    });
}

// Slider prev/next navigation
if (productContainer && prevItem && nextItem) {
    const updateProgress = () => {
        if (progressFilled) {
            const scrollRange = productContainer.scrollWidth - productContainer.clientWidth;
            if (scrollRange > 0) {
                const pct = (productContainer.scrollLeft / scrollRange) * 100;
                progressFilled.style.width = `${Math.min(Math.max(pct, 20), 100)}%`;
            }
        }
    };

    productContainer.addEventListener('scroll', updateProgress);

    const getScrollStep = () => {
        const card = productContainer.querySelector('.product-card-v2.active');
        return card ? card.offsetWidth + 24 : 340;
    };

    nextItem.addEventListener('click', () => {
        productContainer.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
    });
    prevItem.addEventListener('click', () => {
        productContainer.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
    });
}
