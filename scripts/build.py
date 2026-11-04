"""Prerender the existing two templates. No runtime framework or build dependencies."""
import copy
import html
import hashlib
import json
import os
import re
import sys
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}

class Node:
    def __init__(self, tag='', attrs=None, children=None):
        self.tag, self.attrs, self.children = tag, dict(attrs or []), children or []
    def has(self, name):
        return name in self.attrs.get('class', '').split()
    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Node):
                yield from child.walk()
    def render(self):
        attributes = ''.join(' '+key+(('="'+html.escape(str(value), quote=True)+'"') if value is not None else '') for key,value in self.attrs.items())
        content = ''.join(child.render() if isinstance(child, Node) else (child if self.tag in ('script','style') else html.escape(child, quote=False)) for child in self.children)
        if not self.tag: return content
        return '<'+self.tag+attributes+'>' + ('' if self.tag in VOID else content+'</'+self.tag+'>')

class Parser(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.root = Node(); self.stack = [self.root]; self.feed(source)
    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs); self.stack[-1].children.append(node)
        if tag not in VOID: self.stack.append(node)
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID: self.handle_endtag(tag)
    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1,0,-1):
            if self.stack[i].tag == tag:
                self.stack = self.stack[:i]; break
    def handle_data(self, value): self.stack[-1].children.append(value)

def fragment(source): return Parser(source).root.children
def find(root, predicate): return next(node for node in root.walk() if predicate(node))
def node(tag, **attrs): return Node(tag, attrs.items())

# Resolve the production origin. Prefer an explicit SITE_URL; otherwise fall back to the
# domain Vercel assigns to the production deployment. Vercel exposes these hostnames WITHOUT
# a scheme (e.g. "my-project.vercel.app" or a custom production domain), so prepend https://
# before validating. VERCEL_PROJECT_PRODUCTION_URL is used (not VERCEL_URL): it is the stable
# production hostname, so canonical/hreflang/OG/sitemap stay consistent even on preview builds.
raw_origin = (os.environ.get('SITE_URL') or os.environ.get('VERCEL_PROJECT_PRODUCTION_URL') or '').strip()
if raw_origin and '://' not in raw_origin:
    raw_origin = 'https://' + raw_origin
origin = raw_origin.rstrip('/')
if origin:
    parsed = urlparse(origin)
    if parsed.scheme != 'https' or not parsed.hostname or parsed.hostname in ('localhost','127.0.0.1','::1') or parsed.path or parsed.query or parsed.fragment or parsed.username:
        raise SystemExit('SITE_URL must be the actual production HTTPS origin, without a path or credentials.')
elif '--production' in sys.argv:
    raise SystemExit('Missing SITE_URL. Set the real production domain (or let Vercel provide VERCEL_PROJECT_PRODUCTION_URL) before building for publication.')

locales = {lang:json.loads((ROOT/'locales'/f'{lang}.json').read_text()) for lang in ('es','en')}
paths = {'es': {'home':'/es/','services':'/es/#servicios'}, 'en': {'home':'/en/','services':'/en/#servicios'}}
missing = set()

def prepare(page):
    root = Parser((ROOT/'templates'/f'{page}.html').read_text()).root
    # Remove only elements already removed by the existing runtime.
    def clean(parent):
        kept=[]
        for child in parent.children:
            if not isinstance(child,Node): kept.append(child); continue
            if child.attrs.get('id') == 'catalogo' or child.has('service-number'): continue
            if parent.has('service-card') and child.tag == 'a': continue
            if parent.has('section-heading') and child.tag == 'p': continue
            if child.has('kicker') and any('Atención para vos' in str(s) for s in child.children): continue
            clean(child); kept.append(child)
        parent.children=kept
    clean(root)
    head = find(root,lambda n:n.tag=='head')
    head.children=[n for n in head.children if not (isinstance(n,Node) and (n.tag=='title' or n.tag=='meta' and n.attrs.get('name')=='description' or n.tag=='meta' and n.attrs.get('property','').startswith('og:') or n.tag=='script' and n.attrs.get('type')=='application/ld+json'))]
    for n in root.walk():
        if n.tag=='script' and n.attrs.get('src') in ('script.js','services.js'): n.attrs['src']='/'+n.attrs['src']
        if n.tag=='link' and n.attrs.get('href')=='styles.css': n.attrs['href']='/styles.css'
        if n.tag=='link' and 'fonts.googleapis.com/css2' in n.attrs.get('href',''):
            n.attrs['href']='https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Libre+Bodoni:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap'
        if n.attrs.get('id')=='catalog-toggle':
            n.tag='a'; n.attrs={'class':'button button-primary all-services-cta','href':'/servicios/'}; n.children=['Ver todos los servicios']
        if n.tag=='a' and 'maps.app.goo.gl' in n.attrs.get('href',''): n.attrs['href']=locales['es']['clinic']['maps']
        # Keep the exact physical street address. Only marketing positioning changes.
        for i,child in enumerate(n.children):
            if isinstance(child,str) and n.tag not in ('script','style') and child.strip()!='Santa Clara, Florencia, San Carlos, Alajuela, Costa Rica, 21002.':
                child=child.replace('Santa Clara, Florencia, San Carlos','San Carlos, Alajuela, Costa Rica').replace('Santa Clara, San Carlos, Costa Rica','San Carlos, Alajuela, Costa Rica').replace('Santa Clara, San Carlos','San Carlos, Alajuela, Costa Rica')
                n.children[i]=child
    nav = find(root,lambda n:n.has('nav'))
    brand = find(nav,lambda n:n.has('brand'))
    brand.children=[n for n in brand.children if isinstance(n,Node) and n.has('brand-mark')]
    # Footer remains the full clinic identity.
    footer = find(root,lambda n:n.has('footer-grid'))
    hours = next(n for n in reversed(footer.children) if isinstance(n,Node))
    hours.children.extend(fragment('<p>Domingo<br>Cerrado</p>'))
    if page=='home':
        statistic=find(root,lambda n:n.has('stats'))
        last=[n for n in statistic.children if isinstance(n,Node)][-1]
        find(last,lambda n:n.tag=='small').children=['a niños, adultos y adultos mayores']
        map_node=find(root,lambda n:n.has('map-pattern'))
        replacement=fragment('<iframe class="clinic-map" title="Ubicación de Clínica Dental Dra. Maday Pallares González" src="https://maps.google.com/maps?q=10.3615575,-84.4977497&z=17&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>')[0]
        map_node.tag,map_node.attrs,map_node.children=replacement.tag,replacement.attrs,replacement.children
        for image in [n for n in root.walk() if n.tag=='img' and 'assets/' in n.attrs.get('src','') and 'logo' not in n.attrs['src']]:
            hero='atencion' in image.attrs['src']; stem='atencion-dental' if hero else 'dra-maday-pallares'
            image.attrs.update(src=f'/assets/{stem}-960.webp',srcset=f'/assets/{stem}-480.webp 480w, /assets/{stem}-960.webp 960w',sizes='(max-width: 680px) calc(100vw - 40px), (max-width: 1200px) 45vw, 560px')
            image.attrs['alt']='Atención odontológica en la clínica de la Dra. Maday Pallares en San Carlos' if hero else 'Dra. Maday Pallares González en su consultorio dental en San Carlos'
    return root

def translate(root, lang, data):
    def text(value):
        key=value.strip()
        if not key or lang=='es' or re.fullmatch(r'[\d\s+©★·.,–:—-]+', key) or key in ('WhatsApp','Google Maps','Waze','San Carlos, Alajuela, Costa Rica'): return value
        if key.startswith('© '): return value
        if key not in data['text']:
            missing.add(key); return value
        return value.replace(key, data['text'][key])
    for n in root.walk():
        if n.tag in ('script','style'): continue
        n.children=[text(c) if isinstance(c,str) else c for c in n.children]
        for attr in ('alt','aria-label','title','placeholder'):
            if attr in n.attrs: n.attrs[attr]=text(n.attrs[attr])

def metadata(head, lang, page, data):
    seo=data['seo'][page]; url=origin+paths[lang][page]
    head.children.extend(fragment('<title>'+html.escape(seo['title'])+'</title>'))
    def meta(key,value,prop=False): head.children.append(Node('meta', [('property' if prop else 'name',key),('content',value)]))
    meta('description',seo['description']); meta('robots','index, follow' if origin else 'noindex, nofollow')
    for key,value in {'title':seo['title'],'description':seo['description'],'type':'website','site_name':'Clínica Dental Dra. Maday Pallares G.','locale':'es_CR' if lang=='es' else 'en_US','locale:alternate':'en_US' if lang=='es' else 'es_CR','image:alt':seo['title'],'image:width':'1200','image:height':'630'}.items(): meta('og:'+key,value,True)
    for key,value in {'card':'summary_large_image','title':seo['title'],'description':seo['description'],'image:alt':seo['title']}.items(): meta('twitter:'+key,value)
    if origin:
        head.children.append(Node('link',[('rel','canonical'),('href',url)]))
        for code in ('es','en'):
            head.children.append(Node('link',[('rel','alternate'),('hreflang',locales[code]['locale']),('href',origin+paths[code][page])]))
        head.children.append(Node('link',[('rel','alternate'),('hreflang','x-default'),('href',origin+paths['es'][page])]))
        meta('og:url',url,True); meta('og:image',origin+f'/assets/og-{lang}.jpg',True); meta('twitter:image',origin+f'/assets/og-{lang}.jpg')
    else:
        meta('og:image',f'/assets/og-{lang}.jpg',True); meta('twitter:image',f'/assets/og-{lang}.jpg')
    business={'@context':'https://schema.org','@type':'Dentist','name':'Clínica Dental Dra. Maday Pallares G.','description':seo['description'],'telephone':'+50670162252','address':{'@type':'PostalAddress','streetAddress':'Santa Clara, Florencia','addressLocality':'San Carlos','addressRegion':'Alajuela','postalCode':'21002','addressCountry':'CR'},'hasMap':data['clinic']['maps'],'openingHoursSpecification':[{'@type':'OpeningHoursSpecification','dayOfWeek':['Monday','Tuesday','Wednesday','Thursday','Friday'],'opens':'09:30','closes':'18:30'},{'@type':'OpeningHoursSpecification','dayOfWeek':'Saturday','opens':'10:00','closes':'15:00'}],'knowsLanguage':['es-CR','en']}
    if origin: business.update(url=origin+paths[lang]['home'],logo=origin+'/assets/logo-clinica.png',image=origin+'/assets/dra-maday-pallares-960.webp')
    head.children.append(Node('script',[('type','application/ld+json')],[json.dumps(business,ensure_ascii=False)]))

def render(lang,page):
    data=locales[lang]; root=prepare(page)
    translate(root,lang,data)
    find(root,lambda n:n.tag=='html').attrs['lang']=data['locale']
    home=paths[lang]['home']; catalog=paths[lang]['services']
    for n in root.walk():
        href=n.attrs.get('href','')
        if href in ('/servicios/','#servicios'): n.attrs['href']=catalog
        elif href in ('/','#top'): n.attrs['href']=home
        elif href.startswith('/#'): n.attrs['href']=home+href[1:]
        elif href.startswith('#'): n.attrs['href']=home+href
    nav=find(root,lambda n:n.has('nav'))
    switch=Node('div',[('class','language-switcher'),('aria-label',data['ui']['language'])])
    for code in ('es','en'):
        attrs=[('href',paths[code][page]),('lang',locales[code]['locale']),('hreflang',locales[code]['locale']),('data-language',code),('aria-label','Español' if code=='es' else 'English')]
        if code==lang: attrs.append(('aria-current','true'))
        switch.children.append(Node('a',attrs,[code.upper()]))
        if code=='es': switch.children.append(Node('span',[('aria-hidden','true')],['/']))
    nav.children.append(switch)
    if page=='home':
        accordion=find(root,lambda n:n.attrs.get('id')=='accordion')
        for i,(question,answer) in enumerate(data['faqs']):
            accordion.children.extend(fragment(f'<div class="faq-item{" open" if i==0 else ""}"><button type="button" aria-expanded="{str(i==0).lower()}" aria-controls="answer-{i}"><span>{html.escape(question)}</span><i data-lucide="plus"></i></button><div class="faq-answer" id="answer-{i}"{" hidden" if i else ""}><p>{answer}</p></div></div>'))
        grid=find(root,lambda n:n.has('services-list'))
        for service_index,(title,description,category,_) in enumerate(data['services']):
            link=data['clinic']['booking']; label=data['ui']['serviceCardBooking']
            detail = '<path d="M13 11h6m-3-3v6"/>' if service_index % 3 == 0 else '<path d="m11 11 3 2 6-2"/>' if service_index % 3 == 1 else ''
            icon = '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 6c-3-2-8-2-10 2-2 4 0 8 1 11s1 8 4 8c2 0 2-7 5-7s3 7 5 7c3 0 3-5 4-8s3-7 1-11c-2-4-7-4-10-2Z"/>'+detail+'</svg>'
            arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg>'
            grid.children.extend(fragment(f'<a class="listing-card" href="{html.escape(link, quote=True)}" aria-labelledby="service-title-{service_index} service-booking-{service_index}"><span class="listing-icon" aria-hidden="true">{icon}</span><span class="listing-category">{html.escape(category)}</span><h3 id="service-title-{service_index}">{html.escape(title)}</h3><p>{html.escape(description)}</p><span class="service-booking-hint" id="service-booking-{service_index}">{html.escape(label)}{arrow}</span></a>'))
        container=find(root,lambda n:n.attrs.get('id')=='servicios').children[0]
        container.children.extend(fragment(f'<div class="center-actions services-actions"><button type="button" class="button button-outline-dark" id="load-more-services" aria-controls="services-list" hidden>{html.escape(data["ui"]["loadMoreServices"])}<span class="load-more-arrow" aria-hidden="true">↓</span></button></div>'))
        chips=find(root,lambda n:n.has('filter-chips'))
        for i,category in enumerate(data['categories']):
            chips.children.append(Node('button',[('type','button'),('aria-pressed',str(i==0).lower()),('aria-controls','services-list')],[category]))
        find(root,lambda n:n.has('results-count')).children=[f"{len(data['services'])} {data['ui']['treatments']}"]
    metadata(find(root,lambda n:n.tag=='head'),lang,page,data)
    body=find(root,lambda n:n.tag=='body')
    payload={key:data[key] for key in ('locale','clinic','faqs','services','categories','ui')}
    payload.update(language=lang,page=page,routes=paths[lang])
    index=next(i for i,n in enumerate(body.children) if isinstance(n,Node) and n.tag=='script')
    body.children[index:index]=[Node('script',[('id','page-data'),('type','application/json')],[json.dumps(payload,ensure_ascii=False).replace('<','\\u003c')]),Node('script',[('src','/i18n.js')])]
    # Changed assets get new URLs so browsers cannot reuse a previous implementation.
    for element in root.walk():
        attr = 'src' if element.tag == 'script' else 'href' if element.tag == 'link' and element.attrs.get('rel') == 'stylesheet' else None
        url = element.attrs.get(attr, '') if attr else ''
        if url.startswith('/') and (ROOT/url.lstrip('/')).is_file():
            digest = hashlib.sha256((ROOT/url.lstrip('/')).read_bytes()).hexdigest()[:12]
            element.attrs[attr] = url+'?v='+digest
    return '<!doctype html>\n'+root.render()

for lang in ('es','en'):
    output=render(lang,'home')
    target=ROOT/paths[lang]['home'].strip('/')/'index.html'
    target.parent.mkdir(parents=True,exist_ok=True); target.write_text(output)
    if lang=='es': (ROOT/'index.html').write_text(output)
    # Keep old bookmarks working on static hosts and the local development server.
    destination=paths[lang]['services']
    label=locales[lang]['ui']['allServices']
    redirect=f'<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url={destination}"><title>{label}</title></head><body><a href="{destination}">{label}</a></body></html>'
    legacy=ROOT/('es/servicios/index.html' if lang=='es' else 'en/services/index.html')
    legacy.write_text(redirect)
    if lang=='es': (ROOT/'servicios/index.html').write_text(redirect)
if missing: raise SystemExit('Missing translations: '+repr(sorted(missing)))
urls=[origin+paths[lang]['home'] for lang in paths]
xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
if origin: xml+=''.join('<url><loc>'+html.escape(url)+'</loc></url>' for url in urls)
(ROOT/'sitemap.xml').write_text(xml+'</urlset>\n')
(ROOT/'robots.txt').write_text('User-agent: *\n'+('Allow: /\nDisallow: /templates/\nDisallow: /locales/\nDisallow: /scripts/\nSitemap: '+origin+'/sitemap.xml\n' if origin else 'Disallow: /\n'))
print('Built two localized home pages, root alias and legacy service redirects.' + (' Production SEO enabled.' if origin else ' Development build: noindex until SITE_URL is supplied.'))
