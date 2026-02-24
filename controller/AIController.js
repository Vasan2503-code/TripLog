const { GoogleGenerativeAI } = require("@google/generative-ai");

const getTripSuggestions = async (req, res) => {
    try {
        const { location, preferences } = req.body;

        if (!location) {
            return res.status(400).json({ message: "Location is required" });
        }

        // Initialize inside the handler to ensure env vars are ready
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_AI_API_KEY);

        // We try gemini-1.5-flash first as it's better at following detailed instructions
        let model;
        try {
            model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        } catch (e) {
            model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
        }

        const preferenceText = preferences ? `User Preferences: ${preferences}` : "";

        const prompt = `
You are TripLog AI, a smart and friendly travel assistant.
Your goal is to provide a highly personalized travel guide for: ${location}.
${preferenceText}

Please provide the following information:
1. Special Locations & Hidden Gems: Suggest 3-5 unique places specifically aligned with the user preferences (or general top spots if no preferences provided).
2. Top Attractions: Must-see places in ${location}.
3. Local Food: Famous dishes and recommended local eateries.
4. Accommodation: Recommended hotels (Budget, Mid-range, Luxury).
5. Practical Info: Best time to visit, local transport, and safety tips.
6. Custom Itinerary: A brief 2-day and 5-day plan.
7. Budget Estimation: Approximate daily costs.

Response Rules:
- Use clear markdown headers (e.g., ### Section Name).
- Be descriptive but concise.
- Focus on "Special" and "Unique" locations that match the user's specific interests.
`;

        const result = await model.generateContent(prompt);
        const text = result.response?.text();

        if (!text) {
            throw new Error("AI did not return a valid response");
        }

        res.status(200).json({ suggestion: text });

    } catch (error) {
        console.error("AI Controller Error:", error);

        // Final fallback to gemini-1.0-pro if the primary attempt failed
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_AI_API_KEY);
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
            const result = await fallbackModel.generateContent(`Suggest a quick travel guide for ${req.body.location || "this location"}`);
            const text = result.response?.text();
            return res.status(200).json({
                suggestion: text,
                note: "Note: Used simplified fallback suggestions."
            });
        } catch (innerError) {
            res.status(500).json({
                message: "AI Service Error",
                error: error.message,
                suggestion: "Please verify your API key and network connection."
            });
        }
    }
};

module.exports = getTripSuggestions;