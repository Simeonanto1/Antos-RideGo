# Antos RideGo

A simple ride booking web application built with Node.js and Express. This project demonstrates how to containerize a web application using Docker and host the source code on GitHub and the Docker image on Docker Hub.

## Features

- User-friendly ride booking interface
- Node.js and Express backend
- SQLite database
- Dockerized application
- Easy deployment using Docker

## Technologies Used

- Node.js
- Express.js
- SQLite
- Docker
- Git & GitHub

## Project Structure

```
Antos-RideGo/
├── public/
├── server.js
├── package.json
├── Dockerfile
├── ridego.db
└── README.md
```

## Running Locally

1. Clone the repository:

```bash
git clone https://github.com/Simeonanto1/Antos-RideGo.git
```

2. Navigate into the project:

```bash
cd Antos-RideGo
```

3. Install dependencies:

```bash
npm install
```

4. Start the application:

```bash
npm start
```

The application will run on:

```
http://localhost:3000
```

## Docker

Build the image:

```bash
docker build -t antos-ridego .
```

Run the container:

```bash
docker run -p 3000:3000 antos-ridego
```

## GitHub Repository

https://github.com/Simeonanto1/Antos-RideGo

## Docker Hub

https://hub.docker.com/r/simeonanto1/antos-ridego

## Author

Simeon Anto