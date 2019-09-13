import * as express from 'express';
import { Client } from '@elastic/elasticsearch';
import { ParentSectorCategories, SectorCategories } from './types/categories';
import { ES_ENDPOINT, EMISSIONS_DATA_INDEX_NAME } from './env';
import _ from 'lodash';

export const router = express.Router();

// Open connection to Elasticsearch server
const client = new Client({ node: ES_ENDPOINT });

/*
*  Basic filter
*  Allows to filter by country, sector or parent sector
*/
router.get('/', async (req: any, res: any) => {

  const queryBody: any = {
    index: EMISSIONS_DATA_INDEX_NAME,
    body: {
      query: {
        bool: {
          filter: []
        }
      }
    }
  };

  // set filters according to the query params
  if(req.query.country && req.query.country.length === 3){
    queryBody.body.query.bool.filter.push( {'term': {'Country':req.query.country}});
  }

  if(req.query.sector){
    queryBody.body.query.bool.filter.push( {'term': {'Sector':req.query.sector}});
  }

  if(req.query.parentSector){
    queryBody.body.query.bool.filter.push( {'term': {'Parent_sector':req.query.parentSector}});
  }

  const result = await client.search(queryBody);

  res.json({
    data: _(result.body.hits.hits).map( y =>
      {
        return _.pick(y,['_id','_source']);
      }
     ).value()
  });
});

/*
* ID filter
*/
router.get('/id/:id', async (req: any, res: any) => {

  const result = await client.search({
    index: EMISSIONS_DATA_INDEX_NAME,
    body: {
      query: {
        match: { _id: req.params.id }
      }
    }
  });

  res.json({
    data: _(result.body.hits.hits).map( y =>
      {
        return _.pick(y,['_id','_source']);
      }
     ).value()
  });
});

/*
* Range filter
* Allows to return values for a range of years (startYear to endYear) for
* a given ID, and compute the average value, the sum or just return the plain data.
* Useful for dynamic charts
*/
router.get('/range/:id', async (req: any, res: any) => {

  const selectedRange = _.range(new Number(req.query.startYear).valueOf(), new Number(req.query.endYear).valueOf()+1);
  const result = await client.search({
    index: EMISSIONS_DATA_INDEX_NAME,
    body: {
      _source: [
        ...selectedRange,
        'Country',
        'Sector',
        'Parent_sector'
      ],
      query: {
        match: { _id: req.params.id }
      }
    }
  });

  const selectedRangeData = _(result.body.hits.hits[0]._source).pick(selectedRange).values().map(y => { return parseFloat(y) }).value();

  if(req.query.op === 'sum'){
    res.json({data: _.sum(selectedRangeData)})
  } else if (req.query.op === 'avg') {
    res.json({data: _.sum(selectedRangeData)/selectedRangeData.length})
  } else if (req.query.op === 'data'){
    res.json({data: selectedRangeData});
  } else {
    throw 'Operation not permitted';
  }
});

/*
* Country filter
* Returns all entries for a given country and year and,
* if op is avg, will return the average emission value.
*/
router.get('/country/:country', async (req: any, res: any) => {

  const queryBody: any = {
    index: EMISSIONS_DATA_INDEX_NAME,
    body: {
      query: {
        match: { Country: req.params.country }
      }
    }
  };

  if(req.query.year) {
    queryBody.body._source = [
      'Country',
      'Sector',
      'Parent_sector',
      req.query.year
    ];
  }

  if(req.query.op === 'avg' && req.query.year){
    queryBody.body.aggs = {
        "avg_value" : { "avg" : { "field" : req.query.year } }
    };
  }

  const result = await client.search(queryBody);

  res.json({
    data: _(result.body.hits.hits).map( y =>
      {
        return _.pick(y,['_id','_source']);
      }
   ).value(),
    avg_value:result.body.aggregations.avg_value.value});
});

/*
* Sector filter
* :sector is 0,1 or 2 as defined on types/categories.ts
*/
router.get('/sector/:sector', async (req: any, res: any) => {

  const result = await client.search({
    index: EMISSIONS_DATA_INDEX_NAME,
    body: {
      query: {
        match: { Sector: SectorCategories[req.params.sector] }
      }
    }
  });

  res.json({
    data: _(result.body.hits.hits).map( y =>
      {
        return _.pick(y,['_id','_source']);
      }
     ).value()
  });
});

/*
* Parent Sector filter (returns all entries with the given parent sector)
* :parentSector's value is defined on types/categories.ts
*/
router.get('/parent_sector/:parentSector', async (req: any, res: any) => {

  const result = await client.search({
    index: EMISSIONS_DATA_INDEX_NAME,
    body: {
      query: {
        match: { Parent_sector: ParentSectorCategories[req.params.parentSector] }
      }
    }
  });

  res.json({
    data: _(result.body.hits.hits).map( y =>
      {
        return _.pick(y,['_id','_source']);
      }
     ).value()
  });
});
