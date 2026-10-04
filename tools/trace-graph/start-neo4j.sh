#!/usr/bin/env bash
set -euo pipefail
: "${JAVA_HOME:?Set JAVA_HOME to a Java 21 installation}"
: "${TRACE_NEO4J_ROOT:?Choose a new task-local directory outside the repository}"
if [ -e "$TRACE_NEO4J_ROOT" ]; then echo 'Use a new directory; refusing existing database/configuration.' >&2; exit 1; fi
mkdir -p "$TRACE_NEO4J_ROOT"
curl --fail --location https://dist.neo4j.org/neo4j-community-5.26.0-unix.tar.gz -o "$TRACE_NEO4J_ROOT/neo4j.tar.gz"
printf '%s  %s\n' ad8ac3398606145502b8f489530bbd39333707ae4668156af16b6086b5b037d7 "$TRACE_NEO4J_ROOT/neo4j.tar.gz" | shasum -a 256 -c -
tar -xzf "$TRACE_NEO4J_ROOT/neo4j.tar.gz" -C "$TRACE_NEO4J_ROOT"
trace_install="$TRACE_NEO4J_ROOT/neo4j-community-5.26.0"
cat > "$trace_install/conf/neo4j.conf" <<'CONFIG'
server.default_listen_address=127.0.0.1
server.bolt.listen_address=:17687
server.http.listen_address=:17474
server.https.enabled=false
server.memory.heap.initial_size=256m
server.memory.heap.max_size=512m
server.memory.pagecache.size=256m
dbms.security.auth_enabled=true
CONFIG
"$trace_install/bin/neo4j-admin" dbms set-initial-password trace-fixture-development
exec "$trace_install/bin/neo4j" console
