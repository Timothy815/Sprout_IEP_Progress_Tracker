import { GoogleGenAI } from "@google/genai";
import { Student, Goal, Objective, DataPoint } from "../types";

const apiKey = process.env.API_KEY || '';

export const generateProgressReport = async (
  student: Student,
  goals: Goal[],
  objectives: Objective[],
  dataPoints: DataPoint[]
): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing.";
  }

  const ai = new GoogleGenAI({ apiKey });

  // Simplified context for AI
  const prompt = `
    Student: ${student.name}
    Goals Count: ${goals.length}
    Objectives Count: ${objectives.length}
    Please write a generic progress report.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Could not generate report.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating report.";
  }
};