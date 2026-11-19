'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, Loader2, Volume2 } from 'lucide-react';
import { textToSpeechAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

type Language = 'English' | 'Hindi' | 'Bengali' | 'Marathi' | 'Gujarati' | 'Tamil';

interface VoiceNarratorProps {
  textToSpeak: string;
  language: Language;
}

const langCodes: Record<Language, string> = {
  English: 'en-IN',
  Hindi: 'hi-IN',
  Bengali: 'bn-IN',
  Marathi: 'mr-IN',
  Gujarati: 'gu-IN',
  Tamil: 'ta-IN',
};

const listenLabels: Record<Language, string> = {
  English: 'Listen in English',
  Hindi: 'हिंदी में सुनें (Listen)',
  Bengali: 'বাংলায় শুনুন (Listen)',
  Marathi: 'मराठीत ऐका',
  Gujarati: 'ગુજરાતીમાં સાંભળો',
  Tamil: 'தமிழில் கேளுங்கள்',
};

export function VoiceNarrator({ textToSpeak, language }: VoiceNarratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [isUsingWebSpeech, setIsUsingWebSpeech] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const stopAll = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);

  // Reset audio when text or language changes
  useEffect(() => {
    stopAll();
    setAudioDataUri(null);
  }, [textToSpeak, language, stopAll]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAll();
    };
  }, [stopAll]);

  const speakWithWebSpeech = (text: string, lang: Language): boolean => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const targetCode = langCodes[lang] || 'en-IN';
      utterance.lang = targetCode;

      // Select voice if available
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(
        v => v.lang.toLowerCase() === targetCode.toLowerCase() ||
             v.lang.toLowerCase().startsWith(targetCode.substring(0, 2).toLowerCase())
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.rate = 0.95; // Slightly slower for clear Indian language pronunciation
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsUsingWebSpeech(true);
      };
      utterance.onend = () => {
        setIsPlaying(false);
        setIsUsingWebSpeech(false);
      };
      utterance.onerror = (e) => {
        console.warn('Web speech synthesis notice:', e);
        setIsPlaying(false);
        setIsUsingWebSpeech(false);
      };

      window.speechSynthesis.speak(utterance);
      return true;
    } catch {
      return false;
    }
  };

  const handlePlayPause = async () => {
    // If currently playing, pause
    if (isPlaying) {
      if (isUsingWebSpeech && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
        return;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }
    }

    // Try Web Speech API first
    if (!audioDataUri && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const speechStarted = speakWithWebSpeech(textToSpeak, language);
      if (speechStarted) {
        return;
      }
    }

    // If pre-generated server audio exists
    if (audioDataUri && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    // Fall back to server Genkit TTS
    setIsLoading(true);
    try {
      const result = await textToSpeechAction({ text: textToSpeak, language });
      if (result.audioDataUri) {
        setAudioDataUri(result.audioDataUri);
        if (audioRef.current) {
          audioRef.current.src = result.audioDataUri;
          await audioRef.current.play();
          setIsPlaying(true);
        }
      } else {
        throw new Error('Could not synthesize voice.');
      }
    } catch (error: any) {
      // Last-ditch attempt with Web Speech default voice
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        speakWithWebSpeech(textToSpeak, language);
      } else {
        toast({
          variant: 'destructive',
          title: 'Voice Narration Notice',
          description: error.message || 'Voice playback could not be started.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    stopAll();
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handlePlayPause}
        variant={isPlaying ? 'default' : 'outline'}
        disabled={isLoading}
        className={isPlaying ? 'bg-primary text-primary-foreground animate-pulse' : ''}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading Voice...
          </>
        ) : isPlaying ? (
          <>
            <Pause className="mr-2 h-4 w-4" />
            Pause Audio
          </>
        ) : (
          <>
            <Volume2 className="mr-2 h-4 w-4 text-primary" />
            {listenLabels[language] || 'Listen'}
          </>
        )}
      </Button>

      {isPlaying && (
        <Button onClick={handleStop} variant="ghost" size="icon" title="Stop Audio">
          <Square className="h-4 w-4 text-destructive fill-destructive" />
          <span className="sr-only">Stop</span>
        </Button>
      )}

      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}
