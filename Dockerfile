FROM node:8.7.0

# Build and run docker:
# docker build --build-arg HTTP_PROXY= --build-arg HTTPS_PROXY= -t ladariha/frontend .
# docker run -p 8080:8080 -d ladariha/frontend

ENV EXPOSED_PORT=8181
ENV EXPOSED_PORT_PM2_HEALTH=9615
# install pm2
RUN npm install -g pm2

# create non-root user so that the node app process won't be running as a root user
RUN groupadd -r nodejs && useradd -m -r -g nodejs nodejs
USER nodejs

WORKDIR /home/nodejs

# copy package.json and install deps
COPY package.json .

RUN npm install --production

# copy the rest of files (note that npm install has been called before copying to improve docker caching)
COPY . .

# expose HTTP port
EXPOSE ${EXPOSED_PORT}

# start the application

# run via pm2 and expose web health
EXPOSE ${EXPOSED_PORT_PM2_HEALTH}
CMD ["pm2-docker", "process.json", "--web"]

# run via pm2 without exposing web health
#CMD ["pm2-docker", "process.json"]

# run without pm2
#CMD ["npm", "start"]
