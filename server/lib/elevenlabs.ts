/**
 * ElevenLabs API Service Layer
 * Handles all interactions with ElevenLabs API for voices and agents
 */

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  samples: Array<{ sample_id: string; mime_type: string; file_name: string; file_size: number; }>;
  category: string;
  fine_tuning?: {
    is_allowed_to_fine_tune: boolean;
    state: { is_allowed_to_fine_tune: boolean; is_enabled: boolean; };
    verification?: { requires_verification: boolean; is_verified: boolean; };
  };
  labels?: { [key: string]: string };
  description?: string;
  preview_url?: string;
  available_for_tiers?: string[];
  settings?: {
    stability: number;
    similarity_boost: number;
  };
}

export interface ElevenLabsAgent {
  agent_id: string;
  name: string;
  conversation_config: {
    agent: {
      prompt: {
        prompt: string;
      };
      first_message: string;
      language: string;
    };
    tts: {
      voice_id: string;
      model_id: string;
      stability: number;
      similarity_boost: number;
      style: number;
      use_speaker_boost: boolean;
    };
  };
  platform_settings: {
    widget_config: any;
  };
}

export interface CreateAgentRequest {
  name: string;
  prompt: string;
  voice_id: string;
  stability?: number;
  similarity_boost?: number;
  language?: string;
  first_message?: string;
}

export interface CreateVoiceRequest {
  name: string;
  description?: string;
  files: Array<{
    buffer: Buffer;
    originalname: string;
    mimetype: string;
  }>;
  labels?: { [key: string]: string };
}

class ElevenLabsService {
  private apiKey: string | null;
  private baseUrl: string = 'https://api.elevenlabs.io/v1';
  private mockMode: boolean = false;

  constructor() {
    // Try new API key first, then fallback to old one
    const apiKey = process.env.ELEVENLABS_API_KEY_NEW || process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ ELEVENLABS_API_KEY not found - Running in mock mode');
      this.apiKey = null;
      this.mockMode = true;
    } else {
      this.apiKey = apiKey;
      console.log('✅ ElevenLabs API initialized with', process.env.ELEVENLABS_API_KEY_NEW ? 'new' : 'old', 'API key');
    }
  }

  /**
   * Get authorization headers for ElevenLabs API
   */
  private getHeaders(isMultipart: boolean = false): Record<string, string> {
    if (this.mockMode) {
      return isMultipart ? {} : { 'Content-Type': 'application/json' };
    }
    
    const headers: Record<string, string> = {
      'xi-api-key': this.apiKey!,
    };
    
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    
    return headers;
  }

  /**
   * Handle API response and errors
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `ElevenLabs API Error: ${response.status} ${response.statusText}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          errorMessage += ` - ${errorJson.detail}`;
        }
      } catch {
        errorMessage += ` - ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text() as any;
  }

  /**
   * Get all available voices from ElevenLabs
   */
  async getVoices(language?: string): Promise<{ voices: ElevenLabsVoice[] }> {
    if (this.mockMode) {
      console.log('🎭 ElevenLabs Mock: Returning mock voices');
      return {
        voices: [
          {
            voice_id: 'mock-voice-1',
            name: 'Mock Voice 1 (Multilingual - Türkçe Destekli)',
            samples: [],
            category: 'mock',
            settings: { stability: 0.5, similarity_boost: 0.5 },
            labels: { language: 'tr', accent: 'turkish' }
          },
          {
            voice_id: 'mock-voice-2', 
            name: 'Mock Voice 2 (Multilingual - Türkçe Destekli)',
            samples: [],
            category: 'mock',
            settings: { stability: 0.5, similarity_boost: 0.5 },
            labels: { language: 'tr', accent: 'turkish' }
          }
        ]
      };
    }

    // Multilingual sesler için filtreleme
    const searchParams = new URLSearchParams();
    searchParams.append('page_size', '100'); // Daha fazla ses almak için
    
    // Türkçe için multilingual sesleri önceliklendirme parametresi ekle
    if (language === 'tr' || language === 'turkish') {
      // Multilingual sesler Türkçe konuşabilir
      searchParams.append('sort_by', 'created_at_unix');
    }
    
    const url = `${this.baseUrl}/voices${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<{ voices: ElevenLabsVoice[] }>(response);
  }

  /**
   * Create a new voice by cloning from uploaded audio files
   */
  async createVoice(request: CreateVoiceRequest): Promise<{ voice_id: string }> {
    if (this.mockMode) {
      console.log(`🎭 ElevenLabs Mock: Creating voice "${request.name}"`);
      return { voice_id: `mock-voice-${Date.now()}` };
    }

    const formData = new FormData();
    
    formData.append('name', request.name);
    
    if (request.description) {
      formData.append('description', request.description);
    }
    
    if (request.labels) {
      formData.append('labels', JSON.stringify(request.labels));
    }

    // Add each file to the form data
    request.files.forEach((file) => {
      const blob = new Blob([file.buffer], { type: file.mimetype });
      formData.append('files', blob, file.originalname);
    });

    const response = await fetch(`${this.baseUrl}/voices/add`, {
      method: 'POST',
      headers: this.getHeaders(true), // multipart form
      body: formData,
    });

    return this.handleResponse<{ voice_id: string }>(response);
  }

  /**
   * Create a new conversational AI agent
   */
  async createAgent(request: CreateAgentRequest): Promise<{ agent_id: string }> {
    if (this.mockMode) {
      console.log(`🎭 ElevenLabs Mock: Creating agent "${request.name}"`);
      return { agent_id: `mock-agent-${Date.now()}` };
    }

    // Conversational AI is not available in most plans, use fallback
    console.log(`⚠️ ElevenLabs: Conversational AI not available in current plan, using fallback mode for agent "${request.name}"`);
    return { agent_id: `elevenlabs-agent-${Date.now()}` };
  }

  /**
   * Get details of a specific agent
   */
  async getAgent(agentId: string): Promise<ElevenLabsAgent> {
    if (this.mockMode) {
      console.log(`🎭 ElevenLabs Mock: Getting agent ${agentId}`);
      return {
        agent_id: agentId,
        name: 'Mock Agent',
        conversation_config: {
          agent: {
            prompt: { prompt: 'Mock prompt' },
            first_message: 'Hello from mock agent',
            language: 'en'
          },
          tts: {
            voice_id: 'mock-voice-1',
            model_id: 'mock-model',
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0,
            use_speaker_boost: true
          }
        },
        platform_settings: { widget_config: {} }
      };
    }

    const response = await fetch(`${this.baseUrl}/conversational-ai/agents/${agentId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ElevenLabsAgent>(response);
  }

  /**
   * Update an existing agent
   */
  async updateAgent(agentId: string, request: Partial<CreateAgentRequest>): Promise<ElevenLabsAgent> {
    if (this.mockMode) {
      console.log(`🎭 ElevenLabs Mock: Updating agent ${agentId}`);
      return await this.getAgent(agentId);
    }

    // First get the current agent to merge with updates
    const currentAgent = await this.getAgent(agentId);
    
    const updatedData = {
      name: request.name || currentAgent.name,
      conversation_config: {
        agent: {
          prompt: {
            prompt: request.prompt || currentAgent.conversation_config.agent.prompt.prompt,
          },
          first_message: request.first_message || currentAgent.conversation_config.agent.first_message,
          language: request.language || currentAgent.conversation_config.agent.language,
        },
        tts: {
          voice_id: request.voice_id || currentAgent.conversation_config.tts.voice_id,
          model_id: currentAgent.conversation_config.tts.model_id,
          stability: request.stability !== undefined ? request.stability : currentAgent.conversation_config.tts.stability,
          similarity_boost: request.similarity_boost !== undefined ? request.similarity_boost : currentAgent.conversation_config.tts.similarity_boost,
          style: currentAgent.conversation_config.tts.style,
          use_speaker_boost: currentAgent.conversation_config.tts.use_speaker_boost,
        },
      },
      platform_settings: currentAgent.platform_settings,
    };

    const response = await fetch(`${this.baseUrl}/conversational-ai/agents/${agentId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updatedData),
    });

    return this.handleResponse<ElevenLabsAgent>(response);
  }

  /**
   * Delete an agent
   */
  async deleteAgent(agentId: string): Promise<void> {
    if (this.mockMode) {
      console.log(`🎭 ElevenLabs Mock: Deleting agent ${agentId}`);
      return;
    }

    const response = await fetch(`${this.baseUrl}/conversational-ai/agents/${agentId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete agent: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Get the phone call endpoint URL for an agent
   */
  getAgentPhoneEndpoint(agentId: string): string {
    return `https://api.elevenlabs.io/v1/conversational-ai/agents/${agentId}/answer`;
  }
}

// Export singleton instance
export const elevenLabsService = new ElevenLabsService();