import { readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';

hljs.registerLanguage('bash', bash);
const bashLanguages = new Set(['shell', 'shellscript', 'sh', 'bash']);

const root = resolve(process.cwd());
const blogDir = resolve(root, 'blog');
const entries = await readdir(blogDir, { withFileTypes: true });
const misplacedEntries = entries.filter((entry) => !entry.isDirectory());
if (misplacedEntries.length) {
  throw new Error(
    `blog/: entries must be slug directories containing en.md and de.md; found ${misplacedEntries
      .map((entry) => entry.name)
      .join(', ')}`,
  );
}
const slugDirectories = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

function parseFrontMatter(source, filename, expectedSlug) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`${filename}: front matter is required`);
  const values = Object.fromEntries(
    match[1].split('\n').flatMap((line) => {
      const separator = line.indexOf(':');
      if (separator < 0) return [];
      return [[line.slice(0, separator).trim(), line.slice(separator + 1).trim()]];
    }),
  );
  for (const key of ['slug', 'title', 'description', 'date', 'draft']) {
    if (!values[key]) throw new Error(`${filename}: missing front matter field ${key}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date) || !['true', 'false'].includes(values.draft)) {
    throw new Error(`${filename}: date must be YYYY-MM-DD and draft must be true or false`);
  }
  const locale = basename(filename, '.md');
  if (!['en', 'de'].includes(locale) || values.slug !== expectedSlug) {
    throw new Error(
      `${filename}: slug must match the parent directory and locale must be en or de`,
    );
  }
  return { ...values, draft: values.draft === 'true', locale, body: match[2].trim() };
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
function inline(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" rel="noreferrer">$1</a>');
}
function renderCodeBlock(lines, language) {
  const source = lines.join('\n');
  const code = bashLanguages.has(language.toLowerCase())
    ? hljs.highlight(source, { language: 'bash' }).value
    : escapeHtml(source);
  return `<pre class="code-block"><code class="hljs language-${escapeHtml(language)}">${code}</code></pre>`;
}
function renderMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const output = [];
  let paragraph = [];
  let list = false;
  let code = false;
  let language = '';
  let codeLines = [];
  const flushParagraph = () => {
    if (paragraph.length) output.push(`<p>${inline(paragraph.join(' '))}</p>`);
    paragraph = [];
  };
  const closeList = () => {
    if (list) {
      output.push('</ul>');
      list = false;
    }
  };
  for (const line of lines) {
    if (line.startsWith('```')) {
      if (code) {
        output.push(renderCodeBlock(codeLines, language));
        code = false;
        codeLines = [];
      } else {
        flushParagraph();
        closeList();
        code = true;
        language = line.slice(3).trim() || 'text';
      }
      continue;
    }
    if (code) {
      codeLines.push(line);
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    const item = line.match(/^[-*]\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length;
      output.push(`<h${level}>${inline(heading[2])}</h${level}>`);
    } else if (item) {
      flushParagraph();
      if (!list) {
        output.push('<ul>');
        list = true;
      }
      output.push(`<li>${inline(item[1])}</li>`);
    } else if (!line.trim()) {
      flushParagraph();
      closeList();
    } else paragraph.push(line.trim());
  }
  flushParagraph();
  closeList();
  if (code) throw new Error('Unclosed code fence');
  return output.join('');
}

const posts = [];
for (const slug of slugDirectories) {
  const slugDirectory = resolve(blogDir, slug);
  const sourceEntries = await readdir(slugDirectory, { withFileTypes: true });
  const unexpectedEntries = sourceEntries.filter(
    (entry) => !entry.isFile() || !['en.md', 'de.md'].includes(entry.name),
  );
  if (unexpectedEntries.length) {
    throw new Error(
      `${slug}: directory must contain only en.md and de.md; found ${unexpectedEntries
        .map((entry) => entry.name)
        .join(', ')}`,
    );
  }

  for (const locale of ['en', 'de']) {
    const file = `${slug}/${locale}.md`;
    let source;
    try {
      source = await readFile(resolve(slugDirectory, `${locale}.md`), 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') throw new Error(`${file}: required locale file is missing`);
      throw error;
    }
    const post = parseFrontMatter(source, file, slug);
    if (!post.draft) posts.push({ ...post, html: renderMarkdown(post.body) });
  }
}
const slugs = new Set(posts.map((post) => post.slug));
for (const slug of slugs)
  if (
    !posts.some((post) => post.slug === slug && post.locale === 'en') ||
    !posts.some((post) => post.slug === slug && post.locale === 'de')
  )
    throw new Error(`Missing language pair for ${slug}`);
posts.sort((a, b) => b.date.localeCompare(a.date));
const output = `// Generated by scripts/generate-blog.mjs. Edit the paired files in blog/ instead.\nexport interface BlogPost { slug: string; locale: 'en' | 'de'; title: string; description: string; date: string; draft: boolean; body: string; html: string; }\nexport const BLOG_POSTS: BlogPost[] = ${JSON.stringify(posts)};\n`;
await writeFile(resolve(root, 'src/app/core/data/blog-data.ts'), output);
console.log(`Generated ${posts.length} published blog entries.`);
