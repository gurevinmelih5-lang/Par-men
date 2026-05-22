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

export const CITIES_COORDS = [
  { name: 'İstanbul', lat: 41.0082, lng: 28.9784 },
  { name: 'Ankara', lat: 39.9334, lng: 32.8597 },
  { name: 'İzmir', lat: 38.4192, lng: 27.1287 },
  { name: 'Bursa', lat: 40.1885, lng: 29.0610 },
  { name: 'Antalya', lat: 36.8969, lng: 30.7133 },
  { name: 'Adana', lat: 37.0000, lng: 35.3213 },
  { name: 'Trabzon', lat: 41.0027, lng: 39.7168 },
  { name: 'Diyarbakır', lat: 37.9144, lng: 40.2306 },
  { name: 'Konya', lat: 37.8714, lng: 32.4932 },
  { name: 'Kars', lat: 40.6013, lng: 43.0950 },
  { name: 'Yozgat', lat: 39.8200, lng: 34.8044 },
  { name: 'Sinop', lat: 42.0235, lng: 35.1531 }
];

export const getCityFromCoords = (lat: number, lng: number): string => {
  let nearestCity = 'İstanbul';
  let minDistance = Infinity;
  for (const city of CITIES_COORDS) {
    const dist = calculateDistance(lat, lng, city.lat, city.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestCity = city.name;
    }
  }
  return nearestCity;
};
