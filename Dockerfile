FROM alpine:latest
# Install dependencies
RUN apk update
RUN apk add nodejs npm
# Prepare working directory
RUN mkdir /app
WORKDIR /app
# Copy files and install deps
COPY . .
RUN npm install --loglevel verbose
RUN npm run build
# Start app
EXPOSE 9000
CMD ["npm", "run", "start:prod"]
