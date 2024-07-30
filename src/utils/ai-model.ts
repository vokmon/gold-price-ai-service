import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

let googleModel: ChatGoogleGenerativeAI;

export const getChatGoogleGenerativeAI = () => {
  if (!googleModel) {
    googleModel = new ChatGoogleGenerativeAI({
      model: process.env.GOOGLE_AI_MODEL,
      maxOutputTokens: 8192,
      apiKey: process.env.GOOGLE_API_KEY,
      temperature: 1,
      topP: 0.95,
      topK: 64,
    });
  }
  return googleModel;
};
