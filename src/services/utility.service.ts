import { Injectable } from '@angular/core';

/**
 * Provides common utility functions for the application.
 * This service includes methods for interacting with the clipboard and downloading files.
 */
@Injectable({ providedIn: 'root' })
export class UtilityService {

  /**
   * Copies the given text to the user's clipboard.
   * Includes a fallback mechanism for older browsers that do not support the
   * modern Clipboard API.
   * @param text The string of text to be copied.
   */
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

  /**
   * Triggers a browser download of a text-based file.
   * Creates a Blob from the provided content and initiates a download.
   * @param content The string content to be included in the file.
   * @param filename The name of the file to be downloaded.
   */
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
