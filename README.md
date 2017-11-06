# frontendserver

### How to run locally

    $ npm install
    $ npm start

### How to run with PM2
    
    $ sudo npm install -g pm2 
    $ npm install
    $ npm run-script startpm2
    
Some useful commands
 - `$ pm2 monit` to display monitoring information
 - `$ pm2 list` to list running apps
 - `$ pm2 desc [ID]` to display information about particular instance
 - `$ pm2 delete all ` to stop and delete all apps
 - `$ pm2 restart all` to restart all apps
 - `$ pm2 web` expose metrics on port 9615 

### How to run as a docker container

    $ docker build --build-arg HTTP_PROXY= --build-arg HTTPS_PROXY= -t ladariha/frontendserver .
    $ docker run -p 8181:8181 -d ladariha/frontendserver
 
### How to run as a docker container with PM2

    $ docker build --build-arg HTTP_PROXY= --build-arg HTTPS_PROXY= -t ladariha/frontendserver .
    $ docker run -p 8181:8181 -p 9615:9615 -d ladariha/frontend
    $ docker exec -i -t [CONTAINER_ID] /bin/bash
    $ docker rm -rf [CONTAINER_ID]