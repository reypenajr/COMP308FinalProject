// src/utils/aiHelpers.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("API_KEY_HERE"); 
export const predictEventDate = async (title, description) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
You are a smart assistant. Based on the title and description of a community event, suggest an appropriate date and time in ISO format (YYYY-MM-DDTHH:MM).

Title: "${title}"
Description: "${description}"
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim().replace(/[`*]/g, "").split("\n")[0];
};

export const suggestVolunteers = async (title, description) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
You're an AI assistant helping plan events. Based on the title and description, suggest 3 volunteer roles needed for the event (like Greeters, Setup Crew, Refreshment Helpers, etc.).

Title: "${title}"
Description: "${description}"

Give a comma-separated list.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim().replace(/[`*]/g, "");
};
