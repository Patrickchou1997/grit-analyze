import pymysql
import datetime
import joblib
import pandas as pd
import shap
import os
import google.generativeai as genai

from routes.authen import add_authen_route
from flask import Flask, jsonify, request
from config import Config
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from enigma import Enigma
from anonymizer import Anonymizer


# Initialize the Flask app
app = Flask(__name__)

# Allow all origins
CORS(app)

# Set your AI API key
genai.configure(api_key = os.getenv("AI_KEY", "AIzaSyDA4ouzq1JqmK44tfZ_dAunP93DzI1goKM"))

# Secret key for JWT
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY", 'escape_from_universe')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours=3)

# Initialize JWT Manager
jwt = JWTManager(app)

# # Register routes
add_authen_route(app)

model_emp = joblib.load('models/employability_model.joblib')

model_pers = joblib.load('models/grit_per_prediction_model.joblib')
explainer_pers = shap.TreeExplainer(model_pers)

model_pass = joblib.load('models/grit_pas_prediction_model.joblib')
explainer_pass = shap.TreeExplainer(model_pass)

# Route for home endpoint
@app.route('/')
def home():
    return "Welcome to the Flash API!"

# Sample GET API
@app.route('/api/get_emp', methods=['POST'])
def get_emp():
    connection = Config.create_db_connection()
    try:
        data = request.get_json()
        encoder = Enigma()
        std_ID = encoder.decode(data['student_ID'])
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        query = f"""SELECT *
                    FROM extracted_survey AS SUR 
                        INNER JOIN escape.extracted_moodle_1 AS M1 ON SUR.student_ID = M1.student_ID
                        INNER JOIN escape.extracted_moodle_2 AS M2 ON SUR.student_ID = M2.student_ID
                        INNER JOIN escape.extracted_grade AS G ON SUR.student_ID = G.student_ID
                    WHERE SUR.student_ID = '{std_ID}';"""
        cursor.execute(query)
        result = cursor.fetchall()
        
        # แปลง result เป็น DataFrame และแยกเฉพาะค่า features
        df = pd.DataFrame(result)
        if df.empty:
            return jsonify({"error": "No data found for the given student_ID"}), 404

        features = df.drop(columns=[col for col in df.columns if 'student_ID' in col])
        featureG = features.drop([], axis=1)
        features_array = featureG.to_numpy()
        
        y_pred_proba = model_emp.predict_proba(features_array)
        
        update_query = """
        UPDATE escape.student
        SET un_emp_opp = %s, 
            emp_opp = %s
        WHERE student_ID = %s;
        """
        cursor.execute(update_query, (
            y_pred_proba[0][1],
            y_pred_proba[0][0],
            std_ID
        ))
        cursor.close()
        connection.commit()
        connection.close()
        
        return jsonify({"un_emp_opp":y_pred_proba[0][0],
                        "emp_opp":y_pred_proba[0][1]}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/get_grit', methods=['POST'])
def get_grit():
    connection = Config.create_db_connection()    
    try:
        data = request.get_json()
        encoder = Enigma()
        std_ID = encoder.decode(data['student_ID'])
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        query = f"""SELECT *
                    FROM extracted_survey AS SUR 
                        INNER JOIN escape.extracted_moodle_1 AS M1 ON SUR.student_ID = M1.student_ID
                        INNER JOIN escape.extracted_moodle_2 AS M2 ON SUR.student_ID = M2.student_ID
                        INNER JOIN escape.extracted_grade AS G ON SUR.student_ID = G.student_ID
                    WHERE SUR.student_ID = '{std_ID}';"""
        cursor.execute(query)
        result = cursor.fetchall()
        
        # แปลง result เป็น DataFrame และแยกเฉพาะค่า features
        df = pd.DataFrame(result)
        if df.empty:
            return jsonify({"error": "No data found for the given student_ID"}), 404

        features = df.drop(columns=[col for col in df.columns if 'student_ID' in col])
        featureG = features.drop(['OvercomeSetbacks_1','NewIdeasDistract_2_1', 'InterestChange_3','NoDiscourage_4_2',
                                  'ObsessedShort_5_3','HardWorker_6_4','GoalChange_7_5','FocusDifficulty_8_6','FinishBegin_9_7',
                                  'NewPursuits_11','Diligent_12_8','GritPerseverance','GritPassion','GritS'], axis=1)
        features_array = featureG.to_numpy()
        featureNames = featureG.columns.to_list()

        try:
            y_pred_pers = model_pers.predict(features_array)
            y_pred_pass = model_pass.predict(features_array)
            # Convert NumPy array to list
            grit_pers = y_pred_pers.tolist()[0]
            grit_pass = y_pred_pass.tolist()[0]
            grit_all = (grit_pers + grit_pass) / 8
        except ValueError as ve:
            return jsonify({"error": f"Model input error: {str(ve)}"}), 400
        
        shap_values_pers = explainer_pers.shap_values(features_array)
        expected_value_pers = explainer_pers.expected_value
        shap_values_pass = explainer_pass.shap_values(features_array)
        expected_value_pass = explainer_pass.expected_value
        message_all = f"""
                        I have the following SHAP values for passion (shap_values_pass) and perseverance (shap_values_pers):

                        For passion:
                        Features: {featureNames}
                        SHAP values: {shap_values_pass[0]}
                        Score for passion: {grit_pass}
                        Expected value for passion: {expected_value_pass}

                        For perseverance:
                        Features: {featureNames}
                        SHAP values: {shap_values_pers[0]}
                        Score for perseverance: {grit_pers}
                        Expected value for perseverance: {expected_value_pers}

                        The overall grit score (grit_all) is calculated as the average of passion and perseverance scores: {grit_all}.

                        Can you analyze the SHAP values for both passion and perseverance, explain how they contribute to the final prediction of overall grit (grit_all), and provide recommendations for which features the student should focus on improving to increase their grit score in each area (passion and perseverance)? Please make the advice simple, clear, response text around 200 words, and concise. 
                        """
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(message_all)
        
        update_query = """
        UPDATE escape.student
        SET grit_passion = %s, 
            grit_perseverance = %s, 
            grit_all = %s,
            grit_analysis = %s
        WHERE student_ID = %s;
        """
        cursor.execute(update_query, (
            grit_pass,
            grit_pers,
            grit_all,
            response.text,
            std_ID
        ))
        cursor.close()
        connection.commit()
        connection.close()

        response = {
            "message":response.text,
            "perseverance":grit_pers,
            "passion":grit_pass,
            "grit_all": grit_all
        }
        return response, 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/get_student', methods=['GET'])
def get_student():
    connection = Config.create_db_connection()    
    try:
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        query = "SELECT * FROM escape.student WHERE year_uni = '4th year';"
        cursor.execute(query)
        result = cursor.fetchall()
        cursor.close()
        connection.close()
        
        # student_ids = [row['student_ID'] for row in result]
        encoder = Enigma()
        # encoder.fit(student_ids)
        anonymizer = Anonymizer()
        
        for row in result:
            row['student_ID'] = encoder.encode(row['student_ID'])
            anon_fname, anon_lname, anon_gender, anon_email= anonymizer.anonymize(row["first_name"], row["last_name"])
            row["first_name"] = anon_fname
            row["last_name"] = anon_lname
            row["gender"] = anon_gender
            row["email"] = anon_email
            
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
@app.route('/api/get_user', methods=['POST'])
def get_user():
    connection = Config.create_db_connection()    
    try:
        data = request.get_json()
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        query = f"""SELECT user_ID,user_name,first_name,last_name,email,user_role,status,create_date 
                    FROM escape.users 
                    WHERE user_ID != '{data['user_ID']}';"""
        cursor.execute(query)
        result = cursor.fetchall()
        cursor.close()
        connection.close()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/user_approved', methods=['POST'])
def user_approved():
    connection = Config.create_db_connection()    
    try:
        data = request.get_json()
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        update_query = """
        UPDATE escape.users
        SET status = %s
        WHERE user_ID = %s;
        """
        cursor.execute(update_query, (
            data['status'],
            data['user_ID']
        ))
        cursor.close()
        connection.commit()
        connection.close()
        return jsonify({"message":"Success!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/user_deleted', methods=['POST'])
def user_deleted():
    connection = Config.create_db_connection()    
    try:
        data = request.get_json()
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        delete_query = f"DELETE FROM escape.users WHERE user_ID = '{data['user_ID']}';"
        cursor.execute(delete_query)
        cursor.close()
        connection.commit()
        connection.close()
        return jsonify({"message":"Success!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
# Run the app
if __name__ == '__main__':
    connected = Config.create_db_connection()
    if connected:
        # app.run(debug=True)
        app.run(host='0.0.0.0', port=5000)
    else:
        print("❌ Failed to connect to the database. Flask service will not start.")
    