export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { getExplanationAction } from '@/app/actions';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentDataUri, language, fileName } = body;

    if (!documentDataUri) {
      return NextResponse.json(
        { success: false, error: 'Document data URI is required.' },
        { status: 400 }
      );
    }

    const result = await getExplanationAction({
      documentDataUri,
      language: language || 'English',
      fileName: fileName || 'government_form.pdf',
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('API /api/explain error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to explain government form.',
      },
      { status: 500 }
    );
  }
}
