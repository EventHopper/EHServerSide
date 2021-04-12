FROM node:14 as BUILD_IMAGE

# Create server directory
WORKDIR /server

# Install server dependencies
# Wildcard is used to ensure both package.json and package-lock.json are copied where available (npm@5+)
# COPY package*.json ./
# COPY tsconfig.json ./
COPY . .
# COPY .env ./

RUN npm ci
# If you are running your code for production
# RUN npm ci --only=production

# RUN npm prune --production
# RUN /usr/local/bin/node-prune


EXPOSE 8080
CMD npm run start

