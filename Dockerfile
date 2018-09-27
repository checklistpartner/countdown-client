FROM node:8.11.4

#DEPENDENCIES
COPY package* /repos/
WORKDIR /repos
RUN npm i
COPY . /repos

CMD ["npm", "test"]




