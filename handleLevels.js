import { db, auth } from "./firebase-config.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Tier Levels will be dynamically loaded
let tierLevels = [];

// Fetch Tier Levels from gameData.json
export async function loadTierLevels() {
    try {
        const response = await fetch("/json/gameData.json");
        const data = await response.json();
        tierLevels = data.tierLevels;
        console.log("Tier Levels Loaded:", tierLevels);
    } catch (error) {
        console.error("Error loading tier levels:", error);
        throw error;
    }
}


export function calculateTier(synapsePoints) {
    if (tierLevels.length === 0) {
        console.warn("Tier Levels not loaded. Returning default tier.");
        return 1; // Default tier if levels aren't loaded
    }

    return tierLevels.reduce((currentTier, level) => {
        return synapsePoints >= level.minSP ? level.tier : currentTier;
    }, 1);
}


// Fetch Latest User Data from Firestore
export async function fetchUserData() {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is signed in.");
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? userDoc.data() : null;
}

export async function updateSynapsePoints(amount, topicKey, taskKey) {
    try {
        // Ensure tier levels are loaded before proceeding
        await loadTierLevels();

        const user = auth.currentUser;
        if (!user) throw new Error("No user is signed in.");
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) throw new Error("User document does not exist in Firestore.");

        const userData = userDoc.data();
        const currentSP = userData.synapsePoints || 0;

        // Get current completion state
        const completedTasks = userData.completedTasks || {};
        const topicTasks = completedTasks[topicKey] || {};
        const isCompleted = topicTasks[taskKey]?.completed || false;

        // Calculate new SP and completion state
        const newSP = currentSP + (isCompleted ? -amount : amount);
        const newTier = calculateTier(newSP);
        const updatedTask = isCompleted ? null : { completed: true, timestamp: Date.now() };

        const updatedTopicTasks = {
            ...topicTasks,
            [taskKey]: updatedTask,
        };
        if (!updatedTask) delete updatedTopicTasks[taskKey];

        const updatedCompletedTasks = {
            ...completedTasks,
            [topicKey]: updatedTopicTasks,
        };

        // Update Firestore
        await updateDoc(userRef, {
            synapsePoints: newSP,
            tier: newTier,
            completedTasks: updatedCompletedTasks,
        });

        console.log(`Updated Synapse Points: ${newSP}, Tier: ${newTier}`);
        return { newSP, newTier, isCompleted: !isCompleted }; // Return toggled state
    } catch (error) {
        console.error("Error updating Synapse Points:", error);
        throw error;
    }
}



// Mark a Task as Completed
export function markTaskAsCompleted(element) {
    // Check if the overlay already exists
    if (!element.querySelector('.completed-overlay')) {
        const overlay = document.createElement('div');
        overlay.innerHTML = '<span class="tilted-text">COMPLETED</span>';
        overlay.className = 'completed-overlay';
        element.appendChild(overlay);
    }

    // Add the animation class to the button
    element.classList.add('activity-pressed');

    // Remove the pulse animation after it finishes to allow re-trigger
    setTimeout(() => {
        element.classList.remove('activity-pressed');
    }, 600);
}

export async function setupActivity(elementId, taskKey, points, topicKey) {
    const element = document.getElementById(elementId);

    try {
        // Check if the task is already completed
        const userData = await fetchUserData();
        const completedTasks = userData.completedTasks || {};
        const topicTasks = completedTasks[topicKey] || {};
        let isCompleted = topicTasks[taskKey]?.completed || false;

        if (isCompleted) {
            markTaskAsCompleted(element);
        }

        // Attach click event listener
        element.addEventListener('click', async () => {
            try {
                const { newSP, newTier, isCompleted: toggledCompleted } = await updateSynapsePoints(
                    points,
                    topicKey,
                    taskKey
                );

                // Update UI based on toggled state
                if (toggledCompleted) {
                    markTaskAsCompleted(element);
                } else {
                    element.classList.remove('activity-pressed');
                    const overlay = element.querySelector('.completed-overlay');
                    if (overlay) overlay.remove();
                }

                showPopup(`Task ${toggledCompleted ? 'completed' : 'undone'}! New SP: ${newSP}, Tier: ${newTier}`);
            } catch (error) {
                showPopup("Failed to update task.", false);
            }
        });
    } catch (error) {
        console.error(`Error in setupActivity for ${elementId}:`, error);
    }
    console.log(`setupActivity: elementId=${elementId}, topicKey=${topicKey}, taskKey=${taskKey}, points=${points}`);

}


// Show Popup Notification
export function showPopup(message, success = true) {
    const popup = document.getElementById('popup');
    popup.textContent = message;
    popup.className = `popup ${success ? 'success' : 'error'}`;
    popup.classList.remove('hidden');
    setTimeout(() => popup.classList.add('hidden'), 3000);
}
