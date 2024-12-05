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
                document.querySelector(".avatar").src = userData.avatarUrl || "default-avatar.png";
            }
        } else {
            console.log("No user signed in.");
        }
    });
}

// Initialize
displayUserData();
