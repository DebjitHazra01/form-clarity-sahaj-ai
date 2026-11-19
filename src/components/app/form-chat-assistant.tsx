'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { VoiceNarrator } from './voice-narrator';
import { askFormChatAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Sparkles,
  Bot,
  User,
  Loader2,
  HelpCircle,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import type { ExplainGovernmentFormOutput, SupportedLanguage } from '@/ai/flows/explain-government-form';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface FormChatAssistantProps {
  formAnalysis: ExplainGovernmentFormOutput;
  language: SupportedLanguage;
}

const DEFAULT_QUESTIONS: Record<string, string[]> = {
  English: [
    'Which government office or center do I have to visit for this form?',
    'Which documents are strictly mandatory?',
    'What if I do not have a birth certificate?',
    'Where do I have to sign on this form?',
    'What is the official fee and can I walk in?',
  ],
  Hindi: [
    'इस फॉर्म को जमा करने या मदद के लिए मुझे किस सरकारी कार्यालय जाना होगा?',
    'कौन से दस्तावेज़ अनिवार्य (कंपलसरी) हैं?',
    'यदि मेरे पास जन्म प्रमाण पत्र नहीं है तो क्या करें?',
    'इस फॉर्म में मुझे कहां हस्ताक्षर करने होंगे?',
    'इसकी सरकारी फीस कितनी है और क्या वॉक-इन संभव है?',
  ],
  Bengali: [
    'এই ফর্মটি জমা দিতে বা সাহায্যের জন্য আমাকে কোন সরকারি অফিসে যেতে হবে?',
    'কোন কোন নথিপত্র দেওয়া বাধ্যতামূলক?',
    'বার্থ সার্টিফিকেট না থাকলে কি বিকল্প দেওয়া যাবে?',
    'এই ফর্মের কোন জায়গায় আমাকে সই করতে হবে?',
    'অফিসের সরকারি ফি কত এবং সরাসরি যাওয়া যাবে কি?',
  ],
  Marathi: [
    'हा अर्ज जमा करण्यासाठी कोणत्या सरकारी कार्यालयात जावे लागेल?',
    'कोणती कागदपत्रे अनिवार्य आहेत?',
    'जन्म प्रमाणपत्र नसल्यास काय करावे?',
    'या अर्जावर कुठे स्वाक्षरी करावी लागेल?',
  ],
  Gujarati: [
    'આ ફોર્મ જમા કરાવવા કઈ સરકારી કચેરીએ જવું પડશે?',
    'કયા દસ્તાવેજો ફરજિયાત છે?',
    'જન્મ પ્રમાણપત્ર ન હોય તો શું કરવું?',
    'આ ફોર્મમાં ક્યાં સહી કરવી?',
  ],
  Tamil: [
    'இந்த படிவத்தை சமர்ப்பிக்க எந்த அரசு அலுவலகத்திற்கு செல்ல வேண்டும்?',
    'எந்த ஆவணங்கள் கட்டாயமாகும்?',
    'பிறப்புச் சான்றிதழ் இல்லையென்றால் என்ன செய்வது?',
    'இந்த படிவத்தில் எங்கு கையொப்பமிட வேண்டும்?',
  ],
};

export function FormChatAssistant({ formAnalysis, language }: FormChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: getWelcomeMessage(language, formAnalysis.formTitle),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(
    DEFAULT_QUESTIONS[language] || DEFAULT_QUESTIONS.English
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    setSuggestedQuestions(DEFAULT_QUESTIONS[language] || DEFAULT_QUESTIONS.English);
  }, [language]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await askFormChatAction({
        question: textToSend,
        language,
        formContext: {
          formTitle: formAnalysis.formTitle,
          issuingDepartment: formAnalysis.issuingDepartment,
          purpose: formAnalysis.purpose,
          applicationType: formAnalysis.applicationType,
          explanation: formAnalysis.explanation,
          checklist: formAnalysis.checklist,
          requiredDocuments: formAnalysis.requiredDocuments.map(d => ({
            name: d.name,
            requirementType: d.requirementType,
            condition: d.condition,
            reason: d.reason,
            acceptableProofs: d.acceptableProofs,
          })),
          formFields: formAnalysis.formFields.map(f => ({
            key: f.key,
            label: f.label,
            simplifiedExplanation: f.simplifiedExplanation,
            required: f.required,
            whereToFind: f.whereToFind,
          })),
          officialPortal: formAnalysis.officialPortal,
          officialHelpline: formAnalysis.officialHelpline,
        },
        history,
      });

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'model',
        content: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
      if (res.suggestedFollowUps && res.suggestedFollowUps.length > 0) {
        setSuggestedQuestions(res.suggestedFollowUps);
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Assistant error',
        description: err.message || 'Could not reach Sahaj AI assistant.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast({
        variant: 'destructive',
        title: 'Microphone not supported',
        description: 'Your browser does not support Web Speech Recognition.',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;

      const langCodes: Record<string, string> = {
        English: 'en-IN',
        Hindi: 'hi-IN',
        Bengali: 'bn-IN',
        Marathi: 'mr-IN',
        Gujarati: 'gu-IN',
        Tamil: 'ta-IN',
      };
      recognition.lang = langCodes[language] || 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e: any) => {
        setIsListening(false);
        console.warn('Speech recognition error:', e.error);
      };
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputQuery(transcript);
          handleSend(transcript);
        }
      };

      recognition.start();
    } catch (e: any) {
      setIsListening(false);
      console.warn('Could not start recognition:', e);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        content: getWelcomeMessage(language, formAnalysis.formTitle),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setSuggestedQuestions(DEFAULT_QUESTIONS[language] || DEFAULT_QUESTIONS.English);
  };

  return (
    <Card className="w-full shadow-md border border-slate-200 bg-white rounded-xl overflow-hidden flex flex-col h-[620px]">
      <CardHeader className="bg-slate-50 py-3.5 px-5 border-b border-slate-200 shrink-0 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center shadow-inner">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              Sahaj AI Form Assistant
              <Badge variant="secondary" className="text-xs bg-emerald-500/15 text-emerald-700 border border-emerald-300">
                <Sparkles className="h-3 w-3 mr-1" />
                Live Form Grounded
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs truncate max-w-sm">
              Answers questions strictly about <span className="font-semibold text-foreground">{formAnalysis.formTitle}</span>
            </CardDescription>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetChat}
          className="text-xs text-muted-foreground hover:text-foreground h-8"
          title="Reset conversation"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          Reset
        </Button>
      </CardHeader>

      {/* Messages Scroll Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-1">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-none'
                  : 'bg-secondary/40 border border-border text-foreground rounded-tl-none'
              }`}
            >
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              <div className="flex items-center justify-between gap-3 mt-2 pt-1 border-t border-border/30 text-[10px] opacity-75">
                <span>{msg.timestamp}</span>
                {msg.role === 'model' && (
                  <VoiceNarrator textToSpeak={msg.content} language={language} />
                )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-1">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-1">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-secondary/40 border border-border rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Checking form guidelines...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && (
        <div className="px-4 py-2 border-t bg-secondary/15 shrink-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-1" />
          <span className="text-xs text-muted-foreground shrink-0 font-medium mr-1">Suggested:</span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="text-xs bg-card hover:bg-primary/10 hover:border-primary/40 border rounded-full px-3 py-1 text-foreground whitespace-nowrap transition-colors shadow-2xs cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="p-3 border-t bg-card shrink-0">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            placeholder={`Ask a question in ${language}... (e.g. "Is PAN mandatory?")`}
            disabled={isLoading}
            className="flex-1 h-11 text-sm bg-background"
          />

          <Button
            type="button"
            variant={isListening ? 'destructive' : 'outline'}
            size="icon"
            onClick={handleVoiceInput}
            title={isListening ? 'Stop listening' : 'Speak your question'}
            className="h-11 w-11 shrink-0"
          >
            {isListening ? <MicOff className="h-5 w-5 animate-pulse" /> : <Mic className="h-5 w-5 text-primary" />}
          </Button>

          <Button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            size="icon"
            className="h-11 w-11 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </Card>
  );
}

function getWelcomeMessage(lang: SupportedLanguage, title: string): string {
  switch (lang) {
    case 'Hindi':
      return `नमस्ते! मैं सहज एआई (Sahaj AI) सहायक हूँ। मैंने आपके "${title}" फॉर्म का विश्लेषण कर लिया है। आप इस फॉर्म के किसी भी नियम, आवश्यक दस्तावेज़ों, या भरने के तरीके के बारे में हिंदी में पूछ सकते हैं।`;
    case 'Bengali':
      return `নমস্কার! আমি সহজ এআই (Sahaj AI) সহকারী। আমি আপনার "${title}" ফর্মটি পড়ে বিশ্লেষণ করেছি। ফর্মটি কীভাবে পূরণ করবেন, কোন নথিপত্র বাধ্যতামূলক, অথবা কোথায় জমা দেবেন—যেকোনো প্রশ্ন আপনি বাংলায় করতে পারেন।`;
    case 'Marathi':
      return `नमस्कार! मी सहज एआय सहाय्यक आहे. मी तुमच्या "${title}" अर्जाचे विश्लेषण केले आहे. आवश्यक कागदपत्रे किंवा भरण्याच्या पद्धतीबद्दल तुम्ही मला मराठीत प्रश्न विचारू शकता.`;
    case 'Gujarati':
      return `નમસ્તે! હું સહજ AI સહાયક છું. મેં તમારા "${title}" ફોર્મનું વિશ્લેષણ કર્યું છે. જરૂરી દસ્તાવેજો કે ફોર્મ ભરવા વિશે તમે મને ગુજરાતીમાં પૂછી શકો છો.`;
    case 'Tamil':
      return `வணக்கம்! நான் சஹஜ் AI உதவியாளர். உங்கள் "${title}" படிவத்தை ஆய்வு செய்துள்ளேன். தேவையான ஆவணங்கள் அல்லது பூர்த்தி செய்யும் முறை பற்றி நீங்கள் தமிழில் என்னிடம் கேட்கலாம்.`;
    default:
      return `Hello! I am your Sahaj AI Paperwork Assistant. I have analyzed your "${title}" document. Ask me any question in simple language about compulsory documents, where to sign, fees, or how to submit without mistakes!`;
  }
}
