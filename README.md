# Lucas Granucci — personal site

A static site built with HTML, CSS, and JavaScript. No build step is required.

## Local preview

Run `python3 -m http.server 8000` from this directory, then open
`http://localhost:8000`. Use a web server rather than opening HTML files directly:
the site fetches its JSON indexes and Markdown posts.

## Content

- Edit `projects.json` to add or update projects. Each entry has a `name`, a
  `desc`, a `year`, and optional HTTP(S) `github` and `demo` URLs. Set either link
  to `null` or omit it when unavailable. The title links to the live demo,
  with a GitHub icon at the right of the title row when available. JSON order controls project order;
  put featured projects first. Project links open in a new tab.
- Edit `writing.json` to list posts. Each
  entry has a `title`, a display `date`, and a `fileName` matching a Markdown file
  in `writing/`. Filenames may contain letters, numbers, underscores, and hyphens.
  Posts are sorted newest first using an optional ISO `published` date
  (`2026-09-25`), then the date in the filename, then the display date.
- The homepage shows up to five projects and five posts. Change the `data-limit`
  values in `index.html` to adjust those counts. `projects.html` and `writing.html`
  show the complete lists with normal scrolling.
- Share posts using `article.html?post=2026-09-24.md`. Keep published filenames
  stable so links continue to work.
- Write images and relative links relative to the Markdown file. Use `##` for
  article subheadings; the page supplies the title.

## Dependencies and metadata

Fonts load from Google Fonts. Articles use pinned CDN versions of Marked
(18.0.14) and DOMPurify (3.4.16). Update the version URLs in `article.html`
intentionally and recheck rendering. Markdown output is sanitized before it is
inserted into the page; executable HTML and custom inline styles are excluded.

All pages include default descriptions and Open Graph metadata. Article titles
and descriptions update in the browser. Social crawlers that do not execute
JavaScript will see the default writing metadata. Unique per-post previews would
require generating a separate HTML page for each post. Add canonical URLs once
the final public domain is established.

## Verification

Check the homepage and an article at 320, 390, 768, and 1440px widths. Verify
section links, direct article URLs, browser back/forward, keyboard focus, reduced
motion, and long content. Failed JSON or Markdown requests should offer a working
retry; empty indexes should show an explanatory message.
