export const translateCondition = (val: string): string => {
  if (!val) return '';
  const map: Record<string, string> = {
    'Mint': 'Mükemmel',
    'Good': 'İyi',
    'Fair': 'Orta',
    'Poor': 'Yıpranmış',
    'Mükemmel': 'Mükemmel',
    'İyi': 'İyi',
    'Orta': 'Orta',
    'Yıpranmış': 'Yıpranmış'
  };
  return map[val] || val;
};

export const translatePace = (val: string): string => {
  if (!val) return '';
  const map: Record<string, string> = {
    'Slow': 'Yavaş',
    'Medium': 'Orta',
    'Fast': 'Hızlı',
    'Yavaş': 'Yavaş',
    'Orta': 'Orta',
    'Hızlı': 'Hızlı'
  };
  return map[val] || val;
};

export const translateDepth = (val: string): string => {
  if (!val) return '';
  const map: Record<string, string> = {
    'Low': 'Yüzeysel',
    'Medium': 'Orta',
    'High': 'Derin',
    'Yüzeysel': 'Yüzeysel',
    'Orta': 'Orta',
    'Derin': 'Derin',
    'Düşük': 'Yüzeysel'
  };
  return map[val] || val;
};
