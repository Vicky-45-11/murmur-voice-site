# 🎙️ Murmur

<div align="center">

### SAY IT ONCE. READ IT CLEAN.

**A voice-dictation product experience that actually listens.**

Murmur is an interactive concept website for a fictional voice-dictation app. Experience speech recognition, watch filler words disappear, and discover a faster way to turn spoken thoughts into clean, readable text.

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Backend](https://img.shields.io/badge/Backend-None-orange?style=for-the-badge)
![Processing](https://img.shields.io/badge/Text%20Cleanup-Local%20%26%20Offline-16A34A?style=for-the-badge)

[Quick Start](#-quick-start) · [Features](#-key-features) · [How It Works](#-how-it-works) · [Architecture](#-architecture) · [Limitations](#%EF%B8%8F-limitations)

</div>

---

## ✨ The Idea

Typing captures what you write. Speaking captures how you think.

**Murmur** is a concept marketing website for a fictional voice-dictation application, inspired by the design language of modern voice-AI products.

Instead of simply describing voice dictation, the website lets visitors experience the idea firsthand. Speak naturally, watch recognized words appear, see unnecessary filler words removed, and compare the result with typing.

The experience combines an animated product demonstration, interactive speech input, polished typography, and a modern, conversion-focused landing page.

**The philosophy is simple:**

> Speak naturally. Write effortlessly.

### 🎯 Project Goals

- Demonstrate browser-based speech recognition.
- Explore the concept of cleaning up spoken language.
- Create a polished, interactive product landing page.
- Showcase modern React and TypeScript development.
- Deliver the experience without requiring a custom backend or API keys.

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or later.
- npm.
- A modern browser. Speech recognition availability depends on browser support.

### Installation

```bash
# Clone the repository
git clone <YOUR_REPOSITORY_URL>

# Navigate to the project
cd murmur

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server with hot reload. |
| `npm run build` | Runs the configured TypeScript build checks and creates production assets in `dist/`. |
| `npm run preview` | Serves the production build locally. |
| `npm run typecheck` | Runs TypeScript checks without creating a production build. |
| `npm run lint` | Runs ESLint using the configured rules. |

No API keys, environment variables, or custom application server are required by the documented setup.

## 🧭 Key Features

### 🎙️ 1. Interactive Voice-Dictation Demo

Experience the central idea behind Murmur through an animated application window.

- Speech recognition where supported.
- Live transcription of spoken words.
- Animated cleaned-text output.
- Pause and resume controls for the demonstration.
- Mail, Chat, and Editor interface tabs.
- A visual distinction between raw speech and refined text.

The hero experience brings the product concept to life before visitors explore the rest of the page.

### ✨ 2. Intelligent Text Cleanup

Spoken language often contains repetitions, hesitation, and unnecessary filler words.

Murmur demonstrates how a cleanup layer could transform rough speech into more readable text.

**Example**

Raw transcription:

> "Um, I think we should, uh, schedule the meeting for tomorrow, you know."

Cleaned output:

> "I think we should schedule the meeting for tomorrow."

The cleanup demonstration is illustrative. Actual results depend on the implementation and the rules applied to the recognized text.

### ⌨️ 3. Speech vs. Typing Comparison

Explore the difference between speaking an idea and manually typing it.

The product experience can compare the two workflows through animated text, interactive examples, and illustrative speed metrics.

Any numerical performance claims should be clearly identified as illustrative unless supported by measured results.

### 🧭 4. Interactive Navigation

- Sticky navigation with a blurred background on scroll.
- Anchor links to relevant page sections.
- Responsive mobile navigation.
- Escape-key support for closing the mobile menu.
- Automatic menu closure after selecting a navigation link.

### 🎨 5. Premium Product Design

Murmur focuses on a clean, modern interface that communicates clarity and speed.

- Expressive typography and generous spacing.
- Subtle transitions and animated text.
- Product-inspired UI mockups.
- Responsive layouts.
- Carefully designed interactive states.
- Motion that supports the content instead of distracting from it.

### 🔒 6. Lightweight, Backend-Free Architecture

The website is designed to run without a dedicated backend, external AI API, or application database.

Text-cleanup rules can run locally in the browser, while speech recognition depends on the browser's available capabilities.

**Important:** A frontend-only architecture does not automatically guarantee that speech is processed entirely offline. Browser speech-recognition implementations may use remote services.

## 🔄 How It Works

The experience can be understood as a simple pipeline:

<box border radius="lg" padding={3} align="center" gap={2}>
  <box background="surface-secondary" radius="md" padding={3} width="100%" align="center">
    <icon name="mic" size="xl"/>
    **1. Speak**

    <text color="secondary" size="sm" textAlign="center">The user provides spoken input.</text>
  </box>
  <icon name="arrow-down" color="secondary" size="xl"/>
  <box background="surface" border radius="md" padding={3} width="100%" align="center">
    <icon name="audio-lines" size="xl"/>
    **2. Recognize**

    <text color="secondary" size="sm" textAlign="center">A supported browser speech API converts audio into text.</text>
  </box>
  <icon name="arrow-down" color="secondary" size="xl"/>
  <box background="surface" border radius="md" padding={3} width="100%" align="center">
    <icon name="wand-sparkles" size="xl"/>
    **3. Clean**

    <text color="secondary" size="sm" textAlign="center">Local text-processing rules refine the transcript.</text>
  </box>
  <icon name="arrow-down" color="secondary" size="xl"/>
  <box background="surface-secondary" radius="md" padding={3} width="100%" align="center">
    <icon name="file-text" size="xl"/>
    **4. Write**

    <text color="secondary" size="sm" textAlign="center">The cleaned text appears in the product interface.</text>
  </box>
</box>

This pipeline describes the intended product experience; the exact recognition and cleanup behavior depends on the implemented code.

## 🏗️ Architecture

Murmur uses a lightweight frontend architecture.

| Layer | Responsibility |
|---|---|
| React UI | Components, sections, menus, and interactive product demonstrations |
| TypeScript | Type safety and application logic |
| Speech Recognition | Browser-supported speech-to-text functionality |
| Text Processing | Local cleanup and formatting rules |
| CSS | Responsive design, animation, and visual presentation |
| Vite | Development tooling and production bundling |

The website does not require a custom backend for its documented functionality.

## 🛠️ Technology Stack

- **React 18** — Component-based user interface.
- **TypeScript 5** — Type-safe application development.
- **Vite 5** — Fast development server and build tooling.
- **Node.js 18+** — Development environment.
- **Browser Speech APIs** — Speech recognition where supported.
- **CSS** — Styling, responsive layouts, and transitions.
- **ESLint** — Code quality and linting.

## 📁 Project Structure

An illustrative structure for the application:

```text
murmur/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── sections/        # Landing-page sections
│   ├── styles/          # CSS and design styles
│   ├── App.tsx          # Main application
│   └── main.tsx         # Application entry point
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── README.md            # Project documentation
```

Adapt this structure to match the actual repository.

## ⚠️ Limitations

- **Browser compatibility:** Speech recognition is not supported uniformly across browsers.
- **Microphone permissions:** Users must grant microphone access before recording.
- **Secure context:** Microphone and speech APIs generally require HTTPS in production, although localhost is typically treated as a secure context.
- **Recognition accuracy:** Background noise, accents, and speech patterns can affect transcription quality.
- **Cleanup limitations:** Rule-based text processing may remove meaningful words or change intended meaning.
- **Privacy:** Speech recognition may rely on browser-vendor services. Do not describe the system as fully offline unless the complete recognition pipeline genuinely runs locally.
- **Concept status:** Murmur is a fictional product concept, not a claim of a commercially deployed dictation service.

## 🔮 Future Enhancements

- [ ] Add more advanced punctuation and formatting.
- [ ] Support customizable filler-word cleanup.
- [ ] Introduce voice-command editing.
- [ ] Add language and transcription settings.
- [ ] Improve accessibility and keyboard navigation.
- [ ] Provide export options for cleaned text.
- [ ] Explore genuinely offline speech recognition.
- [ ] Add privacy controls and transparent audio-processing indicators.
- [ ] Evaluate transcription and cleanup quality using representative test samples.

## ⚖️ Brand & Content

Murmur is an independent conceptual project featuring original naming, branding, copy, and artwork.

It does not claim affiliation with third-party voice-AI products. Any illustrative statistics or performance figures should not be interpreted as verified customer results or benchmark measurements.

## 👨‍💻 Built by Vicky

Created by [@Vicky-45-11](https://github.com/Vicky-45-11).

An exploration of modern frontend engineering, speech interfaces, interactive storytelling, and thoughtful product design.

---

<div align="center">

### 🎙️ Murmur

**Say it once. Read it clean.**

*Less typing. Fewer distractions. More room for ideas.*

</div>
