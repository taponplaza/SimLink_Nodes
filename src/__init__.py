from decouple import config
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from random import random
from threading import Lock
from datetime import datetime
from random import randint

app = Flask(__name__)
app.config.from_object(config("APP_SETTINGS"))

login_manager = LoginManager()
login_manager.init_app(app)
bcrypt = Bcrypt(app)
db = SQLAlchemy(app)
migrate = Migrate(app, db)
socketio = SocketIO(app, cors_allowed_origins='*')

# Registering blueprints
from src.accounts.views import accounts_bp
from src.core.views import core_bp
from src.admin.views import admin_bp
from src.nodes.views import nodes_bp



app.register_blueprint(accounts_bp)
app.register_blueprint(core_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(nodes_bp)



from src.accounts.models import User

login_manager.login_view = "accounts.login"
login_manager.login_message_category = "danger"

@login_manager.user_loader
def load_user(user_id):
    return User.query.filter(User.id == int(user_id)).first()


# Get current date time
def get_current_datetime():
    now = datetime.now()
    return now.strftime("%H:%M:%S")

# Existing background thread
def background_thread_sensor():
    print("Generating random sensor values")
    while True:
        dummy_sensor_value = round(random() * 40, 3)
        socketio.emit('updateSensorData', {'value': dummy_sensor_value, "date": get_current_datetime()})
        socketio.sleep(750/1000)

# In the server-side code
def background_thread_pair():
    while True:
        random_value1 = randint(1,11)
        random_value2 = randint(1,11)

        while random_value1 == random_value2:
            random_value2 = randint(1,11)

        socketio.emit('updatePairData', {'value1': random_value1, 'value2': random_value2})
        socketio.sleep(450/1000)


# Global thread variables
thread_sensor = None
thread_pair = None
thread_lock = Lock()


# Decorator for connect
@socketio.on('connect')
def connect():
    global thread_sensor, thread_pair
    print('Client connected')

    with thread_lock:
        if thread_sensor is None:
            thread_sensor = socketio.start_background_task(background_thread_sensor)
        if thread_pair is None:
            thread_pair = socketio.start_background_task(background_thread_pair)

# Decorator for disconnect
@socketio.on('disconnect')
def disconnect():
    print('Client disconnected',  request.sid)



########################
#### error handlers ####
########################


@app.errorhandler(401)
def unauthorized_page(error):
    return render_template("errors/401.html"), 401


@app.errorhandler(404)
def page_not_found(error):
    return render_template("errors/404.html"), 404


@app.errorhandler(500)
def server_error_page(error):
    return render_template("errors/500.html"), 500
