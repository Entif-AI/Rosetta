MATCH (t:TraceTransition {projectionId:$projectionId})-[:TO]->(after:TraceSnapshot {sourceSequence:$sequence})
OPTIONAL MATCH (t)-[:FROM]->(before:TraceSnapshot)
CALL {
 WITH before
 OPTIONAL MATCH (before)-[r:CONTAINS]->(o:TraceObject)
 WITH o,r ORDER BY o.objectId
 RETURN collect(CASE WHEN o IS NOT NULL THEN {id:o.id,objectId:o.objectId,state:r.stateJson} END) AS beforeObjects
}
CALL {
 WITH after
 OPTIONAL MATCH (after)-[r:CONTAINS]->(o:TraceObject)
 WITH o,r ORDER BY o.objectId
 RETURN collect(CASE WHEN o IS NOT NULL THEN {id:o.id,objectId:o.objectId,state:r.stateJson} END) AS afterObjects
}
RETURN t.id AS transition,before.id AS beforeSnapshot,after.id AS afterSnapshot,beforeObjects,afterObjects;
