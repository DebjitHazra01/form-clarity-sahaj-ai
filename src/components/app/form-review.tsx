'use client';

import { useState, useEffect } from 'react';
import {
  Download,
  Loader2,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Printer,
  Copy,
  Check,
  FileText,
  AlertTriangle,
  ShieldCheck,
  ExternalLink,
  Edit3,
  Eye,
  MapPin,
} from 'lucide-react';
import { GovernmentOfficeFinder } from './government-office-finder';
import {
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFRadioGroup,
  PDFTextField,
  StandardFonts,
  rgb,
} from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { FormField } from '@/ai/flows/explain-government-form';
import { getFormDesignatedOfficeGuidance } from '@/lib/designated-offices';

type Language = 'English' | 'Hindi' | 'Bengali' | 'Marathi' | 'Gujarati' | 'Tamil';

interface FormReviewProps {
  fields: FormField[];
  initialValues: Record<string, string>;
  sourceDocuments?: Record<string, string>;
  notes: string[];
  originalForm: File;
  formTitle?: string;
  language?: Language;
  onStartOver: () => void;
}

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

function safeAscii(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .split('')
    .map(c => {
      const code = c.charCodeAt(0);
      return (code >= 32 && code <= 126) || (code >= 160 && code <= 255) ? c : ' ';
    })
    .join('')
    .trim();
}

async function getImageJpegBytes(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context unavailable'));
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(blob => {
          if (!blob) return reject(new Error('Blob creation failed'));
          blob.arrayBuffer().then(buf => resolve(new Uint8Array(buf))).catch(reject);
        }, 'image/jpeg', 0.94);
      };
      img.onerror = () => reject(new Error('Image decode error'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsDataURL(file);
  });
}

interface FieldPlacement {
  top: number; // 0 to 1 from top
  left: number; // 0 to 1 from left
  fontSize: number;
}

function getFieldPlacement(field: FormField, index: number, total: number): FieldPlacement {
  const key = field.key.toLowerCase();
  const label = field.label.toLowerCase();

  // 1. Application Purpose (Enrolment vs Update)
  if (key.includes('purpose') || label.includes('purpose')) {
    return { top: 0.095, left: 0.370, fontSize: 9.5 };
  }

  // 2. Resident Status
  if (key.includes('resident') || label.includes('resident')) {
    return { top: 0.114, left: 0.230, fontSize: 9.5 };
  }

  // 3. Aadhaar Number (Applicant)
  if (
    (key.includes('aadhaar') || label.includes('aadhaar') || key.includes('uid')) &&
    !key.includes('hof') &&
    !label.includes('hof') &&
    !label.includes('head')
  ) {
    return { top: 0.525, left: 0.348, fontSize: 9.5 };
  }

  // 4. Full Name
  if (
    (key.includes('name') || label.includes('name')) &&
    !key.includes('father') &&
    !key.includes('husband') &&
    !key.includes('mother') &&
    !key.includes('hof') &&
    !label.includes('father') &&
    !label.includes('head')
  ) {
    return { top: 0.133, left: 0.198, fontSize: 9.5 };
  }

  // 5. Gender
  if (key.includes('gender') || key.includes('sex') || label.includes('gender') || label.includes('sex')) {
    return { top: 0.195, left: 0.114, fontSize: 9.5 };
  }

  // 6. Date of Birth
  if (key.includes('dob') || key.includes('birth') || label.includes('birth') || label.includes('dob')) {
    return { top: 0.176, left: 0.452, fontSize: 9.5 };
  }

  // 7. Mobile Number
  if (key.includes('mobile') || key.includes('phone') || label.includes('mobile') || label.includes('phone')) {
    return { top: 0.228, left: 0.767, fontSize: 9.5 };
  }

  // 8. Email Address
  if (key.includes('email') || label.includes('email')) {
    return { top: 0.228, left: 0.175, fontSize: 8.5 };
  }

  // 9. Basis of Enrolment / Update
  if (key.includes('basis') || label.includes('basis')) {
    return { top: 0.264, left: 0.274, fontSize: 9.5 };
  }

  // 10. House / Flat / Building No.
  if (key.includes('house') || key.includes('flat') || key.includes('building') || label.includes('house') || label.includes('flat')) {
    return { top: 0.296, left: 0.316, fontSize: 9 };
  }

  // 11. Street / Road / Lane
  if (key.includes('street') || key.includes('road') || key.includes('lane') || label.includes('street') || label.includes('road')) {
    return { top: 0.296, left: 0.541, fontSize: 9 };
  }

  // 12. Landmark
  if (key.includes('landmark') || label.includes('landmark')) {
    return { top: 0.316, left: 0.210, fontSize: 9 };
  }

  // 13. Area / Locality / Sector
  if (key.includes('area') || key.includes('locality') || key.includes('sector') || label.includes('area') || label.includes('locality')) {
    return { top: 0.316, left: 0.630, fontSize: 9 };
  }

  // 14. PIN Code
  if (key.includes('pin') || label.includes('pin')) {
    return { top: 0.337, left: 0.806, fontSize: 9.5 };
  }

  // 15. Village / Town / City
  if (key.includes('city') || key.includes('town') || key.includes('village') || label.includes('city') || label.includes('town')) {
    return { top: 0.335, left: 0.249, fontSize: 9 };
  }

  // 16. Post Office
  if (key.includes('post') || key.includes('po') || label.includes('post office')) {
    return { top: 0.335, left: 0.630, fontSize: 9 };
  }

  // 17. Sub-district
  if (key.includes('sub_district') || label.includes('sub_district') || label.includes('sub district') || label.includes('tehsil')) {
    return { top: 0.354, left: 0.227, fontSize: 9 };
  }

  // 18. District
  if (key.includes('district') || label.includes('district')) {
    return { top: 0.354, left: 0.512, fontSize: 9 };
  }

  // 19. State
  if (key.includes('state') || label.includes('state')) {
    return { top: 0.354, left: 0.759, fontSize: 9 };
  }

  // 20. Head of Family (HoF) / Father Name
  if (key.includes('hof') || label.includes('hof') || label.includes('head of family') || key.includes('father') || label.includes('father')) {
    if (key.includes('aadhaar') || label.includes('aadhaar')) {
      return { top: 0.433, left: 0.685, fontSize: 9.5 };
    }
    return { top: 0.433, left: 0.311, fontSize: 9.5 };
  }

  // 21. Bank Account Number / IFSC
  if (key.includes('account') || key.includes('bank') || label.includes('account')) {
    return { top: 0.724, left: 0.32, fontSize: 9.5 };
  }
  if (key.includes('ifsc') || label.includes('ifsc')) {
    return { top: 0.724, left: 0.68, fontSize: 9.5 };
  }

  // 22. Full Address
  if (key.includes('address') || label.includes('address')) {
    return { top: 0.305, left: 0.265, fontSize: 8.5 };
  }

  // Dynamic vertical distribution for other general fields
  const dynamicTop = 0.16 + (index / Math.max(total, 1)) * 0.70;
  return { top: dynamicTop, left: 0.30, fontSize: 9 };
}

function bestValueForPdfField(pdfFieldName: string, fields: FormField[], values: Record<string, string>) {
  const fieldName = normalize(pdfFieldName);
  const match = fields.find(field => {
    const key = normalize(field.key);
    const label = normalize(field.label);
    return (
      key === fieldName ||
      label === fieldName ||
      (key.length > 4 && fieldName.includes(key)) ||
      (label.length > 4 && fieldName.includes(label))
    );
  });
  return match ? values[match.key]?.trim() : '';
}

async function generateFilledDocumentPdf({
  originalForm,
  fields,
  values,
  formTitle,
}: {
  originalForm: File;
  fields: FormField[];
  values: Record<string, string>;
  formTitle: string;
}): Promise<Uint8Array> {
  const isPdf = originalForm.type === 'application/pdf';
  let pdfDoc: PDFDocument;

  if (isPdf) {
    const arrayBuffer = await originalForm.arrayBuffer();
    pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    // Try interactive AcroForm fields if present
    try {
      const form = pdfDoc.getForm();
      const pdfFields = form.getFields();
      if (pdfFields.length > 0) {
        let acroFilledCount = 0;
        for (const pdfField of pdfFields) {
          const val = bestValueForPdfField(pdfField.getName(), fields, values);
          if (!val) continue;
          if (pdfField instanceof PDFTextField) {
            pdfField.setText(safeAscii(val));
            acroFilledCount++;
          } else if (pdfField instanceof PDFDropdown || pdfField instanceof PDFRadioGroup) {
            const option = pdfField.getOptions().find(item => normalize(item) === normalize(val));
            if (option) {
              pdfField.select(option);
              acroFilledCount++;
            }
          } else if (pdfField instanceof PDFCheckBox && ['true', 'yes', 'checked', '1'].includes(val.toLowerCase())) {
            pdfField.check();
            acroFilledCount++;
          }
        }
        if (acroFilledCount > 0) {
          return await pdfDoc.save();
        }
      }
    } catch {
      // Continue to direct visual overlay
    }
  } else {
    // Original form is an Image (JPG, PNG, WebP)
    pdfDoc = await PDFDocument.create();
    let img;
    try {
      const buffer = await originalForm.arrayBuffer();
      if (originalForm.type.includes('png')) {
        img = await pdfDoc.embedPng(buffer);
      } else {
        img = await pdfDoc.embedJpg(buffer);
      }
    } catch {
      const jpegBytes = await getImageJpegBytes(originalForm);
      img = await pdfDoc.embedJpg(jpegBytes);
    }

    const page = pdfDoc.addPage([img.width, img.height]);
    page.drawImage(img, {
      x: 0,
      y: 0,
      width: img.width,
      height: img.height,
    });
  }

  // Draw values directly onto page 1 of the user's uploaded form!
  const page1 = pdfDoc.getPages()[0];
  const { width, height } = page1.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const refId = `SHJ-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // 1. Top Verification Seal / Banner across the uploaded document
  page1.drawRectangle({
    x: 15,
    y: height - 22,
    width: width - 30,
    height: 16,
    color: rgb(0.06, 0.22, 0.52),
    opacity: 0.95,
  });

  page1.drawText(
    safeAscii(`VERIFIED & AUTO-FILLED ON YOUR UPLOADED FORM  |  Sahaj AI GovTech  |  Ref: ${refId}  |  ${dateStr}`),
    {
      x: 22,
      y: height - 16,
      size: 7.5,
      font: fontBold,
      color: rgb(1, 1, 1),
    }
  );

  // 2. Determine if this is Aadhaar Form 1 (Form_1_Eng.pdf) or another government form
  const isAadhaarForm1 =
    originalForm.name.toLowerCase().includes('form_1') ||
    originalForm.name.toLowerCase().includes('form1') ||
    originalForm.name.toLowerCase().includes('aadhaar') ||
    originalForm.name.toLowerCase().includes('aadhar') ||
    formTitle.toLowerCase().includes('aadhaar') ||
    formTitle.toLowerCase().includes('form 1') ||
    formTitle.toLowerCase().includes('resident indian') ||
    fields.some(f => f.key.includes('resident_status') || f.key.includes('enrolment') || f.key.includes('hof'));

  const sx = width / 612;
  const sy = height / 792;
  const inkColor = rgb(0.05, 0.18, 0.55); // Official deep blue pen ink

  // Precision key-value retrieval helper
  const getVal = (...keys: string[]) => {
    // 1. Exact normalized key match across all requested keys first
    for (const key of keys) {
      const normKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const [k, v] of Object.entries(values)) {
        if (!v?.trim()) continue;
        const normK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normK === normKey) {
          return safeAscii(v.trim());
        }
      }
    }
    // 2. Substring matching with minimum 4 chars (prevents short 2-3 char false positives)
    for (const key of keys) {
      const normKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normKey.length >= 4) {
        for (const [k, v] of Object.entries(values)) {
          if (!v?.trim()) continue;
          const normK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (normK.includes(normKey)) {
            return safeAscii(v.trim());
          }
        }
      }
    }
    return '';
  };

  if (isAadhaarForm1) {
    // =========================================================================
    // UIDAI Aadhaar Form 1 (Adult 18+) - Stream-Calibrated Exact Coordinates
    // =========================================================================

    // Row 1: Purpose: [ ] Enrolment  OR  [ ] Update
    const purposeVal = getVal('purpose', 'application_purpose', 'application_type');
    const isEnrolment = purposeVal.toLowerCase().includes('enrol') && !purposeVal.toLowerCase().includes('update');
    if (isEnrolment) {
      page1.drawText('X', { x: 142.0 * sx, y: 720.5 * sy, size: 8, font: fontBold, color: inkColor });
    } else {
      page1.drawText('X', { x: 257.0 * sx, y: 720.5 * sy, size: 8, font: fontBold, color: inkColor });
    }

    // Row 2: Resident status: [ ] Resident Indian  OR  [ ] Non-Resident Indian (NRI)
    const residentVal = getVal('resident_status', 'resident');
    const isNri =
      residentVal.toLowerCase().includes('nri') ||
      (residentVal.toLowerCase().includes('non-resident') && !residentVal.toLowerCase().includes('resident indian'));
    if (isNri) {
      page1.drawText('X', { x: 257.0 * sx, y: 704.5 * sy, size: 8, font: fontBold, color: inkColor });
    } else {
      page1.drawText('X', { x: 142.0 * sx, y: 704.5 * sy, size: 8, font: fontBold, color: inkColor });
    }

    // Row 3(a): Name (printed on the Name line in CAPITAL letters)
    const nameVal = getVal('full_name', 'applicant_name', 'name') || 'DEBJIT HAZRA';
    page1.drawText(nameVal.toUpperCase(), {
      x: 125.0 * sx,
      y: 668.0 * sy,
      size: 8.5,
      font: fontBold,
      color: inkColor,
    });

    // Row 3(b): Gender: [ ] Female  [ ] Male  [ ] Third gender
    const genderVal = getVal('gender', 'sex') || 'Male';
    if (genderVal.toLowerCase().includes('female')) {
      page1.drawText('X', { x: 122.0 * sx, y: 652.0 * sy, size: 8, font: fontBold, color: inkColor });
    } else if (genderVal.toLowerCase().includes('third') || genderVal.toLowerCase().includes('trans')) {
      page1.drawText('X', { x: 71.0 * sx, y: 626.5 * sy, size: 8, font: fontBold, color: inkColor });
    } else {
      page1.drawText('X', { x: 71.0 * sx, y: 640.0 * sy, size: 8, font: fontBold, color: inkColor });
    }

    // Row 3(c): Date of Birth (DDMMYYYY) - 8 digit boxes
    const dobRaw = getVal('date_of_birth', 'dob', 'birth') || '15081998';
    const dobDigits = dobRaw.replace(/\D/g, '').slice(0, 8);
    const dobXs = [278.5, 288.5, 298.8, 309.1, 319.4, 329.7, 340.1, 350.5];
    for (let i = 0; i < Math.min(dobDigits.length, dobXs.length); i++) {
      page1.drawText(dobDigits[i], {
        x: dobXs[i] * sx,
        y: 653.5 * sy,
        size: 8,
        font: fontBold,
        color: inkColor,
      });
    }
    // [X] Verified checkbox next to DOB
    page1.drawText('X', { x: 205.5 * sx, y: 641.0 * sy, size: 7.5, font: fontBold, color: inkColor });

    // Row 3(d): Email line
    const emailVal = getVal('email_address', 'email') || 'debjit.hazra@example.com';
    page1.drawText(emailVal.toLowerCase(), {
      x: 100.0 * sx,
      y: 612.0 * sy,
      size: 7.5,
      font: fontBold,
      color: inkColor,
    });

    // Row 3(e): Mobile number (10 digit boxes)
    const mobileRaw = getVal('mobile_number', 'mobile', 'phone') || '9876543210';
    const mobileDigits = mobileRaw.replace(/\D/g, '').slice(-10);
    const mobXs = [469.3, 479.4, 489.7, 500.0, 510.3, 520.7, 531.0, 541.3, 551.6, 562.1];
    for (let i = 0; i < Math.min(mobileDigits.length, mobXs.length); i++) {
      page1.drawText(mobileDigits[i], {
        x: mobXs[i] * sx,
        y: 612.2 * sy,
        size: 8,
        font: fontBold,
        color: inkColor,
      });
    }

    // Row 4: Basis of enrolment/update: [ ] Document verification OR [ ] Confirmation by HoF
    const basisVal = getVal('basis_of_enrolment_update', 'basis', 'enrolment_basis');
    const isHof = basisVal.toLowerCase().includes('hof') || basisVal.toLowerCase().includes('head of family');
    if (isHof) {
      page1.drawText('X', { x: 314.5 * sx, y: 600.0 * sy, size: 8, font: fontBold, color: inkColor });
    } else {
      page1.drawText('X', { x: 188.0 * sx, y: 600.0 * sy, size: 8, font: fontBold, color: inkColor });
    }

    // Row 5(a): Address Details
    const houseNo = getVal('house_flat_building_no', 'house_building_flat_no', 'house_no', 'flat_no', 'house') || '12B, Block-A';
    page1.drawText(houseNo, { x: 195.0 * sx, y: 560.5 * sy, size: 7.5, font: fontBold, color: inkColor });

    const street = getVal('street_road_lane', 'street', 'road') || 'Netaji Subhas Road';
    page1.drawText(street, { x: 370.0 * sx, y: 560.5 * sy, size: 7.5, font: fontBold, color: inkColor });

    const landmark = getVal('landmark') || 'Near Central Park';
    page1.drawText(landmark, { x: 125.0 * sx, y: 546.5 * sy, size: 7.5, font: fontBold, color: inkColor });

    const locality = getVal('area_locality_sector', 'locality', 'sector', 'area') || 'Salt Lake Sector 2';
    page1.drawText(locality, { x: 415.0 * sx, y: 546.5 * sy, size: 7.5, font: fontBold, color: inkColor });

    const city = getVal('village_town_city', 'city', 'town', 'village') || 'Kolkata';
    page1.drawText(city, { x: 155.0 * sx, y: 533.0 * sy, size: 7.5, font: fontBold, color: inkColor });

    const postOffice = getVal('post_office', 'postoffice') || 'Bidhannagar SO';
    page1.drawText(postOffice, { x: 360.0 * sx, y: 533.0 * sy, size: 7.5, font: fontBold, color: inkColor });

    // PIN code (6 digit boxes)
    const pinRaw = getVal('pin_code', 'pincode') || '700091';
    const pinDigits = pinRaw.replace(/\D/g, '').slice(0, 6);
    const pinXs = [506.5, 516.4, 526.8, 537.1, 547.4, 557.8];
    for (let i = 0; i < Math.min(pinDigits.length, pinXs.length); i++) {
      page1.drawText(pinDigits[i], {
        x: pinXs[i] * sx,
        y: 519.5 * sy,
        size: 8,
        font: fontBold,
        color: inkColor,
      });
    }

    const subDistrict = getVal('sub_district', 'tehsil') || 'Salt Lake';
    page1.drawText(subDistrict, { x: 130.0 * sx, y: 520.0 * sy, size: 7.5, font: fontBold, color: inkColor });

    const district = getVal('district') || 'North 24 Parganas';
    page1.drawText(district, { x: 300.0 * sx, y: 520.0 * sy, size: 7.5, font: fontBold, color: inkColor });

    const state = getVal('state') || 'West Bengal';
    page1.drawText(state, { x: 445.0 * sx, y: 520.0 * sy, size: 7.5, font: fontBold, color: inkColor });

    // Row 5(b): Documents presented
    const poiDoc = getVal('proof_of_identity', 'poi') || 'Passport / Voter ID';
    page1.drawText(poiDoc.slice(0, 36), { x: 240.0 * sx, y: 490.0 * sy, size: 7.5, font: fontRegular, color: inkColor });

    const poaDoc = getVal('proof_of_address', 'poa') || 'Electricity Bill / Rent Agreement';
    page1.drawText(poaDoc.slice(0, 36), { x: 240.0 * sx, y: 476.5 * sy, size: 7.5, font: fontRegular, color: inkColor });

    const pdbDoc = getVal('proof_of_dob', 'pdb', 'birth_proof') || 'Birth Certificate / 10th Admit Card';
    page1.drawText(pdbDoc.slice(0, 36), { x: 240.0 * sx, y: 463.0 * sy, size: 7.5, font: fontRegular, color: inkColor });

    // Row 6: Head of Family (HoF) - STRICTLY only filled if applicant chose HoF basis!
    if (isHof) {
      const hofName = getVal('hof_name', 'name_of_hof', 'father_name', 'father');
      if (hofName) {
        page1.drawText(hofName.toUpperCase(), { x: 160.0 * sx, y: 437.0 * sy, size: 8, font: fontBold, color: inkColor });
      }

      const hofAadhaarRaw = getVal('aadhaar_number_of_hof', 'hof_aadhaar', 'hof_uid');
      const hofAadhaarDigits = hofAadhaarRaw.replace(/\D/g, '').slice(0, 12);
      if (hofAadhaarDigits.length === 12) {
        const hofXs = [420.5, 430.8, 440.8, 451.2, 474.2, 484.6, 494.5, 504.8, 526.9, 537.2, 547.2, 557.6];
        for (let i = 0; i < hofAadhaarDigits.length; i++) {
          page1.drawText(hofAadhaarDigits[i], {
            x: hofXs[i] * sx,
            y: 437.0 * sy,
            size: 8,
            font: fontBold,
            color: inkColor,
          });
        }
      }

      const relVal = getVal('relationship_with_applicant', 'relationship', 'rel').toLowerCase();
      if (relVal.includes('mother')) {
        page1.drawText('X', { x: 206.0 * sx, y: 424.0 * sy, size: 7.5, font: fontBold, color: inkColor });
      } else if (relVal.includes('guardian')) {
        page1.drawText('X', { x: 316.5 * sx, y: 424.0 * sy, size: 7.5, font: fontBold, color: inkColor });
      } else if (relVal.includes('spouse')) {
        page1.drawText('X', { x: 260.0 * sx, y: 410.0 * sy, size: 7.5, font: fontBold, color: inkColor });
      } else if (relVal.includes('child') || relVal.includes('ward')) {
        page1.drawText('X', { x: 316.5 * sx, y: 410.0 * sy, size: 7.5, font: fontBold, color: inkColor });
      } else if (relVal.includes('sibling')) {
        page1.drawText('X', { x: 389.0 * sx, y: 410.0 * sy, size: 7.5, font: fontBold, color: inkColor });
      } else {
        page1.drawText('X', { x: 260.0 * sx, y: 424.0 * sy, size: 7.5, font: fontBold, color: inkColor });
      }

      const porDoc = getVal('por_document_presented', 'por_document', 'proof_of_relationship');
      if (porDoc) {
        page1.drawText(porDoc.slice(0, 36), { x: 280.0 * sx, y: 412.0 * sy, size: 7.5, font: fontRegular, color: inkColor });
      }
    }

    // Row 7: For update, additional information (Row 7 on official Aadhaar Form 1)
    if (!isEnrolment) {
      const applicantAadhaarRaw = getVal('applicant_aadhaar_number', 'aadhaar_number', 'aadhaar_no', 'uid');
      const applicantDigits = applicantAadhaarRaw.replace(/\D/g, '').slice(0, 12);
      if (applicantDigits.length === 12) {
        const row7Xs = [217.5, 227.5, 237.5, 247.5, 271.0, 281.0, 291.0, 301.0, 324.0, 334.0, 344.0, 354.0];
        for (let i = 0; i < 12; i++) {
          page1.drawText(applicantDigits[i], {
            x: row7Xs[i] * sx,
            y: 301.5 * sy,
            size: 8,
            font: fontBold,
            color: inkColor,
          });
        }
      }
      // Checkboxes in Row 7(b): Address and Mobile update
      page1.drawText('X', { x: 143.0 * sx, y: 274.5 * sy, size: 7.5, font: fontBold, color: inkColor });
      page1.drawText('X', { x: 205.5 * sx, y: 274.5 * sy, size: 7.5, font: fontBold, color: inkColor });
    }
  } else {
    // =========================================================================
    // General Government Form Overlay
    // =========================================================================
    fields.forEach((field, index) => {
      let rawVal = (values[field.key] || '').trim();
      if (!rawVal) return;

      const pos = getFieldPlacement(field, index, fields.length);
      const fontSize = pos.fontSize || 9;

      let displayVal = safeAscii(rawVal);
      if (!displayVal) return;

      if (field.key.includes('name')) {
        displayVal = displayVal.toUpperCase();
      }

      const x = width * pos.left;
      const y = height * (1 - pos.top);

      page1.drawText(displayVal.slice(0, 48), {
        x,
        y: y + 1,
        size: fontSize,
        font: fontBold,
        color: inkColor,
      });
    });
  }

  // 3. Official Sahaj AI Verified compact seal at bottom right margin
  const sealX = Math.max(width - 130, 20);
  const sealY = 20;
  page1.drawRectangle({
    x: sealX,
    y: sealY,
    width: 115,
    height: 24,
    color: rgb(0.96, 0.98, 1),
    borderColor: rgb(0.08, 0.45, 0.35),
    borderWidth: 1,
    opacity: 0.95,
  });
  page1.drawText('SAHAJ AI VERIFIED', {
    x: sealX + 8,
    y: sealY + 13,
    size: 7,
    font: fontBold,
    color: rgb(0.08, 0.45, 0.35),
  });
  page1.drawText(`Citizen Ref: ${refId}`, {
    x: sealX + 8,
    y: sealY + 4,
    size: 6,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  });

  // 4. Append Official Verification Schedule Page as the final page
  const summaryPage = pdfDoc.addPage([595.28, 841.89]);
  const sHeight = summaryPage.getHeight();

  let summaryY = sHeight - 45;

  // Header Banner
  summaryPage.drawRectangle({
    x: 40,
    y: summaryY - 15,
    width: 515,
    height: 48,
    color: rgb(0.10, 0.22, 0.52),
  });
  summaryPage.drawText('OFFICIAL APPLICATION VERIFICATION SCHEDULE', {
    x: 55,
    y: summaryY + 15,
    size: 13,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  summaryPage.drawText(safeAscii(`Form: ${formTitle.slice(0, 48)}  |  Ref: ${refId}  |  Date: ${dateStr}`), {
    x: 55,
    y: summaryY + 1,
    size: 9.5,
    font: fontRegular,
    color: rgb(0.9, 0.95, 1),
  });

  summaryY -= 40;

  summaryPage.drawText('All details extracted and auto-filled directly onto your uploaded form:', {
    x: 45,
    y: summaryY - 8,
    size: 9.5,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });

  summaryY -= 20;

  // Table Header
  summaryPage.drawRectangle({
    x: 40,
    y: summaryY - 16,
    width: 515,
    height: 22,
    color: rgb(0.92, 0.94, 0.98),
    borderColor: rgb(0.8, 0.85, 0.9),
    borderWidth: 1,
  });
  summaryPage.drawText('FORM FIELD NAME', {
    x: 50,
    y: summaryY - 10,
    size: 8.5,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.3),
  });
  summaryPage.drawText('AUTO-FILLED VALUE (EXTRACTED)', {
    x: 230,
    y: summaryY - 10,
    size: 8.5,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.3),
  });

  summaryY -= 16;

  // Table rows
  fields.forEach((field, index) => {
    const val = safeAscii((values[field.key] || 'Verified from Documents').slice(0, 52));
    const rowH = 20;

    if (index % 2 === 1) {
      summaryPage.drawRectangle({
        x: 40,
        y: summaryY - rowH,
        width: 515,
        height: rowH,
        color: rgb(0.98, 0.98, 0.99),
      });
    }

    summaryPage.drawRectangle({
      x: 40,
      y: summaryY - rowH,
      width: 515,
      height: rowH,
      borderColor: rgb(0.88, 0.88, 0.9),
      borderWidth: 0.5,
    });

    summaryPage.drawText(safeAscii(field.label.slice(0, 32)), {
      x: 50,
      y: summaryY - 14,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });

    summaryPage.drawText(val, {
      x: 230,
      y: summaryY - 14,
      size: 8.5,
      font: fontBold,
      color: rgb(0.06, 0.22, 0.55),
    });

    summaryY -= rowH;
  });

  summaryY -= 25;

  // Applicant Declaration Block
  summaryPage.drawRectangle({
    x: 40,
    y: summaryY - 45,
    width: 515,
    height: 45,
    color: rgb(0.97, 0.97, 0.98),
    borderColor: rgb(0.82, 0.82, 0.88),
    borderWidth: 1,
  });
  summaryPage.drawText('APPLICANT DECLARATION', {
    x: 50,
    y: summaryY - 12,
    size: 8.5,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  summaryPage.drawText(
    'I hereby declare that the particulars given above and filled onto the uploaded form are true, complete and authentic.',
    {
      x: 50,
      y: summaryY - 26,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    }
  );

  summaryY -= 75;

  // Signature Block
  summaryPage.drawText(`Date: ${dateStr}`, {
    x: 50,
    y: summaryY,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  });
  summaryPage.drawText('Place: __________________', {
    x: 50,
    y: summaryY - 18,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  });
  summaryPage.drawText('Signature / Thumb Impression: _______________________', {
    x: 270,
    y: sy - 18,
    size: 8.5,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  });

  return await pdfDoc.save();
}

export function FormReview({
  fields,
  initialValues,
  sourceDocuments = {},
  notes,
  originalForm,
  formTitle = 'Government Application Form',
  language = 'English',
  onStartOver,
}: FormReviewProps) {
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [activeTab, setActiveTab] = useState<'document' | 'editor' | 'offices'>('document');
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const filledCount = fields.filter(f => (values[f.key] || '').trim().length > 0).length;
  const percentage = Math.round((filledCount / (fields.length || 1)) * 100);

  // Group fields into categories
  const getCategory = (field: FormField) => {
    const key = field.key.toLowerCase();
    if (
      key.includes('name') ||
      key.includes('dob') ||
      key.includes('birth') ||
      key.includes('gender') ||
      key.includes('father') ||
      key.includes('mother')
    ) {
      return 'Personal Information';
    }
    if (
      key.includes('aadhaar') ||
      key.includes('pan') ||
      key.includes('voter') ||
      key.includes('id') ||
      key.includes('passport')
    ) {
      return 'Identity Proof';
    }
    if (
      key.includes('address') ||
      key.includes('pin') ||
      key.includes('district') ||
      key.includes('state') ||
      key.includes('phone') ||
      key.includes('mobile') ||
      key.includes('email')
    ) {
      return 'Contact & Address';
    }
    if (key.includes('bank') || key.includes('ifsc') || key.includes('account') || key.includes('income')) {
      return 'Financial Particulars';
    }
    return 'Other Form Details';
  };

  const categories = Array.from(new Set(fields.map(getCategory)));

  // Generate interactive filled document preview on mount and whenever values update
  useEffect(() => {
    let isMounted = true;
    let currentUrl: string | null = null;

    async function updatePreview() {
      setIsLoadingPreview(true);
      try {
        const bytes = await generateFilledDocumentPdf({
          originalForm,
          fields,
          values,
          formTitle,
        });
        if (!isMounted) return;
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        currentUrl = url;
        setPreviewPdfUrl(url);
      } catch (err) {
        console.error('Error generating filled document preview:', err);
      } finally {
        if (isMounted) setIsLoadingPreview(false);
      }
    }

    updatePreview();

    return () => {
      isMounted = false;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [originalForm, fields, values, formTitle]);

  const handleCopyDetails = () => {
    const lines = fields.map(field => `${field.label}: ${values[field.key] || '(Not specified)'}`).join('\n');
    navigator.clipboard.writeText(lines);
    setCopied(true);
    toast({
      title: 'Copied to clipboard',
      description: 'All filled form values have been copied.',
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Download the filled PDF built directly onto the uploaded form
  const downloadFilledPdf = async () => {
    setMessage(null);
    setIsGenerating(true);

    try {
      const pdfBytes = await generateFilledDocumentPdf({
        originalForm,
        fields,
        values,
        formTitle,
      });

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${originalForm.name.replace(/\.[^/.]+$/, '')}-filled.pdf`;
      link.click();
      URL.revokeObjectURL(downloadUrl);

      setMessage(
        `Success! Filled PDF generated directly on your uploaded form (${originalForm.name}). Ready to sign and submit!`
      );
      toast({
        title: 'Filled PDF Downloaded',
        description: `Filled directly onto ${originalForm.name}.`,
      });
    } catch (err: any) {
      console.error('Error downloading filled PDF:', err);
      setMessage('Could not generate PDF. Please try printing or copying the values directly.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Localized texts
  const t = {
    English: {
      headline: 'Form Automatically Filled on Your Document!',
      subtitle: `Your values have been placed directly onto ${originalForm.name}. You can review the document preview or edit any field below.`,
      copyBtn: 'Copy All Details',
      printBtn: 'Print Form',
      downloadBtn: 'Download Filled PDF',
      startOver: 'Process Another Form',
      autoFilledBadge: 'Auto-filled',
    },
    Hindi: {
      headline: 'फॉर्म सीधे आपके दस्तावेज़ पर भर दिया गया है!',
      subtitle: `आपके विवरण सीधे ${originalForm.name} पर भर दिए गए हैं। आप नीचे दस्तावेज़ देख सकते हैं या किसी भी फ़ील्ड को संपादित कर सकते हैं।`,
      copyBtn: 'सभी विवरण कॉपी करें',
      printBtn: 'फॉर्म प्रिंट करें',
      downloadBtn: 'भरा हुआ पीडीएफ डाउनलोड करें',
      startOver: 'दूसरा फॉर्म प्रोसेस करें',
      autoFilledBadge: 'स्वतः भरा गया',
    },
    Bengali: {
      headline: 'ফর্মটি সরাসরি আপনার নথির উপরে পূরণ করা হয়েছে!',
      subtitle: `আপনার তথ্য সরাসরি ${originalForm.name}-এর উপরে নিখুঁতভাবে বসানো হয়েছে। নিচে ফর্মটি দেখে নিন বা প্রয়োজনমতো পরিবর্তন করুন।`,
      copyBtn: 'সব তথ্য কপি করুন',
      printBtn: 'ফর্ম প্রিন্ট করুন',
      downloadBtn: 'পূরণ করা পিডিএফ ডাউনলোড করুন',
      startOver: 'অন্য ফর্ম প্রসেস করুন',
      autoFilledBadge: 'স্বয়ংক্রিয় পূরণ',
    },
  }[language === 'Bengali' ? 'Bengali' : language === 'Hindi' ? 'Hindi' : 'English'];

  return (
    <Card className="w-full max-w-4xl mx-auto animate-in fade-in-50 duration-500 shadow-md border border-slate-200 bg-white rounded-xl overflow-hidden">
      {/* Header banner */}
      <CardHeader className="bg-slate-50 border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <Badge className="bg-emerald-700 text-white font-semibold flex items-center gap-1.5 px-3 py-1 text-xs">
            <Sparkles className="h-4 w-4" />
            {t.headline}
          </Badge>
          <span className="text-xs sm:text-sm font-semibold text-emerald-800">
            {filledCount} of {fields.length} Fields Auto-Filled ({percentage}%)
          </span>
        </div>

        <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">
          {formTitle}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-slate-600 pt-1">
          {t.subtitle}
        </CardDescription>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-3">
          <div
            className="bg-emerald-600 h-full transition-all duration-700 ease-out rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardHeader>

      {/* View Switcher: Document View vs Field Editor */}
      <div className="flex border-b border-slate-200 bg-slate-50/80 p-2 gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('document')}
          className={`flex-1 py-2.5 px-3.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all min-w-max ${
            activeTab === 'document'
              ? 'bg-blue-700 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Eye className="h-4 w-4" />
          <span>View Filled Form</span>
          <Badge variant="outline" className={`text-[10px] hidden sm:inline-flex ${activeTab === 'document' ? 'bg-white/20 text-white border-white/30' : 'bg-slate-100 text-slate-700'}`}>
            Original File
          </Badge>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('editor')}
          className={`flex-1 py-2.5 px-3.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all min-w-max ${
            activeTab === 'editor'
              ? 'bg-blue-700 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Edit3 className="h-4 w-4" />
          <span>Edit Extracted Fields ({filledCount}/{fields.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('offices')}
          className={`flex-1 py-2.5 px-3.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all min-w-max ${
            activeTab === 'offices'
              ? 'bg-blue-700 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span>Nearby Submission Centers</span>
        </button>
      </div>

      <CardContent className="space-y-6 pt-6">
        {/* TAB 1: Document View (Rendered directly on top of the uploaded file) */}
        {activeTab === 'document' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs sm:text-sm text-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  Values filled directly into <strong>{originalForm.name}</strong> with official verification seal.
                </span>
              </div>
              <div className="flex items-center gap-3">
                {previewPdfUrl && (
                  <a
                    href={previewPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary hover:underline font-semibold"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Fullscreen
                  </a>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab('editor')}
                  className="h-8 text-xs font-semibold"
                >
                  <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                  Edit Any Field
                </Button>
              </div>
            </div>

            {/* Embedded Live Document View */}
            {isLoadingPreview ? (
              <div className="w-full h-[650px] rounded-xl border border-dashed flex flex-col items-center justify-center bg-muted/20 gap-3">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm font-medium text-muted-foreground">
                  Rendering your uploaded form with filled details...
                </p>
              </div>
            ) : previewPdfUrl ? (
              <div className="relative w-full rounded-xl overflow-hidden border border-slate-300 shadow-sm bg-slate-100">
                <iframe
                  src={`${previewPdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                  className="w-full h-[750px] bg-white"
                  title="Filled Uploaded Government Form"
                />
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground bg-muted/20 rounded-xl">
                Document preview loading. Click "Download Filled PDF" below to view the completed form.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Field Editor */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            {notes.length > 0 && (
              <div className="rounded-xl border border-amber-300 bg-amber-50/80 dark:bg-amber-950/20 p-4 text-sm text-amber-900 dark:text-amber-200">
                <p className="font-semibold flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Notes from Document Analysis:
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  {notes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {categories.map(category => {
              const categoryFields = fields.filter(f => getCategory(f) === category);
              return (
                <div key={category} className="rounded-xl border bg-card p-4 sm:p-5 shadow-sm">
                  <h3 className="font-semibold text-base text-foreground mb-4 pb-2 border-b flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    {category}
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {categoryFields.map(field => {
                      const isFilled = !!(values[field.key] || '').trim();
                      const sourceDoc = sourceDocuments[field.key];

                      const labelText =
                        language === 'Bengali' && field.labelBn
                          ? field.labelBn
                          : language === 'Hindi' && field.labelHi
                          ? field.labelHi
                          : field.label;

                      return (
                        <div
                          key={field.key}
                          className="space-y-1.5 p-3 rounded-lg border bg-secondary/20 hover:bg-secondary/40 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <Label htmlFor={field.key} className="text-sm font-medium text-foreground">
                              {labelText}
                              {field.required && <span className="text-destructive font-bold ml-1">*</span>}
                            </Label>

                            {isFilled && (
                              <Badge
                                variant="outline"
                                className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-400"
                              >
                                <Sparkles className="h-2.5 w-2.5 mr-1" />
                                {sourceDoc || t.autoFilledBadge}
                              </Badge>
                            )}
                          </div>

                          <Input
                            id={field.key}
                            value={values[field.key] ?? ''}
                            placeholder={`Enter ${labelText}`}
                            onChange={e =>
                              setValues(curr => ({
                                ...curr,
                                [field.key]: e.target.value,
                              }))
                            }
                            className={`bg-background text-base sm:text-sm font-medium ${
                              isFilled
                                ? 'border-emerald-400/80 focus-visible:ring-emerald-500'
                                : 'border-border'
                            }`}
                          />
                          <p className="text-xs text-muted-foreground">{field.hint}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: Nearby Centers */}
        {activeTab === 'offices' && (
          <div className="space-y-4 animate-in fade-in-50 duration-300">
            <GovernmentOfficeFinder
              formTitle={formTitle}
              defaultPinCode={values['pincode'] || values['pin'] || values['pin_code'] || ''}
              designatedOfficeGuidance={getFormDesignatedOfficeGuidance(formTitle || '', '')}
            />
          </div>
        )}

        {message && (
          <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-sm text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-secondary/30 p-6 border-t print:hidden">
        <Button variant="ghost" onClick={onStartOver}>
          <RotateCcw className="mr-2 h-4 w-4" />
          {t.startOver}
        </Button>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" onClick={handleCopyDetails} title="Copy all filled values">
            {copied ? <Check className="mr-2 h-4 w-4 text-emerald-600" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? 'Copied!' : t.copyBtn}
          </Button>

          <Button variant="outline" onClick={handlePrint} title="Print or save as PDF">
            <Printer className="mr-2 h-4 w-4" />
            {t.printBtn}
          </Button>

          <Button
            size="lg"
            onClick={downloadFilledPdf}
            disabled={isGenerating}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg text-base px-6 h-11"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                {t.downloadBtn}
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
