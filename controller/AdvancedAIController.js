const { GoogleGenAI } = require("@google/genai");

const getAdvancedTripSuggestions = async (req, res) => {
    try {
        const { location, preferences } = req.body;

        if (!location) {
            return res.status(400).json({ message: "Location is required" });
        }

        const client = new GoogleGenAI({
            apiKey: process.env.GEMINI_AI_API_KEY,
            httpOptions: {
                apiVersion: 'v1'
            }
        });

        const preferenceText = preferences ? `User Preferences: ${preferences}` : "No specific preferences provided.";
        const currentDate = new Date().toISOString().split('T')[0];

        const prompt = `
        You are TripLog AI, an expert travel consultant.
        Task: Provide a high-quality travel guide for "${location}".
        Current Date: ${currentDate}

        ${preferenceText}

        Please structure your response with the following sections using Markdown formatting:

        ### 1. Speciality of the Place
        Describe what makes ${location} unique and why it stands out from other locations globally or regionally.

        ### 2. Tourist Spots (Top Landmark)
        List 3-5 major attractions in ${location}. For each, provide a one-sentence description.

        ### 3. Local Highlights
        Mention hidden gems, local markets, festivals, or experiences that are popular with locals but often missed by typical tourists.

        ### 4. AI Feedback & Review
        Based on reviews and travel trends, provide a helpful and encouraging review/feedback about visiting ${location}. Why should the user go here?

        ### 5. Weather Reports
        Based on the current date (${currentDate}), provide:
        - **Previous 3 Days Summary**: A general summary of the weather conditions for the last 3 days.
        - **Upcoming 3 Days Forecast**: A detailed forecast for the next 3 days including temperature range and likely conditions (sunny, rainy, etc.).
        (Note: Use your internal knowledge to provide realistic data for this time of year in ${location}).

        Ensure the tone is welcoming, professional, and exciting.
        `;

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        const text = response.text;

        if (!text) {
            throw new Error("AI Service returned an empty response. Please try again.");
        }

        res.status(200).json({
            success: true,
            location: location,
            suggestion: text
        });

    } catch (error) {
        console.error("Advanced AI Controller Error:", error);

        res.status(500).json({
            success: false,
            message: "AI Suggestion Service Failed",
            error: error.message,
            tip: "Please ensure your GEMINI_AI_API_KEY is valid and your @google/genai package is up to date."
        });
    }
};

module.exports = getAdvancedTripSuggestions;