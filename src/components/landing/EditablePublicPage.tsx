import { Fragment, type ReactNode } from "react";
import { PublicPage } from "@/components/landing/PublicPage";
import {
  defaultBlogPosts,
  getPublicPageDefaults,
  getPublicPageStatus,
  parseBlogPosts,
  serializeBlogPosts,
} from "@/components/landing/publicContent";
import { usePublicContent } from "@/lib/siteContent";

export function EditablePublicPage({ pageKey }: { pageKey: string }) {
  const page = getPublicPageDefaults(pageKey);
  const content = usePublicContent(`page_${page.key}`, page.defaults);
  const status = getPublicPageStatus(content);

  if (status !== "published") {
    return (
      <PublicPage
        title={status === "archived" ? "Página arquivada" : "Página indisponível"}
        subtitle="Este conteúdo foi retirado da publicação pelo CMS da página pública."
      >
        <p>Volte para a página inicial ou acesse outra área pública da Seravie Heritage.</p>
      </PublicPage>
    );
  }

  return (
    <PublicPage title={content.title} subtitle={content.subtitle}>
      <RichText body={content.body} />
    </PublicPage>
  );
}

export function BlogPublicPage() {
  const content = usePublicContent("blog_posts", {
    posts: serializeBlogPosts(defaultBlogPosts),
  });
  const posts = parseBlogPosts(content.posts).filter((post) => post.published);

  return (
    <PublicPage title="Blog" subtitle="Conteúdos e atualizações da Seravie Heritage.">
      {posts.length ? (
        posts.map((post) => (
          <article key={post.id} className="border-b border-glass-border pb-6 last:border-0">
            <div className="text-xs text-muted-foreground">{post.date}</div>
            <h2 className="!mt-1">{post.title}</h2>
            {post.excerpt && <p className="font-medium text-foreground">{post.excerpt}</p>}
            <RichText body={post.body} />
          </article>
        ))
      ) : (
        <p>Nenhum post publicado ainda.</p>
      )}
    </PublicPage>
  );
}

function RichText({ body }: { body: string }) {
  const blocks = parseBlocks(body);
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "heading") return <h2 key={index}>{renderInline(block.text)}</h2>;
        if (block.type === "list") {
          return (
            <ul key={index}>
              {block.items.map((item) => (
                <li key={item}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        return <p key={index}>{renderInline(block.text)}</p>;
      })}
    </>
  );
}

type TextBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

function parseBlocks(body: string): TextBlock[] {
  const lines = body.split(/\r?\n/);
  const blocks: TextBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    blocks.push({ type: "list", items: list });
    list = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", text: line.slice(3).trim() });
      continue;
    }
    if (line.startsWith("- ")) {
      flushParagraph();
      list.push(line.slice(2).trim());
      continue;
    }
    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return blocks;
}

function renderInline(text: string) {
  const parts: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const [, label, href] = match;
    parts.push(
      <a
        key={`${href}-${match.index}`}
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer" : undefined}
      >
        {label}
      </a>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.map((part, index) => <Fragment key={index}>{part}</Fragment>);
}
