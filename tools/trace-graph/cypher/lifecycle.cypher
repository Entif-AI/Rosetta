MATCH (t:TraceTransition {projectionId:$projectionId})-[d:ADDED|CHANGED|REMOVED|REPEATED|UNCHANGED]->(o:TraceObject)
MATCH (t)-[:TO]->(after:TraceSnapshot)
RETURN after.index AS snapshot,type(d) AS disposition,o.objectId AS object
ORDER BY snapshot,disposition,object;
