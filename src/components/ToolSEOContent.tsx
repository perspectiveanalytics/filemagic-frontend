import { type ReactNode } from 'react';
import {
  Box,
  Typography,
  Sheet,
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
} from '@mui/joy';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';

// ── Types ──

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

// ── Section heading ──

const sectionHeadingSx = {
  fontWeight: 700,
  color: 'text.secondary',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  fontSize: '0.7rem',
  mb: 2.5,
};

// ── Component ──

export default function ToolSEOContent({
  howTo,
  features,
  faq,
  relatedTools,
}: ToolSEOContentProps) {
  const hasContent =
    howTo || (features && features.length > 0) || (faq && faq.length > 0) || (relatedTools && relatedTools.length > 0);

  if (!hasContent) return null;

  return (
    <>
      {faq && faq.length > 0 && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faq.map((item) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: item.answer,
                },
              })),
            })}
          </script>
        </Helmet>
      )}

      {howTo && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'HowTo',
              name: howTo.title,
              step: howTo.steps.map((text, i) => ({
                '@type': 'HowToStep',
                position: i + 1,
                text,
              })),
            })}
          </script>
        </Helmet>
      )}

      <Box component="aside" aria-label="Tool information" sx={{ mt: 6 }}>
        <Box
          sx={{
            width: 32,
            height: '1px',
            bgcolor: 'divider',
            mx: 'auto',
            mb: 5,
          }}
        />

        {howTo && (
          <Box component="section" sx={{ mb: 5 }}>
            <Typography component="h2" level="body-sm" sx={sectionHeadingSx}>
              {howTo.title}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {howTo.steps.map((step, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.65rem',
                      color: 'text.tertiary',
                      minWidth: 18,
                      mt: '3px',
                      fontWeight: 600,
                      lineHeight: 1,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </Typography>
                  <Typography
                    level="body-sm"
                    sx={{ color: 'text.secondary', lineHeight: 1.6 }}
                  >
                    {step}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {features && features.length > 0 && (
          <Box component="section" sx={{ mb: 5 }}>
            <Typography component="h2" level="body-sm" sx={sectionHeadingSx}>
              Features
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 1.5,
              }}
            >
              {features.map((feature, i) => (
                <Sheet
                  key={i}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 'md',
                    bgcolor: 'transparent',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.75,
                    }}
                  >
                    <Box
                      sx={{
                        color: 'text.tertiary',
                        display: 'flex',
                        '& > svg': { fontSize: 16 },
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography
                    level="body-xs"
                    sx={{ color: 'text.tertiary', lineHeight: 1.5 }}
                  >
                    {feature.description}
                  </Typography>
                </Sheet>
              ))}
            </Box>
          </Box>
        )}

        {faq && faq.length > 0 && (
          <Box component="section" sx={{ mb: 5 }}>
            <Typography component="h2" level="body-sm" sx={sectionHeadingSx}>
              Frequently Asked Questions
            </Typography>
            <AccordionGroup
              variant="outlined"
              sx={{ borderRadius: 'md' }}
            >
              {faq.map((item, i) => (
                <Accordion key={i}>
                  <AccordionSummary>
                    <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                      {item.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      level="body-sm"
                      sx={{ color: 'text.secondary', lineHeight: 1.7 }}
                    >
                      {item.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </AccordionGroup>
          </Box>
        )}

        {relatedTools && relatedTools.length > 0 && (
          <Box component="nav" aria-label="Related tools">
            <Typography component="h2" level="body-sm" sx={sectionHeadingSx}>
              Related Tools
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {relatedTools.map((tool) => (
                <Box
                  key={tool.href}
                  component={RouterLink}
                  to={tool.href}
                  sx={{
                    px: 1.75,
                    py: 0.625,
                    borderRadius: 'sm',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: 'text.secondary',
                    textDecoration: 'none',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.15s',
                    '&:hover': {
                      borderColor: 'primary.400',
                      color: 'primary.plainColor',
                      bgcolor: 'primary.softBg',
                    },
                  }}
                >
                  {tool.label}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
}
