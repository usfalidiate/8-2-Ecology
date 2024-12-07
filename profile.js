import { db, auth } from "./firebase-config.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";


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
            console.log("No user signed in. Redirecting to login...");
            window.location.href = "login.html"; // Redirect if no user logged in
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
        img.style.width = "100%"; // Ensure images scale to the container size
        avatarContainer.appendChild(img);
    });
}

// Map layers to z-index
function getLayerZIndex(layer) {
    const layerOrder = ["base", "skin", "pants"];
    return layerOrder.indexOf(layer);
}

// Save Avatar Configuration
async function saveAvatarConfig(newConfig) {
    const user = auth.currentUser;
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const existingConfig = userDoc.data().avatarConfig || {};
            const updatedConfig = { ...existingConfig, ...newConfig };
            await updateDoc(userRef, { avatarConfig: updatedConfig });
            console.log("Avatar configuration saved!");
        } else {
            console.error("User document does not exist.");
        }
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
        const newConfig = { pants: `assets/pants/${pantsSelect.value}` };
        updateAvatar(newConfig);
        saveAvatarConfig(newConfig);
    });

    skinSelect.addEventListener("change", () => {
        const newConfig = { skin: `assets/skin/${skinSelect.value}` };
        updateAvatar(newConfig);
        saveAvatarConfig(newConfig);
    });
}

// Log Out Function
document.getElementById("logout-button").addEventListener("click", async () => {
    try {
        await signOut(auth);
        console.log("User logged out successfully.");
        window.location.href = "login.html"; // Redirect to login after logout
    } catch (error) {
        console.error("Error during logout:", error.message);
    }
});


// Initialize
displayUserData();
setupAvatarControls();
