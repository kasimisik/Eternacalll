import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Bot, Phone, Copy, Edit, Trash2, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { VoiceSelector } from '@/components/VoiceSelector';

interface Agent {
  id: string;
  name: string;
  prompt: string;
  voice_id: string;
  stability: number;
  similarity_boost: number;
  elevenlabs_agent_id: string;
  phone_endpoint: string;
  created_at: string;
  updated_at: string;
}

interface AgentsListProps {
  onAgentUpdated?: () => void;
  onCreateAgentClick?: () => void;
  className?: string;
}

export function AgentsList({ onAgentUpdated, onCreateAgentClick, className }: AgentsListProps) {
  const { user } = useUser();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    prompt: '',
    voiceId: '',
    voiceName: ''
  });
  const [savingAgent, setSavingAgent] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchAgents();
    }
  }, [user?.id]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        setError('Kullanıcı kimlik doğrulaması gereklidir');
        return;
      }

      const response = await fetch('/api/agents/list', {
        headers: {
          'x-user-id': user.id,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Ajanlar yüklenemedi');
      }

      setAgents(data.agents || []);
    } catch (error) {
      console.error('Agents fetch error:', error);
      setError(error instanceof Error ? error.message : 'Ajanlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    try {
      setDeletingAgentId(agentId);

      const response = await fetch(`/api/agents/delete/${agentId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user?.id || '',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Ajan silinemedi');
      }

      // Remove from local state
      setAgents(prev => prev.filter(agent => agent.id !== agentId));
      
      toast({
        title: "Başarılı!",
        description: "Ajan başarıyla silindi.",
      });

      if (onAgentUpdated) {
        onAgentUpdated();
      }

    } catch (error) {
      console.error('Agent delete error:', error);
      toast({
        title: "Hata!",
        description: error instanceof Error ? error.message : 'Ajan silinirken hata oluştu',
        variant: "destructive",
      });
    } finally {
      setDeletingAgentId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopyalandı!",
      description: "Endpoint URL panoya kopyalandı.",
    });
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setEditForm({
      name: agent.name,
      prompt: agent.prompt,
      voiceId: agent.voice_id,
      voiceName: agent.voice_id
    });
  };

  const handleSaveAgent = async () => {
    if (!editingAgent || !user?.id) return;

    try {
      setSavingAgent(true);

      const response = await fetch(`/api/agents/update/${editingAgent.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          name: editForm.name,
          prompt: editForm.prompt,
          voice_id: editForm.voiceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Ajan güncellenemedi');
      }

      // Update local state
      setAgents(prev => prev.map(agent => 
        agent.id === editingAgent.id 
          ? { ...agent, name: editForm.name, prompt: editForm.prompt, voice_id: editForm.voiceId }
          : agent
      ));

      setEditingAgent(null);
      
      toast({
        title: "Başarılı!",
        description: "Ajan başarıyla güncellendi.",
      });

      if (onAgentUpdated) {
        onAgentUpdated();
      }

    } catch (error) {
      console.error('Agent update error:', error);
      toast({
        title: "Hata!",
        description: error instanceof Error ? error.message : 'Ajan güncellenirken hata oluştu',
        variant: "destructive",
      });
    } finally {
      setSavingAgent(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>AI Ajanlarım</CardTitle>
          <CardDescription>Oluşturulan ajanlar yükleniyor...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>AI Ajanlarım</CardTitle>
          <CardDescription>Ajanlar yüklenirken hata oluştu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchAgents} variant="outline">
              Tekrar Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (agents.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>AI Ajanlarım</CardTitle>
          <CardDescription>Henüz hiç ajan oluşturmamışsınız</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              İlk AI telefon ajanınızı oluşturun ve çağrıları otomatikleştirmeye başlayın.
            </p>
            <Button onClick={onCreateAgentClick} data-testid="button-create-first-agent">
              İlk Ajanı Oluştur
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>AI Ajanlarım ({agents.length})</CardTitle>
        <CardDescription>
          Oluşturduğunuz AI telefon ajanlarını yönetin ve telefon endpoint URL'lerini alın.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agents.map((agent) => (
            <div key={agent.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
              {/* Agent Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold flex items-center">
                    <Bot className="h-4 w-4 mr-2" />
                    {agent.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Oluşturulma: {formatDate(agent.created_at)}
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {/* Edit Dialog */}
                  <Dialog open={editingAgent?.id === agent.id} onOpenChange={(open) => {
                    if (!open) setEditingAgent(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        data-testid={`button-edit-agent-${agent.id}`}
                        onClick={() => handleEditAgent(agent)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{agent.name} - Düzenle</DialogTitle>
                        <DialogDescription>
                          Ajan ayarlarını düzenleyin
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* Agent Name */}
                        <div>
                          <label className="text-sm font-medium">Ajan İsmi</label>
                          <Input
                            value={editForm.name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            className="mt-1"
                            data-testid="input-edit-agent-name"
                          />
                        </div>

                        {/* System Prompt */}
                        <div>
                          <label className="text-sm font-medium">Sistem Promptu</label>
                          <textarea
                            className="w-full mt-1 p-3 border rounded-lg bg-background resize-none h-32"
                            value={editForm.prompt}
                            onChange={(e) => setEditForm(prev => ({ ...prev, prompt: e.target.value }))}
                            placeholder="Ajanınızın nasıl davranacağını tanımlayın..."
                            data-testid="textarea-edit-agent-prompt"
                          />
                        </div>

                        {/* Voice Selection */}
                        <div>
                          <label className="text-sm font-medium mb-2 block">Ses Seçimi</label>
                          <VoiceSelector
                            selectedVoiceId={editForm.voiceId}
                            onVoiceSelect={(voiceId, voiceName) => {
                              setEditForm(prev => ({ 
                                ...prev, 
                                voiceId, 
                                voiceName 
                              }));
                            }}
                          />
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button 
                            variant="outline" 
                            onClick={() => setEditingAgent(null)}
                          >
                            İptal
                          </Button>
                          <Button 
                            data-testid="button-save-agent-changes"
                            onClick={handleSaveAgent}
                            disabled={savingAgent}
                          >
                            {savingAgent ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Kaydediliyor...
                              </>
                            ) : (
                              'Kaydet'
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Delete Button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={deletingAgentId === agent.id}
                      >
                        {deletingAgentId === agent.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Ajanı Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                          "{agent.name}" ajanını silmek istediğinizden emin misiniz? 
                          Bu işlem geri alınamaz ve ajan artık telefon çağrılarını alamayacak.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteAgent(agent.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center mt-6">
          <Button onClick={fetchAgents} variant="outline">
            Listeyi Yenile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}