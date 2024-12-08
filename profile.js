import { db, auth } from "./firebase-config.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

let currentAvatarConfig = {};

// Open and Close Modal
document.getElementById("customise-avatar-button").addEventListener("click", () => {
    document.getElementById("customisation-modal").style.display = "flex";
});

document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("customisation-modal").style.display = "none";
});

// Load Customisation Options
async function loadCustomisationOptions(category) {
    const response = await fetch("assets/customisation-options.json");
    const options = await response.json();
    return options[category] || [];
}

// Display Customisation Options in Grid
async function displayCustomisationOptions(category) {
    const gridContainer = document.getElementById("customisation-grid");
    gridContainer.innerHTML = ""; // Clear current options
    const options = await loadCustomisationOptions(category);

    options.forEach((option) => {
        const gridItem = document.createElement("div");
        gridItem.classList.add("grid-item");
        gridItem.dataset.file = option.file;

        // Image
        const img = document.createElement("img");
        img.src = `assets/${category}/${option.file}`;
        gridItem.appendChild(img);

        // Tick
        const tick = document.createElement("div");
        tick.classList.add("tick");
        gridItem.appendChild(tick);

        // Highlight if selected
        if (currentAvatarConfig[category] === `assets/${category}/${option.file}`) {
            gridItem.classList.add("selected");
        }

        // Click Listener
        gridItem.addEventListener("click", () => {
            currentAvatarConfig[category] = `assets/${category}/${option.file}`;
            updateAvatar(currentAvatarConfig);
            saveAvatarConfig();
            document.querySelectorAll(".grid-item").forEach((item) => item.classList.remove("selected"));
            gridItem.classList.add("selected");
        });

        gridContainer.appendChild(gridItem);
    });
}

// Tab Switching
document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        displayCustomisationOptions(tab.dataset.category);
    });
});

// Save Avatar Configuration to Firestore
async function saveAvatarConfig() {
    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { avatarConfig: currentAvatarConfig });
}

// Update Avatar Display
function updateAvatar(config) {
    const avatarContainer = document.getElementById("avatar-container");
    avatarContainer.innerHTML = ""; // Clear current avatar

    const defaultConfig = { base: "assets/base/Avatar.png" };
    const mergedConfig = { ...defaultConfig, ...config };

    Object.entries(mergedConfig).forEach(([layer, src]) => {
        const img = document.createElement("img");
        img.src = src;
        img.style.position = "absolute";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.zIndex = getLayerZIndex(layer);
        avatarContainer.appendChild(img);
    });
}

// Map Layers to Z-Index
function getLayerZIndex(layer) {
    const order = ["base", "skin", "pants", "tops", "face", "mouth", "eyes", "hair", "shoes"];
    return order.indexOf(layer) + 1;
}

// Initialize
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userData = await getDoc(userRef);
        currentAvatarConfig = userData.exists() ? userData.data().avatarConfig || {} : {};
        updateAvatar(currentAvatarConfig);
        displayCustomisationOptions("hair"); // Default tab
    }
});
