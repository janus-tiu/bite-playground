"""Assemble the editable prototype and export the self-contained Site."""
from pathlib import Path
import base64
import json

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / 'source'
ASSETS = ROOT / 'dist' / 'assets'
logo_uri = 'data:image/svg+xml;base64,' + base64.b64encode((ASSETS / 'bite-nav.svg').read_bytes()).decode()
playground_icon_uri = 'data:image/png;base64,' + base64.b64encode((ASSETS / 'bite-playground-icon.png').read_bytes()).decode()

fragment = (SOURCE / 'gravity-transition.html').read_text()
fragment = fragment.replace('__BITE_HOME_CONTENT__', (SOURCE / 'bite-home.html').read_text().replace('__BITE_STACK_BANNER__', (SOURCE / 'stack-banner.html').read_text()))
fragment = fragment.replace(
    '<div class="bt-controls">',
    '<div class="bt-controls"><h2>Try the transition</h2>'
    '<p class="pg-control-note">Tap Bite in the app, or press play. Select a frame to take a closer look.</p>',
    1,
)
fragment = fragment.replace('__GRAVITY_REFERENCE__', (SOURCE / 'gravity-notes.html').read_text() + (SOURCE / 'developer-reference.html').read_text())
fragment = fragment.replace('__GRAVITY_MOTION_SCRIPT__', (SOURCE / 'gravity-transition.js').read_text())
avatars = {
    name: 'data:image/webp;base64,' + base64.b64encode((ASSETS / f'avatar-{name}.webp').read_bytes()).decode()
    for name in ('fox', 'astronaut', 'frog')
}
avatars['janus'] = 'data:image/png;base64,' + base64.b64encode((ASSETS / 'avatar-janus.png').read_bytes()).decode()
font = base64.b64encode((ASSETS / 'figtree-latin.woff2').read_bytes()).decode()
font_css = "@font-face{font-family:'Figtree';font-style:normal;font-weight:300 900;font-display:swap;src:url(data:font/woff2;base64," + font + ") format('woff2')}"
avatar_script = "(()=>{const avatars=" + json.dumps(avatars) + ";document.querySelectorAll('#bite-gravity-study img[data-avatar]').forEach(img=>img.src=avatars[img.dataset.avatar]);})();"
combined = (
    (SOURCE / 'shell-before.html').read_text() + fragment + (SOURCE / 'shell-after.html').read_text()
    + '<style>' + font_css + (SOURCE / 'playground.css').read_text() + (SOURCE / 'library.css').read_text() + (SOURCE / 'connect.css').read_text() + (SOURCE / 'bite-home.css').read_text() + (SOURCE / 'gravity-banner.css').read_text() + '</style>'
    + '<script>' + avatar_script + (SOURCE / 'status-bar.js').read_text() + (SOURCE / 'connect-interactions.js').read_text() + (SOURCE / 'gravity-banner.js').read_text() + (SOURCE / 'soft-launch-time.js').read_text() + '</script>'
)
combined = combined.replace('__BITE_LOGO_DATA_URI__', logo_uri)
combined = combined.replace('__PLAYGROUND_ICON_DATA_URI__', playground_icon_uri)
for asset in json.loads((SOURCE / 'bite-home-assets.json').read_text()):
    token = '__BITE_HOME_' + asset['name'].upper().replace('-', '_') + '__'
    mime = 'image/svg+xml' if asset['format'] == 'SVG' else 'image/png'
    uri = 'data:' + mime + ';base64,' + base64.b64encode((ASSETS / asset['file']).read_bytes()).decode()
    assert token in combined, 'Unused homepage asset: ' + asset['name']
    combined = combined.replace(token, uri)
assert '__BITE_HOME_' not in combined
for asset in json.loads((SOURCE / 'soft-launch-assets.json').read_text()):
    if not asset['name'].startswith('stack-'): continue
    token = '__SOFT_LAUNCH_' + asset['name'].upper().replace('-', '_') + '__'
    assert token in combined
    combined = combined.replace(token, 'data:image/svg+xml;base64,' + base64.b64encode((ASSETS / asset['file']).read_bytes()).decode())
assert '__SOFT_LAUNCH_' not in combined
assert 'A little room to play.' not in combined
(SOURCE / 'playground.html').write_text(combined)

# Assemble the checked-in document shell with no machine-specific dependencies.
page = (SOURCE / 'document-template.html').read_text()
page = page.replace('__BITE_DOCUMENT_CONTENT__', combined)
page = page.replace('__PLAYGROUND_ICON_DATA_URI__', playground_icon_uri)
page = page.replace('__LUCIDE_DATA_URI__', 'data:text/javascript;base64,' + base64.b64encode((SOURCE / 'vendor/lucide.js').read_bytes()).decode())
(ROOT / 'dist/index.html').write_text(page)
print('Bite Playground exported with bundled Figtree, avatars, and icons.')
from build_soft_launch import build_soft_launch
build_soft_launch(ROOT)

from build_gravity_comparison import build_gravity_comparison
build_gravity_comparison(ROOT)
