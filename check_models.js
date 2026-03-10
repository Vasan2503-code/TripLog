const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function run() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_AI_API_KEY);
    try {
        // There is no direct "listModels" in the SDK's GoogleGenerativeAI class usually
        // but we can try to see if it exists or use the REST API approach with the key.
        console.log("Testing API Key validity with a simple request...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("test");
        console.log("Success! Response text:", result.response.text());
    } catch (error) {
        console.error("SDK Error Details:");
        console.error("Status:", error.status);
        console.error("Message:", error.message);
        if (error.response) {
            console.error("Response Data:", await error.response.json());
        }
    }
}

run();
