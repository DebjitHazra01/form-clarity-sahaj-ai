'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, File as FileIcon, Loader2, Camera, Sparkles, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CameraCaptureDialog } from './camera-capture-dialog';

type Language = 'English' | 'Hindi' | 'Bengali' | 'Marathi' | 'Gujarati' | 'Tamil';

const languageOptions: { value: Language; label: string; native: string }[] = [
  { value: 'English', label: 'English', native: 'English' },
  { value: 'Bengali', label: 'Bengali', native: 'বাংলা (Bengali)' },
  { value: 'Hindi', label: 'Hindi', native: 'हिंदी (Hindi)' },
  { value: 'Marathi', label: 'Marathi', native: 'मराठी' },
  { value: 'Gujarati', label: 'Gujarati', native: 'ગુજરાતી' },
  { value: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
];

const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/pjpeg', 'image/png', 'image/webp'];
const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
const maxSize = 15 * 1024 * 1024; // 15MB

interface FileUploaderProps {
  onFileProcess: (file: File, language: Language) => void;
  disabled: boolean;
}

export function FileUploader({ onFileProcess, disabled }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<Language>('English');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateAndSetFile = (selectedFile: File) => {
    const fileNameLower = selectedFile.name.toLowerCase();
    const hasValidExt = allowedExtensions.some(ext => fileNameLower.endsWith(ext));
    const hasValidMime = allowedTypes.includes(selectedFile.type) || selectedFile.type === '';

    if (!hasValidExt && !hasValidMime) {
      toast({
        variant: 'destructive',
        title: 'Unsupported file format',
        description: 'Please upload a PDF, JPG, JPEG, or PNG government form document.',
      });
      return;
    }
    if (selectedFile.size === 0) {
      toast({
        variant: 'destructive',
        title: 'Empty file',
        description: 'The selected file is empty (0 bytes). Please choose a valid document.',
      });
      return;
    }
    if (selectedFile.size > maxSize) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'File size cannot exceed 15MB. Please choose a smaller file.',
      });
      return;
    }
    setFile(selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragActive(true);
    else if (e.type === 'dragleave') setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleCameraPhoto = (capturedFile: File) => {
    validateAndSetFile(capturedFile);
  };

  const handleProcess = () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please upload or snap a photo of a government form.',
      });
      return;
    }
    setIsProcessing(true);
    onFileProcess(file, language);
  };

  return (
    <Card className="w-full max-w-xl mx-auto text-center print:hidden animate-in fade-in-50 duration-500 shadow-md border border-slate-200 bg-white rounded-xl overflow-hidden">
      <CardHeader className="bg-slate-50/70 border-b border-slate-200 pb-5">
        <div className="flex flex-wrap justify-center gap-2 mb-2">
          <Badge className="bg-blue-700 text-white font-medium text-xs">
            <Globe className="h-3 w-3 mr-1" />
            6 Official Languages (EN, BN, HI, MR, GU, TA)
          </Badge>
          <Badge variant="outline" className="text-emerald-800 bg-emerald-50 border-emerald-300 font-medium text-xs">
            <Sparkles className="h-3 w-3 mr-1 text-emerald-600" />
            Auto-Fill Ready
          </Badge>
        </div>
        <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900">
          Upload Government Form
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-slate-600 pt-1">
          Upload any Central or State government form to understand requirements in your language and automatically fill it.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Drop zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
            isDragActive
              ? 'border-primary bg-primary/10 scale-[0.99]'
              : 'border-border hover:border-primary/80 hover:bg-secondary/30'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleChange}
            accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
          />
          <div className="flex flex-col items-center justify-center space-y-3 text-muted-foreground pointer-events-none">
            <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <UploadCloud className="h-7 w-7" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">
                {isDragActive ? 'Drop form here...' : 'Upload Form Document'}
              </p>
              <p className="text-sm mt-0.5">Drag & drop PDF, JPG, PNG or click to browse</p>
            </div>
            <span className="text-xs text-muted-foreground">Up to 15MB • Scanned forms or official PDFs</span>
          </div>
        </div>

        {/* Or snap photo of paper form */}
        <div className="flex items-center gap-3">
          <div className="h-px bg-border flex-1" />
          <span className="text-xs uppercase text-muted-foreground font-semibold">Or photograph paper form</span>
          <div className="h-px bg-border flex-1" />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCameraOpen(true)}
            className="flex-1 h-11 border-dashed hover:border-primary"
          >
            <Camera className="mr-2 h-4 w-4 text-primary" />
            Snap Photo with Camera
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => nativeCameraInputRef.current?.click()}
            className="h-11 sm:flex hidden"
            title="Mobile camera"
          >
            Mobile Shutter
          </Button>
        </div>

        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleChange}
        />

        {/* Selected File Card */}
        {file && (
          <div className="flex items-center justify-between p-3.5 bg-primary/10 border border-primary/20 rounded-xl text-foreground animate-in fade-in-50">
            <div className="flex items-center gap-3 overflow-hidden text-left">
              <div className="h-10 w-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <FileIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFile(null)}
              className="text-muted-foreground hover:text-destructive text-xs"
            >
              Change
            </Button>
          </div>
        )}

        {/* Language selector */}
        <div className="space-y-2 text-left">
          <Label htmlFor="language-select" className="text-sm font-medium flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-primary" />
            Primary Language
          </Label>
          <Select
            value={language}
            onValueChange={v => setLanguage(v as Language)}
            disabled={disabled || isProcessing}
          >
            <SelectTrigger id="language-select" className="h-11">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.native}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Explanations and checklists are available in English, Bengali, Hindi, Marathi, Gujarati, and Tamil.
          </p>
        </div>

        <Button
          onClick={handleProcess}
          disabled={!file || disabled || isProcessing}
          size="lg"
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base shadow-md"
        >
          {isProcessing || disabled ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing Form...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Analyze & Explain Form
            </>
          )}
        </Button>
      </CardContent>

      {/* Camera Capture Dialog */}
      <CameraCaptureDialog
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onPhotoCaptured={handleCameraPhoto}
        documentTitle="Government Form"
      />
    </Card>
  );
}
