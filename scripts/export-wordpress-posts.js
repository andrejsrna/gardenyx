#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs/promises');
const path = require('path');
const { decode } = require('html-entities');
const cheerio = require('cheerio');

const CONTENT_DIR = path.join(process.cwd(), 'content', 'posts');
const DEFAULT_WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://admin.najsilnejsiaklbovavyziva.sk';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://najsilnejsiaklbovavyziva.sk';
const POSTS_PER_PAGE = 100;

const args = process.argv.slice(2);
const overwrite = args.includes('--overwrite');

function log(message, ...rest) {
  console.log(`[export-wp-posts] ${message}`, ...rest);
}

function warn(message, ...rest) {
  console.warn(`[export-wp-posts] ${message}`, ...rest);
}

function error(message, ...rest) {
  console.error(`[export-wp-posts] ${message}`, ...rest);
}

function sanitizeText(input = '') {
  return input.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function htmlToPlainText(html = '') {
  const $ = cheerio.load(`<body>${html}</body>`);
  return sanitizeText($('body').text() || '');
}

function escapeYaml(value) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function splitArgs(argsString) {
  if (!argsString) return [];
  return argsString
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function convertHtmlNode(node, state = {}) {
  if (!node) return '';
  if (node.type === 'text') {
    return node.data || '';
  }

  if (node.type === 'comment') {
    return '';
  }

  if (node.type === 'tag') {
    const name = node.name.toLowerCase();
    const children = node.children || [];

    const convertChildren = (nextState = state) =>
      children.map((child, index) => convertHtmlNode(child, { ...nextState, childIndex: index })).join('');

    switch (name) {
      case 'p': {
        const content = convertChildren(state).trim();
        return content ? `${content}\n\n` : '';
      }
      case 'br':
        return '  \n';
      case 'strong':
      case 'b': {
        const content = convertChildren(state).trim();
        return content ? `**${content}**` : '';
      }
      case 'em':
      case 'i': {
        const content = convertChildren(state).trim();
        return content ? `*${content}*` : '';
      }
      case 'code': {
        const content = convertChildren(state).trim();
        return content ? `\`${content}\`` : '';
      }
      case 'pre': {
        const content = convertChildren(state);
        const clean = content.replace(/^\n+|\n+$/g, '');
        return `\n\n\`\`\`\n${clean}\n\`\`\`\n\n`;
      }
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6': {
        const levels = { h2: '##', h3: '###', h4: '####', h5: '#####', h6: '######' };
        const header = levels[name] || '##';
        const content = convertChildren(state).trim();
        return content ? `${header} ${content}\n\n` : '';
      }
      case 'a': {
        const href = node.attribs?.href || '';
        const content = convertChildren(state).trim() || href;
        if (!href) {
          return content;
        }
        return `[${content}](${href})`;
      }
      case 'ul': {
        const items = children.filter((child) => child.type === 'tag' && child.name === 'li');
        return items.map((item) => convertHtmlNode(item, { ...state, listType: 'ul' })).join('') + '\n';
      }
      case 'ol': {
        const items = children.filter((child) => child.type === 'tag' && child.name === 'li');
        return items
          .map((item, index) => convertHtmlNode(item, { ...state, listType: 'ol', itemIndex: index + 1 }))
          .join('') + '\n';
      }
      case 'li': {
        const content = convertChildren({ ...state, listType: undefined }).trim();
        if (!content) return '';
        const lines = content.split(/\n+/).filter(Boolean);
        const bullet = state.listType === 'ol' ? `${state.itemIndex}. ` : '- ';
        const [firstLine, ...rest] = lines;
        let result = `${bullet}${firstLine}`;
        if (rest.length > 0) {
          result += '\n' + rest.map((line) => `  ${line}`).join('\n');
        }
        return `${result}\n`;
      }
      case 'blockquote': {
        const content = convertChildren(state).trim();
        if (!content) return '';
        return (
          content
            .split('\n')
            .map((line) => (line ? `> ${line}` : '>'))
            .join('\n') + '\n\n'
        );
      }
      case 'img': {
        const src = node.attribs?.src || node.attribs?.['data-src'] || '';
        if (!src) return '';
        const alt = node.attribs?.alt || '';
        return `![${alt}](${src})\n\n`;
      }
      case 'hr':
        return '\n---\n\n';
      case 'figure':
      case 'div':
      case 'section':
      case 'article':
      case 'span':
      case 'body':
      case 'main':
      case 'header':
      case 'footer':
        return convertChildren(state);
      case 'table': {
        const tableRows = [];
        children.forEach((child) => {
          if (child.type === 'tag' && child.name === 'tr') {
            tableRows.push(child);
          }
          if (child.children) {
            child.children.forEach((grand) => {
              if (grand.type === 'tag' && grand.name === 'tr') {
                tableRows.push(grand);
              }
            });
          }
        });

        if (tableRows.length === 0) return '';

        const rows = tableRows
          .map((row, rowIndex) => {
            const cells = row.children.filter((cell) => cell.type === 'tag' && (cell.name === 'td' || cell.name === 'th'));
            const cellTexts = cells.map((cell) => convertHtmlNode(cell, state).trim().replace(/\|/g, '\\|'));
            if (rowIndex === 0) {
              return `${cellTexts.join(' | ')}\n${cellTexts.map(() => '---').join(' | ')}`;
            }
            return cellTexts.join(' | ');
          })
          .join('\n');

        return `\n${rows}\n\n`;
      }
      default:
        return convertChildren(state);
    }
  }

  return '';
}

function convertHtmlToMarkdown(html = '') {
  const $ = cheerio.load(`<body>${html}</body>`, { decodeEntities: true });
  const body = $('body')[0];
  if (!body) return '';

  let markdown = convertHtmlNode(body, {});
  markdown = decode(markdown);
  markdown = markdown.replace(/\u00a0/g, ' ');
  markdown = markdown.replace(/[ \t]+\n/g, '\n');
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  return markdown.trim();
}

function serializeFrontmatter(frontmatter) {
  const lines = ['---'];
  lines.push(`title: "${escapeYaml(frontmatter.title)}"`);
  lines.push(`slug: "${escapeYaml(frontmatter.slug)}"`);
  lines.push(`date: "${frontmatter.date}"`);
  if (frontmatter.updated) {
    lines.push(`updated: "${frontmatter.updated}"`);
  }
  if (frontmatter.excerpt) {
    lines.push(`excerpt: "${escapeYaml(frontmatter.excerpt)}"`);
  }
  if (frontmatter.author) {
    lines.push(`author: "${escapeYaml(frontmatter.author)}"`);
  }
  if (frontmatter.coverImage) {
    lines.push(`coverImage: "${frontmatter.coverImage}"`);
  }
  if (frontmatter.tags && frontmatter.tags.length > 0) {
    lines.push('tags:');
    frontmatter.tags.forEach((tag) => lines.push(`  - "${escapeYaml(tag)}"`));
  } else {
    lines.push('tags: []');
  }
  if (frontmatter.categories && frontmatter.categories.length > 0) {
    lines.push('categories:');
    frontmatter.categories.forEach((category) => lines.push(`  - "${escapeYaml(category)}"`));
  } else {
    lines.push('categories: []');
  }
  if (frontmatter.seoTitle) {
    lines.push(`seoTitle: "${escapeYaml(frontmatter.seoTitle)}"`);
  }
  if (frontmatter.seoDescription) {
    lines.push(`seoDescription: "${escapeYaml(frontmatter.seoDescription)}"`);
  }
  if (frontmatter.seoImage) {
    lines.push(`seoImage: "${frontmatter.seoImage}"`);
  }
  if (frontmatter.canonicalUrl) {
    lines.push(`canonicalUrl: "${frontmatter.canonicalUrl}"`);
  }
  lines.push('---');
  return lines.join('\n');
}

async function writeMarkdownFile(slug, frontmatter, markdown, overwriteExisting = false) {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  try {
    await fs.mkdir(CONTENT_DIR, { recursive: true });
    if (!overwriteExisting) {
      try {
        await fs.access(filePath);
        warn(`Skipping existing file: ${filePath}`);
        return;
      } catch {
        // file does not exist
      }
    }
    const fm = serializeFrontmatter(frontmatter);
    const output = `${fm}\n\n${markdown}\n`;
    await fs.writeFile(filePath, output, 'utf8');
    log(`Saved post: ${filePath}`);
  } catch (err) {
    error(`Failed to write file for slug "${slug}":`, err);
  }
}

function buildCanonicalUrl(slug) {
  if (!slug) return undefined;
  return `${SITE_URL.replace(/\/+$/, '')}/${slug}`;
}

function normalizeExcerpt(rawExcerpt, fallbackText) {
  const excerpt = sanitizeText(rawExcerpt || fallbackText || '');
  if (!excerpt) return '';
  return excerpt.replace(/\[\.\.\.\]$/, '').trim();
}

function collectTaxonomyNames(terms) {
  if (!Array.isArray(terms)) return [];
  return terms
    .map((term) => (term?.name ? decode(term.name) : ''))
    .filter(Boolean);
}

async function fetchWordPressPosts(wordpressUrl) {
  let allPosts = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const query = new URLSearchParams({
      per_page: POSTS_PER_PAGE.toString(),
      page: page.toString(),
      status: 'publish',
      _embed: '1',
      order: 'desc',
      orderby: 'date',
    });

    const endpoint = `${wordpressUrl.replace(/\/+$/, '')}/wp-json/wp/v2/posts?${query.toString()}`;
    log(`Fetching page ${page} (${endpoint})`);
    const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });

    if (!response.ok) {
      throw new Error(`Failed to fetch posts (status ${response.status})`);
    }

    const posts = await response.json();
    const totalHeader = response.headers.get('X-WP-TotalPages') || response.headers.get('x-wp-totalpages');
    totalPages = totalHeader ? Number(totalHeader) : totalPages;

    if (!Array.isArray(posts) || posts.length === 0) {
      break;
    }

    allPosts = allPosts.concat(posts);
    page += 1;
  }

  return allPosts;
}

async function convertPost(post) {
  const slug = post.slug;
  if (!slug) {
    warn(`Skipping post without slug (ID ${post.id})`);
    return null;
  }

  const contentHtml = post.content?.rendered || '';
  const markdown = convertHtmlToMarkdown(contentHtml);
  if (!markdown) {
    warn(`Post "${slug}" has empty content. Skipping.`);
    return null;
  }

  const date = post.date ? post.date.split('T')[0] : '';
  const updated = post.modified ? post.modified.split('T')[0] : undefined;
  const title = sanitizeText(decode(post.title?.rendered || slug));
  const excerptHtml = post.excerpt?.rendered || '';
  const excerptText = normalizeExcerpt(htmlToPlainText(excerptHtml), htmlToPlainText(contentHtml).slice(0, 200));
  const authorName = decode(post._embedded?.author?.[0]?.name || 'Náš tím');
  const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
  const coverImage = featuredMedia?.source_url || undefined;

  const taxonomy = post._embedded?.['wp:term'] || [];
  const categories = collectTaxonomyNames(taxonomy[0]);
  const tags = collectTaxonomyNames(taxonomy[1]);

  const frontmatter = {
    title,
    slug,
    date,
    updated,
    excerpt: excerptText,
    author: authorName,
    coverImage,
    tags,
    categories,
    seoTitle: title,
    seoDescription: excerptText,
    seoImage: coverImage,
    canonicalUrl: buildCanonicalUrl(slug),
  };

  return { slug, frontmatter, markdown };
}

async function main() {
  const wordpressUrl = args.find((arg) => arg.startsWith('--wp-url='))?.split('=')[1] || DEFAULT_WORDPRESS_URL;

  log(`Starting export from ${wordpressUrl}`);
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    warn(
      `NEXT_PUBLIC_SITE_URL is not set. Using default "${SITE_URL}". Frontmatter canonicalUrl will reflect this value.`,
    );
  }

  try {
    const posts = await fetchWordPressPosts(wordpressUrl);
    if (posts.length === 0) {
      warn('No posts retrieved from WordPress.');
      return;
    }

    log(`Fetched ${posts.length} posts. Converting to markdown...`);

    for (const post of posts) {
      try {
        const converted = await convertPost(post);
        if (!converted) continue;
        await writeMarkdownFile(converted.slug, converted.frontmatter, converted.markdown, overwrite);
      } catch (err) {
        error(`Failed to convert post ID ${post.id}`, err);
      }
    }

    log('Export finished.');
  } catch (err) {
    error('Export failed:', err);
    process.exitCode = 1;
  }
}

main();
