MATCH (r:TraceRun {projectionId:$projectionId})-[:HAS_WINDOW]->(w:TraceWindow)-[:HAS_RECORD]->(e:TraceRecord)
RETURN r.runRef AS run,w.windowRef AS window,e.sourceSequence AS sequence,e.eventType AS event
ORDER BY sequence;
