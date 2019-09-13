#data_upload_app/views.py
from aiohttp import web
import os
import json
import elasticsearch as es
from elasticsearch import helpers
from env import ES_IP, ES_PORT, EMISSIONS_DATA_INDEX_NAME

# Elasticsearch cluster health check
async def check_health(request):
    dataserver = es.Elasticsearch([{'host': ES_IP, 'port':ES_PORT}])
    return web.json_response(dataserver.info())

# Index delete endpoint
async def delete_index(request):
    dataserver = es.Elasticsearch([{'host': ES_IP, 'port':ES_PORT}])
    index_client = es.client.IndicesClient(dataserver)

    return web.json_response(index_client.delete(index= [EMISSIONS_DATA_INDEX_NAME]))

# Receive a .csv and store it to elasticsearch
async def save(request):

    dataserver = es.Elasticsearch([{'host': ES_IP, 'port':ES_PORT}])
    index_client = es.client.IndicesClient(dataserver)

    # opens reader instance to start reading the multipart request
    reader = await request.multipart()

    # reader.next yields the next part of the request body
    field = await reader.next()
    assert field.name == 'name'
    name = await field.read(decode=True)

    field = await reader.next()
    assert field.name == 'csv'
    filename = field.filename
    assert filename.split('.')[-1] == 'csv'
    lines = 0
    entries = []
    while True:
        line = await field.readline()
        if not line:
            break
        if lines == 0:
            # Code to generate the index mapping before saving to ES.
            # Although it's possible for ES to infer the mapping from the data,
            # it is preferred to preset it to avoid badly typed fields.

            headers = [header.replace('\r\n','').replace(' ','_') for header in line.decode().split(',')]
            properties = {
                'properties': { str(field):{'type':'double' if str(field).isdigit() else 'keyword'} for field in headers }
            }

            if(not index_client.exists(index = [EMISSIONS_DATA_INDEX_NAME] )):
                # Only run this if the index does not exist
                index_client.create(index = EMISSIONS_DATA_INDEX_NAME)
                index_client.put_mapping(index = EMISSIONS_DATA_INDEX_NAME, body = properties )
        lines += 1

        # ES bulk save works with NDJSON format, so we need to format the entries list

        # First we insert the action we want to execute, in this case indexing a document
        entries.append({'index': {'_index': EMISSIONS_DATA_INDEX_NAME, '_type': '_doc'}})

        # next we insert the data for the document we are about to index
        entries.append(dict(zip(headers,[value.replace('\r\n','') for value in line.decode().split(',')])))

    # to avoid indexing the headers, we remove the first 2 rows
    entries = entries[2:]

    # We run the bulk index. ES's limit for a bulk index depends on various factors and can
    # run inconsistently with large files, so it's better to index documents by batches.
    # Even if generally a batch size of 100000 is adequate, it's better to be conservative about it

    for l in range(0,lines,50000):
        es_response=dataserver.bulk(index=EMISSIONS_DATA_INDEX_NAME,doc_type='_doc', body=entries[l:l+50000]) # to avoid indexing the headers


    return web.json_response({'entries': lines, 'message':'{} with {} lines successfully stored to Elasticsearch under the {} index.'
                             ''.format(filename, lines,EMISSIONS_DATA_INDEX_NAME)})
