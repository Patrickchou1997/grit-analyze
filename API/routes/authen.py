def add_authen_route(app):
    from flask_bcrypt import Bcrypt
    from flask_jwt_extended import create_access_token, jwt_required
    import pymysql
    from config import Config
    from flask import jsonify, request
    from flask_cors import cross_origin

    bcrypt = Bcrypt()

    @app.route('/api/login', methods=['POST'])
    @cross_origin()
    def login():
        data = request.json
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        try:
            # Connect to the database
            connection = Config.create_db_connection()
            cursor = connection.cursor(pymysql.cursors.DictCursor)

            # Fetch the user by username
            query = "SELECT * FROM users WHERE user_name = %s;"
            cursor.execute(query, (data['user_name'],))
            result = cursor.fetchone()  # Get the first matching result
            # hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
            print(result)
            # Close the database connection
            cursor.close()
            connection.close()

            # Check if user exists
            if not result:
                return jsonify({"error": "Invalid username or password"}), 401

            # Verify the password
            if not bcrypt.check_password_hash(result['password'], data['password']):
                return jsonify({"error": "Invalid username or password"}), 401

            # Create JWT token
            token = create_access_token(identity=result['user_ID'])

            return jsonify({
                "message": "Login successful",
                "result": {
                    "user_ID": result["user_ID"],
                    "first_name": result["first_name"],
                    "last_name": result["last_name"],
                    "email": result["email"],
                    "user_name": result["user_name"],
                    "user_role": result["user_role"],
                    "status": result["status"]
                },
                "token": token
            }), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    @app.route('/api/register', methods=['POST'])
    def register():
        try:
            # Parse the incoming JSON request
            data = request.json
            if not data:
                return jsonify({"error": "No input data provided"}), 400

            # Validate required fields
            required_fields = ['first_name', 'last_name', 'email', 'user_name', 'password', 'user_role']
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

            # Hash the password
            hashed_password = bcrypt.generate_password_hash(data['password'])

            # Create a database connection
            connection = Config.create_db_connection()
            if not connection:
                return jsonify({"error": "Database connection failed"}), 500
            
            cursor = connection.cursor()
            
            # Check if the username already exists
            check_query = "SELECT COUNT(*) FROM users WHERE user_name = %s"
            cursor.execute(check_query, (data['user_name'],))
            result = cursor.fetchone()
            if result[0] > 0:
                # Handle duplicate entries (e.g., email or username already exists)
                connection.commit()
                cursor.close()
                return jsonify({"error": "User with this email or username already exists"}), 409

            cursor.execute("SELECT count(1) FROM users;")
            result = cursor.fetchone()
            new_user_ID = f"U{str(result[0]).zfill(9)}"

            # Insert the user into the database
            query = """
                INSERT INTO users (user_ID, first_name, last_name, email, user_name, password, user_role, status, create_date)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
            """
            cursor.execute(query, (
                new_user_ID,
                data['first_name'],
                data['last_name'],
                data['email'],
                data['user_name'],
                hashed_password,
                data['user_role'],
                'pending'  # Default status is 'pending' until approved
            ))

            # Commit the transaction and close the connection
            connection.commit()
            cursor.close()
            connection.close()

            return jsonify({"message": "User registered successfully"}), 201
        except pymysql.IntegrityError as e:
            # Handle duplicate entries (e.g., email or username already exists)
            return jsonify({"error": "User with this email or username already exists"}), 409
        except Exception as e:
            # Handle other errors
            return jsonify({"error": str(e)}), 500
