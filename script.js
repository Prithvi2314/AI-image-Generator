const themeToggle = document.querySelector(".theme-toggle");
const promptform = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const generateBtn = document.querySelector(".generate-btn");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");

const API_KEY = "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"; // Replace with your valid API Key

// Switch between light and dark themes
const toggleTheme = () => {
    const isDarkTheme = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
};

// Calculate width/height based on chosen ratio
const getImageDimensions = (aspectRatio, baseSize = 512) => {
    const [width, height] = aspectRatio.split("/").map(Number);
    const scaleFactor = baseSize / Math.sqrt(width * height);

    let calculatedWidth = Math.round(width * scaleFactor);
    let calculatedHeight = Math.round(height * scaleFactor);

    // Ensure dimensions are multiples of 16
    calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
    calculatedHeight = Math.floor(calculatedHeight / 16) * 16;

    return { width: calculatedWidth, height: calculatedHeight };
};

// Replace loading spinner with the actual image
const updateImageCard = (imgIndex, imgUrl) => {
    const imgCard = document.getElementById(`img-card-${imgIndex}`);
    if (!imgCard) return;

    imgCard.classList.remove("loading");
    imgCard.innerHTML = `
        <img src="${imgUrl}" class="result-img">
        <div class="img-overlay">
            <a href="${imgUrl}" class="img-download-btn" download="${Date.now()}.png">
                <i class="fa-solid fa-download"></i>
            </a>
        </div>
    `;
};

// Send request to Hugging Face API to create images
const generateImages = async (selectedModel, imageCount, aspectRatio, promptText) => {
    const MODEL_URL = `https://api-inference.huggingface.co/models/${selectedModel}`;
    const { width, height } = getImageDimensions(aspectRatio);
    generateBtn.setAttribute("disabled", "true");

    // Create an array of image generation promises
    const imagePromises = Array.from({ length: imageCount }, async (_, i) => {
        try {
            const response = await fetch(MODEL_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: promptText,
                    parameters: { width, height },
                    options: { wait_for_model: true, use_cache: false },
                }),
            });

            if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);

            // Convert response to an image URL and update the image card
            const result = await response.blob();
            updateImageCard(i, URL.createObjectURL(result));
        } catch (error) {
            console.error("Error generating image:", error);
            const imgCard = document.getElementById(`img-card-${i}`);
            if (imgCard) {
                imgCard.classList.remove("loading");
                imgCard.classList.add("error");
                imgCard.querySelector(".status-text").textContent = "Generation failed! Check console.";
            }
        }
    });

    await Promise.allSettled(imagePromises);
    generateBtn.removeAttribute("disabled");
};

// Create placeholder cards with loading spinners
const createImageCards = (selectedModel, imageCount, aspectRatio, promptText) => {
    gridGallery.innerHTML = "";

    for (let i = 0; i < imageCount; i++) {
        gridGallery.innerHTML += `
            <div class="img-card loading" id="img-card-${i}" style="aspect-ratio:${aspectRatio}">
                <div class="status-container">
                    <div class="spinner"></div>
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <p class="status-text">Generating...</p>
                </div>
            </div>
        `;
    }

    generateImages(selectedModel, imageCount, aspectRatio, promptText);
};

// Handle form submission
const handleFormSubmit = (e) => {
    e.preventDefault();

    // Get form values
    const selectedModel = modelSelect.value;
    const imageCount = parseInt(countSelect.value) || 1;
    const aspectRatio = ratioSelect.value || "1/1";
    const promptText = promptInput.value.trim();

    createImageCards(selectedModel, imageCount, aspectRatio, promptText);
};

// Fill prompt input with random example
promptBtn.addEventListener("click", () => {
    const examplePrompts = [
        "A magic forest with glowing plants and fairy homes among giant mushrooms",
        "An old steampunk airship floating through golden clouds at sunset",
        "A future Mars colony with glass domes and gardens against red mountains",
        "A dragon sleeping on gold coins in a crystal cave",
        "An underwater kingdom with merpeople and glowing coral buildings",
        "A floating island with waterfalls pouring into clouds below",
        "A witch's cottage in fall with magic herbs in the garden",
        "A robot painting in a sunny studio with art supplies around it",
        "A magical library with floating glowing books and spiral staircases",
        "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
        "A cosmic beach with glowing sand and an aurora in the night sky",
        "A medieval marketplace with colorful tents and street performers",
        "A cyberpunk city with neon signs and flying cars at night",
        "A peaceful bamboo forest with a hidden ancient temple",
        "A giant turtle carrying a village on its back in the ocean",
    ];
    
    const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    promptInput.value = prompt;
    promptInput.focus();
});

promptform.addEventListener("submit", handleFormSubmit);
themeToggle.addEventListener("click", toggleTheme);
