require("dotenv").config();

async function listSomeModels() {
    const apiKey = process.env.GEMINI_AI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("First 10 Models:");
            data.models.slice(0, 10).forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log("Error in response:");
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Fetch Error:", error.message);
    }
}

listSomeModels();
