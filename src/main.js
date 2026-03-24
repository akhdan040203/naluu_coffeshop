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
// 3. PRODUCT SLIDER & CATEGORY FILTER
// ==========================================
const productContainer = document.getElementById('product-container');
const prevItem = document.getElementById('prev-item');
const nextItem = document.getElementById('next-item');
const progressFilled = document.querySelector('.progress-filled');

const toggleFood = document.getElementById('toggle-food');
const toggleCoffee = document.getElementById('toggle-coffee');
const cards = () => document.querySelectorAll('.product-card-v2');

// FILTER LOGIC
const filterProducts = (category) => {
    cards().forEach(card => {
        if (card.dataset.cat === category) {
            card.style.display = 'block';
            card.classList.add('active');
        } else {
            card.style.display = 'none';
            card.classList.remove('active');
        }
    });
    // Reset slider to start
    if (productContainer) productContainer.scrollLeft = 0;
};

if (toggleFood && toggleCoffee) {
    toggleFood.addEventListener('click', () => {
        toggleFood.classList.add('active');
        toggleCoffee.classList.remove('active');
        filterProducts('food');
    });

    toggleCoffee.addEventListener('click', () => {
        toggleCoffee.classList.add('active');
        toggleFood.classList.remove('active');
        filterProducts('coffee');
    });
}

// SLIDER NAVIGATION
if (productContainer && prevItem && nextItem) {
    const updateProgress = () => {
        if (progressFilled) {
            const scrollPercentage = (productContainer.scrollLeft / (productContainer.scrollWidth - productContainer.clientWidth)) * 100;
            progressFilled.style.width = `${Math.min(Math.max(scrollPercentage, 20), 100)}%`; 
        }
    };
    
    productContainer.addEventListener('scroll', updateProgress);
    
    // Dynamic Scroll based on card width
    const getScrollStep = () => {
        const firstCard = productContainer.querySelector('.product-card-v2.active');
        return firstCard ? firstCard.offsetWidth + 24 : 340;
    };

    nextItem.addEventListener('click', () => {
        productContainer.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
    });
    prevItem.addEventListener('click', () => {
        productContainer.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
    });
}
