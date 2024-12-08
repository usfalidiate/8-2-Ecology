import { db, auth } from "./firebase-config.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

let currentAvatarConfig = {}; // Track the full state of the avatar configuration

// Load customisation options from JSON
async function loadCustomisationOptions() {
    try {
        const response = await fetch("assets/customisation-options.json");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error loading customisation options:", error);
        return null;
    }
}

// Fetch User Data
async function fetchUserData(uid) {
    try {
        const userRef = doc(db, "users", uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            return userDoc.data();
        } else {
            console.error("No user found with UID:", uid);
            return null;
        }
    } catch (error) {
        console.error("Error fetching user data:", error.message);
    }
}

// Display User Data
async function displayUserData() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            console.log("User signed in:", user.uid);
            const userData = await fetchUserData(user.uid);
            if (userData) {
                document.getElementById("synapse-points").innerHTML = `<strong>Synapse Points (SP):</strong> ${userData.synapsePoints}`;
                document.getElementById("badges").innerHTML = `<strong>Badges:</strong> ${userData.badges.join(", ")}`;

                // Set avatar parts
                currentAvatarConfig = userData.avatarConfig || {}; // Load current avatar configuration
                updateAvatar(currentAvatarConfig);
                populateDropdowns(currentAvatarConfig); // Sync dropdowns with current avatarConfig
            }
        } else {
            console.log("No user signed in. Redirecting to login...");
            window.location.href = "login.html";
        }
    });
}

// Update Avatar Layers
function updateAvatar(avatarConfig) {
    const avatarContainer = document.getElementById("avatar-container");

    const defaultConfig = {
        base: "assets/base/Avatar.png",
    };

    const config = { ...defaultConfig, ...avatarConfig }; // Merge default with current avatarConfig

    avatarContainer.innerHTML = "";

    Object.entries(config).forEach(([layer, src]) => {
        const img = document.createElement("img");
        img.src = src;
        img.style.position = "absolute";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.zIndex = getLayerZIndex(layer);
        avatarContainer.appendChild(img);
    });
}

// Map layers to z-index
function getLayerZIndex(layer) {
    const layerOrder = ["base", "skin", "pants", "tops", "face", "mouth", "eyes", "hair", "shoes"];
    return layerOrder.indexOf(layer) + 1;
}

// Save Avatar Configuration
async function saveAvatarConfig() {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.error("No user signed in while saving avatar configuration.");
            return;
        }

        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { avatarConfig: currentAvatarConfig });
        console.log("Avatar configuration saved successfully!");
    } catch (error) {
        console.error("Error saving avatar configuration:", error.message);
    }
}

// Populate Customisation Options and Sync Dropdowns
async function populateDropdowns(currentConfig) {
    const options = await loadCustomisationOptions();
    if (!options) return;

    Object.keys(options).forEach((category) => {
        const selectElement = document.getElementById(`${category}-select`);
        if (selectElement) {
            selectElement.innerHTML = ""; // Clear existing options
            options[category].forEach((option) => {
                const optionElement = document.createElement("option");
                optionElement.value = option.file;
                optionElement.textContent = option.label;
                if (currentConfig[category] === `assets/${category}/${option.file}`) {
                    optionElement.selected = true; // Match dropdown to current config
                }
                selectElement.appendChild(optionElement);
            });

            selectElement.addEventListener("change", () => {
                currentAvatarConfig[category] = `assets/${category}/${selectElement.value}`; // Update config
                updateAvatar(currentAvatarConfig); // Update avatar preview
                saveAvatarConfig(); // Save updated config to Firestore
            });
        }
    });
}

// Log Out Function
document.getElementById("logout-button").addEventListener("click", async () => {
    try {
        await signOut(auth);
        console.log("User logged out successfully.");
        window.location.href = "login.html";
    } catch (error) {
        console.error("Error during logout:", error.message);
    }
});

// Initialize
displayUserData();
