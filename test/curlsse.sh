#!/usr/bin/env bash
SSE_CLIENT_COUNT=10
#SSE_ENDPOINT2="http://localhost:8080/events?topics=topics/images/status"
SSE_ENDPOINT2="http://localhost:8181/_redis?topics=topics/images/status"

curl -kv -H "Accept: text/event-stream" ${SSE_ENDPOINT2} &
curl -kv -H "Accept: text/event-stream" ${SSE_ENDPOINT2} &
curl -kv -H "Accept: text/event-stream" ${SSE_ENDPOINT2} &
curl -kv -H "Accept: text/event-stream" ${SSE_ENDPOINT2} &
curl -kv -H "Accept: text/event-stream" ${SSE_ENDPOINT2} &
#curl -kv -H "Accept: text/event-stream" ${SSE_ENDPOINT2} &
#curl -kv -H "Accept: text/event-stream" ${SSE_ENDPOINT2} &
#curl -kv -H "Accept: text/event-stream" ${SSE_ENDPOINT2} &
#curl -kv -H "Accept: text/event-stream" ${SSE_ENDPOINT2} &
#curl -kv -H "Accept: text/event-stream" ${SSE_ENDPOINT2} &
