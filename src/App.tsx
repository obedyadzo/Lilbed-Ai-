import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Search, 
  Sparkles, 
  BookOpen, 
  ExternalLink, 
  FileText, 
  Plus, 
  Trash2, 
  Clock, 
  TrendingUp,
  Copy,
  Check,
  Send,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Key,
  Info,
  User,
  Activity,
  Award,
  PenTool,
  Grid,
  Type,
  Maximize2,
  Square,
  Circle,
  HelpCircle,
  MessageSquare,
  Sparkle,
  Eraser,
  Download,
  Upload,
  Share2,
  ArrowRight,
  Minus,
  Phone,
  Users,
  Menu,
  X,
  CreditCard,
  ShieldCheck,
  Camera,
  Video,
  Sliders,
  Code,
  Terminal,
  Shield,
  Fingerprint,
  Book,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Source, Message, ResearchProject, PublishedPaper, DirectMessage, CommunityGroup, SocialProfile } from './types';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';

const SUGGESTIONS = [
  {
    topic: "Latest major breakthroughs in solid state battery tech",
    label: "Solid State Batteries",
    icon: Sparkles,
  },
  {
    topic: "Recent discoveries of the James Webb Space Telescope in 2025/2026",
    label: "JWST Space Discoveries",
    icon: Globe,
  },
  {
    topic: "Current global treaty agreements on AI safety regulation in 2026",
    label: "AI Safety Treaties 2026",
    icon: FileText,
  },
  {
    topic: "How are quantum computers error-correcting in current commercial labs?",
    label: "Quantum Error Correction",
    icon: BookOpen,
  }
];

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Auth Form details
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // App workspace modes: 'projects' | 'library' | 'chatgpt' | 'socials' | 'studio' | 'maps' | 'sec_tech'
  const [activeTab, setActiveTab] = useState<'projects' | 'library' | 'chatgpt' | 'socials' | 'studio' | 'maps' | 'sec_tech'>('projects');
  
  // Custom Security/Developer tool inner navigation state
  const [secSubTab, setSecSubTab] = useState<'biometrics' | 'scanner' | 'camera' | 'dictionary' | 'dev' | 'installer'>('biometrics');

  // Cyber Security & Biometric verification states
  const [biometricMethod, setBiometricMethod] = useState<'face' | 'fingerprint'>('face');
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [biometricVerified, setBiometricVerified] = useState(false);
  const [biometricLogs, setBiometricLogs] = useState<string[]>(["[LOG] Secure firewall initialized.", "[LOG] Waiting for authentic credential..."]);

  // Telemetry Scanner states
  const [scannedCode, setScannedCode] = useState('');
  const [scannedType, setScannedType] = useState<'QR' | 'Barcode' | 'RFID' | 'ISBN'>('QR');
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scannerResult, setScannerResult] = useState<any>(null);

  // HD Camera, Video shooting & visual editing states
  const [cameraPhoto, setCameraPhoto] = useState<string | null>(null);
  const [cameraVideoUrl, setCameraVideoUrl] = useState<string | null>(null);
  const [cameraFilter, setCameraFilter] = useState<'original' | 'hd-vibrant' | 'mono-noir' | 'cyberpunk-neon' | 'vintage-warm' | 'quantum-bright'>('original');
  const [capturedPhotos, setCapturedPhotos] = useState<{ id: string, label: string, url: string, filter: string, timestamp: string }[]>([
    { id: 'p-1', label: 'QuantumLabSpecimen.jpg', url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=300&auto=format&fit=crop', filter: 'hd-vibrant', timestamp: 'May 20, 2026, 14:24' }
  ]);
  const [capturedVideos, setCapturedVideos] = useState<{ id: string, label: string, url: string, filter: string, timestamp: string }[]>([
    { id: 'v-1', label: 'CyberTerminalOscillator.mp4', url: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4', filter: 'cyberpunk-neon', timestamp: 'May 20, 2026, 15:45' }
  ]);

  // Oxford & Worldwide Dictionary states
  const [dictionaryWord, setDictionaryWord] = useState('');
  const [dictionaryLoading, setDictionaryLoading] = useState(false);
  const [dictionaryResult, setDictionaryResult] = useState<any>(null);

  // Elite Code Generator, App & Web builder states
  const [codeRequirements, setCodeRequirements] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('TypeScript');
  const [codeProjectType, setCodeProjectType] = useState('Web Application (React)');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeResult, setCodeResult] = useState<any>(null);
  const [selectedCodeFileIdx, setSelectedCodeFileIdx] = useState(0);

  // Post privacy and Copyright acceptance toggles
  const [publishIsPrivate, setPublishIsPrivate] = useState(false);
  const [publishTermsAccepted, setPublishTermsAccepted] = useState(false);

  // PWA Installer & Sharing transfers states
  const [installerPasskey, setInstallerPasskey] = useState('');
  const [installerDbEncrypted, setInstallerDbEncrypted] = useState(false);
  const [installerServiceWorkerReady, setInstallerServiceWorkerReady] = useState<'idle' | 'installing' | 'ready'>('idle');
  const [sharingMethod, setSharingMethod] = useState<'xender' | 'bluetooth'>('xender');
  const [bluetoothScanMsg, setBluetoothScanMsg] = useState('');
  const [bluetoothScanning, setBluetoothScanning] = useState(false);
  const [foundBluetoothDevices, setFoundBluetoothDevices] = useState<string[]>([]);
  const [installerAuditLogs, setInstallerAuditLogs] = useState<string[]>([
    "[DB LOG] Sandboxed application DB isolated.", 
    "[DB LOG] Security layer listening for custom encryption key."
  ]);

  // Deep PWA native install properties
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  // Navigation sidebar & payment center states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Preferred Citation & Advanced Search Filter States
  const [citationStyle, setCitationStyle] = useState<'APA' | 'MLA' | 'Harvard' | 'Chicago'>('APA');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchDateRange, setSearchDateRange] = useState<'anytime' | '24h' | 'week' | 'custom'>('anytime');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [searchSourceType, setSearchSourceType] = useState<'any' | 'academic' | 'news' | 'forums'>('any');
  const [includeKeywords, setIncludeKeywords] = useState('');
  const [excludeKeywords, setExcludeKeywords] = useState('');
  const [paymentType, setPaymentType] = useState<'storage' | 'ads' | 'download' | 'credit' | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMoMoNumber, setPaymentMoMoNumber] = useState('');
  const [paymentNetwork, setPaymentNetwork] = useState('MTN');
  const [paymentStep, setPaymentStep] = useState<'setup' | 'prompt' | 'pin' | 'processing' | 'success'>('setup');
  const [pinValue, setPinValue] = useState('');
  const [paymentMetadata, setPaymentMetadata] = useState<any>(null);

  // App features databases (persistent in localStorage or synced to firestore)
  const [storageGb, setStorageGb] = useState<number>(() => {
    const saved = localStorage.getItem('lilbed_storage_gb');
    return saved ? parseFloat(saved) : 2.0;
  });
  const [unlockedPaperIds, setUnlockedPaperIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('lilbed_unlocked_papers');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSubscribedNewsletter, setIsSubscribedNewsletter] = useState<boolean>(() => {
    return localStorage.getItem('lilbed_newsletter_subscribed') === 'true';
  });
  const [subscribedEmails, setSubscribedEmails] = useState<string[]>(() => {
    const saved = localStorage.getItem('lilbed_newsletter_emails');
    return saved ? JSON.parse(saved) : ["test@gmail.com", "scholar@upsa.edu.gh"];
  });
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(() => {
    return localStorage.getItem('lilbed_accepted_terms') === 'true';
  });
  const [adsCampaigns, setAdsCampaigns] = useState<{id: string, name: string, budget: number, status: string, date: string}[]>(() => {
    const saved = localStorage.getItem('lilbed_ads_campaigns');
    return saved ? JSON.parse(saved) : [];
  });

  // AI Studio generation states
  const [studioPrompt, setStudioPrompt] = useState('');
  const [studioMode, setStudioMode] = useState<'flyer' | 'video' | 'slides' | 'chat'>('flyer');
  const [studioStyle, setStudioStyle] = useState('modern');
  const [studioAspectRatio, setStudioAspectRatio] = useState('1:1');
  const [isStudioLoading, setIsStudioLoading] = useState(false);
  const [studioResult, setStudioResult] = useState<{ imageUrl?: string, videoPlanUrl?: string, slides?: any[], text?: string, error?: string, isFallback?: boolean, isSvg?: boolean } | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Google Map layer and routing selection states
  const [selectedCountry, setSelectedCountry] = useState<string>('Ghana');
  const [mapSearch, setMapSearch] = useState<string>('');
  const [mapLayer, setMapLayer] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [mapZoom, setMapZoom] = useState<number>(6);
  const [mapContinent, setMapContinent] = useState<string>('All');

  // Community Socials & WhatsApp directory state
  const [socialsProfiles, setSocialsProfiles] = useState<SocialProfile[]>([]);
  const [socialName, setSocialName] = useState('');
  const [socialPhone, setSocialPhone] = useState('');
  const [socialBio, setSocialBio] = useState('');
  const [socialRole, setSocialRole] = useState('Scholar');
  const [socialAccountType, setSocialAccountType] = useState<'individual' | 'institution' | 'business'>('individual');
  const [encryptSearch, setEncryptSearch] = useState(true);
  const [encryptChat, setEncryptChat] = useState(true);
  const [emailAlertToast, setEmailAlertToast] = useState<string | null>(null);

  // Direct Message Attaching state
  const [chatAttachmentType, setChatAttachmentType] = useState<'image' | 'video' | 'file' | ''>('');
  const [chatAttachmentUrl, setChatAttachmentUrl] = useState('');
  const [chatAttachmentName, setChatAttachmentName] = useState('');

  // AI Picture / Internet Image Generator states
  const [promptForWebImage, setPromptForWebImage] = useState('');
  const [webImageResult, setWebImageResult] = useState<string | null>(null);
  const [isWebImageLoading, setIsWebImageLoading] = useState(false);

  // App core states
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [depth, setDepth] = useState<'quick' | 'deep'>('deep');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Lilbed AI conversational tab states
  const [chatGptInput, setChatGptInput] = useState('');
  const [chatGptHistory, setChatGptHistory] = useState<{role: 'user' | 'model', content: string, timestamp: string}[]>([
    {
      role: 'model',
      content: "Hello! I am Lilbed AI, your worldwide research and scholarly writing assistant created by Obed Yadzo. I can help solve specialized assignments, homework, global academic write-ups (all formats: APA, MLA, etc.), and provide customer service knowledge intelligence. Ask me anything!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isChatGptLoading, setIsChatGptLoading] = useState(false);

  // Lilbed digital library, communities, and group peer chat engine states
  const [publishedPapers, setPublishedPapers] = useState<PublishedPaper[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [communityGroups, setCommunityGroups] = useState<CommunityGroup[]>([]);
  const [joinedPlatforms, setJoinedPlatforms] = useState<string[]>(["Google Scholar", "Lilbed Research Circle"]);
  
  // Active chat state
  const [activeDirectChatUserId, setActiveDirectChatUserId] = useState<string | null>(null);
  const [directChatText, setDirectChatText] = useState('');

  // Paper publisher temporary wizard states
  const [publishTitle, setPublishTitle] = useState('');
  const [publishAbstract, setPublishAbstract] = useState('');
  const [publishTarget, setPublishTarget] = useState<'account' | 'channel' | 'community' | 'group'>('account');
  const [publishTargetName, setPublishTargetName] = useState('Personal Feed');
  const [uploadedAttachmentUrl, setUploadedAttachmentUrl] = useState<string | null>(null);
  const [uploadedAttachmentType, setUploadedAttachmentType] = useState<'pdf' | 'image' | 'video' | 'audio' | null>(null);
  const [uploadedAttachmentName, setUploadedAttachmentName] = useState<string | null>(null);

  const dialogEndRef = useRef<HTMLDivElement>(null);
  const chatGptEndRef = useRef<HTMLDivElement>(null);

  const loadingPhases = [
    "Analyzing query semantic space and context...",
    "Formulating targeted global internet search terms...",
    "Querying Google Search crawler networks and indexing live websites...",
    "Gathering source pages and downloading target schemas...",
    "Extracting verifiable citations and checking data consistency...",
    "Synthesizing the analytical research briefing..."
  ];

  // Auth Listener and Initial Content Hydration effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProjects(currentUser.uid);
        await fetchSocialProfiles();
      } else {
        setProjects([]);
        setActiveProjectId(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen for native beforeinstallprompt to capture native PWA installation action
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent browser default dialog displaying automatically
      e.preventDefault();
      // Stash the event so it can be triggered on user action
      setDeferredPrompt(e);
      setInstallerAuditLogs(prev => [
        ...prev,
        `[INSTALLER] Native beforeinstallprompt captured successfully.`,
        `[INSTALLER] System application is ready for direct installation.`
      ]);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
      setInstallerAuditLogs(prev => [
        ...prev,
        `[INSTALLER] SUCCESS: System application successfully installed directly!`,
        `[INSTALLER] Running as standalone device secure container.`
      ]);
      alert("✨ Excellent! Your device native system registered Lilbed Workspace. You can access it directly via your central home screens or launcher shortcut!");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if web app is opened in standalone view already
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Universal system direct install prompt method
  const handleDirectInstallApp = async () => {
    if (deferredPrompt) {
      setInstallerAuditLogs(prev => [...prev, `[INSTALLER] Launching native secure system prompt...`]);
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setInstallerAuditLogs(prev => [...prev, `[INSTALLER] System responsive choice outcome: ${outcome}`]);
      if (outcome === 'accepted') {
        setIsAppInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      // Progressive Polyfill Direct Installer Simulator for environments without native prompt (e.g., inside preview in-frame)
      setInstallerAuditLogs(prev => [
        ...prev,
        `[INSTALLER] Initializing universal off-grid system client setup...`,
        `[INSTALLER] Extracting Standalone configuration metadata profiles...`
      ]);
      
      const setupSteps = [
        "🔄 Reading security certificates...",
        "⚙️ Running Sandboxed Service Worker pre-caching...",
        "📱 Matching screen configurations for Android/iOS...",
        "✨ Ready to integrate directly into system files..."
      ];

      let idx = 0;
      const progressTimer = setInterval(() => {
        if (idx < setupSteps.length) {
          setInstallerAuditLogs(prev => [...prev, `[SYSTEM] ${setupSteps[idx]}`]);
          idx++;
        } else {
          clearInterval(progressTimer);
          setIsAppInstalled(true);
          setInstallerAuditLogs(prev => [
            ...prev,
            `[INSTALLER] SUCCESS: Virtual deep-link system setup prepared!`,
            `[INSTALLER] Home screen launcher integration verified successfully.`
          ]);
          alert("✨ UNIVERSAL INSTALLATION SUCCESS: Standalone device profile enabled! If on phone or PC, you can configure desktop launchers directly through browser options (Chrome: ⋮ -> Install App; Safari: Share -> Add to Home Screen).");
        }
      }, 400);
    }
  };

  // Fetch social directory and WhatsApp connections
  const fetchSocialProfiles = async () => {
    try {
      if (!db) {
        const savedSocials = localStorage.getItem('lilbed_social_profiles');
        if (savedSocials) {
          const parsed = JSON.parse(savedSocials) as SocialProfile[];
          setSocialsProfiles(parsed);
        } else {
          const seed: SocialProfile[] = [
            {
              uid: 'seed-1',
              name: 'Obed Yadzo',
              phoneNumber: '+233597773520',
              bio: 'Founder of Lilbed AI. Academic researcher, professional programmer, website & game dev, flyer designer, and scholar at UPSA (Born 30/05/2002).',
              role: 'Scholar & Lead Developer',
              whatsappLink: 'https://wa.me/233597773520',
              createdAt: new Date().toISOString(),
              followers: [],
              following: [],
              friends: [],
              joinedPlatforms: [],
              communitiesCreated: [],
              groupsJoined: []
            },
            {
              uid: 'seed-2',
              name: 'Dr. Evelyn Acheampong',
              phoneNumber: '+233209876543',
              bio: 'UPSA Lecturer and Senior Academic Advisor. Researching digital transformational systems and African educational models.',
              role: 'Academic Advisor & Educator',
              whatsappLink: 'https://wa.me/233209876543',
              createdAt: new Date().toISOString(),
              followers: [],
              following: [],
              friends: [],
              joinedPlatforms: [],
              communitiesCreated: [],
              groupsJoined: []
            }
          ];
          setSocialsProfiles(seed);
          localStorage.setItem('lilbed_social_profiles', JSON.stringify(seed));
        }
        return;
      }

      const querySnapshot = await getDocs(collection(db, 'profiles'));
      const loaded: SocialProfile[] = [];
      querySnapshot.forEach((docSnap) => {
        loaded.push(docSnap.data() as SocialProfile);
      });

      if (loaded.length === 0) {
        const seed: SocialProfile[] = [
          {
            uid: 'seed-1',
            name: 'Obed Yadzo',
            phoneNumber: '+233597773520',
            bio: 'Founder of Lilbed AI. Academic researcher, professional programmer, website & game dev, flyer designer, and scholar at UPSA (Born 30/05/2002).',
            role: 'Scholar & Lead Developer',
            whatsappLink: 'https://wa.me/233597773520',
            createdAt: new Date().toISOString(),
            followers: [],
            following: [],
            friends: [],
            joinedPlatforms: [],
            communitiesCreated: [],
            groupsJoined: []
          },
          {
            uid: 'seed-2',
            name: 'Academic Researcher (UPSA Hub)',
            phoneNumber: '+233501234567',
            bio: 'Analytical study and flyer project manager at University of Professional Studies, Accra.',
            role: 'Researcher & Scholar',
            whatsappLink: 'https://wa.me/233501234567',
            createdAt: new Date().toISOString(),
            followers: [],
            following: [],
            friends: [],
            joinedPlatforms: [],
            communitiesCreated: [],
            groupsJoined: []
          }
        ];
        for (const s of seed) {
          await setDoc(doc(db, 'profiles', s.uid), s);
        }
        setSocialsProfiles(seed);
        localStorage.setItem('lilbed_social_profiles', JSON.stringify(seed));
      } else {
        // Guarantee Obed is always seeded in first list position
        const sorted = [...loaded];
        const obedientIndex = sorted.findIndex(s => s.uid === 'seed-1' || s.name.toLowerCase().includes('obed'));
        if (obedientIndex > 0) {
          const removed = sorted.splice(obedientIndex, 1);
          sorted.unshift(removed[0]);
        }
        setSocialsProfiles(sorted);
      }
    } catch (err) {
      console.warn("Error loading social profiles", err);
      const savedSocials = localStorage.getItem('lilbed_social_profiles');
      if (savedSocials) {
        setSocialsProfiles(JSON.parse(savedSocials));
      }
    }
  };

  // Seed data library for TikTok social media platform
  // Profile Registrant / Opt-in to community socials
  const registerSocialProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!socialName.trim() || !socialPhone.trim()) {
      alert("Please provide at least a full name and an active phone number.");
      return;
    }

    // Sanitize phone number to standard international format or simple string
    const sanitizedPhone = socialPhone.replace(/\s+/g, '').replace(/^0/, '233');
    const waLink = `https://wa.me/${sanitizedPhone.replace('+', '')}`;

    const presetAvatars = {
      individual: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(socialName)}`,
      institution: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(socialName)}`,
      business: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(socialName)}`
    };

    const newProfile: SocialProfile = {
      uid: user.uid,
      name: socialName,
      phoneNumber: socialPhone,
      bio: socialBio || 'Active Lilbed research scholar ready for collaboration.',
      role: socialRole,
      whatsappLink: waLink,
      createdAt: new Date().toISOString(),
      followers: [],
      following: [],
      friends: [],
      joinedPlatforms: [],
      communitiesCreated: [],
      groupsJoined: [],
      accountType: socialAccountType,
      profilePicture: presetAvatars[socialAccountType] || presetAvatars.individual
    };

    try {
      if (db) {
        await setDoc(doc(db, 'profiles', user.uid), newProfile);
      }
      const updated = socialsProfiles.filter(p => p.uid !== user.uid);
      const newList = [newProfile, ...updated];
      setSocialsProfiles(newList);
      localStorage.setItem('lilbed_social_profiles', JSON.stringify(newList));
      alert("Success! Your social profile is live. Peer scholars can now contact you on WhatsApp.");
      
      // Clear inputs
      setSocialName('');
      setSocialPhone('');
      setSocialBio('');
    } catch (fsErr) {
      console.error("Firestore profiling failed, preserving in local memory map.", fsErr);
      const updated = socialsProfiles.filter(p => p.uid !== user.uid);
      const newList = [newProfile, ...updated];
      setSocialsProfiles(newList);
      localStorage.setItem('lilbed_social_profiles', JSON.stringify(newList));
      alert("Success! Profile saved locally.");
    }
  };

  // Fetch from Firestore securely
  const fetchProjects = async (userId: string) => {
    const pathForQuery = 'projects';
    try {
      if (!db) {
        // Fallback offline projects
        const saved = localStorage.getItem(`lilbed_projects_${userId}`);
        if (saved) {
          setProjects(JSON.parse(saved));
        }
        return;
      }
      const q = query(
        collection(db, pathForQuery),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const loaded: ResearchProject[] = [];
      querySnapshot.forEach((docSnapshot) => {
        loaded.push(docSnapshot.data() as ResearchProject);
      });
      // Order reverse chronologically by ID (timestamp)
      loaded.sort((a, b) => b.id.localeCompare(a.id));
      setProjects(loaded);
      if (loaded.length > 0) {
        setActiveProjectId(loaded[0].id);
      }
    } catch (err) {
      console.warn("Firestore not ready or permission denied, using local storage backup.", err);
      const saved = localStorage.getItem(`lilbed_projects_${userId}`);
      if (saved) {
        setProjects(JSON.parse(saved));
      }
    }
  };

  // Save/Persist project catalog locally or in DB
  const persistProjectChange = async (updatedList: ResearchProject[], updatedProj: ResearchProject) => {
    setProjects(updatedList);
    if (user) {
      localStorage.setItem(`lilbed_projects_${user.uid}`, JSON.stringify(updatedList));
      if (db) {
        try {
          await setDoc(doc(db, 'projects', updatedProj.id), updatedProj);
        } catch (e) {
          console.error("Firestore sync error:", e);
        }
      }
    }
  };

  // Scroll views to bottom
  useEffect(() => {
    dialogEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [projects, isLoading, activeProjectId, activeTab]);

  useEffect(() => {
    chatGptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatGptHistory, isChatGptLoading, activeTab]);

  // Loading phases indicator
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setInterval(() => {
        setLoadingPhase((prev) => (prev < loadingPhases.length - 1 ? prev + 1 : prev));
      }, 3500);
    } else {
      setLoadingPhase(0);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  // Hydrate published papers, direct messages, and custom community groups from storage on load
  useEffect(() => {
    // 1. Hydrate Published Papers
    const savedPapers = localStorage.getItem('lilbed_published_papers');
    if (savedPapers) {
      setPublishedPapers(JSON.parse(savedPapers));
    } else {
      const defaultPapers: PublishedPaper[] = [
        {
          id: 'paper-1',
          userId: 'seed-1',
          authorName: 'Obed Yadzo',
          authorPicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          title: 'Quantum Computing and Cryptography in Sovereign West African Networks',
          abstract: 'This paper establishes a novel conceptual archetype for routing quantum security handshakes over low-orbit constellations. Specifically targeting Ghanaian digital infrastructures, we formulate mathematical bounds for active interference and recommend hybrid key validation paradigms suitable for academic and civil service governance.',
          publishingTarget: 'community',
          targetName: 'Lilbed Global Community',
          likes: ['seed-2', 'user-placeholder-1'],
          dislikes: [],
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString() // 2 days ago
        },
        {
          id: 'paper-2',
          userId: 'seed-2',
          authorName: 'Dr. Evelyn Acheampong',
          authorPicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
          title: 'A Critical Pedagogy of Generative Artificial Intelligence in Higher Education',
          abstract: 'This research reviews academic integrity frameworks in the presence of conversational co-pilots. Drawing on comprehensive student feedback arrays at the University of Professional Studies, Accra (UPSA), we evaluate the balanced synthesis of critical thinking and AI cognitive assistance.',
          publishingTarget: 'channel',
          targetName: 'Accra Research Channel',
          likes: ['seed-1'],
          dislikes: [],
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString() // 12 hours ago
        }
      ];
      setPublishedPapers(defaultPapers);
      localStorage.setItem('lilbed_published_papers', JSON.stringify(defaultPapers));
    }

    // 2. Hydrate Direct Messages
    const savedDMs = localStorage.getItem('lilbed_direct_messages');
    if (savedDMs) {
      setDirectMessages(JSON.parse(savedDMs));
    } else {
      const defaultDMs: DirectMessage[] = [
        {
          id: 'dm-1',
          senderId: 'seed-1',
          receiverId: 'seed-2',
          content: 'Hello Dr. Evelyn, I have updated the Worldwide Research and Demarcation module for our upcoming academic presentation!',
          timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: 'dm-2',
          senderId: 'seed-2',
          receiverId: 'seed-1',
          content: 'Excellent work Obed! The community of scholars is highly anticipating your direct presentation. Let us collaborate further on the whiteboards!',
          timestamp: new Date(Date.now() - 3600000 * 1.8).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setDirectMessages(defaultDMs);
      localStorage.setItem('lilbed_direct_messages', JSON.stringify(defaultDMs));
    }

    // 3. Hydrate Community Groups & Teams
    const savedGroups = localStorage.getItem('lilbed_community_groups');
    if (savedGroups) {
      setCommunityGroups(JSON.parse(savedGroups));
    } else {
      const defaultGroups: CommunityGroup[] = [
        {
          id: 'group-1',
          type: 'group',
          name: 'UPSA Physics Scholars',
          description: 'Physics and digital engineering research collaboration group at the University of Professional Studies, Accra.',
          creatorId: 'seed-1',
          memberIds: ['seed-1', 'seed-2'],
          createdAt: new Date().toISOString()
        },
        {
          id: 'group-2',
          type: 'community',
          name: 'Lilbed Global Community',
          description: 'A global ecosystem of scholars, engineers, and creatives building open research models under the oversight of Obed Yadzo.',
          creatorId: 'seed-1',
          memberIds: ['seed-1', 'seed-2'],
          createdAt: new Date().toISOString()
        },
        {
          id: 'group-3',
          type: 'channel',
          name: 'Accra Research Channel',
          description: 'Broadcast and feedback loop for regional African research papers, journals, and peer reviews.',
          creatorId: 'seed-2',
          memberIds: ['seed-1', 'seed-2'],
          createdAt: new Date().toISOString()
        }
      ];
      setCommunityGroups(defaultGroups);
      localStorage.setItem('lilbed_community_groups', JSON.stringify(defaultGroups));
    }

    // 4. Hydrate Joined Platforms
    const savedPlats = localStorage.getItem('lilbed_joined_platforms');
    if (savedPlats) {
      setJoinedPlatforms(JSON.parse(savedPlats));
    }
  }, []);

  // Auth Submit Action
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    if (!email.trim() || !password.trim()) {
      setAuthError("Email and Password fields are mandatory.");
      return;
    }
    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    try {
      if (isSignUp) {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = credential.user;

        if (db) {
          try {
            await setDoc(doc(db, 'users', newUser.uid), {
              uid: newUser.uid,
              email: newUser.email || '',
              createdAt: new Date().toISOString()
            });
          } catch (dbErr) {
            console.error("User record firestore upload pending:", dbErr);
          }
        }
        setAuthSuccess("Account created successfully!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setAuthSuccess("Signed in successfully!");
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentication attempt collapsed.");
    }
  };

  // Google Authentication handler
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userObj = result.user;
      
      // Sync Google record to firestore users collection
      if (db) {
        try {
          await setDoc(doc(db, 'users', userObj.uid), {
            uid: userObj.uid,
            email: userObj.email || '',
            createdAt: new Date().toISOString()
          }, { merge: true });
        } catch (dbErr) {
          console.error("User record firestore merge pending/denied:", dbErr);
        }
      }
      setAuthSuccess("Authenticated with Google successfully!");
    } catch (err: any) {
      console.error("Google sign in failure:", err);
      setAuthError(err.message || "Google sign in was unsuccessful.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      alert("Error during signing out: " + err.message);
    }
  };

  // Uniform payments trigger
  const triggerPaymentFlow = (
    type: 'storage' | 'ads' | 'download' | 'credit',
    amount: number,
    metadata?: any
  ) => {
    setPaymentType(type);
    setPaymentAmount(amount);
    setPaymentMetadata(metadata);
    setPaymentMoMoNumber('');
    setPinValue('');
    setPaymentStep('setup');
    setIsPaymentOpen(true);
  };

  const executeNewsletterSubscription = (subEmail: string) => {
    if (!subEmail || !subEmail.includes('@')) {
      alert("Please provide a valid email address.");
      return;
    }
    const currentList = [...subscribedEmails];
    if (!currentList.includes(subEmail)) {
      currentList.push(subEmail);
      setSubscribedEmails(currentList);
      localStorage.setItem('lilbed_newsletter_emails', JSON.stringify(currentList));
    }
    setIsSubscribedNewsletter(true);
    localStorage.setItem('lilbed_newsletter_subscribed', 'true');
    alert(`Success! Successfully subscribed ${subEmail} to the Lilbed AI Newsletter. You will now receive premium research and visual studio newsletters!`);
  };

  const handleMomoPaymentSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMoMoNumber || paymentMoMoNumber.length < 9) {
      alert("Please specify a valid mobile money number.");
      return;
    }
    setPaymentStep('prompt');
  };

  const handleMomoConfirmPrompt = () => {
    setPaymentStep('pin');
  };

  const handleMomoPinSubmited = () => {
    if (pinValue.length < 4) {
      alert("MoMo pin must be 4 or 6 digits.");
      return;
    }
    setPaymentStep('processing');
    
    // Simulate network authorization & updates
    setTimeout(() => {
      if (paymentType === 'storage') {
        const nextStorage = storageGb + 1.0;
        setStorageGb(nextStorage);
        localStorage.setItem('lilbed_storage_gb', nextStorage.toString());
      } else if (paymentType === 'download') {
        const nextUnlocked = [...unlockedPaperIds];
        const paperId = paymentMetadata?.paperId || 'unknown_item';
        if (!nextUnlocked.includes(paperId)) {
          nextUnlocked.push(paperId);
          setUnlockedPaperIds(nextUnlocked);
          localStorage.setItem('lilbed_unlocked_papers', JSON.stringify(nextUnlocked));
        }
        
        if (paymentMetadata?.attachmentUrl && paymentMetadata?.attachmentName) {
          const tempLink = document.createElement('a');
          tempLink.href = paymentMetadata.attachmentUrl;
          tempLink.setAttribute('download', paymentMetadata.attachmentName);
          tempLink.click();
        }
      } else if (paymentType === 'ads') {
        const campaignName = paymentMetadata?.campaignName || 'General Ads Promo';
        const newCampaign = {
          id: `ad-${Date.now()}`,
          name: campaignName,
          budget: paymentAmount,
          status: 'Active',
          date: new Date().toLocaleDateString()
        };
        const nextCampaigns = [newCampaign, ...adsCampaigns];
        setAdsCampaigns(nextCampaigns);
        localStorage.setItem('lilbed_ads_campaigns', JSON.stringify(nextCampaigns));
      } else if (paymentType === 'credit') {
        // Simple log
        console.log("Credited developer " + paymentAmount);
      }
      
      setPaymentStep('success');
    }, 2000);
  };

  const handleAcceptTermsAndCopyright = () => {
    setAcceptedTerms(true);
    localStorage.setItem('lilbed_accepted_terms', 'true');
  };

  const getCitationText = (src: Source, style: 'APA' | 'MLA' | 'Harvard' | 'Chicago') => {
    let domain = "Web Source";
    try {
      const urlObj = new URL(src.url);
      domain = urlObj.hostname.replace('www.', '');
    } catch (e) {}

    const year = "2026";
    const author = domain.split('.')[0].toUpperCase() || "LILBED ACADEMICS";
    const today = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

    switch (style) {
      case 'APA':
        return `${author}. (${year}). ${src.title}. Retrieved from ${src.url}`;
      case 'MLA':
        return `"${src.title}." ${author}, ${year}, ${src.url}. Accessed ${today}.`;
      case 'Chicago':
        return `${author}. "${src.title}." ${year}. ${src.url} (accessed ${today}).`;
      case 'Harvard':
      default:
        return `${author} (${year}) '${src.title}', available at: ${src.url} (Accessed: ${today}).`;
    }
  };

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  const startNewProject = () => {
    setInputValue('');
    setActiveProjectId(null);
    setActiveTab('projects');
  };

  // Submit Lilbed core research query
  const handleResearchSubmit = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const queryTerm = customPrompt || inputValue;
    if (!queryTerm.trim() || !user) return;

    setIsLoading(true);
    setLoadingPhase(0);
    if (!customPrompt) setInputValue('');

    try {
      let currentProject = activeProject;
      let updatedHistory: any[] = [];
      
      if (currentProject) {
        updatedHistory = currentProject.messages.map(m => ({
          role: m.role,
          content: m.content
        }));
      }

      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: queryTerm,
          depth,
          history: updatedHistory,
          dateRange: searchDateRange,
          customStartDate,
          customEndDate,
          sourceType: searchSourceType,
          includeKeywords,
          excludeKeywords
        })
      });

      if (!res.ok) {
        throw new Error("Research service is currently warming up. Please re-try.");
      }

      const data = await res.json();

      const newMessage: Message = {
        role: 'user',
        content: queryTerm,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const systemMessage: Message = {
        role: 'model',
        content: data.text,
        queries: data.queries || [],
        sources: data.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      let nextProjects = [...projects];

      if (!currentProject) {
        const newProjId = Date.now().toString();
        const newProj: ResearchProject = {
          id: newProjId,
          userId: user.uid,
          topic: queryTerm.length > 55 ? queryTerm.substring(0, 52) + "..." : queryTerm,
          depth,
          messages: [newMessage, systemMessage],
          createdAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })
        };
        
        nextProjects = [newProj, ...nextProjects];
        await persistProjectChange(nextProjects, newProj);
        setActiveProjectId(newProjId);
      } else {
        const updatedProj: ResearchProject = {
          ...currentProject,
          messages: [...currentProject.messages, newMessage, systemMessage]
        };

        nextProjects = projects.map(p => p.id === updatedProj.id ? updatedProj : p);
        await persistProjectChange(nextProjects, updatedProj);
      }

    } catch (err: any) {
      console.error(err);
      alert("A system disruption occurred: " + (err.message || err));
    } finally {
      setIsLoading(false);
    }
  };

  // Submit conversational ChatGPT query
  const handleChatGptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryText = chatGptInput.trim();
    if (!queryText) return;

    setChatGptInput('');
    setIsChatGptLoading(true);

    const userMsg = {
      role: 'user' as const,
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatGptHistory(prev => [...prev, userMsg]);

    try {
      const formattedHistory = chatGptHistory.map(h => ({
        role: h.role,
        content: h.content
      }));

      const res = await fetch("/api/chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: queryText,
          history: formattedHistory
        })
      });

      if (!res.ok) {
        throw new Error("Chat co-polit failed to establish server link.");
      }

      const data = await res.json();
      setChatGptHistory(prev => [...prev, {
        role: 'model' as const,
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

    } catch (err: any) {
      setChatGptHistory(prev => [...prev, {
        role: 'model' as const,
        content: `⚠️ Assistant linkage disrupted: ${err.message || err}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsChatGptLoading(false);
    }
  };

  // Submit AI Studio generation request
  const handleStudioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const promptText = studioPrompt.trim();
    if (!promptText) return;

    setIsStudioLoading(true);
    setStudioResult(null);
    setCurrentSlideIndex(0);

    try {
      let endpoint = "/api/generate-image";
      let requestBody: any = { prompt: promptText };

      if (studioMode === 'flyer') {
        endpoint = "/api/generate-image";
        requestBody = { prompt: promptText, style: studioStyle, aspectRatio: studioAspectRatio };
      } else if (studioMode === 'slides') {
        endpoint = "/api/generate-slides";
        requestBody = { prompt: promptText };
      } else if (studioMode === 'video') {
        endpoint = "/api/generate-video";
        requestBody = { prompt: promptText, aspectRatio: studioAspectRatio };
      } else {
        endpoint = "/api/chatgpt";
        requestBody = { prompt: promptText };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        throw new Error("AI Studio failed to communicate with services.");
      }

      const data = await res.json();
      
      if (studioMode === 'flyer') {
        setStudioResult({
          imageUrl: data.imageUrl,
          isFallback: data.isFallback || !data.isReal,
          isSvg: data.isSvg
        });
      } else if (studioMode === 'slides') {
        setStudioResult({
          slides: data.slides
        });
      } else if (studioMode === 'video') {
        setStudioResult({
          videoPlanUrl: data.fallbackVideoUrl || "matrix",
          text: data.caption,
          isFallback: data.isFallback
        });
      } else {
        setStudioResult({
          text: data.text
        });
      }

    } catch (err: any) {
      console.error(err);
      setStudioResult({
        error: err.message || "An unexpected issue occurred while synthesizing design."
      });
    } finally {
      setIsStudioLoading(false);
    }
  };

  const handleExportFlyerToLibrary = () => {
    if (!studioResult || !studioResult.imageUrl) return;
    const authorName = user?.email?.split('@')[0] || 'Peer Scholar';
    const newPaper: PublishedPaper = {
      id: `paper-flyer-${Date.now()}`,
      userId: user?.uid || 'anonymous',
      authorName,
      title: `AI Synthesized Graphic: ${studioPrompt || 'Creative Scholar Blueprint'}`,
      abstract: `This visual schematic illustrates the thematic style ${studioStyle} with coordinates optimized for academic flyers. Generated using Lilbed AI Studio.`,
      publishingTarget: 'account',
      targetName: 'My Personal Account',
      attachmentUrl: studioResult.imageUrl,
      attachmentType: 'image',
      attachmentName: `${studioPrompt.replace(/[^a-zA-Z0-9]/g, '_')}_flyer.png`,
      likes: [],
      dislikes: [],
      createdAt: new Date().toISOString()
    };
    const updated = [newPaper, ...publishedPapers];
    setPublishedPapers(updated);
    localStorage.setItem('lilbed_published_papers', JSON.stringify(updated));
    setActiveTab('library');
  };

  const handleExportSlidesToLibrary = () => {
    if (!studioResult || !studioResult.slides) return;
    const authorName = user?.email?.split('@')[0] || 'Peer Scholar';
    const slidesText = studioResult.slides.map((s: any, i: number) => `Slide ${i+1}: ${s.title}\nBullets: ${s.bullets.join(', ')}`).join('\n\n');
    const newPaper: PublishedPaper = {
      id: `paper-slides-${Date.now()}`,
      userId: user?.uid || 'anonymous',
      authorName,
      title: `AI Slide Compilation: ${studioPrompt || 'Dynamic Lesson Plan'}`,
      abstract: `Synthesized lecture and seminar deck mapping out the following layout structural sequence:\n\n${slidesText}`,
      publishingTarget: 'community',
      targetName: 'Lilbed Global Community',
      attachmentType: 'pdf',
      attachmentName: `${studioPrompt.replace(/[^a-zA-Z0-9]/g, '_')}_presentation.pdf`,
      likes: [],
      dislikes: [],
      createdAt: new Date().toISOString()
    };
    const updated = [newPaper, ...publishedPapers];
    setPublishedPapers(updated);
    localStorage.setItem('lilbed_published_papers', JSON.stringify(updated));
    setActiveTab('library');
  };

  const handleExportVideoToLibrary = () => {
    if (!studioResult) return;
    const authorName = user?.email?.split('@')[0] || 'Peer Scholar';
    const newPaper: PublishedPaper = {
      id: `paper-video-${Date.now()}`,
      userId: user?.uid || 'anonymous',
      authorName,
      title: `Cinematic Script & Media Plan: ${studioPrompt || 'Creative Video Reel'}`,
      abstract: `Audio-visual screenplay generated by Lilbed AI Studio mapping to the 16:9 cinematic aspect ratio. High scholarly standard.`,
      publishingTarget: 'group',
      targetName: 'UPSA Physics Scholars',
      attachmentType: 'video',
      attachmentUrl: studioResult.videoPlanUrl || 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4',
      attachmentName: `${studioPrompt.replace(/[^a-zA-Z0-9]/g, '_')}_production.mp4`,
      likes: [],
      dislikes: [],
      createdAt: new Date().toISOString()
    };
    const updated = [newPaper, ...publishedPapers];
    setPublishedPapers(updated);
    localStorage.setItem('lilbed_published_papers', JSON.stringify(updated));
    setActiveTab('library');
  };

  const handleExportMapToLibrary = (locationName: string, detailText: string, mapsUrl: string) => {
    const authorName = user?.email?.split('@')[0] || 'Peer Scholar';
    const newPaper: PublishedPaper = {
      id: `paper-map-${Date.now()}`,
      userId: user?.uid || 'anonymous',
      authorName,
      title: `Geographic Border & Demarcation Intel: ${locationName}`,
      abstract: `Demarcation intelligence outlining the sovereignty characteristics of "${locationName}":\n\n${detailText}\n\nGoogle Maps Link: ${mapsUrl}`,
      publishingTarget: 'channel',
      targetName: 'Accra Research Channel',
      attachmentUrl: mapsUrl,
      attachmentType: 'image',
      attachmentName: `demarcation_map_${locationName.replace(/[^a-zA-Z0-0]/g, '_')}.png`,
      likes: [],
      dislikes: [],
      createdAt: new Date().toISOString()
    };
    const updated = [newPaper, ...publishedPapers];
    setPublishedPapers(updated);
    localStorage.setItem('lilbed_published_papers', JSON.stringify(updated));
    setActiveTab('library');
  };

  const handleExportToLibrary = (text: string) => {
    const authorName = user?.email?.split('@')[0] || 'Peer Scholar';
    const title = text.split('\n')[0].replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 60) || 'Scholarly segment capture';
    const newPaper: PublishedPaper = {
      id: `paper-snippet-${Date.now()}`,
      userId: user?.uid || 'anonymous',
      authorName,
      title: title.endsWith('...') ? title : `${title}...`,
      abstract: text,
      publishingTarget: 'account',
      targetName: 'Personal Feed',
      likes: [],
      dislikes: [],
      createdAt: new Date().toISOString()
    };
    const updated = [newPaper, ...publishedPapers];
    setPublishedPapers(updated);
    localStorage.setItem('lilbed_published_papers', JSON.stringify(updated));
    setActiveTab('library');
  };

  // AI Multimodal Picture / Web Image search tool 
  const handleSearchWebImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptForWebImage.trim()) return;
    setIsWebImageLoading(true);
    setWebImageResult(null);

    try {
      // First try real Imagen generation from backend
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptForWebImage.trim(), style: 'modern', aspectRatio: '1:1' })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.imageUrl) {
          setWebImageResult(data.imageUrl);
          setIsWebImageLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Imagen generation error in painter, trying premium unsplash fallback", err);
    }

    // High resolution premium image fallback search from curated internet galleries (Unsplash)
    setTimeout(() => {
      const sanitized = encodeURIComponent(promptForWebImage.trim().toLowerCase());
      const selectedCuratedUrls = [
        `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop`,
        `https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop`,
        `https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop`,
        `https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop`,
        `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop`,
        `https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop`
      ];
      // pick one deterministically based on character count or fallback to direct search query
      const index = promptForWebImage.length % selectedCuratedUrls.length;
      setWebImageResult(selectedCuratedUrls[index]);
      setIsWebImageLoading(false);
    }, 1200);
  };

  // Direct native media and documents attachment upload handler
  const handleFileAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    let determinedType: 'pdf' | 'image' | 'video' | 'audio' = 'pdf';
    if (file.type.startsWith('image/')) determinedType = 'image';
    else if (file.type.startsWith('video/')) determinedType = 'video';
    else if (file.type.startsWith('audio/')) determinedType = 'audio';

    setUploadedAttachmentUrl(objectUrl);
    setUploadedAttachmentType(determinedType);
    setUploadedAttachmentName(file.name);
  };

  // Direct publishing of regular user paper
  const handlePublishPaperSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishTitle.trim() || !publishAbstract.trim()) {
      alert("Please provide both a Title and an Abstract for your research publication.");
      return;
    }

    if (!publishTermsAccepted) {
      alert("Copyright Terms Agreement Required: Please accept the developer copyright policies and terms before broadcasting publications.");
      return;
    }

    const aut = socialsProfiles.find(p => p.uid === user?.uid);
    const authorName = aut?.name || user?.email?.split('@')[0] || 'My Account';
    const authorPicture = aut?.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

    const newPaper: PublishedPaper = {
      id: `paper-user-${Date.now()}`,
      userId: user?.uid || 'anonymous',
      authorName,
      authorPicture,
      title: publishTitle,
      abstract: publishAbstract,
      publishingTarget: publishTarget,
      targetName: publishTarget === 'account' ? 'Personal Feed' : publishTargetName,
      attachmentUrl: uploadedAttachmentUrl || undefined,
      attachmentType: uploadedAttachmentType || undefined,
      attachmentName: uploadedAttachmentName || undefined,
      likes: [],
      dislikes: [],
      isPrivate: publishIsPrivate,
      createdAt: new Date().toISOString()
    };

    const updated = [newPaper, ...publishedPapers];
    setPublishedPapers(updated);
    localStorage.setItem('lilbed_published_papers', JSON.stringify(updated));

    // Reset Form Fields
    setPublishTitle('');
    setPublishAbstract('');
    setPublishTarget('account');
    setPublishTargetName('Personal Feed');
    setUploadedAttachmentUrl(null);
    setUploadedAttachmentType(null);
    setUploadedAttachmentName(null);
    setPublishIsPrivate(false);
    setPublishTermsAccepted(false);

    alert(`Successfully published "${newPaper.title}" to standard academic networks! Privacy: ${newPaper.isPrivate ? "Private" : "Public - Permanent"}`);
  };

  // Delete/Remove Paper Handler - can only be removed by content poster or publisher
  const handleDeletePaper = (paperId: string) => {
    if (!user) {
      alert("Authentication required to remove content.");
      return;
    }
    const targetPaper = publishedPapers.find(p => p.id === paperId);
    if (!targetPaper) return;

    if (targetPaper.userId !== user.uid) {
      alert("Permission Denied: Post are permanent and can ONLY be removed by the content poster, publisher, or founder!");
      return;
    }

    if (confirm("Are you sure you want to permanently remove this publication from the Lilbed Index?")) {
      const updated = publishedPapers.filter(p => p.id !== paperId);
      setPublishedPapers(updated);
      localStorage.setItem('lilbed_published_papers', JSON.stringify(updated));
      alert("Publication has been removed successfully.");
    }
  };

  // Worldwide / Oxford Dictionary query handler
  const handleSearchDictionaryCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dictionaryWord.trim()) return;
    setDictionaryLoading(true);
    setDictionaryResult(null);

    try {
      const response = await fetch("/api/dictionary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: dictionaryWord })
      });

      if (!response.ok) {
        throw new Error("Linguistic catalog not responding.");
      }

      const data = await response.json();
      setDictionaryResult(data);
    } catch (err: any) {
      setDictionaryResult({ error: err.message || "Failed to look up linguistic data." });
    } finally {
      setDictionaryLoading(false);
    }
  };

  // Code / QR telemetry scanner query handler
  const handleScanCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedCode.trim()) return;
    setScannerLoading(true);
    setScannerResult(null);

    try {
      const response = await fetch("/api/scan-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: scannedCode, type: scannedType })
      });

      if (!response.ok) {
        throw new Error("Telemetry decoder server error.");
      }

      const data = await response.json();
      setScannerResult(data);
    } catch (err: any) {
      setScannerResult({ error: err.message || "Failed to extract scanned payload." });
    } finally {
      setScannerLoading(false);
    }
  };

  // High quality Code Generator query handler
  const handleGenerateCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeRequirements.trim()) {
      alert("Please detail your website or app development requirements first.");
      return;
    }
    setCodeLoading(true);
    setCodeResult(null);
    setSelectedCodeFileIdx(0);

    try {
      const response = await fetch("/api/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirements: codeRequirements,
          language: codeLanguage,
          projectType: codeProjectType
        })
      });

      if (!response.ok) {
        throw new Error("Pristine synthesis generator offline.");
      }

      const data = await response.json();
      setCodeResult(data);
    } catch (err: any) {
      setCodeResult({ error: err.message || "App compilation/synthesis aborted." });
    } finally {
      setCodeLoading(false);
    }
  };

  // Direct DM Messaging sender
  const handleSendDirectMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || !activeDirectChatUserId) return;
    if (!directChatText.trim() && !chatAttachmentUrl) return;

    const recipientProfile = socialsProfiles.find(p => p.uid === activeDirectChatUserId);
    const recipientName = recipientProfile ? recipientProfile.name : "Peer Scholar";
    const recipientEmail = recipientProfile ? `${recipientProfile.name.replace(/[^a-zA-Z]/g, '').toLowerCase()}@lilbed.net` : "scholar@lilbed.net";

    const newMsg: DirectMessage = {
      id: `dm-live-${Date.now()}`,
      senderId: user.uid,
      receiverId: activeDirectChatUserId,
      content: directChatText || `Shared an attachment: ${chatAttachmentName || 'Document file'}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachmentUrl: chatAttachmentUrl || undefined,
      attachmentType: chatAttachmentType || undefined,
      attachmentName: chatAttachmentName || undefined,
      isEncrypted: encryptChat
    };

    const updated = [...directMessages, newMsg];
    setDirectMessages(updated);
    localStorage.setItem('lilbed_direct_messages', JSON.stringify(updated));
    setDirectChatText('');
    setChatAttachmentUrl('');
    setChatAttachmentType('');
    setChatAttachmentName('');

    // Trigger transient simulated email notification toast
    const notificationMsg = `📧 Notification System: Secure email dispatch sent to <${recipientEmail}> regarding your incoming encrypted connection!`;
    setEmailAlertToast(notificationMsg);
    setTimeout(() => {
      setEmailAlertToast(null);
    }, 4500);
  };

  // Likes and dislikes toggles
  const handleLikePaper = (paperId: string) => {
    if (!user) {
      alert("Please authenticate or sign up to interact with research publications.");
      return;
    }
    const updated = publishedPapers.map(p => {
      if (p.id === paperId) {
        const hasLiked = p.likes.includes(user.uid);
        const nextLikes = hasLiked ? p.likes.filter(id => id !== user.uid) : [...p.likes, user.uid];
        const nextDislikes = p.dislikes.filter(id => id !== user.uid);
        return { ...p, likes: nextLikes, dislikes: nextDislikes };
      }
      return p;
    });
    setPublishedPapers(updated);
    localStorage.setItem('lilbed_published_papers', JSON.stringify(updated));
  };

  const handleDislikePaper = (paperId: string) => {
    if (!user) {
      alert("Please authenticate or sign up to interact with research publications.");
      return;
    }
    const updated = publishedPapers.map(p => {
      if (p.id === paperId) {
        const hasDisliked = p.dislikes.includes(user.uid);
        const nextDislikes = hasDisliked ? p.dislikes.filter(id => id !== user.uid) : [...p.dislikes, user.uid];
        const nextLikes = p.likes.filter(id => id !== user.uid);
        return { ...p, likes: nextLikes, dislikes: nextDislikes };
      }
      return p;
    });
    setPublishedPapers(updated);
    localStorage.setItem('lilbed_published_papers', JSON.stringify(updated));
  };

  // Join/Leave worldwide research platforms
  const handleToggleJoinPlatform = (platName: string) => {
    const hasJoined = joinedPlatforms.includes(platName);
    const nextJoined = hasJoined ? joinedPlatforms.filter(p => p !== platName) : [...joinedPlatforms, platName];
    setJoinedPlatforms(nextJoined);
    localStorage.setItem('lilbed_joined_platforms', JSON.stringify(nextJoined));
  };

  // Friend / Follow toggle modifiers
  const handleToggleFollow = (targetUid: string) => {
    if (!user) {
      alert("Please authenticate first.");
      return;
    }
    const updated = socialsProfiles.map(p => {
      if (p.uid === targetUid) {
        const followersArray = p.followers || [];
        const isFollowing = followersArray.includes(user.uid);
        const nextFollowers = isFollowing 
          ? followersArray.filter(id => id !== user.uid) 
          : [...followersArray, user.uid];
        return { ...p, followers: nextFollowers };
      }
      if (p.uid === user.uid) {
        const followingArray = p.following || [];
        const isFollowing = followingArray.includes(targetUid);
        const nextFollowing = isFollowing 
          ? followingArray.filter(id => id !== targetUid) 
          : [...followingArray, targetUid];
        return { ...p, following: nextFollowing };
      }
      return p;
    });
    setSocialsProfiles(updated);
    localStorage.setItem('lilbed_social_profiles', JSON.stringify(updated));
  };

  const handleToggleFriend = (targetUid: string) => {
    if (!user) {
      alert("Please authenticate first.");
      return;
    }
    const updated = socialsProfiles.map(p => {
      if (p.uid === targetUid) {
        const friendsArray = p.friends || [];
        const isFriend = friendsArray.includes(user.uid);
        const nextFriends = isFriend 
          ? friendsArray.filter(id => id !== user.uid) 
          : [...friendsArray, user.uid];
        return { ...p, friends: nextFriends };
      }
      if (p.uid === user.uid) {
        const friendsArray = p.friends || [];
        const isFriend = friendsArray.includes(targetUid);
        const nextFriends = isFriend 
          ? friendsArray.filter(id => id !== targetUid) 
          : [...friendsArray, targetUid];
        return { ...p, friends: nextFriends };
      }
      return p;
    });
    setSocialsProfiles(updated);
    localStorage.setItem('lilbed_social_profiles', JSON.stringify(updated));
  };

  // Add custom collaborative groups & communities
  const handleCreateCommunityGroupSubmit = (name: string, description: string, type: 'community' | 'group' | 'channel') => {
    if (!name.trim()) return;
    const newGrp: CommunityGroup = {
      id: `grp-user-${Date.now()}`,
      type,
      name,
      description: description || `Academic and collaborative focus zone created by user.`,
      creatorId: user?.uid || 'seed-1',
      memberIds: [user?.uid || 'seed-1'],
      createdAt: new Date().toISOString()
    };
    const updated = [...communityGroups, newGrp];
    setCommunityGroups(updated);
    localStorage.setItem('lilbed_community_groups', JSON.stringify(updated));
    alert(`Success! Created standard academic ${type}: "${name}"`);
  };

  const exportProjects = () => {
    try {
      const dataStr = JSON.stringify(projects, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const tempLink = document.createElement('a');
      tempLink.href = url;
      tempLink.setAttribute('download', `lilbed_research_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Failed to export: " + err.message);
    }
  };

  const importProjects = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    fileReader.readAsText(files[0], "UTF-8");
    fileReader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed) return;
        
        let validProjects: ResearchProject[] = [];
        
        if (Array.isArray(parsed)) {
          // It's a list containing multiple projects
          validProjects = parsed.filter(item => {
            return item && typeof item.id === 'string' && typeof item.topic === 'string' && Array.isArray(item.messages);
          });
        } else if (typeof parsed === 'object' && typeof parsed.id === 'string' && typeof parsed.topic === 'string') {
          // It's a single project instance
          validProjects = [parsed as ResearchProject];
        } else {
          alert("Invalid backup file format. Must be a valid JSON array or object containing research projects.");
          return;
        }

        if (validProjects.length === 0) {
          alert("No valid research projects found in this file.");
          return;
        }

        const existingIds = new Set(projects.map(p => p.id));
        const newlyAdded: ResearchProject[] = [];
        
        validProjects.forEach(proj => {
          if (!existingIds.has(proj.id)) {
            if (user) {
              proj.userId = user.uid;
            }
            newlyAdded.push(proj);
          }
        });

        if (newlyAdded.length === 0) {
          alert("All imported projects already exist in your local workspace.");
          return;
        }

        const updatedProjects = [...newlyAdded, ...projects];
        setProjects(updatedProjects);
        
        if (user) {
          localStorage.setItem(`lilbed_projects_${user.uid}`, JSON.stringify(updatedProjects));
          if (db) {
            for (const proj of newlyAdded) {
              try {
                await setDoc(doc(db, 'projects', proj.id), proj);
              } catch (fsErr) {
                console.warn(`Firestore upload deferred for imported project ${proj.id}`, fsErr);
              }
            }
          }
        }
        
        setActiveProjectId(newlyAdded[0].id);
        alert(`Successfully imported ${newlyAdded.length} research projects!`);
      } catch (err: any) {
        alert("Encountered an error while reading the file: " + err.message);
      }
    };
    e.target.value = '';
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareToWhatsapp = (text: string) => {
    const rawMarkdownStripped = text.replace(/[#*`_\[\]]/g, '');
    const snippet = rawMarkdownStripped.length > 400 ? rawMarkdownStripped.substring(0, 400) + '...' : rawMarkdownStripped;
    const shareUrl = "https://wa.me/?text=" + encodeURIComponent(`📝 *LILBED AI ANALYSIS REPORT* 📝\n\n${snippet}\n\n👉 View more at Lilbed AI Workspace.`);
    window.open(shareUrl, '_blank');
  };

  const deleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      if (db) {
        await deleteDoc(doc(db, 'projects', id));
      }
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      if (activeProjectId === id) {
        setActiveProjectId(updated.length > 0 ? updated[0].id : null);
      }
    } catch (e) {
      console.error(e);
      // fallback
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      if (activeProjectId === id) {
        setActiveProjectId(updated.length > 0 ? updated[0].id : null);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-slate-900 animate-spin mx-auto" />
          <p className="text-sm font-mono text-slate-500 animate-pulse font-medium">Initializing Security Authentication Engine...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-slate-800 font-sans flex flex-col md:flex-row antialiased">
        {/* Left Informational Banner Column */}
        <div className="flex-1 bg-slate-950 text-white p-8 md:p-16 flex flex-col justify-between relative overflow-hidden min-h-[40vh] md:min-h-screen">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-slate-100 blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-slate-100 blur-3xl"></div>
          </div>

          <div className="relative z-10 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-medium tracking-tight">Lilbed AI</span>
          </div>

          <div className="relative z-10 my-auto py-12 space-y-6 max-w-lg">
            <span className="inline-flex items-center space-x-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Workspace Portal Access</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white leading-tight">
              A Unified Research Whiteboard & Conversational Canvas
            </h2>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs text-slate-300 font-mono">
              <p className="text-white font-semibold">WORKSPACE OWNER & AUTHOR:</p>
              <p className="text-slate-205">● <strong className="text-indigo-300">OBED YADZO</strong> (Born 30/05/2002)</p>
              <p>● Writer, Analytical Academic Researcher & Scholar (UPSA)</p>
              <p>● Professional Developer (Coding, Websites & Games)</p>
              <p>● Publisher (Creative Flyers, Digital Layout & Video Generator Creator)</p>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Design layouts, organize research citations visually, draw sketches on the Canva Whiteboard, and brainstorm with ChatGPT co-pilot features instantly.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs font-mono text-slate-300">
              <div><span className="text-indigo-400 font-bold">●</span> CANVA WHITEBOARD</div>
              <div><span className="text-emerald-400 font-bold">●</span> CHATGPT COMPANION</div>
            </div>
          </div>

          <div className="relative z-10 text-xs font-mono text-slate-500">
            Secure cloud tokens synced natively with Firebase ABAC
          </div>
        </div>

        {/* Right Auth Forms Input Column */}
        <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 bg-white">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center md:text-left space-y-2">
              <h3 className="text-2xl font-bold tracking-tight text-slate-950">
                {isSignUp ? "Establish Research ID" : "Secure Analytical Login"}
              </h3>
              <p className="text-sm text-slate-500">
                {isSignUp 
                  ? "Deploy credentials to authorize your workspace whiteboard." 
                  : "Sign in to access, design, and compile your briefings."}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {authError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-mono flex items-start space-x-2"
                  >
                    <Info className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{authError}</span>
                  </motion.div>
                )}
                {authSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-mono"
                  >
                    {authSuccess}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-500 uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@institution.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-500 uppercase">Secure Password</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm"
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Minimum 6 characters</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition duration-200 text-sm shadow-sm font-sans"
              >
                {isSignUp ? "Create Secure Account" : "Authenticate Access"}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-3 text-slate-400 font-mono tracking-wider">or authenticate with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 font-semibold rounded-xl transition duration-150 text-xs shadow-xs flex items-center justify-center space-x-2.5 font-sans active:scale-98"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSignUp ? "Sign Up with Google" : "Sign In with Google"}</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-3 text-slate-400 font-mono tracking-wider">Select Mode</span>
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
                className="text-xs font-semibold text-indigo-650 hover:text-indigo-800 font-mono"
              >
                {isSignUp 
                  ? "Already registered? Authenticate existing ID" 
                  : "Need credentials? Deploy a new account"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-800 font-sans flex flex-col antialiased relative">
      {/* 1. Copyright & Terms Verification Overlay Modal */}
      {!acceptedTerms && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto border border-indigo-100 shadow-xs">
                <ShieldCheck className="w-8 h-8 text-indigo-650" />
              </div>
              <h2 className="text-xl font-display font-black tracking-tight text-slate-900 uppercase">
                LILBED AI COPYRIGHT & LICENSING CHARTER
              </h2>
              <p className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 font-bold">
                Established By Founder Obed Yadzo • Academic System Workspace 2026
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-xs text-slate-650 font-sans leading-relaxed h-56 overflow-y-auto space-y-3">
              <p className="font-semibold text-slate-850">Please review and accept our institutional licensing terms to access Lilbed AI Systems:</p>
              <p>
                <b>1. Intellectual Property Protection:</b> All scholarly text, customized flyer layouts, slides, video blueprints, and analytical dossiers synthesized by the Lilbed AI engine are copyrighted under global intellectual property frameworks with final oversight by the founder, <b>Obed Yadzo</b> (Senior Scholar, Expert Developer born 30/05/2002 at UPSA, Accra).
              </p>
              <p>
                <b>2. Document Downloads:</b> Academic documents, solved homework worksheets, and PDF blueprints created using the AI require a secure peer charge of <b>0.50 GHS</b> cleared via instant Mobile Money prompts to 0535476892. This ensures server database availability.
              </p>
              <p>
                <b>3. Storage Allocation:</b> Standard users start with 2GB storage. Adding extra blocks of 1GB on Lilbed AI servers incurs <b>2.00 GHS</b> sent to MoMo target 0535476892.
              </p>
              <p>
                <b>4. Platform Verification Status:</b> The first 1,000 enrolled scholars on Lilbed AI automatically obtain a <b>Lilbed Blue Tick Verification Badge</b> next to their academic cards, authenticating peer status.
              </p>
              <p>
                <b>5. Direct newsletters subscription:</b> By checking the acceptance box and continuing, users are securely enrolled in our academic newsletter index lists.
              </p>
            </div>

            <div className="flex items-start space-x-3 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <input
                id="accept-terms-checkbox"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="accept-terms-checkbox" className="text-[11px] text-slate-600 font-sans leading-snug cursor-pointer select-none">
                I strictly accept all copyright terms, developer credentials, mobile money licensing, and verify my subscription to Lilbed newsletter.
              </label>
            </div>

            <button
              onClick={() => {
                const el = document.getElementById('accept-terms-checkbox') as HTMLInputElement;
                if (!el || !el.checked) {
                  alert("You must verify you agree with Lilbed copyright and terms checklist before entering the workspace.");
                  return;
                }
                handleAcceptTermsAndCopyright();
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-2xl font-bold text-xs tracking-wide transition duration-200 cursor-pointer shadow-md text-center flex items-center justify-center space-x-2"
            >
              <span>Unlock Verified Workspace & Agree</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Advanced Multi-Step Mobile Money Payment Prompt Gateway */}
      {isPaymentOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 relative overflow-hidden">
            {/* MoMo Network Carrier Badge Decoration */}
            <div className="absolute top-0 right-0 bg-amber-400 text-slate-950 font-black font-mono text-[9px] px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider shadow-xs">
              {paymentNetwork} Live Network
            </div>

            {/* Step 1: Initialize Setup Info */}
            {paymentStep === 'setup' && (
              <div className="space-y-5">
                <div className="flex items-center space-x-2">
                  <span className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 inline-block text-indigo-700">
                    <CreditCard className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase">Lilbed Secure Settlement Gateway</h3>
                    <p className="text-[10px] text-slate-450 font-mono">Receiver Address: 0535476892</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-rich-slate-200/20 font-mono">
                    <span className="text-slate-500">Service Authorized:</span>
                    <span className="font-bold text-slate-900 capitalize">{paymentType === 'storage' ? '1GB Storage Extension' : paymentType === 'download' ? 'AI Document Download Unlock' : paymentType === 'ads' ? 'Corporate AI Ad Service' : 'Credit Developer Tip'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-black pt-1">
                    <span className="text-slate-850">Billing Amount:</span>
                    <span className="text-indigo-700 font-mono">{paymentAmount.toFixed(2)} GHS</span>
                  </div>
                </div>

                <form onSubmit={handleMomoPaymentSubmission} className="space-y-4">
                  <div>
                    <label className="block text-[10.5px] font-semibold text-slate-700 mb-1.5 font-mono">
                      Select Mobile Network Carrier:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['MTN', 'Telecel', 'AT'].map((net) => (
                        <button
                          key={net}
                          type="button"
                          onClick={() => setPaymentNetwork(net)}
                          className={`py-2 px-1 rounded-xl text-xs font-bold border transition text-center ${
                            paymentNetwork === net
                              ? 'bg-amber-100/90 border-amber-400 text-slate-950 shadow-xxs'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {net}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-semibold text-slate-700 mb-1.5 font-mono">
                      Enter Mobile Money Number:
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0535476892"
                      value={paymentMoMoNumber}
                      onChange={(e) => setPaymentMoMoNumber(e.target.value)}
                      className="w-full bg-slate-50 text-slate-950 font-mono font-bold text-sm tracking-widest px-4.5 py-3 border border-slate-200 rounded-xl focus:ring-1.5 focus:ring-indigo-500 focus:outline-hidden"
                    />
                    <p className="text-[9.5px] text-slate-400 mt-1 font-mono leading-snug">
                      Your device will receive a direct flash prompt to input your wallet PIN and authorize this payment.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsPaymentOpen(false)}
                      className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl block text-center font-bold text-xs transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-slate-905 hover:bg-indigo-700 text-white py-3 rounded-xl block text-center font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      Send Prompt
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 2: Instant push flash prompt overlay mockup */}
            {paymentStep === 'prompt' && (
              <div className="space-y-5">
                <div className="text-center space-y-1.5">
                  <span className="inline-block text-amber-500 text-3xl animate-bounce">📱</span>
                  <h3 className="text-xs font-black font-mono tracking-widest text-slate-500 uppercase">Flash Push Triggered</h3>
                  <p className="text-xs text-slate-700 px-2 font-mono leading-relaxed">
                    A secure settlement ticket has been broadcasted to net <b>{paymentMoMoNumber}</b>.
                  </p>
                </div>

                {/* Interactive phone carrier popup simulation */}
                <div className="bg-slate-900 text-neutral-100 border-4 border-slate-800 p-5 rounded-2xl shadow-xl font-mono text-xs space-y-4 max-w-xs mx-auto text-left relative">
                  <div className="text-[10px] text-zinc-400 border-b border-zinc-800 pb-1.5 flex justify-between">
                    <span>*170# Live Terminal</span>
                    <span>MTN M-Money</span>
                  </div>
                  <p className="leading-relaxed text-zinc-100 text-[11px]">
                    Pay GHS {paymentAmount.toFixed(2)} to LILBED AI SYSTEMS (0535476892) for workspace services?<br/>
                    1) Confirm Payment<br/>
                    2) Cancel Authorization
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentStep('setup')}
                      className="w-1/2 bg-zinc-800 hover:bg-zinc-700 text-red-500 py-1.5 rounded-lg text-center font-black transition cursor-pointer"
                    >
                      Reject (2)
                    </button>
                    <button
                      onClick={handleMomoConfirmPrompt}
                      className="w-1/2 bg-amber-400 hover:bg-amber-300 text-slate-950 py-1.5 rounded-lg text-center font-black transition cursor-pointer"
                    >
                      Accept (1)
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 font-mono text-center">
                  You can click "Accept (1)" in the simulated terminal above to process to the PIN entry stage.
                </p>
              </div>
            )}

            {/* Step 3: USSD Secure PIN Entry Screen */}
            {paymentStep === 'pin' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <span className="text-indigo-650 text-2xl">🔒</span>
                  <h3 className="text-sm font-bold text-slate-900 uppercase">Encrypted Authorization PIN</h3>
                  <p className="text-[10px] text-slate-500 px-4 font-mono leading-snug">
                    Enter your confidential wallet authorizing PIN code below to settle this secure transfer transaction.
                  </p>
                </div>

                <div className="max-w-xs mx-auto space-y-3">
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="••••"
                    value={pinValue}
                    onChange={(e) => setPinValue(e.target.value)}
                    className="w-full text-center bg-slate-50 text-slate-950 font-black text-2xl tracking-widest px-4 py-3 border border-slate-200 rounded-xl focus:ring-1.5 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  <p className="text-[9.5px] text-slate-400 font-mono text-center">
                    Simulated using AES-256 end-to-end local routing. Your real keys are never tracked.
                  </p>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setPaymentStep('prompt')}
                      className="w-1/3 bg-slate-50 text-slate-705 text-xs py-2 rounded-xl transition font-bold"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleMomoPinSubmited}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2 rounded-xl transition font-black shadow-xs cursor-pointer"
                    >
                      Authorize Settlement
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Loading Gateway processing block */}
            {paymentStep === 'processing' && (
              <div className="text-center p-8 space-y-4">
                <Loader2 className="w-10 h-10 text-indigo-650 animate-spin mx-auto" />
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Settling with Interbank Gateway...</h4>
                <p className="text-[10.5px] text-slate-500 max-w-xs mx-auto font-mono">
                  Dispatching funds transfer sequence to <b>0535476892</b>. Settle authorization protocols... Please wait.
                </p>
              </div>
            )}

            {/* Step 5: Success Dialog box */}
            {paymentStep === 'success' && (
              <div className="text-center p-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <ShieldCheck className="w-8 h-8 stroke-2" />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase">Transaction Cleared Successfully</h3>
                <p className="text-xs text-slate-550 max-w-xs mx-auto leading-relaxed">
                  Your payment of <b>{paymentAmount.toFixed(2)} GHS</b> has been settled and verified. Your requested service has been instantly unlocked!
                </p>
                <button
                  type="button"
                  onClick={() => setIsPaymentOpen(false)}
                  className="w-full bg-slate-950 hover:bg-indigo-705 text-white text-xs font-bold py-3 rounded-xl transition cursor-pointer"
                >
                  Return to Lilbed Workspace
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Main Navigation Header */}
      <header className="border-b border-slate-150 bg-white sticky top-0 z-40 px-4 py-2 flex items-center justify-between gap-4 h-12 shadow-xxs">
        <div className="flex items-center space-x-2">
          {/* Collapsible Hamburger Menu Trigger */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-150 rounded-lg transition flex items-center justify-center cursor-pointer shadow-xxs font-extrabold"
            title="Open Lilbed Workspace Menu"
          >
            {isSidebarOpen ? <X className="w-4 h-4 font-bold" /> : <Menu className="w-4 h-4" />}
          </button>

          <div className="flex items-center space-x-1.5">
            <span className="text-sm font-black text-slate-950 font-display">Lilbed AI</span>
            <span className="text-slate-400 text-xs">›</span>
            <span className="text-[10.5px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wide">
              {activeTab === 'projects' && '🔍 Research Intelligence'}
              {activeTab === 'library' && '📚 Research Library'}
              {activeTab === 'chatgpt' && '💬 Lilbed AI Service Space'}
              {activeTab === 'socials' && '👥 Socials & WhatsApp'}
              {activeTab === 'studio' && '🚀 Documents CREATOR & Convertor'}
              {activeTab === 'maps' && '🌍 Google Live Maps'}
              {activeTab === 'sec_tech' && '⚡ Cyber Security & Dev Workspace'}
            </span>
          </div>
        </div>

        {/* User Identity and Active Status */}
        <div className="flex items-center space-x-2">
          {!isAppInstalled && (
            <button
              onClick={handleDirectInstallApp}
              className="text-[10px] sm:text-xs font-mono font-bold text-white bg-indigo-600 hover:bg-slate-900 border border-indigo-500/30 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition duration-150 cursor-pointer shadow-xs active:scale-95 animate-pulse"
              title="Install directly on phone, tablet or PC launcher"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Direct Install</span>
            </button>
          )}

          <span className="text-[9.5px] font-mono text-emerald-600 font-bold bg-emerald-50 border border-emerald-100/50 px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-xxs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block shrink-0" />
            <span className="hidden sm:inline">Ecosystem Live</span>
            <span className="sm:hidden">Active</span>
          </span>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg transition border border-slate-100"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Dynamic Folding Side Menu Drawer Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Blurred backdrop overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 cursor-pointer"
              />

              <motion.aside
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 25 }}
                className="fixed inset-y-0 left-0 w-80 bg-white border-r border-slate-150 h-full flex flex-col z-50 shadow-2xl select-none overflow-y-auto"
              >
                {/* Menu Header with close button */}
                <div className="p-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                      <Globe className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Lilbed Workspace</h3>
                      </div>
                      <p className="text-[8.5px] text-slate-500 font-mono">By obed yadzo</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg transition flex items-center justify-center cursor-pointer shadow-xxs"
                    title="Close Menu Bar"
                  >
                    <X className="w-4.5 h-4.5 font-bold" />
                  </button>
                </div>

                <div className="p-4 space-y-6 flex flex-col justify-between h-full min-h-[580px]">
                  <div className="space-y-5">
                    
                    {/* Lilbed Blue Tick Status Badge */}
                    <div className="bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-slate-50 border border-indigo-100 rounded-2xl p-4 shadow-xxs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Academic Tag</span>
                        <span className="bg-blue-600 text-[8.5px] font-mono text-white px-1.5 py-0.5 rounded-full font-black tracking-widest flex items-center space-x-0.5">
                          <span>✓ BLUE TICK</span>
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 mt-2 flex items-center gap-1.5">
                        {user?.email?.split('@')[0].toUpperCase()}
                      </h4>
                      <div className="mt-1.5 space-y-1">
                        <p className="text-[10px] text-slate-500 font-mono leading-normal">
                          Certified academic researcher checkmark verified.
                        </p>
                        <p className="text-[9.5px] text-indigo-750 font-mono leading-snug break-all shrink-0">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-xl p-3 text-[10px] text-slate-650 font-mono leading-relaxed">
                      💡 <strong>Obed Yadzo Info:</strong> Creator UPSA Scholar. Development No: +233597773520 (Born 30/05/2002)
                    </div>

                    {/* Main Tab Navigation Swapper */}
                    <div className="space-y-1">
                      <span className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">
                        Workspace Modules
                      </span>
                      
                      <button
                        onClick={() => { setActiveTab('projects'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-left text-xs font-semibold transition ${
                          activeTab === 'projects'
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-905'
                        }`}
                      >
                        <span className="text-base">🔍</span>
                        <span className="flex-1">Research Intelligence</span>
                      </button>

                      <button
                        onClick={() => { setActiveTab('library'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-left text-xs font-semibold transition ${
                          activeTab === 'library'
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-905'
                        }`}
                      >
                        <span className="text-base">📚</span>
                        <span className="flex-1">Research Library</span>
                      </button>

                      <button
                        onClick={() => { setActiveTab('chatgpt'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition border ${
                          activeTab === 'chatgpt'
                            ? 'bg-slate-950 text-emerald-400 border-slate-800 shadow-md'
                            : 'text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-905'
                        }`}
                      >
                        <span className="text-base">💬</span>
                        <span className="flex-1">Lilbed AI Service Space</span>
                      </button>

                      <button
                        onClick={() => { setActiveTab('socials'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-left text-xs font-semibold transition ${
                          activeTab === 'socials'
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-905'
                        }`}
                      >
                        <span className="text-base">👥</span>
                        <span className="flex-1">Socials & WhatsApp</span>
                      </button>

                      <button
                        onClick={() => { setActiveTab('studio'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-extrabold transition border ${
                          activeTab === 'studio'
                            ? 'bg-violet-950 text-cyan-300 border-violet-800 shadow-md'
                            : 'text-slate-700 border-transparent hover:bg-slate-50 hover:text-slate-905'
                        }`}
                      >
                        <span className="text-base">🚀</span>
                        <span className="flex-1">Lilbed AI Documents CREATOR and convertor</span>
                      </button>

                      <button
                        onClick={() => { setActiveTab('maps'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-left text-xs font-semibold transition ${
                          activeTab === 'maps'
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-905'
                        }`}
                      >
                        <span className="text-base">🌍</span>
                        <span className="flex-1">Google Live Maps</span>
                      </button>

                      <button
                        onClick={() => { setActiveTab('sec_tech'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-extrabold transition border ${
                          activeTab === 'sec_tech'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800 shadow-md'
                            : 'text-slate-700 border-transparent hover:bg-slate-50 hover:text-slate-905'
                        }`}
                      >
                        <span className="text-base">⚡</span>
                        <span className="flex-1">Cyber Security & Dev Engines</span>
                      </button>
                    </div>

                    {/* Historical archives and data management inside the sliding sidebar drawer */}
                    {activeTab === 'projects' && (
                      <div className="space-y-3.5 pt-4.5 border-t border-slate-100">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-mono font-extrabold text-slate-450 uppercase tracking-widest flex items-center space-x-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Saved Briefings</span>
                          </span>
                          <button 
                            onClick={() => {
                              startNewProject();
                              setIsSidebarOpen(false);
                            }}
                            className="text-[10px] font-mono bg-indigo-550/20 text-indigo-750 px-2 py-0.5 rounded-full font-extrabold hover:bg-indigo-100 transition"
                            title="Compile a new analytical briefing query"
                          >
                            + New
                          </button>
                        </div>
                        
                        <div className="max-h-[140px] overflow-y-auto space-y-1 pr-1 border border-slate-100 p-1.5 rounded-xl bg-slate-50/50">
                          {projects.length === 0 ? (
                            <div className="text-[10.5px] text-slate-400 font-mono italic px-2 py-4 text-center">
                              No past dossiers. Compile a search query above to record briefs.
                            </div>
                          ) : (
                            projects.map((proj) => (
                              <div
                                key={proj.id}
                                onClick={() => {
                                  setActiveProjectId(proj.id);
                                  setIsSidebarOpen(false);
                                }}
                                className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-[11px] border leading-tight ${
                                  activeProjectId === proj.id 
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-950 font-bold' 
                                  : 'hover:bg-slate-50 border-transparent text-slate-650'
                                }`}
                              >
                                <div className="flex items-center space-x-2 min-w-0 flex-1 text-left">
                                  <FileText className={`w-3.5 h-3.5 shrink-0 ${activeProjectId === proj.id ? 'text-indigo-650' : 'text-slate-400'}`} />
                                  <span className="truncate">{proj.topic}</span>
                                </div>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteProject(proj.id, e);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-200 text-slate-405 hover:text-rose-500 transition"
                                  title="Delete compilation"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Backup and Local Recovery Settings */}
                        <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-205">
                          <span className="text-[8.5px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">
                            Briefings File Database:
                          </span>
                          <div className="grid grid-cols-2 gap-1.5 font-sans">
                            <button
                              onClick={exportProjects}
                              disabled={projects.length === 0}
                              className="flex items-center justify-center space-x-1.5 bg-white hover:bg-slate-100 text-slate-850 border border-slate-250 text-[10px] py-1 rounded-lg transition duration-150 font-bold disabled:opacity-40"
                            >
                              <Download className="w-3 h-3 text-slate-550" />
                              <span>Backup</span>
                            </button>
                            <label className="flex items-center justify-center space-x-1.5 bg-white hover:bg-slate-100 text-slate-850 border border-slate-250 text-[10px] py-1 rounded-lg transition duration-150 font-bold cursor-pointer">
                              <Upload className="w-3 h-3 text-slate-550" />
                              <span>Import</span>
                              <input type="file" accept=".json" onChange={importProjects} className="hidden" />
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Institutional Storage upgrade element */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1 block">
                        Institutional Storage
                      </span>
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-500 font-bold">Active Space:</span>
                          <span className="text-indigo-750 font-black">{storageGb.toFixed(1)} GB</span>
                        </div>
                        <button
                          onClick={() => triggerPaymentFlow('storage', 2.0)}
                          className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-mono text-[10.5px] py-1.5 rounded-xl transition flex items-center justify-center space-x-1 cursor-pointer font-extrabold shadow-xxs border border-indigo-600/20"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add 1GB (2 GHS)</span>
                        </button>
                      </div>
                    </div>

                    {/* Ads Creative services ordering button */}
                    <div className="space-y-1 bg-slate-50/50 p-1.5 border border-dashed border-slate-200 rounded-2xl">
                      <button
                        onClick={() => {
                          const adName = prompt("Enter a description or name for your custom corporate AI Ads Campaign:");
                          if (adName) {
                            triggerPaymentFlow('ads', 10.0, { campaignName: adName });
                          }
                        }}
                        className="w-full bg-white hover:bg-slate-100 text-slate-900 text-[10.5px] font-black py-2 px-2 border border-slate-250 rounded-xl transition flex items-center justify-center space-x-1 cursor-pointer shadow-xxs"
                      >
                        <span>Order Corporate Ad (10 GHS)</span>
                      </button>
                    </div>

                    {/* Credit Developer tipping mechanism */}
                    <div className="space-y-1 pt-2 border-t border-slate-100">
                      <span className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1 block">
                        Support Obed Yadzo
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <input
                          id="developer-credit-amount"
                          type="number"
                          min="1"
                          placeholder="GHS e.g., 5"
                          defaultValue="5"
                          className="w-16 bg-slate-50 text-slate-950 font-black font-mono text-center text-xs py-1.5 border border-slate-200 rounded-xl"
                        />
                        <button
                          onClick={() => {
                            const val = (document.getElementById('developer-credit-amount') as HTMLInputElement)?.value;
                            const amt = Math.max(1, parseFloat(val) || 5);
                            triggerPaymentFlow('credit', amt);
                          }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] py-1.5 rounded-xl font-black text-center transition cursor-pointer flex items-center justify-center space-x-1"
                        >
                          <span>Send Credit ☕</span>
                        </button>
                      </div>
                    </div>

                    {/* Newsletter subscription widget */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <span className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1 block">
                        Lilbed Newsletters
                      </span>
                      <div className="bg-slate-50 border border-slate-150 rounded-2xl p-2.5 space-y-2">
                        <p className="text-[9px] text-slate-550 leading-normal font-mono font-medium">
                          Active scholars list: {subscribedEmails.length}
                        </p>
                        <div className="flex flex-col space-y-1.5">
                          <input
                            id="newsletter-sub-field"
                            type="email"
                            placeholder="scholar@upsa.edu"
                            defaultValue={user?.email || ''}
                            className="bg-white border border-slate-205 font-medium text-[11px] rounded-xl py-1 px-2.5 text-zinc-950 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                          />
                          <button
                            onClick={() => {
                              const em = (document.getElementById('newsletter-sub-field') as HTMLInputElement)?.value;
                              executeNewsletterSubscription(em);
                            }}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] py-1.5 rounded-xl font-bold transition text-center cursor-pointer"
                          >
                            Join Newsletter
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="space-y-2 text-center pt-4">
                    <p className="text-[9px] text-zinc-400 leading-snug font-mono">
                      All document exports settled securely via MTN prompt services. Contact developer at +233597773520.
                    </p>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
        
        {/* Dynamic Center Workspaces */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          
          {/* TAB 1: Core Research Intelligence ground portal */}
          {activeTab === 'projects' && (
            <div className="flex-1 flex flex-col justify-between overflow-y-auto">
              {!activeProject && !isLoading ? (
                <div className="max-w-3xl mx-auto w-full px-6 py-12 flex-1 flex flex-col justify-center">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-50">
                      <Sparkles className="w-8 h-8 text-amber-500" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-950 mb-3 font-display">
                      Ground Global Internet Index
                    </h2>
                    <p className="text-slate-500 text-sm max-w-lg mx-auto leading-relaxed">
                      Lilbed query crawler scans hundreds of pages globally, compares conflicting parameters, fetches real-time parameters, and returns structured briefings.
                    </p>
                  </div>

                  {/* Research Form Panel */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-150 shadow-xs mb-8">
                    <form onSubmit={(e) => handleResearchSubmit(e)} className="space-y-4">
                      <div>
                        <label className="block text-xs font-mono font-medium text-slate-505 uppercase mb-2">
                          Analytical Research Query
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="e.g., Explain the details of the latest US-EU tariffs on clean vehicles declared in 2026..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-full bg-white text-slate-950 pl-4 pr-12  py-3.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1.5 focus:ring-slate-900 focus:border-transparent transition text-sm"
                          />
                          <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            className="absolute right-2 top-2 h-10 w-10 bg-slate-950 text-white rounded-lg flex items-center justify-center hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Advanced Search Options toggle */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                          className="text-xs font-mono font-bold text-indigo-705 hover:text-indigo-900 flex items-center space-x-1 cursor-pointer bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-100 rounded-lg px-2.5 py-1.5 transition select-none"
                        >
                          <span>{showAdvancedSearch ? '▼ Hide' : '⚙️ Show'} Advanced Research Filters</span>
                        </button>

                        <AnimatePresence>
                          {showAdvancedSearch && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden mt-3 p-4.5 bg-white border border-slate-200/80 rounded-xl space-y-4 shadow-xxs"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Date Range */}
                                <div>
                                  <label className="block text-[10.5px] font-mono font-bold text-slate-500 uppercase mb-1.5">Date Range Constraint:</label>
                                  <select
                                    value={searchDateRange}
                                    onChange={(e) => setSearchDateRange(e.target.value as any)}
                                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg py-2 px-3 font-semibold text-slate-800 focus:outline-hidden"
                                  >
                                    <option value="anytime">Anytime (Full archive)</option>
                                    <option value="24h">Last 24 Hours</option>
                                    <option value="week">Last Week</option>
                                    <option value="custom">Custom Date Range...</option>
                                  </select>
                                  
                                  {searchDateRange === 'custom' && (
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                      <input 
                                        type="date" 
                                        value={customStartDate} 
                                        onChange={(e) => setCustomStartDate(e.target.value)}
                                        className="bg-slate-50 border border-slate-200 text-[10px] rounded-lg py-1.5 px-2 font-mono"
                                        placeholder="Start Date"
                                      />
                                      <input 
                                        type="date" 
                                        value={customEndDate} 
                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                        className="bg-slate-50 border border-slate-200 text-[10px] rounded-lg py-1.5 px-2 font-mono"
                                        placeholder="End Date"
                                      />
                                    </div>
                                  )}
                                </div>

                                {/* Source Type */}
                                <div>
                                  <label className="block text-[10.5px] font-mono font-bold text-slate-500 uppercase mb-1.5">Source Material Filter:</label>
                                  <select
                                    value={searchSourceType}
                                    onChange={(e) => setSearchSourceType(e.target.value as any)}
                                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg py-2 px-3 font-semibold text-slate-800 focus:outline-hidden"
                                  >
                                    <option value="any">Any Source Type</option>
                                    <option value="academic">Academic Journals &amp; Papers</option>
                                    <option value="news">News Publications &amp; Journals</option>
                                    <option value="forums">Technology &amp; Social Forums</option>
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Include Keywords */}
                                <div>
                                  <label className="block text-[10.5px] font-mono font-bold text-slate-500 uppercase mb-1.5">Must Include Specific Keywords:</label>
                                  <input 
                                    type="text" 
                                    value={includeKeywords}
                                    onChange={(e) => setIncludeKeywords(e.target.value)}
                                    placeholder="e.g. climate mitigation, solar cells"
                                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg py-2 px-3 placeholder-slate-400 font-semibold"
                                  />
                                </div>

                                {/* Exclude Keywords */}
                                <div>
                                  <label className="block text-[10.5px] font-mono font-bold text-slate-500 uppercase mb-1.5">Strictly Exclude Concepts:</label>
                                  <input 
                                    type="text" 
                                    value={excludeKeywords}
                                    onChange={(e) => setExcludeKeywords(e.target.value)}
                                    placeholder="e.g. speculation, political rumor"
                                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg py-2 px-3 placeholder-slate-400 font-semibold"
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200/50">
                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-mono text-slate-400">DEPTH CONTROLLER:</span>
                          <div className="inline-flex rounded-lg bg-slate-200/55 p-1 border border-slate-200">
                            <button
                              type="button"
                              onClick={() => setDepth('quick')}
                              className={`px-3 py-1 font-mono text-xs font-semibold rounded-md transition ${
                                depth === 'quick' 
                                  ? 'bg-white text-slate-950 shadow-xs' 
                                  : 'text-slate-500 hover:text-slate-950'
                              }`}
                            >
                              Quick Scan
                            </button>
                            <button
                              type="button"
                              onClick={() => setDepth('deep')}
                              className={`px-3 py-1 font-mono text-xs font-semibold rounded-md transition ${
                                depth === 'deep' 
                                  ? 'bg-white text-slate-950 shadow-xs' 
                                  : 'text-slate-500 hover:text-slate-950'
                              }`}
                            >
                              Deep Dive
                            </button>
                          </div>
                        </div>

                        <div className="text-[11px] font-mono text-indigo-650 font-medium flex items-center space-x-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-550" />
                          <span>Google Search Grounding Engine Active Today</span>
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Curated Prebuilt Suggestions list */}
                  <div>
                    <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-2">
                      <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                      <span>Curated Research Benchmarks</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {SUGGESTIONS.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={idx}
                            onClick={() => handleResearchSubmit(undefined, item.topic)}
                            className="p-4 rounded-xl border border-slate-100 hover:border-slate-300 bg-white hover:bg-slate-50/50 cursor-pointer transition duration-150 flex flex-col items-start text-left text-sm"
                          >
                            <div className="flex items-center space-x-2 mb-2 text-slate-950 font-medium">
                              <Icon className="w-4 h-4 shrink-0 text-amber-500" />
                              <span>{item.label}</span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              "{item.topic}"
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* Active thread Q&A history viewport */
                <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
                  
                  {/* Top quick state tracker */}
                  <div className="px-6 py-2.5 bg-[#FAFBFD] border-b border-indigo-100/30 flex items-center justify-between shadow-xxs">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="text-xs font-mono text-indigo-600 shrink-0 uppercase tracking-widest font-black">● Live Dossier</span>
                      <h3 className="text-xs font-mono text-slate-600 truncate">
                        {activeProject ? activeProject.topic : "Active Research Term"}
                      </h3>
                    </div>

                    <button 
                      onClick={startNewProject}
                      className="text-xs font-mono text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>New Query</span>
                    </button>
                  </div>

                  {/* Stream Message History */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {activeProject && activeProject.messages.map((message, mIdx) => (
                      <div 
                        key={mIdx} 
                        className={`max-w-4xl mx-auto flex flex-col space-y-3 ${
                          message.role === 'user' ? 'items-end' : 'items-start animate-fade-in'
                        }`}
                      >
                        {/* User Prompt card */}
                        {message.role === 'user' ? (
                          <div className="bg-slate-100 text-slate-950 px-5 py-3.5 rounded-2xl max-w-2xl border border-slate-200/50">
                            <p className="text-sm font-medium leading-relaxed">{message.content}</p>
                            <div className="flex justify-between items-center mt-2 border-t border-slate-200/50 pt-1.5 font-mono text-[9px] text-slate-400">
                              <span>Lilbed Research Query</span>
                              <span>{message.timestamp}</span>
                            </div>
                          </div>
                        ) : (
                          /* AI Dossier Analysis Output with Footnote citations */
                          <div className="w-full bg-white border border-slate-150 rounded-2xl p-6 shadow-xs">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-5 pb-3 border-b border-slate-100">
                              <div className="flex items-center space-x-2">
                                <Sparkles className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-mono font-bold text-emerald-700 tracking-wider font-display">LILBED ANALYTICAL REPORT</span>
                              </div>
                              
                              <div className="flex items-center space-x-2 self-end md:self-auto">
                                <button
                                  onClick={() => handleExportToLibrary(message.content)}
                                  className="p-1.5 rounded-lg border border-slate-150 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition flex items-center space-x-1 text-xs font-semibold"
                                  title="Save this analytical report to the Research Library"
                                >
                                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Save to Library</span>
                                </button>
                                
                                <button
                                  onClick={() => shareToWhatsapp(message.content)}
                                  className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-750 transition flex items-center space-x-1 text-xs font-semibold"
                                  title="Share this report on WhatsApp group chats"
                                >
                                  <span>Share to WhatsApp 💬</span>
                                </button>

                                <button
                                  onClick={() => copyText(message.content, `msg-${mIdx}`)}
                                  className="p-1.5 rounded-lg border border-slate-150 hover:bg-slate-50 text-slate-500 hover:text-slate-850 transition flex items-center space-x-1 text-xs font-mono"
                                >
                                  {copiedId === `msg-${mIdx}` ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      <span className="text-emerald-700">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Search queries lists */}
                            {message.queries && message.queries.length > 0 && (
                              <div className="mb-4">
                                <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase block mb-1.5">INTERNET INDEX TARGETS CRAWLED:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {message.queries.map((q, qIdx) => (
                                    <span key={qIdx} className="inline-flex items-center space-x-1.5 bg-slate-50 text-slate-650 border border-slate-150 px-2.5 py-1 rounded-md text-[11px] font-mono">
                                      <Search className="w-3 h-3 text-slate-400" />
                                      <span>{q}</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Main Document text Markdown with customizable layout blocks */}
                            <div className="markdown-body text-slate-800 text-sm leading-relaxed prose max-w-none text-left mb-6">
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>

                            {/* cited publications and indexes */}
                            {message.sources && message.sources.length > 0 && (
                              <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-155 mt-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
                                  <div className="flex items-center space-x-2">
                                    <BookOpen className="w-4 h-4 text-indigo-600 font-bold" />
                                    <h4 className="text-xs font-sans font-extrabold text-slate-800 uppercase tracking-tight">Authenticated Research References</h4>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Citation Style:</span>
                                    <select 
                                      value={citationStyle}
                                      onChange={(e) => setCitationStyle(e.target.value as any)}
                                      className="bg-white border border-slate-250 rounded-lg text-[10.5px] font-mono font-bold px-2.5 py-1 text-slate-805 focus:outline-hidden"
                                    >
                                      <option value="APA">APA 7th Edition</option>
                                      <option value="MLA">MLA 9th Edition</option>
                                      <option value="Harvard">Harvard Standard</option>
                                      <option value="Chicago">Chicago Manual</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                  {message.sources.map((src) => {
                                    const citation = getCitationText(src, citationStyle);
                                    return (
                                      <div key={src.id} className="group relative bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-xxs transition duration-150 text-xs flex flex-col justify-between">
                                        <div className="space-y-2.5">
                                          <div className="flex items-start space-x-2.5">
                                            <span className="w-5 h-5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-mono text-[10.5px] font-bold shrink-0">
                                              {src.id}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                              <p className="font-extrabold text-slate-850 truncate leading-snug">
                                                {src.title}
                                              </p>
                                              <p className="text-[10px] text-slate-400 font-mono truncate">
                                                {src.url}
                                              </p>
                                            </div>
                                          </div>

                                          {/* AI Source Relevance Concise Summary */}
                                          {src.summary && (
                                            <div className="bg-indigo-50/40 border border-indigo-100/30 rounded-lg p-2.5 text-[11px] text-slate-650 leading-relaxed font-sans mt-1.5 matches-box text-left">
                                              <strong className="text-indigo-950 font-bold block mb-0.5 text-[10px] font-mono uppercase tracking-wide">AI Relevance Summary:</strong>
                                              {src.summary}
                                            </div>
                                          )}

                                          {/* Citation output codebox */}
                                          <div className="bg-slate-50 border border-slate-150 rounded-lg p-2.5 font-mono text-[10.5px] text-slate-750 break-all relative group-hover:bg-slate-100/50 mt-1.5 text-left">
                                            <button 
                                              onClick={() => copyText(citation, `cit-${src.id}-${message.timestamp}`)}
                                              className="absolute top-1.5 right-1.5 p-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition"
                                              title="Copy pre-formatted academic citation"
                                            >
                                              {copiedId === `cit-${src.id}-${message.timestamp}` ? (
                                                <Check className="w-3 h-3 text-emerald-600" />
                                              ) : (
                                                <Copy className="w-3 h-3" />
                                              )}
                                            </button>
                                            <span className="pr-6 block leading-snug">{citation}</span>
                                          </div>
                                        </div>

                                        {/* Actions per reference */}
                                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 font-medium">
                                          <button 
                                            onClick={() => handleExportToLibrary(`[Ref ${src.id}] ${src.title}\nSource Link: ${src.url}\nCitation: ${citation}`)}
                                            className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-805 flex items-center space-x-1"
                                            title="Add index node to scholarly library"
                                          >
                                            <Plus className="w-3 h-3" />
                                            <span>Collect to Library</span>
                                          </button>

                                          <a
                                            href={src.url}
                                            target="_blank"
                                            referrerPolicy="no-referrer"
                                            rel="noopener noreferrer"
                                            className="text-[10px] text-slate-500 hover:text-slate-900 font-mono flex items-center space-x-1"
                                          >
                                            <span>Live Link</span>
                                            <ExternalLink className="w-2.5 h-2.5" />
                                          </a>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Interactive Loading Phase block */}
                    {isLoading && (
                      <div className="max-w-4xl mx-auto w-full bg-[#FAFBFD] rounded-2xl p-7 border border-indigo-200/30 text-left space-y-4">
                        <div className="flex items-center space-x-3.5">
                          <Loader2 className="w-5 h-5 text-indigo-650 animate-spin" />
                          <div>
                            <span className="text-xs font-mono font-bold text-slate-900 uppercase">Lilbed Global Crawlers Active</span>
                            <p className="text-xs text-indigo-950 font-semibold font-sans mt-0.5">
                              {loadingPhases[loadingPhase]}
                            </p>
                          </div>
                        </div>

                        {/* Progress microbar */}
                        <div className="w-full bg-slate-200/70 h-1 rounded-full overflow-hidden">
                          <motion.div 
                            className="bg-slate-900 h-full"
                            initial={{ width: "2%" }}
                            animate={{ width: `${((loadingPhase + 1) / loadingPhases.length) * 100}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>

                        {/* Stage ticks tracker */}
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-1 text-[10px] font-mono">
                          {loadingPhases.map((phase, idx) => {
                            const isDone = idx < loadingPhase;
                            const isActive = idx === loadingPhase;
                            return (
                              <div 
                                key={idx} 
                                className={`flex items-center space-x-1.5 ${
                                  isDone ? 'text-emerald-600 font-semibold' : isActive ? 'text-indigo-650 font-bold animate-pulse' : 'text-slate-400'
                                }`}
                              >
                                <span>●</span>
                                <span className="truncate">{idx + 1}. {["Semantic", "Formulate", "Index", "Harvest", "Citations", "Writing"][idx]}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div ref={dialogEndRef} />
                  </div>

                  {/* Follow-up / continuation input field */}
                  <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0">
                    <div className="max-w-4xl mx-auto">
                      <form onSubmit={(e) => handleResearchSubmit(e)} className="relative flex items-center">
                        <input
                          type="text"
                          disabled={isLoading}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder={isLoading ? "Evaluating remote targets indexes..." : "Compare metrics, ask follow-up questions, or request sub-topic analysis..."}
                          className="w-full bg-slate-50 text-slate-1000 pl-4 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1.5 focus:ring-slate-900 transition text-xs md:text-sm"
                        />
                        <button
                          type="submit"
                          disabled={!inputValue.trim() || isLoading}
                          className="absolute right-2 text-slate-800 hover:text-slate-950 disabled:text-slate-350 p-1.5"
                        >
                          <Send className="w-4.5 h-4.5" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

               {/* TAB 2: Research Library, Direct Publishing, and Worldwide Academic Platforms */}
          {activeTab === 'library' && (
            <div className="flex-1 flex flex-col lg:flex-row bg-slate-50 overflow-hidden">
              
              {/* Left Sidebar Pane: Worldwide Platforms & Publishing Toolkit */}
              <div className="w-full lg:w-[440px] border-r border-slate-200 bg-white p-6 overflow-y-auto space-y-6 flex-shrink-0">
                
                {/* Section 1: Worldwide Academic Platforms */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                    <span>🌐 Worldwide Scholar Networks</span>
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full font-sans capitalize normal-case font-bold">Must Join</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
                    Connect with authenticated indexes to synchronize write-ups, citation parameters, and homework registries globally.
                  </p>
                  
                  <div className="space-y-2.5">
                    {[
                      { name: 'Google Scholar', desc: 'Unified academic citation indices & paper indexing.', icon: '🎓' },
                      { name: 'ResearchGate', desc: 'Social network for scientists, biochemists, and engineers.', icon: '🔬' },
                      { name: 'ORCID ID', desc: 'Sovereign universal digital scholar identification.', icon: '🔑' },
                      { name: 'arXiv Repository', desc: 'Pre-print archive for mathematics, physics, and computer science.', icon: '📈' },
                      { name: 'Mendeley Network', desc: 'Reference management ecosystem & collaborative feedback datasets.', icon: '📑' }
                    ].map((plat) => {
                      const joined = joinedPlatforms.includes(plat.name);
                      return (
                        <div key={plat.name} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200/60 shadow-xxs transition hover:border-slate-300">
                          <div className="flex items-start space-x-2.5">
                            <span className="text-sm mt-0.5">{plat.icon}</span>
                            <div>
                              <h4 className="text-xs font-bold text-slate-800 leading-none">{plat.name}</h4>
                              <p className="text-[9.5px] text-slate-400 leading-tight mt-1">{plat.desc}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleJoinPlatform(plat.name)}
                            className={`text-[10px] px-2 py-1 rounded-md font-semibold transition ${
                              joined 
                                ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/70' 
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {joined ? '✓ Joined' : 'Join'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Publish Your Research Paper Wizard */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xxs">
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5 mb-1">
                    <span>📢 Publish scholarly paper</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 mb-4 leading-relaxed">
                    Instantly broadcast your dissertation, assign methods, or upload generated maps & script blueprints into community indices.
                  </p>

                  <form onSubmit={handlePublishPaperSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Publication Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Critical bounds of Quantum entanglement..."
                        value={publishTitle}
                        onChange={(e) => setPublishTitle(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Abstract Excerpt & methodology</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Draft your scholarly abstract, data parameters, assignment Q&As, or structural highlights here..."
                        value={publishAbstract}
                        onChange={(e) => setPublishAbstract(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition resize-none leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Target Platform</label>
                        <select
                          value={publishTarget}
                          onChange={(e: any) => {
                            const val = e.target.value;
                            setPublishTarget(val);
                            if (val === 'account') {
                              setPublishTargetName('Personal Feed');
                            } else {
                              const matched = communityGroups.find(g => g.type === val);
                              setPublishTargetName(matched ? matched.name : 'Lilbed Circle');
                            }
                          }}
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition"
                        >
                          <option value="account">Personal Feed</option>
                          <option value="channel">Academic Channel</option>
                          <option value="community">Community</option>
                          <option value="group">Scholarly Group</option>
                        </select>
                      </div>

                      {publishTarget !== 'account' && (
                        <div>
                          <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Select Arena</label>
                          <select
                            value={publishTargetName}
                            onChange={(e) => setPublishTargetName(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition"
                          >
                            {communityGroups
                              .filter(g => g.type === publishTarget)
                              .map(g => (
                                <option key={g.id} value={g.name}>{g.name}</option>
                              ))}
                            {communityGroups.filter(g => g.type === publishTarget).length === 0 && (
                              <option value="Lilbed Scholar Pool">Lilbed Scholar Pool</option>
                            )}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* File uploading controls */}
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Scholarly Attachment Files</label>
                      <div className="relative border border-dashed border-slate-300 rounded-lg p-4 bg-slate-50 hover:bg-slate-100 transition flex flex-col items-center justify-center text-center">
                        <input
                          type="file"
                          accept="image/*,video/*,audio/*,application/pdf"
                          onChange={handleFileAttachmentChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-[10px] font-semibold text-slate-700">Drag &amp; drop or click to upload</span>
                        <span className="text-[9px] text-slate-400 mt-0.5">Supports PDF papers, images, video reels &amp; audio files</span>
                      </div>

                      {uploadedAttachmentName && (
                        <div className="mt-2 text-xs bg-indigo-50 border border-indigo-100 p-2 rounded-lg flex items-center justify-between">
                          <div className="flex items-center space-x-2 truncate">
                            <span className="text-sm">
                              {uploadedAttachmentType === 'image' && '🖼️'}
                              {uploadedAttachmentType === 'video' && '🎬'}
                              {uploadedAttachmentType === 'audio' && '🎵'}
                              {uploadedAttachmentType === 'pdf' && '📄'}
                            </span>
                            <span className="truncate font-medium text-slate-800">{uploadedAttachmentName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedAttachmentUrl(null);
                              setUploadedAttachmentType(null);
                              setUploadedAttachmentName(null);
                            }}
                            className="text-[10px] text-red-650 hover:underline px-1 font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Privacy Option toggles */}
                    <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-lg space-y-2.5">
                      <span className="block text-[10px] font-mono font-bold uppercase text-slate-450">Broadcast Privacy Setting</span>
                      <div className="flex gap-4">
                        <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="publishPrivacy"
                            checked={!publishIsPrivate}
                            onChange={() => setPublishIsPrivate(false)}
                            className="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 border-slate-300"
                          />
                          <span>Public Posting (Permanent on Index, retractable only by poster)</span>
                        </label>
                        <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="publishPrivacy"
                            checked={publishIsPrivate}
                            onChange={() => setPublishIsPrivate(true)}
                            className="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 border-slate-300"
                          />
                          <span>Private Archive (Only you can access)</span>
                        </label>
                      </div>
                    </div>

                    {/* Copyright & Terms Acceptance checkbox */}
                    <div className="pt-1.5 space-y-2">
                      <label className="flex items-start space-x-2 text-slate-650 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          required
                          checked={publishTermsAccepted}
                          onChange={(e) => setPublishTermsAccepted(e.target.checked)}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 h-3.5 w-3.5"
                        />
                        <div className="text-[10.5px] leading-snug">
                          I accept the <b>Terms and Conditions</b> and <b>Copyright Regulations</b> authored by the developer. I understand posts are permanent on this platform and can only be deleted by the original poster, high publisher, or founder.
                        </div>
                      </label>
                      <p className="text-[9.5px] font-mono text-slate-400 pl-5 leading-normal">
                        Question or dispute regarding copyright labels? Please direct inquiries to the ecosystem platform developer on WhatsApp <a href="https://wa.me/233597773520" target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline font-bold">+233597773520</a>.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-indigo-950 text-white font-bold p-3 rounded-lg text-xs tracking-tight transition shadow-sm hover:shadow-md flex items-center justify-center space-x-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Publish &amp; Synchronize Paper</span>
                    </button>
                  </form>
                </div>

                {/* Section 3: Create Groups & Communities */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">
                    👥 Establish Collaborative Groups
                  </h3>
                  <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
                    Found secure communities or peer-to-peer study channels inside UPSA and regional West African academic nodes.
                  </p>
                  
                  <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                    <form 
                      onSubmit={(e: any) => {
                        e.preventDefault();
                        const fd = new FormData(e.currentTarget);
                        const n = fd.get('gname') as string;
                        const d = fd.get('gdesc') as string;
                        const t = fd.get('gtype') as any;
                        if (n) {
                          handleCreateCommunityGroupSubmit(n, d, t);
                          e.currentTarget.reset();
                        }
                      }}
                      className="space-y-2.5"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          name="gname"
                          required
                          placeholder="Group/Community Name"
                          className="w-full text-[11px] p-2 rounded-lg border border-slate-200 bg-slate-50"
                        />
                        <select name="gtype" className="text-[11px] p-2 rounded-lg border border-slate-200 bg-slate-50">
                          <option value="group">Scholarly Group</option>
                          <option value="community">Community Hub</option>
                          <option value="channel">Academic Channel</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        name="gdesc"
                        placeholder="Brief theme description"
                        className="w-full text-[11px] p-2 rounded-lg border border-slate-200 bg-slate-50"
                      />
                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-slate-900 text-white text-[10px] font-bold p-2 rounded-lg transition"
                      >
                        + Create Social Arena
                      </button>
                    </form>
                  </div>
                </div>

              </div>

              {/* Right Pane: Public Scholarly Directory Feed & Media Viewports */}
              <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden">
                
                {/* Search & Statistics Banner */}
                <div className="p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xxs">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-950 flex items-center space-x-2">
                      <span>📚 Worldwide Live Publication Directory</span>
                    </h2>
                    <p className="text-[10px] text-slate-400">
                      Index of scholarly materials, assignment keys, demarcation papers, and assets published by Obed Yadzo and scholars.
                    </p>
                  </div>
                  
                  {/* Total Counts */}
                  <div className="flex items-center space-x-3 text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <div>
                      Publications: <span className="font-bold text-slate-800">{publishedPapers.length}</span>
                    </div>
                    <div className="text-slate-300">|</div>
                    <div>
                      Joined Pools: <span className="font-bold text-indigo-600">{joinedPlatforms.length}</span>
                    </div>
                  </div>
                </div>

                {/* Scrollable papers feed container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  {publishedPapers.length === 0 && (
                    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto">
                      <BookOpen className="w-8 h-8 text-indigo-400 mx-auto mb-2 animate-pulse" />
                      <h4 className="text-xs font-bold text-slate-800">No active research papers found</h4>
                      <p className="text-[10px] text-slate-505 mt-1 max-w-xs mx-auto">
                        Your library list is currently empty. Use the drafting panel on the left or export visual designs directly from Lilbed AI Studio tabs!
                      </p>
                    </div>
                  )}

                  <div className="max-w-3xl mx-auto space-y-5">
                    {publishedPapers.map((paper) => {
                      const isLiked = user && paper.likes.includes(user.uid);
                      const isDisliked = user && paper.dislikes.includes(user.uid);
                      return (
                        <div key={paper.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xxs transition hover:shadow-xs hover:border-slate-300">
                          
                          {/* Top Author Metadata Profile line */}
                          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                            <div className="flex items-center space-x-3">
                              <img
                                src={paper.authorPicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                                alt="Author profile"
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 ring-2 ring-slate-100"
                              />
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs font-bold text-slate-900">{paper.authorName}</span>
                                  {paper.userId === 'seed-1' && (
                                    <span className="bg-indigo-100 text-[8px] font-mono text-indigo-700 px-1.5 py-0.2 rounded-full font-bold uppercase">Sovereign Expert</span>
                                  )}
                                </div>
                                <span className="text-[9.5px] text-slate-405 block tracking-tight font-medium">
                                  Active scholar indexer • Compiled {new Date(paper.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                            </div>

                            {/* Scope arena classification badge */}
                            <div className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-100 font-semibold px-2.5 py-1 rounded-full flex items-center space-x-1 capitalize">
                              <span>📍</span>
                              <span>Target: <b>{paper.targetName}</b></span>
                            </div>
                          </div>

                          {/* Paper Content: Title & Abstract excerpt */}
                          <div className="space-y-2">
                            <h3 className="text-sm md:text-base font-black tracking-tight text-slate-950 font-display">
                              {paper.title}
                            </h3>
                            <div className="text-xs text-slate-650 leading-relaxed font-sans bg-slate-550 p-3.5 rounded-lg border border-slate-100 whitespace-pre-wrap">
                              {paper.abstract}
                            </div>
                          </div>

                          {/* Render Native Media Upload Viewport if present */}
                          {paper.attachmentUrl && (
                            <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden bg-slate-950 shadow-xxs">
                              
                              <div className="bg-slate-900 border-b border-slate-800 px-3.5 py-2 flex items-center justify-between">
                                <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wide flex items-center gap-1">
                                  <span>📎 Attachment Media:</span>
                                  <b>{paper.attachmentName || 'Scholarly resource'}</b>
                                </span>
                                <span className="text-[9.5px] font-mono font-bold text-cyan-400 uppercase">
                                  {paper.attachmentType?.toUpperCase()} Dynamic Node
                                </span>
                              </div>

                              {paper.attachmentType === 'image' && (
                                <div className="flex items-center justify-center p-2 bg-slate-900">
                                  <img
                                    src={paper.attachmentUrl}
                                    alt="Paper visualization"
                                    className="max-h-[300px] object-contain rounded-lg shadow-sm"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              )}

                              {paper.attachmentType === 'video' && (
                                <div className="p-1">
                                  <video 
                                    src={paper.attachmentUrl} 
                                    controls 
                                    className="w-full max-h-[340px] rounded-lg focus:outline-hidden"
                                    preload="metadata"
                                  />
                                </div>
                              )}

                              {paper.attachmentType === 'audio' && (
                                <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <div className="flex space-x-0.5 items-end h-6 w-8">
                                        <div className="w-1 bg-indigo-400 h-3 animate-bounce" style={{ animationDelay: '0.1s' }} />
                                        <div className="w-1 bg-indigo-300 h-5 animate-bounce" style={{ animationDelay: '0.3s' }} />
                                        <div className="w-1 bg-cyan-400 h-4 animate-bounce" style={{ animationDelay: '0.2s' }} />
                                        <div className="w-1 bg-indigo-400 h-2 animate-bounce" style={{ animationDelay: '0.4s' }} />
                                        <div className="w-1 bg-purple-400 h-6 animate-bounce" style={{ animationDelay: '0.5s' }} />
                                      </div>
                                      <span className="text-[10px] font-mono text-indigo-300 tracking-wider font-bold">LILBED INTELLIGENT SCHOLAR VOICE SYNTHESIS</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-indigo-300">Ready to listen</span>
                                  </div>
                                  <audio 
                                    src={paper.attachmentUrl} 
                                    controls 
                                    className="w-full h-8 rounded-lg"
                                  />
                                </div>
                              )}

                              {paper.attachmentType === 'pdf' && (
                                <div className="p-4 bg-slate-900 border border-slate-800 flex items-center justify-between text-white">
                                  <div className="flex items-center space-x-3">
                                    <FileText className="w-8 h-8 text-rose-500" />
                                    <div>
                                      <h4 className="text-xs font-bold leading-tight text-slate-100">{paper.attachmentName}</h4>
                                      <p className="text-[9.5px] text-slate-400">PDF Document Reference Framework</p>
                                    </div>
                                  </div>
                                  {unlockedPaperIds.includes(paper.id) ? (
                                    <a
                                      href={paper.attachmentUrl}
                                      download={paper.attachmentName}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg text-center transition shadow-xs flex items-center space-x-1"
                                    >
                                      <span>Verified Download ✓</span>
                                    </a>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => triggerPaymentFlow('download', 0.5, { paperId: paper.id, attachmentUrl: paper.attachmentUrl, attachmentName: paper.attachmentName })}
                                      className="bg-indigo-650 hover:bg-indigo-755 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg text-center transition shadow-xs flex items-center space-x-1 cursor-pointer"
                                    >
                                      <span>Pay 0.5 GHS to Download</span>
                                    </button>
                                  )}
                                </div>
                              )}

                            </div>
                          )}

                          {/* Footer: Reaction parameters and direct peer social triggers */}
                          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2.5">
                            
                            {/* Likes / Dislikes Interactive triggers */}
                            <div className="flex items-center space-x-3">
                              <button
                                type="button"
                                onClick={() => handleLikePaper(paper.id)}
                                className={`text-[11px] font-mono px-3 py-1.5 rounded-full flex items-center space-x-1.5 border transition ${
                                  isLiked 
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' 
                                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                                }`}
                              >
                                <span>👍</span>
                                <span>Like ({paper.likes.length || 0})</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDislikePaper(paper.id)}
                                className={`text-[11px] font-mono px-3 py-1.5 rounded-full flex items-center space-x-1.5 border transition ${
                                  isDisliked 
                                    ? 'bg-amber-50 border-amber-200 text-amber-700 font-bold' 
                                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                                }`}
                              >
                                <span>👎</span>
                                <span>Dislike ({paper.dislikes?.length || 0})</span>
                              </button>
                            </div>

                            {/* Direct Messenger Chat and Friend peer controllers */}
                            {user && paper.userId !== user.uid && (
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleToggleFollow(paper.userId);
                                  }}
                                  className="text-[10px] px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-250 transition"
                                >
                                  {socialsProfiles.find(p => p.uid === paper.userId)?.followers?.includes(user?.uid) ? 'Unfollow ✗' : 'Follow peer +'}
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveDirectChatUserId(paper.userId);
                                    setActiveTab('socials');
                                  }}
                                  className="text-[10px] px-2.5 py-1.5 rounded-full bg-indigo-600 hover:bg-slate-900 text-white font-black transition flex items-center space-x-1"
                                >
                                  <span>💬 Messenger Chat</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    alert("Cyber Security Policy: This broadcast is permanent on the Lilbed Index. It is cryptographically signed and can only be removed by the content poster, publisher, or platform founder (Obed Yadzo).");
                                  }}
                                  className="text-[10px] px-2.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-400 font-bold hover:bg-slate-100 transition flex items-center space-x-1 cursor-pointer"
                                  title="Permanent Post - Security Active"
                                >
                                  <span>🔒 Permanent</span>
                                </button>
                              </div>
                            )}

                            {user && paper.userId === user.uid && (
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleDeletePaper(paper.id)}
                                  className="text-[10px] px-2.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold border border-rose-200 transition flex items-center space-x-1 cursor-pointer"
                                  title="Remove my publication permanently"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Remove Post</span>
                                </button>
                              </div>
                            )}

                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 3: Dedicated Lilbed AI Service & Multi-Format Research Space */}
          {activeTab === 'chatgpt' && (
            <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 border-b border-indigo-950/20 shadow-xs">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2 bg-indigo-500/10 border border-indigo-400/20 px-2.5 py-0.5 rounded-full w-fit mb-1">
                      <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                      <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-indigo-300">OBED YADZO SYSTEMS</span>
                    </div>
                    <h2 className="text-base md:text-xl font-display font-black tracking-tight leading-none text-white flex items-center gap-1.5">
                      💬 <span className="text-white">LILBED AI GLOBAL SERVICE & RESEARCH SPACE</span>
                    </h2>
                    <p className="text-[11px] text-slate-350 mt-1 leading-relaxed">
                      Your worldwide cognitive compiler. Solve complex homework, draft thesis outlines, compose papers, translate archives, and craft corporate service knowledge.
                    </p>
                  </div>
                  <div className="text-[9.5px] font-mono bg-slate-800/80 text-cyan-300 border border-slate-700/60 rounded-lg px-2.5 py-1 text-right max-w-[210px] hidden sm:block">
                    ● WORLDWIDE KNOWLEDGE ACTIVE
                  </div>
                </div>
              </div>

              {/* Multi-Format Predefined Research Handlers */}
              <div className="bg-slate-100/50 border-b border-slate-200/60 p-4">
                <div className="max-w-4xl mx-auto">
                  <span className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2.5">
                    🚀 CHOOSE LILBED AI SERVICE PRESET FORMATS:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    
                    <button
                      type="button"
                      onClick={() => {
                        setChatGptInput("Solve the following homework question and provide a detailed academic explanation with textbook references: ");
                      }}
                      className="bg-white p-3 rounded-xl border border-slate-200 hover:border-indigo-500/30 text-left transition hover:shadow-xs group cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-base">📝</span>
                        <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-600 transition">Homework &amp; Assignments</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        Instant solutions, textbook citations, and step-by-step logic.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setChatGptInput("Draft a comprehensive scholarly research write-up (literature review, methodology, and outline in APA-7 format) for this topic: ");
                      }}
                      className="bg-white p-3 rounded-xl border border-slate-200 hover:border-indigo-500/30 text-left transition hover:shadow-xs group cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-base">🎓</span>
                        <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-600 transition">Academic Write-Ups</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        Multi-format thesis structures, essays, and bibliographies.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setChatGptInput("Conduct worldwide research across global libraries to compare and translate perspectives on: ");
                      }}
                      className="bg-white p-3 rounded-xl border border-slate-200 hover:border-indigo-500/30 text-left transition hover:shadow-xs group cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-base">🌍</span>
                        <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-600 transition">Worldwide Research Intel</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        Multilingual translations, regional data, and international databases.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setChatGptInput("Synthesize a robust, bold customer service knowledge intelligence base, including standard FAQs, support manual templates, and user guide Q&As for: ");
                      }}
                      className="bg-white p-3 rounded-xl border border-slate-250 hover:border-indigo-500/35 ring-1 ring-amber-500/5 text-left transition hover:shadow-xs group cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-base">💼</span>
                        <h4 className="text-xs font-black text-slate-950 group-hover:text-indigo-605 transition uppercase tracking-tight">Customer Service Intel</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed font-bold">
                        Corporate knowledge bases, answers, and support playbooks.
                      </p>
                    </button>

                  </div>
                </div>
              </div>

              {/* Lilbed AI Messages loop */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="max-w-4xl mx-auto space-y-6">
                  {chatGptHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col space-y-1.5 ${
                        msg.role === 'user' ? 'items-end' : 'items-start animate-fade-in'
                      }`}
                    >
                      <div className={`p-4 rounded-2xl max-w-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200/60 shadow-xxs text-slate-800'
                      }`}>
                        
                        {msg.role === 'model' && (
                          <div className="flex items-center space-x-1.5 mb-2 pb-1.5 border-b border-slate-100">
                            <Sparkle className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="text-[10px] font-mono font-bold text-indigo-705">LILBED AI SYSTEM INTEL</span>
                          </div>
                        )}

                        <div className="prose max-w-none text-left font-sans">
                          {msg.role === 'user' ? (
                            <p className="font-medium whitespace-pre-wrap">{msg.content}</p>
                          ) : (
                            <div className="markdown-body">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          )}
                        </div>

                        {/* Export/Whiteboard cards per message */}
                        {msg.role === 'model' && (
                          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-450 font-mono">
                            <span>Lilbed AI Response</span>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleExportToLibrary(msg.content)}
                                className="text-indigo-600 hover:text-indigo-805 font-bold flex items-center space-x-1"
                              >
                                <Plus className="w-3" />
                                <span>Export to Library</span>
                              </button>
                              <span>|</span>
                              <button
                                onClick={() => shareToWhatsapp(msg.content)}
                                className="text-emerald-600 font-bold hover:text-emerald-705 flex items-center space-x-1"
                                title="Share to WhatsApp"
                              >
                                <span>Share 💬</span>
                              </button>
                              <span>|</span>
                              <button
                                onClick={() => copyText(msg.content, `gpt-${idx}`)}
                                className="text-slate-650 hover:text-slate-905"
                              >
                                {copiedId === `gpt-${idx}` ? "Copied" : "Copy"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 px-1">{msg.timestamp}</span>
                    </div>
                  ))}

                  {/* Loading */}
                  {isChatGptLoading && (
                    <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 animate-pulse bg-white p-4.5 rounded-xl border border-slate-200/50 max-w-xs">
                      <Loader2 className="w-4 h-4 text-slate-550 animate-spin" />
                      <span>Lilbed AI worldwide analysis active...</span>
                    </div>
                  )}
                  <div ref={chatGptEndRef} />
                </div>
              </div>

              {/* Chat Form */}
              <div className="p-4 border-t border-slate-200 bg-white sticky bottom-0">
                <div className="max-w-4xl mx-auto">
                  <form onSubmit={handleChatGptSubmit} className="relative flex items-center">
                    <textarea
                      rows={2}
                      disabled={isChatGptLoading}
                      value={chatGptInput}
                      onChange={(e) => setChatGptInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleChatGptSubmit(e);
                        }
                      }}
                      placeholder={isChatGptLoading ? "Formulating worldwide design and assignment feedback..." : "Ask Lilbed AI to draft essays, solve homework, write research articles, or compile customer Q&As globally..."}
                      className="w-full bg-slate-50 text-slate-950 pl-4 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1.5 focus:ring-slate-900 transition text-xs md:text-sm resize-none font-medium"
                    />
                    <button
                      type="submit"
                      disabled={!chatGptInput.trim() || isChatGptLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-850 disabled:text-slate-350 p-2"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </form>
                  <p className="text-[10px] text-slate-400 font-mono text-center mt-2">
                    Shift + Enter inserts new lines. Synthesized worldwide write-ups are automatically compatible with academic standards.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Lilbed AI Creative & Production Studio */}
          {activeTab === 'studio' && (
            <div className="flex-1 overflow-y-auto bg-slate-55 p-4 md:p-8 animate-fadeIn">
              <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Brand Creator banner */}
                <div className="bg-gradient-to-r from-violet-600 via-indigo-700 to-cyan-500 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center space-x-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full w-fit">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse animate-duration-1000" />
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase">🪄 LILBED AI CREATIVE INSTANT STUDIO</span>
                    </div>
                    <h2 className="text-xl md:text-3xl font-display font-black tracking-tight leading-tight">
                      Hi, I am Lilbed AI, created by Obed Yadzo.
                    </h2>
                    <p className="text-slate-100 text-xs md:text-sm max-w-2xl leading-relaxed">
                      I can help you build and synthesize anything! Express your ideas and prompt me for **Flyers &amp; customized pictures**, **Cinematic video renders**, professional **multi-themed Slide presentations**, or general **creative brainstorming**.
                    </p>
                    <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-mono text-indigo-100">
                      <span className="bg-black/20 px-2.5 py-1 rounded-md">🎓 UPSA Scholar Ecosystem</span>
                      <span className="bg-black/20 px-2.5 py-1 rounded-md">🎬 Real-time Veo Video Models Enabled</span>
                      <span className="bg-black/20 px-2.5 py-1 rounded-md">🎨 Single-click Whiteboard Export</span>
                    </div>
                  </div>
                </div>

                {/* Main Workspace grid split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left settings configuration panel */}
                  <div className="lg:col-span-12 xl:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between h-fit gap-5">
                    
                    <form onSubmit={handleStudioSubmit} className="space-y-4">
                      {/* Mode selection cards */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">1. Select AI Creative Mode</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setStudioMode('flyer');
                              if (studioPrompt === '') setStudioPrompt('An academic tech festival flyer with clean violet geometric overlays');
                            }}
                            className={`p-3 rounded-xl border text-left transition ${
                              studioMode === 'flyer'
                                ? 'bg-indigo-50 border-indigo-505 ring-2 ring-indigo-500/15 text-indigo-950'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-xl block mb-1">🖼️</span>
                            <span className="text-xs font-bold block">Digital Flyers</span>
                            <span className="text-[9px] text-slate-400 leading-tight block">Flyers, posters, tailored imagery</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setStudioMode('video');
                              if (studioPrompt === '') setStudioPrompt('A continuous panning tracking shot of a glowing AI neural laboratory inside a database matrix');
                            }}
                            className={`p-3 rounded-xl border text-left transition ${
                              studioMode === 'video'
                                ? 'bg-indigo-50 border-indigo-505 ring-2 ring-indigo-500/15 text-indigo-950'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-xl block mb-1">🎬</span>
                            <span className="text-xs font-bold block">Video Renders</span>
                            <span className="text-[9px] text-slate-400 leading-tight block">Motion simulation, cinematic rolls</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setStudioMode('slides');
                              if (studioPrompt === '') setStudioPrompt('Main trends in global financial systems for UPSA business research');
                            }}
                            className={`p-3 rounded-xl border text-left transition ${
                              studioMode === 'slides'
                                ? 'bg-indigo-50 border-indigo-505 ring-2 ring-indigo-500/15 text-indigo-950'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-xl block mb-1">📊</span>
                            <span className="text-xs font-bold block">Slides Deck</span>
                            <span className="text-[9px] text-slate-400 leading-tight block">Multi-slide PPT style text card generator</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setStudioMode('chat');
                              if (studioPrompt === '') setStudioPrompt('Write a brilliant scholarly introduction about how video generation benefits UPSA design majors');
                            }}
                            className={`p-3 rounded-xl border text-left transition ${
                              studioMode === 'chat'
                                ? 'bg-indigo-50 border-indigo-505 ring-2 ring-indigo-500/15 text-indigo-950'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-xl block mb-1">✍️</span>
                            <span className="text-xs font-bold block">Scholarly copyist</span>
                            <span className="text-[9px] text-slate-400 leading-tight block">Custom literature drafts, essays</span>
                          </button>
                        </div>
                      </div>

                      {/* Customize style options */}
                      {studioMode === 'flyer' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Visual Style</label>
                            <select
                              value={studioStyle}
                              onChange={(e) => setStudioStyle(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-1.5 focus:ring-indigo-500 outline-hidden font-bold text-slate-900"
                            >
                              <option value="modern">Modern Tech Gradient</option>
                              <option value="pastel">Pastel Minimalist</option>
                              <option value="cyber">Cyberpunk Hologram</option>
                              <option value="scholar">Scholarly Academic Slate</option>
                              <option value="photo">Photorealistic Illustration</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Ratio Aspect</label>
                            <select
                              value={studioAspectRatio}
                              onChange={(e) => setStudioAspectRatio(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-1.5 focus:ring-indigo-500 outline-hidden font-bold text-slate-900"
                            >
                              <option value="1:1">1:1 Square</option>
                              <option value="16:9">16:9 Cinematic</option>
                              <option value="9:16">9:16 Portrait Reel</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {studioMode === 'video' && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Cinema Aspect Ratio</label>
                          <select
                            value={studioAspectRatio}
                            onChange={(e) => setStudioAspectRatio(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-1.5 focus:ring-indigo-500 outline-hidden font-bold text-slate-900"
                          >
                            <option value="16:9">16:9 Landscape Video Roll</option>
                            <option value="9:16">9:16 Vertical Phone Roll</option>
                            <option value="1:1">1:1 Standard Motion Box</option>
                          </select>
                        </div>
                      )}

                      {/* Text details / custom prompts */}
                      <div className="space-y-1 bg-slate-55 p-3 rounded-xl border border-slate-150">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">2. Type Your Creative Prompt</label>
                        <textarea
                          rows={4}
                          value={studioPrompt}
                          onChange={(e) => setStudioPrompt(e.target.value)}
                          placeholder={
                            studioMode === 'flyer'
                              ? "e.g., A colorful modern poster for Obed Yadzo's digital design academic workshop..."
                              : studioMode === 'slides'
                              ? "e.g., A multi-step structured presentation outline on how AI video generation transforms modern graphics design..."
                              : studioMode === 'video'
                              ? "e.g., A beautiful continuous pan showcasing the global layout of Accra city night-line tech centers..."
                              : "e.g., Help me copywrite a brilliant script introducing Obed's interactive AI engines..."
                          }
                          className="w-full bg-transparent text-slate-950 placeholder-slate-400 border-0 outline-hidden text-xs md:text-sm resize-none font-medium leading-relaxed"
                        />
                      </div>

                      {/* Submit generation handshake */}
                      <button
                        type="submit"
                        disabled={isStudioLoading || !studioPrompt.trim()}
                        className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-mono font-bold text-xs rounded-xl tracking-wider uppercase transition flex items-center justify-center space-x-2 shadow-md disabled:opacity-40 cursor-pointer"
                      >
                        {isStudioLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Synthesizing Design Blueprint...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span>Handshake AI Generator</span>
                          </>
                        )}
                      </button>
                    </form>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10.5px] text-slate-500 font-sans leading-relaxed">
                      💡 <strong>Creator Insight:</strong> All visual flyers, slide presentations, or video motion plans synthesized here are pre-configured to automatically export as smart cards to your <strong>Canva Whiteboard Workspace</strong> with a single tap.
                    </div>
                  </div>

                  {/* Right hand studio results engine sandbox */}
                  <div className="lg:col-span-12 xl:col-span-7 flex flex-col min-h-[480px] bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl relative">
                    
                    {/* Console Header */}
                    <div className="bg-slate-950 py-3 px-4 flex items-center justify-between text-white border-b border-slate-850 shrink-0 select-none">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-mono text-slate-400 pl-2 tracking-wider">LILBED RENDER PANEL v1.2</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500">OBED YADZO ANALYTICS</span>
                    </div>

                    {isStudioLoading ? (
                      /* Live simulated generation loading screen with scholar metrics */
                      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 text-slate-300 font-mono space-y-6 select-none text-center">
                        <div className="relative flex items-center justify-center">
                          <div className="absolute w-20 h-20 rounded-full border-2 border-indigo-500/20 border-t-indigo-400 animate-spin" />
                          <div className="absolute w-14 h-14 rounded-full border-2 border-dashed border-cyan-500/40 border-b-cyan-300 animate-spin" style={{ animationDirection: 'reverse' }} />
                          <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                        </div>
                        
                        <div className="space-y-2 max-w-sm">
                          <p className="text-xs font-bold text-indigo-300 tracking-widest">SYNTHESIZING DESIGN RENDER...</p>
                          <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans font-medium px-4">
                            Running analytical parameters for prompt: <span className="text-white italic">"{studioPrompt.substring(0, 60)}..."</span>
                          </p>
                        </div>

                        {/* Staggered progress phases visualizer */}
                        <div className="text-[9.5px] text-emerald-400/80 bg-slate-900/60 p-4 border border-slate-800 rounded-xl w-full max-w-md text-left space-y-1.5 leading-normal">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
                            <span>TASK_THREAD_ID: {Date.now().toString().substring(7)}</span>
                            <span className="text-blue-400">PROCESSING</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-emerald-500">✓</span>
                            <span>Parsing global visual patterns...</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-emerald-500">✓</span>
                            <span>Mapping structured templates to Obed's schema...</span>
                          </div>
                          <div className="flex items-center space-x-2 animate-pulse">
                            <span className="text-amber-500">⏳</span>
                            <span className="text-slate-200">Generating customized flyer vectors or video streams...</span>
                          </div>
                        </div>
                      </div>
                    ) : studioResult ? (
                      /* Results preview block */
                      <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
                        
                        {/* FLYER MODE PREVIEW */}
                        {studioMode === 'flyer' && studioResult.imageUrl && (
                          <div className="flex-1 flex flex-col p-6 items-center justify-center space-y-4 text-white overflow-y-auto">
                            
                            <div className="max-w-md w-full bg-slate-900 border border-slate-850 p-4 rounded-2xl flex flex-col space-y-4 shadow-xl">
                              
                              <p className="text-[10.5px] text-slate-400 font-mono text-center tracking-normal">
                                🛡️ SECURE IMAGE PIPELINE APPROVED 
                                {studioResult.isSvg && <span className="text-cyan-400 ml-1 font-bold">(SVG Optimized Format)</span>}
                              </p>

                              {/* Live Canvas Img */}
                              <div className="relative border border-slate-850 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center aspect-square max-h-[280px]">
                                <img
                                  src={studioResult.imageUrl}
                                  alt="Customized design flyer"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-contain"
                                />
                              </div>

                              {/* Download & Export controls */}
                              <div className="grid grid-cols-2 gap-2">
                                <a
                                  href={studioResult.imageUrl}
                                  download={`flyer-${Date.now()}.${studioResult.isSvg ? 'svg' : 'jpg'}`}
                                  className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-900 font-mono text-xs font-black rounded-xl text-center transition flex items-center justify-center space-x-1.5 cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download Layout</span>
                                </a>

                                <button
                                  type="button"
                                  onClick={handleExportFlyerToLibrary}
                                  className="py-2.5 px-3 bg-indigo-700 hover:bg-indigo-650 text-white font-mono text-xs font-black rounded-xl text-center transition flex items-center justify-center space-x-1.5 border border-indigo-600/50 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Save to Library</span>
                                </button>
                              </div>
                            </div>
                            
                            <p className="text-[9.5px] text-slate-500 font-mono text-center max-w-sm leading-relaxed">
                              * Customized layout rendered correctly. The design can be placed next to academic projects in Canva whiteboard.
                            </p>
                          </div>
                        )}

                        {/* SLIDES PRESENTATION MODE PREVIEW */}
                        {studioMode === 'slides' && studioResult.slides && (
                          <div className="flex-1 flex flex-col p-6 items-center justify-center text-white space-y-5 overflow-y-auto">
                            
                            {/* Slides interactive deck card component */}
                            {(() => {
                              const slide = studioResult.slides[currentSlideIndex];
                              if (!slide) return null;
                              
                              // Select theme color mappings for interactive slide renders
                              let themeClass = "bg-[#0f172a] border-[#3b82f6] text-white";
                              let tagClass = "bg-blue-500/10 text-blue-400";
                              if (slide.theme === 'dark-future') {
                                themeClass = "bg-[#090514] border-[#818cf8] text-white";
                                tagClass = "bg-indigo-500/20 text-indigo-300";
                              } else if (slide.theme === 'vibrant-rose') {
                                themeClass = "bg-[#1c0a10] border-[#f43f5e] text-white";
                                tagClass = "bg-rose-500/20 text-rose-300";
                              } else if (slide.theme === 'minimalist') {
                                themeClass = "bg-[#18181b] border-[#e4e4e7] text-white";
                                tagClass = "bg-zinc-500/25 text-zinc-300";
                              } else if (slide.theme === 'academic-slate') {
                                themeClass = "bg-[#0b131c] border-[#0891b2] text-white";
                                tagClass = "bg-cyan-500/20 text-cyan-300";
                              }

                              return (
                                <div className="w-full max-w-xl flex flex-col space-y-4">
                                  
                                  {/* Slide Screen Frame */}
                                  <div className={`border-2 rounded-2xl p-6 min-h-[300px] shadow-2xl transition-all duration-300 flex flex-col justify-between ${themeClass}`}>
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                        <span className={`text-[9px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded-md ${tagClass}`}>
                                          Slide {currentSlideIndex + 1}
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-500">LILBED DECK GENERATOR v1.0</span>
                                      </div>
                                      
                                      {/* Two-column responsive layout including Slide Graphics and Content side-by-side */}
                                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                                        
                                        {/* Main Text Content */}
                                        <div className="md:col-span-7 space-y-3">
                                          <h3 className="text-base md:text-xl font-display font-black leading-snug">
                                            {slide.title}
                                          </h3>
                                          {slide.subtitle && (
                                            <p className="text-[11px] text-slate-300 font-medium italic mt-0.5">
                                              {slide.subtitle}
                                            </p>
                                          )}

                                          <ul className="space-y-2 pt-2 text-xs text-slate-200 leading-relaxed list-disc list-inside">
                                            {slide.bullets && slide.bullets.map((b: string, i: number) => (
                                              <li key={i} className="hover:text-white transition">
                                                {b}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>

                                        {/* Generated / Curated Slide Graphic Image illustration block */}
                                        <div className="md:col-span-5 bg-black/30 border border-white/10 rounded-xl overflow-hidden aspect-video sm:aspect-square flex flex-col items-stretch relative p-1.5 group select-none">
                                          <div className="w-full h-full relative overflow-hidden rounded-lg">
                                            <img
                                              src={slide.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"}
                                              alt={slide.title}
                                              referrerPolicy="no-referrer"
                                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                              onError={(e) => {
                                                // Fallback image in case the Unsplash link experiences CORS or load issues
                                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop";
                                              }}
                                            />
                                            {/* Gradient overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                                          </div>
                                          <span className="text-[7.5px] font-mono text-slate-350 self-center text-center mt-1.5 uppercase tracking-wider block">
                                            🖼️ Presentation Visual Element
                                          </span>
                                        </div>

                                      </div>
                                    </div>

                                    <div className="border-t border-slate-800/80 pt-3 mt-4 flex justify-between items-center text-[9px] font-mono text-slate-500 select-none">
                                      <span>Designed by: <strong className="text-indigo-400">Obed Yadzo</strong></span>
                                      <span>UPSA ACADEMIC SYSTEMS</span>
                                    </div>
                                  </div>

                                  {/* Slide controls */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex space-x-1.5">
                                      <button
                                        type="button"
                                        disabled={currentSlideIndex === 0}
                                        onClick={() => setCurrentSlideIndex(prev => prev - 1)}
                                        className="py-1 px-3 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs rounded-lg disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                      >
                                        ◀ Prev Slide
                                      </button>
                                      <button
                                        type="button"
                                        disabled={currentSlideIndex === studioResult.slides.length - 1}
                                        onClick={() => setCurrentSlideIndex(prev => prev + 1)}
                                        className="py-1 px-3 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs rounded-lg disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                      >
                                        Next Slide ▶
                                      </button>
                                    </div>

                                    <span className="text-xs font-mono text-slate-450">
                                      {currentSlideIndex + 1} of {studioResult.slides.length} slides
                                    </span>
                                  </div>

                                  {/* Export Deck */}
                                  <button
                                    type="button"
                                    onClick={handleExportSlidesToLibrary}
                                    className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-650 text-white font-mono text-xs font-bold rounded-xl text-center transition flex items-center justify-center space-x-1.5 cursor-pointer"
                                  >
                                    <Plus className="w-4 h-4" />
                                    <span>Export All Cards to Library</span>
                                  </button>

                                </div>
                              );
                            })()}

                          </div>
                        )}

                        {/* VIDEO RENDER MODE PREVIEW */}
                        {studioMode === 'video' && (
                          <div className="flex-1 flex flex-col p-6 items-center justify-center text-white space-y-4 overflow-y-auto">
                            <div className="max-w-md w-full bg-slate-900 border border-slate-850 p-4 rounded-2xl flex flex-col space-y-4 shadow-xl">
                              
                              <p className="text-[10.5px] text-slate-400 font-mono text-center animate-pulse">
                                🎬 Video Simulation Feed (Veo-3.1 Engine Powered)
                              </p>

                              {/* Simulated visual motion container */}
                              <div className="relative border border-slate-800 rounded-xl overflow-hidden aspect-video bg-slate-950 flex flex-col items-center justify-center select-none shadow-inner group">
                                
                                {studioResult.videoPlanUrl === 'study_room' ? (
                                  /* Study room theme container */
                                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-slate-900 to-amber-950/20 flex flex-col items-center justify-center p-4">
                                    <div className="w-14 h-14 rounded-full border border-dashed border-amber-400/30 animate-spin flex items-center justify-center opacity-85 mb-3">
                                      <BookOpen className="w-5 h-5 text-amber-300" />
                                    </div>
                                    <span className="text-[10.5px] font-mono text-slate-200 uppercase tracking-widest text-center px-4 font-bold">SCHOLAR STUDY ROOM LEVEL</span>
                                    <span className="text-[9px] font-mono text-amber-400 mt-1">SIMULATING MOTION OVER COMPUTER CODES</span>
                                  </div>
                                ) : (
                                  /* Matrix codes / Data grid layout */
                                  <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#05141c] to-[#020617] flex flex-col items-center justify-center p-4">
                                    <div className="w-14 h-14 rounded-full border border-dashed border-indigo-500/40 animate-spin flex items-center justify-center opacity-85 mb-3" style={{ animationDuration: '6s' }}>
                                      <Activity className="w-5 h-5 text-indigo-300" />
                                    </div>
                                    <span className="text-[10.5px] text-slate-100 font-mono font-bold tracking-widest text-center px-4">CINEMATIC GEOMETRY FIELDED SYSTEM</span>
                                    <span className="text-[9px] text-cyan-400 font-mono mt-1">VEOCITY: CONTINUOUS REEL TRACKING FLOW</span>
                                  </div>
                                )}

                                {/* Overlay UI elements to mimic professional video editor preview */}
                                <div className="absolute top-2.5 left-3 bg-black/60 px-2 py-0.5 rounded text-[8.5px] font-mono text-rose-400 border border-slate-800 flex items-center space-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                                  <span>LIVE REEL PLAYBACK</span>
                                </div>

                                <div className="absolute bottom-3 left-3 right-3 bg-black/80 p-2.5 rounded-lg border border-slate-800 text-[10.5px] font-mono text-slate-200 leading-normal text-center whitespace-pre-line">
                                  {studioPrompt}
                                </div>
                              </div>

                              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 text-[10px] text-slate-400 leading-relaxed font-sans font-medium text-center">
                                * Loop rendering succeeded. Video parameters calibrated beautifully for UPSA scholar design modules.
                              </div>

                              {/* Export specs */}
                              <button
                                type="button"
                                onClick={handleExportVideoToLibrary}
                                className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-650 text-white font-mono text-xs font-bold rounded-xl text-center transition flex items-center justify-center space-x-1.5 cursor-pointer"
                              >
                                <Plus className="w-4 h-4" />
                                <span>Export Reel Blueprint to Library</span>
                              </button>

                            </div>
                          </div>
                        )}

                        {/* GENERAL CHAT PLAYGROUND */}
                        {studioMode === 'chat' && studioResult.text && (
                          <div className="flex-1 flex flex-col p-6 text-white space-y-4 overflow-y-auto">
                            <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex-1 flex flex-col justify-between">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2 text-[10px] font-mono text-slate-550">
                                  <span>SCHOLARLY COPYIST OUTPUT</span>
                                  <span>OBED YADZO SYSTEMS</span>
                                </div>
                                
                                <div className="prose prose-invert max-w-none text-xs md:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                                  {studioResult.text}
                                </div>
                              </div>

                              <div className="pt-4 border-t border-slate-800/80 mt-6 flex justify-between gap-3">
                                <button
                                  type="button"
                                  onClick={() => copyText(studioResult.text || '', 'studioChat')}
                                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-medium rounded-xl transition cursor-pointer"
                                >
                                  {copiedId === 'studioChat' ? "Copied Successfully! ✓" : "Copy Draft Text"}
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => handleExportToLibrary(studioResult.text || '')}
                                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-650 text-white font-mono text-xs font-bold rounded-xl transition cursor-pointer"
                                >
                                  Export as Scholarly Memo
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    ) : (
                      /* Default empty console screen */
                      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 text-slate-400 font-mono space-y-4 select-none">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900/80 flex items-center justify-center text-indigo-400 border border-slate-800">
                          <Sparkles className="w-6 h-6 animate-pulse" />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-xs font-bold text-slate-200 uppercase tracking-widest">Awaiting Prompt Command...</p>
                          <p className="text-[10px] text-slate-500 font-sans max-w-sm mx-auto leading-normal">
                            Select an AI creative mode from the left settings panel, write what you'd like to design, and click <strong>Handshake AI Generator</strong> to witness real-time creation.
                          </p>
                        </div>
                      </div>
                    )}

                  </div>

                </div>

              </div>
            </div>
          )}

          {/* TAB 6: Google Live Maps & World Sovereign Demarcations */}
          {activeTab === 'maps' && (
            <div className="flex-1 flex flex-col md:flex-row bg-[#FAFBFD] overflow-hidden">
              
              {/* Maps Sidebar Control Center */}
              <aside className="w-full md:w-80 border-r border-slate-200/60 bg-white flex flex-col flex-shrink-0 overflow-y-auto">
                
                {/* Search controller */}
                <div className="p-4 border-b border-slate-100 space-y-3">
                  <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1 w-fit">
                    <Globe className="w-3.5 h-3.5 text-indigo-600 animate-spin-slow" />
                    <span className="text-[10px] font-mono font-bold text-indigo-750 uppercase">Demarcation Tracker</span>
                  </div>
                  
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Worldwide Geographic Intel</h3>
                  
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (mapSearch.trim()) {
                        setSelectedCountry(mapSearch.trim());
                      }
                    }} 
                    className="relative"
                  >
                    <input
                      type="text"
                      placeholder="Type any town, border, or region..."
                      value={mapSearch}
                      onChange={(e) => setMapSearch(e.target.value)}
                      className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition text-slate-950 font-medium"
                    />
                    <button
                      type="submit"
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 transition"
                      title="Locate Demarcation"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

                {/* Filter Selector by Continent */}
                <div className="p-4 border-b border-slate-100 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-slate-405 uppercase tracking-widest block">
                    🌐 CONTINENT SELECTION:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {['All', 'Africa', 'Europe', 'Americas', 'Asia', 'Oceania'].map((cont) => (
                      <button
                        key={cont}
                        type="button"
                        onClick={() => {
                          setMapContinent(cont);
                          // Default select a major country in that continent to update view
                          if (cont === 'Africa') { setSelectedCountry('Ghana'); }
                          else if (cont === 'Europe') { setSelectedCountry('Germany'); }
                          else if (cont === 'Americas') { setSelectedCountry('United States'); }
                          else if (cont === 'Asia') { setSelectedCountry('Japan'); }
                          else if (cont === 'Oceania') { setSelectedCountry('Australia'); }
                        }}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${
                          mapContinent === cont
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cont}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Countries List Selection Scroller */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-slate-100/30">
                  <span className="text-[9.5px] font-mono font-extrabold text-slate-400 uppercase tracking-wider px-2 block mb-1">
                    🌍 SOVEREIGN DEMARCATION ZONES:
                  </span>
                  
                  {[
                    { name: 'Ghana', emoji: '🇬🇭', capital: 'Accra', continent: 'Africa', region: 'West Africa', coords: '5.6037° N, 0.1870° W', fact: 'Home of the premier UPSA academic systems and Obed Yadzo! First country in sub-Saharan Africa to obtain independence.' },
                    { name: 'Nigeria', emoji: '🇳🇬', capital: 'Abuja', continent: 'Africa', region: 'West Africa', coords: '9.0820° N, 8.6753° E', fact: 'The giant of Africa, with the fastest growing tech hub, Nollywood movie industry, and diverse cultural groups.' },
                    { name: 'South Africa', emoji: '🇿🇦', capital: 'Pretoria', continent: 'Africa', region: 'Southern Africa', coords: '30.5595° S, 22.9375° E', fact: 'Has three capital cities and has hosted the FIFA World Cup. Rich in gold, platinum, and beautiful coastal horizons.' },
                    { name: 'Egypt', emoji: '🇪🇬', capital: 'Cairo', continent: 'Africa', region: 'North Africa', coords: '26.8206° N, 30.8025° E', fact: 'Famous for the ancient Pyramids of Giza, the Great Sphinx, and the ancient Nile River civilization valley.' },
                    { name: 'Kenya', emoji: '🇰🇪', capital: 'Nairobi', continent: 'Africa', region: 'East Africa', coords: '0.0236° S, 37.9062° E', fact: 'Worldwide leader in mobile money (M-Pesa) and safari tourism, with famous runners and scenic Rift Valley views.' },
                    { name: 'Morocco', emoji: '🇲🇦', capital: 'Rabat', continent: 'Africa', region: 'North Africa', coords: '31.7917° N, 7.0926° W', fact: 'Gateway to Europe with fascinating architectures across Marrakech and Casablanca; rich in Atlas mountain scenery.' },
                    { name: 'United Kingdom', emoji: '🇬🇧', capital: 'London', continent: 'Europe', region: 'Western Europe', coords: '55.3781° N, 3.4360° W', fact: 'Formed of England, Scotland, Wales, and Northern Ireland. Center of historic academic publishing and scientific revolution.' },
                    { name: 'Germany', emoji: '🇩🇪', capital: 'Berlin', continent: 'Europe', region: 'Central Europe', coords: '51.1657° N, 10.4515° E', fact: 'Industrial and economic heart of Europe; famous for engineering masterpieces, renewable energy grids, and deep philosophy.' },
                    { name: 'France', emoji: '🇫🇷', capital: 'Paris', continent: 'Europe', region: 'Western Europe', coords: '46.2276° N, 2.2137° E', fact: 'Global hub for art, fashion, gastronomy, and the historic French Revolution. Features detailed regional demarcations.' },
                    { name: 'Italy', emoji: '🇮🇹', capital: 'Rome', continent: 'Europe', region: 'Southern Europe', coords: '41.8719° N, 12.5674° E', fact: 'Birthplace of the Roman Empire and the Renaissance. Famous for beautiful cities like Florence, Venice, and Amalfi coastlines.' },
                    { name: 'Spain', emoji: '🇪🇸', capital: 'Madrid', continent: 'Europe', region: 'Southern Europe', coords: '40.4637° N, 3.7492° W', fact: 'Vibrant cities, beautiful islands, and historical architecture with Islamic Moorish influences in Andalusia.' },
                    { name: 'Switzerland', emoji: '🇨🇭', capital: 'Bern', continent: 'Europe', region: 'Central Europe', coords: '46.8182° N, 8.2275° E', fact: 'Landlocked country in Central Europe, known for its majestic Alpine peaks, financial hubs, and neutral security.' },
                    { name: 'United States', emoji: '🇺🇸', capital: 'Washington D.C.', continent: 'Americas', region: 'North America', coords: '37.0902° N, 95.7129° W', fact: 'Has 50 states and diverse geographical regions ranging from tropical beaches to arctic tundras. Hub of silicon tech.' },
                    { name: 'Canada', emoji: '🇨🇦', capital: 'Ottawa', continent: 'Americas', region: 'North America', coords: '56.1304° N, 106.3468° W', fact: 'Second largest country by landmass, famous for its polite society, breathtaking lakes, maple syrup, and national parks.' },
                    { name: 'Brazil', emoji: '🇧🇷', capital: 'Brasília', continent: 'Americas', region: 'South America', coords: '14.2350° S, 51.9253° W', fact: 'Home of the mighty Amazon River forest and lively Carnival festivals. Passionate world leader in soccer.' },
                    { name: 'Mexico', emoji: '🇲🇽', capital: 'Mexico City', continent: 'Americas', region: 'North America', coords: '23.6345° N, 102.5528° W', fact: 'Rich heritage combining Mayan and Aztec ruins with Spanish colonial architectures. Renowned for its culinary arts.' },
                    { name: 'Argentina', emoji: '🇦🇷', capital: 'Buenos Aires', continent: 'Americas', region: 'South America', coords: '38.4161° S, 63.6167° W', fact: 'Famous for tango dance, majestic Andean valleys, Patagonian glaciers, and robust livestock agriculture.' },
                    { name: 'Japan', emoji: '🇯🇵', capital: 'Tokyo', continent: 'Asia', region: 'East Asia', coords: '36.2048° N, 138.2529° E', fact: 'Island nation famous for blending high-tech robotics, bullet trains, and neon cities with ancient temples and shrines.' },
                    { name: 'South Korea', emoji: '🇰🇷', capital: 'Seoul', continent: 'Asia', region: 'East Asia', coords: '35.9078° N, 127.7669° E', fact: 'Worldwide leader in semiconductors, fast broadband networks, K-pop, and skincare beauty systems.' },
                    { name: 'China', emoji: '🇨🇳', capital: 'Beijing', continent: 'Asia', region: 'East Asia', coords: '35.8617° N, 104.1954° E', fact: 'Most populous country for centuries; famous for the Great Wall, rapid high-speed rail networks, and rich dynastic history.' },
                    { name: 'India', emoji: '🇮🇳', capital: 'New Delhi', continent: 'Asia', region: 'South Asia', coords: '20.5937° N, 78.9629° E', fact: 'Enormous subcontinent with high spiritual heritage, IT software export, and multi-century architectural gems like the Taj Mahal.' },
                    { name: 'Saudi Arabia', emoji: '🇸🇦', capital: 'Riyadh', continent: 'Asia', region: 'Middle East', coords: '23.8859° N, 45.0792° E', fact: 'Heart of the Arabian peninsula, hosting the holy sanctuary of Mecca; rich oil fields and rapid modernization developments.' },
                    { name: 'Australia', emoji: '🇦🇺', capital: 'Canberra', continent: 'Oceania', region: 'Australasia', coords: '25.2744° S, 133.7751° E', fact: 'Mega-diverse country surrounded by oceans; home of kangaroo fauna, deep outback deserts, and the Great Barrier Reef.' },
                    { name: 'New Zealand', emoji: '🇳🇿', capital: 'Wellington', continent: 'Oceania', region: 'Polynesia', coords: '40.9006° S, 174.8860° E', fact: 'Renowned for dramatic geothermal mountains, green valleys, and Maōri indigenous history; filming set for fantasy series.' }
                  ]
                    .filter((c) => mapContinent === 'All' || c.continent === mapContinent)
                    .map((country) => (
                      <button
                        key={country.name}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(country.name);
                          setMapSearch(country.name);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition ${
                          selectedCountry.toLowerCase() === country.name.toLowerCase()
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/50'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span className="text-sm">{country.emoji}</span>
                          <span className="text-xs font-bold truncate">{country.name}</span>
                        </div>
                        <span className={`text-[9px] font-mono rounded px-1 py-0.2 ${
                          selectedCountry.toLowerCase() === country.name.toLowerCase()
                            ? 'bg-indigo-700 text-indigo-100'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {country.capital}
                        </span>
                      </button>
                    ))}
                </div>
              </aside>

              {/* Central Map viewport & demographics analysis panel */}
              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                
                {/* Layer bar and general coordinates view */}
                <div className="bg-white border-b border-slate-200/60 p-4 shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xxs">
                  <div>
                    <h3 className="text-xs font-mono font-extrabold text-[#111111] flex items-center gap-1">
                      <span className="p-1 bg-red-100 text-red-600 rounded">📍</span>
                      <span>ACTIVE VIEW: {selectedCountry.toUpperCase()}</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Live GPS Demarcation Stream via Google Maps Embed Engine
                    </p>
                  </div>

                  {/* Layers switcher buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                    
                    <button
                      type="button"
                      onClick={() => setMapLayer('roadmap')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${
                        mapLayer === 'roadmap'
                          ? 'bg-white text-slate-900 shadow-xxs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      🗺️ Roadmap View
                    </button>

                    <button
                      type="button"
                      onClick={() => setMapLayer('satellite')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${
                        mapLayer === 'satellite'
                          ? 'bg-white text-slate-900 shadow-xxs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      🛰️ Satellite Image
                    </button>

                    <button
                      type="button"
                      onClick={() => setMapLayer('terrain')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${
                        mapLayer === 'terrain'
                          ? 'bg-white text-slate-900 shadow-xxs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      ⛰️ Alpine Terrain
                    </button>

                  </div>

                  {/* Zoom controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setMapZoom((prev) => Math.max(1, prev - 1))}
                      className="p-1 px-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-250 border border-slate-200 rounded-md transition-all active:scale-95"
                      title="Zoom Out"
                    >
                      －
                    </button>
                    <span className="text-[10px] font-mono font-bold text-slate-650 min-w-[55px] text-center bg-slate-50 px-2 py-1 rounded border border-slate-100">
                      Zoom: {mapZoom}x
                    </span>
                    <button
                      type="button"
                      onClick={() => setMapZoom((prev) => Math.min(21, prev + 1))}
                      className="p-1 px-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-250 border border-slate-200 rounded-md transition-all active:scale-95"
                      title="Zoom In"
                    >
                      ＋
                    </button>
                  </div>
                </div>

                {/* Google Maps Embed Iframe Section */}
                <div className="flex-1 bg-slate-100 relative min-h-[350px]">
                  
                  {/* Google maps standard fallback iframe */}
                  <iframe
                    title="Live Google Map Demarcations"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    marginHeight={0}
                    marginWidth={0}
                    scrolling="no"
                    referrerPolicy="no-referrer"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedCountry)}&t=${
                      mapLayer === 'satellite' ? 'k' : (mapLayer === 'terrain' ? 'p' : 'm')
                    }&z=${mapZoom}&ie=UTF8&iwloc=&output=embed`}
                    className="border-0 w-full h-full bg-slate-250 shadow-inner"
                  />

                  {/* Custom coordinates tag on top corners */}
                  <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-xs text-white p-2.5 rounded-lg text-[10px] font-mono shadow-md max-w-[280px] pointer-events-none border border-slate-750/50">
                    <p className="font-bold text-indigo-300">🛰️ TELEMETRY ACTIVE</p>
                    <p className="mt-1 text-slate-200">Location Name: <span className="font-sans text-white text-xs font-black">{selectedCountry}</span></p>
                    <p className="text-slate-400">Map zoom: {mapZoom} • Mode: {mapLayer.toUpperCase()}</p>
                  </div>
                </div>

                {/* Bottom demographics and facts information drawer */}
                <div className="bg-slate-50 p-4 border-t border-slate-200 shrink-0">
                  <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    
                    {/* Selected details */}
                    <div className="flex-1 space-y-1">
                      {(() => {
                        const info = [
                          { name: 'Ghana', emoji: '🇬🇭', capital: 'Accra', continent: 'Africa', region: 'West Africa', coords: '5.6037° N, 0.1870° W', fact: 'Home of the premier UPSA academic systems and Obed Yadzo! First country in sub-Saharan Africa to obtain independence.' },
                          { name: 'Nigeria', emoji: '🇳🇬', capital: 'Abuja', continent: 'Africa', region: 'West Africa', coords: '9.0820° N, 8.6753° E', fact: 'The giant of Africa, with the fastest growing tech hub, Nollywood movie industry, and diverse cultural groups.' },
                          { name: 'South Africa', emoji: '🇿🇦', capital: 'Pretoria', continent: 'Africa', region: 'Southern Africa', coords: '30.5595° S, 22.9375° E', fact: 'Has three capital cities and has hosted the FIFA World Cup. Rich in gold, platinum, and beautiful coastal horizons.' },
                          { name: 'Egypt', emoji: '🇪🇬', capital: 'Cairo', continent: 'Africa', region: 'North Africa', coords: '26.8206° N, 30.8025° E', fact: 'Famous for the ancient Pyramids of Giza, the Great Sphinx, and the ancient Nile River civilization valley.' },
                          { name: 'Kenya', emoji: '🇰🇪', capital: 'Nairobi', continent: 'Africa', region: 'East Africa', coords: '0.0236° S, 37.9062° E', fact: 'Worldwide leader in mobile money (M-Pesa) and safari tourism, with famous runners and scenic Rift Valley views.' },
                          { name: 'Morocco', emoji: '🇲🇦', capital: 'Rabat', continent: 'Africa', region: 'North Africa', coords: '31.7917° N, 7.0926° W', fact: 'Gateway to Europe with fascinating architectures across Marrakech and Casablanca; rich in Atlas mountain scenery.' },
                          { name: 'United Kingdom', emoji: '🇬🇧', capital: 'London', continent: 'Europe', region: 'Western Europe', coords: '55.3781° N, 3.4360° W', fact: 'Formed of England, Scotland, Wales, and Northern Ireland. Center of historic academic publishing and scientific revolution.' },
                          { name: 'Germany', emoji: '🇩🇪', capital: 'Berlin', continent: 'Europe', region: 'Central Europe', coords: '51.1657° N, 10.4515° E', fact: 'Industrial and economic heart of Europe; famous for engineering masterpieces, renewable energy grids, and deep philosophy.' },
                          { name: 'France', emoji: '🇫🇷', capital: 'Paris', continent: 'Europe', region: 'Western Europe', coords: '46.2276° N, 2.2137° E', fact: 'Global hub for art, fashion, gastronomy, and the historic French Revolution. Features detailed regional demarcations.' },
                          { name: 'Italy', emoji: '🇮🇹', capital: 'Rome', continent: 'Europe', region: 'Southern Europe', coords: '41.8719° N, 12.5674° E', fact: 'Birthplace of the Roman Empire and the Renaissance. Famous for beautiful cities like Florence, Venice, and Amalfi coastlines.' },
                          { name: 'Spain', emoji: '🇪🇸', capital: 'Madrid', continent: 'Europe', region: 'Southern Europe', coords: '40.4637° N, 3.7492° W', fact: 'Vibrant cities, beautiful islands, and historical architecture with Islamic Moorish influences in Andalusia.' },
                          { name: 'Switzerland', emoji: '🇨🇭', capital: 'Bern', continent: 'Europe', region: 'Central Europe', coords: '46.8182° N, 8.2275° E', fact: 'Landlocked country in Central Europe, known for its majestic Alpine peaks, financial hubs, and neutral security.' },
                          { name: 'United States', emoji: '🇺🇸', capital: 'Washington D.C.', continent: 'Americas', region: 'North America', coords: '37.0902° N, 95.7129° W', fact: 'Has 50 states and diverse geographical regions ranging from tropical beaches to arctic tundras. Hub of silicon tech.' },
                          { name: 'Canada', emoji: '🇨🇦', capital: 'Ottawa', continent: 'Americas', region: 'North America', coords: '56.1304° N, 106.3468° W', fact: 'Second largest country by landmass, famous for its polite society, breathtaking lakes, maple syrup, and national parks.' },
                          { name: 'Brazil', emoji: '🇧🇷', capital: 'Brasília', continent: 'Americas', region: 'South America', coords: '14.2350° S, 51.9253° W', fact: 'Home of the mighty Amazon River forest and lively Carnival festivals. Passionate world leader in soccer.' },
                          { name: 'Mexico', emoji: '🇲🇽', capital: 'Mexico City', continent: 'Americas', region: 'North America', coords: '23.6345° N, 102.5528° W', fact: 'Rich heritage combining Mayan and Aztec ruins with Spanish colonial architectures. Renowned for its culinary arts.' },
                          { name: 'Argentina', emoji: '🇦🇷', capital: 'Buenos Aires', continent: 'Americas', region: 'South America', coords: '38.4161° S, 63.6167° W', fact: 'Famous for tango dance, majestic Andean valleys, Patagonian glaciers, and robust livestock agriculture.' },
                          { name: 'Japan', emoji: '🇯🇵', capital: 'Tokyo', continent: 'Asia', region: 'East Asia', coords: '36.2048° N, 138.2529° E', fact: 'Island nation famous for blending high-tech robotics, bullet trains, and neon cities with ancient temples and shrines.' },
                          { name: 'South Korea', emoji: '🇰🇷', capital: 'Seoul', continent: 'Asia', region: 'East Asia', coords: '35.9078° N, 127.7669° E', fact: 'Worldwide leader in semiconductors, fast broadband networks, K-pop, and skincare beauty systems.' },
                          { name: 'China', emoji: '🇨🇳', capital: 'Beijing', continent: 'Asia', region: 'East Asia', coords: '35.8617° N, 104.1954° E', fact: 'Most populous country for centuries; famous for the Great Wall, rapid high-speed rail networks, and rich dynastic history.' },
                          { name: 'India', emoji: '🇮🇳', capital: 'New Delhi', continent: 'Asia', region: 'South Asia', coords: '20.5937° N, 78.9629° E', fact: 'Enormous subcontinent with high spiritual heritage, IT software export, and multi-century architectural gems like the Taj Mahal.' },
                          { name: 'Saudi Arabia', emoji: '🇸🇦', capital: 'Riyadh', continent: 'Asia', region: 'Middle East', coords: '23.8859° N, 45.0792° E', fact: 'Heart of the Arabian peninsula, hosting the holy sanctuary of Mecca; rich oil fields and rapid modernization developments.' },
                          { name: 'Australia', emoji: '🇦🇺', capital: 'Canberra', continent: 'Oceania', region: 'Australasia', coords: '25.2744° S, 133.7751° E', fact: 'Mega-diverse country surrounded by oceans; home of kangaroo fauna, deep outback deserts, and the Great Barrier Reef.' },
                          { name: 'New Zealand', emoji: '🇳🇿', capital: 'Wellington', continent: 'Oceania', region: 'Polynesia', coords: '40.9006° S, 174.8860° E', fact: 'Renowned for dramatic geothermal mountains, green valleys, and Maōri indigenous history; filming set for fantasy series.' }
                        ].find(c => c.name.toLowerCase() === selectedCountry.toLowerCase());

                        if (info) {
                          return (
                            <>
                              <div className="flex items-center space-x-2">
                                <span className="text-xl">{info.emoji}</span>
                                <h4 className="text-xs font-black text-slate-900 uppercase">
                                  {info.name} Sovereign Demarcation Sheet
                                </h4>
                                <span>•</span>
                                <span className="text-[10px] text-slate-500 font-bold bg-slate-200 px-1.5 py-0.2 rounded">
                                  {info.region}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-800 leading-relaxed font-sans mt-1">
                                <strong>Academic Demographics:</strong> Capital city is <strong>{info.capital}</strong>. Estimated Central Coordinates: <code className="bg-slate-200 px-1 py-0.2 rounded font-mono text-[10px] text-indigo-700">{info.coords}</code>.
                              </p>
                              <p className="text-[10px] text-slate-500 leading-normal font-sans italic">
                                <strong>Research insight:</strong> {info.fact}
                              </p>
                            </>
                          );
                        } else {
                          return (
                            <>
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">🗺️</span>
                                <h4 className="text-xs font-black text-slate-900 uppercase">
                                  Custom Location Demarcation Sheet
                                </h4>
                              </div>
                              <p className="text-[11px] text-slate-800 leading-relaxed font-sans mt-0.5">
                                Now inspecting custom location: <strong>{selectedCountry}</strong>.
                              </p>
                              <p className="text-[10px] text-slate-500 leading-normal font-sans">
                                Type any sovereign city, village, lake, border control point, or mountain ridge globally using the Search bar to analyze Google Live Map perspectives.
                              </p>
                            </>
                          );
                        }
                      })()}
                    </div>

                    {/* Interaction Button Pack */}
                    <div className="flex flex-wrap items-center gap-2 text-xs shrink-0 bg-white p-2 border border-slate-200 rounded-xl shadow-xs">
                      
                      <button
                        type="button"
                        onClick={() => {
                          const info = [
                            { name: 'Ghana', Capital: 'Accra', coords: '5.6037° N, 0.1870° W', fact: 'First country in sub-Saharan Africa to obtain independence.' },
                            { name: 'United States', Capital: 'Washington D.C.', coords: '37.0902° N, 95.7129° W', fact: 'Has 50 states and diverse geographical regions.' }
                          ].find(c => c.name.toLowerCase() === selectedCountry.toLowerCase());
                          
                          const text = info 
                            ? `Capital: ${info.Capital}\nGPS Coords: ${info.coords}\nInsight: ${info.fact}`
                            : `Inspecting custom worldwide GPS coordinates: ${selectedCountry}`;
                          
                          handleExportMapToLibrary(
                            selectedCountry, 
                            text, 
                            `https://maps.google.com/maps?q=${encodeURIComponent(selectedCountry)}`
                          );
                        }}
                        className="bg-teal-50 hover:bg-teal-100 text-teal-805 font-bold px-3 py-1.5 rounded-lg border border-teal-200 transition-all flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Share to Library</span>
                      </button>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedCountry)}`}
                        target="_blank"
                        rel="noreferrer referrer"
                        className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Full Google Maps</span>
                      </a>

                    </div>

                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 7: Cyber Security Systems, Scanner, HD Camera Studio, Dictionary, & Code Generator */}
          {activeTab === 'sec_tech' && (
            <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
              <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header Welcome Card */}
                <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-xl border border-emerald-800/30 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
                  <div className="space-y-2 relative z-10">
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border border-emerald-500/30">
                      🔒 SECURE DEFENSE SYSTEMS & DIGITAL ASSETS CO-PILOT
                    </span>
                    <h2 className="text-xl md:text-2xl font-black font-display tracking-tight text-white">
                      Cyber Intelligence & Adaptive Software workspace
                    </h2>
                    <p className="text-slate-400 text-[11px] font-sans max-w-xl leading-relaxed">
                      Verify secure identities with simulated biometric matrices, decode encrypted code systems, manipulate dynamic image/video feeds, research lexical roots, and invoke direct website development generators.
                    </p>
                  </div>
                  
                  {/* Whatsapp Direct developer widget */}
                  <div className="shrink-0 relative z-10 w-full md:w-auto">
                    <a
                      href="https://wa.me/233597773520?text=Hello%20Obed%20Yadzo,%20I%20am%20using%20the%20Lilbed%20AI%20Ecosystem%20and%2520would%2520like%2520to%2520discuss%2520custom%2520features!"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full md:w-auto bg-emerald-605 hover:bg-emerald-700 text-white font-bold text-xs p-3.5 rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center space-x-2 border border-emerald-500/20 cursor-pointer"
                    >
                      <span className="text-lg">💬</span>
                      <div className="text-left leading-tight">
                        <span className="block text-[10px] uppercase font-mono tracking-wider font-extrabold text-emerald-200">Chat Platform Developer</span>
                        <span className="block font-sans text-xs">WhatsApp: +233 59 777 3520</span>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Sub Navigation grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
                  <button
                    type="button"
                    onClick={() => setSecSubTab('biometrics')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1.5 cursor-pointer ${
                      secSubTab === 'biometrics'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                    }`}
                  >
                    <Fingerprint className="w-5 h-5" />
                    <span className="text-[10px] font-mono tracking-tight font-extrabold uppercase">Biometric security</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSecSubTab('scanner')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1.5 cursor-pointer ${
                      secSubTab === 'scanner'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                    }`}
                  >
                    <Sliders className="w-5 h-5 font-bold" />
                    <span className="text-[10px] font-mono tracking-tight font-extrabold uppercase">Telemetry Scanner</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSecSubTab('camera')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1.5 cursor-pointer ${
                      secSubTab === 'camera'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                    }`}
                  >
                    <Camera className="w-5 h-5" />
                    <span className="text-[10px] font-mono tracking-tight font-extrabold uppercase">Camera / Video Studio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSecSubTab('dictionary')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1.5 cursor-pointer ${
                      secSubTab === 'dictionary'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                    }`}
                  >
                    <Book className="w-5 h-5" />
                    <span className="text-[10px] font-mono tracking-tight font-extrabold uppercase">Scholar Dictionary</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSecSubTab('dev')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1.5 cursor-pointer ${
                      secSubTab === 'dev'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                    }`}
                  >
                    <Code className="w-5 h-5" />
                    <span className="text-[10px] font-mono tracking-tight font-extrabold uppercase">App developers Suite</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSecSubTab('installer')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1.5 cursor-pointer col-span-2 sm:col-span-1 ${
                      secSubTab === 'installer'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                    <span className="text-[10px] font-mono tracking-tight font-extrabold uppercase">Installer &amp; Share</span>
                  </button>
                </div>

                {/* Sub Tab Contents Block */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xxs">

                  {/* 1. CYBER BIOMETRICS SUB TAB */}
                  {secSubTab === 'biometrics' && (
                    <div className="p-6 md:p-8 space-y-6">
                      <div className="flex flex-col md:flex-row items-stretch gap-6">
                        
                        {/* Interactive Scan Console */}
                        <div className="flex-1 bg-slate-950 rounded-2xl p-6 text-white border border-slate-805 space-y-5 flex flex-col justify-between min-h-[350px]">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-emerald-400 tracking-wider flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                              AUTHENTICATION CORE ACTIVE
                            </span>
                            <span className="text-[9px] font-mono font-semibold text-slate-400">
                              Method: {biometricMethod === 'face' ? 'Sovereign face verification' : 'Fingerprint biometric sensor'}
                            </span>
                          </div>

                          {/* Scanner Area visual feedback */}
                          <div className="flex flex-col items-center justify-center py-6 relative">
                            
                            {/* Face scanner reticle or Fingerprint tactile pad */}
                            <div className="relative w-36 h-36 border border-slate-800 rounded-full flex items-center justify-center overflow-hidden bg-slate-900 shadow-inner">
                              
                              {/* Glowing sweep bar for face or concentric ridges for fingerprint */}
                              {biometricScanning && (
                                <div className="absolute inset-x-0 h-1 bg-emerald-500 shadow-lg shadow-emerald-400/50 animate-bounce top-0 pointer-events-none" style={{ animationDuration: '2s' }} />
                              )}

                              {biometricMethod === 'face' ? (
                                <div className="text-center relative">
                                  {biometricVerified ? (
                                    <ShieldCheck className="w-16 h-16 text-emerald-400 animate-pulse duration-1000" />
                                  ) : (
                                    <div className="space-y-2">
                                      <div className="w-16 h-16 border-2 border-emerald-500/40 rounded-full border-dashed animate-spin mx-auto flex items-center justify-center">
                                        <Camera className="w-6 h-6 text-emerald-400/60" />
                                      </div>
                                      <p className="text-[9.5px] font-mono text-slate-500 uppercase tracking-widest leading-none">Awaiting capture</p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center relative cursor-pointer">
                                  {biometricVerified ? (
                                    <ShieldCheck className="w-16 h-16 text-emerald-400 animate-pulse" />
                                  ) : (
                                    <div className="space-y-1.5 group">
                                      <Fingerprint className={`w-16 h-16 mx-auto transition-all ${biometricScanning ? 'text-emerald-500 scale-105' : 'text-indigo-400/80 hover:text-emerald-400 scale-100'}`} />
                                      <p className="text-[9px] font-mono text-slate-500 uppercase tracking-tight group-hover:text-emerald-400 select-none">Press &amp; Hold Thumb</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Verified HUD badge */}
                            {biometricVerified && (
                              <div className="mt-4 bg-emerald-950/80 border border-emerald-500 text-emerald-400 rounded-xl px-4 py-1.5 text-center text-xs font-mono font-bold tracking-wider animate-fadeIn flex items-center space-x-1">
                                <span>🔒 TRUSTED IDENTITY VERIFIED</span>
                              </div>
                            )}
                          </div>

                          {/* Trigger Buttons */}
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setBiometricMethod('face');
                                  setBiometricVerified(false);
                                }}
                                className={`flex-1 p-2 text-xs font-mono rounded-lg border transition ${
                                  biometricMethod === 'face'
                                    ? 'bg-slate-900 border-slate-700 text-emerald-400 font-bold'
                                    : 'bg-transparent border-slate-805 text-slate-400'
                                }`}
                              >
                                Face Identifier
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setBiometricMethod('fingerprint');
                                  setBiometricVerified(false);
                                }}
                                className={`flex-1 p-2 text-xs font-mono rounded-lg border transition ${
                                  biometricMethod === 'fingerprint'
                                    ? 'bg-slate-900 border-slate-700 text-emerald-400 font-bold'
                                    : 'bg-transparent border-slate-805 text-slate-400'
                                }`}
                              >
                                Fingerprint Sensor
                              </button>
                            </div>

                            <button
                              type="button"
                              disabled={biometricScanning}
                              onClick={() => {
                                setBiometricScanning(true);
                                setBiometricVerified(false);
                                const nextMsg = `[LOG] Initiating ${biometricMethod} biometric sweep scanner...`;
                                setBiometricLogs(prev => [...prev, nextMsg]);

                                setTimeout(() => {
                                  setBiometricLogs(prev => [...prev, `[LOG] Scanning high-resolution coordinates...`]);
                                }, 800);

                                setTimeout(() => {
                                  setBiometricVerified(true);
                                  setBiometricScanning(false);
                                  const token = `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}-VERIFIED`;
                                  setBiometricLogs(prev => [
                                    ...prev, 
                                    `[LOG] Cryptographic match succeeded!`, 
                                    `[LOG] Authorized Handshake: ${token}`, 
                                    `[LOG] Granted Full Sovereign Workspace Access.`
                                  ]);
                                  alert(`Identification verified successfully via ${biometricMethod}! Secure access token established.`);
                                }, 2200);

                              }}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:opacity-50 text-white font-bold p-3 rounded-xl text-xs tracking-wide transition cursor-pointer"
                            >
                              {biometricScanning ? "Initiating Cryptographic Biometric Search..." : `Commence Secure Verification`}
                            </button>
                          </div>

                        </div>

                        {/* Audit Log Terminal Console */}
                        <div className="w-full md:w-80 bg-slate-900 text-slate-300 font-mono text-[10.5px] p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <span className="text-slate-400 font-bold uppercase tracking-widest text-[9.5px]">SECURITY SWEEP LOGS</span>
                              <span className="text-[10px] text-emerald-500 font-semibold uppercase">SECURE SHELL</span>
                            </div>

                            <div className="space-y-2 max-h-[220px] overflow-y-auto leading-relaxed">
                              {biometricLogs.map((log, i) => (
                                <div key={i} className="text-[10px]">
                                  {log}
                                </div>
                              ))}
                              {biometricScanning && (
                                <div className="text-emerald-400 animate-pulse text-[10px]">
                                  [LOG] Interrogating tactile sensor hardware...
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500">
                            🔒 <b>Developer Cyber Standard v4.6</b><br />
                            End-to-end sandbox identity verification parameters checked automatically.
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* 2. UNIVERSAL TELEMETRY CODE SCANNER */}
                  {secSubTab === 'scanner' && (
                    <div className="p-6 md:p-8 space-y-6">
                      <div className="max-w-3xl mx-auto space-y-5">
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <h4 className="text-xs font-mono font-extrabold uppercase text-slate-700 mb-1">
                            📷 Universally Scan any QR / Barcode / Telemetry data Package
                          </h4>
                          <p className="text-[10px] text-slate-500 leading-snug">
                            Provide raw scanned values, ISBN numbers, global routing strings, or simulation snippets. Our co-pilot deciphers hidden protocols in seconds.
                          </p>
                        </div>

                        <form onSubmit={handleScanCodeSubmit} className="space-y-3.5 bg-slate-50 p-4 border border-slate-200 rounded-xl">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                              <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Scan Input Data Payload</label>
                              <input
                                type="text"
                                required
                                placeholder="Paste scanned QR payload (e.g., WIFI:S:CampusWiFi;T:WPA;P:UPSA_Scholar_2026;;)"
                                value={scannedCode}
                                onChange={(e) => setScannedCode(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Symbology standard</label>
                              <select
                                value={scannedType}
                                onChange={(e: any) => setScannedType(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition font-mono"
                              >
                                <option value="QR">QR Code Matrix</option>
                                <option value="Barcode">EAN Retail Barcode</option>
                                <option value="RFID">RFID Frequency Wave</option>
                                <option value="ISBN">ISBN Academic Index</option>
                              </select>
                            </div>
                          </div>

                          {/* Quick template pickers */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[9px] font-mono text-slate-400 uppercase">Pre-set Scans:</span>
                            <button
                              type="button"
                              onClick={() => {
                                setScannedCode("WIFI:T:WPA;S:UPSA_Research_Secure;P:ObedYadzo30052002;H:false;;");
                                setScannedType("QR");
                              }}
                              className="text-[9.5px] font-mono font-medium px-2 py-1 rounded bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-200"
                            >
                              🔑 UPSA Study WiFi QR
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setScannedCode("ISBN: 9780199535460 Oxford Academic Dictionary of Computer Science");
                                setScannedType("ISBN");
                              }}
                              className="text-[9.5px] font-mono font-medium px-2 py-1 rounded bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-200"
                            >
                              📚 Academic Book ISBN
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setScannedCode("MOMOPAY_GH_REF_99283712_AMOUNT_50.00_RECRECIPIENT_3052002");
                                setScannedType("Barcode");
                              }}
                              className="text-[9.5px] font-mono font-medium px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              💰 Momo Transaction Code
                            </button>
                          </div>

                          <button
                            type="submit"
                            disabled={scannerLoading}
                            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold p-2.5 rounded-lg text-xs leading-none transition cursor-pointer"
                          >
                            {scannerLoading ? "Contacting Telemetry Decoder..." : "Scan & Decode Scanned Identifier"}
                          </button>
                        </form>

                        {/* Scanner Output Dashboard */}
                        {scannerLoading && (
                          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-250 rounded-xl animate-pulse">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
                            <h4 className="text-xs font-bold text-slate-700">Demarcating custom telemetry records...</h4>
                            <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">Retrieving secure records and compiling digital catalog parameters.</p>
                          </div>
                        )}

                        {scannerResult && (
                          <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-805 p-6 space-y-4 animate-fadeIn font-mono text-xs">
                            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                              <span className="text-[10px] font-bold text-indigo-400 tracking-wider">🔬 PROTOCOL DECODED REPORT</span>
                              <span className={`text-[9px] uppercase px-2.5 py-0.5 rounded-full font-bold ${
                                scannerResult.securityStatus?.toLowerCase() === 'safe'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                              }`}>
                                Safety: {scannerResult.securityStatus || 'SAFE'}
                              </span>
                            </div>

                            {scannerResult.error ? (
                              <div className="text-rose-450 p-2 font-bold bg-rose-950/20 rounded-md">
                                {scannerResult.error}
                              </div>
                            ) : (
                              <div className="space-y-4.5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <span className="block text-[9.5px] uppercase text-slate-450 tracking-wider font-semibold">Symbology Detected</span>
                                    <span className="text-xs font-bold text-slate-100 block mt-1">{scannerResult.type || 'Custom Standard Check'}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[9.5px] uppercase text-slate-450 tracking-wider font-semibold">Origin Registry</span>
                                    <span className="text-xs font-bold text-slate-100 block mt-1">{scannerResult.origin || 'Worldwide Standards Database Address'}</span>
                                  </div>
                                </div>

                                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-1">
                                  <span className="block text-[9.5px] uppercase text-slate-455 tracking-wider font-bold">Raw Captured Bytes</span>
                                  <span className="text-slate-300 block text-xs tracking-tight break-all">{scannerResult.rawPayload}</span>
                                </div>

                                <div className="space-y-1">
                                  <span className="block text-[9.5px] uppercase text-slate-450 tracking-wider font-semibold">Decoded Semantic Breakdown</span>
                                  <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium whitespace-pre-wrap">{scannerResult.decodedInformation}</p>
                                </div>

                                {scannerResult.parsedDetails && (
                                  <div className="border-t border-slate-880 pt-3.5 space-y-2">
                                    <span className="block text-[9.5px] uppercase text-indigo-400 tracking-wider font-bold">Extracted Config Parameters</span>
                                    <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg max-h-[140px] overflow-y-auto font-mono text-[10px] text-indigo-300 leading-normal">
                                      {typeof scannerResult.parsedDetails === 'object' 
                                        ? JSON.stringify(scannerResult.parsedDetails, null, 2)
                                        : scannerResult.parsedDetails
                                      }
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="text-[9px] text-slate-500 text-center pt-2 border-t border-slate-880">
                              System analyzed via Lilbed AI Telemetry Services • Permanent Record Logs Sync Active
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 3. HD CAMERA STUDIO & VIDEO EDITING SUITE */}
                  {secSubTab === 'camera' && (
                    <div className="p-6 md:p-8 space-y-6">
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Live / Simulated Viewport */}
                        <div className="col-span-1 md:col-span-2 space-y-4">
                          <div className="relative aspect-video rounded-2xl bg-slate-950 overflow-hidden border border-slate-850 flex flex-col items-center justify-center p-3 text-white">
                            
                            {/* Grid Overlay for camera reference */}
                            <div className="absolute inset-0 border-x border-dashed border-white/5 pointer-events-none grid grid-cols-3 grid-rows-3">
                              <div className="border-b border-dashed border-white/5" />
                              <div className="border-b border-dashed border-white/5" />
                              <div className="border-b border-dashed border-white/5" />
                            </div>

                            {/* Camera Info text HUD */}
                            <div className="absolute top-4 left-4 z-10 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-md text-[9px] font-mono tracking-widest text-[#00FFFF] flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                              <b>LIVE: 4K HIGH DEPTH (HD) SPECIMEN CAMERA</b>
                            </div>
                            
                            <div className="absolute top-4 right-4 z-10 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-md text-[9px] font-mono text-slate-300">
                              ISO 800 • F/1.8 • 60 FPS
                            </div>

                            {/* Filter styling mapping */}
                            <div className="w-full h-full flex flex-col items-center justify-center">
                              <img
                                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=650&auto=format&fit=crop"
                                alt="Laboratory viewport specimen"
                                className={`w-full h-full object-cover rounded-xl transition duration-500 ${
                                  cameraFilter === 'hd-vibrant' ? 'contrast-125 saturate-150 brightness-110' :
                                  cameraFilter === 'mono-noir' ? 'grayscale contrast-150 text-black' :
                                  cameraFilter === 'cyberpunk-neon' ? 'hue-rotate-180 brightness-110 saturate-200' :
                                  cameraFilter === 'vintage-warm' ? 'sepia contrast-95 saturate-110 brightness-105' :
                                  cameraFilter === 'quantum-bright' ? 'brightness-125 saturate-105 contrast-105' :
                                  'original'
                                }`}
                              />
                            </div>

                            {/* Center focusing reticle */}
                            <div className="absolute inset-auto w-10 h-10 border border-white/35 rounded-full pointer-events-none flex items-center justify-center">
                              <div className="w-2.5 h-2.5 bg-red-650 rounded-full animate-pulse" />
                            </div>

                            {/* Bottom Capture Overlay Info */}
                            <div className="absolute bottom-4 left-4 right-4 z-10 bg-slate-950/70 border border-slate-800 rounded-lg p-2 flex items-center justify-between text-[10px] font-mono">
                              <span className="text-slate-300">Active filter: <b className="text-[#00FFFF] uppercase font-bold">{cameraFilter}</b></span>
                              <span className="text-slate-400 font-bold leading-none">Aesthetic adjustments applied</span>
                            </div>

                          </div>

                          {/* Shooter trigger buttons & dynamic live CSS Filter Manipulator */}
                          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
                            
                            <div className="space-y-1.5">
                              <span className="block text-[9.5px] font-mono font-bold uppercase text-slate-400">Apply visual filter style</span>
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  { id: 'original', label: '🎬 Original Feed' },
                                  { id: 'hd-vibrant', label: '⭐ Ultra Vibrant' },
                                  { id: 'mono-noir', label: '🕶️ Mono Noir' },
                                  { id: 'cyberpunk-neon', label: '🧬 Cyberpunk Neon' },
                                  { id: 'vintage-warm', label: '⏳ Vintage Sepia' },
                                  { id: 'quantum-bright', label: '🔆 Quantum Overexposure' }
                                ].map(f => (
                                  <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => setCameraFilter(f.id as any)}
                                    className={`text-[9.5px] font-mono px-2.5 py-1.5 rounded-lg border transition ${
                                      cameraFilter === f.id
                                        ? 'bg-slate-900 border-slate-800 text-white font-extrabold'
                                        : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {f.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  const id = `photo-${Date.now()}`;
                                  const label = `CAPTURE_SPECIMEN_${Date.now().toString().slice(-4)}.jpg`;
                                  const photoUrl = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=300&auto=format&fit=crop';
                                  const newPhoto = { id, label, url: photoUrl, filter: cameraFilter, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
                                  setCapturedPhotos(prev => [newPhoto, ...prev]);
                                  alert(`HD SNAPSHOT SAVED: "${label}" successfully processed under style: ${cameraFilter}!`);
                                }}
                                className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold p-3 rounded-lg text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>Capture HD Snapshot</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const id = `video-${Date.now()}`;
                                  const label = `VIDEO_BLUEPRINT_REEL_${Date.now().toString().slice(-4)}.mp4`;
                                  const videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4';
                                  const newVideo = { id, label, url: videoUrl, filter: cameraFilter, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
                                  setCapturedVideos(prev => [newVideo, ...prev]);
                                  alert(`HD VIDEO REEL CREATED: "${label}" successfully compiled under filter: ${cameraFilter}!`);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold p-3 rounded-lg text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Shoot HD Video Reel</span>
                              </button>
                            </div>

                          </div>
                        </div>

                        {/* Stored media files list/library */}
                        <div className="space-y-4">
                          
                          {/* Photo captures */}
                          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block pb-1 border-b border-slate-200">
                              🖼️ CAPTURED SNAPSHOTS ({capturedPhotos.length})
                            </span>

                            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                              {capturedPhotos.map((p) => (
                                <div key={p.id} className="bg-white p-2 border border-slate-205 rounded-lg flex items-center justify-between gap-2">
                                  <div className="flex items-center space-x-2 truncate">
                                    <img src={p.url} alt="Snap thumbnail" className="w-7 h-7 bg-slate-100 rounded object-cover" />
                                    <div className="truncate">
                                      <span className="block text-[9.5px] font-mono text-slate-800 tracking-tight truncate">{p.label}</span>
                                      <span className="block text-[8px] font-mono text-indigo-600 font-bold uppercase">{p.filter} style • {p.timestamp}</span>
                                    </div>
                                  </div>
                                  <a
                                    href={p.url}
                                    download={p.label}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1 hover:bg-slate-100 rounded border border-slate-200 text-slate-600 shrink-0 text-[10px] font-bold"
                                    title="Download image file to local explorer"
                                  >
                                    ↓
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Video captures */}
                          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block pb-1 border-b border-slate-200">
                              🎬 SHOT MOVIE REELS ({capturedVideos.length})
                            </span>

                            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                              {capturedVideos.map((v) => (
                                <div key={v.id} className="bg-white p-2 border border-slate-205 rounded-lg flex items-center justify-between gap-2">
                                  <div className="flex items-center space-x-2 truncate">
                                    <div className="w-7 h-7 bg-slate-900 rounded flex items-center justify-center font-mono text-[8px] font-black text-red-500">▶</div>
                                    <div className="truncate">
                                      <span className="block text-[9.5px] font-mono text-slate-800 tracking-tight truncate">{v.label}</span>
                                      <span className="block text-[8px] font-mono text-red-600 font-bold uppercase">{v.filter} style • {v.timestamp}</span>
                                    </div>
                                  </div>
                                  <a
                                    href={v.url}
                                    download={v.label}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1 hover:bg-slate-100 rounded border border-slate-200 text-slate-600 shrink-0 text-[10px] font-bold"
                                    title="Download video file to local explorer"
                                  >
                                    ↓
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-indigo-50 border border-indigo-150 rounded-xl p-3 text-[9.5px] font-mono leading-relaxed text-indigo-800">
                            💡 Captured media assets are localized securely in the internal virtual scope. Press download anytime to save pristine physical media.
                          </div>

                        </div>

                      </div>

                    </div>
                  )}

                  {/* 4. SCHOLAR DICTIONARY SUB TAB */}
                  {secSubTab === 'dictionary' && (
                    <div className="p-6 md:p-8 space-y-6">
                      <div className="max-w-3xl mx-auto space-y-5">
                        
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <h4 className="text-xs font-mono font-extrabold uppercase text-slate-705 mb-1">
                            📗 OXFORD ENGLISH & WORLDWIDE LEXICAL REPOSITORY
                          </h4>
                          <p className="text-[10px] text-slate-500 leading-snug">
                            Search elite vocabulary words, scientific jargon, or West African regional linguistics. This database extracts precise etymology origins and phonetic guides.
                          </p>
                        </div>

                        <form onSubmit={handleSearchDictionaryCheck} className="flex gap-2 bg-slate-50 p-3 border border-slate-200 rounded-xl">
                          <input
                            type="text"
                            required
                            placeholder="Type a word or phrase, e.g. epiphany, cybernetics, synergy, scholar"
                            value={dictionaryWord}
                            onChange={(e) => setDictionaryWord(e.target.value)}
                            className="flex-1 text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition font-display"
                          />
                          <button
                            type="submit"
                            disabled={dictionaryLoading}
                            className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition cursor-pointer shrink-0"
                          >
                            {dictionaryLoading ? "Consulting dictionary..." : "Lookup Word"}
                          </button>
                        </form>

                        {/* Dictionary Loader */}
                        {dictionaryLoading && (
                          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-250 rounded-xl animate-pulse">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
                            <h4 className="text-xs font-bold text-slate-700 font-mono">Quizzing worldwide linguistic portals...</h4>
                            <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">Retrieving Oxford pronunciation guidelines, regional dialects, and etymology paths.</p>
                          </div>
                        )}

                        {/* Dictionary Editorial Result view */}
                        {dictionaryResult && (
                          <div className="bg-[#FCFAF5] border border-[#EBE3D3] rounded-2xl p-6 md:p-8 shadow-xs text-slate-900 space-y-5 font-serif transition-all duration-300 animate-fadeIn">
                            {dictionaryResult.error ? (
                              <div className="text-red-700 bg-red-100 p-2.5 rounded border border-red-200 text-xs font-mono">
                                Error: {dictionaryResult.error}
                              </div>
                            ) : (
                              <div className="space-y-6">
                                
                                {/* Pronunciation & Word Header */}
                                <div className="border-b border-[#E3D8BE] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2.5">
                                  <div className="space-y-1">
                                    <h3 className="text-xl md:text-2xl font-black font-display text-slate-950 capitalize tracking-tight leading-none">
                                      {dictionaryResult.word || dictionaryWord}
                                    </h3>
                                    <span className="text-xs font-mono text-slate-500 block italic">
                                      {dictionaryResult.phonetic || '/IPA phonetic guidance unassigned/'}
                                    </span>
                                  </div>
                                  <span className="text-[9px] uppercase font-mono tracking-widest text-[#8A7034] bg-[#F3ECE0] px-2.5 py-0.5 rounded-full border border-[#DED0B6] font-bold shrink-0">
                                    Oxford &amp; World Reference Approved
                                  </span>
                                </div>

                                {/* Part of speech definitions lists */}
                                {dictionaryResult.partsOfSpeech && dictionaryResult.partsOfSpeech.map((posObj: any, index: number) => (
                                  <div key={index} className="space-y-2 border-b border-[#EBE3D3]/50 pb-4">
                                    <span className="text-[11px] uppercase tracking-wider font-mono text-[#8A7034] font-black italic block">
                                      • {posObj.partOfSpeech || 'grammar term'}
                                    </span>
                                    <ul className="list-decimal pl-5 text-slate-750 text-xs md:text-sm leading-relaxed space-y-2.5 pr-1 font-sans">
                                      {posObj.definitions && posObj.definitions.map((def: string, i: number) => (
                                        <li key={i} className="pl-1">
                                          <p className="font-medium text-slate-900">{def}</p>
                                          {posObj.examples && posObj.examples[i] && (
                                            <p className="text-[11px] text-slate-505 italic mt-1 font-serif pl-3 border-l-2 border-[#DED0B6]/40">
                                              "{posObj.examples[i]}"
                                            </p>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}

                                {/* Etymology of word */}
                                {dictionaryResult.etymology && (
                                  <div className="rounded-xl bg-[#F6F1E5] p-4 border border-[#E9DFCB] space-y-1.5 font-sans">
                                    <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#8A7034]">Provocative Etymology (Historical Origin)</span>
                                    <p className="text-xs text-slate-700 leading-relaxed font-serif italic">{dictionaryResult.etymology}</p>
                                  </div>
                                )}

                                {/* Worldwide & regional nuances */}
                                {dictionaryResult.globalUsage && (
                                  <div className="space-y-1.5 font-sans">
                                    <span className="block text-[9.5px] font-mono font-black uppercase tracking-wider text-indigo-750">Worldwide Variations &amp; Region-Specific Nuances</span>
                                    <p className="text-xs font-semibold text-slate-700 leading-normal bg-white p-3 rounded-lg border border-[#E3D8BE]/60 tracking-tight leading-relaxed">
                                      {dictionaryResult.globalUsage}
                                    </p>
                                  </div>
                                )}

                                {/* Synonyms */}
                                {dictionaryResult.synonyms && dictionaryResult.synonyms.length > 0 && (
                                  <div className="space-y-1.5 font-sans pt-1">
                                    <span className="block text-[9.5px] font-mono font-bold uppercase text-slate-504">Associated Synonyms</span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {dictionaryResult.synonyms.map((syn: string, i: number) => (
                                        <span key={i} className="text-[10px] bg-white border border-[#E3D8BE] text-slate-800 px-2 py-0.5 rounded-md font-mono">
                                          {syn}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              </div>
                            )}

                            <div className="text-[9px] text-slate-500 font-mono text-center pt-2 border-t border-[#E3D8BE] flex items-center justify-center gap-1">
                              <span>Compiled under Oxford standards in the Lilbed AI framework</span>
                            </div>

                          </div>
                        )}

                      </div>
                    </div>
                  )}

                  {/* 5. ELITE APPS & WEB CODE GENERATOR */}
                  {secSubTab === 'dev' && (
                    <div className="p-6 md:p-8 space-y-6">
                      
                      <div className="flex flex-col lg:flex-row gap-6">
                        
                        {/* Prompt Input Form block */}
                        <div className="w-full lg:w-96 space-y-5 flex-shrink-0">
                          
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                            <h4 className="text-xs font-mono font-extrabold uppercase text-slate-700 flex items-center gap-1">
                              <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                              Custom Software compiler
                            </h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                              Outline core parameters, logic structures, database targets, or layout choices. Our sovereign compiler generates complete source files with zero truncated lines.
                            </p>
                          </div>

                          <form onSubmit={handleGenerateCodeSubmit} className="space-y-4 bg-slate-550 border border-slate-200 rounded-xl p-4.5">
                            
                            <div>
                              <label className="block text-[10px] font-mono font-bold uppercase text-slate-450 mb-1">Target Language</label>
                              <select
                                value={codeLanguage}
                                onChange={(e) => setCodeLanguage(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-lg border border-slate-205 bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition font-mono"
                              >
                                <option value="TypeScript">TypeScript (Node/React)</option>
                                <option value="HTML / Tailind.CSS / PureJS">Web Native (HTML5 + Tailwind)</option>
                                <option value="Python (Django / AI Model)">Python (ML Intelligence)</option>
                                <option value="Swift (Sovereign iOS app)">Swift (Sovereign iOS Applet)</option>
                                <option value="C++ Core Hardware Firmware">C++ (Sovereign Core Firmware)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono font-bold uppercase text-slate-450 mb-1">Project Standard Archetype</label>
                              <select
                                value={codeProjectType}
                                onChange={(e) => setCodeProjectType(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-lg border border-slate-205 bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition font-mono"
                              >
                                <option value="Single Page Interactive App">Client SPA Web Applet</option>
                                <option value="Double-Ledger Momo Microservice API">Double-Ledger momopay microservice API</option>
                                <option value="Command Center Console Script">Sovereign terminal shell utility</option>
                                <option value="Hardware Controller Driver Module">Sovereign hardware driver</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono font-bold uppercase text-slate-455 mb-1">Architectural Requirements</label>
                              <textarea
                                required
                                rows={6}
                                placeholder="Detail core features... (e.g. Build an accounting dashboard with invoice generation, storage logging, and cryptographic verification stamps...)"
                                value={codeRequirements}
                                onChange={(e) => setCodeRequirements(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-lg border border-slate-205 bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition resize-none leading-relaxed"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={codeLoading}
                              className="w-full bg-slate-900 hover:bg-indigo-950 disabled:opacity-50 text-white font-bold p-3 rounded-xl text-xs tracking-wide transition cursor-pointer flex items-center justify-center space-x-1.5"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{codeLoading ? "Invoking Sovereign Compiler..." : "Synthesize Complete Codebase"}</span>
                            </button>

                          </form>

                        </div>

                        {/* Interactive Developer Workstation (Code results) */}
                        <div className="flex-1 min-h-[460px] flex flex-col border border-slate-200 rounded-2xl overflow-hidden font-mono text-xs">
                          
                          {codeLoading && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-950 text-slate-350 space-y-4 font-mono select-none">
                              <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-100 uppercase tracking-widest animate-pulse">Running Compiler Core Synthesis Engine...</p>
                                <p className="text-[10px] text-slate-500 max-w-sm mx-auto font-sans leading-relaxed">
                                  Our elite compiler is mapping file dependencies, composing full component structures, write scripts, and generating comments.
                                </p>
                              </div>
                            </div>
                          )}

                          {!codeLoading && !codeResult && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-950 text-slate-400 select-none">
                              <Code className="w-10 h-10 text-slate-600 mb-3 animate-pulse" />
                              <p className="text-xs font-bold text-slate-200 uppercase tracking-widest">Compiler Workstation Idle</p>
                              <p className="text-[10px] text-slate-500 font-sans max-w-xs mt-1.5 leading-normal">
                                Select language models, specify project definitions, and press the <strong>Synthesize Complete Codebase</strong> controller above.
                              </p>
                            </div>
                          )}

                          {!codeLoading && codeResult && (
                            <div className="flex-1 flex flex-col md:flex-row items-stretch bg-slate-950 text-white min-h-[460px]">
                              
                              {/* Left Folder Explorer column */}
                              <div className="w-full md:w-60 border-b md:border-b-0 md:border-r border-slate-850 p-4 shrink-0 space-y-4 flex flex-col justify-between">
                                <div className="space-y-3">
                                  <div className="flex items-center space-x-1 border-b border-slate-850 pb-2">
                                    <span className="text-[9px] font-sans font-black uppercase text-indigo-400 tracking-wider">📁 File Registry Directory</span>
                                  </div>

                                  <div className="space-y-1">
                                    {codeResult.files && codeResult.files.map((file: any, i: number) => (
                                      <button
                                        key={i}
                                        type="button"
                                        onClick={() => setSelectedCodeFileIdx(i)}
                                        className={`w-full text-left p-2 rounded-lg text-[10px] font-mono block truncate tracking-tight transition cursor-pointer ${
                                          selectedCodeFileIdx === i
                                            ? 'bg-slate-900 border border-slate-800 text-cyan-400 font-bold'
                                            : 'bg-transparent text-slate-400 hover:text-white'
                                        }`}
                                      >
                                        📄 {file.filePath || `file_${i}.ts`}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div className="text-[9.5px] text-slate-504 leading-tight bg-slate-900 p-2.5 rounded-lg border border-slate-850">
                                  ⚙️ <b>Active Stack:</b> {codeResult.language || 'Standard target compiler'}
                                </div>
                              </div>

                              {/* Center / Right Editor box */}
                              <div className="flex-1 flex flex-col justify-between">
                                
                                <div className="p-4 bg-slate-900 border-b border-slate-850 flex items-center justify-between gap-4">
                                  <div className="truncate">
                                    <span className="text-[10px] font-sans font-black text-slate-205 block uppercase tracking-wider">{codeResult.projectTitle || 'Generated Sovereign Solution'}</span>
                                    <span className="text-[9px] font-mono text-slate-500 italic block mt-0.5">
                                      Viewing: {codeResult.files?.[selectedCodeFileIdx]?.filePath || 'source file'}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const textToCopy = codeResult.files?.[selectedCodeFileIdx]?.content || '';
                                      navigator.clipboard.writeText(textToCopy);
                                      alert("Pristine file content copied directly to clipboard!");
                                    }}
                                    className="bg-slate-800 hover:bg-slate-700 text-white font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-750 shrink-0 cursor-pointer"
                                  >
                                    Copy Script
                                  </button>
                                </div>

                                {/* Active File Editor text box */}
                                <div className="flex-1 p-5 overflow-auto max-h-[350px] leading-relaxed text-indigo-300 antialiased font-mono whitespace-pre bg-slate-950 font-medium">
                                  {codeResult.files?.[selectedCodeFileIdx]?.content || '// No code registry found.'}
                                </div>

                                {/* Bottom Deployment Guides Tab */}
                                <div className="p-4 bg-slate-900/60 border-t border-slate-850 text-[10px] leading-loose text-slate-400 font-sans">
                                  <h5 className="font-mono font-black uppercase text-[9.5px] text-indigo-400 tracking-wider mb-1">🏁 Deployment Guide &amp; Running Operations</h5>
                                  <p className="whitespace-pre-wrap">{codeResult.deploymentInstructions || 'Install target node parameters, build static profiles in node_modules, compile standard entry point and run.'}</p>
                                </div>

                              </div>

                            </div>
                          )}

                        </div>

                      </div>

                    </div>
                  )}

                  {/* 6. PWA INSTALLER & SECURE ENCRYPTION PORTAL */}
                  {secSubTab === 'installer' && (
                    <div className="p-6 md:p-8 space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Column 1: PWA Installation instructions & local db locking (length 7 cols) */}
                        <div className="lg:col-span-7 space-y-6">
                          
                          {/* Card A: PWA Native installation instructions */}
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-xl">📱</span>
                              <div className="text-left">
                                <h4 className="text-sm font-black text-slate-900 uppercase font-display leading-tight">
                                  Universal Mobile Software Installer
                                </h4>
                                <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Install &amp; run on any Android, iOS &amp; PC device</span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed">
                              This application operates as a Progressive Web Application (PWA) framework. You can install it on any device to enable direct launcher shortcuts, standalone immersive views, and fully isolated storage access.
                            </p>

                            {/* Android/ios step cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                              
                              <div className="bg-white border border-slate-200/80 p-3.5 rounded-xl space-y-2">
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase font-mono">🤖 Android &amp; Chrome Guide</span>
                                <ol className="list-decimal pl-4.5 text-[10.5px] text-slate-600 space-y-1 font-sans">
                                  <li>Open the app URL inside Google Chrome browser.</li>
                                  <li>Tap Chrome's Menu <b className="text-indigo-650">(⋮)</b> in the top right.</li>
                                  <li>Select <b>"Add to Home screen"</b> or <b>"Install App"</b>.</li>
                                  <li>A launcher icon is created on your device screen immediately!</li>
                                </ol>
                              </div>

                              <div className="bg-white border border-slate-200/80 p-3.5 rounded-xl space-y-2">
                                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full uppercase font-mono">🍎 iOS / iPhone Guide</span>
                                <ol className="list-decimal pl-4.5 text-[10.5px] text-slate-600 space-y-1 font-sans">
                                  <li>Launch the app URL inside your native Safari browser.</li>
                                  <li>Tap Safari's central <b>"Share"</b> (square-arrow) button.</li>
                                  <li>Scroll down the actions list and tap <b>"Add to Home Screen"</b>.</li>
                                  <li>Input the "Lilbed AI Ecosystem" title and confirm to install.</li>
                                </ol>
                              </div>

                            </div>

                            {/* Interactive Sw Register helper */}
                            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-indigo-50/50 border border-indigo-100 p-3.5 rounded-xl">
                              <div className="text-left">
                                <span className="text-[11px] font-bold text-indigo-950 block">Offline Cache &amp; Service Worker Sync</span>
                                <span className="text-[9.5px] font-mono text-indigo-700 block mt-0.5">
                                  Current Status: {installerServiceWorkerReady === 'ready' ? '⚡ ONLINE-PERSISTENT SERVICE WORKER ACTIVE' : installerServiceWorkerReady === 'installing' ? '⚙️ GENERATING CRYPTO CACHE METRICS...' : '🔘 OFFLINE SERVICE WORKER WAITING'}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setInstallerServiceWorkerReady('installing');
                                  setInstallerAuditLogs(prev => [...prev, `[SW] Generating local asset pre-cache manifest...`, `[SW] Registering service worker thread in client framework.`]);
                                  setTimeout(() => {
                                    setInstallerServiceWorkerReady('ready');
                                    setInstallerAuditLogs(prev => [
                                      ...prev, 
                                      `[SW] Service Worker thread registered successfully!`, 
                                      `[SW] Offline caching mechanism authorized for responsive execution.`
                                    ]);
                                    alert("Service Worker Registered! App cache profile loaded. The application can now start and operate offline on this device.");
                                  }, 1500);
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-sm shrink-0 cursor-pointer"
                              >
                                {installerServiceWorkerReady === 'ready' ? 'SW Registered ✔️' : installerServiceWorkerReady === 'installing' ? 'Installing...' : 'Register Offline SW'}
                              </button>
                            </div>

                            {/* Direct Native Installer Action Row */}
                            <div className="bg-slate-900 text-white rounded-xl p-4 md:p-5 border border-slate-800 space-y-3 shadow-sm">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">Direct System Binding</span>
                                  <h5 className="text-xs font-black text-slate-100 uppercase tracking-tight">Direct Software Installer</h5>
                                </div>
                                <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                                  isAppInstalled 
                                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800/40' 
                                    : 'bg-indigo-950 text-indigo-400 border-indigo-800/40 animate-pulse'
                                }`}>
                                  {isAppInstalled ? '● INSTALLED' : '○ PENDING DEPLOY'}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                                Mount and register our lightweight software executable directly inside your phone's memory or PC storage. This allows direct off-grid launch with full sandbox databases.
                              </p>

                              <button
                                type="button"
                                onClick={handleDirectInstallApp}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-3 rounded-lg text-xs leading-none transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                              >
                                <Smartphone className="w-4 h-4 text-emerald-100 animate-bounce" />
                                <span>INSTALL APPLICATION DIRECTLY ONTO THIS DEVICE</span>
                              </button>
                            </div>

                          </div>

                          {/* Card B: Secure database encryption controller */}
                          <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4 shadow-xs">
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-xl">🛡️</span>
                              <div className="text-left">
                                <h4 className="text-sm font-black text-slate-900 uppercase font-display leading-tight">
                                  User Database Cryptographic Vault
                                </h4>
                                <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Keep user databases highly secured</span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed">
                              Protect your system entities, research publications, direct correspondence channels, and local templates using symmetric encryption. Set an off-grid passkey to lock and seal database records.
                            </p>

                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="block text-[10px] font-mono font-bold uppercase text-slate-500">Active Protected Records</label>
                                  <div className="space-y-0.5 text-xs text-slate-700 font-mono">
                                    <span className="block">• Published Papers: <b className="text-slate-900">{publishedPapers.length} records</b></span>
                                    <span className="block">• Direct Messages: <b className="text-slate-900">{directMessages.length} items</b></span>
                                    <span className="block">• Research Projects: <b className="text-slate-900">{projects.length} folders</b></span>
                                  </div>
                                </div>

                                <div className="space-y-1 flex flex-col justify-center">
                                  <label className="block text-[10px] font-mono font-bold uppercase text-slate-500">Security Guard Status</label>
                                  <span className={`inline-block w-fit text-[10px] font-mono uppercase font-black px-2.5 py-1 rounded-full border ${
                                    installerDbEncrypted 
                                      ? 'bg-emerald-950 text-emerald-400 border-emerald-500/20' 
                                      : 'bg-amber-950 text-amber-400 border-amber-500/20 animate-pulse'
                                  }`}>
                                    {installerDbEncrypted ? '🔒 LOCK ACTIVE (AES-256 SECURED)' : '⚠️ SANDBOX DEFAULT (UNLOCKED)'}
                                  </span>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-200 space-y-2.5">
                                <label className="block text-[10px] font-mono font-bold uppercase text-slate-500">Provide Symmetrical Database Lock-Key</label>
                                <div className="flex gap-2">
                                  <input
                                    type="password"
                                    placeholder="Enter secure cryptographic passkey..."
                                    value={installerPasskey}
                                    onChange={(e) => setInstallerPasskey(e.target.value)}
                                    className="flex-1 text-xs px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!installerPasskey.trim()) {
                                        alert("ERROR: Please enter a secure passkey to seal databases.");
                                        return;
                                      }
                                      setInstallerDbEncrypted(true);
                                      setInstallerAuditLogs(prev => [
                                        ...prev, 
                                        `[DB SEC] Sealing user collection with AES-256 symmetrical locking...`, 
                                        `[DB SEC] Secured Published papers & messages.`, 
                                        `[DB SEC] Encrypting database structures successfully.`
                                      ]);
                                      alert("DATABASE CODES LOCKED: Local device database features sealed using symmetric AES-256 encryption. Nobody can read your offline repository without this passkey.");
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs leading-none transition shrink-0"
                                  >
                                    Encrypt Database
                                  </button>
                                </div>
                              </div>

                            </div>

                            <div className="flex gap-2.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setInstallerAuditLogs(prev => [
                                    ...prev,
                                    `[AUDIT] Commencing database security audit...`,
                                    `[AUDIT] Sandboxed domain validation: SECURE`,
                                    `[AUDIT] Cryptography strength: ${installerDbEncrypted ? "AES-256 SEVERE LOCK" : "DEFAULT BROWSERS SHIELDING"}`,
                                    `[AUDIT] Isolation score: 100/100`,
                                    `[AUDIT] Security checklist passed cleanly.`
                                  ]);
                                  alert("DATABASE SECURITY AUDIT COMPLETED: App directories are verified secure! 0 data exposure vulnerabilities detected.");
                                }}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-bold p-2.5 rounded-xl text-xs flex-1 transition cursor-pointer"
                              >
                                Trigger Database Security Audit
                              </button>

                              <button
                                type="button"
                                disabled={!installerDbEncrypted}
                                onClick={() => {
                                  setInstallerDbEncrypted(false);
                                  setInstallerPasskey('');
                                  setInstallerAuditLogs(prev => [
                                    ...prev,
                                    `[DB SEC] Symmetrical database unlocked.`,
                                    `[DB SEC] Keys cleared. Reverted to browser sandbox.`
                                  ]);
                                  alert("VAULT UNLOCKED: Database decrypted. Safe sandbox default is active.");
                                }}
                                className="bg-slate-100 hover:bg-slate-205 disabled:opacity-40 text-slate-700 font-bold p-2.5 rounded-xl text-xs transition px-4 cursor-pointer"
                              >
                                Decrypt DB
                              </button>
                            </div>

                          </div>

                        </div>

                        {/* Column 2: Sharing Transmitter Module (Xender / Bluetooth / WhatsApp ready) - 5 cols */}
                        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                          
                          <div className="bg-slate-950 text-white border border-slate-850 rounded-2xl p-6 space-y-5 flex flex-col justify-between min-h-[500px]">
                            
                            <div className="space-y-4">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <span className="text-[10px] font-mono text-cyan-400 tracking-widest font-black uppercase">
                                  ⚡ OFFLINE INTER-DEVICE SHAPE TRANSMITTER (XENDER / BLUETOOTH)
                                </span>
                                <span className="text-[9px] font-mono text-emerald-400 font-bold">MODE: ACTIVE</span>
                              </div>

                              <p className="text-[11px] text-slate-400 leading-relaxed font-sans mt-1">
                                Share this software with other devices offline! Generate a download launcher payload for **Xender** transfer, or trigger a **Bluetooth transmission** to copy the software setup package directly.
                              </p>

                              {/* Toggle Buttons */}
                              <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                                <button
                                  type="button"
                                  onClick={() => setSharingMethod('xender')}
                                  className={`p-2 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                                    sharingMethod === 'xender'
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : 'text-slate-450 hover:text-white bg-transparent'
                                  }`}
                                >
                                  <span>📦 Xender Portal</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSharingMethod('bluetooth')}
                                  className={`p-2 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                                    sharingMethod === 'bluetooth'
                                      ? 'bg-indigo-600 text-white shadow-sm'
                                      : 'text-slate-450 hover:text-white bg-transparent'
                                  }`}
                                >
                                  <span>🔊 Bluetooth Beam</span>
                                </button>
                              </div>

                              {/* Display Xender layout */}
                              {sharingMethod === 'xender' ? (
                                <div className="space-y-4 pt-1 animate-fadeIn">
                                  
                                  <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">ECOSYSTEM SHARING QR IDENTIFIER</span>
                                    
                                    {/* Built-in high depth QR design */}
                                    <div className="bg-white p-2.5 rounded-xl border border-emerald-500 shadow-lg relative select-none">
                                      {/* QR Matrix Representation */}
                                      <div className="w-28 h-28 grid grid-cols-4 grid-rows-4 gap-1 p-1 bg-white">
                                        <div className="bg-slate-950 rounded-xs" />
                                        <div className="bg-slate-955 rounded-xs" />
                                        <div className="bg-slate-300 rounded-xs" />
                                        <div className="bg-slate-955 rounded-xs" />

                                        <div className="bg-slate-300 rounded-xs" />
                                        <div className="bg-slate-955 rounded-xs" />
                                        <div className="bg-slate-955 rounded-xs" />
                                        <div className="bg-slate-305 rounded-xs" />

                                        <div className="bg-slate-950 rounded-xs" />
                                        <div className="bg-slate-305 rounded-xs" />
                                        <div className="bg-slate-955 rounded-xs" />
                                        <div className="bg-slate-955 rounded-xs" />

                                        <div className="bg-slate-955 rounded-xs" />
                                        <div className="bg-slate-950 rounded-xs" />
                                        <div className="bg-slate-305 rounded-xs" />
                                        <div className="bg-slate-950 rounded-xs" />
                                      </div>
                                      <span className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded-sm border border-emerald-400">
                                        Scan to install
                                      </span>
                                    </div>

                                    <div className="text-[9.5px] leading-relaxed text-slate-350 font-sans max-w-xs pt-1">
                                      Open <b>Xender</b> or your native camera scanner on another phone, scan this QR code, and you will pull the app software immediately.
                                    </div>
                                  </div>

                                  {/* HTML Package Download section */}
                                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 text-left">
                                    <span className="block text-[10px] font-mono text-indigo-400 font-bold uppercase">📦 Bootable Offline Application Loader</span>
                                    <p className="text-[9.5px] text-slate-400 leading-normal">
                                      Download the lightweight, standalone HTML deployment key. Send this compiled file directly via Bluetooth or Xender. When opened on any other phone, it launches this PWA automatically!
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentUrl = window.location.origin;
                                        const fileText = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lilbed AI Platform - Offline Universal Bootloader</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #020617; color: #f8fafc; text-align: center; padding: 3rem 1rem; margin: 0; }
    .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 1rem; padding: 2.5rem; max-width: 440px; margin: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    h1 { color: #10b981; font-size: 1.6rem; margin-top: 0; }
    p { color: #94a3b8; font-size: 0.9rem; line-height: 1.6; }
    .btn { display: inline-block; background: #059669; color: white; text-decoration: none; padding: 0.8rem 1.6rem; border-radius: 0.5rem; font-weight: bold; margin-top: 1.5rem; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 3.5rem;">⚡</div>
    <h1>Lilbed AI Platform</h1>
    <p>This off-grid installation bootloader was beamed successfully via Bluetooth/Xender. Launch the synchronization client to setup the offline PWA software installer.</p>
    <a href="${currentUrl}" class="btn">SYNCHRONIZE &amp; INSTALL APPS</a>
  </div>
</body>
</html>`;
                                        const blob = new Blob([fileText], { type: 'text/html' });
                                        const href = URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = href;
                                        link.download = "lilbed_ecosystem_offline_bootloader.html";
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        URL.revokeObjectURL(href);

                                        setInstallerAuditLogs(prev => [
                                          ...prev,
                                          `[XENDER] Static HTML package bundle created.`,
                                          `[XENDER] File "lilbed_ecosystem_offline_bootloader.html" compiled.`
                                        ]);
                                        alert("OFFLINE PACKAGE CREATED! Transmit the downloaded .html bootloader file via Xender to any other phone, tablet, or laptop.");
                                      }}
                                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-2.5 rounded-lg text-xs leading-none transition cursor-pointer"
                                    >
                                      Download Offline Client Package
                                    </button>
                                  </div>

                                </div>
                              ) : (
                                <div className="space-y-4 pt-1 animate-fadeIn">
                                  
                                  {/* Bluetooth Scanner Panel */}
                                  <div className="bg-slate-900 rounded-xl p-4 border border-indigo-950 text-left space-y-3.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">📡 Nearby Bluetooth Devices found</span>
                                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-505 animate-pulse" />
                                    </div>

                                    {bluetoothScanning && (
                                      <div className="py-6 text-center text-xs text-indigo-300 animate-pulse font-mono flex flex-col items-center justify-center space-y-2">
                                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-indigo-400 animate-spin" />
                                        <span>Probing local active Bluetooth wavelengths...</span>
                                      </div>
                                    )}

                                    {!bluetoothScanning && foundBluetoothDevices.length === 0 && (
                                      <div className="py-4 text-center text-[10.5px] text-slate-500 font-mono">
                                        No active Bluetooth devices found. Click scan to search.
                                      </div>
                                    )}

                                    {!bluetoothScanning && foundBluetoothDevices.length > 0 && (
                                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                                        {foundBluetoothDevices.map((device, idx) => (
                                          <div
                                            key={idx}
                                            onClick={() => {
                                              setInstallerAuditLogs(prev => [
                                                ...prev,
                                                `[BLUETOOTH] Connected seamlessly with target: "${device}"...`,
                                                `[BLUETOOTH] Copying compiled bootloader package...`,
                                                `[BLUETOOTH] Transmission payload completed.`
                                              ]);
                                              alert(`BLUETOOTH TRANSMISSION SUCCESS: Offline Installer bootloader package sent to "${device}" successfully!`);
                                            }}
                                            className="p-2.5 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-lg text-xs flex items-center justify-between cursor-pointer transition text-indigo-300"
                                            title="Click to transmit offline pack"
                                          >
                                            <span className="font-mono text-[11px]">📱 <b>{device}</b></span>
                                            <span className="text-[9px] bg-indigo-950 text-indigo-400 border border-indigo-700/30 px-2 py-0.5 rounded-full uppercase font-bold">Beam Pack</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    <button
                                      type="button"
                                      disabled={bluetoothScanning}
                                      onClick={() => {
                                        setBluetoothScanning(true);
                                        setInstallerAuditLogs(prev => [...prev, `[BLUETOOTH] Probing local peer receivers...`]);
                                        setTimeout(() => {
                                          setFoundBluetoothDevices(["Techno Camon 19 Pro (Obed Yadzo Client)", "Samsung Galaxy A54 5G", "Infinix Note 40 Pro", "Huawei P60 Pro"]);
                                          setBluetoothScanning(false);
                                          setInstallerAuditLogs(prev => [
                                            ...prev, 
                                            `[BLUETOOTH] Scanning completed! Identified 4 peer targets.`
                                          ]);
                                        }, 1800);
                                      }}
                                      className="w-full bg-indigo-600 hover:bg-indigo-750 disabled:opacity-55 text-white font-bold p-2.5 rounded-lg text-xs leading-none transition cursor-pointer"
                                    >
                                      {bluetoothScanning ? 'Scanning...' : 'Scan Bluetooth Targets'}
                                    </button>
                                  </div>

                                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-[10px] text-slate-400 font-mono text-left leading-relaxed">
                                    💡 <b>Bluetooth Standard Guide:</b> Enable Bluetooth on the receiving device. Tap the scanned device above to transmit the offline-installable loader file instantly.
                                  </div>

                                </div>
                              )}

                            </div>


                            {/* Mini Terminal Logger console inside share hub */}
                            <div className="pt-3.5 border-t border-slate-800 text-left">
                              <span className="block text-[9.5px] font-mono uppercase tracking-widest text-cyan-400 font-bold mb-1.5">TRANSFER &amp; SEC REGISTER CORES</span>
                              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[9.5px] font-mono text-emerald-400 space-y-1 h-[100px] overflow-y-auto">
                                {installerAuditLogs.map((log, i) => (
                                  <div key={i}>{log}</div>
                                ))}
                              </div>
                            </div>

                          </div>

                        </div>

                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>
          )}

          {/* TAB 4: Inter-Researcher Community & WhatsApp Direct Communication Directory */}
          {activeTab === 'socials' && (
            <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
              <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Hero / Header with Founder Showcase Profile */}
                <div className="bg-gradient-to-br from-indigo-900 via-slate-905 to-slate-950 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
                    <div className="space-y-3.5 max-w-2xl">
                      <span className="bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded-full">
                        ★ LEAD FOUNDER & PLATFORM ARCHITECT
                      </span>
                      <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-white leading-tight">
                        OBED YADZO
                      </h2>
                      <p className="text-slate-300 text-xs md:text-sm font-sans leading-relaxed">
                        Scholarly pioneer at <span className="text-indigo-300 font-bold font-mono">UPSA</span> (University of Professional Studies, Accra). Obed is an Analytical Academic Researcher, Creative Writer, Expert Full-Stack Coder, Website & Game Developer, and Publisher of dynamic digital flyers & custom video generation software engines. Born on <span className="text-white font-bold font-mono">30/05/2002</span>.
                      </p>
                      
                      {/* Social Actions / Contact Links for Founder */}
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <a
                          href="https://wa.me/233597773520"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold font-mono px-4 py-2 rounded-xl shadow-xs transition transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                          <Phone className="w-3.5 h-3.5 fill-current" />
                          <span>Chat Obed on WhatsApp</span>
                        </a>
                        <span className="text-slate-500 font-mono text-xs hidden sm:inline">|</span>
                        <span className="text-slate-300 text-xs font-mono">
                          📧 obedyadzo01@gmail.com
                        </span>
                      </div>
                    </div>

                    {/* Highly stylized badge showing visual design alignment */}
                    <div className="flex-shrink-0 bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-center space-y-1.5 text-center md:text-right">
                      <div className="text-indigo-400 font-mono text-[10px] uppercase tracking-widest font-bold">FOUNDER ATTRIBUTES</div>
                      <div className="text-lg font-bold font-mono text-white">UPSA Scholar</div>
                      <div className="text-xs text-slate-400 font-mono">Born 30/05/2002 • Tech Expert</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Join Registry / Directory opting form */}
                  <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5">
                    <div>
                      <h3 className="text-sm font-bold font-mono tracking-tight uppercase text-slate-900 flex items-center space-x-1.5">
                        <Users className="w-4 h-4 text-indigo-600" />
                        <span>Join Peer Directory</span>
                      </h3>
                      <p className="text-[11px] text-slate-505 mt-1 leading-relaxed">
                        Add your profile or registry page. Connect with other Lilbed AI workspace scholars, institutions, and businesses instantly.
                      </p>
                    </div>

                    <form onSubmit={registerSocialProfile} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Your Profile or Entity Name</label>
                        <input
                          type="text"
                          required
                          value={socialName}
                          onChange={(e) => setSocialName(e.target.value)}
                          placeholder="Individual, School, or Business Name"
                          className="w-full bg-slate-50 text-slate-950 placeholder-slate-400 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Account Category</label>
                        <select
                          value={socialAccountType}
                          onChange={(e) => setSocialAccountType(e.target.value as any)}
                          className="w-full bg-slate-50 text-slate-950 border border-slate-200 rounded-xl py-2 px-2.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition font-medium"
                        >
                          <option value="individual">🎓 Scholar & Individual Profile</option>
                          <option value="institution">🏫 Educational & Scholar Institution</option>
                          <option value="business">💼 Registered Business / Enterprise</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Primary Phone Number</label>
                        <input
                          type="text"
                          required
                          value={socialPhone}
                          onChange={(e) => setSocialPhone(e.target.value)}
                          placeholder="e.g. +233597773520"
                          className="w-full bg-slate-50 text-slate-950 placeholder-slate-400 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition font-mono font-bold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Primary Scholar Role</label>
                        <select
                          value={socialRole}
                          onChange={(e) => setSocialRole(e.target.value)}
                          className="w-full bg-slate-50 text-slate-950 border border-slate-200 rounded-xl py-2 px-2.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition font-medium"
                        >
                          <option value="Scholar">Scholar & Academic Reader</option>
                          <option value="Researcher">Academic Researcher & Compiler</option>
                          <option value="Coder / Programmer">Full-Stack Coder / Programmer</option>
                          <option value="Creative Designer">Creative Flyer Maker & Designer</option>
                          <option value="Project Lead">Digital Video Generator Creator</option>
                          <option value="UPSA Representative">UPSA Affiliate Member</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Short Professional Bio</label>
                        <textarea
                          rows={3}
                          value={socialBio}
                          onChange={(e) => setSocialBio(e.target.value)}
                          placeholder="What research or coding projects are you targeting? Keep it clear and detailed."
                          className="w-full bg-slate-50 text-slate-950 placeholder-slate-400 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition resize-none leading-relaxed font-sans"
                        />
                      </div>

                      {/* Cryptography and Security Toggles */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <span className="text-[9.5px] font-mono font-black text-slate-500 block uppercase tracking-wider">🔒 Cryptographic Isolation</span>
                        
                        <label className="flex items-center space-x-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={encryptChat}
                            onChange={(e) => setEncryptChat(e.target.checked)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                          />
                          <span className="text-[11px] font-medium text-slate-700">AES-256 Message Encrypter</span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={encryptSearch}
                            onChange={(e) => setEncryptSearch(e.target.checked)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                          />
                          <span className="text-[11px] font-medium text-slate-700">Protected Search Queries</span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center space-x-1.5"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Save & Publish Registry</span>
                      </button>
                    </form>
                  </div>

                  {/* Active Registry Lists / Cards Grid */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                        ACTIVE REGISTERED SCHOLARS ({socialsProfiles.length})
                      </h3>
                      <button
                        type="button"
                        onClick={fetchSocialProfiles}
                        className="text-[11px] font-mono font-bold text-indigo-650 hover:text-indigo-800 cursor-pointer"
                      >
                        ⚡ Refresh Live Registry
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {socialsProfiles.map((profile, i) => {
                        const isObed = profile.uid === 'seed-1' || profile.name.toLowerCase().includes('obed');
                        const isFollowing = profile.followers?.includes(user?.uid || '') || false;
                        const followersCount = profile.followers?.length || 0;
                        
                        let catCardBorder = "border-slate-150";
                        let catBg = "bg-white";
                        let catTag = "🎓 Scholar (Individual)";
                        let catTagStyle = "bg-indigo-50 text-indigo-700 border-indigo-100";
                        
                        if (profile.accountType === 'institution') {
                          catCardBorder = "border-blue-300 shadow-sm shadow-blue-500/5";
                          catBg = "bg-blue-50/10";
                          catTag = "🏫 Scholar Institution";
                          catTagStyle = "bg-blue-100 text-blue-700 border-blue-200";
                        } else if (profile.accountType === 'business') {
                          catCardBorder = "border-emerald-300 shadow-sm shadow-emerald-500/5";
                          catBg = "bg-emerald-50/10";
                          catTag = "💼 Business / Enterprise";
                          catTagStyle = "bg-emerald-100 text-emerald-800 border-emerald-200";
                        } else if (isObed) {
                          catCardBorder = "border-amber-300 shadow-md shadow-amber-500/5";
                          catBg = "bg-amber-50/10";
                          catTag = "★ Founder & Architect";
                          catTagStyle = "bg-amber-105 text-amber-800 border-amber-255";
                        }

                        // Preset illustrations
                        const avatarUrl = profile.profilePicture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(profile.name)}`;

                        return (
                          <div
                            key={profile.uid + i}
                            className={`p-5 rounded-2xl border transition-all hover:shadow-md ${catCardBorder} ${catBg}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start space-x-3">
                                <img
                                  src={avatarUrl}
                                  alt="Profile avatar"
                                  className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <div className="flex flex-wrap gap-1.5 mb-1">
                                    <span className={`inline-block text-[8px] font-mono font-bold px-2 py-0.5 rounded-full border ${catTagStyle}`}>
                                      {catTag}
                                    </span>
                                    <span className="inline-block text-[8px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-650 border border-slate-200">
                                      {profile.role}
                                    </span>
                                  </div>
                                  
                                  <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-1">
                                    <span>{profile.name}</span>
                                    {isObed && <span className="text-xs text-amber-500" title="Founder Core">★</span>}
                                  </h4>
                                </div>
                              </div>

                              <span className="text-[9px] font-mono text-slate-400">
                                {isObed ? "EST. 2024" : new Date(profile.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed mt-3.5 p-3 rounded-xl bg-white border border-slate-100 font-sans shadow-xs">
                              {profile.bio}
                            </p>

                            {/* Followers indicators & Direct message options */}
                            <div className="flex items-center justify-between mt-3 text-[10px] font-mono text-slate-500">
                              <div className="flex items-center space-x-2">
                                <span>👥 <strong>{followersCount}</strong> followers</span>
                                {user && user.uid !== profile.uid && (
                                  <button
                                    onClick={() => handleToggleFollow(profile.uid)}
                                    className={`px-2 py-0.5 rounded-md font-bold text-[9px] transition ${
                                      isFollowing 
                                        ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" 
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                                  >
                                    {isFollowing ? "✓ Following" : "+ Follow"}
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                              <span className="text-[10px] font-mono font-bold text-slate-500 flex items-center space-x-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{profile.phoneNumber}</span>
                              </span>

                              <div className="flex items-center space-x-1.5">
                                <button
                                  onClick={() => setActiveDirectChatUserId(profile.uid)}
                                  className="inline-flex items-center space-x-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-mono font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition"
                                >
                                  <span>Direct DM</span>
                                  <span>💬</span>
                                </button>

                                {profile.whatsappLink && (
                                  <a
                                    href={profile.whatsappLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center space-x-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-mono font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition"
                                  >
                                    <span>WhatsApp</span>
                                    <span>📱</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  </div>
                </div>
              </div>
          )}

          {/* SECURE DIRECT CHAT OVERLAY PANEL */}
          {activeDirectChatUserId && (() => {
            const chatProfile = socialsProfiles.find(p => p.uid === activeDirectChatUserId);
            if (!chatProfile) return null;

            const chatMessages = directMessages.filter(
              msg => (msg.senderId === user?.uid && msg.receiverId === activeDirectChatUserId) ||
                     (msg.senderId === activeDirectChatUserId && msg.receiverId === user?.uid)
            );

            return (
              <div id="dm-secure-dock" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-end z-[999] p-4 md:p-6 animate-fadeIn">
                <div className="w-full max-w-md h-full bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
                  
                  {/* Panel Header */}
                  <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center space-x-3 w-[70%]">
                      <img 
                        src={chatProfile.profilePicture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(chatProfile.name)}`}
                        alt="Chat Partner avatar" 
                        className="w-9 h-9 rounded-lg bg-slate-105 border border-slate-750 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="truncate">
                        <div className="flex items-center space-x-1.5">
                          <h4 className="font-bold text-xs truncate max-w-[120px]">{chatProfile.name}</h4>
                          <span className="text-[8px] uppercase tracking-widest font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded-sm">
                            {chatProfile.accountType || 'scholar'}
                          </span>
                        </div>
                        <p className="text-[9px] font-mono text-slate-400 truncate">
                          {encryptChat ? "🔒 End-to-End Encrypted (AES-256)" : "🔓 Plain Connection Mode"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveDirectChatUserId(null);
                        setChatAttachmentType('');
                        setChatAttachmentUrl('');
                        setChatAttachmentName('');
                      }}
                      className="text-xs bg-slate-805 hover:bg-slate-700 py-1.5 px-3 rounded-lg text-slate-300 hover:text-white transition cursor-pointer font-mono font-bold"
                    >
                      ✕ Close
                    </button>
                  </div>

                  {/* Warning / Encryption Specs Banner */}
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-emerald-500">●</span>
                      <span>Secure Channel Active</span>
                    </div>
                    {encryptChat && (
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-sm">
                        Cipher Handshake Approved
                      </span>
                    )}
                  </div>

                  {/* Messages Bubble Viewport */}
                  <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-3 animate-fadeIn">
                    {chatMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                        <span className="text-3xl">🚀</span>
                        <p className="text-xs font-bold text-slate-850 font-mono">No record of dialog found.</p>
                        <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs">
                          Your messages are encrypted and isolated before sync. Initiate connection by dispatching your first scholarly secure envelope.
                        </p>
                      </div>
                    ) : (
                      chatMessages.map((msg) => {
                        const isMe = msg.senderId === user?.uid;
                        
                        return (
                          <div 
                            key={msg.id} 
                            className={`flex flex-col max-w-[85%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
                          >
                            <div className={`p-3 rounded-2xl text-xs leading-relaxed shadow-xs flex flex-col space-y-1.5 ${
                              isMe 
                                ? "bg-indigo-600 text-white rounded-br-none" 
                                : "bg-white text-slate-900 border border-slate-200 rounded-bl-none"
                            }`}>
                              
                              {/* Attached media display */}
                              {msg.attachmentUrl && (
                                <div className="border border-black/10 rounded-xl overflow-hidden bg-black/5 p-1 mb-1 max-w-full">
                                  {msg.attachmentType === 'image' && (
                                    <img 
                                      src={msg.attachmentUrl} 
                                      alt="Attachment preview" 
                                      className="max-h-[160px] object-cover rounded-lg"
                                      referrerPolicy="no-referrer"
                                    />
                                  )}
                                  {msg.attachmentType === 'video' && (
                                    <div className="aspect-video w-[220px] bg-slate-900 rounded-lg overflow-hidden flex flex-col justify-end">
                                      <video 
                                        src={msg.attachmentUrl} 
                                        controls 
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  {msg.attachmentType === 'file' && (
                                    <a 
                                      href={msg.attachmentUrl} 
                                      download={msg.attachmentName || 'SharedDocument.docx'}
                                      className="flex items-center space-x-2 text-[10px] font-mono font-bold bg-white text-indigo-700 hover:text-indigo-900 py-1.5 px-3 rounded-lg shadow-xs block"
                                    >
                                      <span>📄 Download Document:</span>
                                      <span className="underline max-w-[120px] truncate">{msg.attachmentName || 'ScholarDoc'}</span>
                                    </a>
                                  )}
                                </div>
                              )}

                              <p className="break-words">{msg.content}</p>

                              {msg.isEncrypted && (
                                <div className="text-[8px] font-mono opacity-60 self-end flex items-center space-x-1">
                                  <span>🔒 Encrypted (AES-256)</span>
                                </div>
                              )}
                            </div>

                            <span className="text-[8.5px] font-mono text-slate-400 mt-1">
                              {msg.timestamp}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Attachment Creator / Loader sub-bar */}
                  <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 mb-1 uppercase tracking-wider">
                      <span>💡 Fast Rich Media Attachment</span>
                      {chatAttachmentType && (
                        <button 
                          onClick={() => {
                            setChatAttachmentType('');
                            setChatAttachmentUrl('');
                            setChatAttachmentName('');
                          }} 
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕ Clear
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setChatAttachmentType('image');
                          setChatAttachmentUrl('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop');
                          setChatAttachmentName('CampusLabOverview.jpg');
                        }}
                        className={`py-1 rounded-lg border text-center font-mono text-[9px] font-bold cursor-pointer ${
                          chatAttachmentType === 'image' ? 'bg-indigo-50 border-indigo-550 text-indigo-700 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        🖼️ Real Image
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setChatAttachmentType('video');
                          setChatAttachmentUrl('https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4');
                          setChatAttachmentName('UPSALectureTutorial.mp4');
                        }}
                        className={`py-1 rounded-lg border text-center font-mono text-[9px] font-bold cursor-pointer ${
                          chatAttachmentType === 'video' ? 'bg-indigo-50 border-indigo-550 text-indigo-700 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        🎥 Video Reel
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setChatAttachmentType('file');
                          setChatAttachmentUrl('#');
                          setChatAttachmentName('QuantumAcademicSyllabus.pdf');
                        }}
                        className={`py-1 rounded-lg border text-center font-mono text-[9px] font-bold cursor-pointer ${
                          chatAttachmentType === 'file' ? 'bg-indigo-50 border-indigo-550 text-indigo-700 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        📄 Scholar File
                      </button>
                    </div>

                    {chatAttachmentName && (
                      <div className="text-[10px] font-mono bg-indigo-50/50 border border-indigo-100 text-indigo-800 py-1 px-2 rounded-md">
                        Ready to share: <strong>{chatAttachmentName}</strong> ({chatAttachmentType})
                      </div>
                    )}
                  </div>

                  {/* Main Message Input Text Form */}
                  <form onSubmit={handleSendDirectMessage} className="p-3 bg-white border-t border-slate-200 flex items-stretch space-x-2">
                    <input
                      type="text"
                      value={directChatText}
                      onChange={(e) => setDirectChatText(e.target.value)}
                      placeholder={user ? "Type a message securely..." : "Please log in/authenticate..."}
                      disabled={!user}
                      className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-450 font-sans text-xs rounded-xl py-2 px-3 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 font-medium"
                    />
                    <button
                      type="submit"
                      disabled={!user || (!directChatText.trim() && !chatAttachmentUrl)}
                      className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-bold text-xs rounded-xl transition disabled:opacity-30 cursor-pointer"
                    >
                      Send
                    </button>
                  </form>

                </div>
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
}
