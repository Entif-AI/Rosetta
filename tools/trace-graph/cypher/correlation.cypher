MATCH (request:TraceRecord {projectionId:$projectionId})-[:REQUEST_REF]->(call:TraceObject)<-[:RESULT_FOR]-(result:TraceRecord)
WHERE request.sourceSequence < result.sourceSequence
RETURN request.sourceSequence AS request,call.objectId AS correlation,result.sourceSequence AS result
ORDER BY request,result;
