FROM node:8.11.4

#DEPENDENCIES
COPY package* /repos/
WORKDIR /repos
RUN npm i
COPY . /repos
ENV MOCHA_FILE=/results/results.xml
CMD ["npm", "test"]




