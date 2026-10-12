MATCH (t:TraceTransition {projectionId:$projectionId})-[:TO]->(s:TraceSnapshot)
OPTIONAL MATCH (t)-[d]->(:TraceObject)
WITH s,collect(type(d)) AS dispositions
OPTIONAL MATCH (s)-[:CONTAINS]->(o:TraceObject)
RETURN s.index AS snapshot,s.sourceSequence AS sourceSequence,s.sourceBytes AS sourceBytes,
s.normalizedBytes AS normalizedBytes,s.recordCount AS recordCount,count(DISTINCT o) AS objectCount,
size([d IN dispositions WHERE d='ADDED']) AS added,
size([d IN dispositions WHERE d='CHANGED']) AS changed,
size([d IN dispositions WHERE d='REMOVED']) AS removed,
size([d IN dispositions WHERE d='REPEATED']) AS repeated,
size([d IN dispositions WHERE d='UNCHANGED']) AS unchanged
ORDER BY snapshot;
