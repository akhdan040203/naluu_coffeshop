import { db, auth } from './firebase.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, getDocs, updateDoc } from 'firebase/firestore';

// ===================================
// DOM ELEMENTS
// ===================================
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const addMenuForm = document.getElementById('add-menu-form');
const tblBody = document.getElementById('menu-table-body');
const btnSave = document.getElementById('btn-save');

const addCatForm = document.getElementById('add-category-form');
const catListWrapper = document.getElementById('category-list');
const catDropdowns = document.querySelectorAll('.category-dropdown');

const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const cancelEdit = document.getElementById('cancel-edit');

const INITIAL_CATEGORIES = ["Signature Wave", "The Classics", "Non-Caffeine", "Lite Bites"];

// ===================================
// CATEGORY MANAGEMENT
// ===================================
const loadCategories = () => {
    onSnapshot(collection(db, "categories"), (snapshot) => {
        catListWrapper.innerHTML = '';
        const categoryData = [];
        snapshot.forEach(d => categoryData.push({ id: d.id, ...d.data() }));

        categoryData.forEach(item => {
            const tag = document.createElement('div');
            tag.style = "background:#F3F4F6; padding:5px 12px; border-radius:99px; font-size:12px; font-weight:600; display:flex; align-items:center; gap:5px;";
            tag.innerHTML = `${item.name} <span class="material-symbols-outlined delete-cat" data-id="${item.id}" style="font-size:14px; cursor:pointer; color:#EF4444;">close</span>`;
            catListWrapper.appendChild(tag);
        });

        catDropdowns.forEach(dropdown => {
            const currentVal = dropdown.value;
            dropdown.innerHTML = '<option value="" disabled selected>Pilih Kolom...</option>';
            categoryData.forEach(item => {
                dropdown.innerHTML += `<option value="${item.name}">${item.name}</option>`;
            });
            if (currentVal) dropdown.value = currentVal;
        });

        document.querySelectorAll('.delete-cat').forEach(btn => {
            btn.onclick = async (e) => {
                if (confirm("Hapus kategori ini?")) {
                    await deleteDoc(doc(db, "categories", e.currentTarget.dataset.id));
                }
            };
        });
    });
};

addCatForm.onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('new-cat-name').value.trim();
    if (!name) return;
    await addDoc(collection(db, "categories"), { name, createdAt: new Date() });
    addCatForm.reset();
};

// ===================================
// AUTO-SEED
// ===================================
async function autoSeed() {
    const catSnap = await getDocs(collection(db, "categories"));
    if (catSnap.empty) {
        for (const cat of INITIAL_CATEGORIES) {
            await addDoc(collection(db, "categories"), { name: cat, createdAt: new Date() });
        }
    }

    const menuSnap = await getDocs(collection(db, "menus"));
    if (menuSnap.empty) {
        const STATIC_MENUS = [
            { name: "Ice Lychee Coffee", price: "24k", category: "coffee", fullCategory: "Signature Wave" },
            { name: "Milk Klepon Ice", price: "24k", category: "coffee", fullCategory: "Signature Wave" },
            { name: "Special Nalu Latte", price: "28k", category: "coffee", fullCategory: "Signature Wave" },
            { name: "Ice Lemon Coffee", price: "24k", category: "coffee", fullCategory: "Signature Wave" },
            { name: "Americano", price: "18k", category: "coffee", fullCategory: "The Classics" },
            { name: "Coffee Latte", price: "22k", category: "coffee", fullCategory: "The Classics" },
            { name: "Cappuccino", price: "22k", category: "coffee", fullCategory: "The Classics" },
            { name: "Long Black", price: "20k", category: "coffee", fullCategory: "The Classics" },
            { name: "Premium Matcha", price: "22k", category: "coffee", fullCategory: "Non-Caffeine" },
            { name: "Chocolate Signature", price: "22k", category: "coffee", fullCategory: "Non-Caffeine" },
            { name: "Fresh Lemonade", price: "18k", category: "coffee", fullCategory: "Non-Caffeine" },
            { name: "Lychee Tea", price: "18k", category: "coffee", fullCategory: "Non-Caffeine" },
            { name: "French Fries", price: "18k", category: "food", fullCategory: "Lite Bites" },
            { name: "Banana Cake", price: "17k", category: "food", fullCategory: "Lite Bites" },
            { name: "Sweet Cookies", price: "15k", category: "food", fullCategory: "Lite Bites" },
            { name: "Potato Wedges", price: "20k", category: "food", fullCategory: "Lite Bites" },
        ];
        for (const item of STATIC_MENUS) {
            await addDoc(collection(db, "menus"), { ...item, createdAt: new Date() });
        }
    }
}

// ===================================
// AUTH
// ===================================
onAuthStateChanged(auth, (user) => {
    // Hide loading overlay with fade
    const loader = document.getElementById('loading-overlay');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.classList.add('hidden'), 300);
    }

    if (user) {
        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        // autoSeed().then(() => {
        //     loadCategories();
        //     loadMenuRealtime();
        // });
        loadCategories();
        loadMenuRealtime();
    } else {
        loginSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
    }
});

loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    loginError.style.display = 'none';
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        loginError.textContent = "Login gagal! Periksa email dan password.";
        loginError.style.display = 'block';
    }
};

logoutBtn.onclick = () => signOut(auth);

// ===================================
// ADD MENU
// ===================================
addMenuForm.onsubmit = async (e) => {
    e.preventDefault();
    btnSave.disabled = true;
    btnSave.textContent = 'Menyimpan...';

    try {
        await addDoc(collection(db, "menus"), {
            name: document.getElementById('m-name').value,
            price: document.getElementById('m-price').value,
            desc: document.getElementById('m-desc').value,
            category: document.getElementById('m-category').value,
            fullCategory: document.getElementById('m-full-category').value,
            createdAt: new Date()
        });
        addMenuForm.reset();
        alert("✅ Berhasil disimpan!");
    } catch (err) {
        alert("❌ Gagal: " + err.message);
    } finally {
        btnSave.disabled = false;
        btnSave.textContent = 'SIMPAN KE DATABASE';
    }
};

// ===================================
// REALTIME TABLE
// ===================================
function loadMenuRealtime() {
    onSnapshot(query(collection(db, "menus"), orderBy("createdAt", "desc")), (snapshot) => {
        tblBody.innerHTML = '';
        let stats = { total: 0, coffee: 0, food: 0 };

        snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            stats.total++;
            if (d.category === 'coffee') stats.coffee++;
            else stats.food++;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><div style="font-weight:800;">${d.name}</div><div style="font-size:11px;color:#999;">${d.fullCategory || ''}</div></td>
                <td style="color:var(--green);font-weight:800;">${d.price}</td>
                <td><span class="cat-badge ${d.category === 'food' ? 'food' : ''}">${d.category === 'coffee' ? '☕ Coffee' : '🍽️ Food'}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-edit edit-btn" data-id="${docSnap.id}" data-json='${JSON.stringify(d).replace(/'/g, "&apos;")}'>Edit</button>
                        <button class="btn btn-danger delete-btn" data-id="${docSnap.id}">Hapus</button>
                    </div>
                </td>
            `;
            tblBody.appendChild(tr);
        });

        document.getElementById('stat-total').textContent = stats.total;
        document.getElementById('stat-coffee').textContent = stats.coffee;
        document.getElementById('stat-food').textContent = stats.food;

        document.querySelectorAll('.edit-btn').forEach(btn => btn.onclick = openEditModal);
        document.querySelectorAll('.delete-btn').forEach(btn => btn.onclick = handleDelete);
    });
}

// ===================================
// EDIT MODAL
// ===================================
const openEditModal = (e) => {
    const d = JSON.parse(e.currentTarget.dataset.json);
    document.getElementById('edit-id').value = e.currentTarget.dataset.id;
    document.getElementById('edit-name').value = d.name;
    document.getElementById('edit-price').value = d.price;
    document.getElementById('edit-desc').value = d.desc || '';
    document.getElementById('edit-category').value = d.category;
    document.getElementById('edit-full-category').value = d.fullCategory;
    editModal.classList.remove('hidden');
};

cancelEdit.onclick = () => editModal.classList.add('hidden');

editForm.onsubmit = async (e) => {
    e.preventDefault();
    const submitBtn = editForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';

    const docId = document.getElementById('edit-id').value;
    try {
        await updateDoc(doc(db, "menus", docId), {
            name: document.getElementById('edit-name').value,
            price: document.getElementById('edit-price').value,
            desc: document.getElementById('edit-desc').value,
            category: document.getElementById('edit-category').value,
            fullCategory: document.getElementById('edit-full-category').value,
        });
        editModal.classList.add('hidden');
        alert("✅ Berhasil diupdate!");
    } catch (err) {
        alert("❌ Gagal: " + err.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Simpan Perubahan';
    }
};

const handleDelete = async (e) => {
    const id = e.currentTarget.dataset.id;
    if (confirm("Yakin hapus menu ini?")) {
        await deleteDoc(doc(db, "menus", id));
    }
};
