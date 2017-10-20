FROM node:8.7.0

# Build and run docker:
# docker build --build-arg HTTP_PROXY= --build-arg HTTPS_PROXY= -t ladariha/frontend .
# docker run -p 8080:8080 -d ladariha/frontend

ENV EXPOSED_PORT=8080
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
CMD ["pm2-docker", "process.json"]
