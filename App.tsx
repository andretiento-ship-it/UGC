import React, { useState } from 'react';
import Layout from './components/Layout';
import InputSection from './components/InputSection';
import Gallery from './components/Gallery';
import { GenerationSettings, GeneratedAsset, CampaignPlan } from './types';
import { planCampaign, generateMarketingImage } from './services/geminiService';

const App: React.FC = () => {
  const [isPlanning, setIsPlanning] = useState(false);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [currentSettings, setCurrentSettings] = useState<GenerationSettings | null>(null);
  const [modelDescription, setModelDescription] = useState<string>('');

  const handleGenerate = async (file: File, settings: GenerationSettings) => {
    setIsPlanning(true);
    setAssets([]);
    setCurrentSettings(settings);
    setModelDescription('');

    try {
      // 1. Plan the campaign (Analyze image + Create Scenarios)
      const plan: CampaignPlan = await planCampaign(file, settings);
      
      setModelDescription(plan.modelDescription);
      
      // Initialize placeholder assets
      const initialAssets: GeneratedAsset[] = plan.scenarios.map(s => ({
        id: s.id,
        imageUrl: null,
        scenarioTitle: s.title,
        status: 'pending'
      }));
      setAssets(initialAssets);
      setIsPlanning(false);

      // 2. Generate Images Sequentially to update UI progressively
      // We do this via a loop to manage state updates clearly
      for (const scenario of plan.scenarios) {
        // Mark current as generating
        setAssets(prev => prev.map(a => 
          a.id === scenario.id ? { ...a, status: 'generating' } : a
        ));

        try {
          const imageUrl = await generateMarketingImage(
            file,
            plan.modelDescription,
            scenario.prompt,
            settings.aspectRatio
          );

          setAssets(prev => prev.map(a => 
            a.id === scenario.id ? { ...a, imageUrl, status: 'completed' } : a
          ));
        } catch (error) {
          console.error(`Failed to generate scenario ${scenario.id}`, error);
          setAssets(prev => prev.map(a => 
            a.id === scenario.id ? { ...a, status: 'failed' } : a
          ));
        }
      }

    } catch (error) {
      console.error("Campaign planning failed", error);
      alert("Failed to plan the campaign. Please check your API key or try a different image.");
      setIsPlanning(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-12">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-stone-200 tracking-tight drop-shadow-xl font-serif">
            Prehistoric Power. <span className="text-amber-600">Modern Marketing.</span>
          </h2>
          <p className="text-stone-500 max-w-2xl mx-auto text-lg font-medium">
            Upload your artifact. Our AI extracts the DNA of your brand to clone 9 unique marketing assets with consistent models.
          </p>
        </div>

        <InputSection onGenerate={handleGenerate} isProcessing={isPlanning} />
        
        {currentSettings && (
          <Gallery 
            assets={assets} 
            aspectRatio={currentSettings.aspectRatio}
            modelDescription={modelDescription}
          />
        )}
      </div>
    </Layout>
  );
};

export default App;