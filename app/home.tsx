import { ScreenShell } from '@/components/ScreenShell';
import { t } from '@/constants/translations';
import { useAppContext } from '@/contexts/AppContext';
import { useRequireConsent } from '@/hooks/useRequireConsent';

export default function HomeScreen() {
  useRequireConsent();
  const { language } = useAppContext();

  return (
    <ScreenShell
      title={t(language, 'home')}
      subtitle={t(language, 'homeSubtitle')}
      actions={[
        { label: t(language, 'startScreening'), href: '/patient-info', primary: true },
        { label: t(language, 'startVaTest'), href: '/va-calibration' },
        { label: t(language, 'history'), href: '/history' },
        { label: t(language, 'settings'), href: '/settings' },
        { label: t(language, 'blockchainNav'), href: '/blockchain' },
        { label: t(language, 'about'), href: '/about' },
      ]}
    />
  );
}
