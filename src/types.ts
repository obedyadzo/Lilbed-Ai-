export interface Source {
  id: number;
  title: string;
  url: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  queries?: string[];
  sources?: Source[];
  timestamp: string;
}

export interface ResearchProject {
  id: string;
  userId: string;
  topic: string;
  depth: 'quick' | 'deep';
  messages: Message[];
  createdAt: string;
}

// Canva Element definition for whiteboard layout builder
export interface CanvaElement {
  id: string;
  type: 'note' | 'text' | 'shape' | 'connector';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  content: string;
  shapeType?: 'rectangle' | 'circle' | 'triangle' | 'arrow';
}

// Canva Freehand Stroke
export interface CanvaStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
}

export interface SocialProfile {
  uid: string;
  name: string;
  phoneNumber: string;
  bio: string;
  role: string;
  whatsappLink?: string;
  createdAt: string;
}
