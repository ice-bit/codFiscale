FROM node:latest
# Prepare working directory
RUN mkdir /app
WORKDIR /app
# Copy files and install deps
COPY . .
RUN npm install
RUN npm run build
# Start app
EXPOSE 9000
CMD ["npm", "run", "start:prod"]
