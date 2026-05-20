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
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Source, Message, ResearchProject, CanvaElement, CanvaStroke, SocialProfile } from './types';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser 
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

  // App workspace modes: 'projects' | 'canva' | 'chatgpt' | 'socials'
  const [activeTab, setActiveTab] = useState<'projects' | 'canva' | 'chatgpt' | 'socials'>('projects');

  // Community Socials & WhatsApp directory state
  const [socialsProfiles, setSocialsProfiles] = useState<SocialProfile[]>([]);
  const [socialName, setSocialName] = useState('');
  const [socialPhone, setSocialPhone] = useState('');
  const [socialBio, setSocialBio] = useState('');
  const [socialRole, setSocialRole] = useState('Scholar');

  // App core states
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [depth, setDepth] = useState<'quick' | 'deep'>('deep');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ChatGPT conversational tab states
  const [chatGptInput, setChatGptInput] = useState('');
  const [chatGptHistory, setChatGptHistory] = useState<{role: 'user' | 'model', content: string, timestamp: string}[]>([
    {
      role: 'model',
      content: "Hello! I am your integrated ChatGPT co-pilot. I am optimized for writing edits, formatting tables, code generation, and rapid brainstorming. Ask me anything!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isChatGptLoading, setIsChatGptLoading] = useState(false);

  // Canva whiteboard interactive state
  const [canvaElements, setCanvaElements] = useState<CanvaElement[]>([
    {
      id: 'element-1',
      type: 'note',
      x: 60,
      y: 80,
      width: 220,
      height: 140,
      color: '#FEF08A', // pastel yellow
      content: '⚡ Lilbed Canva Workspace\nDouble click to write your thoughts or compile research nodes here!'
    },
    {
      id: 'element-2',
      type: 'note',
      x: 340,
      y: 120,
      width: 220,
      height: 140,
      color: '#C7D2FE', // pastel indigo
      content: '📌 Drag and drop cards anywhere on the grid workspace. Click colorful circles to change layout colors.'
    }
  ]);
  const [canvaStrokes, setCanvaStrokes] = useState<CanvaStroke[]>([]);
  const [activeBrushColor, setActiveBrushColor] = useState('#6366F1');
  const [brushSize, setBrushSize] = useState(3);
  const [canvaMode, setCanvaMode] = useState<'drag' | 'draw' | 'erase' | 'pan'>('drag');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Zoom, Pan & Target Snap alignment controls for Whiteboard
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  // Tracking dragging of canvas notes
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Tracking drawing of lines
  const isDrawing = useRef(false);
  const currentPoints = useRef<{ x: number; y: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  // Auth Listener
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

  // Fetch social directory and WhatsApp connections from database or local backup
  const fetchSocialProfiles = async () => {
    try {
      if (!db) {
        const savedSocials = localStorage.getItem('lilbed_social_profiles');
        if (savedSocials) {
          setSocialsProfiles(JSON.parse(savedSocials));
        } else {
          const seed = [
            {
              uid: 'seed-1',
              name: 'Obed Yadzo',
              phoneNumber: '+233241234567',
              bio: 'Founder of Lilbed AI. Academic researcher, professional programmer, website & game dev, flyer designer, and scholar at UPSA (Born 30/05/2002).',
              role: 'Scholar & Lead Developer',
              whatsappLink: 'https://wa.me/233241234567',
              createdAt: new Date().toISOString()
            },
            {
              uid: 'seed-2',
              name: 'Dr. Evelyn Acheampong',
              phoneNumber: '+233209876543',
              bio: 'UPSA Lecturer and Senior Academic Advisor. Researching digital transformational systems and African educational models.',
              role: 'Academic Advisor & Educator',
              whatsappLink: 'https://wa.me/233209876543',
              createdAt: new Date().toISOString()
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
        const seed = [
          {
            uid: 'seed-1',
            name: 'Obed Yadzo',
            phoneNumber: '+233241234567',
            bio: 'Founder of Lilbed AI. Academic researcher, professional programmer, website & game dev, flyer designer, and scholar at UPSA (Born 30/05/2002).',
            role: 'Scholar & Lead Developer',
            whatsappLink: 'https://wa.me/233241234567',
            createdAt: new Date().toISOString()
          },
          {
            uid: 'seed-2',
            name: 'Academic Researcher (UPSA Hub)',
            phoneNumber: '+233501234567',
            bio: 'Analytical study and flyer project manager at University of Professional Studies, Accra.',
            role: 'Researcher & Scholar',
            whatsappLink: 'https://wa.me/233501234567',
            createdAt: new Date().toISOString()
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

    const newProfile: SocialProfile = {
      uid: user.uid,
      name: socialName,
      phoneNumber: socialPhone,
      bio: socialBio || 'Active Lilbed research scholar ready for collaboration.',
      role: socialRole,
      whatsappLink: waLink,
      createdAt: new Date().toISOString()
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

  // Sync canvas to HTML5 canvas drawing engine when strokes change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all completed strokes
    canvaStrokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });
  }, [canvaStrokes, activeTab]);

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      alert("Error during signing out: " + err.message);
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
          history: updatedHistory
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

  // Canva Drag & Mouse coordinates management and Canvas navigation
  const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
    if (canvaMode !== 'drag') return;
    setDraggingElementId(elementId);
    setSelectedElementId(elementId);
    
    const element = canvaElements.find(el => el.id === elementId);
    if (element) {
      dragOffset.current = {
        x: (e.clientX / zoom) - element.x,
        y: (e.clientY / zoom) - element.y
      };
    }
    e.stopPropagation();
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    const parentContainer = e.currentTarget.getBoundingClientRect();

    if (isPanning) {
      const nextPanX = e.clientX - panStart.current.x;
      const nextPanY = e.clientY - panStart.current.y;
      setPan({ x: nextPanX, y: nextPanY });
    } else if (canvaMode === 'drag' && draggingElementId) {
      const targetX = (e.clientX / zoom) - dragOffset.current.x;
      const targetY = (e.clientY / zoom) - dragOffset.current.y;

      let nextX = targetX;
      let nextY = targetY;

      if (snapToGrid) {
        nextX = Math.round(nextX / 20) * 20;
        nextY = Math.round(nextY / 20) * 20;
      }

      nextX = Math.max(-5000, Math.min(nextX, 5000));
      nextY = Math.max(-5000, Math.min(nextY, 5000));
      
      setCanvaElements(prev =>
        prev.map(el => el.id === draggingElementId ? { ...el, x: nextX, y: nextY } : el)
      );
    } else if (canvaMode === 'draw' && isDrawing.current) {
      const x = (e.clientX - parentContainer.left - pan.x) / zoom;
      const y = (e.clientY - parentContainer.top - pan.y) / zoom;
      currentPoints.current.push({ x, y });

      // Draw active stroke locally on HTML5 canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx && currentPoints.current.length > 1) {
          ctx.beginPath();
          ctx.moveTo(currentPoints.current[currentPoints.current.length - 2].x, currentPoints.current[currentPoints.current.length - 2].y);
          ctx.lineTo(x, y);
          ctx.strokeStyle = activeBrushColor;
          ctx.lineWidth = brushSize;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
        }
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggingElementId(null);
    setIsPanning(false);
    if (canvaMode === 'draw' && isDrawing.current) {
      isDrawing.current = false;
      if (currentPoints.current.length > 1) {
        const newStroke: CanvaStroke = {
          id: `stroke-${Date.now()}`,
          points: [...currentPoints.current],
          color: activeBrushColor,
          strokeWidth: brushSize
        };
        setCanvaStrokes(prev => [...prev, newStroke]);
      }
      currentPoints.current = [];
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (canvaMode === 'pan' || (canvaMode === 'drag' && !draggingElementId)) {
      setIsPanning(true);
      panStart.current = {
        x: e.clientX - pan.x,
        y: e.clientY - pan.y
      };
    } else if (canvaMode === 'draw') {
      isDrawing.current = true;
      const parentContainer = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - parentContainer.left - pan.x) / zoom;
      const y = (e.clientY - parentContainer.top - pan.y) / zoom;
      currentPoints.current = [{ x, y }];
    } else {
      setSelectedElementId(null);
    }
  };

  // Add a new element to the Canva whiteboard
  const handleAddCanvaNote = (type: 'note' | 'text' | 'shape', content = "New Note\nDouble click to edit text.") => {
    const newEl: CanvaElement = {
      id: `element-${Date.now()}`,
      type,
      x: 100 + Math.random() * 80,
      y: 100 + Math.random() * 80,
      width: type === 'text' ? 180 : 200,
      height: type === 'text' ? 60 : 130,
      color: type === 'note' ? '#FEF08A' : type === 'text' ? 'transparent' : '#E0F2FE',
      content,
      shapeType: type === 'shape' ? 'rectangle' : undefined
    };

    setCanvaElements(prev => [...prev, newEl]);
    setSelectedElementId(newEl.id);
  };

  // Move a search quote or dossier text segment into canva
  const handleExportToCanva = (text: string) => {
    handleAddCanvaNote('note', text);
    setActiveTab('canva');
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
              <div className="relative flex justify-center text-xs uppercase animate-pulse">
                <span className="bg-white px-3 text-slate-400 font-mono">Select Mode</span>
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
    <div className="min-h-screen bg-[#FDFDFD] text-slate-800 font-sans flex flex-col antialiased">
      {/* Top Main Navigation Header */}
      <header className="border-b border-slate-100 bg-white sticky top-0 z-40 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-3.5 self-start">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md">
            <Globe className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-semibold tracking-tight text-slate-950 font-display">Lilbed AI</h1>
              <span className="bg-slate-100 text-[10px] font-mono text-slate-605 px-2 py-0.5 rounded-full font-medium">WORKSPACE</span>
            </div>
            <p className="text-[11px] text-slate-505 font-mono">
              Created by <span className="font-bold text-slate-900">OBED YADZO</span> (UPSA scholar, Educator, Scholar, Writer, Academic Researcher, Expert Coder, Website & Game Developer, Creator of Digital Flyers & Video Generators • Born 30/05/2002)
            </p>
          </div>
        </div>

        {/* Tab Switcher - Modular Features */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/50">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'projects'
                ? 'bg-white text-slate-950 shadow-xs ring-1 ring-slate-200/50Item'
                : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            🔍 Research Intelligence
          </button>
          <button
            onClick={() => setActiveTab('canva')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'canva'
                ? 'bg-white text-slate-950 shadow-xs ring-1 ring-slate-200/50Item'
                : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            🎨 Canva Whiteboard
          </button>
          <button
            onClick={() => setActiveTab('chatgpt')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'chatgpt'
                ? 'bg-white text-slate-950 shadow-xs ring-1 ring-slate-200/50Item'
                : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            💬 ChatGPT Co-Pilot
          </button>
          <button
            onClick={() => setActiveTab('socials')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'socials'
                ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200/50Item'
                : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            👥 Socials & WhatsApp
          </button>
        </div>

        {/* User Identity and Sign Out */}
        <div className="flex items-center space-x-3 self-end sm:self-auto">
          <div className="hidden lg:flex flex-col items-end text-right">
            <span className="text-xs font-sans font-semibold text-slate-800 flex items-center space-x-1">
              <User className="w-3 h-3 text-slate-400" />
              <span>{user.email}</span>
            </span>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg transition border border-slate-100"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar - Historical Archives (only for research tab) */}
        {activeTab === 'projects' && (
          <aside className="w-80 border-r border-slate-100 bg-[#FAFBFD] hidden md:flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-slate-100 bg-white">
              <button 
                onClick={startNewProject}
                className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-xl transition duration-200 text-sm shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Deep Research</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              <div className="flex items-center space-x-2 px-3 py-2 text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                <span>Saved Briefings</span>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-10 px-4 text-xs text-slate-400 font-mono">
                  No past dossiers. Begin a search query above to compile analytical briefings.
                </div>
              ) : (
                projects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => setActiveProjectId(proj.id)}
                    className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition duration-150 ${
                      activeProjectId === proj.id 
                      ? 'bg-slate-100 border border-slate-200/50' 
                      : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                      <FileText className={`w-4 h-4 mt-0.5 flex-shrink-0 ${activeProjectId === proj.id ? 'text-slate-900' : 'text-slate-400'}`} />
                      <div className="truncate text-left">
                        <p className={`text-xs font-medium truncate ${activeProjectId === proj.id ? 'text-slate-950 font-semibold' : 'text-slate-700'}`}>
                          {proj.topic}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono uppercase bg-white px-1.5 py-0.5 rounded border border-slate-100">
                          {proj.depth === 'deep' ? 'Deep Dive' : 'Quick Scan'}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => deleteProject(proj.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-rose-500 transition duration-150"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Import & Export Backups and Projects sharing widget */}
            <div className="p-4 border-t border-slate-150 bg-slate-50/50 space-y-3">
              <div className="flex items-center space-x-1.5 text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Backup & Share</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={exportProjects}
                  disabled={projects.length === 0}
                  className="flex items-center justify-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-705 border border-slate-200 text-xs py-2 px-2.5 rounded-xl transition duration-150 shadow-xxs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Export all research profiles to your computer as.json file"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Backup All</span>
                </button>

                <label
                  className="flex items-center justify-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-705 border border-slate-200 text-xs py-2 px-2.5 rounded-xl transition duration-150 shadow-xxs font-medium cursor-pointer"
                  title="Restore or import research profile database back"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Import</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importProjects}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-white text-[11px] font-mono text-slate-400 text-center flex justify-center items-center space-x-1.5">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Session encrypted locally & in safe database</span>
            </div>
          </aside>
        )}

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
                                  onClick={() => handleExportToCanva(message.content)}
                                  className="p-1.5 rounded-lg border border-slate-150 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition flex items-center space-x-1 text-xs font-semibold"
                                  title="Send full document to design board"
                                >
                                  <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Send to Canvas</span>
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
                              <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-155">
                                <div className="flex items-center space-x-2 mb-3">
                                  <BookOpen className="w-4 h-4 text-indigo-600" />
                                  <h4 className="text-xs font-sans font-bold text-slate-800">AUTHENTICATED REAL-TIME REFERENCES</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                  {message.sources.map((src) => (
                                    <div key={src.id} className="group relative bg-white p-3 rounded-xl border border-slate-200/60 hover:border-slate-400 hover:bg-slate-50/50 transition duration-150 text-xs">
                                      <div className="flex items-start space-x-2.5">
                                        <span className="w-5 h-5 rounded-md bg-indigo-50 border border-indigo-100/50 text-indigo-700 flex items-center justify-center font-mono font-bold shrink-0">
                                          {src.id}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                          <p className="font-semibold text-slate-850 truncate">
                                            {src.title}
                                          </p>
                                          <p className="text-[10px] text-slate-400 font-mono truncate">
                                            {src.url}
                                          </p>
                                        </div>
                                      </div>
                                      {/* Actions per reference */}
                                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                                        <button 
                                          onClick={() => handleExportToCanva(`[Ref ${src.id}] ${src.title}\nSource Link: ${src.url}`)}
                                          className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                                          title="Add index node to designers board"
                                        >
                                          <Plus className="w-3 h-3" />
                                          <span>Whiteboard Card</span>
                                        </button>

                                        <a
                                          href={src.url}
                                          target="_blank"
                                          referrerPolicy="no-referrer"
                                          rel="noopener noreferrer"
                                          className="text-[10px] text-slate-500 hover:text-slate-900 font-mono flex items-center space-x-1"
                                        >
                                          <span>External Live Link</span>
                                          <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                      </div>
                                    </div>
                                  ))}
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

          {/* TAB 2: Canva Workspace Whiteboard design board */}
          {activeTab === 'canva' && (
            <div className="flex-1 flex flex-col bg-slate-100/90 overflow-hidden select-none">
              {/* Whiteboard Controls toolbar header */}
              <div className="p-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xxs">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase">Whiteboard elements:</span>
                  <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                    <button
                      onClick={() => handleAddCanvaNote('note')}
                      className="px-2.5 py-1 text-xs font-semibold hover:bg-white text-slate-700 rounded-md flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3 text-amber-500" />
                      <span>Post-It Note</span>
                    </button>
                    <button
                      onClick={() => handleAddCanvaNote('text', "Double click to type text.")}
                      className="px-2.5 py-1 text-xs font-semibold hover:bg-white text-slate-700 rounded-md flex items-center space-x-1"
                    >
                      <Type className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Text Box</span>
                    </button>
                    <button
                      onClick={() => handleAddCanvaNote('shape', "New Shape Frame")}
                      className="px-2.5 py-1 text-xs font-semibold hover:bg-white text-slate-700 rounded-md flex items-center space-x-1"
                    >
                      <Square className="w-3 h-3 text-emerald-500" />
                      <span>Design Block</span>
                    </button>
                  </div>
                </div>

                {/* Draw brush tools and Navigation modes */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase">Interactive Mode:</span>
                    <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                      <button
                        onClick={() => setCanvaMode('drag')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center space-x-1.5 transition ${
                          canvaMode === 'drag' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                        title="Drag and resize your visual note panels"
                      >
                        <span>🖐️ Drag Cards</span>
                      </button>
                      <button
                        onClick={() => setCanvaMode('pan')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center space-x-1.5 transition ${
                          canvaMode === 'pan' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                        title="Pan around the massive research whiteboard workspace"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Pan Board</span>
                      </button>
                      <button
                        onClick={() => setCanvaMode('draw')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center space-x-1.5 transition ${
                          canvaMode === 'draw' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>Sketch Draw</span>
                      </button>
                      <button
                        onClick={() => {
                          setCanvaStrokes([]);
                          setCanvaMode('drag');
                        }}
                        className="px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 rounded-md flex items-center space-x-1 transition"
                        title="Wipe canvas sketches"
                      >
                        <Eraser className="w-3.5 h-3.5" />
                        <span>Wipe Sketch</span>
                      </button>
                    </div>
                  </div>

                  {canvaMode === 'draw' && (
                    <div className="flex items-center space-x-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                      {['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#000000'].map((col) => (
                        <button
                          key={col}
                          onClick={() => setActiveBrushColor(col)}
                          className={`w-4 h-4 rounded-full border transition ${
                            activeBrushColor === col ? 'ring-2 ring-indigo-505 border-white scale-110' : 'border-slate-305'
                          }`}
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Grid snapping & workspace utility */}
                <div className="flex items-center space-x-3.5">
                  <button
                    onClick={() => setSnapToGrid(!snapToGrid)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 border rounded-lg text-xs font-mono font-bold transition-all ${
                      snapToGrid 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-705' 
                        : 'bg-white border-slate-200 text-slate-450 hover:bg-slate-50'
                    }`}
                    title="Enable or disable align snapping to a 20px grid"
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>{snapToGrid ? "Snap: ON" : "Snap: OFF"}</span>
                  </button>

                  <button
                    onClick={() => setCanvaElements([
                      {
                        id: 'element-1',
                        type: 'note',
                        x: 60,
                        y: 80,
                        width: 220,
                        height: 140,
                        color: '#FEF08A',
                        content: '⚡ Lilbed Canva Workspace\nDouble click to write your thoughts or compile research nodes here!'
                      }
                    ])}
                    className="p-1.5 px-3.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-mono font-medium transition active:scale-95"
                  >
                    Clear All Cards
                  </button>
                </div>
              </div>

              {/* Whiteboard Workspace Interactive absolute panel */}
              <div 
                className="flex-1 relative overflow-hidden bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:24px_24px]"
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseDown={handleCanvasMouseDown}
                style={{ 
                  cursor: canvaMode === 'draw' ? 'crosshair' : isPanning ? 'grabbing' : canvaMode === 'pan' ? 'grab' : 'default' 
                }}
              >
                {/* Visual grid board viewport that transitions based on Pan & Scale factor */}
                <div
                  className="absolute inset-0 origin-top-left"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    width: '3500px',
                    height: '2500px'
                  }}
                >
                  {/* HTML5 drawing Canvas overlay for strokes sketches */}
                  <canvas
                    ref={canvasRef}
                    width={3500}
                    height={2500}
                    className="absolute inset-0 pointer-events-none z-10"
                  />

                  {/* List Canva absolute draggable elements */}
                  {canvaElements.map((el) => {
                    const isSelected = selectedElementId === el.id;
                    
                    return (
                      <div
                        key={el.id}
                        onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                        className={`absolute rounded-xl shadow-md transition-shadow select-none z-20 overflow-hidden ${
                          isSelected ? 'ring-2 ring-indigo-500 shadow-xl' : 'hover:shadow-lg'
                        }`}
                        style={{
                          left: el.x,
                          top: el.y,
                          width: el.width,
                          height: el.height,
                          backgroundColor: el.color,
                          border: el.type === 'text' ? 'none' : '1px solid rgba(0,0,0,0.08)'
                        }}
                      >
                        {/* Note element head dragbar */}
                        {el.type !== 'text' && (
                          <div className="bg-black/5 h-6 px-3 flex items-center justify-between cursor-grab text-[9px] font-mono text-slate-500">
                            <span className="truncate">Lilbed Note Block</span>
                            <div className="flex items-center space-x-1.5">
                              {/* Color options */}
                              {['#FEF08A', '#E0F2FE', '#FEE2E2', '#E8F5E9', '#F3E5F5', '#FFFFFF'].map((col) => (
                                <button
                                  key={col}
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    setCanvaElements(prev =>
                                      prev.map(item => item.id === el.id ? { ...item, color: col } : item)
                                    );
                                  }}
                                  className="w-2.5 h-2.5 rounded-full border border-black/15 shadow-xxs"
                                  style={{ backgroundColor: col }}
                                />
                              ))}
                              <button
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  setCanvaElements(prev => prev.filter(item => item.id !== el.id));
                                }}
                                className="text-slate-400 hover:text-rose-500 p-0.5"
                                title="Trash block"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Content text area */}
                        <div className="p-3.5 h-full overflow-hidden flex flex-col">
                          <textarea
                            value={el.content}
                            onMouseDown={(e) => e.stopPropagation()} // exclude drag tracking when typing!
                            onChange={(e) => {
                              const val = e.target.value;
                              setCanvaElements(prev =>
                                prev.map(item => item.id === el.id ? { ...item, content: val } : item)
                              );
                            }}
                            className="w-full h-full bg-transparent resize-none border-none focus:outline-hidden text-xs text-slate-800 leading-relaxed font-sans placeholder-slate-400"
                            placeholder="Type or paste outline details here..."
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Floating Navigation Controls on Overlay context (Zoom widget + Guides info) */}
                <div className="absolute bottom-4 left-4 right-4 md:right-auto bg-white/95 backdrop-blur-md shadow-lg rounded-xl border border-slate-200/80 p-3 z-30 flex flex-col md:flex-row items-stretch md:items-center gap-3.5">
                  <div className="flex items-center justify-between gap-3 font-mono text-xs text-slate-700">
                    <span className="font-bold text-[11px] uppercase text-slate-400">whiteboard navigation:</span>
                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-705 px-2 py-0.5 rounded font-bold font-mono">
                      Scale: {Math.round(zoom * 100)}%
                    </span>
                  </div>

                  <div className="h-px md:h-5 w-full md:w-px bg-slate-200" />

                  {/* Zoom Controller Triggers */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setZoom(prev => Math.max(0.3, prev - 0.1))}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 active:scale-90 transition"
                      title="Zoom Out"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setZoom(1)}
                      className="p-1 px-2 text-[11px] font-mono font-bold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 active:scale-90 transition"
                      title="Reset view standard scale"
                    >
                      100%
                    </button>
                    <button
                      onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-605 active:scale-90 transition"
                      title="Zoom In"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setZoom(1);
                        setPan({ x: 0, y: 0 });
                      }}
                      className="ml-2 p-1.5 px-2 text-[11px] font-sans font-bold bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white rounded-lg active:scale-95 transition flex items-center space-x-1"
                      title="Center screen viewpoint"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Recenter</span>
                    </button>
                  </div>

                  <div className="hidden lg:block h-5 w-px bg-slate-200" />

                  <span className="hidden lg:inline text-[10px] font-mono text-slate-400">
                    💡 Hold & Drag empty canvas coordinates to pan your whiteboard infinite space.
                  </span>
                </div>

                {/* Empty page state help banner */}
                {canvaElements.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    <div className="text-center text-slate-450 space-y-2 max-w-sm">
                      <Grid className="w-10 h-10 mx-auto animate-pulse text-indigo-400" />
                      <h4 className="font-semibold text-slate-700">Canva Board Is Empty</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Click "Post-it Note" on the top left or extract elements directly from your analytical research reports to populate visual ideas.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Dedicated ChatGPT Assistant mode */}
          {activeTab === 'chatgpt' && (
            <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
              <div className="bg-indigo-650/15 p-4 border-b border-slate-200/50">
                <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-indigo-950 flex items-center space-x-1">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                      <span>ChatGPT Assist Workspace</span>
                    </h3>
                    <p className="text-xs text-indigo-850 mt-0.5 leading-relaxed">
                      Instant conversational revisions, summaries, code, and text edits without forcing web searches.
                    </p>
                  </div>

                  {/* Quick ChatGPT presets */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setChatGptInput("Draft a structured bullet list outline about the key elements for this research scope.");
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-white text-slate-705 border border-slate-200 rounded-lg hover:border-slate-350 transition active:scale-95"
                    >
                      📝 Bullet Outline
                    </button>
                    <button
                      onClick={() => {
                        setChatGptInput("Format this into a beautiful Markdown comparison comparison grid with strengths and flaws.");
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-white text-slate-705 border border-slate-200 rounded-lg hover:border-slate-350 transition active:scale-95"
                    >
                      📊 Markdown Grid
                    </button>
                    <button
                      onClick={() => {
                        setChatGptInput("Rephrase the following scientific statement for an executive summarizing summary report: ");
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-white text-slate-705 border border-slate-200 rounded-lg hover:border-slate-350 transition active:scale-95"
                    >
                      ✍️ Executive Summary
                    </button>
                  </div>
                </div>
              </div>

              {/* ChatGPT Messages loop */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="max-w-3xl mx-auto space-y-6">
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
                            <span className="text-[10px] font-mono font-bold text-indigo-705">GPCO-PILOT INTEL</span>
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
                            <span>ChatGPT Response</span>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleExportToCanva(msg.content)}
                                className="text-indigo-600 hover:text-indigo-805 font-bold flex items-center space-x-1"
                              >
                                <Plus className="w-3" />
                                <span>Export to Canva</span>
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
                      <span>Co-pilot writing options...</span>
                    </div>
                  )}
                  <div ref={chatGptEndRef} />
                </div>
              </div>

              {/* Chat Form */}
              <div className="p-4 border-t border-slate-200 bg-white sticky bottom-0">
                <div className="max-w-3xl mx-auto">
                  <form onSubmit={handleChatGptSubmit} className="relative flex items-center">
                    <textarea
                      rows={1}
                      disabled={isChatGptLoading}
                      value={chatGptInput}
                      onChange={(e) => setChatGptInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleChatGptSubmit(e);
                        }
                      }}
                      placeholder={isChatGptLoading ? "Formulating brainstorming details..." : "Ask ChatGPT helper to write an article, plan details, or explain code..."}
                      className="w-full bg-slate-50 text-slate-950 pl-4 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1.5 focus:ring-slate-900 transition text-xs md:text-sm resize-none"
                    />
                    <button
                      type="submit"
                      disabled={!chatGptInput.trim() || isChatGptLoading}
                      className="absolute right-2 text-indigo-600 hover:text-indigo-805 disabled:text-slate-350 p-2"
                    >
                      <ArrowRight className="w-4.5 h-4.5" />
                    </button>
                  </form>
                  <p className="text-[10px] text-slate-400 font-mono text-center mt-2">
                    Shift + Enter inserts new lines. Work synced with safe SSL pipeline.
                  </p>
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
                          href="https://wa.me/233241234567"
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
                        Add your phone number and research bio. Connect with other Lilbed AI workspace scholars instantly through direct WhatsApp channels.
                      </p>
                    </div>

                    <form onSubmit={registerSocialProfile} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Your Full Name</label>
                        <input
                          type="text"
                          required
                          value={socialName}
                          onChange={(e) => setSocialName(e.target.value)}
                          placeholder="Richmond Mensah"
                          className="w-full bg-slate-50 text-slate-950 placeholder-slate-400 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Primary Phone Number</label>
                        <input
                          type="text"
                          required
                          value={socialPhone}
                          onChange={(e) => setSocialPhone(e.target.value)}
                          placeholder="e.g. +233241234567"
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
                        onClick={fetchSocialProfiles}
                        className="text-[11px] font-mono font-bold text-indigo-650 hover:text-indigo-800"
                      >
                        ⚡ Refresh Live Registry
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {socialsProfiles.map((profile, i) => {
                        const isObed = profile.uid === 'seed-1' || profile.name.toLowerCase().includes('obed');
                        
                        return (
                          <div
                            key={profile.uid + i}
                            className={`p-5 rounded-2xl border transition-all hover:shadow-xs ${
                              isObed
                                ? 'bg-gradient-to-br from-indigo-50/50 to-white border-indigo-200/60 ring-1 ring-indigo-50/50'
                                : 'bg-white border-slate-150'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className={`inline-block text-[9px] font-mono font-bold px-2 py-0.5 rounded-full mb-2 ${
                                  isObed
                                    ? 'bg-indigo-100/80 text-indigo-700'
                                    : 'bg-slate-100 text-slate-650'
                                }`}>
                                  {profile.role}
                                </span>
                                
                                <h4 className="text-sm font-semibold text-slate-900 flex items-center space-x-1">
                                  <span>{profile.name}</span>
                                  {isObed && <span className="text-xs text-indigo-550" title="Founder Core">★</span>}
                                </h4>
                              </div>

                              <span className="text-[9px] font-mono text-slate-405">
                                {isObed ? "FOUNDED" : new Date(profile.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                            </div>

                            <p className="text-xs text-slate-550 leading-relaxed mt-2 p-2.5 rounded-lg bg-slate-50 font-sans">
                              {profile.bio}
                            </p>

                            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold text-slate-450 flex items-center space-x-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{profile.phoneNumber}</span>
                              </span>

                              {profile.whatsappLink && (
                                <a
                                  href={profile.whatsappLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center space-x-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-mono font-bold text-[10px] px-3 py-1.5 rounded-lg transition"
                                >
                                  <span>Start Chat</span>
                                  <span className="text-[11px]">💬</span>
                                </a>
                              )}
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

        </div>
      </div>
    </div>
  );
}
