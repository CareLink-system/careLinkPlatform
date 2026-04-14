import requests
url='http://127.0.0.1:8001/api/chatbot/conversations'
body={'user_id':'019d858d-6a0b-7fb3-9a61-12bffb899f55'}
try:
    r = requests.post(url, json=body, timeout=10)
    print('STATUS', r.status_code)
    print('TEXT', r.text)
except Exception as e:
    print('ERROR', e)
