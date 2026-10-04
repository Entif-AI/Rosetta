MATCH (child:TraceRecord {projectionId:$projectionId})-[:PARENT_REF]->(parent:TraceObject)
RETURN child.sourceSequence AS sequence,parent.objectId AS parent
ORDER BY sequence;
