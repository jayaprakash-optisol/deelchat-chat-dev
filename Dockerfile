# take default image of node boron i.e  node 6.x
FROM node:8.11.3

# create app directory in container
RUN mkdir -p /home/ubuntu/projects/Deelchat/

# set /app directory as default working directory
WORKDIR /home/ubuntu/projects/Deelchat/

# only copy package.json initially so that `RUN yarn` layer is recreated only
# if there are changes in package.json
ADD package.json yarn.lock /home/ubuntu/projects/Deelchat/

# --pure-lockfile: Don’t generate a yarn.lock lockfile
#RUN yarn --pure-lockfile
RUN npm install

# copy all file from current dir to /app in container
COPY . /home/ubuntu/projects/Deelchat/

# expose port 9615
EXPOSE 9002

# cmd to start service
CMD [ "npm", "start" ]
