// Cache bust for deployment
export const BUILD_TIMESTAMP = "2025-01-18T18:55:00Z";
export const VERSION = "1.0.8-hybrid-transport-fix";
console.log("🚀 Frontend loaded:", BUILD_TIMESTAMP, VERSION);
console.log("🌐 Backend URL:", import.meta.env.VITE_API_URL);
console.log("🔌 Socket URL:", import.meta.env.VITE_API_URL?.replace('/api', ''));
console.log("🔧 RETRY: Hybrid transport with improved proxy session handling");