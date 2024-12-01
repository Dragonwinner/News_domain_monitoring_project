import React, { useRef, useState } from 'react';
import { FileUp } from 'lucide-react';
import { processContent } from '../utils/contentProcessor';
import { useSettings } from '../contexts/SettingsContext';
import { checkDomainAvailability } from '../utils/domainUtils';
import { processInBatches } from '../utils/batchProcessor';

interface ContentImportProps {
  onDomainsFound: (domains: string[]) => void;
}

export function ContentImport({ onDomainsFound }: ContentImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useSettings();

  const generateDomains = (words: string[]): string[] => {
    const { minLength, maxLength, tlds } = settings.domainSettings;
    
    return words
      .filter(word => word.length >= minLength && word.length <= maxLength)
      .flatMap(word => tlds.map(tld => `${word}${tld}`));
  };

  const checkDomains = async (domains: string[]) => {
    const results: string[] = [];
    
    await processInBatches(
      domains,
      100,
      async (domain) => {
        const available = await checkDomainAvailability(domain);
        if (available) results.push(domain);
      },
      (progress) => setProgress(progress)
    );
    
    return results;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    setProgress(0);
    setError(null);
    
    try {
      const words = await processContent(file);
      const domains = generateDomains(words);
      const availableDomains = await checkDomains(domains);
      onDomainsFound(availableDomains);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      console.error('Error processing file:', error);
    } finally {
      setProcessing(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleTextInput = async () => {
    if (!content.trim()) return;
    
    setProcessing(true);
    setProgress(0);
    setError(null);
    
    try {
      const words = await processContent(content);
      const domains = generateDomains(words);
      const availableDomains = await checkDomains(domains);
      onDomainsFound(availableDomains);
      setContent('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      console.error('Error processing text:', error);
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          disabled={processing}
        >
          <FileUp className="w-4 h-4" />
          <span>Upload File</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.csv,.pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {processing && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            Processing... {progress}%
          </p>
        </div>
      )}

      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Or paste your content here..."
          className="w-full h-32 p-2 border rounded-lg disabled:opacity-50"
          disabled={processing}
        />
        <button
          onClick={handleTextInput}
          className="mt-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          disabled={processing || !content.trim()}
        >
          Process Content
        </button>
      </div>
    </div>
  );
}