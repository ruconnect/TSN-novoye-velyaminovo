from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api', methods=['GET'])
def home():
    # Получаем параметр "user" из URL
    name = request.args.get('name', 'guest')
    
    # Стандартная команда print (уйдет в логи Vercel)
    print(f"Получен запрос для пользователя: {name}")
    
    # Стандартная конструкция if
    if name == 'admin':
        message = "Добро пожаловать в панель управления!"
    else:
        message = f"Привет, {name}!"
        
    return jsonify({"status": "success", "message": message})
