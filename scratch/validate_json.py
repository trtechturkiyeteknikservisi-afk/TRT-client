import json
import sys

try:
    with open('e:/My Work/TRT/client/messages/tr.json', 'r', encoding='utf-8') as f:
        json.load(f)
    print("tr.json is valid")
except Exception as e:
    print(f"tr.json error: {e}")

try:
    with open('e:/My Work/TRT/client/messages/en.json', 'r', encoding='utf-8') as f:
        json.load(f)
    print("en.json is valid")
except Exception as e:
    print(f"en.json error: {e}")

try:
    with open('e:/My Work/TRT/client/messages/ar.json', 'r', encoding='utf-8') as f:
        json.load(f)
    print("ar.json is valid")
except Exception as e:
    print(f"ar.json error: {e}")
