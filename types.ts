export enum AspectRatio {
  SQUARE = "1:1",
  PORTRAIT = "9:16",
  LANDSCAPE = "16:9"
}

export enum ModelType {
  FEMALE = "Female",
  MALE = "Male",
  ADULT = "Adult (Any)",
  CHILD = "Child",
  CUSTOM = "Custom"
}

export interface GenerationSettings {
  productName: string;
  productDescription: string;
  modelType: ModelType;
  customModelDescription?: string;
  aspectRatio: AspectRatio;
}

export interface Copywriting {
  hook: string;
  intro: string;
  cta: string;
  fullText: string;
}

export interface CampaignPlan {
  modelDescription: string;
  scenarios: {
    id: number;
    title: string;
    prompt: string;
  }[];
  copywriting: Copywriting;
}

export interface GeneratedAsset {
  id: number;
  imageUrl: string | null;
  scenarioTitle: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
}

// 12 Marketing Personas mapping to the 5 core Gemini voices
export const VOICES = [
  { name: 'Kore', label: 'The Guide', gender: 'Female', style: 'Relaxed & Warm' },
  { name: 'Puck', label: 'The Hype', gender: 'Male', style: 'Energetic & Fast' },
  { name: 'Charon', label: 'The Authority', gender: 'Male', style: 'Deep & Trusted' },
  { name: 'Fenrir', label: 'The Intense', gender: 'Male', style: 'Cinematic & Bold' },
  { name: 'Zephyr', label: 'The Soother', gender: 'Female', style: 'Soft & ASMR' },
  { name: 'Kore', label: 'The Professional', gender: 'Female', style: 'Crisp & Clear' }, // Reusing Kore
  { name: 'Puck', label: 'The Buddy', gender: 'Male', style: 'Friendly & Casual' }, // Reusing Puck
  { name: 'Charon', label: 'The Narrator', gender: 'Male', style: 'Storyteller' }, // Reusing Charon
  { name: 'Zephyr', label: 'The Elegant', gender: 'Female', style: 'Luxury & Slow' }, // Reusing Zephyr
  { name: 'Fenrir', label: 'The Impact', gender: 'Male', style: 'Punchy & Strong' }, // Reusing Fenrir
  { name: 'Kore', label: 'The Mom', gender: 'Female', style: 'Caring & Trust' }, // Reusing Kore
  { name: 'Puck', label: 'The Gamer', gender: 'Male', style: 'Excited & Young' } // Reusing Puck
] as const;

export type VoiceName = typeof VOICES[number]['name'];
export type VoiceOption = typeof VOICES[number];