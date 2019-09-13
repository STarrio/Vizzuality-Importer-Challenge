## Vizzuality's Emissions Code Challenge

This is my submission for the Vizzuality Importer Challenge. It consists of two independent applications:
* The POST endpoint is developed in Python and aiohttp, a small asynchronous server framework.
* The GET endpoints are developed in NodeJS/Express.

The data storage system is an Elasticsearch server.

### Hoy to deploy

The application is containerized and ready to deploy on a single command:

`docker-compose up`

It's preferable to run in detached or background mode:

`docker-compose up -d`
