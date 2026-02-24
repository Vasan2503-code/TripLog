require("dotenv").config();

async function listAllModels() {
    const apiKey = process.env.GEMINI_AI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => console.log(`- ${m.name} (Supports: ${m.supportedGenerationMethods.join(", ")})`));
        } else {
            console.log("No models found or error in response:");
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Fetch Error:", error.message);
    }
}

listAllModels();
