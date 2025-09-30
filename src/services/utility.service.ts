import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UtilityService {

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).catch(err => {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed'; // Avoid scrolling to bottom
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (execErr) {
        console.error('Fallback copy failed: ', execErr);
      }
      document.body.removeChild(textArea);
    });
  }

  downloadAsFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
