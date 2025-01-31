// popup.js
console.log("popup.js loaded.");

document.getElementById("start-recognition").addEventListener("click", toggleRecognition);

function toggleRecognition() {
    const button = document.getElementById("start-recognition");
    button.innerHTML = button.innerHTML === "Start" ? "Stop" : "Start";

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs.length === 0 || !tabs[0].id) {
            console.error("No active tab found.");
            return;
        }

        try {
            await chrome.tabs.sendMessage(tabs[0].id, { action: "toggleRecognition" });
        } catch (error) {
            console.error("Failed to send message:", error);
            // If content script isn't loaded yet, inject it
            await chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ["content.js"]
            });
            // Try sending the message again
            await chrome.tabs.sendMessage(tabs[0].id, { action: "toggleRecognition" });
        }
    });
}