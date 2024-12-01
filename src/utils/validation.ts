export function validateInput(input: File | string): void {
  if (input instanceof File) {
    if (input.size === 0) {
      throw new Error('File is empty');
    }
    if (input.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('File size exceeds 10MB limit');
    }
    
    const extension = input.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'txt', 'csv'].includes(extension || '')) {
      throw new Error('Unsupported file type');
    }
  } else {
    if (!input.trim()) {
      throw new Error('Input text is empty');
    }
    if (input.length > 1000000) { // 1MB text limit
      throw new Error('Text content exceeds maximum length');
    }
  }
}