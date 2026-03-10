const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function testAISuggestion() {
    const location = "Paris";
    const preferences = "I love historic architecture and local bakeries.";

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_AI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const currentDate = new Date().toISOString().split('T')[0];
        const preferenceText = preferences ? `User Preferences: ${preferences}` : "";

        const prompt = `
You are TripLog AI, a smart and friendly travel assistant.
Your goal is to provide a highly personalized travel guide and feedback for: ${location}.
Current Date: ${currentDate}

${preferenceText}

Please provide the following information in a structured and beautiful format:

1. Speciality of the Place: what makes ${location} unique?
2. Tourist Spots: Top 3-5 must-visit landmarks.
3. Local Highlights: Hidden gems, local markets, or unique experiences.
4. AI Feedback: Provide a helpful, positive review/feedback about why this place is worth visiting.
5. Weather Report:
   - Provide a brief weather summary for the PREVIOUS 3 days (relative to ${currentDate}).
   - Provide a weather forecast for the UPCOMING 3 days (relative to ${currentDate}).
   (Note: Use your knowledge to provide realistic historical and forecast data for ${location} based on the current date).

Response Rules:
- Use clear markdown headers (### Section Name).
- Be descriptive but concise.
- Focus on accuracy and user delight.
`;

        console.log("Generating content for prompt...");
        const result = await model.generateContent(prompt);
        const text = result.response?.text();

        console.log("\n--- AI RESPONSE ---\n");
        console.log(text);
        console.log("\n--- END OF RESPONSE ---\n");

    } catch (error) {
        console.error("Test Failed:", error);
    }
}

testAISuggestion();
