"""Build the separate banner comparison without changing the gravity prototype."""
from pathlib import Path
import base64
import json
import re


def build_soft_launch(root):
    source = root / 'source'
    assets = root / 'dist' / 'assets'

    def uri(path, mime):
        return 'data:' + mime + ';base64,' + base64.b64encode(path.read_bytes()).decode()

    manifest = json.loads((source / 'soft-launch-assets.json').read_text())
    original = (source / 'gravity-transition.html').read_text()
    before = (source / 'shell-before.html').read_text()
    before = before.replace('href="#gravity-transition"', 'href="/index.html"')
    before = before.replace(' aria-current="page"', '')
    before = before.replace('href="/soft-launch-banner-animations.html"', 'href="/soft-launch-banner-animations.html" aria-current="page"')
    before = before.replace('id="gravity-transition"', 'id="soft-launch-banner-animations"')
    before = before.replace('<h1>Gravity transition</h1>', '<h1>Soft launch banner animations</h1>')
    header = original[original.index('    <div class="bt-phone"'):original.index('      <div class="bt-viewport">')]
    header = header.replace('class="bt-phone"', 'class="bt-phone" data-current-tab="Bite"')
    header = header.replace('EA Connect mobile transition prototype', 'Bite homepage banner preview')
    header = header.replace('>EA friends</h2>', '>Bite</h2>')
    header = re.sub(r'<button class="ec-filter".*?</button>', '', header, flags=re.S)
    header = header.replace('data-avatar="janus"', 'src="' + uri(assets / 'avatar-janus.png', 'image/png') + '"')
    nav = original[original.index('      <nav class="bt-nav"'):original.index('    </div>\n  </div>\n  <div class="bt-controls">')]
    nav = nav.replace(' aria-current="page"', '')
    nav = nav.replace('data-tab="Bite"', 'data-tab="Bite" aria-current="page"')
    nav = nav.replace('<button ', '<button disabled tabindex="-1" ')
    games_source = (source / 'bite-home.html').read_text()
    games_source = games_source[games_source.index('          <div class="bt-home-games"'):]

    def shapes(prefix):
        result = []
        for asset in manifest:
            if not asset['name'].startswith(prefix + '-'): continue
            x, y = asset['x'], asset['y']
            if prefix == 'orbit': x, y = x + 262, y + 20
            w, h = asset['width'], asset['height']
            token = '__SOFT_LAUNCH_' + asset['name'].upper().replace('-', '_') + '__'
            result.append(f'<span class="sl-shape" data-shape="{asset["name"]}" data-x="{x}" data-y="{y}" data-width="{w}" data-height="{h}" style="left:{x if prefix == "orbit" else asset["x"]}px;top:{y if prefix == "orbit" else asset["y"]}px;width:{w}px;height:{h}px"><img src="{token}" width="{w:g}" height="{h:g}" alt=""></span>')
        return ''.join(result)

    copy = '<div class="sl-banner-copy"><h3>Small games.<br>Shared moments.</h3><p>Quick games,<br>refreshed daily at <time data-reset-time>3:00 AM ET</time>.</p></div>'
    date_html = (source / 'bite-home-date.html').read_text()
    variants = []
    for key, title, subtitle in [('stack', 'Assemble and bounce', '1.2 s entry · Gentle floating loop'), ('orbit', 'Slow orbit', '20 s revolution · Continuous loop')]:
        if key == 'stack':
            banner = date_html + (source / 'stack-banner.html').read_text()
        else:
            banner = '<section class="sl-banner sl-banner--orbit" aria-label="Bite soft launch"><img class="sl-banner-background" src="__SOFT_LAUNCH_ANGLED_BACKGROUND__" width="393" height="142" alt="">' + copy + '<div class="sl-orbit-graphics" aria-hidden="true"><div class="sl-orbit-motion">' + shapes(key) + '</div></div></section>' + date_html
        games = games_source.replace('bt-game-', 'sl-' + key + '-game-')
        phone = header.replace('id="bt-screen-title"', 'id="sl-' + key + '-title"') + '<div class="sl-home">' + banner + games + '</div>' + nav + '</div>'
        variants.append(f'<article class="sl-variant" data-motion-player="{key}" aria-labelledby="sl-{key}-heading"><header class="sl-variant-heading"><div><h2 id="sl-{key}-heading">{title}</h2><p>{subtitle}</p></div><div class="sl-actions"><button type="button" data-replay aria-label="Replay {title.lower()}">Replay</button><button type="button" data-pause aria-pressed="false" aria-label="Pause {title.lower()}">Pause</button></div></header><div class="sl-device-view"><div class="sl-study" data-variant="{key}">{phone}</div></div></article>')

    base_css = re.search(r'<style>(.*?)</style>', original, re.S).group(1)
    shared_css = base_css + (source / 'connect.css').read_text() + (source / 'bite-home.css').read_text()
    shared_css = shared_css.replace('#bite-gravity-study', '.sl-study')
    font = uri(assets / 'figtree-latin.woff2', 'font/woff2')
    css = "@font-face{font-family:'Figtree';font-style:normal;font-weight:300 900;font-display:swap;src:url(" + font + ") format('woff2')}"
    css += (source / 'playground.css').read_text() + (source / 'library.css').read_text() + shared_css + (source / 'soft-launch.css').read_text() + (source / 'gradient-toggle.css').read_text() + (source / 'bite-home-date.css').read_text()
    toolbar = '<div class="pg-gradient-toolbar">' + (source / 'gradient-toggle.html').read_text() + '</div>'
    body = before + toolbar + '<div class="sl-comparison">' + ''.join(variants) + '</div><p class="sl-motion-note" hidden>Reduced motion is on. Both banners show their settled compositions.</p>' + (source / 'shell-after.html').read_text()
    scripts = (source / 'gradient-toggle.js').read_text() + (source / 'bite-home-date.js').read_text() + (source / 'stack-motion.js').read_text() + (source / 'soft-launch-time.js').read_text() + (source / 'soft-launch-motion.js').read_text()
    page = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Soft launch banner animations · Bite Playground</title><meta name="description" content="Compare two Bite soft launch banner animations: assemble and bounce, and slow orbit."><link rel="icon" type="image/png" href="__PLAYGROUND_ICON_DATA_URI__"><style>' + css + '</style></head><body>' + body + '<script>' + scripts + '</script></body></html>'
    page = page.replace('__PLAYGROUND_ICON_DATA_URI__', uri(assets / 'bite-playground-icon.png', 'image/png'))
    for asset in json.loads((source / 'bite-home-assets.json').read_text()):
        token = '__BITE_HOME_' + asset['name'].upper().replace('-', '_') + '__'
        mime = 'image/svg+xml' if asset['format'] == 'SVG' else 'image/png'
        page = page.replace(token, uri(assets / asset['file'], mime))
    for asset in manifest:
        token = '__SOFT_LAUNCH_' + asset['name'].upper().replace('-', '_') + '__'
        assert token in page, 'Unused banner asset: ' + asset['name']
        page = page.replace(token, uri(assets / asset['file'], 'image/svg+xml'))
    assert '__BITE_HOME_' not in page and '__SOFT_LAUNCH_' not in page
    (root / 'dist' / 'soft-launch-banner-animations.html').write_text(page)
    print('Soft launch comparison exported as a separate prototype.')


if __name__ == '__main__':
    build_soft_launch(Path(__file__).resolve().parent)
