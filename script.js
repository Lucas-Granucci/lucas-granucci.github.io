const projectsContainer = document.getElementById('projects-content');
const writingContainer = document.getElementById('writing-content');

async function fetchJSON(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error(`Expected a list in ${path}`);
    return data;
}

function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function showError(container, message, retry) {
    const button = element('button', 'retry-button', 'Try again');
    button.type = 'button';
    button.addEventListener('click', async () => {
        await retry();
        // Keep keyboard focus in this region when its retry button is replaced.
        const next = container.querySelector('a, button');
        if (next) next.focus({ preventScroll: true });
        else {
            container.tabIndex = -1;
            container.focus({ preventScroll: true });
        }
    });
    container.replaceChildren(element('p', '', message), button);
}

function createEntry(date, title, href, description) {
    const card = element('li', 'card');
    const info = element('div', 'card-info');
    const link = element(href ? 'a' : 'span', 'entry-title', title);
    if (href) link.href = href;
    info.append(link);
    if (description) info.append(element('p', '', description));
    card.append(element('div', 'card-date', date), info);
    return card;
}

async function renderEntries(container, path, label, createCard) {
    container.setAttribute('aria-busy', 'true');
    container.replaceChildren(element('p', '', `Loading ${label}…`));
    try {
        const entries = await fetchJSON(path);
        if (label === 'writing') entries.sort((a, b) => writingDate(b) - writingDate(a));
        const limit = Number(container.dataset.limit) || entries.length;
        const list = element('ul', 'entries');
        for (const entry of entries.slice(0, limit)) list.append(createCard(entry));
        container.replaceChildren(entries.length ? list : element('p', '', `No ${label} yet. Check back soon.`));
    } catch (error) {
        console.error(`Error loading ${label}:`, error);
        showError(container, `${label === 'projects' ? 'Projects' : 'Writing'} could not be loaded. Please try again.`,
            () => renderEntries(container, path, label, createCard));
    } finally {
        container.removeAttribute('aria-busy');
    }
}

function projectCard(project) {
    if (typeof project.name !== 'string' || typeof project.desc !== 'string' || !project.year) {
        throw new Error('Incomplete project entry');
    }
    function externalLink(href, label, className) {
        const url = new URL(href);
        if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Invalid project URL');
        const link = element('a', className);
        link.href = url.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label', `${project.name}: ${label} (opens in a new tab)`);
        return link;
    }

    const card = createEntry(project.year, project.name, null, project.desc);
    const info = card.querySelector('.card-info');
    const title = info.querySelector('.entry-title');
    const heading = element('div', 'project-heading');
    if (project.demo) {
        const link = externalLink(project.demo, 'Live demo', 'entry-title');
        link.textContent = project.name;
        heading.append(link);
    } else {
        heading.append(title);
    }
    if (project.github) {
        const link = externalLink(project.github, 'GitHub', 'project-github');
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '18');
        svg.setAttribute('height', '18');
        svg.setAttribute('fill', 'currentColor');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M12 .297C5.37.297 0 5.67 0 12.297c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.043-1.61-4.043-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.334-5.466-5.93 0-1.31.467-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12');
        svg.append(path);
        link.append(svg);
        heading.append(link);
    }
    if (title.parentNode === info) title.remove();
    info.prepend(heading);
    return card;
}

function writingDate(post) {
    // Prefer an explicit date, then the dated filename, then the display date.
    const date = post.published || post.fileName?.match(/^\d{4}-\d{2}-\d{2}/)?.[0] || post.date;
    return Date.parse(date) || 0;
}

function validateWriting(post) {
    if (typeof post.title !== 'string' || typeof post.date !== 'string' ||
        typeof post.fileName !== 'string' || !/^[\w-]+\.md$/.test(post.fileName)) {
        throw new Error('Invalid writing entry');
    }
    return post;
}

function writingCard(post) {
    validateWriting(post);
    return createEntry(post.date, post.title, `article.html?post=${encodeURIComponent(post.fileName)}`);
}

function setArticleMetadata(title, description) {
    document.title = `${title} — Lucas Granucci`;
    document.querySelector('meta[property="og:title"]').content = document.title;
    if (description) {
        document.querySelector('meta[name="description"]').content = description;
        document.querySelector('meta[property="og:description"]').content = description;
    }
}

async function renderDocument() {
    const title = document.getElementById('article-title');
    const content = document.getElementById('article-content');
    content.setAttribute('aria-busy', 'true');
    content.replaceChildren(element('p', '', 'Loading post…'));
    try {
        const filename = new URLSearchParams(window.location.search).get('post');
        const writings = await fetchJSON('writing.json');
        const writing = writings.find(post => post.fileName === filename);
        if (!writing) {
            title.textContent = 'Post not found';
            setArticleMetadata('Post not found');
            content.textContent = 'This link does not match a published post. Return to Writing to browse the available posts.';
            return;
        }
        validateWriting(writing);
        title.textContent = writing.title;
        setArticleMetadata(writing.title);
        document.getElementById('article-date').textContent = writing.date;
        const response = await fetch(`writing/${encodeURIComponent(writing.fileName)}`);
        if (!response.ok) throw new Error(`Failed to load post: ${response.status}`);
        const markdown = await response.text();
        // Sanitize generated HTML before inserting it into the reading page.
        content.innerHTML = DOMPurify.sanitize(marked.parse(markdown), {
            USE_PROFILES: { html: true },
            FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select'],
            FORBID_ATTR: ['style'],
            SANITIZE_NAMED_PROPS: true
        });
        // Resolve relative images and links alongside the Markdown source file.
        content.querySelectorAll('[src], a[href]').forEach(node => {
            const attribute = node.hasAttribute('src') ? 'src' : 'href';
            const value = node.getAttribute(attribute);
            if (attribute === 'href' && value?.startsWith('#')) {
                // DOMPurify prefixes authored IDs to keep them separate from page controls.
                node.setAttribute(attribute, `#user-content-${value.slice(1)}`);
            } else if (value) {
                node.setAttribute(attribute, new URL(value, new URL('writing/', location.href)).href);
            }
        });
        setArticleMetadata(writing.title, content.textContent.trim().replace(/\s+/g, ' ').slice(0, 160));
    } catch (error) {
        console.error('Error loading post:', error);
        if (title.textContent === 'Loading post…') {
            title.textContent = 'Unable to load post';
            setArticleMetadata('Unable to load post');
        }
        const retry = typeof marked === 'undefined' || typeof DOMPurify === 'undefined'
            ? () => location.reload()
            : renderDocument;
        showError(content, 'This post could not be loaded. Please try again, or return to Writing.', retry);
    } finally {
        content.removeAttribute('aria-busy');
    }
}

function setupNavigation() {
    const bar = document.querySelector('.bar');
    const sections = [...document.querySelectorAll('.container > section')];
    const links = document.querySelectorAll('.bar nav a');
    let scheduled = false;

    // Opt in only for links activated within this document, never on arrival.
    document.addEventListener('click', event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
            event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;
        document.documentElement.classList.toggle('smooth-navigation', link.hash !== '#main');
    });
    const resetScrollBehavior = () => document.documentElement.classList.remove('smooth-navigation');
    window.addEventListener('pagehide', resetScrollBehavior);
    window.addEventListener('pageshow', resetScrollBehavior);

    function update() {
        scheduled = false;
        if (!sections.length) return;
        // Use a viewport position so even sections taller than the screen can be active.
        const marker = Math.max(bar.offsetHeight + 24, innerHeight * 0.4);
        let current = sections[0];
        for (const section of sections) {
            if (section.getBoundingClientRect().top <= marker) current = section;
        }
        const onCover = current.id === 'top';
        if (onCover && bar.contains(document.activeElement)) {
            document.getElementById('intro-title').focus({ preventScroll: true });
        }
        bar.inert = onCover;
        document.body.classList.toggle('oncover', onCover);
        links.forEach(link => {
            if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    }
    function scheduleUpdate() {
        if (!scheduled) {
            scheduled = true;
            requestAnimationFrame(update);
        }
    }
    const resizeObserver = new ResizeObserver(() => {
        document.documentElement.style.setProperty('--header-height', `${bar.offsetHeight}px`);
        scheduleUpdate();
    });
    resizeObserver.observe(bar);
    sections.forEach(section => resizeObserver.observe(section));
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('hashchange', scheduleUpdate);
    window.addEventListener('pageshow', scheduleUpdate);
    update();
}

setupNavigation();
if (document.getElementById('article-content')) renderDocument();
if (projectsContainer) renderEntries(projectsContainer, 'projects.json', 'projects', projectCard);
if (writingContainer) renderEntries(writingContainer, 'writing.json', 'writing', writingCard);
