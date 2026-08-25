// IndexedDB service for offline caching of soil telemetry & recommendation results

const DB_NAME = "CropRecommendationDB";
const DB_VERSION = 1;
const STORE_RECOMMENDATIONS = "recommendations";
const STORE_PRESETS = "soil_presets";

export interface StoredScenario {
  id: string;
  timestamp: number;
  dateStr: string;
  soilData: any;
  recommendations: any;
  yieldEstimate: {
    expectedYield: number;
    yieldConfidence: number;
  };
}

export interface SoilPreset {
  id: string;
  name: string;
  data: any;
}

export async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error("IndexedDB is not supported in this environment"));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(request.error || new Error("Failed to open IndexedDB"));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        try {
          const db = (event.target as IDBOpenDBRequest).result;

          if (!db.objectStoreNames.contains(STORE_RECOMMENDATIONS)) {
            const recStore = db.createObjectStore(STORE_RECOMMENDATIONS, { keyPath: "id" });
            recStore.createIndex("timestamp", "timestamp", { unique: false });
          }

          if (!db.objectStoreNames.contains(STORE_PRESETS)) {
            db.createObjectStore(STORE_PRESETS, { keyPath: "id" });
          }
        } catch (e) {
          reject(e);
        }
      };
    } catch (err) {
      reject(err);
    }
  });
}

export async function saveScenarioToIndexedDB(soilData: any, recommendations: any, yieldEstimate: any): Promise<StoredScenario> {
  const scenario: StoredScenario = {
    id: "rec_" + Date.now(),
    timestamp: Date.now(),
    dateStr: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    soilData,
    recommendations,
    yieldEstimate
  };

  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_RECOMMENDATIONS, "readwrite");
    const store = transaction.objectStore(STORE_RECOMMENDATIONS);

    return new Promise((resolve, reject) => {
      const request = store.put(scenario);
      request.onsuccess = () => resolve(scenario);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("IndexedDB save failed, falling back to localStorage", err);
    try {
      const fallbackList = JSON.parse(localStorage.getItem("offline_scenarios_fallback") || "[]");
      fallbackList.unshift(scenario);
      localStorage.setItem("offline_scenarios_fallback", JSON.stringify(fallbackList.slice(0, 20)));
    } catch {
      // ignore storage errors
    }
    return scenario;
  }
}

export async function getAllScenariosFromIndexedDB(): Promise<StoredScenario[]> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_RECOMMENDATIONS, "readonly");
    const store = transaction.objectStore(STORE_RECOMMENDATIONS);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const results = (request.result || []) as StoredScenario[];
        results.sort((a, b) => b.timestamp - a.timestamp);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("IndexedDB load failed, using localStorage fallback", err);
    try {
      return JSON.parse(localStorage.getItem("offline_scenarios_fallback") || "[]");
    } catch {
      return [];
    }
  }
}

export async function clearIndexedDBCache(): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_RECOMMENDATIONS, "readwrite");
    const store = transaction.objectStore(STORE_RECOMMENDATIONS);
    store.clear();
  } catch (err) {
    try {
      localStorage.removeItem("offline_scenarios_fallback");
    } catch {
      // ignore
    }
  }
}
