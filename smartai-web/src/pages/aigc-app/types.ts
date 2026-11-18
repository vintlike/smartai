export interface ModelOption {
  value: string;
  label: string;
}

export interface AIApp {
  id: string;
  name: string;
  logo: string;
  model: string;
  description: string;
  prompt: string;
  knowledgeBaseIds: string[];
  createdAt: string;
  createdBy: string;
  cover?: string;
}

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
}
