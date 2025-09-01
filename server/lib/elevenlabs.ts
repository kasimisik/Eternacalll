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
  private apiKey: string;
  private baseUrl: string = 'https://api.elevenlabs.io/v1';

  constructor() {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Get authorization headers for ElevenLabs API
   */
  private getHeaders(isMultipart: boolean = false): Record<string, string> {
    const headers: Record<string, string> = {
      'xi-api-key': this.apiKey,
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
  async getVoices(): Promise<{ voices: ElevenLabsVoice[] }> {
    const response = await fetch(`${this.baseUrl}/voices`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<{ voices: ElevenLabsVoice[] }>(response);
  }

  /**
   * Create a new voice by cloning from uploaded audio files
   */
  async createVoice(request: CreateVoiceRequest): Promise<{ voice_id: string }> {
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
    const agentData = {
      name: request.name,
      conversation_config: {
        agent: {
          prompt: {
            prompt: request.prompt,
          },
          first_message: request.first_message || "Hello! How can I help you today?",
          language: request.language || "en",
        },
        tts: {
          voice_id: request.voice_id,
          model_id: "eleven_turbo_v2_5", // Default model
          stability: request.stability || 0.7,
          similarity_boost: request.similarity_boost || 0.8,
          style: 0,
          use_speaker_boost: true,
        },
      },
      platform_settings: {
        widget_config: {},
      },
    };

    const response = await fetch(`${this.baseUrl}/agents`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(agentData),
    });

    return this.handleResponse<{ agent_id: string }>(response);
  }

  /**
   * Get details of a specific agent
   */
  async getAgent(agentId: string): Promise<ElevenLabsAgent> {
    const response = await fetch(`${this.baseUrl}/agents/${agentId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ElevenLabsAgent>(response);
  }

  /**
   * Update an existing agent
   */
  async updateAgent(agentId: string, request: Partial<CreateAgentRequest>): Promise<ElevenLabsAgent> {
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

    const response = await fetch(`${this.baseUrl}/agents/${agentId}`, {
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
    const response = await fetch(`${this.baseUrl}/agents/${agentId}`, {
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
    return `https://api.elevenlabs.io/v1/agents/${agentId}/answer`;
  }
}

// Export singleton instance
export const elevenLabsService = new ElevenLabsService();