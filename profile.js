import { db, auth } from "./firebase-config.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Fetch User Data
async function fetchUserData(uid) {
    const userRef = doc(db, "users", uid); // Firestore users collection
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        return userDoc.data();
    } else {
        console.error("No user found with UID:", uid);
        return null;
    }
}

// Display User Data
async function displayUserData() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const userData = await fetchUserData(user.uid);
            if (userData) {
                document.getElementById("synapse-points").innerHTML = `<strong>Synapse Points (SP):</strong> ${userData.synapsePoints}`;
                document.getElementById("badges").innerHTML = `<strong>Badges:</strong> ${userData.badges.join(", ")}`;

                // Set avatar parts
                const avatarConfig = userData.avatarConfig || {};
                updateAvatar(avatarConfig);
            }
        } else {
            console.log("No user signed in.");
        }
    });
}

// Update Avatar Layers
function updateAvatar(avatarConfig) {
    const avatarContainer = document.getElementById("avatar-container");

    // Default configuration
    const defaultConfig = {
        base: "assets/base/avatar.png",
        pants: "assets/pants/DarkGreyPants.png",
        skin: "assets/skin/PaleSkin.png",
    };

    // Merge user config with defaults
    const config = { ...defaultConfig, ...avatarConfig };

    // Clear previous layers
    avatarContainer.innerHTML = "";

    // Add avatar layers dynamically
    Object.entries(config).forEach(([layer, src]) => {
        const img = document.createElement("img");
        img.src = src;
        img.style.position = "absolute";
        img.style.zIndex = getLayerZIndex(layer);
        avatarContainer.appendChild(img);
    });
}

// Map layers to z-index
function getLayerZIndex(layer) {
    const layerOrder = ["base", "skin", "pants"];
    return layerOrder.indexOf(layer);
}

// Save Avatar Configuration
async function saveAvatarConfig(config) {
    const user = auth.currentUser;
    if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { avatarConfig: config });
        console.log("Avatar configuration saved!");
    } else {
        console.error("No user signed in.");
    }
}

// Add Event Listeners for Customisation
function setupAvatarControls() {
    const pantsSelect = document.getElementById("pants-select");
    const skinSelect = document.getElementById("skin-select");

    // Update avatar on selection change
    pantsSelect.addEventListener("change", () => {
        const config = {
            pants: `assets/pants/${pantsSelect.value}`,
        };
        updateAvatar(config);
        saveAvatarConfig(config);
    });

    skinSelect.addEventListener("change", () => {
        const config = {
            skin: `assets/skin/${skinSelect.value}`,
        };
        updateAvatar(config);
        saveAvatarConfig(config);
    });
}

// Initialize
displayUserData();
setupAvatarControls();
