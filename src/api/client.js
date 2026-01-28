// This client handles connections to the backend server
// To run the backend: cd backend && npm start

// Replace with your machine's IP address if running on physical device
// For Android Emulator, use 10.0.2.2
const BACKEND_URL = 'http://localhost:5000'; 

/**
 * Offloads media compression to the server
 * @param {string} fileUri - Local URI of the file
 * @returns {Promise<Object>} - Compressed media details
 */
export const compressMedia = async (fileUri) => {
  // Mock implementation for now
  // In real app: Upload file -> Server compresses -> Return URL
  try {
    const response = await fetch(`${BACKEND_URL}/api/compress-media`, {
      method: 'POST',
      body: JSON.stringify({ uri: fileUri }), // Simplified
      headers: { 'Content-Type': 'application/json' }
    });
    return await response.json();
  } catch (error) {
    console.warn("Backend unavailable, using local processing:", error);
    return null; // Fallback to local
  }
};

/**
 * Advanced Search using server-side logic
 * @param {string} queryText 
 * @returns {Promise<Array>}
 */
export const searchUsers = async (queryText) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/search-users?q=${encodeURIComponent(queryText)}`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.warn("Backend unavailable, using local search:", error);
    return []; // Fallback
  }
};
