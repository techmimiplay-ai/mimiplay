c = open('mimi_llm_session.py', encoding='utf-8').read()
old = "        yt_video = self._fetch_youtube_video(data.get('youtube_search_term') or '')"
new = "        yt_video = None"
c = c.replace(old, new)
open('mimi_llm_session.py', 'w', encoding='utf-8').write(c)
print('done:', 'fetch_youtube' not in c.split('_get_llm_response_json')[1])