- docker build -t grit-mysql-image .
- docker run --detach --name=fl-mysql-contain --publish 3306:3306 grit-mysql-image
