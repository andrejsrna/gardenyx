import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import remarkGfm from 'remark-gfm';
import { z } from 'zod';
import type { WordPressCategory, WordPressPost, WordPressTag } from './content-types';

const CONTENT_ROOT = path.join(process.cwd(), 'content', 'posts');
export const LOCAL_POST_ID_OFFSET = 2_000_000;
export const LOCAL_TAG_ID_OFFSET = 3_000_000;
export const LOCAL_CATEGORY_ID_OFFSET = 4_000_000;

type LocalTaxonomy = {
  id: number;
  name: string;
  slug: string;
};

type LocalSeo = {
  title?: string;
  description?: string;
  image?: string;
  canonicalUrl?: string;
  noindex?: boolean;
};

type LocalPost = {
  id: number;
  slug: string;
  title: string;
  date: string;
  updated?: string;
  excerpt: string;
  author: string;
  coverImage?: string;
  contentHtml: string;
  plainText: string;
  tags: LocalTaxonomy[];
  categories: LocalTaxonomy[];
  seo: LocalSeo;
  readingTimeMinutes: number;
};

const frontmatterSchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  date: z.string(),
  updated: z.string().optional(),
  excerpt: z.string().optional(),
  author: z.string().optional(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoImage: z.string().optional(),
  canonicalUrl: z.string().optional(),
  noindex: z.boolean().optional(),
});

const cached = {
  posts: null as LocalPost[] | null,
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const createDeterministicId = (input: string, offset: number): number => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return offset + Math.abs(hash);
};

const toIsoDate = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date value "${value}" in markdown frontmatter`);
  }
  return parsed.toISOString();
};

const stripMarkdown = (markdown: string): string =>
  markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '$1')
    .replace(/<\/?[^>]+>/g, ' ')
    .replace(/[*_>#~\-\+\=\[\]\{\}\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const buildExcerpt = (text: string, limit: number = 50): string => {
  if (!text) return '';
  const words = text.split(/\s+/);
  if (words.length <= limit) {
    return text;
  }
  return `${words.slice(0, limit).join(' ')}…`;
};

const createTerm = (name: string, offset: number): LocalTaxonomy => {
  const trimmed = name.trim();
  const slug = slugify(trimmed);
  return {
    id: createDeterministicId(slug, offset),
    name: trimmed,
    slug,
  };
};

const convertToWordPressPost = (post: LocalPost): WordPressPost => {
  const categories: WordPressCategory[] =
    post.categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      count: 1,
      description: '',
      link: `/blog/kategoria/${category.slug}`,
      taxonomy: 'category',
      parent: 0,
      meta: [],
    }));

  const tags: WordPressCategory[] =
    post.tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      count: 1,
      description: '',
      link: `/blog?tag=${tag.slug}`,
      taxonomy: 'post_tag',
      parent: 0,
      meta: [],
    }));

  return {
    id: post.id,
    date: post.date,
    title: { rendered: post.title },
    content: { rendered: post.contentHtml },
    excerpt: { rendered: post.excerpt },
    link: `/${post.slug}`,
    slug: post.slug,
    featured_media: post.coverImage ? post.id : 0,
    _embedded: {
      author: [{ name: post.author }],
      ...(post.coverImage
        ? { 'wp:featuredmedia': [{ source_url: post.coverImage }] }
        : {}),
      ...(categories.length > 0 || tags.length > 0 ? { 'wp:term': [categories, tags] } : {}),
    },
    meta: {
      isLocal: true,
      seoTitle: post.seo.title ?? post.title,
      seoDescription: post.seo.description ?? stripMarkdown(post.excerpt),
      seoImage: post.seo.image ?? post.coverImage,
      canonicalUrl: post.seo.canonicalUrl ?? `/${post.slug}`,
      noindex: post.seo.noindex,
      updated: post.updated,
      readingTimeMinutes: post.readingTimeMinutes,
    },
  };
};

const readMarkdownFile = async (filePath: string): Promise<LocalPost | null> => {
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = matter(raw, {
    // js-yaml v4 removed safeLoad; use load explicitly to stay compatible
    engines: {
      yaml: (source) => yaml.load(source) as object,
    },
  });
  const validation = frontmatterSchema.safeParse(parsed.data);

  if (!validation.success) {
    console.error(`Invalid frontmatter in ${filePath}:`, validation.error.flatten().fieldErrors);
    return null;
  }

  const data = validation.data;
  const slug = data.slug ? slugify(data.slug) : slugify(path.basename(filePath, path.extname(filePath)));
  const isoDate = toIsoDate(data.date);
  const updated = data.updated ? toIsoDate(data.updated) : undefined;

  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(parsed.content);

  const contentHtml = processedContent.toString();
  const plainText = stripMarkdown(parsed.content);
  const excerpt = data.excerpt?.trim() || buildExcerpt(plainText);
  const author = data.author || 'Náš tím';
  const readingTimeMinutes = Math.max(1, Math.ceil(plainText.split(/\s+/).length / 200));

  const categories = (data.categories ?? []).map((name) => createTerm(name, LOCAL_CATEGORY_ID_OFFSET));
  const tags = (data.tags ?? []).map((name) => createTerm(name, LOCAL_TAG_ID_OFFSET));

  return {
    id: createDeterministicId(slug, LOCAL_POST_ID_OFFSET),
    slug,
    title: data.title,
    date: isoDate,
    updated,
    excerpt,
    author,
    coverImage: data.coverImage,
    contentHtml,
    plainText,
    tags,
    categories,
    seo: {
      title: data.seoTitle,
      description: data.seoDescription,
      image: data.seoImage,
      canonicalUrl: data.canonicalUrl,
      noindex: data.noindex,
    },
    readingTimeMinutes,
  };
};

const loadLocalPosts = async (): Promise<LocalPost[]> => {
  if (cached.posts) {
    return cached.posts;
  }

  let files: string[];
  try {
    files = await fs.readdir(CONTENT_ROOT);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      cached.posts = [];
      return cached.posts;
    }
    throw error;
  }

  const markdownFiles = files.filter((file) => file.endsWith('.md') || file.endsWith('.mdx'));

  const posts = (
    await Promise.all(
      markdownFiles.map(async (file) => {
        try {
          const filePath = path.join(CONTENT_ROOT, file);
          const post = await readMarkdownFile(filePath);
          return post;
        } catch (error) {
          console.error(`Unable to parse markdown file ${file}:`, error);
          return null;
        }
      }),
    )
  ).filter((post): post is LocalPost => Boolean(post));

  cached.posts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return cached.posts;
};

const convertPosts = async (): Promise<WordPressPost[]> => {
  const posts = await loadLocalPosts();
  return posts.map(convertToWordPressPost);
};

const getLocalPostsMap = async (): Promise<Map<number, WordPressPost>> => {
  const map = new Map<number, WordPressPost>();
  const posts = await convertPosts();
  posts.forEach((post) => map.set(post.id, post));
  return map;
};

const filterBySearch = (posts: WordPressPost[], query?: string): WordPressPost[] => {
  if (!query) return posts;
  const normalized = query.toLowerCase();
  return posts.filter((post) => {
    const title = post.title.rendered.toLowerCase();
    const excerpt = stripMarkdown(post.excerpt.rendered).toLowerCase();
    const content = stripMarkdown(post.content.rendered).toLowerCase();
    return title.includes(normalized) || excerpt.includes(normalized) || content.includes(normalized);
  });
};

const filterByCategory = (posts: WordPressPost[], categoryId?: number): WordPressPost[] => {
  if (!categoryId) return posts;
  return posts.filter((post) => {
    const terms = post._embedded?.['wp:term'] ?? [];
    return terms[0]?.some((category) => category.id === categoryId);
  });
};

const filterByTag = (posts: WordPressPost[], tagId?: number): WordPressPost[] => {
  if (!tagId) return posts;
  return posts.filter((post) => {
    const terms = post._embedded?.['wp:term'] ?? [];
    return terms
      .slice(1)
      .flat()
      .some((term) => term.id === tagId);
  });
};

export const isLocalPostId = (id: number): boolean => id >= LOCAL_POST_ID_OFFSET;
export const isLocalCategoryId = (id: number): boolean => id >= LOCAL_CATEGORY_ID_OFFSET;
export const isLocalTagId = (id: number): boolean => id >= LOCAL_TAG_ID_OFFSET;

export const getLocalPosts = async (): Promise<WordPressPost[]> => convertPosts();

export const getLocalPostBySlug = async (slug: string): Promise<WordPressPost | null> => {
  const posts = await convertPosts();
  return posts.find((post) => post.slug === slug) ?? null;
};

export const getLocalPostById = async (id: number): Promise<WordPressPost | null> => {
  const map = await getLocalPostsMap();
  return map.get(id) ?? null;
};

export const filterLocalPosts = async (options: {
  search?: string;
  categoryId?: number;
  tagId?: number;
} = {}): Promise<WordPressPost[]> => {
  let posts = await convertPosts();
  posts = filterBySearch(posts, options.search);
  posts = filterByCategory(posts, options.categoryId);
  posts = filterByTag(posts, options.tagId);
  return posts;
};

const aggregateTaxonomy = async (
  selector: (post: WordPressPost) => WordPressCategory[],
  fallbackTaxonomy: 'category' | 'post_tag',
): Promise<WordPressCategory[]> => {
  const counts = new Map<number, WordPressCategory & { count: number }>();
  const posts = await convertPosts();

  posts.forEach((post) => {
    const taxonomies = selector(post);
    taxonomies.forEach((term) => {
      const existing = counts.get(term.id);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(term.id, {
          ...term,
          taxonomy: term.taxonomy || fallbackTaxonomy,
          count: 1,
        });
      }
    });
  });

  return Array.from(counts.values()).sort((a, b) => b.count - a.count);
};

export const getLocalCategories = async (): Promise<WordPressCategory[]> =>
  aggregateTaxonomy(
    (post) => post._embedded?.['wp:term']?.[0] ?? [],
    'category',
  );

export const getLocalCategoryBySlug = async (slug: string): Promise<WordPressCategory | null> => {
  const categories = await getLocalCategories();
  return categories.find((category) => category.slug === slug) ?? null;
};

export const getLocalTags = async (): Promise<WordPressTag[]> => {
  const categories = await aggregateTaxonomy(
    (post) => {
      const terms = post._embedded?.['wp:term'] ?? [];
      return terms.length > 1 ? terms[1] : [];
    },
    'post_tag',
  );

  return categories.map<WordPressTag>((term) => ({
    id: term.id,
    name: term.name,
    slug: term.slug,
    count: term.count,
  }));
};

export const getLocalTagBySlug = async (slug: string): Promise<WordPressTag | null> => {
  const tags = await getLocalTags();
  return tags.find((tag) => tag.slug === slug) ?? null;
};

export const clearLocalCache = (): void => {
  cached.posts = null;
};
