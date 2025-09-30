<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Cinematic Script AI Toolkit

The Cinematic Script AI Toolkit is a powerful web application designed to help screenwriters, directors, and content creators transform their raw script ideas into fully-realized cinematic assets. By leveraging the power of the Google Gemini API, this tool provides a suite of generation capabilities to accelerate the pre-production and creative development process.

View your app in AI Studio: https://ai.studio/apps/drive/13bBeCu7zvUtU0ixRlCyZxXZGT4bcphvC

## Features

- **Cinematic Blueprint Generation**: Transforms a script or scene into a detailed, timestamped blueprint, including shot descriptions, camera movements, sound design, and strategic context.
- **Suno Audio Prompts**: Generates structured JSON prompts for the Suno AI music generator, creating a style guide and lyrics based on your script and a chosen theme.
- **Image Storyboard Prompts**: Creates a sequential list of rich, detailed prompts for image generation models like Midjourney, designed to visualize every key shot in your script.
- **Quick Feedback**: Provides a short, actionable piece of advice from an AI script doctor to help improve the cinematic potential of your writing.
- **Copy & Download**: Easily copy any generated content to your clipboard or download it as a text file.

## Technology Stack

- **Framework**: [Angular](https://angular.io/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI**: [Google Gemini API](https://ai.google.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

## Project Structure

The project is organized into several key files and directories:

```
.
├── src/
│   ├── app.component.ts        # Main Angular component, handles UI and application logic.
│   ├── app.component.html      # (Inline template in app.component.ts)
│   ├── services/
│   │   ├── gemini.service.ts   # Core service for all Gemini API generation tasks.
│   │   ├── guidance.service.ts # Service for the "Quick Feedback" feature.
│   │   └── utility.service.ts  # Helper functions for copy/download.
│   └── ...
├── index.html                  # Main HTML entry point.
├── angular.json                # Angular project configuration.
├── package.json                # Project dependencies and scripts.
└── README.md                   # This file.
```

## Run Locally

**Prerequisites:** [Node.js](https://nodejs.org/) installed.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your API Key:**
    Create a file named `.env.local` in the root of the project and add your Google Gemini API key:
    ```
    API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:4200/`.