import { GoogleGenAI, Type } from "@google/genai";
import { CampaignPlan, GenerationSettings } from "../types";

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is available.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Step 1: Analyze the product and create a consistent model description + 9 scenarios.
 */
export const planCampaign = async (
  imageFile: File,
  settings: GenerationSettings
): Promise<CampaignPlan> => {
  const ai = getClient();
  const base64Image = await fileToGenerativePart(imageFile);

  const modelPrompt = settings.modelType === 'Custom' 
    ? settings.customModelDescription 
    : `A generic ${settings.modelType} model suitable for this product`;

  const prompt = `
    You are a world-class Marketing Creative Director. 
    I have a product: "${settings.productName}".
    Description: "${settings.productDescription}".
    
    My target model preference is: ${modelPrompt}.

    Task 1: Analyze the uploaded product image. Create a detailed visual description of a SINGLE human model (Physical features, hair, clothing style) that fits the brand perfectly. This description will be used to keep the model consistent across multiple AI generated images.
    
    Task 2: Create 9 distinct marketing visual concepts (scenarios) for this product. 
    Examples: Holding the product, using the product, lifestyle shot with product, close-up with model in background, flatlay with model's hand, etc.
    Ensure diversity in angles and framing (close-up, medium shot, wide shot).
    
    Return the response in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        { inlineData: { mimeType: imageFile.type, data: base64Image } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          modelDescription: {
            type: Type.STRING,
            description: "Detailed visual description of the consistent model to be used."
          },
          scenarios: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                title: { type: Type.STRING, description: "Short title of the scenario (e.g. 'Lifestyle Shot')" },
                prompt: { type: Type.STRING, description: "Specific instruction for the image generator focusing on the action and pose." }
              }
            }
          }
        }
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate campaign plan.");
  }

  return JSON.parse(response.text) as CampaignPlan;
};

/**
 * Step 2: Generate a single image based on the plan.
 */
export const generateMarketingImage = async (
  imageFile: File,
  modelDescription: string,
  scenarioPrompt: string,
  aspectRatio: string
): Promise<string> => {
  const ai = getClient();
  const base64Image = await fileToGenerativePart(imageFile);

  // Valid aspect ratios for Gemini: "1:1", "3:4", "4:3", "9:16", "16:9"
  // Map our UI aspect ratios to Gemini accepted strings if needed, though they match mostly.
  
  const fullPrompt = `
    Create a photorealistic, high-quality marketing image.
    
    THE MODEL: ${modelDescription}
    THE ACTION: ${scenarioPrompt}
    
    IMPORTANT: The product in the image must look like the reference image provided. 
    Lighting: Cinematic, professional studio or natural light (depending on scenario).
    Style: Commercial photography, 8k resolution, highly detailed.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: {
      parts: [
        { text: fullPrompt },
        { inlineData: { mimeType: imageFile.type, data: base64Image } },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any, // "1:1" | "9:16" | "16:9"
        imageSize: "1K"
      }
    }
  });

  // Extract image
  let finalUrl = "";
  if (response.candidates && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        finalUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
  }

  if (!finalUrl) {
    throw new Error("No image generated.");
  }

  return finalUrl;
};