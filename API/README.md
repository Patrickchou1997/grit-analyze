### Create a virtual environment ###
python -m venv venv
### Activate the Virtual Environment ###
venv\Scripts\activate

### Manage Dependencies ###
pip freeze > requirements.txt
### Build the Docker Image ###
docker build -t flask-api .

### Create Docker Container (Standalond) ###
- docker run -d -p 5000:5000 --name flaskwarm flask-api

### Docker Swarm as Cluster ###
- docker swarm init
- docker service create --replicas 3 --name testsworm --publish 5000:5000 <image_name>
    ### remove service ###
    - docker service ls
    - docker service rm <service_id>