// content.js
console.log("content.js injected", window.location.href);

// Prevent duplicate initialization
if (typeof window.isIframeInitialized === 'undefined') {
    window.isIframeInitialized = true;

    // Homonym map
    const homonyms = {
        'their': ['there', "they're"],
        'there': ['their', "they're"],
        "they're": ['their', 'there'],
        'to': ['too', 'two'],
        'too': ['to', 'two'],
        'two': ['to', 'too'],
        'for': ['four', 'fore'],
        'four': ['for', 'fore'],
        'fore': ['for', 'four'],
        'write': ['right'],
        'right': ['write'],
        'your': ["you're"],
        "you're": ['your'],
        'hear': ['here'],
        'here': ['hear'],
        'wait': ['weight'],
        'weight': ['wait'],
        'break': ['brake'],
        'brake': ['break'],
        'hole': ['whole'],
        'whole': ['hole'],
        'come': ['cum'],
        'cum': ['come'],
    };

    function normalizeText(text) {
        return text
            .toLowerCase()
            .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function getWordVariations(word) {
        word = word.toLowerCase();
        const variations = new Set([word]);
        if (homonyms[word]) {
            homonyms[word].forEach(variant => variations.add(variant));
        }
        return variations;
    }

    function calculateMatchPercentage(str1, str2) {
        const words1 = normalizeText(str1).split(/\s+/);
        const words2 = normalizeText(str2).split(/\s+/);
        
        let matchCount = 0;
        for (const word1 of words1) {
            const word1Variations = getWordVariations(word1);
            if (words2.some(word2 => word1Variations.has(word2))) {
                matchCount++;
            }
        }
        
        const maxWords = Math.max(words1.length, words2.length);
        return (matchCount / maxWords) * 100;
    }

    const isIframe = window !== window.top;

    if (isIframe) {
        // Set up a MutationObserver to watch for DOM changes
        const observer = new MutationObserver((mutations) => {
            // When DOM changes, notify the parent
            window.parent.postMessage({ type: 'CONTENT_CHANGED' }, '*');
        });

        // Start observing the entire document for any DOM changes
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        window.addEventListener('message', function(event) {
            if (event.data.type === 'FIND_ELEMENTS') {
                const elements = Array.from(document.querySelectorAll('button, div'));
                const elementInfo = elements.map(el => ({
                    text: el.textContent.trim(),
                    tag: el.tagName,
                    hasChildren: el.children.length > 0,
                    rect: el.getBoundingClientRect()
                }));
                
                window.parent.postMessage({
                    type: 'ELEMENTS_FOUND',
                    elements: elementInfo
                }, '*');
            } else if (event.data.type === 'CLICK_ELEMENT') {
                const elements = Array.from(document.querySelectorAll('button, div'));
                let bestMatch = null;
                let bestMatchPercentage = 0;

                elements.forEach(el => {
                    const matchPercentage = calculateMatchPercentage(
                        el.textContent.trim(),
                        event.data.text
                    );
                    if (matchPercentage > bestMatchPercentage && matchPercentage >= 40) {
                        bestMatch = el;
                        bestMatchPercentage = matchPercentage;
                    }
                });

                if (bestMatch) {
                    console.log(`Clicking element with ${bestMatchPercentage.toFixed(1)}% match:`, 
                              `Original: "${bestMatch.textContent.trim()}"`,
                              `Normalized: "${normalizeText(bestMatch.textContent)}"`);
                    bestMatch.click();
                }
            }
        });

        // Initial announcement
        window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
    } else {
        // We're in the main page
        let recognition = null;
        let iframeElements = [];
        let isUserInitiatedStop = false;

        // Listen for messages from the popup
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === "toggleRecognition") {
                if (!recognition) {
                    isUserInitiatedStop = false;
                    startSpeechRecognitionInTab();
                } else {
                    isUserInitiatedStop = true;
                    stopSpeechRecognition();
                }
                sendResponse({ status: "success" });
            }
            return true;
        });

        function stopSpeechRecognition() {
            if (recognition) {
                isUserInitiatedStop = true;
                recognition.stop();
                recognition = null;
                console.log("Speech recognition stopped by user.");
            }
        }

        function refreshElements() {
            const iframe = document.querySelector('.eosIframe');
            if (iframe) {
                iframe.contentWindow.postMessage({ type: 'FIND_ELEMENTS' }, '*');
            }
        }

        async function startSpeechRecognitionInTab() {
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
                console.log("Microphone access granted. Starting speech recognition...");
                startSpeechRecognition();
            } catch (error) {
                console.error("Microphone access denied:", error);
                alert("Microphone access is required for speech recognition to work. Please enable it in your browser settings.");
            }
        }

        function startSpeechRecognition() {
            var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;  // Changed to true to prevent auto-stopping
            recognition.lang = "en-US";

            // Set up message listener for iframe responses
            window.addEventListener('message', (event) => {
                if (event.data.type === 'ELEMENTS_FOUND') {
                    iframeElements = event.data.elements;
                    console.log('Updated elements from iframe:', iframeElements.length);
                } else if (event.data.type === 'IFRAME_READY') {
                    console.log('Iframe is ready');
                    refreshElements();
                } else if (event.data.type === 'CONTENT_CHANGED') {
                    console.log('Content changed, refreshing elements...');
                    refreshElements();
                }
            });

            recognition.onstart = () => {
                console.log("Speech recognition started. Please speak...");
                refreshElements();
            };

            recognition.onresult = (event) => {
                const result = event.results[event.results.length - 1];
                // Only process if this is a final result
                if (result.isFinal) {
                    const transcript = result[0].transcript.trim();
                    console.log("Recognized speech:", transcript);
                    console.log("Normalized speech:", normalizeText(transcript));

                    let bestMatch = null;
                    let bestMatchPercentage = 0;

                    iframeElements.forEach(element => {
                        const matchPercentage = calculateMatchPercentage(
                            element.text,
                            transcript
                        );
                        if (matchPercentage > bestMatchPercentage && matchPercentage >= 40) {
                            bestMatch = element;
                            bestMatchPercentage = matchPercentage;
                        }
                    });

                    if (bestMatch) {
                        console.log(`Found match with ${bestMatchPercentage.toFixed(1)}% confidence:`, 
                                  `Original: "${bestMatch.text}"`,
                                  `Normalized: "${normalizeText(bestMatch.text)}"`);
                        
                        const iframe = document.querySelector('.eosIframe');
                        if (iframe) {
                            iframe.contentWindow.postMessage({
                                type: 'CLICK_ELEMENT',
                                text: bestMatch.text
                            }, '*');
                        }
                    } else {
                        console.log(`No matching elements found for: "${transcript}"`);
                    }
                }
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                if (event.error === "not-allowed") {
                    alert("Speech recognition not allowed. Please check your browser microphone settings.");
                }
                recognition = null;
            };

            recognition.onend = () => {
                console.log("Speech recognition ended.");
                
                // Auto-restart if it wasn't stopped by the user
                if (!isUserInitiatedStop && recognition !== null) {
                    console.log("Automatically restarting speech recognition...");
                    recognition.start();
                } else {
                    recognition = null;
                }
            };

            recognition.start();
        }
    }
}