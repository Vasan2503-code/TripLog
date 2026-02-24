const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_AI_API_KEY);
    try {
        console.log("Checking model availability for gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-1.5-flash!");
    } catch (error) {
        console.error("Error with gemini-1.5-flash:", error.message);

        console.log("Trying gemini-pro...");
        try {
            const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
            await modelPro.generateContent("Hello");
            console.log("Success with gemini-pro!");
        } catch (errPro) {
            console.error("Error with gemini-pro:", errPro.message);

            console.log("Trying gemini-1.0-pro...");
            try {
                const model10Pro = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
                await model10Pro.generateContent("Hello");
                console.log("Success with gemini-1.0-pro!");
            } catch (err10) {
                console.error("Error with gemini-1.0-pro:", err10.message);
            }
        }
    }
}

listModels();
