MATCH (n:NormalizedTrace {projectionId:$projectionId})-[:DERIVED_FROM]->(src:SourceArtifact)
RETURN n.sourceFixtureRef AS fixture,n.profile AS profile,n.normalizedDigest AS normalizedDigest,src.cid AS cid;
