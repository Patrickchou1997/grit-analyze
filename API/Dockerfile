# Step 1: Use the official Python image from Docker Hub
FROM python:3.10-slim

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Install system dependencies
RUN apt-get update && apt-get install -y libgomp1

# Step 3: Copy the requirements.txt file to the container
COPY requirements.txt .

# Step 4: Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Expose the port that Flask will run on
EXPOSE 5000

# Step 7: Set the command to run the Flask application
CMD ["python", "app.py"]
