'use client';

import React, { ChangeEvent, useRef, useState, useEffect } from 'react';
import {
  FileIcon,
  Loader2,
  UploadCloud,
  X,
  Camera,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Eye,
  Plus,
  ArrowLeft,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CameraCaptureDialog } from './camera-capture-dialog';
import type { RequiredDocument } from '@/ai/flows/explain-government-form';

type Language = 'English' | 'Hindi' | 'Bengali' | 'Marathi' | 'Gujarati' | 'Tamil';

interface SupportingDocumentsUploaderProps {
  requiredDocuments: RequiredDocument[];
  language?: Language;
  onProcess: (files: File[]) => Promise<void>;
  onBack: () => void;
}

interface UploadedFileItem {
  file: File;
  previewUrl?: string;
  source: 'camera' | 'upload';
  tag?: string;
}

export function SupportingDocumentsUploader({
  requiredDocuments,
  language = 'English',
  onProcess,
  onBack,
}: SupportingDocumentsUploaderProps) {
  const [items, setItems] = useState<UploadedFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [activeDocTag, setActiveDocTag] = useState<string | undefined>(undefined);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  // Helper to generate preview URLs safely
  useEffect(() => {
    return () => {
      items.forEach(item => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [items]);

  const addFiles = (incoming: FileList | File[] | null, source: 'camera' | 'upload' = 'upload', tag?: string) => {
    if (!incoming) return;
    const array = Array.isArray(incoming) ? incoming : Array.from(incoming);
    const accepted = array.filter(file =>
      ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type) &&
      file.size <= 15 * 1024 * 1024
    );

    const newItems: UploadedFileItem[] = accepted.map(file => ({
      file,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      source,
      tag: tag || (source === 'camera' ? 'Camera Photo' : 'Document File'),
    }));

    setItems(current => [...current, ...newItems]);
  };

  const handleCameraPhoto = (file: File) => {
    addFiles([file], 'camera', activeDocTag || 'Camera Photo');
    setActiveDocTag(undefined);
  };

  const openCameraForDoc = (docName: string) => {
    setActiveDocTag(docName);
    setCameraOpen(true);
  };

  const removeItem = (index: number) => {
    setItems(current => {
      const removed = current[index];
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((_, i) => i !== index);
    });
  };

  const handleProcess = async () => {
    if (!items.length) return;
    setIsProcessing(true);
    try {
      await onProcess(items.map(item => item.file));
    } finally {
      setIsProcessing(false);
    }
  };

  // Localized texts
  const t = {
    English: {
      title: 'Click Photos or Upload Supporting Documents',
      desc: 'Snap clear photos with your camera or upload files. Sahaj AI will automatically read your documents and fill the form.',
      cameraBtn: 'Open Live Camera',
      nativeCameraBtn: 'Mobile Camera',
      uploadFilesBtn: 'Upload Files',
      dropText: 'Click camera button above or drop photos / PDFs here',
      filesAttached: 'Documents ready for auto-filling',
      startAutoFill: 'Auto-Fill Form from My Documents',
      readingDocs: 'AI reading documents and auto-filling form...',
      forDoc: 'Snap photo for',
      capturedBadge: '📸 Camera Photo',
      uploadedBadge: '📁 File',
    },
    Hindi: {
      title: 'सहायक दस्तावेज़ों की फ़ोटो लें या अपलोड करें',
      desc: 'कैमरे से साफ़ फ़ोटो खींचें या फ़ाइल अपलोड करें। सहज एआई आपके दस्तावेज़ों को पढ़कर अपने आप फॉर्म भर देगा।',
      cameraBtn: 'कैमरा खोलें (फ़ोटो लें)',
      nativeCameraBtn: 'मोबाइल कैमरा',
      uploadFilesBtn: 'फ़ाइलें चुनें',
      dropText: 'ऊपर कैमरा बटन दबाएं या यहाँ फ़ोटो / पीडीएफ छोड़ें',
      filesAttached: 'फॉर्म भरने के लिए तैयार दस्तावेज़',
      startAutoFill: 'दस्तावेज़ों से फॉर्म स्वतः भरें (Auto-Fill)',
      readingDocs: 'एआई दस्तावेज़ पढ़ रहा है और फॉर्म भर रहा है...',
      forDoc: 'फ़ोटो लें:',
      capturedBadge: '📸 कैमरे से फ़ोटो',
      uploadedBadge: '📁 फ़ाइल',
    },
    Bengali: {
      title: 'সহায়ক নথিপত্রের ছবি তুলুন বা আপলোড করুন',
      desc: 'ক্যামেরা দিয়ে স্পষ্ট ছবি তুলুন অথবা ফাইল আপলোড করুন। সহজ এআই আপনার নথি পড়ে স্বয়ংক্রিয়ভাবে ফর্মটি পূরণ করে দেবে।',
      cameraBtn: 'ক্যামেরা খুলুন (ছবি তুলুন)',
      nativeCameraBtn: 'মোবাইল ক্যামেরা',
      uploadFilesBtn: 'ফাইল আপলোড',
      dropText: 'উপরের ক্যামেরা বাটনে ক্লিক করুন বা ছবি / পিডিএফ এখানে রাখুন',
      filesAttached: 'ফর্ম পূরণের জন্য প্রস্তুত নথিপত্র',
      startAutoFill: 'নথিপত্র থেকে ফর্মটি পূরণ করুন (Auto-Fill)',
      readingDocs: 'এআই নথি পড়ছে এবং ফর্ম পূরণ করছে...',
      forDoc: 'ছবি তুলুন:',
      capturedBadge: '📸 ক্যামেরার ছবি',
      uploadedBadge: '📁 ফাইল',
    },
  }[language === 'Bengali' ? 'Bengali' : language === 'Hindi' ? 'Hindi' : 'English'];

  const getDocName = (doc: RequiredDocument) => {
    if (language === 'Bengali' && doc.nameBn) return doc.nameBn;
    if (language === 'Hindi' && doc.nameHi) return doc.nameHi;
    return doc.name;
  };

  const getDocReason = (doc: RequiredDocument) => {
    if (language === 'Bengali' && doc.reasonBn) return doc.reasonBn;
    if (language === 'Hindi' && doc.reasonHi) return doc.reasonHi;
    return doc.reason;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto animate-in fade-in-50 duration-500 shadow-md border border-slate-200 bg-white rounded-xl overflow-hidden">
      <CardHeader className="bg-slate-50 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <Badge className="bg-primary text-primary-foreground font-semibold">
            Step 2: Document Capture
          </Badge>
        </div>
        <CardTitle className="font-headline text-2xl sm:text-3xl text-foreground">
          {t.title}
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground pt-1">
          {t.desc}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Required Documents Checklist */}
        <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-sm">
          <h3 className="font-semibold text-base text-foreground mb-3 flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            Documents Needed for This Form:
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            {requiredDocuments.map((doc, index) => {
              const docName = getDocName(doc);
              const isMatched = items.some(
                item => item.tag?.toLowerCase().includes(doc.name.toLowerCase()) ||
                        item.file.name.toLowerCase().includes(doc.name.toLowerCase().slice(0, 4))
              );

              return (
                <div
                  key={`${doc.name}-${index}`}
                  className={`flex flex-col justify-between p-3.5 rounded-lg border transition-colors ${
                    isMatched
                      ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800'
                      : 'bg-secondary/40 border-border hover:bg-secondary/70'
                  }`}
                >
                  <div className="mb-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-foreground flex items-center gap-1.5">
                        {isMatched ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                        {docName}
                      </p>
                      {isMatched && (
                        <Badge variant="outline" className="text-xs bg-emerald-100 text-emerald-800 border-emerald-300">
                          Photo Attached
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 pl-3.5">
                      {getDocReason(doc)}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => openCameraForDoc(doc.name)}
                      className="text-xs h-7 text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <Camera className="h-3.5 w-3.5 mr-1" />
                      {t.forDoc} {docName.split(' ')[0]}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Primary Action Buttons: Camera & Upload */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Live Camera Button */}
          <Button
            type="button"
            size="lg"
            onClick={() => {
              setActiveDocTag(undefined);
              setCameraOpen(true);
            }}
            className="h-16 flex flex-col items-center justify-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md rounded-xl"
          >
            <div className="flex items-center gap-2 font-bold text-base">
              <Camera className="h-5 w-5" />
              {t.cameraBtn}
            </div>
            <span className="text-xs font-normal opacity-90">Live viewfinder with guide</span>
          </Button>

          {/* 2. Native Mobile Camera Button */}
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={() => nativeCameraInputRef.current?.click()}
            className="h-16 flex flex-col items-center justify-center gap-1 border-2 hover:border-primary rounded-xl"
          >
            <div className="flex items-center gap-2 font-semibold text-base text-foreground">
              <Smartphone className="h-5 w-5 text-primary" />
              {t.nativeCameraBtn}
            </div>
            <span className="text-xs text-muted-foreground">Open phone camera app</span>
          </Button>

          {/* 3. File Browser Upload Button */}
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="h-16 flex flex-col items-center justify-center gap-1 border-2 hover:border-primary rounded-xl"
          >
            <div className="flex items-center gap-2 font-semibold text-base text-foreground">
              <UploadCloud className="h-5 w-5 text-primary" />
              {t.uploadFilesBtn}
            </div>
            <span className="text-xs text-muted-foreground">Photos or PDFs from device</span>
          </Button>
        </div>

        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            addFiles(e.target.files, 'upload');
            e.target.value = '';
          }}
        />
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            addFiles(e.target.files, 'camera', 'Mobile Camera Photo');
            e.target.value = '';
          }}
        />

        {/* Photo Gallery of Captured & Uploaded Documents */}
        {items.length > 0 ? (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-base flex items-center gap-2 text-foreground">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                {t.filesAttached} ({items.length})
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-primary"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add more
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {items.map((item, index) => (
                <div
                  key={`${item.file.name}-${index}`}
                  className="group relative rounded-xl border bg-card p-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail or PDF icon */}
                    {item.previewUrl ? (
                      <div
                        onClick={() => setPreviewModalUrl(item.previewUrl || null)}
                        className="relative h-16 w-16 rounded-lg overflow-hidden bg-black/5 shrink-0 cursor-pointer border hover:opacity-90"
                      >
                        <img
                          src={item.previewUrl}
                          alt={item.file.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                          <Eye className="h-4 w-4" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileIcon className="h-8 w-8" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <Badge
                        variant="secondary"
                        className="text-[10px] mb-1 font-medium px-1.5 py-0"
                      >
                        {item.source === 'camera' ? t.capturedBadge : t.uploadedBadge}
                      </Badge>
                      <p className="font-medium text-xs truncate text-foreground" title={item.file.name}>
                        {item.tag || item.file.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {(item.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removeItem(index)}
                      title="Remove"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border-2 border-dashed p-8 text-center cursor-pointer hover:border-primary/70 transition-colors bg-secondary/20"
          >
            <Camera className="mx-auto h-10 w-10 text-muted-foreground/70" />
            <p className="mt-2 text-sm font-medium text-foreground">{t.dropText}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports JPEG, PNG, WebP photos & PDFs (up to 15MB each)
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col-reverse sm:flex-row gap-3 justify-between items-center bg-secondary/30 p-6 border-t">
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Explanation
        </Button>

        <Button
          size="lg"
          onClick={handleProcess}
          disabled={!items.length || isProcessing}
          className="w-full sm:w-auto bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-700 text-primary-foreground font-bold text-base px-8 h-12 shadow-lg disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t.readingDocs}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              {t.startAutoFill}
            </>
          )}
        </Button>
      </CardFooter>

      {/* Camera Capture Dialog */}
      <CameraCaptureDialog
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onPhotoCaptured={handleCameraPhoto}
        documentTitle={activeDocTag}
      />

      {/* Zoom Preview Modal */}
      {previewModalUrl && (
        <div
          onClick={() => setPreviewModalUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={previewModalUrl}
              alt="Preview"
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-2 right-2 rounded-full"
              onClick={() => setPreviewModalUrl(null)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
