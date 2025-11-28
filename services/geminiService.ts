import { GoogleGenAI, Type, Modality } from "@google/genai";
import { CampaignPlan, GenerationSettings, VoiceName, Copywriting } from "../types";

declare const lamejs: any;

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  if (!file || !(file instanceof Blob)) {
    return Promise.reject(new Error("Invalid file provided. Please ensure the file is a valid image."));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (!base64String) {
          reject(new Error("Failed to read file"));
          return;
      }
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (e) => reject(new Error("FileReader error: " + e));
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
 * Step 1: Analyze the product and create a consistent model description + 9 scenarios + Copywriting.
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

    Task 3: Write a short, punchy marketing script (Copywriting) following this exact structure:
    - Hook (Problem): Grab attention immediately.
    - Intro (Solution): Introduce the product as the fix.
    - CTA (Agitation): Tell them what to do next with urgency.
    
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
          },
          copywriting: {
            type: Type.OBJECT,
            properties: {
              hook: { type: Type.STRING, description: "The problem statement/hook." },
              intro: { type: Type.STRING, description: "The solution/introduction." },
              cta: { type: Type.STRING, description: "The call to action." },
              fullText: { type: Type.STRING, description: "The complete script combined." }
            }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("Failed to generate campaign plan.");
  }

  // Clean potentially malformed JSON (remove markdown code blocks)
  const cleanedText = text.replace(/```json\n?|```/g, '').trim();

  try {
    return JSON.parse(cleanedText) as CampaignPlan;
  } catch (e) {
    console.error("Failed to parse JSON", e, cleanedText);
    throw new Error("Failed to parse campaign plan JSON.");
  }
};

/**
 * Independent Copywriting Regeneration
 */
export const regenerateCopywriting = async (
  settings: GenerationSettings
): Promise<Copywriting> => {
  const ai = getClient();
  
  const prompt = `
    You are a world-class Marketing Creative Director. 
    Product: "${settings.productName}".
    Description: "${settings.productDescription}".
    Model Archetype: "${settings.modelType}".

    Task: Write a fresh, short, punchy marketing script (Copywriting) following this exact structure:
    - Hook (Problem): Grab attention immediately.
    - Intro (Solution): Introduce the product as the fix.
    - CTA (Agitation): Tell them what to do next with urgency.
    
    Return the response in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hook: { type: Type.STRING },
          intro: { type: Type.STRING },
          cta: { type: Type.STRING },
          fullText: { type: Type.STRING }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to regenerate copywriting.");

  const cleanedText = text.replace(/```json\n?|```/g, '').trim();
  try {
    return JSON.parse(cleanedText) as Copywriting;
  } catch (e) {
    throw new Error("Failed to parse copywriting JSON.");
  }
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

  const fullPrompt = `
    Create a photorealistic, high-quality marketing image.
    
    THE MODEL: ${modelDescription}
    THE ACTION: ${scenarioPrompt}
    
    IMPORTANT: The product in the image must look like the reference image provided. 
    Lighting: Cinematic, professional studio or natural light (depending on scenario).
    Style: Commercial photography, 8k resolution, highly detailed.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        { text: fullPrompt },
        { inlineData: { mimeType: imageFile.type, data: base64Image } },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any, 
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

/**
 * Step 3: Generate Audio (TTS) with Speed and MP3 Encoding
 */
export const generateSpeech = async (text: string, voiceName: VoiceName, speed: number = 1.0): Promise<Blob> => {
  const ai = getClient();
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("Failed to generate audio.");
  }

  // Convert Base64 string to Float32Array PCM for processing
  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Gemini Output is 24kHz PCM (16-bit usually, but let's treat bytes directly to buffer)
  // To handle speed and MP3 properly, we use OfflineAudioContext
  const originalSampleRate = 24000;
  
  // Convert 16-bit PCM bytes to Float32Array
  const pcm16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(pcm16.length);
  for(let i=0; i<pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768;
  }

  // Process speed change using Web Audio API
  // Note: changing playbackRate also changes pitch (standard behavior for simple rate change)
  const duration = float32.length / originalSampleRate;
  const newDuration = duration / speed;
  
  const offlineCtx = new OfflineAudioContext(1, Math.ceil(newDuration * originalSampleRate), originalSampleRate);
  const buffer = offlineCtx.createBuffer(1, float32.length, originalSampleRate);
  buffer.copyToChannel(float32, 0);

  const source = offlineCtx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = speed;
  source.connect(offlineCtx.destination);
  source.start();

  const renderedBuffer = await offlineCtx.startRendering();
  const resampledData = renderedBuffer.getChannelData(0);

  // Encode to MP3 using lamejs
  return encodeMp3(resampledData, originalSampleRate);
};


function encodeMp3(channels: Float32Array, sampleRate: number): Blob {
  if (typeof lamejs === 'undefined') {
      console.warn("lamejs not found, falling back to WAV");
      // Fallback: Convert back to Int16 PCM and wrap in WAV
      const int16 = new Int16Array(channels.length);
      for(let i=0; i<channels.length; i++) {
          int16[i] = Math.max(-1, Math.min(1, channels[i])) * 32767; // clamp
      }
      return pcmToWav(new Uint8Array(int16.buffer), sampleRate);
  }

  const mp3encoder = new lamejs.Mp3Encoder(1, sampleRate, 128); // 1 channel, kbps 128
  const samples = new Int16Array(channels.length);
  
  // Convert float to int16 for lamejs
  for (let i = 0; i < channels.length; i++) {
    samples[i] = Math.max(-1, Math.min(1, channels[i])) * 32767;
  }

  const mp3Data: Int8Array[] = [];
  
  // Encode in chunks
  const sampleBlockSize = 1152; // multiple of 576
  for (let i = 0; i < samples.length; i += sampleBlockSize) {
    const chunk = samples.subarray(i, i + sampleBlockSize);
    const mp3buf = mp3encoder.encodeBuffer(chunk);
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
  }
  
  const mp3buf = mp3encoder.flush();
  if (mp3buf.length > 0) {
    mp3Data.push(mp3buf);
  }

  return new Blob(mp3Data, { type: 'audio/mp3' });
}

// Fallback WAV encoder (original)
function pcmToWav(pcmData: Uint8Array, sampleRate: number): Blob {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcmData.length, true); // ChunkSize
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample
  writeString(view, 36, 'data');
  view.setUint32(40, pcmData.length, true); // Subchunk2Size

  return new Blob([wavHeader, pcmData], { type: 'audio/wav' });
}