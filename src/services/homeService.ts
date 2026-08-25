import { HomePageConfig, HomeMediaItem, PublicAnnouncement, HomeSectionConfig, HomeConfigVersion } from '../types';

const HOME_CONFIG_STORAGE_KEY = 'croperx_home_config';
const HOME_DRAFT_STORAGE_KEY = 'croperx_home_draft';

export const DEFAULT_ANNOUNCEMENTS: PublicAnnouncement[] = [
  {
    id: "ann-01",
    title: "Regional Monsoon & Irrigation Alert",
    message: "North-Western Agro Climatic Zone 4: Intermittent showers expected over next 48h. Recalibrate drip volume by -30% to conserve power and prevent waterlogging.",
    priority: "Important",
    startDate: "2026-08-01",
    endDate: "2026-09-30",
    isActive: true,
    createdAt: "2026-08-20T08:00:00.000Z"
  },
  {
    id: "ann-02",
    title: "Live Agronomist Hours Extended",
    message: "Certified agricultural advisers are now available for direct WebRTC video triage from 06:00 AM to 09:00 PM IST daily.",
    priority: "Information",
    startDate: "2026-08-15",
    endDate: "2026-10-31",
    isActive: true,
    createdAt: "2026-08-22T10:00:00.000Z"
  }
];

export const DEFAULT_SECTIONS: HomeSectionConfig[] = [
  {
    id: 'hero',
    name: 'Hero Showcase',
    title: 'Welcome to CroperX',
    subtitle: 'Your Field. Your Crop. Your Intelligence.',
    enabled: true,
    order: 1
  },
  {
    id: 'announcements',
    name: 'Public Announcements',
    title: 'Important Agricultural Advisories',
    enabled: true,
    order: 2
  },
  {
    id: 'howItWorks',
    name: 'How It Works',
    title: 'How CroperX Works',
    subtitle: 'Four streamlined steps from field observation to high-yield action',
    enabled: true,
    order: 3
  },
  {
    id: 'liveShowcase',
    name: 'Live Field Showcase',
    title: 'See CroperX in the Field',
    subtitle: 'Interactive real-time telemetry and augmented drone intelligence in action',
    enabled: true,
    order: 4
  },
  {
    id: 'capabilities',
    name: 'Capability Showcase',
    title: 'Unified Agricultural Intelligence',
    subtitle: 'Comprehensive agronomic tools for every layer of your farm',
    enabled: true,
    order: 5
  },
  {
    id: 'roles',
    name: 'Role Gateways',
    title: 'CroperX for Everyone',
    subtitle: 'Tailored workspaces designed specifically for farmers, field advisers, and administrators',
    enabled: true,
    order: 6
  },
  {
    id: 'trust',
    name: 'Trust & Privacy',
    title: 'Built for Real Farms',
    subtitle: 'Engineered with transparent data boundaries, role-based protection, and verified agronomy',
    enabled: true,
    order: 7
  },
  {
    id: 'cta',
    name: 'Call To Action',
    title: 'Ready to understand your field better?',
    subtitle: 'Join thousands of farmers and advisers using CroperX 2.0 today.',
    enabled: true,
    order: 8
  }
];

export const DEFAULT_HOME_CONFIG: HomePageConfig = {
  heroTitle: "Welcome to CroperX",
  heroHeading: "Your Field. Your Crop. Your Intelligence.",
  heroSubtitle: "AI-powered farming intelligence connecting farmers, advisers, cameras, sensors, weather and field data.",
  heroDescription: "CroperX connects farmers, advisers, AI, cameras, sensors, weather and field intelligence in one unified agricultural platform.",
  primaryActionLabel: "Login",
  secondaryActionLabel: "Register",
  exploreActionLabel: "Explore CroperX",
  activeMediaType: 'video',
  // High quality agricultural lush drone footage & fallback field video
  heroVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-drone-view-of-a-tractor-in-a-field-42588-large.mp4",
  heroImageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1920&q=85",
  posterImageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1920&q=80",
  videoSettings: {
    autoplay: true,
    muted: true,
    loop: true,
    playsInline: true
  },
  sectionToggles: {
    overview: true,
    howItWorks: true,
    roles: true,
    statsBanner: true,
    liveShowcase: true,
    capabilities: true,
    trust: true,
    announcements: true,
    cta: true
  },
  sections: DEFAULT_SECTIONS,
  announcements: DEFAULT_ANNOUNCEMENTS,
  mediaLibrary: [
    {
      id: "media-drone-01",
      type: "Drone Field Video",
      title: "Aerial Precision Tractor & Crop Canopy",
      url: "https://assets.mixkit.co/videos/preview/mixkit-drone-view-of-a-tractor-in-a-field-42588-large.mp4",
      posterUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80",
      isActive: true,
      isBackground: true,
      category: "Drone",
      uploadedAt: "2026-08-20T10:00:00.000Z",
      fileSizeMb: 14.2
    },
    {
      id: "media-video-02",
      type: "Hero Video",
      title: "Lush Green Rice & Wheat Fields at Sunrise",
      url: "https://assets.mixkit.co/videos/preview/mixkit-wind-blowing-over-green-wheat-fields-43640-large.mp4",
      posterUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
      isActive: false,
      isBackground: false,
      category: "Hero",
      uploadedAt: "2026-08-18T14:30:00.000Z",
      fileSizeMb: 18.6
    },
    {
      id: "media-img-01",
      type: "Hero Image",
      title: "Golden Hour Alluvial Farmland Panorama",
      url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1920&q=85",
      posterUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80",
      isActive: false,
      isBackground: false,
      category: "Field",
      uploadedAt: "2026-08-15T09:15:00.000Z",
      fileSizeMb: 3.4
    },
    {
      id: "media-img-02",
      type: "Secondary Field Image",
      title: "Smart Irrigation Center-Pivot & Soil Sensor Array",
      url: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1920&q=80",
      posterUrl: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=600&q=80",
      isActive: false,
      isBackground: false,
      category: "Field",
      uploadedAt: "2026-08-10T11:45:00.000Z",
      fileSizeMb: 2.8
    }
  ],
  versions: [
    {
      version: 1,
      config: null as any,
      publishedAt: "2026-08-20T10:00:00.000Z",
      publishedBy: "System Administrator",
      changeSummary: "Initial CroperX 2.0 Public Gateway baseline published"
    }
  ],
  updatedAt: new Date().toISOString(),
  updatedBy: "System Administrator"
};

/**
 * Fetch current public Home configuration from server with local cache fallback and cache-busting
 */
export async function getPublicHomeConfig(forceRefresh = false): Promise<HomePageConfig> {
  try {
    const url = forceRefresh ? `/api/home/config?_t=${Date.now()}` : `/api/home/config?_t=${Date.now()}`;
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data.config) {
        localStorage.setItem(HOME_CONFIG_STORAGE_KEY, JSON.stringify(data.config));
        return data.config;
      }
    }
  } catch (err) {
    console.warn("Could not fetch home config from server, falling back to cache:", err);
  }

  try {
    const cached = localStorage.getItem(HOME_CONFIG_STORAGE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {}

  return DEFAULT_HOME_CONFIG;
}

/**
 * Save / Update Draft Home Configuration (Local + Server draft buffer)
 */
export function saveHomeDraft(config: HomePageConfig): void {
  try {
    localStorage.setItem(HOME_DRAFT_STORAGE_KEY, JSON.stringify(config));
  } catch {}
}

export function getHomeDraft(): HomePageConfig | null {
  try {
    const draft = localStorage.getItem(HOME_DRAFT_STORAGE_KEY);
    if (draft) return JSON.parse(draft);
  } catch {}
  return null;
}

/**
 * Save / Publish Home Configuration (Administrator Only)
 */
export async function saveAdminHomeConfig(config: HomePageConfig, adminUser?: string, changeSummary?: string): Promise<{ success: boolean; config: HomePageConfig }> {
  const currentVersions = config.versions || [];
  const nextVersionNum = (currentVersions.length > 0 ? Math.max(...currentVersions.map(v => v.version || 0)) : 0) + 1;

  const newVersion: HomeConfigVersion = {
    version: nextVersionNum,
    config: JSON.parse(JSON.stringify(config)),
    publishedAt: new Date().toISOString(),
    publishedBy: adminUser || "Administrator",
    changeSummary: changeSummary || `Published Content Update v${nextVersionNum}`
  };

  const updatedConfig: HomePageConfig = {
    ...config,
    sections: config.sections || DEFAULT_SECTIONS,
    announcements: config.announcements || DEFAULT_ANNOUNCEMENTS,
    versions: [newVersion, ...currentVersions.slice(0, 9)], // Keep up to 10 historical snapshots
    updatedAt: new Date().toISOString(),
    updatedBy: adminUser || "Administrator"
  };

  try {
    const res = await fetch('/api/admin/home/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config: updatedConfig, adminUser: adminUser || 'Administrator', changeSummary })
    });

    if (res.ok) {
      const data = await res.json();
      const finalConfig = data.config || updatedConfig;
      localStorage.setItem(HOME_CONFIG_STORAGE_KEY, JSON.stringify(finalConfig));
      localStorage.removeItem(HOME_DRAFT_STORAGE_KEY);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('croperx_home_config_published', { detail: finalConfig }));
        try {
          const bc = new BroadcastChannel('croperx_cms_channel');
          bc.postMessage({ type: 'CMS_UPDATED', config: finalConfig });
          bc.close();
        } catch (e) {}
      }

      return { success: true, config: finalConfig };
    }
  } catch (err) {
    console.warn("Could not save to backend, saving locally:", err);
  }

  localStorage.setItem(HOME_CONFIG_STORAGE_KEY, JSON.stringify(updatedConfig));
  localStorage.removeItem(HOME_DRAFT_STORAGE_KEY);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('croperx_home_config_published', { detail: updatedConfig }));
  }

  return { success: true, config: updatedConfig };
}
