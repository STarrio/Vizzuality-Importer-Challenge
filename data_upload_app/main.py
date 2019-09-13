#data_upload_app/main.py
from aiohttp import web
from routes import setup_routes

app = web.Application()
setup_routes(app)

# Bootstrap application and start on 0.0.0.0:7000
web.run_app(app, host='0.0.0.0', port=7000)
