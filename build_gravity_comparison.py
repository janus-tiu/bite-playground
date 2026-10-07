"""Compare the preserved original gravity intro with the current continuous intro."""
import base64


def build_gravity_comparison(root):
    source = root / 'source'
    dist = root / 'dist'
    current = (dist / 'index.html').read_text()
    original = (source / 'gravity-original-document.html').read_text()
    preview_css = (source / 'gravity-preview.css').read_text()
    preview_js = (source / 'gravity-preview.js').read_text()
    for key, document, end in [('original', original, 1400), ('assemble', current, 1150)]:
        document = document.replace('</head>', '<style>' + preview_css + '</style></head>', 1)
        document = document.replace('</body>', '<script>' + preview_js.replace('__END_TIME__', str(end)) + '</script></body>', 1)
        (dist / ('gravity-' + key + '.html')).write_text(document)

    def uri(path, mime):
        return 'data:' + mime + ';base64,' + base64.b64encode(path.read_bytes()).decode()

    icon = uri(dist / 'assets/bite-playground-icon.png', 'image/png')
    font = uri(dist / 'assets/figtree-latin.woff2', 'font/woff2')
    css = "@font-face{font-family:'Figtree';font-style:normal;font-weight:300 900;font-display:swap;src:url(" + font + ") format('woff2')}"
    css += (source / 'playground.css').read_text() + (source / 'library.css').read_text() + (source / 'gravity-comparison.css').read_text()
    before = (source / 'shell-before.html').read_text().replace('Version 01</span>', '2 versions</span>')
    toolbar = '<div class="gc-toolbar"><p>Compare the original fall-and-reveal transition with the new direct-to-banner intro.</p><button type="button" class="gc-replay" disabled>Replay both</button></div>'
    variants = []
    for key, label, title, description in [
        ('original', 'Original', 'Fall & reveal', 'Shapes fall, bounce, and clear before the banner assembles.'),
        ('assemble', 'New', 'Direct to banner', 'Shapes land in the banner while the homepage appears.')
    ]:
        variants.append(f'<article class="gc-variant" aria-labelledby="gc-{key}-title"><header class="gc-variant-header"><span class="gc-label">{label}</span><h2 id="gc-{key}-title">{title}</h2><p>{description}</p></header><iframe class="gc-preview" data-src="/gravity-{key}.html" title="{title} — interactive prototype"></iframe></article>')
    notes = (source / 'gravity-notes.html').read_text().replace('#bite-gravity-study', '#gravity-comparison-notes')
    reference = '<section class="gc-reference" aria-label="Developer reference"><h3>Developer reference</h3><a href="https://www.fancycomponents.dev/docs/components/physics/gravity" target="_blank" rel="noopener noreferrer">Gravity · Fancy Components</a><p><strong>Original:</strong> Matter.js gravity and collisions, a 1.4-second fall-and-reveal transition, then banner assembly.</p><p><strong>Direct to banner:</strong> Web Animations API, 1.15-second entry, 110 ms stagger, then gentle floating. Homepage content appears within 180 ms.</p></section>'
    body = before + toolbar + '<div class="gc-comparison">' + ''.join(variants) + '</div><div class="gc-support"><div id="gravity-comparison-notes">' + notes + '</div>' + reference + '</div>' + (source / 'shell-after.html').read_text()
    body = body.replace('__PLAYGROUND_ICON_DATA_URI__', icon)
    page = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gravity transition · Bite Playground</title><meta name="description" content="Compare two Bite gravity transitions: the original fall and reveal, and direct assembly into the banner."><link rel="icon" type="image/png" href="' + icon + '"><style>' + css + '</style></head><body>' + body + '<script>' + (source / 'gravity-comparison.js').read_text() + '</script></body></html>'
    (dist / 'index.html').write_text('\n'.join(line.rstrip() for line in page.splitlines()) + '\n')
    print('Gravity comparison exported with independently controlled original and new previews.')
