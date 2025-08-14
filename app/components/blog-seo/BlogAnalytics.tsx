'use client';

import { useEffect } from 'react';

interface BlogAnalyticsProps {
  postId: number;
  postTitle: string;
  postSlug: string;
  readTime: number;
  wordCount: number;
  topic: string;
}

export default function BlogAnalytics({
  postId,
  postTitle,
  postSlug,
  readTime,
  wordCount,
  topic
}: BlogAnalyticsProps) {
  useEffect(() => {
    // Track blog post view
    const trackBlogView = () => {
      // Send to analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'blog_post_view', {
          'custom_map': {
            'custom_parameter_1': 'post_id',
            'custom_parameter_2': 'post_topic'
          },
          'post_id': postId,
          'post_title': postTitle,
          'post_slug': postSlug,
          'post_topic': topic,
          'estimated_read_time': readTime,
          'word_count': wordCount
        });
      }

      // Track scroll depth for engagement
      let maxScroll = 0;
      const trackScrollDepth = () => {
        const scrolled = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrolled > maxScroll) {
          maxScroll = scrolled;
          
          // Track milestone scroll depths
          if (maxScroll >= 25 && maxScroll < 50) {
            trackEvent('scroll_depth_25');
          } else if (maxScroll >= 50 && maxScroll < 75) {
            trackEvent('scroll_depth_50');
          } else if (maxScroll >= 75 && maxScroll < 100) {
            trackEvent('scroll_depth_75');
          } else if (maxScroll >= 100) {
            trackEvent('scroll_depth_100');
          }
        }
      };

      window.addEventListener('scroll', trackScrollDepth);
      return () => window.removeEventListener('scroll', trackScrollDepth);
    };

    // Track time on page
    const startTime = Date.now();
    const trackTimeOnPage = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'blog_engagement', {
          'time_on_page': timeSpent,
          'post_id': postId,
          'engagement_quality': timeSpent > readTime * 60 ? 'high' : 'low'
        });
      }
    };

    // Track internal link clicks
    const trackInternalLinks = () => {
      const links = document.querySelectorAll('a[href^="/"]');
      links.forEach(link => {
        link.addEventListener('click', () => {
          const href = link.getAttribute('href');
          const linkText = link.textContent?.trim() || '';
          
          trackEvent('internal_link_click', {
            'link_destination': href,
            'link_text': linkText,
            'source_post': postSlug
          });
        });
      });
    };

    // Track external link clicks
    const trackExternalLinks = () => {
      const links = document.querySelectorAll('a[href^="http"]');
      links.forEach(link => {
        link.addEventListener('click', () => {
          const href = link.getAttribute('href');
          const linkText = link.textContent?.trim() || '';
          
          trackEvent('external_link_click', {
            'link_destination': href,
            'link_text': linkText,
            'source_post': postSlug
          });
        });
      });
    };

    // Initialize tracking
    const cleanup = trackBlogView();
    trackInternalLinks();
    trackExternalLinks();

    // Track reading completion
    const handleBeforeUnload = () => {
      trackTimeOnPage();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (cleanup) cleanup();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [postId, postTitle, postSlug, readTime, wordCount, topic]);

  return null; // This component doesn't render anything
}

// Helper function to track custom events
function trackEvent(eventName: string, parameters: Record<string, unknown> = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
}

// Helper function to track SEO-specific metrics
export function trackSEOMetrics(postData: {
  postId: number;
  hasTableOfContents: boolean;
  headingCount: number;
  imageCount: number;
  internalLinkCount: number;
  externalLinkCount: number;
  readabilityScore?: number;
}) {
  trackEvent('seo_metrics', {
    ...postData,
    seo_quality_score: calculateSEOScore(postData)
  });
}

function calculateSEOScore(data: {
  hasTableOfContents: boolean;
  headingCount: number;
  imageCount: number;
  internalLinkCount: number;
  externalLinkCount: number;
}): number {
  let score = 0;
  
  // Table of contents (20 points)
  if (data.hasTableOfContents) score += 20;
  
  // Proper heading structure (15 points)
  if (data.headingCount >= 3 && data.headingCount <= 8) score += 15;
  else if (data.headingCount > 0) score += 10;
  
  // Images (15 points)
  if (data.imageCount >= 2) score += 15;
  else if (data.imageCount > 0) score += 10;
  
  // Internal links (25 points)
  if (data.internalLinkCount >= 5) score += 25;
  else if (data.internalLinkCount >= 3) score += 20;
  else if (data.internalLinkCount > 0) score += 10;
  
  // External links (10 points)
  if (data.externalLinkCount >= 2) score += 10;
  else if (data.externalLinkCount > 0) score += 5;
  
  // Reading experience (15 points for good structure)
  score += 15;
  
  return Math.min(score, 100);
}

// Types for global gtag
declare global {
  interface Window {
    gtag: (command: string, target: string | Date, params?: Record<string, unknown>) => void;
  }
} 