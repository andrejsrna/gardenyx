import { load } from 'cheerio';

export function parseHTML(html: string) {
  const $ = load(html);
  
  return {
    getMetaTag: (name: string) => {
      return $(`meta[name="${name}"]`).attr('content') || 
             $(`meta[property="${name}"]`).attr('content');
    },
    getTitle: () => $('title').text(),
    getCanonical: () => $('link[rel="canonical"]').attr('href'),
    getRobots: () => $('meta[name="robots"]').attr('content'),
    getAllMetaTags: () => {
      const tags: Record<string, string> = {};
      $('meta').each((_, el) => {
        const name = $(el).attr('name') || $(el).attr('property');
        const content = $(el).attr('content');
        if (name && content) {
          tags[name] = content;
        }
      });
      return tags;
    },
  };
} 