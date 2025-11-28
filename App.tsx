import React, { useState } from 'react';
import Layout from './components/Layout';
import InputSection from './components/InputSection';
import Gallery from './components/Gallery';
import CopywritingSection from './components/CopywritingSection';
import { GenerationSettings, GeneratedAsset, CampaignPlan, Copywriting } from './types';
import { planCampaign, generateMarketingImage, regenerateCopywriting } from './services/geminiService';

const App: React.FC = () => {
  const [isPlanning, setIsPlanning] = useState(false);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [currentSettings, setCurrentSettings] = useState<GenerationSettings | null>(null);
  const [modelDescription, setModelDescription] = useState<string>('');
  const [copywriting, setCopywriting] = useState<Copywriting | null>(null);
  const [isRegeneratingCopy, setIsRegeneratingCopy] = useState(false);

  const handleGenerate = async (file: File, settings: GenerationSettings) => {
    setIsPlanning(true);
    setAssets([]);
    setCopywriting(null);
    setCurrentSettings(settings);
    setModelDescription('');

    try {
      // 1. Plan the campaign (Analyze image + Create Scenarios + Copywriting)
      const plan: CampaignPlan = await planCampaign(file, settings);
      
      setModelDescription(plan.modelDescription);
      setCopywriting(plan.copywriting);
      
      // Initialize placeholder assets
      const initialAssets: GeneratedAsset[] = plan.scenarios.map(s => ({
        id: s.id,
        imageUrl: null,
        scenarioTitle: s.title,
        status: 'pending'
      }));
      setAssets(initialAssets);
      setIsPlanning(false);

      // 2. Generate Images in PARALLEL
      const generatePromises = plan.scenarios.map(async (scenario) => {
        // Mark as generating
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

          // Mark as completed
          setAssets(prev => prev.map(a => 
            a.id === scenario.id ? { ...a, imageUrl, status: 'completed' } : a
          ));
        } catch (error: any) {
          console.error(`Failed to generate scenario ${scenario.id}`, error);
          
          setAssets(prev => prev.map(a => 
            a.id === scenario.id ? { ...a, status: 'failed' } : a
          ));
        }
      });

      // Wait for all to finish (UI updates individually via state setters above)
      await Promise.all(generatePromises);

    } catch (error: any) {
      console.error("Campaign planning failed", error);
      setIsPlanning(false);

      alert("Failed to plan the campaign. Please check your image and try again.");
    }
  };

  const handleRegenerateCopy = async () => {
    if (!currentSettings) return;
    setIsRegeneratingCopy(true);
    try {
      const newCopy = await regenerateCopywriting(currentSettings);
      setCopywriting(newCopy);
    } catch (error) {
      console.error("Failed to regenerate copy", error);
      alert("Failed to regenerate copywriting.");
    } finally {
      setIsRegeneratingCopy(false);
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
          <div className="space-y-12">
            <Gallery 
              assets={assets} 
              aspectRatio={currentSettings.aspectRatio}
              modelDescription={modelDescription}
            />
            
            {copywriting && (
              <CopywritingSection 
                copywriting={copywriting} 
                onRegenerate={handleRegenerateCopy}
                isRegenerating={isRegeneratingCopy}
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;