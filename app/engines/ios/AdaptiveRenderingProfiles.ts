export const IOSContext = {
  isIOS: typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent),
  isSafari:
    typeof window !== 'undefined' &&
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
  isWebView:
    typeof window !== 'undefined' &&
    /(FBAN|FBAV|Instagram|WhatsApp)/i.test(navigator.userAgent),
};

export type RenderingProfile =
  | 'DesktopUltra'
  | 'AndroidImmersive'
  | 'IOSAdaptive'
  | 'IOSWebViewSurvival'
  | 'EmergencyLowPower';

export const getActiveProfile = (): RenderingProfile => {
  if (typeof window === 'undefined') return 'DesktopUltra'; // Default SSR

  if (IOSContext.isIOS) {
    if (IOSContext.isWebView) {
      return 'IOSWebViewSurvival';
    }
    return 'IOSAdaptive';
  }

  // Preserve Android and Desktop rendering profiles
  const isAndroid = /android/i.test(navigator.userAgent);
  if (isAndroid) {
    return 'AndroidImmersive';
  }

  return 'DesktopUltra';
};
