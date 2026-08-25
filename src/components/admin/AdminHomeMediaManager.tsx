import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video, Image as ImageIcon, Upload, Eye, CheckCircle2, Trash2,
  Sparkles, Save, RotateCcw, AlertCircle, Plus, Shield, Globe,
  Play, Pause, Sliders, Check, Radio, ExternalLink, ArrowUpRight,
  Layers, Megaphone, Smartphone, Tablet, Monitor, History,
  ArrowUp, ArrowDown, Edit3, X, AlertTriangle, Info, CheckCircle
} from 'lucide-react';
import {
  HomePageConfig, HomeMediaItem, HomeMediaType, UserAccount,
  PublicAnnouncement, HomeSectionConfig, HomeConfigVersion
} from '../../types';
import {
  getPublicHomeConfig, saveAdminHomeConfig, saveHomeDraft,
  getHomeDraft, DEFAULT_HOME_CONFIG, DEFAULT_SECTIONS, DEFAULT_ANNOUNCEMENTS
} from '../../services/homeService';

interface AdminHomeMediaManagerProps {
  currentUser: UserAccount | null;
  onPreviewHome?: () => void;
}

type CMSTab = 'hero' | 'media' | 'sections' | 'announcements' | 'preview' | 'versions';
type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

export const AdminHomeMediaManager: React.FC<AdminHomeMediaManagerProps> = ({
  currentUser,
  onPreviewHome
}) => {
  const [config, setConfig] = useState<HomePageConfig>(DEFAULT_HOME_CONFIG);
  const [activeTab, setActiveTab] = useState<CMSTab>('hero');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Publish Modal State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishSummary, setPublishSummary] = useState('');

  // Media Upload & Edit Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newMediaType, setNewMediaType] = useState<HomeMediaType>('Hero Video');
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newPosterUrl, setNewPosterUrl] = useState('');
  const [newMediaCategory, setNewMediaCategory] = useState<'Hero' | 'Drone' | 'Field' | 'Crop' | 'Adviser' | 'Platform'>('Hero');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Announcement Modal State
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<PublicAnnouncement | null>(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annPriority, setAnnPriority] = useState<'Information' | 'Important' | 'Critical'>('Information');
  const [annStartDate, setAnnStartDate] = useState('');
  const [annEndDate, setAnnEndDate] = useState('');
  const [annIsActive, setAnnIsActive] = useState(true);

  useEffect(() => {
    getPublicHomeConfig().then((cfg) => {
      // Check if there is an uncommitted local draft
      const draft = getHomeDraft();
      if (draft && draft.updatedAt > (cfg.updatedAt || '')) {
        setConfig(draft);
      } else {
        setConfig({
          ...cfg,
          sections: cfg.sections && cfg.sections.length > 0 ? cfg.sections : DEFAULT_SECTIONS,
          announcements: cfg.announcements && cfg.announcements.length > 0 ? cfg.announcements : DEFAULT_ANNOUNCEMENTS
        });
      }
    });
  }, []);

  const handleSaveDraft = () => {
    saveHomeDraft(config);
    setSaveStatus("💾 Draft saved to local cache.");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaveStatus(null);
    try {
      const adminName = currentUser?.farmerName || "Administrator (SIH Demo)";
      const res = await saveAdminHomeConfig(config, adminName, publishSummary || "Published content modifications to Public Home Gateway");
      if (res.success) {
        setConfig(res.config);
        setShowPublishModal(false);
        setPublishSummary('');
        setSaveStatus("✅ Successfully published live to Public Home Page!");
        setTimeout(() => setSaveStatus(null), 5000);
      }
    } catch (err: any) {
      setSaveStatus("❌ Failed to publish: " + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreVersion = (version: HomeConfigVersion) => {
    if (!version.config) {
      alert("Snapshot data not available for this version.");
      return;
    }
    if (window.confirm(`Are you sure you want to restore Version ${version.version} (published by ${version.publishedBy} on ${new Date(version.publishedAt).toLocaleString()})?`)) {
      setConfig(version.config);
      setSaveStatus(`🔄 Loaded Version ${version.version} into studio. Remember to click "Publish Live" to make it public.`);
      setActiveTab('hero');
    }
  };

  const handleRestoreDefaults = () => {
    if (window.confirm("Are you sure you want to restore the default CroperX agricultural media and layout?")) {
      setConfig(DEFAULT_HOME_CONFIG);
      setSaveStatus("🔄 Default template loaded. Click 'Publish Live' to push to public view.");
    }
  };

  // Media Library Operations
  const handleSetAsHero = (item: HomeMediaItem) => {
    const isVideo = item.type.toLowerCase().includes('video');
    setConfig(prev => ({
      ...prev,
      activeMediaType: isVideo ? 'video' : 'image',
      heroVideoUrl: isVideo ? item.url : prev.heroVideoUrl,
      heroImageUrl: !isVideo ? item.url : prev.heroImageUrl,
      posterImageUrl: item.posterUrl || prev.posterImageUrl,
      mediaLibrary: prev.mediaLibrary.map(m => ({
        ...m,
        isActive: m.id === item.id,
        isBackground: m.id === item.id
      }))
    }));
    setSaveStatus(`🎬 Set "${item.title}" as active Hero media.`);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleDeleteMedia = (id: string) => {
    const item = config.mediaLibrary.find(m => m.id === id);
    if (item?.isActive) {
      alert("Cannot delete currently active Hero media. Set another media as active first.");
      return;
    }
    if (window.confirm(`Delete "${item?.title || 'media'}" from library?`)) {
      setConfig(prev => ({
        ...prev,
        mediaLibrary: prev.mediaLibrary.filter(m => m.id !== id)
      }));
    }
  };

  const handleAddMediaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaTitle.trim() || !newMediaUrl.trim()) {
      setUploadError("Please provide media title and valid media URL.");
      return;
    }

    const cleanUrl = newMediaUrl.trim();
    const isVideo = newMediaType.toLowerCase().includes('video');

    const newMedia: HomeMediaItem = {
      id: "media-" + Date.now(),
      type: newMediaType,
      title: newMediaTitle.trim(),
      url: cleanUrl,
      posterUrl: newPosterUrl.trim() || undefined,
      isActive: false,
      isBackground: false,
      category: newMediaCategory,
      uploadedAt: new Date().toISOString(),
      fileSizeMb: isVideo ? 14.8 : 3.2
    };

    setConfig(prev => ({
      ...prev,
      mediaLibrary: [newMedia, ...prev.mediaLibrary]
    }));

    setShowUploadModal(false);
    setNewMediaTitle('');
    setNewMediaUrl('');
    setNewPosterUrl('');
    setUploadError(null);
  };

  // Section Ordering & Management
  const handleToggleSection = (sectionId: string) => {
    setConfig(prev => {
      const sections = (prev.sections || DEFAULT_SECTIONS).map(s =>
        s.id === sectionId ? { ...s, enabled: !s.enabled } : s
      );
      return { ...prev, sections };
    });
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const currentSections = [...(config.sections || DEFAULT_SECTIONS)];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentSections.length) return;

    const temp = currentSections[index];
    currentSections[index] = currentSections[targetIndex];
    currentSections[targetIndex] = temp;

    // Recalibrate order property
    const reordered = currentSections.map((s, idx) => ({ ...s, order: idx + 1 }));
    setConfig(prev => ({ ...prev, sections: reordered }));
  };

  // Announcement Management
  const handleOpenNewAnnouncement = () => {
    setEditingAnnouncement(null);
    setAnnTitle('');
    setAnnMessage('');
    setAnnPriority('Information');
    setAnnStartDate(new Date().toISOString().split('T')[0]);
    setAnnEndDate('');
    setAnnIsActive(true);
    setShowAnnouncementModal(true);
  };

  const handleOpenEditAnnouncement = (ann: PublicAnnouncement) => {
    setEditingAnnouncement(ann);
    setAnnTitle(ann.title);
    setAnnMessage(ann.message);
    setAnnPriority(ann.priority);
    setAnnStartDate(ann.startDate || '');
    setAnnEndDate(ann.endDate || '');
    setAnnIsActive(ann.isActive);
    setShowAnnouncementModal(true);
  };

  const handleSaveAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;

    if (editingAnnouncement) {
      // Update existing
      setConfig(prev => ({
        ...prev,
        announcements: (prev.announcements || []).map(a =>
          a.id === editingAnnouncement.id
            ? {
                ...a,
                title: annTitle.trim(),
                message: annMessage.trim(),
                priority: annPriority,
                startDate: annStartDate || undefined,
                endDate: annEndDate || undefined,
                isActive: annIsActive
              }
            : a
        )
      }));
    } else {
      // Create new
      const newAnn: PublicAnnouncement = {
        id: "ann-" + Date.now(),
        title: annTitle.trim(),
        message: annMessage.trim(),
        priority: annPriority,
        startDate: annStartDate || undefined,
        endDate: annEndDate || undefined,
        isActive: annIsActive,
        createdAt: new Date().toISOString()
      };
      setConfig(prev => ({
        ...prev,
        announcements: [newAnn, ...(prev.announcements || [])]
      }));
    }

    setShowAnnouncementModal(false);
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (window.confirm("Delete this announcement?")) {
      setConfig(prev => ({
        ...prev,
        announcements: (prev.announcements || []).filter(a => a.id !== id)
      }));
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans" id="admin-home-cms-root">
      
      {/* Studio Header Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">Public Gateway CMS</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
              Admin Content Studio
            </span>
          </div>
          <h2 className="text-2xl font-serif italic font-bold text-white">
            Home Page Content Studio
          </h2>
          <p className="text-xs text-slate-400">
            Manage public drone video assets, hero titles, section sequences, announcements, and live publish workflows.
          </p>
        </div>

        {/* Global Action Cluster */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="cms-restore-defaults-btn"
            onClick={handleRestoreDefaults}
            className="px-3 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset to default agricultural template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Defaults</span>
          </button>

          <button
            id="cms-save-draft-btn"
            onClick={handleSaveDraft}
            className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-slate-300" />
            <span>Save Draft</span>
          </button>

          <button
            id="cms-publish-live-btn"
            onClick={() => setShowPublishModal(true)}
            className="px-5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Publish Live</span>
          </button>
        </div>
      </div>

      {/* Live Status Notification */}
      {saveStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-lg"
        >
          <span>{saveStatus}</span>
          <button onClick={() => setSaveStatus(null)} className="text-emerald-400 hover:text-white">✕</button>
        </motion.div>
      )}

      {/* 6 Main Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'hero', label: '1. Hero Section', icon: Play },
          { id: 'media', label: '2. Media Library', icon: Video },
          { id: 'sections', label: '3. Section Sequence', icon: Layers },
          { id: 'announcements', label: '4. Announcements', icon: Megaphone },
          { id: 'preview', label: '5. Live Simulator', icon: Eye },
          { id: 'versions', label: '6. Version History', icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              id={`cms-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as CMSTab)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: HERO CONFIGURATION */}
      {activeTab === 'hero' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Hero Copy & Taglines</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tagline (Pill Badge)
                </label>
                <input
                  type="text"
                  value={config.heroTitle}
                  onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Welcome to CroperX"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Main Headline (H1 Serif)
                </label>
                <input
                  type="text"
                  value={config.heroHeading || "Your Field. Your Crop. Your Intelligence."}
                  onChange={(e) => setConfig({ ...config, heroHeading: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white font-serif italic focus:outline-none focus:border-emerald-500"
                  placeholder="Your Field. Your Crop. Your Intelligence."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subtitle / Sub-headline
                </label>
                <textarea
                  rows={2}
                  value={config.heroSubtitle}
                  onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="AI-powered farming intelligence connecting farmers, advisers, cameras, sensors, weather and field data."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Primary Button
                  </label>
                  <input
                    type="text"
                    value={config.primaryActionLabel}
                    onChange={(e) => setConfig({ ...config, primaryActionLabel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Secondary Button
                  </label>
                  <input
                    type="text"
                    value={config.secondaryActionLabel}
                    onChange={(e) => setConfig({ ...config, secondaryActionLabel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Explore Button
                  </label>
                  <input
                    type="text"
                    value={config.exploreActionLabel || "Explore CroperX"}
                    onChange={(e) => setConfig({ ...config, exploreActionLabel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Video Playback & Fallback Settings */}
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-400" />
                <span>Video Playback Parameters</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.videoSettings.autoplay}
                    onChange={(e) => setConfig({
                      ...config,
                      videoSettings: { ...config.videoSettings, autoplay: e.target.checked }
                    })}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span className="text-xs font-semibold text-white">Autoplay</span>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.videoSettings.muted}
                    onChange={(e) => setConfig({
                      ...config,
                      videoSettings: { ...config.videoSettings, muted: e.target.checked }
                    })}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span className="text-xs font-semibold text-white">Muted</span>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.videoSettings.loop}
                    onChange={(e) => setConfig({
                      ...config,
                      videoSettings: { ...config.videoSettings, loop: e.target.checked }
                    })}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span className="text-xs font-semibold text-white">Loop</span>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.videoSettings.playsInline}
                    onChange={(e) => setConfig({
                      ...config,
                      videoSettings: { ...config.videoSettings, playsInline: e.target.checked }
                    })}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span className="text-xs font-semibold text-white">PlaysInline</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Active Hero Media Type
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="mediaType"
                      value="video"
                      checked={config.activeMediaType === 'video'}
                      onChange={() => setConfig({ ...config, activeMediaType: 'video' })}
                      className="text-emerald-500"
                    />
                    <span>High-Definition Video</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="mediaType"
                      value="image"
                      checked={config.activeMediaType === 'image'}
                      onChange={() => setConfig({ ...config, activeMediaType: 'image' })}
                      className="text-emerald-500"
                    />
                    <span>Static High-Res Image</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Live Mini-Preview */}
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Current Hero Preview</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-mono font-bold">
                  {config.activeMediaType.toUpperCase()}
                </span>
              </div>

              <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-black">
                {config.activeMediaType === 'video' ? (
                  <video
                    src={config.heroVideoUrl}
                    poster={config.posterImageUrl || config.heroImageUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={config.heroImageUrl || config.posterImageUrl}
                    alt="Hero"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-4 flex flex-col justify-end">
                  <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">{config.heroTitle}</span>
                  <h4 className="text-sm font-serif italic font-bold text-white leading-tight truncate">{config.heroHeading || "Your Field. Your Crop. Your Intelligence."}</h4>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 pt-1 font-mono">
                <p className="truncate">URL: {config.heroVideoUrl || config.heroImageUrl}</p>
                <p>Fallback Poster: {config.posterImageUrl ? 'Configured ✓' : 'Default'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MEDIA LIBRARY */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Media Asset Library</h3>
              <p className="text-xs text-slate-400">Manage aerial drone videos, crop photography, and fallback posters.</p>
            </div>
            <button
              id="media-add-new-btn"
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Media Asset</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.mediaLibrary.map((item) => {
              const isVideo = item.type.toLowerCase().includes('video');
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-3xl border transition-all flex flex-col justify-between space-y-3 ${
                    item.isActive
                      ? 'bg-emerald-950/30 border-emerald-500 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800">
                      {isVideo ? (
                        <video
                          src={item.url}
                          poster={item.posterUrl}
                          muted
                          loop
                          className="w-full h-full object-cover"
                          onMouseEnter={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
                          onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()}
                        />
                      ) : (
                        <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                      )}
                      
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-slate-950/80 text-[10px] font-mono font-bold text-emerald-300 border border-white/10 backdrop-blur-md">
                          {item.type}
                        </span>
                      </div>

                      {item.isActive && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black tracking-wider uppercase shadow-md flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Active Hero</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center justify-between">
                        <span>{item.fileSizeMb ? `${item.fileSizeMb} MB` : 'Dynamic'}</span>
                        <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    {!item.isActive && (
                      <button
                        onClick={() => handleSetAsHero(item)}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Set as Active Hero
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteMedia(item.id)}
                      className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition-colors cursor-pointer"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SECTION SEQUENCE & TOGGLES */}
      {activeTab === 'sections' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Public Page Section Sequence & Visibility</span>
            </h3>
            <p className="text-xs text-slate-400">
              Drag, reorder, or toggle sections on the public gateway. Changes take effect on the live Home page upon publishing.
            </p>

            <div className="space-y-3">
              {(config.sections || DEFAULT_SECTIONS).map((section, idx) => (
                <div
                  key={section.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                    section.enabled ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-950/40 border-slate-800/40 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 font-mono font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{section.name}</h4>
                      <p className="text-[11px] text-slate-400">{section.title} {section.subtitle && `— ${section.subtitle}`}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Move Up */}
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMoveSection(idx, 'up')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    {/* Move Down */}
                    <button
                      disabled={idx === (config.sections || DEFAULT_SECTIONS).length - 1}
                      onClick={() => handleMoveSection(idx, 'down')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    {/* Enable Toggle */}
                    <button
                      onClick={() => handleToggleSection(section.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        section.enabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {section.enabled ? 'Visible' : 'Hidden'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PUBLIC ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Public Agricultural Advisories & Alerts</h3>
              <p className="text-xs text-slate-400">Broadcast weather alerts, agronomic notices, and seasonal updates directly on the public header.</p>
            </div>
            <button
              onClick={handleOpenNewAnnouncement}
              className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Announcement</span>
            </button>
          </div>

          <div className="space-y-3">
            {(config.announcements || []).length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
                No active announcements configured. Click "Create Announcement" to post an advisory.
              </div>
            ) : (
              config.announcements?.map((ann) => (
                <div
                  key={ann.id}
                  className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                    ann.isActive ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-900/30 border-slate-800/40 opacity-60'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                        ann.priority === 'Critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        ann.priority === 'Important' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {ann.priority}
                      </span>
                      <h4 className="text-sm font-bold text-white">{ann.title}</h4>
                      {ann.isActive ? (
                        <span className="text-[10px] text-emerald-400 font-bold">● Active</span>
                      ) : (
                        <span className="text-[10px] text-slate-500">○ Inactive</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{ann.message}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Dates: {ann.startDate || 'Immediate'} → {ann.endDate || 'Indefinite'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleOpenEditAnnouncement(ann)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                      title="Edit Advisory"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition-colors cursor-pointer"
                      title="Delete Advisory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: RESPONSIVE LIVE SIMULATOR */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold font-mono">
                ADMIN PREVIEW — NOT PUBLIC
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">Simulate responsiveness before publishing</span>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                  previewDevice === 'desktop' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                  previewDevice === 'tablet' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tablet</span>
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                  previewDevice === 'mobile' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>
          </div>

          {/* Simulator Canvas Frame */}
          <div className="flex justify-center p-6 bg-slate-950/80 rounded-3xl border border-slate-800 overflow-x-auto min-h-[500px]">
            <div
              className={`transition-all duration-300 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl relative ${
                previewDevice === 'desktop' ? 'w-full max-w-5xl' :
                previewDevice === 'tablet' ? 'w-[768px]' : 'w-[375px]'
              }`}
            >
              {/* Simulated Hero */}
              <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
                {config.activeMediaType === 'video' ? (
                  <video
                    src={config.heroVideoUrl}
                    poster={config.posterImageUrl || config.heroImageUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover opacity-75"
                  />
                ) : (
                  <img
                    src={config.heroImageUrl || config.posterImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover opacity-75"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent p-8 flex flex-col justify-center items-center text-center space-y-3">
                  <span className="px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                    {config.heroTitle}
                  </span>
                  <h2 className="text-xl sm:text-3xl font-serif italic font-black text-white max-w-lg leading-tight">
                    {config.heroHeading || "Your Field. Your Crop. Your Intelligence."}
                  </h2>
                  <p className="text-xs text-slate-300 max-w-md line-clamp-2">
                    {config.heroSubtitle}
                  </p>
                  <div className="flex gap-2 pt-2">
                    <span className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">
                      {config.primaryActionLabel}
                    </span>
                    <span className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs border border-white/20">
                      {config.secondaryActionLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Simulated Summary Strip */}
              <div className="p-4 bg-slate-900 border-t border-slate-800 text-center text-xs text-slate-400">
                CroperX 2.0 Live Responsive Gateway Preview
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: VERSION & PUBLISH HISTORY */}
      {activeTab === 'versions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Publish History & Snapshot Backups</h3>
              <p className="text-xs text-slate-400">Track audit logs for every public release. Roll back to any prior version in one click.</p>
            </div>
          </div>

          <div className="space-y-3">
            {(config.versions || []).map((v) => (
              <div
                key={v.version}
                className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold text-xs border border-purple-500/30">
                      v{v.version}
                    </span>
                    <h4 className="text-xs font-bold text-white">{v.changeSummary}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Published by <span className="text-slate-200">{v.publishedBy}</span> on {new Date(v.publishedAt).toLocaleString()}
                  </p>
                </div>

                {v.config && (
                  <button
                    onClick={() => handleRestoreVersion(v)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Restore This Version</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: ADD MEDIA ASSET */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Add New Media Asset</span>
                </h3>
                <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-medium">
                  {uploadError}
                </div>
              )}

              <form onSubmit={handleAddMediaSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Media Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Drone Field Canopy - North Quadrant"
                    value={newMediaTitle}
                    onChange={(e) => setNewMediaTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Asset Type</label>
                    <select
                      value={newMediaType}
                      onChange={(e) => setNewMediaType(e.target.value as HomeMediaType)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Drone Field Video">Drone Field Video</option>
                      <option value="Hero Video">Hero Video</option>
                      <option value="Hero Image">Hero Image</option>
                      <option value="Secondary Field Image">Secondary Field Image</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                    <select
                      value={newMediaCategory}
                      onChange={(e) => setNewMediaCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Hero">Hero</option>
                      <option value="Drone">Drone</option>
                      <option value="Field">Field</option>
                      <option value="Crop">Crop</option>
                      <option value="Adviser">Adviser</option>
                      <option value="Platform">Platform</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Direct Media URL (MP4, WebM, JPG, PNG)</label>
                  <input
                    type="url"
                    required
                    placeholder="https://.../video.mp4"
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Poster / Fallback Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://.../poster.jpg"
                    value={newPosterUrl}
                    onChange={(e) => setNewPosterUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                  >
                    Save Asset to Library
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MODAL 2: CREATE / EDIT ANNOUNCEMENT */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showAnnouncementModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-emerald-400" />
                  <span>{editingAnnouncement ? "Edit Announcement" : "Create Public Announcement"}</span>
                </h3>
                <button onClick={() => setShowAnnouncementModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleSaveAnnouncementSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Advisory Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Regional Monsoon & Irrigation Alert"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Message Body</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide actionable advisory guidance for farmers..."
                    value={annMessage}
                    onChange={(e) => setAnnMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Priority Level</label>
                    <select
                      value={annPriority}
                      onChange={(e) => setAnnPriority(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Information">Information (Green)</option>
                      <option value="Important">Important (Amber)</option>
                      <option value="Critical">Critical (Red)</option>
                    </select>
                  </div>

                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={annIsActive}
                        onChange={(e) => setAnnIsActive(e.target.checked)}
                        className="rounded text-emerald-500"
                      />
                      <span>Active on Home Banner</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Start Date (Optional)</label>
                    <input
                      type="date"
                      value={annStartDate}
                      onChange={(e) => setAnnStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">End Date (Optional)</label>
                    <input
                      type="date"
                      value={annEndDate}
                      onChange={(e) => setAnnEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAnnouncementModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                  >
                    Save Advisory
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MODAL 3: PUBLISH LIVE VERIFICATION */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showPublishModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl mx-auto border border-emerald-500/30">
                <Sparkles className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-white">Publish to Public Home Page</h3>
                <p className="text-xs text-slate-400">
                  This will make all current edits immediately visible to every public visitor on CroperX.
                </p>
              </div>

              <form onSubmit={handlePublishSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Change Summary (Audit Log Note)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Updated drone video & added monsoon advisory"
                    value={publishSummary}
                    onChange={(e) => setPublishSummary(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
                  <p>• Creates immutable Version snapshot</p>
                  <p>• Records PBKDF2 signed audit entry</p>
                  <p>• Updates live /api/home/config endpoint</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPublishModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/30"
                  >
                    <span>{loading ? "Publishing..." : "Confirm & Publish"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
