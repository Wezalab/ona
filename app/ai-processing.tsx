import { useEffect } from 'react';
import { ScreenShell } from '@/components/ScreenShell';
import { t } from '@/constants/translations';
import { useAppContext } from '@/contexts/AppContext';
import { useRequireConsent } from '@/hooks/useRequireConsent';
import type { AiResultInput } from '@/types/api';
import type { RiskLevel } from '@/services/starknet';

// Placeholder inference. On-device AI is on the roadmap; until then we produce a
// deterministic mock result so the end-to-end submit → API → StarkNet flow can
// be exercised. Replace `runInference` with the real model output when ready.
function runInference(): AiResultInput {
  const options: { prediction: string; riskLevel: RiskLevel; confidence: number }[] = [
    { prediction: 'normal', riskLevel: 'low', confidence: 0.94 },
    { prediction: 'refractive_error_suspected', riskLevel: 'medium', confidence: 0.81 },
    { prediction: 'cataract_suspected', riskLevel: 'high', confidence: 0.9 },
  ];
  const pick = options[Math.floor(Math.random() * options.length)];
  return { ...pick, modelVersion: 'ona-vision-mock-0.1' };
}

export default function AiProcessingScreen() {
  useRequireConsent();
  const { language, updateDraft } = useAppContext();

  // Simulate inference once on mount and store the result in the draft.
  useEffect(() => {
    const ai = runInference();
    updateDraft({ ai, isReferral: ai.riskLevel === 'high' });
  }, [updateDraft]);

  return (
    <ScreenShell
      title={t(language, 'aiProcessing')}
      subtitle={t(language, 'aiProcessingSubtitle')}
      actions={[{ label: t(language, 'viewResults'), href: '/screening-results', primary: true }]}
    />
  );
}
