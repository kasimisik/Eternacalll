import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Loader2, Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VoiceClonerProps {
  onVoiceCloned?: (voiceId: string, voiceName: string) => void;
  className?: string;
}

interface UploadedFile {
  file: File;
  id: string;
}

export function VoiceCloner({ onVoiceCloned, className }: VoiceClonerProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;

    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < uploadedFiles.length && files.length + newFiles.length < 5; i++) {
      const file = uploadedFiles[i];
      
      // Check file type
      if (!file.type.startsWith('audio/')) {
        setError('Sadece ses dosyaları kabul edilir');
        continue;
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('Dosya boyutu 10MB\'dan büyük olamaz');
        continue;
      }

      newFiles.push({
        file,
        id: Math.random().toString(36).substring(2)
      });
    }

    setFiles(prev => [...prev, ...newFiles]);
    setError(null);
    
    // Clear the input
    event.target.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Ses ismi gereklidir');
      return;
    }

    if (files.length === 0) {
      setError('En az bir ses dosyası yüklemek gereklidir');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append('name', name.trim());
      
      if (description.trim()) {
        formData.append('description', description.trim());
      }

      // Add all files to form data
      files.forEach(({ file }) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/voices/clone', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Ses klonlama işlemi başarısız');
      }

      setSuccess(`Ses başarıyla oluşturuldu! Voice ID: ${data.voice_id}`);
      
      // Call callback if provided
      if (onVoiceCloned) {
        onVoiceCloned(data.voice_id, name);
      }

      // Reset form
      setName('');
      setDescription('');
      setFiles([]);

    } catch (error) {
      console.error('Voice cloning error:', error);
      setError(error instanceof Error ? error.message : 'Ses klonlama işlemi başarısız');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Özel Ses Oluştur</CardTitle>
        <CardDescription>
          Kendi ses dosyalarınızı yükleyerek özel bir AI sesi oluşturun. 
          En iyi sonuç için yüksek kaliteli, temiz ses kayıtları kullanın.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Voice Name */}
          <div className="space-y-2">
            <Label htmlFor="voice-name">Ses Adı *</Label>
            <Input
              id="voice-name"
              placeholder="Örn: Mehmet'in Sesi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="voice-description">Açıklama (Opsiyonel)</Label>
            <Textarea
              id="voice-description"
              placeholder="Bu sesin özelliklerini açıklayın..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <Label>Ses Dosyaları * (Maksimum 5 dosya)</Label>
            
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="audio/*"
                onChange={handleFileUpload}
                disabled={loading || files.length >= 5}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className={`cursor-pointer inline-flex items-center justify-center ${
                  loading || files.length >= 5 
                    ? 'cursor-not-allowed opacity-50' 
                    : 'hover:bg-muted'
                } px-4 py-2 border border-input bg-background rounded-md text-sm`}
              >
                <Upload className="h-4 w-4 mr-2" />
                {files.length >= 5 ? 'Maksimum dosya sayısına ulaştınız' : 'Ses Dosyası Seç'}
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                MP3, WAV, M4A gibi ses formatları desteklenir. Maksimum dosya boyutu: 10MB
              </p>
            </div>

            {/* Uploaded Files List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <Label>Yüklenen Dosyalar ({files.length}/5)</Label>
                {files.map(({ file, id }) => (
                  <div key={id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {file.type}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(id)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert>
              <Check className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={loading || !name.trim() || files.length === 0}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Ses Oluşturuluyor...
              </>
            ) : (
              'Ses Oluştur'
            )}
          </Button>

          {/* Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• En iyi sonuç için temiz, net kayıtlar kullanın</p>
            <p>• Farklı cümle ve tonlamalarda örnekler verin</p>
            <p>• Arka plan gürültüsü olmayan kayıtları tercih edin</p>
            <p>• Toplam süre 1-30 dakika arası olmalı</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}