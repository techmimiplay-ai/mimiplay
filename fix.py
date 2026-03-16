code = '''
@app.route('/speak', methods=['POST'])
def speak_text():
    import asyncio
    import edge_tts
    import tempfile
    import base64
    data = request.get_json()
    text = data.get('text', '')
    async def generate(text, path):
        communicate = edge_tts.Communicate(text, voice="en-IN-NeerjaNeural", rate="-10%", pitch="+15Hz")
        await communicate.save(path)
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as f:
        tmp_path = f.name
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(generate(text, tmp_path))
    loop.close()
    with open(tmp_path, 'rb') as f:
        audio_data = base64.b64encode(f.read()).decode()
    os.remove(tmp_path)
    return jsonify({'audio': audio_data})
'''

c = open('app.py', encoding='utf-8').read()
c = c.rstrip() + '\n' + code + '\n'
open('app.py', 'w', encoding='utf-8').write(c)
print('Done:', '/speak' in c)