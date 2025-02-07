import os
import pymysql

class Config:
    # Database Configuration from Environment Variables
    DB_CONFIG = {
        "host": os.getenv("MYSQL_HOST", "localhost"),      # Default: localhost (กรณีรันนอก Docker)
        "user": os.getenv("MYSQL_USER", "root"),           # Default: root
        "password": os.getenv("MYSQL_PASSWORD", "1234"),   # Default: 1234
        "database": os.getenv("MYSQL_DATABASE", "escape"),     # Default: escape
        "port": int(os.getenv("MYSQL_PORT", 3306))         # Default: 3306
    }

    # Function to create a MySQL connection
    def create_db_connection():
        try:
            connection = pymysql.connect(**Config.DB_CONFIG)
            print("✅ Successfully connected to the database")
            return connection
        except Exception as e:
            print(f"❌ Failed to connect to the database: {e}")
            return None