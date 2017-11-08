#!/usr/bin/env bash

LOAD_REQUEST=50000
LOAD_CONCURRENT=300
MESSAGING_ENDPOINT="http://localhost:8181/_redis/api"
#MESSAGING_ENDPOINT="http://localhost:8080/imageBuilder"


ab -n ${LOAD_REQUEST} -c ${LOAD_CONCURRENT} -m POST -k -T "application/json" ${MESSAGING_ENDPOINT}