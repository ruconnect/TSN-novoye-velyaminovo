from http.server import BaseHTTPRequestHandler
import json


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Устанавливаем заголовки ответа
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        # Данные, которые вернет скрипт
        response_data = {
            "status": "success",
            "message": "Привет из Python на Vercel!"
        }

        # Отправляем ответ на сайт
        self.wfile.write(json.dumps(response_data).encode('utf-8'))
        return
