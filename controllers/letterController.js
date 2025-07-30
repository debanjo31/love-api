const OpenAI = require("openai");
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

//open AI
// exports.generateLetter = async (req, res) => {
//   const {name, partnerName, memories, tone, relationshipDuration } = req.body;

//   try {
//     const prompt = `my name is ${name}, Write a ${tone} love letter to ${partnerName} for ${relationshipDuration} mentioning these memories: ${memories}.`;
//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: prompt }],
//       temperature: 0.7,
//     });

//     res.status(200).json({ text: response.choices[0].message.content });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to generate love letter 💔" });
//   }
// };

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateLetter = async (req, res) => {
  // Input validation
  const { name, partnerName, memories, tone, relationshipDuration } = req.body;
  if (!name || !partnerName || !memories || !tone || !relationshipDuration) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Sanitize inputs
    const sanitizedMemories = memories.replace(/[^\w\s,.]/g, "");
    const sanitizedTone = tone.replace(/[^\w\s]/g, "");

    // Reformulated prompt with more neutral language
    const prompt = `Task: Compose a appreciation letter
    Context: Professional letter writing
    Parameters:
    - Author: ${name}
    - Recipient: ${partnerName}
    - Duration of association: ${relationshipDuration}
    - Style: ${sanitizedTone}
    - Key moments to reference: ${sanitizedMemories}
    
    Please write a respectful and appropriate letter expressing genuine appreciation in not more than 150 words.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    // Add detailed error logging
    if (result.candidates?.[0]?.finishReason === "SAFETY") {
      console.error("Safety filter triggered:", {
        safetyRatings: result.candidates[0].safetyRatings,
        prompt: prompt,
      });
      throw new Error("SAFETY_FILTER");
    }

    const generatedText = await result.response.text();
    res.status(200).json({ success: true, text: generatedText });
  } catch (err) {
    console.error("Generation Error:", {
      error: err,
      message: err.message,
      body: req.body,
    });

    res.status(500).json({
      success: false,
      error:
        err.message === "SAFETY_FILTER"
          ? "Please rephrase your memories using more formal language"
          : "Failed to generate letter. Please try again.",
    });
  }
};
