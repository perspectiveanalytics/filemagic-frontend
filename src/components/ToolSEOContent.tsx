import { type ReactNode } from 'react';

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface RelatedTool {
  label: string;
  href: string;
}

export interface ToolSEOContentProps {
  howTo?: {
    title: string;
    steps: string[];
  };
  features?: Feature[];
  faq?: FAQItem[];
  relatedTools?: RelatedTool[];
}

export default function ToolSEOContent(_props: ToolSEOContentProps) {
  return null;
}
