export const MOTIVATIONAL_MESSAGES = [
  'Consistent effort beats last-minute cramming every single time.',
  "You're just one clear explanation away from mastering your coursework.",
  'Break complex ideas down into bite-sized questions and watch them click.',
  'Active recall and curiosity turn short-term memory into lasting mastery.',
  'Your study materials hold the answers—upload notes to begin unpacking them.',
]

export interface StarterPrompt {
  title: string
  tag: string
  icon: 'Layers' | 'GraduationCap' | 'Cpu' | 'Database'
  color: 'violet' | 'amber' | 'coral' | 'mint'
}

export const STUDY_STARTER_PROMPTS: StarterPrompt[] = [
  {
    title: 'Explain a complex concept in simple terms',
    tag: 'Concept Clarification',
    icon: 'Layers',
    color: 'violet',
  },
  {
    title: 'Generate a structured 10-mark exam answer',
    tag: 'Exam Preparation',
    icon: 'GraduationCap',
    color: 'amber',
  },
  {
    title: 'Compare two topics with a clear differences table',
    tag: 'Topic Comparison',
    icon: 'Cpu',
    color: 'coral',
  },
  {
    title: 'Summarize key formulas and definitions for quick revision',
    tag: 'Quick Summary',
    icon: 'Database',
    color: 'mint',
  },
]

export function getBackendOfflineResponse(hasDocs: boolean): {
  content: string
  additionalKnowledge?: string
} {
  if (!hasDocs) {
    return {
      content: `### Study Materials Needed

Syllabix provides conversational explanations grounded directly in your curriculum.

To get started:
1. Upload your course syllabus, lecture slides, or reading notes using the **Attach** button below.
2. Once your backend ingestion API is connected, Syllabix will index the text to cite exact pages and sections.`,
      additionalKnowledge: `**System Notice:** The backend API and vector database are not yet connected. Connect your backend service to enable full AI answers grounded in your course materials.`,
    }
  }

  return {
    content: `### Backend Service Not Connected

Your question was received and your study materials are available in this session. However, the AI reasoning service is currently offline.

**To complete integration:**
1. Connect the Syllabix backend API in your environment configuration.
2. Enable the document retrieval and question-answering endpoints.`,
    additionalKnowledge: `**Integration Checklist:** Frontend state is fully wired. Once \`/api/chat\` is connected, answers will be generated using your uploaded documents.`,
  }
}

