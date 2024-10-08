# Stage 1: This stage to download the appium inspector and build the code to get html files
FROM node:20

RUN apt install git
# Set the working directory inside the container
WORKDIR /app

COPY package.json package.json
# Install dependencies
RUN npm i

