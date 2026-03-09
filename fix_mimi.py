content = open('mimi_llm_session.py', 'r', encoding='utf-8').read()
old = 'r = requests.get(url, params=params, timeout=10)'
new = 'r = requests.get(url, params=params, timeout=10, headers={"User-Agent": "MimiBot/1.0"})'
content = content.replace(old, new)
open('mimi_llm_session.py', 'w', encoding='utf-8').write(content)
print('Done')