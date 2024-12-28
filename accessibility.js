// accessibility.js
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

export async function loadPreferences(auth, db, fontToggle, screenReaderToggle) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const data = userDoc.data();

                // Load font preference
                if (data.fontPreference) {
                    const isDyslexic = data.fontPreference === "dyslexic";
                    fontToggle.checked = isDyslexic;
                    updateFont(isDyslexic);
                }

                // Load screen reader preference
                if (data.screenReaderVisible !== undefined) {
                    const isScreenReaderVisible = data.screenReaderVisible;
                    screenReaderToggle.checked = isScreenReaderVisible;
                    toggleScreenReader(isScreenReaderVisible);
                }
            }
        }
    });
}

export function applyFontPreference(auth, db) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            try {
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists() && userDoc.data().fontPreference) {
                    const isDyslexic = userDoc.data().fontPreference === "dyslexic";
                    updateFont(isDyslexic);
                }
            } catch (error) {
                console.error("Error fetching font preference:", error);
            }
        } else {
            console.log("No user signed in.");
        }
    });
}

export function updateFont(useDyslexic) {
    if (useDyslexic) {
        document.body.classList.add("dyslexic-font");
    } else {
        document.body.classList.remove("dyslexic-font");
    }
}

export async function saveFontPreference(auth, db, useDyslexic) {
    const user = auth.currentUser;
    if (user) {
        const userDocRef = doc(db, "users", user.uid);
        try {
            await setDoc(userDocRef, { fontPreference: useDyslexic ? "dyslexic" : "default" }, { merge: true });
            console.log("Font preference saved.");
        } catch (error) {
            console.error("Error saving font preference:", error);
        }
    }
}

export function toggleScreenReader(isVisible) {
    const iframe = document.querySelector("iframe#screenReader");
    if (!iframe) {
        console.error("Screen reader iframe not found.");
        return;
    }
    iframe.style.display = isVisible ? "block" : "none";
}

export async function saveScreenReaderPreference(auth, db, isVisible) {
    const user = auth.currentUser;
    if (user) {
        const userDocRef = doc(db, "users", user.uid);
        try {
            await setDoc(userDocRef, { screenReaderVisible: isVisible }, { merge: true });
            console.log("Screen reader preference saved.");
        } catch (error) {
            console.error("Error saving screen reader preference:", error);
        }
    }
}
