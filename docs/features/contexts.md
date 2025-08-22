# enso: Context & Development Guidelines

## Project Overview
enso is an AI-native messaging app built with React Native and Expo. Targeting developers and knowledge workers, enso delivers a minimal, utilitarian interface that combines Cursor's intelligent reference system, Co-Star's dramatic minimalism, and iMessage's intuitive chat experience. The app leverages embeddings and async LLM pipelines for intelligent context linking, thread management, and semantic search. The focus is on making contextual intelligence feel natural and helpful rather than intrusive.

## UI/UX Philosophy
- **Cursor-Inspired Intelligence:**  
  Implement a smart reference system that detects and links mentions of threads, users, places, and resources in real-time, similar to Cursor's code reference UI.
- **Co-Star Minimalism:**
  Embrace dramatic typography, ample white space, and subtle animations that create a sophisticated, editorial feel.
- **iMessage Fluidity:**
  Ensure chat interactions are smooth and intuitive, with seamless thread management and context switching.
- **Custom & Authentic:**  
  Build a unique component system that captures enso's identity—distinct from off-the-shelf libraries.
- **Invisible AI:**  
  Focus on contextual intelligence and semantic linking that enhances conversations naturally.

## Tech Stack & Tooling
- **Frontend:**  
  - **React Native / Expo:** For cross-platform mobile development.
  - **pnpm:** For efficient package management.
- **Backend:**  
  - **Supabase:** For authentication, real-time data, and storage.
- **AI Integrations:**  
  - **Vertex AI & DeepSeek APIs:** For powering contextual search, translation, and smart tagging.
- **Animations:**  
  - **Moti:** For declarative, Framer Motion–inspired animations.
- **Styling:**  
  - **Nativewind:** For utility-first styling using Tailwind CSS–inspired classes.
- **State Management:**  
  - **Redux & RTK Toolkit (with RTK Query):** For robust state management and data fetching.
- **Quality & Testing Tools:**  
  - **ESLint & Prettier:** To enforce code quality.
  - **Jest & Detox:** For unit and end-to-end testing.
  - **Storybook:** For documenting and testing our custom component system.
  - **GitHub Actions & Sentry:** For CI/CD and error monitoring.

## AI Features
- **Contextual Threading:**
  Use embeddings to automatically detect and link related conversation threads
- **Smart References:**
  Detect and link mentions of users, threads, places, and resources in real-time
- **Semantic Search:**
  Enable natural language search across conversations using embedding-based retrieval
- **Async Summaries:**
  Generate thread summaries and context cards asynchronously using LLM pipelines
- **Intelligent Grouping:**
  Automatically group related messages and surface relevant context

## AI & Backend Integration Details
- **Contextual Search & Smart Tagging:**  
  Leverage multimodal embeddings from Vertex AI and efficient search from DeepSeek to index and retrieve messages, images, and voice clips.
- **Real-Time Translation:**  
  Automatically translate messages on the fly, preserving tone and context.
- **Supabase Integration:**  
  Use a singleton Supabase client (in `supabase/supabaseClient.js`) and encapsulate API interactions within dedicated service files.

## Development Guidelines
- **Custom Component System:**  
  Build and maintain a bespoke component library under `src/components` to capture our unique minimal/Co–Star aesthetic.
- **Modular Architecture:**  
  Follow the directory structure to separate UI components, state management, services, and utilities.
- **Performance & Scalability:**  
  Optimize animations, API calls, and state updates for a smooth, responsive mobile experience.
- **Code Quality & Testing:**  
  Enforce standards using ESLint, Prettier, Jest, and Detox; document components with Storybook.
- **Accessibility:**  
  Ensure that all interactive elements are properly labeled and accessible.
- **Iteration & Feedback:**  
  Emphasize early testing and regular feedback to refine AI functionalities and UI/UX.

## Roadmap
1. **Foundational Setup:**  
   Set up core navigation, authentication (via Supabase), and basic chat functionality.
2. **Custom Component System:**  
   Develop the core UI components (buttons, inputs, cards, etc.) that embody the enso design aesthetic.
3. **AI Feature Integration:**  
   Implement Vertex AI and DeepSeek for contextual search, translation, and smart tagging.
4. **UI/UX Polish:**  
   Refine the minimal, edgy design and ensure responsiveness.
5. **Tooling & Quality Assurance:**  
   Integrate Storybook, ESLint/Prettier, CI/CD pipelines, and error monitoring.
6. **User Testing & Iteration:**  
   Continuously refine based on user feedback.
7. **Launch & Scale:**  
   Roll out a freemium model with premium AI-powered features.

Use this document as your North Star to ensure every development decision aligns with enso's vision.
