import requests
r = requests.get(
    'https://commons.wikimedia.org/w/api.php',
    params={'action':'query','generator':'search','gsrsearch':'zebra','gsrlimit':5,'gsrnamespace':6,'prop':'imageinfo','iiprop':'url','format':'json'},
    headers={'User-Agent':'MimiBot/1.0'},
    timeout=10
)
print(r.status_code)
pages = r.json().get('query',{}).get('pages',{})
for p in pages.values():
    print(p.get('imageinfo',[{}])[0].get('url','no url'))