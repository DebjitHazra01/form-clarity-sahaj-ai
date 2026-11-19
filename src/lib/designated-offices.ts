/**
 * @fileOverview Form-to-Office Mapping & Citizen Submission Guidance.
 * Pure TypeScript utility safe for both Client Components and Server Actions.
 */

export interface DesignatedOfficeGuidance {
  primaryOfficeName: string;
  primaryOfficeNameHi?: string;
  primaryOfficeNameBn?: string;
  counterName: string;
  alternativeOffices: string[];
  actionsAtOffice: string[];
  officialFees: string;
  appointmentAdvice: string;
  workingHours?: string;
  helpline?: string;
}

export function getFormDesignatedOfficeGuidance(
  title: string,
  department: string,
  existing?: Partial<DesignatedOfficeGuidance>
): DesignatedOfficeGuidance {
  const t = (title || '').toLowerCase();
  const d = (department || '').toLowerCase();

  // 1. Aadhaar Enrolment / Update
  if (t.includes('aadhaar') || t.includes('aadhar') || t.includes('uidai') || t.includes('form 1') || d.includes('uidai')) {
    return {
      primaryOfficeName: existing?.primaryOfficeName || 'UIDAI Aadhaar Seva Kendra (ASK) or Designated India Post Office',
      primaryOfficeNameHi: existing?.primaryOfficeNameHi || 'यूआईडीएआई आधार सेवा केंद्र (ASK) या मुख्य डाकघर (Aadhaar Desk)',
      primaryOfficeNameBn: existing?.primaryOfficeNameBn || 'ইউআইডিএআই আধার সেবা কেন্দ্র (ASK) বা প্রধান ডাকঘর (আধার কাউন্টার)',
      counterName: existing?.counterName || 'Aadhaar Enrolment & Demographic / Biometric Update Counter',
      alternativeOffices: existing?.alternativeOffices?.length ? existing.alternativeOffices : [
        'Authorized Public Sector Bank Branches (SBI, PNB, Canara Bank)',
        'Designated India Post Head Post Offices (HPO) & Sub-Post Offices',
        'Common Service Centers (CSC) Digital Seva Kendras',
      ],
      actionsAtOffice: existing?.actionsAtOffice?.length ? existing.actionsAtOffice : [
        'Submit filled physical Form 1 with self-attested original Proof of Identity & Address.',
        'Complete live biometric scan (photo, 10 fingerprints, and dual iris scan).',
        'Pay official statutory fee (if updating demographic details or non-mandatory biometrics).',
        'Collect printed acknowledgment slip containing your 14-digit Enrolment ID (EID) and timestamp for tracking.',
      ],
      officialFees: existing?.officialFees || 'New Enrolment: FREE | Mandatory Biometric Update (Ages 5 & 15): FREE | Demographic Update: ₹50 | Biometric Update: ₹100',
      appointmentAdvice: existing?.appointmentAdvice || 'Walk-in is accepted at Post Offices and Banks with tokens. You can also book a time slot online at myaadhaar.uidai.gov.in to skip the queue.',
      workingHours: existing?.workingHours || 'Monday to Saturday: 9:30 AM - 5:30 PM (Closed on Sundays & Gazetted Holidays)',
      helpline: existing?.helpline || '1947',
    };
  }

  // 2. Passport Application / Renewal
  if (t.includes('passport') || d.includes('external affairs') || d.includes('mea')) {
    return {
      primaryOfficeName: existing?.primaryOfficeName || 'Passport Seva Kendra (PSK) / Post Office Passport Seva Kendra (POPSK)',
      primaryOfficeNameHi: existing?.primaryOfficeNameHi || 'पासपोर्ट सेवा केंद्र (PSK) / डाकघर पासपोर्ट सेवा केंद्र (POPSK)',
      primaryOfficeNameBn: existing?.primaryOfficeNameBn || 'পাসপোর্ট সেবা কেন্দ্র (PSK) বা পোস্ট অফিস পাসপোর্ট সেবা কেন্দ্র',
      counterName: existing?.counterName || 'Counter A (Biometrics & Photo), Counter B (Document Verification), Counter C (Granting)',
      alternativeOffices: existing?.alternativeOffices?.length ? existing.alternativeOffices : [
        'Post Office Passport Seva Kendra (POPSK)',
        'Regional Passport Office (RPO) for complex grievances',
      ],
      actionsAtOffice: existing?.actionsAtOffice?.length ? existing.actionsAtOffice : [
        'Present printed Application Reference Number (ARN) receipt and all original documents.',
        'Counter A: Live digital photograph and 10-finger biometric capture.',
        'Counter B: Detailed physical document inspection by verifying officers.',
        'Counter C: Final approval interview and receipt of police verification status slip.',
      ],
      officialFees: existing?.officialFees || 'Standard Fresh/Renewal (36 Pages): ₹1,500 | Jumbo (60 Pages): ₹2,000 | Tatkaal Scheme: ₹3,500',
      appointmentAdvice: existing?.appointmentAdvice || 'Prior online appointment booking at passportindia.gov.in is STRICTLY MANDATORY. Walk-in is not permitted.',
      workingHours: existing?.workingHours || 'Monday to Friday: 9:00 AM - 4:30 PM (Token counter closes at 3:30 PM)',
      helpline: existing?.helpline || '1800-258-1800',
    };
  }

  // 3. PAN Card (Form 49A / 49AA)
  if (t.includes('pan') || t.includes('49a') || d.includes('income tax') || d.includes('direct taxes')) {
    return {
      primaryOfficeName: existing?.primaryOfficeName || 'Protean (NSDL) TIN-Facilitation Center or UTIITSL PAN Service Center',
      primaryOfficeNameHi: existing?.primaryOfficeNameHi || 'प्रोटीन (NSDL) टिन-सुविधा केंद्र या UTIITSL पैन सेवा केंद्र',
      primaryOfficeNameBn: existing?.primaryOfficeNameBn || 'প্রোটিন (NSDL) টিন-সুবিধা কেন্দ্র বা UTIITSL প্যান সেবা কেন্দ্র',
      counterName: existing?.counterName || 'PAN Card Application Receipt & Document Scrutiny Counter',
      alternativeOffices: existing?.alternativeOffices?.length ? existing.alternativeOffices : [
        'Aaykar Seva Kendra (ASK) at the local Income Tax Office',
        'Authorized CSC Digital Seva Kendras',
      ],
      actionsAtOffice: existing?.actionsAtOffice?.length ? existing.actionsAtOffice : [
        'Submit signed physical Form 49A with 2 recent passport photographs affixed across the signature box.',
        'Attach self-attested photocopies of Proof of Identity, Address, and Date of Birth.',
        'Pay statutory government fee and obtain the 15-digit Acknowledgment Receipt.',
      ],
      officialFees: existing?.officialFees || 'Physical Card Delivery in India: ₹107 (incl. GST) | e-PAN digital copy only: ₹72',
      appointmentAdvice: existing?.appointmentAdvice || 'No prior appointment needed. Walk-ins are serviced on a daily token basis.',
      workingHours: existing?.workingHours || 'Monday to Saturday: 10:00 AM - 5:30 PM',
      helpline: existing?.helpline || '020-27218080 / 1800-180-1961',
    };
  }

  // 4. Driving License / RTO / Parivahan
  if (t.includes('driving') || t.includes('license') || t.includes('vehicle') || t.includes('rto') || d.includes('transport') || d.includes('parivahan')) {
    return {
      primaryOfficeName: existing?.primaryOfficeName || 'Regional Transport Office (RTO) / Automated Driving Test Track',
      primaryOfficeNameHi: existing?.primaryOfficeNameHi || 'क्षेत्रीय परिवहन कार्यालय (RTO) / मोटर वाहन विभाग',
      primaryOfficeNameBn: existing?.primaryOfficeNameBn || 'আঞ্চলিক পরিবহন কার্যালয় (RTO) / মোটর ভেহিকেলস দপ্তর',
      counterName: existing?.counterName || 'License Scrutiny Counter & Biometric Photo Booth',
      alternativeOffices: existing?.alternativeOffices?.length ? existing.alternativeOffices : [
        'Automated Driving Test Track (ADTT)',
        'District Transport Office (DTO)',
      ],
      actionsAtOffice: existing?.actionsAtOffice?.length ? existing.actionsAtOffice : [
        'Present printed Parivahan Application Form and Medical Fitness Certificate (Form 1A).',
        'Capture digital signature, photo, and thumbprint at the biometric counter.',
        'Undergo the driving skill examination on the test track.',
        'Collect test qualification slip for smart card driving license dispatch by post.',
      ],
      officialFees: existing?.officialFees || 'Learner License: ₹200 | Driving License Issue & Test: ₹700 | Renewal: ₹200',
      appointmentAdvice: existing?.appointmentAdvice || 'Prior online slot booking via parivahan.gov.in / Sarathi is mandatory for practical driving tests.',
      workingHours: existing?.workingHours || 'Monday to Friday: 10:00 AM - 5:00 PM',
      helpline: existing?.helpline || '0120-2459169',
    };
  }

  // 5. Voter ID (Form 6 / 8)
  if (t.includes('voter') || t.includes('form 6') || t.includes('form 8') || d.includes('election')) {
    return {
      primaryOfficeName: existing?.primaryOfficeName || 'Electoral Registration Office (ERO) / Sub-Divisional Office (SDO)',
      primaryOfficeNameHi: existing?.primaryOfficeNameHi || 'निर्वाचक रजिस्ट्रीकरण अधिकारी (ERO) कार्यालय / एसडीएम कार्यालय',
      primaryOfficeNameBn: existing?.primaryOfficeNameBn || 'নির্বাচন রেজিস্ট্রেশন অফিসার (ERO) কার্যালয় বা মহকুমা শাসকের দপ্তর',
      counterName: existing?.counterName || 'Voter Registration & Electoral Assistance Counter',
      alternativeOffices: existing?.alternativeOffices?.length ? existing.alternativeOffices : [
        'Designated Polling Station Booth Level Officer (BLO)',
        'Common Service Centers (CSC) / Voter Facilitation Centers',
      ],
      actionsAtOffice: existing?.actionsAtOffice?.length ? existing.actionsAtOffice : [
        'Submit Form with passport photo and self-attested age & address proof to your local BLO or ERO.',
        'Field verification visit by Booth Level Officer at your residential address.',
        'Obtain Form 6 receipt for tracking EPIC status online.',
      ],
      officialFees: existing?.officialFees || 'Free of Charge (Zero Fee for Voter Registration & EPIC Card Issue)',
      appointmentAdvice: existing?.appointmentAdvice || 'Walk-in during office hours or submit directly to your designated Booth Level Officer (BLO).',
      workingHours: existing?.workingHours || 'Monday to Friday: 10:00 AM - 5:00 PM',
      helpline: existing?.helpline || '1950',
    };
  }

  // 6. Generic / State Civic Center fallback
  return {
    primaryOfficeName: existing?.primaryOfficeName || 'Designated Civic Service Center / BDO Office / Municipal Corporation',
    primaryOfficeNameHi: existing?.primaryOfficeNameHi || 'नागरिक सेवा केंद्र / प्रखंड विकास कार्यालय (BDO) / नगर पालिका',
    primaryOfficeNameBn: existing?.primaryOfficeNameBn || 'নাগরিক সেবা কেন্দ্র / ব্লক ডেভেলপমেন্ট অফিস (BDO) / পৌরসভা',
    counterName: existing?.counterName || 'Citizen Assistance & Certificate Submission Counter',
    alternativeOffices: existing?.alternativeOffices?.length ? existing.alternativeOffices : [
      'Common Service Center (CSC) / Digital Seva Kendra',
      'Sub-Divisional Office (SDO) / Tehsildar Office',
      'State Citizen Service Camps (e.g. Duare Sarkar)',
    ],
    actionsAtOffice: existing?.actionsAtOffice?.length ? existing.actionsAtOffice : [
      'Submit the physical application along with self-attested supporting photocopies.',
      'Show original identity and address documents for on-the-spot verification.',
      'Pay standard administrative challan fee (if applicable) and collect official stamped receipt.',
    ],
    officialFees: existing?.officialFees || 'Nominal statutory charge as per Citizens\' Charter (₹10 - ₹50 or Free)',
    appointmentAdvice: existing?.appointmentAdvice || 'Walk-in during public hours (generally 10:30 AM to 2:30 PM on government working days).',
    workingHours: existing?.workingHours || 'Monday to Friday: 10:00 AM - 5:00 PM',
    helpline: existing?.helpline || '1800-11-4000',
  };
}
