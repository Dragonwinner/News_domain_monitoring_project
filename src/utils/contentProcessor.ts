import * as pdfjsLib from 'pdfjs-dist';
import { validateInput } from './validation';
import { cleanText, filterWords } from './textProcessing';

export async function processContent(input: File | string): Promise<string[]> {
  try {
    validateInput(input);

    if (input instanceof File) {
      const extension = input.name.split('.').pop()?.toLowerCase();
      
      switch (extension) {
        case 'pdf':
          return await processPdf(input);
        case 'txt':
          return await processTxt(input);
        case 'csv':
          return await processCsv(input);
        default:
          throw new Error(`Unsupported file type: ${extension}`);
      }
    }

    return processText(input);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Content processing failed: ${error.message}`);
    }
    throw new Error('Content processing failed: Unknown error');
  }
}

async function processPdf(file: File): Promise<string[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    let text = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ');
      text += ' ' + pageText;
    }

    return processText(text);
  } catch (error) {
    console.error('PDF processing error:', error);
    throw new Error('Failed to process PDF file');
  }
}

async function processTxt(file: File): Promise<string[]> {
  try {
    const text = await file.text();
    return processText(text);
  } catch (error) {
    throw new Error('Failed to process text file');
  }
}

async function processCsv(file: File): Promise<string[]> {
  try {
    const text = await file.text();
    const lines = text.split('\n');
    const words = lines.join(' ');
    return processText(words);
  } catch (error) {
    throw new Error('Failed to process CSV file');
  }
}

function processText(text: string): string[] {
  const cleaned = cleanText(text);
  const words = filterWords(cleaned);
  console.log('Extracted words:', words); // Debug log
  return words;
}