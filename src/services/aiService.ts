
import { GoogleGenAI } from "@google/genai";
import { getEnv } from "./api";

const apiKey = getEnv('NEXT_PUBLIC_GEMINI_API_KEY') || getEnv('VITE_GEMINI_API_KEY') || getEnv('GEMINI_API_KEY') || '';
const ai = new GoogleGenAI({ apiKey });

export async function chatWithAssistant(message: string, context?: string) {
  const prompt = `
    You are PolyGen Assistant, an expert in Malaysian Polytechnic Outcome-Based Education (OBE).
    Your goal is to help lecturers design Coursework Item Specification Tables (CIST).
    
    ${context ? `Context about the current course/task: ${context}` : ''}
    
    User message: ${message}
    
    If the user provides syllabus or topic text, suggest appropriate "CONSTRUCT (GS/SS)" descriptions.
    GS = General Skill, SS = Specific Skill.
    
    Keep your responses professional, concise, and helpful.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text?.trim() || "I'm sorry, I couldn't process that.";
  } catch (error: unknown) {
    console.error("Chat Error:", error);
    if (error instanceof Error && (error.message.includes('429') || (error as { status?: number }).status === 429)) {
      return "Rate limit exceeded. Please wait a moment before trying again.";
    }
    return "Error communicating with AI.";
  }
}

export async function autoGenerateConstructs(params: {
  syllabus: string;
  topics: string[];
  clos: string[];
  tasks: string[];
}) {
  const { syllabus, topics, clos, tasks } = params;

  const prompt = `
    As an expert in Malaysian Polytechnic Outcome-Based Education (OBE), analyze the provided syllabus and suggest "CONSTRUCT (GS/SS)" descriptions for each assessment task.
    
    Course Syllabus:
    ${syllabus.substring(0, 8000)}
    
    Course Topics:
    ${topics.join(', ')}
    
    Course Learning Outcomes (CLOs):
    ${clos.join(', ')}
    
    Assessment Tasks to map:
    ${tasks.join(', ')}
    
    For each task, suggest a construct that is either a General Skill (GS) or Specific Skill (SS).
    The construct must be relevant to the syllabus content and the task name.
    
    Return the result as a JSON array of objects:
    [
      { "task": "Task Name", "construct": "GS/SS: Description" }
    ]
    
    Return ONLY the JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || "[]") as { task: string; construct: string }[];
  } catch (error: unknown) {
    console.error("Auto-Generate Error:", error);
    if (error instanceof Error && (error.message.includes('429') || (error as { status?: number }).status === 429)) {
      throw new Error("Rate limit exceeded. Please try again in a few minutes.");
    }
    return [];
  }
}

export async function generateTopicConstructs(params: {
  topicTitle: string;
  topicSyllabus: string;
  courseClos: string[];
}) {
  const { topicTitle, topicSyllabus, courseClos } = params;

  const prompt = `
    As an expert in Malaysian Polytechnic Outcome-Based Education (OBE), analyze the provided syllabus for a specific topic and suggest appropriate "CONSTRUCT (GS/SS)" descriptions.
    
    Topic: ${topicTitle}
    Topic Syllabus Content:
    ${topicSyllabus.substring(0, 4000)}
    
    Course Learning Outcomes (CLOs):
    ${courseClos.join(', ')}
    
    Suggest 2-4 constructs that are either a General Skill (GS) or Specific Skill (SS).
    The construct must be relevant to the topic content and the CLOs.
    
    Return the result as a JSON array of objects:
    [
      { "code": "GS1", "description": "General Skill: Description" },
      { "code": "SS1", "description": "Specific Skill: Description" }
    ]
    
    Return ONLY the JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || "[]") as { code: string; description: string }[];
  } catch (error: unknown) {
    console.error("Topic Constructs Generation Error:", error);
    throw error;
  }
}

export async function suggestConstruct(params: {
  clos: string[];
  daStandards: string[];
  taskName: string;
}) {
  const { clos, daStandards, taskName } = params;
  
  const prompt = `
    As an expert in Malaysian Polytechnic Outcome-Based Education (OBE), suggest a professional "CONSTRUCT (GS/SS)" description for an assessment task.
    
    Assessment Task: ${taskName}
    Associated CLOs: ${clos.join(', ')}
    Mapped Dublin Accord Standards: ${daStandards.join(', ')}
    
    The construct should specify if it is a General Skill (GS) or Specific Skill (SS) and provide a concise description of what is being measured (e.g., "GS: Critical Thinking and Problem Solving" or "SS: Application of Workshop Safety Procedures").
    
    Return ONLY the suggested text, no extra explanation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text?.trim() || "GS: General Skills / SS: Specific Skills";
  } catch (error: unknown) {
    console.error("AI Suggestion Error:", error);
    if (error instanceof Error && (error.message.includes('429') || (error as { status?: number }).status === 429)) {
      return "Rate limit exceeded. Please wait.";
    }
    return "Error generating suggestion. Please try again.";
  }
}
