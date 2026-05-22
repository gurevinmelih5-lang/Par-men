// src/lib/moderation.ts

const PROFANITY_LIST = [
  'amk', 'aq', 'siktir', 'piç', 'oç', 'pezevenk', 'göt', 'ibne', 'yavşak', 'orospu', 'sik', 'yarrak',
  'amına', 'koduğum', 'sikeyim', 'siktiğim', 'gavat', 'kahpe', 'fahişe', 'puşt', 'yarak', 'yarrrak',
  'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'whore', 'slut', 'bastard', 'motherfucker'
];

/**
 * Checks if the given text contains profanity.
 * Returns true if profanity is detected, false otherwise.
 */
export function containsProfanity(text: string): boolean {
  if (!text) return false;
  
  const normalizedText = text.toLowerCase();
  
  // Basic check for words
  for (const word of PROFANITY_LIST) {
    // Regex matches the word surrounded by word boundaries to avoid false positives 
    // on words that just contain the substring.
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(normalizedText)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Mocks image moderation for beta.
 * Checks for explicit, insulting, or political content.
 * Explicitly allows 'Atatürk'.
 * Returns true if the image is safe, false if it's rejected.
 */
export async function moderateImage(file: File): Promise<boolean> {
  // In a real application, you would send this file to a Vision API (like Gemini Vision or Google Cloud Vision)
  // Example prompt: "Check this image for sexual content, insults, or political figures. If it contains Atatürk, do NOT flag it as political. Return SAFE or REJECTED."
  
  // For the beta simulation, we just check the file name to demonstrate the logic.
  const name = file.name.toLowerCase();
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (name.includes('ataturk') || name.includes('atatürk')) {
    return true; // Explicitly allowed
  }

  if (name.includes('nude') || name.includes('cinsel') || name.includes('porno') || name.includes('siyasi') || name.includes('hakaret')) {
    return false; // Rejected
  }

  return true; // Safe by default in mock
}
