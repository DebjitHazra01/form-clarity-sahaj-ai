'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VoiceNarrator } from './voice-narrator';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Camera,
  CheckSquare,
  FileText,
  Globe,
  Layers,
  Sparkles,
  Building2,
  Printer,
  HelpCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  ExternalLink,
  PhoneCall,
  Loader2,
  MessageSquare,
  MapPin,
  ListOrdered,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormChatAssistant } from './form-chat-assistant';
import { GovernmentOfficeFinder } from './government-office-finder';
import { translateExplanationAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type {
  ExplainGovernmentFormOutput,
  FormField,
  RequiredDocument,
  SupportedLanguage,
} from '@/ai/flows/explain-government-form';
import { getFormDesignatedOfficeGuidance, type DesignatedOfficeGuidance } from '@/lib/designated-offices';

interface MultilingualBundle {
  en?: string;
  hi?: string;
  bn?: string;
  mr?: string;
  gu?: string;
  ta?: string;
}

interface MultilingualListBundle {
  en?: string[];
  hi?: string[];
  bn?: string[];
  mr?: string[];
  gu?: string[];
  ta?: string[];
}

interface ExplanationViewProps {
  formTitle?: string;
  formTitleHi?: string;
  formTitleBn?: string;
  issuingDepartment?: string;
  issuingDepartmentHi?: string;
  issuingDepartmentBn?: string;
  applicationType?: string;
  applicationTypeHi?: string;
  applicationTypeBn?: string;
  purpose?: string;
  purposeHi?: string;
  purposeBn?: string;
  explanation: string;
  checklist: string[];
  explanations?: MultilingualBundle;
  checklists?: MultilingualListBundle;
  fileName: string;
  language: SupportedLanguage;
  onNewUpload: () => void;
  onLanguageChange?: (language: SupportedLanguage) => void;
  requiredDocuments: RequiredDocument[];
  formFields: FormField[];
  designatedOfficeGuidance?: DesignatedOfficeGuidance;
  officialPortal?: string;
  officialHelpline?: string;
  submissionMode?: string;
  onContinue: () => void;
}

const SUPPORTED_LANGUAGES: { value: SupportedLanguage; label: string; native: string }[] = [
  { value: 'English', label: 'English', native: 'English' },
  { value: 'Bengali', label: 'Bengali', native: 'বাংলা (Bengali)' },
  { value: 'Hindi', label: 'Hindi', native: 'हिंदी (Hindi)' },
  { value: 'Marathi', label: 'Marathi', native: 'मराठी' },
  { value: 'Gujarati', label: 'Gujarati', native: 'ગુજરાતી' },
  { value: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
];

export function ExplanationView({
  formTitle,
  formTitleHi,
  formTitleBn,
  issuingDepartment = 'Government Authority of India',
  issuingDepartmentHi,
  issuingDepartmentBn,
  applicationType = 'Citizen Application',
  applicationTypeHi,
  applicationTypeBn,
  purpose,
  purposeHi,
  purposeBn,
  explanation,
  checklist,
  explanations,
  checklists,
  fileName,
  language,
  onNewUpload,
  onLanguageChange,
  requiredDocuments,
  formFields,
  designatedOfficeGuidance,
  officialPortal = 'https://www.india.gov.in/',
  officialHelpline = '1800-11-4000',
  submissionMode = 'Online & In-Person at Designated Center',
  onContinue,
}: ExplanationViewProps) {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(language);
  const [activeTab, setActiveTab] = useState('overview');
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  // Dynamic on-demand translation cache
  const [translationsCache, setTranslationsCache] = useState<
    Record<
      string,
      {
        title?: string;
        department?: string;
        purpose?: string;
        applicationType?: string;
        explanation?: string;
        checklist?: string[];
      }
    >
  >({});

  const handleLangSelect = async (lang: SupportedLanguage) => {
    setSelectedLang(lang);
    onLanguageChange?.(lang);

    // If English, Bengali, or Hindi, check if we already have static fields
    if (lang === 'English' || (lang === 'Hindi' && explanations?.hi) || (lang === 'Bengali' && explanations?.bn)) {
      return;
    }

    // Check cache
    if (translationsCache[lang]) {
      return;
    }

    // Call translation action for Marathi, Gujarati, Tamil, etc.
    setIsTranslating(true);
    try {
      const res = await translateExplanationAction({
        formTitle,
        issuingDepartment,
        purpose,
        applicationType,
        explanation: explanations?.en || explanation,
        checklist: checklists?.en || checklist,
        language: lang,
      });

      setTranslationsCache(prev => ({
        ...prev,
        [lang]: {
          title: res.translatedTitle || formTitle,
          department: res.translatedDepartment || issuingDepartment,
          purpose: res.translatedPurpose || purpose,
          applicationType: res.translatedApplicationType || applicationType,
          explanation: res.translatedExplanation || explanation,
          checklist: res.translatedChecklist || checklist,
        },
      }));
    } catch (e) {
      console.warn('On-demand translation failed:', e);
      toast({
        title: 'Language Switch Notice',
        description: `Switched language to ${lang}.`,
      });
    } finally {
      setIsTranslating(false);
    }
  };

  // Content resolution
  const getActiveTitle = () => {
    if (translationsCache[selectedLang]?.title) return translationsCache[selectedLang].title!;
    if (selectedLang === 'Bengali' && formTitleBn) return formTitleBn;
    if (selectedLang === 'Hindi' && formTitleHi) return formTitleHi;
    return formTitle || fileName;
  };

  const getActiveDepartment = () => {
    if (translationsCache[selectedLang]?.department) return translationsCache[selectedLang].department!;
    if (selectedLang === 'Bengali' && issuingDepartmentBn) return issuingDepartmentBn;
    if (selectedLang === 'Hindi' && issuingDepartmentHi) return issuingDepartmentHi;
    return issuingDepartment;
  };

  const getActiveApplicationType = () => {
    if (translationsCache[selectedLang]?.applicationType) return translationsCache[selectedLang].applicationType!;
    if (selectedLang === 'Bengali' && applicationTypeBn) return applicationTypeBn;
    if (selectedLang === 'Hindi' && applicationTypeHi) return applicationTypeHi;
    return applicationType;
  };

  const getActivePurpose = () => {
    if (translationsCache[selectedLang]?.purpose) return translationsCache[selectedLang].purpose!;
    if (selectedLang === 'Bengali' && purposeBn) return purposeBn;
    if (selectedLang === 'Hindi' && purposeHi) return purposeHi;
    return purpose || 'Official application form for citizen services.';
  };

  const getActiveExplanation = () => {
    if (translationsCache[selectedLang]?.explanation) return translationsCache[selectedLang].explanation!;
    if (selectedLang === 'Bengali' && explanations?.bn) return explanations.bn;
    if (selectedLang === 'Hindi' && explanations?.hi) return explanations.hi;
    if (selectedLang === 'English' && explanations?.en) return explanations.en;
    return explanation;
  };

  const getActiveChecklist = () => {
    if (translationsCache[selectedLang]?.checklist?.length) return translationsCache[selectedLang].checklist!;
    if (selectedLang === 'Bengali' && checklists?.bn?.length) return checklists.bn;
    if (selectedLang === 'Hindi' && checklists?.hi?.length) return checklists.hi;
    if (selectedLang === 'English' && checklists?.en?.length) return checklists.en;
    return checklist;
  };

  const getDocName = (doc: RequiredDocument) => {
    if (selectedLang === 'Bengali' && doc.nameBn) return doc.nameBn;
    if (selectedLang === 'Hindi' && doc.nameHi) return doc.nameHi;
    return doc.name;
  };

  const getDocReason = (doc: RequiredDocument) => {
    if (selectedLang === 'Bengali' && doc.reasonBn) return doc.reasonBn;
    if (selectedLang === 'Hindi' && doc.reasonHi) return doc.reasonHi;
    return doc.reason;
  };

  const activeExplanation = getActiveExplanation();
  const activeChecklist = getActiveChecklist();

  // Document categorization
  const mandatoryDocs = requiredDocuments.filter(d => d.requirementType === 'mandatory' || !d.requirementType);
  const conditionalDocs = requiredDocuments.filter(d => d.requirementType === 'conditional');
  const optionalDocs = requiredDocuments.filter(d => d.requirementType === 'optional');

  const totalDocsCount = requiredDocuments.length;
  const preparedDocsCount = Object.values(checkedDocs).filter(Boolean).length;

  const handlePrintChecklist = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const officeGuidance = designatedOfficeGuidance || getFormDesignatedOfficeGuidance(
    getActiveTitle(),
    getActiveDepartment()
  );

  const primaryOfficeName =
    selectedLang === 'Bengali'
      ? (officeGuidance.primaryOfficeNameBn || officeGuidance.primaryOfficeName)
      : selectedLang === 'Hindi'
      ? (officeGuidance.primaryOfficeNameHi || officeGuidance.primaryOfficeName)
      : officeGuidance.primaryOfficeName;

  // Form Analysis bundle to pass to chat
  const completeAnalysisBundle: ExplainGovernmentFormOutput = {
    formTitle: getActiveTitle(),
    issuingDepartment: getActiveDepartment(),
    applicationType: getActiveApplicationType(),
    purpose: getActivePurpose(),
    explanation: activeExplanation,
    checklist: activeChecklist,
    requiredDocuments,
    formFields,
    designatedOfficeGuidance: officeGuidance,
    officialPortal,
    officialHelpline,
    submissionMode,
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-500 print:space-y-0">
      {/* Top Header Row with Upload Another and 6-Language Selector */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center print:hidden">
        <Button variant="outline" size="sm" onClick={onNewUpload} className="h-9">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Upload Another Form
        </Button>

        {/* 6-Language Switcher Pills */}
        <div className="flex items-center gap-1 bg-secondary/80 p-1 rounded-xl border shadow-xs overflow-x-auto max-w-full">
          <Globe className="h-4 w-4 ml-2 mr-1 text-muted-foreground shrink-0" />
          {SUPPORTED_LANGUAGES.map(lang => (
            <Button
              key={lang.value}
              type="button"
              size="sm"
              variant={selectedLang === lang.value ? 'default' : 'ghost'}
              className="text-xs font-medium h-7 px-2.5 rounded-lg whitespace-nowrap"
              onClick={() => handleLangSelect(lang.value)}
              disabled={isTranslating}
            >
              {lang.native}
            </Button>
          ))}
          {isTranslating && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary ml-1 mr-2 shrink-0" />}
        </div>
      </div>

      {/* Main Analysis Card */}
      <Card className="print:shadow-none print:border-none print:bg-transparent overflow-hidden shadow-md border border-slate-200 bg-white rounded-xl">
        {/* Identified Form Header Banner */}
        <CardHeader className="bg-slate-50/70 pb-5 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-background text-primary border-primary/30">
              <FileText className="h-3 w-3 mr-1" />
              {fileName}
            </Badge>
            <Badge className="bg-primary/20 text-primary border-primary/30 font-semibold">
              <Building2 className="h-3 w-3 mr-1" />
              {getActiveDepartment()}
            </Badge>
            <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {getActiveApplicationType()}
            </Badge>
          </div>

          <CardTitle className="font-headline text-2xl sm:text-3xl text-foreground leading-snug">
            {getActiveTitle()}
          </CardTitle>

          <CardDescription className="text-base text-muted-foreground pt-1.5 leading-relaxed">
            <strong className="text-foreground/90">Official Purpose: </strong>
            {getActivePurpose()}
          </CardDescription>

          {/* Quick Govt Portal & Helpline bar */}
          <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-muted-foreground">
            {officialHelpline && (
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <PhoneCall className="h-3.5 w-3.5 text-primary" />
                Helpline: <a href={`tel:${officialHelpline}`} className="text-primary hover:underline">{officialHelpline}</a>
              </span>
            )}
            {officialPortal && (
              <a
                href={officialPortal}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 text-primary" />
                Official Portal ({officialPortal.replace(/https?:\/\//, '').split('/')[0]})
              </a>
            )}
            {submissionMode && (
              <span className="bg-secondary/70 px-2 py-0.5 rounded-md border text-[11px]">
                Submission: {submissionMode}
              </span>
            )}
          </div>
        </CardHeader>

        {/* Dashboard Navigation Tabs - Mobile Friendly Scrollable */}
        <div className="px-4 sm:px-6 pt-3 pb-3 border-b border-slate-200 bg-slate-50/80 print:hidden overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Plain Language Guide</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('documents')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${
                activeTab === 'documents'
                  ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Document Checklist</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === 'documents' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {requiredDocuments.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('fields')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${
                activeTab === 'fields'
                  ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="h-4 w-4" />
              <span>Field-by-Field Breakdown</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === 'fields' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {formFields.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${
                activeTab === 'chat'
                  ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Ask Sahaj AI (Chat)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('offices')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${
                activeTab === 'offices'
                  ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span>Nearby Centers</span>
            </button>
          </div>
        </div>

        <CardContent className="space-y-6 pt-6">
          {/* TAB 1: PLAIN LANGUAGE OVERVIEW & CHECKLIST */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in-50 duration-300">
              {/* Simplified Explanation Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-headline text-xl font-bold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Plain Language Explanation
                  </h3>
                  <VoiceNarrator textToSpeak={activeExplanation} language={selectedLang} />
                </div>

                <div className="rounded-xl bg-card border p-5 shadow-xs">
                  <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-base">
                    {activeExplanation}
                  </p>
                </div>
              </div>

              {/* AUTOMATIC FORM-TO-OFFICE CITIZEN HELP GUIDANCE CARD */}
              <div className="rounded-xl border border-blue-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2.5 bg-blue-700 text-white rounded-lg mt-0.5 shrink-0 shadow-xs">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded-sm">
                          Designated Office & Submission Center / जमा करने का केंद्र
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 mt-1">
                        {primaryOfficeName}
                      </h4>
                      <p className="text-xs text-slate-600">
                        Designated Section / Desk: <span className="font-semibold text-slate-900">{officeGuidance.counterName}</span>
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setActiveTab('offices')}
                    className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold h-9 shrink-0 shadow-xs"
                  >
                    <MapPin className="h-3.5 w-3.5 mr-1.5" />
                    Locate Verified Centers
                  </Button>
                </div>

                {/* Office Instructions & Statutory Fees Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                  <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-700" />
                      What You Will Do at the Office / प्रक्रिया:
                    </span>
                    <ul className="space-y-1 pl-4 list-disc text-slate-600">
                      {officeGuidance.actionsAtOffice.map((action, i) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
                    <div>
                      <strong className="text-slate-900 block mb-0.5">Official Government Fees (Prevent Overcharging):</strong>
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                        {officeGuidance.officialFees}
                      </span>
                    </div>

                    <div>
                      <strong className="text-slate-900 block mb-0.5">Appointment Advice:</strong>
                      <span className="text-slate-600">{officeGuidance.appointmentAdvice}</span>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200">
                      <span>🕒 {officeGuidance.workingHours}</span>
                      {officeGuidance.helpline && (
                        <span>📞 Toll-Free: <a href={`tel:${officeGuidance.helpline}`} className="text-blue-700 font-semibold">{officeGuidance.helpline}</a></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Alternative authorized centers */}
                {officeGuidance.alternativeOffices?.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-semibold text-slate-700">Alternative Authorized Help Desks:</span>
                    {officeGuidance.alternativeOffices.map((alt, i) => (
                      <Badge key={i} variant="outline" className="text-[11px] bg-slate-50 text-slate-800 border-slate-300">
                        {alt}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Actionable Submission Steps Checklist */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-headline text-xl font-bold flex items-center gap-2">
                      <CheckSquare className="h-5 w-5 text-emerald-600" />
                      Step-by-Step Submission Checklist
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Follow these actionable instructions to fill and file your application without mistakes.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handlePrintChecklist} className="hidden sm:flex text-xs">
                    <Printer className="h-3.5 w-3.5 mr-1.5" />
                    Print Guide
                  </Button>
                </div>

                <div className="space-y-3 bg-secondary/20 p-4 rounded-xl border">
                  {activeChecklist.map((item, index) => {
                    const isChecked = checkedSteps[index] || false;
                    return (
                      <div
                        key={index}
                        onClick={() => setCheckedSteps(prev => ({ ...prev, [index]: !isChecked }))}
                        className={`flex items-start gap-3 p-3.5 rounded-lg border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-500/10 border-emerald-500/30 line-through opacity-80'
                            : 'bg-card border-border hover:bg-card/80'
                        }`}
                      >
                        <Checkbox
                          id={`checklist-step-${index}`}
                          checked={isChecked}
                          onCheckedChange={() => setCheckedSteps(prev => ({ ...prev, [index]: !isChecked }))}
                          className="mt-1"
                        />
                        <label
                          htmlFor={`checklist-step-${index}`}
                          className="text-sm leading-relaxed text-foreground cursor-pointer flex-1"
                        >
                          <span className="font-semibold text-primary mr-1.5">Step {index + 1}:</span>
                          {item}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUPPORTING DOCUMENTS (MANDATORY, OPTIONAL, CONDITIONAL) */}
          {activeTab === 'documents' && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-primary/10 to-transparent p-4 rounded-xl border">
                <div>
                  <h3 className="font-headline text-xl font-bold text-foreground flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    Supporting Document Checklist
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Clearly classified according to statutory government filing requirements.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">Prepared</span>
                    <strong className="text-sm font-bold text-foreground font-mono">
                      {preparedDocsCount} of {totalDocsCount} Checked
                    </strong>
                  </div>
                  <Button variant="outline" size="sm" onClick={handlePrintChecklist} className="text-xs">
                    <Printer className="h-3.5 w-3.5 mr-1" />
                    Print List
                  </Button>
                </div>
              </div>

              {/* SECTION: MANDATORY DOCUMENTS */}
              {mandatoryDocs.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-destructive text-destructive-foreground font-bold px-2.5 py-0.5 text-xs">
                      Mandatory Documents ({mandatoryDocs.length})
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium">
                      Compulsory for all applicants without exception
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {mandatoryDocs.map((doc, idx) => {
                      const docId = `mand-${idx}`;
                      const isChecked = checkedDocs[docId] || false;
                      return (
                        <div
                          key={docId}
                          onClick={() => setCheckedDocs(prev => ({ ...prev, [docId]: !isChecked }))}
                          className={`rounded-xl border p-4 shadow-2xs transition-all cursor-pointer flex flex-col justify-between ${
                            isChecked
                              ? 'bg-emerald-500/10 border-emerald-500/40'
                              : 'bg-card border-destructive/20 hover:border-destructive/50'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={() => setCheckedDocs(prev => ({ ...prev, [docId]: !isChecked }))}
                                  id={docId}
                                />
                                <h4 className="font-bold text-sm text-foreground">{getDocName(doc)}</h4>
                              </div>
                              <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">
                                Required
                              </Badge>
                            </div>

                            <p className="text-xs text-muted-foreground leading-normal pl-6">
                              {getDocReason(doc)}
                            </p>

                            {doc.acceptableProofs && doc.acceptableProofs.length > 0 && (
                              <div className="pl-6 pt-1">
                                <span className="text-[10px] font-semibold text-muted-foreground block">
                                  Acceptable Proofs:
                                </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {doc.acceptableProofs.map((p, i) => (
                                    <span key={i} className="text-[10px] bg-secondary/80 px-1.5 py-0.5 rounded border">
                                      {p}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION: CONDITIONAL DOCUMENTS */}
              {conditionalDocs.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-500 text-amber-950 font-bold px-2.5 py-0.5 text-xs">
                      Conditional Documents ({conditionalDocs.length})
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium">
                      Required ONLY under specific circumstances
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {conditionalDocs.map((doc, idx) => {
                      const docId = `cond-${idx}`;
                      const isChecked = checkedDocs[docId] || false;
                      return (
                        <div
                          key={docId}
                          onClick={() => setCheckedDocs(prev => ({ ...prev, [docId]: !isChecked }))}
                          className={`rounded-xl border p-4 shadow-2xs transition-all cursor-pointer flex flex-col justify-between ${
                            isChecked
                              ? 'bg-emerald-500/10 border-emerald-500/40'
                              : 'bg-card border-amber-500/30 hover:border-amber-500'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={() => setCheckedDocs(prev => ({ ...prev, [docId]: !isChecked }))}
                                  id={docId}
                                />
                                <h4 className="font-bold text-sm text-foreground">{getDocName(doc)}</h4>
                              </div>
                              <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-400">
                                Conditional
                              </Badge>
                            </div>

                            {/* Condition Box */}
                            <div className="ml-6 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200">
                              <strong className="block text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300">
                                When is this required?
                              </strong>
                              {doc.condition || 'Required under specific eligibility conditions.'}
                            </div>

                            <p className="text-xs text-muted-foreground leading-normal pl-6">
                              {getDocReason(doc)}
                            </p>

                            {doc.acceptableProofs && doc.acceptableProofs.length > 0 && (
                              <div className="pl-6 pt-1">
                                <span className="text-[10px] font-semibold text-muted-foreground block">
                                  Acceptable Options:
                                </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {doc.acceptableProofs.map((p, i) => (
                                    <span key={i} className="text-[10px] bg-secondary/80 px-1.5 py-0.5 rounded border">
                                      {p}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION: OPTIONAL DOCUMENTS */}
              {optionalDocs.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-bold px-2.5 py-0.5 text-xs">
                      Optional Documents ({optionalDocs.length})
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium">
                      Helpful or alternative, but application proceeds without them
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {optionalDocs.map((doc, idx) => {
                      const docId = `opt-${idx}`;
                      const isChecked = checkedDocs[docId] || false;
                      return (
                        <div
                          key={docId}
                          onClick={() => setCheckedDocs(prev => ({ ...prev, [docId]: !isChecked }))}
                          className={`rounded-xl border p-4 shadow-2xs transition-all cursor-pointer flex flex-col justify-between ${
                            isChecked
                              ? 'bg-emerald-500/10 border-emerald-500/40'
                              : 'bg-card border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={() => setCheckedDocs(prev => ({ ...prev, [docId]: !isChecked }))}
                                  id={docId}
                                />
                                <h4 className="font-bold text-sm text-foreground">{getDocName(doc)}</h4>
                              </div>
                              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                Optional
                              </Badge>
                            </div>

                            <p className="text-xs text-muted-foreground leading-normal pl-6">
                              {getDocReason(doc)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FIELD-BY-FIELD SIMPLE BREAKDOWN */}
          {activeTab === 'fields' && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 rounded-xl border">
                <h3 className="font-headline text-xl font-bold text-foreground flex items-center gap-2">
                  <ListOrdered className="h-5 w-5 text-primary" />
                  Form Field Decoder & Plain Language Guide
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Understand what every bureaucratic phrase actually means in simple everyday words.
                </p>
              </div>

              <div className="space-y-3">
                {formFields.map((field, idx) => (
                  <div
                    key={field.key || idx}
                    className="p-4 rounded-xl border bg-card hover:border-primary/40 transition-colors shadow-2xs space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          #{idx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-foreground">
                          {field.label}
                        </h4>
                        {field.technicalTerm && field.technicalTerm !== field.label && (
                          <span className="text-xs text-muted-foreground italic">
                            (Form Term: &quot;{field.technicalTerm}&quot;)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={field.required ? 'default' : 'outline'}
                          className={`text-[10px] ${
                            field.required ? 'bg-destructive/15 text-destructive border-destructive/30' : ''
                          }`}
                        >
                          {field.required ? 'Mandatory Field' : 'Optional'}
                        </Badge>
                        {field.category && (
                          <Badge variant="secondary" className="text-[10px]">
                            {field.category}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Simple explanation comparison */}
                    <div className="grid sm:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-secondary/40 border space-y-1">
                        <strong className="text-foreground/90 block font-semibold flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-primary" /> Plain Language Meaning:
                        </strong>
                        <p className="text-muted-foreground leading-relaxed">
                          {field.simplifiedExplanation || field.hint}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-secondary/40 border space-y-1">
                        <strong className="text-foreground/90 block font-semibold flex items-center gap-1">
                          <Info className="h-3 w-3 text-primary" /> Where to Find & Format:
                        </strong>
                        <p className="text-muted-foreground leading-relaxed">
                          {field.whereToFind || 'From your supporting documents'} • Expected format: {field.expectedFormat || 'Standard'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ASK SAHAJ AI (CHAT ASSISTANT) */}
          {activeTab === 'chat' && (
            <div className="animate-in fade-in-50 duration-300">
              <FormChatAssistant
                formAnalysis={completeAnalysisBundle}
                language={selectedLang}
              />
            </div>
          )}

          {/* TAB 5: NEARBY GOVERNMENT OFFICE FINDER */}
          {activeTab === 'offices' && (
            <div className="animate-in fade-in-50 duration-300">
              <GovernmentOfficeFinder
                formTitle={completeAnalysisBundle.formTitle}
                issuingDepartment={completeAnalysisBundle.issuingDepartment}
                explanation={completeAnalysisBundle.explanation}
                designatedOfficeGuidance={officeGuidance}
              />
            </div>
          )}
        </CardContent>

        {/* Footer with continue action */}
        <CardFooter className="flex-col sm:flex-row gap-4 justify-between items-center bg-secondary/30 p-6 border-t print:hidden">
          <Button variant="ghost" onClick={onNewUpload}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Upload Another Form
          </Button>

          <Button
            size="lg"
            onClick={onContinue}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md text-base px-8 h-12"
          >
            <Camera className="mr-2 h-5 w-5" />
            Click Photos of Documents & Auto-Fill Form
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
