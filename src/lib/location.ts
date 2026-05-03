// Haversine algoritması ile iki koordinat arası kuş uçuşu mesafeyi (KM) hesaplar
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  
  const R = 6371; // Dünya'nın yarıçapı (KM)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // 1 ondalık basamağa yuvarlar
};

// Tarayıcıdan kullanıcının anlık konumunu çeker
export const getCurrentLocation = (): Promise<{lat: number, lng: number}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Tarayıcınız konum servisini desteklemiyor.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
};
