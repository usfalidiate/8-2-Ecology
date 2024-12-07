import { auth, db } from "./firebase-config.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {
    doc,
    setDoc,
    getDoc,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    // Tab Switching
    const loginTab = document.getElementById("login-tab");
    const registerTab = document.getElementById("register-tab");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    loginTab.addEventListener("click", () => {
        loginTab.classList.add("active");
        registerTab.classList.remove("active");
        loginForm.classList.add("active");
        registerForm.classList.remove("active");
    });

    registerTab.addEventListener("click", () => {
        registerTab.classList.add("active");
        loginTab.classList.remove("active");
        registerForm.classList.add("active");
        loginForm.classList.remove("active");
    });

    // Login Logic
    document.getElementById("login-button").addEventListener("click", async () => {
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = "profile.html"; // Redirect on success
        } catch (error) {
            document.getElementById("error-message").innerText = error.message;
        }
    });

    // Registration Logic
    document.getElementById("register-button").addEventListener("click", async () => {
        const email = document.getElementById("register-email").value;
        const password = document.getElementById("register-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;
        const classCode = document.getElementById("class-code").value;

        if (password !== confirmPassword) {
            document.getElementById("error-message").innerText = "Passwords do not match!";
            return;
        }

        try {
            // Check if class code is valid
            const classDoc = await getDoc(doc(db, "class-codes", classCode));
            if (!classDoc.exists()) {
                document.getElementById("error-message").innerText = "Invalid class code!";
                return;
            }

            // Get class name from Firestore
            const className = classDoc.data().className;

            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            // Write user data to Firestore
            await setDoc(doc(db, "users", uid), {
                email: email,
                class: className,
                synapsePoints: 0,
                badges: [],
                avatarConfig: {}, // Placeholder for future avatar customisation
            });

            console.log("User registered and data saved to Firestore!");
            window.location.href = "profile.html"; // Redirect on success
        } catch (error) {
            document.getElementById("error-message").innerText = error.message;
        }
    });
});
