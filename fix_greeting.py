import re
with open("face_detection/face_detection.py", "r", encoding="utf-8") as f:
    content = f.read()
old1 = '''                                    response = requests.post(url, json=data, headers={"Authorization": f"Bearer {os.getenv('API_TOKEN')}"})
                                    result = response.json()
                                    if result.get("message") == "already_marked":'''
new1 = '''                                    response = requests.post(url, json=data, headers={"Authorization": f"Bearer {os.getenv('API_TOKEN')}"})
                                    result = response.json() if response.status_code == 200 else {}
                                    if result.get("message") == "already_marked":'''
content = content.replace(old1, new1)
with open("face_detection/face_detection.py", "w", encoding="utf-8") as f:
    f.write(content)
print("Done!" if old1 not in open("face_detection/face_detection.py", encoding="utf-8").read() else "Pattern not found - manual edit needed")
