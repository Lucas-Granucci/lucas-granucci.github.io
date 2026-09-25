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
    const url = project.url ? new URL(project.url) : null;
    if (url && !['https:', 'http:'].includes(url.protocol)) throw new Error('Invalid project URL');
    const card = createEntry(project.year, project.name, url?.href, project.desc);
    const link = card.querySelector('a');
    if (link) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label', `${project.name} (opens in a new tab)`);
    }
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
