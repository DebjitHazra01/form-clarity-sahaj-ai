'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getServiceCenterInfoAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  ExternalLink,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Search,
  Loader2,
  Compass,
  AlertCircle,
} from 'lucide-react';
import type { VerifiedOffice } from '@/lib/government-offices';
import type { DesignatedOfficeGuidance } from '@/lib/designated-offices';

interface GovernmentOfficeFinderProps {
  formTitle?: string;
  issuingDepartment?: string;
  explanation?: string;
  defaultPinCode?: string;
  designatedOfficeGuidance?: DesignatedOfficeGuidance;
}

export function GovernmentOfficeFinder({
  formTitle,
  issuingDepartment,
  explanation,
  defaultPinCode = '',
  designatedOfficeGuidance,
}: GovernmentOfficeFinderProps) {
  const [pinCode, setPinCode] = useState(defaultPinCode);
  const [offices, setOffices] = useState<VerifiedOffice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [searchedPin, setSearchedPin] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async (overridePin?: string, coords?: { lat: number; lon: number }) => {
    const targetPin = (overridePin !== undefined ? overridePin : pinCode).trim();
    if (!targetPin && !coords) {
      toast({
        variant: 'destructive',
        title: 'Enter PIN Code',
        description: 'Please enter a 6-digit postal PIN code or click "Use Current Location".',
      });
      return;
    }

    setIsLoading(true);
    setNotice(null);
    try {
      const res = await getServiceCenterInfoAction({
        pinCode: targetPin || undefined,
        latitude: coords?.lat,
        longitude: coords?.lon,
        formTitle,
        issuingDepartment,
        explanation,
      });

      setOffices((res.offices as VerifiedOffice[]) || []);
      setSearchedPin(res.pinCodeUsed || targetPin);
      setHasSearched(true);
      if (res.notes) setNotice(res.notes);
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Search failed',
        description: e.message || 'Could not fetch government offices.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Geolocation unavailable',
        description: 'Location services are not supported by your browser.',
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        handleSearch('', { lat: latitude, lon: longitude });
      },
      err => {
        setIsLocating(false);
        console.warn('Geolocation error:', err.message);
        toast({
          variant: 'destructive',
          title: 'Location permission denied',
          description: 'Please enter your 6-digit PIN code manually.',
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <Card className="w-full shadow-md border border-slate-200 bg-white rounded-xl overflow-hidden">
      <CardHeader className="bg-slate-50 border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <Badge variant="outline" className="text-primary bg-primary/10 border-primary/30 font-medium">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Verified Official Centers Only
          </Badge>
          <span className="text-xs text-muted-foreground">
            Sourced from India Post & Central Statutory Registries
          </span>
        </div>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          Nearby Government Office Finder
        </CardTitle>
        <CardDescription className="text-sm">
          Locate verified Aadhaar Seva Kendras, Post Offices, Passport Seva Kendras, and Civic Counters near your location.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Automatic Form-to-Office Detection Guidance Banner */}
        {designatedOfficeGuidance && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-4 space-y-3 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-2 bg-blue-700 text-white rounded-lg mt-0.5 shrink-0 shadow-xs">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-sm">
                      Form Detected: {formTitle || 'Uploaded Document'}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-1">
                    Designated Submission Office: {designatedOfficeGuidance.primaryOfficeName}
                  </h4>
                  <p className="text-xs text-slate-700 mt-0.5">
                    Target Counter: <span className="font-semibold text-slate-900">{designatedOfficeGuidance.counterName}</span> • Standard Hours: {designatedOfficeGuidance.workingHours}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-blue-200 text-xs text-slate-700">
              <div>
                <strong className="text-slate-900">Official Fees: </strong>
                <span>{designatedOfficeGuidance.officialFees}</span>
              </div>
              <div>
                <strong className="text-slate-900">Appointment Guidance: </strong>
                <span>{designatedOfficeGuidance.appointmentAdvice}</span>
              </div>
            </div>

            {designatedOfficeGuidance.alternativeOffices?.length > 0 && (
              <div className="text-xs text-slate-600 pt-1">
                <span className="font-semibold text-slate-800">Alternative Authorized Help Centers: </span>
                {designatedOfficeGuidance.alternativeOffices.join(' • ')}
              </div>
            )}
          </div>
        )}

        {/* Search Controls */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              maxLength={6}
              value={pinCode}
              onChange={e => setPinCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit Indian PIN Code (e.g. 700001, 110001)"
              className="pl-10 h-11 text-base bg-background"
              onKeyDown={e => {
                if (e.key === 'Enter') handleSearch();
              }}
            />
          </div>

          <Button
            type="button"
            onClick={() => handleSearch()}
            disabled={isLoading || isLocating}
            className="h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Find Offices
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleUseLocation}
            disabled={isLoading || isLocating}
            className="h-11 px-4 border-dashed hover:border-primary"
            title="Detect location automatically"
          >
            {isLocating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Detecting...
              </>
            ) : (
              <>
                <Compass className="mr-2 h-4 w-4 text-primary" />
                Use My Location
              </>
            )}
          </Button>
        </div>

        {/* Notice/Alert if any */}
        {notice && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{notice}</p>
          </div>
        )}

        {/* Office Cards List */}
        {offices.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>
                Found <strong className="text-foreground">{offices.length} verified centers</strong> for{' '}
                {searchedPin ? `PIN Code ${searchedPin}` : 'your location'}
              </span>
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Zero Placeholder Data
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {offices.map(office => (
                <div
                  key={office.id}
                  className="rounded-xl border border-border bg-card p-5 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-base text-foreground leading-snug">
                          {office.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{office.department}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <Badge variant="secondary" className="text-[11px] font-medium">
                          {office.officeType}
                        </Badge>
                        {designatedOfficeGuidance &&
                          (office.name.toLowerCase().includes('aadhaar') ||
                           office.name.toLowerCase().includes('post') ||
                           office.officeType.toLowerCase().includes('aadhaar') ||
                           office.officeType.toLowerCase().includes('post') ||
                           office.officeType.toLowerCase().includes('passport') ||
                           office.officeType.toLowerCase().includes('rto')) && (
                          <Badge className="bg-emerald-700 text-white text-[9.5px] px-1.5 py-0 font-semibold shadow-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                            Recommended
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-relaxed text-foreground/90">{office.address}</span>
                      </div>

                      {office.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                          <a
                            href={`tel:${office.phone.replace(/[^0-9]/g, '')}`}
                            className="text-primary hover:underline font-medium"
                          >
                            {office.phone}
                          </a>
                        </div>
                      )}

                      {office.operatingHours && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{office.operatingHours}</span>
                        </div>
                      )}

                      {office.distanceKm !== undefined && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary font-semibold text-[11px]">
                          <Navigation className="h-3 w-3" />
                          {office.distanceKm} km away from your location
                        </div>
                      )}
                    </div>

                    {/* Services Pill List */}
                    {office.services && office.services.length > 0 && (
                      <div className="pt-2 border-t space-y-1.5">
                        <span className="text-[11px] font-semibold text-foreground/80 block">
                          Available Services:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {office.services.map((svc, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-secondary/80 text-foreground/80 px-2 py-0.5 rounded-md border"
                            >
                              {svc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t flex items-center justify-between gap-2">
                    <a
                      href={office.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center flex-1 h-9 px-3 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
                    >
                      <Navigation className="h-3.5 w-3.5 mr-1.5" />
                      Google Maps Directions
                    </a>

                    {office.officialSourceUrl && (
                      <a
                        href={office.officialSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center h-9 px-3 text-xs font-medium rounded-lg border hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                        title="Verify on government portal"
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        Official Portal
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State after search */}
        {hasSearched && offices.length === 0 && (
          <div className="text-center py-8 space-y-3 bg-secondary/20 rounded-xl border border-dashed p-6">
            <Building2 className="h-10 w-10 text-muted-foreground mx-auto" />
            <h4 className="font-semibold text-base">No direct local office in database for PIN {searchedPin}</h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              In accordance with our strict data integrity policy, Sahaj AI never invents office names or addresses.
              Please visit the official government locators below:
            </p>
          </div>
        )}

        {/* Official Government Direct Locators */}
        <div className="pt-4 border-t space-y-2.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Official Government Locator Portals
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <a
              href="https://bhuvan-app3.nrsc.gov.in/aadhaar/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-lg border bg-card hover:border-primary transition-colors flex items-center justify-between"
            >
              <span>UIDAI Bhuvan Aadhaar</span>
              <ExternalLink className="h-3 w-3 text-primary" />
            </a>
            <a
              href="https://www.passportindia.gov.in/AppOnlineProject/online/locatePSK"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-lg border bg-card hover:border-primary transition-colors flex items-center justify-between"
            >
              <span>Passport Seva (PSK)</span>
              <ExternalLink className="h-3 w-3 text-primary" />
            </a>
            <a
              href="https://locator.csccloud.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-lg border bg-card hover:border-primary transition-colors flex items-center justify-between"
            >
              <span>CSC Digital India</span>
              <ExternalLink className="h-3 w-3 text-primary" />
            </a>
            <a
              href="https://www.indiapost.gov.in/VAS/Pages/FindPincode.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-lg border bg-card hover:border-primary transition-colors flex items-center justify-between"
            >
              <span>India Post Directory</span>
              <ExternalLink className="h-3 w-3 text-primary" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
