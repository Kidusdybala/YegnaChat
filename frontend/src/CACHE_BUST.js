// Cache bust for deployment
export const BUILD_TIMESTAMP = "2025-01-18T18:45:00Z";
export const VERSION = "1.0.7-websocket-only";
console.log("🚀 Frontend loaded:", BUILD_TIMESTAMP, VERSION);
console.log("🌐 Backend URL:", import.meta.env.VITE_API_URL);
console.log("🔌 Socket URL:", import.meta.env.VITE_API_URL?.replace('/api', ''));
console.log("🚀 MAJOR FIX: WebSocket-only transport to bypass Leapcell proxy polling issues");