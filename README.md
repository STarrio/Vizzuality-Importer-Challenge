## Vizzuality's Emissions Code Challenge

This is my submission for the Vizzuality Importer Challenge. It consists of two independent applications:
* The POST endpoint is developed in Python and aiohttp, a small asynchronous server framework.
* The GET endpoints are developed in NodeJS/Express.

The data storage system is an Elasticsearch server.

### How to deploy

The application is containerized and ready to deploy on a single command:

`docker-compose up`

It's preferable to run in detached or background mode:

`docker-compose up -d`

### API

#### POST endpoint

###### localhost:7000/save
  * params: {name: string, csv: File}

Uploads a .csv file to the app and stores its content to the Elasticsearch server

#### GET endpoints

###### localhost:6200/search
  * params: {country: string, sector: string, parentSector: string}
 
Basic filters. Allows to filter by country, sector or parent sector.

###### localhost:6200/search/id/:id

ID filter. Allows to retrieve the data for the entry with the passed :id.

###### localhost:6200/search/range/:id

Range filter. Allows to return values for a range of years (startYear to endYear) for a given ID, 
and compute the average value, the sum or just return the plain data.
Useful for dynamic charts

###### localhost:6200/search/country/:country
  * params: {year: number, op: string}

Country filter
Returns all entries for a given country and year and, if op is avg, will return the average emission value.

###### localhost:6200/search/sector/:sector

Sector filter. :sector is 0,1 or 2 as defined on types/categories.ts.

###### localhost:6200/search/parent_sector/:parentSector

Parent Sector filter (returns all entries with the given parent sector).
:parentSector'svalue is defined on types/categories.ts.
