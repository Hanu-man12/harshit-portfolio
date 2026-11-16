'use client';
import { useEffect, useState } from 'react';

export type MediaTier = 'desktop' | 'tablet' | 'mobile';

export function useMediaTier(): MediaTier {
  const [tier, setTier] = useState<MediaTier>('mobile');
  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w >= 1024) setTier('desktop');
      else if (w >= 768) setTier('tablet');
      else setTier('mobile');
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return tier;
}
