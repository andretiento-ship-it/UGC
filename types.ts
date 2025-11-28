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

export interface CampaignPlan {
  modelDescription: string;
  scenarios: {
    id: number;
    title: string;
    prompt: string;
  }[];
}

export interface GeneratedAsset {
  id: number;
  imageUrl: string | null;
  scenarioTitle: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
}