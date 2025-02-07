def add_home_route(app):
    @app.route('/')
    def home():
        return "Welcome to the Flash API!"
