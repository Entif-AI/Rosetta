MATCH (w:TraceWindow {projectionId:$projectionId})-[:HAS_RECORD]->(e:TraceRecord)
WHERE e.sourceSequence >= $from AND e.sourceSequence <= $to
OPTIONAL MATCH (e)-[r]->(o:TraceObject {projectionId:$projectionId})
WITH e,r,o ORDER BY e.sourceSequence,type(r),o.id
RETURN e.sourceSequence AS sequence,e.eventType AS event,e.id AS record,
collect({edge:type(r),object:o.id}) AS neighbors
ORDER BY sequence LIMIT 10;
