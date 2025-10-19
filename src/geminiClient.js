export async function generateFromGemini(prompt) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await res.json();
    console.log("Gemini API Raw Response:", data);

    // Check if we got a valid text back
    if (data?.candidates?.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else if (data.error) {
      console.error("Gemini API Error:", data.error.message);
      return `⚠️ Gemini Error: ${data.error.message}`;
    } else {
      return "⚠️ No response from Gemini.";
    }
  } catch (err) {
    console.error("Error contacting Gemini API:", err);
    return "⚠️ Error contacting Gemini API.";
  }
}
