#data_upload_app/routes.py
from views import save, check_health, delete_index

def setup_routes(app):
    app.router.add_get('/check', check_health)
    app.router.add_post('/save', save)
    app.router.add_delete('/delete_index',delete_index)
