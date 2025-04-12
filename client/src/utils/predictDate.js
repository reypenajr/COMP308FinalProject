// src/utils/predictDate.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("API_KEY_HERE");

export const predictEventDate = async (title, description) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `Suggest a date and time for the following event:
Title: "${title}"
Description: "${description}"
Return the result in ISO 8601 format (e.g., 2025-04-20T15:00).`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
};
