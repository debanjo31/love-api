const OpenAI = require("openai");
// const {
//   GoogleGenerativeAI,
//   HarmCategory,
//   HarmBlockThreshold,
// } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

//open AI
exports.generateLetter = async (req, res) => {
  const {name, partnerName, memories, tone, relationshipDuration } = req.body;

  try {
    const prompt = `my name is ${name}, Write a ${tone} love letter to ${partnerName} for ${relationshipDuration} mentioning these memories: ${memories}.`;
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    res.status(200).json({ text: response.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate love letter 💔" });
  }
};

// Initialize Gemini
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// exports.generateLetter = async (req, res) => {
//   const {name, partnerName, memories, tone, relationshipDuration } = req.body;

//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-pro" });

//        const prompt = `my name is ${name}, Write a ${tone} love letter to ${partnerName} for ${relationshipDuration} mentioning these memories: ${memories}.`;
//     // const result = await model.generateContent(prompt);
//     const result = await model.generateContent({
//       contents: [{ role: "user", parts: [{ text: prompt }] }],
//       safetySettings: [
//         {
//           category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
//           threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH, // Allow more content
//         },
//         {
//           category: HarmCategory.HARM_CATEGORY_HARASSMENT,
//           threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
//         },
//         {
//           category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
//           threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
//         },
//         {
//           category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
//           threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
//         },
//       ],
//     });
//     const generatedText = result.response.text();

//     res.status(200).json({ text: generatedText });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to generate love letter 💔" });
//   }
// };
