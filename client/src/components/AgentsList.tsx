import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Bot, Phone, Copy, Edit, Trash2, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  className?: string;
}

export function AgentsList({ onAgentUpdated, className }: AgentsListProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/agents/list');
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
            <Button onClick={() => window.location.href = '/create-agent'}>
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
            <div key={agent.id} className="border rounded-lg p-4 space-y-4">
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
                  {/* View Details Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{agent.name} - Detaylar</DialogTitle>
                        <DialogDescription>
                          Ajan detayları ve telefon endpoint bilgileri
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* Phone Endpoint */}
                        <div>
                          <label className="text-sm font-medium">Telefon Endpoint URL</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Input
                              value={agent.phone_endpoint}
                              readOnly
                              className="font-mono text-xs"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(agent.phone_endpoint)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Bu URL'yi SIP trunk ayarlarında kullanın
                          </p>
                        </div>

                        {/* Voice Settings */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Kararlılık</label>
                            <p className="text-sm text-muted-foreground">{agent.stability}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Benzerlik</label>
                            <p className="text-sm text-muted-foreground">{agent.similarity_boost}</p>
                          </div>
                        </div>

                        {/* System Prompt */}
                        <div>
                          <label className="text-sm font-medium">Sistem Promptu</label>
                          <div className="mt-1 p-3 border rounded-lg bg-muted/30 max-h-40 overflow-y-auto">
                            <p className="text-xs whitespace-pre-wrap">{agent.prompt}</p>
                          </div>
                        </div>

                        {/* ElevenLabs ID */}
                        <div>
                          <label className="text-sm font-medium">ElevenLabs Agent ID</label>
                          <p className="text-xs font-mono text-muted-foreground mt-1">{agent.elevenlabs_agent_id}</p>
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

              {/* Agent Settings Summary */}
              <div className="flex items-center space-x-4 text-sm">
                <Badge variant="secondary">
                  Kararlılık: {agent.stability}
                </Badge>
                <Badge variant="secondary">
                  Benzerlik: {agent.similarity_boost}
                </Badge>
                <Badge variant="outline">
                  <Phone className="h-3 w-3 mr-1" />
                  Aktif
                </Badge>
              </div>

              {/* Quick Copy Endpoint */}
              <div className="flex items-center space-x-2">
                <Input
                  value={agent.phone_endpoint}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(agent.phone_endpoint)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {/* Short Prompt Preview */}
              <div>
                <p className="text-xs text-muted-foreground">
                  {agent.prompt.length > 100 
                    ? `${agent.prompt.substring(0, 100)}...` 
                    : agent.prompt
                  }
                </p>
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