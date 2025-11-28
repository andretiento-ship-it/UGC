export enum AspectRatio {
  SQUARE = "1:1",
  PORTRAIT = "9:16",
  LANDSCAPE = "16:9"
}

export enum ModelType {
  FEMALE = "Wanita",
  MALE = "Pria",
  ADULT = "Dewasa (Umum)",
  CHILD = "Anak-anak",
  CUSTOM = "Custom (Spesifik)"
}

export enum CopywritingStyle {
  STORYTELLING_EMOTIONAL = "Storytelling Emosional (Menyentuh Hati)",
  STORYTELLING_HUMOR = "Storytelling Humoris (Lucu & Santai)",
  STORYTELLING_THRILLER = "Storytelling Dramatis (Tegang/Serius)",
  STORYTELLING_INSPIRING = "Storytelling Inspiratif (Motivasi)",
  STORYTELLING_CASUAL = "Storytelling Gaul (Bahasa Sehari-hari)",
  PROFESSIONAL = "Profesional & Berwibawa",
  DIRECT = "To-The-Point (Langsung)"
}

export interface GenerationSettings {
  productName: string;
  productDescription: string;
  modelType: ModelType;
  customModelDescription?: string;
  aspectRatio: AspectRatio;
  copywritingStyle: CopywritingStyle;
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
  { name: 'Kore', label: 'Sang Pemandu', gender: 'Wanita', style: 'Santai & Hangat' },
  { name: 'Puck', label: 'Si Hype', gender: 'Pria', style: 'Energik & Cepat' },
  { name: 'Charon', label: 'Sang Otoritas', gender: 'Pria', style: 'Berat & Terpercaya' },
  { name: 'Fenrir', label: 'Si Intens', gender: 'Pria', style: 'Sinematik & Tegas' },
  { name: 'Zephyr', label: 'Si Penenang', gender: 'Wanita', style: 'Lembut & ASMR' },
  { name: 'Kore', label: 'Si Profesional', gender: 'Wanita', style: 'Jelas & Lugas' }, 
  { name: 'Puck', label: 'Si Bestie', gender: 'Pria', style: 'Ramah & Gaul' }, 
  { name: 'Charon', label: 'Sang Narator', gender: 'Pria', style: 'Penceria Cerita' }, 
  { name: 'Zephyr', label: 'Si Elegan', gender: 'Wanita', style: 'Mewah & Lambat' }, 
  { name: 'Fenrir', label: 'Si Dampak', gender: 'Pria', style: 'Kuat & Menghentak' }, 
  { name: 'Kore', label: 'Ibu Penyayang', gender: 'Wanita', style: 'Peduli & Tulus' }, 
  { name: 'Puck', label: 'Si Gamer', gender: 'Pria', style: 'Seru & Muda' } 
] as const;

export type VoiceName = typeof VOICES[number]['name'];
export type VoiceOption = typeof VOICES[number];