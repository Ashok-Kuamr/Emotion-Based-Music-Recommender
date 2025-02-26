const URL = "./model/"; // Path to your Teachable Machine model
let model, maxPredictions, isDetecting = false;
let lastEmotion = "";

// Initialize the model and webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const videoElement = document.getElementById("webcam");

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user", // "user" for front camera, "environment" for back camera
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        });

        videoElement.srcObject = stream;
        videoElement.setAttribute("playsinline", true); // Required for mobile browsers
        videoElement.style.display = "block";
    } catch (error) {
        console.error("Error accessing webcam:", error);
        alert("Webcam access is required for emotion detection.");
    }
}

// Start Detection
async function startDetection() {
    if (!model) {
        alert("Model not initialized. Please try again.");
        return;
    }

    isDetecting = true;
    document.getElementById("start-btn").disabled = true;
    document.getElementById("stop-btn").disabled = false;
    detectLoop(); // Start the detection loop
}

// Stop Detection
function stopDetection() {
    isDetecting = false;
    document.getElementById("start-btn").disabled = false;
    document.getElementById("stop-btn").disabled = true;
}

// Real-time detection loop
async function detectLoop() {
    if (!isDetecting) return;

    await predict();
    requestAnimationFrame(detectLoop);
}

// Predict Emotion
async function predict() {
    const videoElement = document.getElementById("webcam");
    const prediction = await model.predict(videoElement); // Use videoElement directly
    let highestProbability = 0;
    let detectedEmotion = "";

    // Find the emotion with the highest probability
    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > highestProbability) {
            highestProbability = prediction[i].probability;
            detectedEmotion = prediction[i].className;
        }
    }

    if (detectedEmotion && detectedEmotion !== lastEmotion) {
        lastEmotion = detectedEmotion;
        document.getElementById("emotion-text").innerText = detectedEmotion;
        recommendMusic(detectedEmotion);
    }
}

// Update Playlist
function recommendMusic(emotion) {
    const playlists = {
        Happy: ["https://open.spotify.com/embed/playlist/37i9dQZF1DXdPec7aLTmlC", "Happy Hits"],
        Sad: ["https://open.spotify.com/embed/playlist/37i9dQZF1DX3rxVfibe1L0", "Sad Indie"],
        Angry: ["https://open.spotify.com/embed/playlist/37i9dQZF1DX3rxVfibe1L0", "Rock Classics"],
        Neutral: ["https://open.spotify.com/embed/playlist/37i9dQZF1DX4WYpdgoIcn6", "Chill Hits"],
    };

    const [playlistLink, playlistName] = playlists[emotion] || ["", "No recommendation yet"];
    document.getElementById("playlist-embed").src = playlistLink;
    document.getElementById("playlist-name").innerText = playlistName;
}

// Event Listeners
document.getElementById("start-btn").addEventListener("click", startDetection);
document.getElementById("stop-btn").addEventListener("click", stopDetection);

// Initialize the app
init();
