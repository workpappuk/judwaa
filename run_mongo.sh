#!/usr/bin/env zsh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MONGO_BIN="$SCRIPT_DIR/extras/mongodb/bin/mongod"
DB_PATH="${MONGO_DB_PATH:-$SCRIPT_DIR/extras/backend/db_data/mongodb}"
LOG_DIR="${MONGO_LOG_DIR:-$DB_PATH/log}"
LOG_PATH="${MONGO_LOG_PATH:-$LOG_DIR/mongod.log}"
PID_PATH="${MONGO_PID_PATH:-$DB_PATH/mongod.pid}"
BIND_IP="${MONGO_BIND_IP:-127.0.0.1}"
PORT="${MONGO_PORT:-27017}"

usage() {
  cat <<'EOF'
Usage: ./run_mongo.sh [start|foreground|stop|status|restart]

Commands:
  start       Start MongoDB in background (default)
  foreground  Start MongoDB in foreground
  stop        Stop MongoDB process started by this script
  status      Show MongoDB process status
  restart     Restart MongoDB

Environment overrides:
  MONGO_DB_PATH, MONGO_LOG_DIR, MONGO_LOG_PATH, MONGO_PID_PATH,
  MONGO_BIND_IP, MONGO_PORT
EOF
}

require_binary() {
  if [[ ! -x "$MONGO_BIN" ]]; then
    echo "mongod binary not found or not executable at: $MONGO_BIN" >&2
    exit 1
  fi
}

ensure_paths() {
  mkdir -p "$DB_PATH" "$LOG_DIR"
}

is_running() {
  if [[ -f "$PID_PATH" ]]; then
    local pid
    pid="$(cat "$PID_PATH" 2>/dev/null || true)"
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      return 0
    fi
  fi
  return 1
}

start_bg() {
  require_binary
  ensure_paths

  if is_running; then
    echo "MongoDB already running (pid $(cat "$PID_PATH"))"
    return 0
  fi

  if [[ "$(uname -s)" == "Darwin" ]]; then
    nohup "$MONGO_BIN" \
      --dbpath "$DB_PATH" \
      --bind_ip "$BIND_IP" \
      --port "$PORT" \
      >>"$LOG_PATH" 2>&1 &

    local bg_pid=$!
    echo "$bg_pid" > "$PID_PATH"

    for _ in {1..25}; do
      if kill -0 "$bg_pid" 2>/dev/null; then
        break
      fi
      sleep 0.2
    done

    if ! kill -0 "$bg_pid" 2>/dev/null; then
      echo "MongoDB failed to start. Check log: $LOG_PATH" >&2
      rm -f "$PID_PATH"
      return 1
    fi
  else
    "$MONGO_BIN" \
      --dbpath "$DB_PATH" \
      --logpath "$LOG_PATH" \
      --pidfilepath "$PID_PATH" \
      --fork \
      --bind_ip "$BIND_IP" \
      --port "$PORT"
  fi

  echo "MongoDB started"
  echo "  pid: $(cat "$PID_PATH")"
  echo "  db:  $DB_PATH"
  echo "  log: $LOG_PATH"
  echo "  uri: mongodb://$BIND_IP:$PORT"
}

start_fg() {
  require_binary
  ensure_paths

  if is_running; then
    echo "MongoDB already running (pid $(cat "$PID_PATH"))"
    return 0
  fi

  echo "Starting MongoDB in foreground on mongodb://$BIND_IP:$PORT"
  exec "$MONGO_BIN" \
    --dbpath "$DB_PATH" \
    --bind_ip "$BIND_IP" \
    --port "$PORT"
}

stop_mongo() {
  if ! [[ -f "$PID_PATH" ]]; then
    echo "No pid file at $PID_PATH"
    return 1
  fi

  local pid
  pid="$(cat "$PID_PATH" 2>/dev/null || true)"

  if [[ -z "$pid" ]]; then
    echo "Pid file is empty: $PID_PATH"
    return 1
  fi

  if ! kill -0 "$pid" 2>/dev/null; then
    echo "Process $pid is not running. Removing stale pid file."
    rm -f "$PID_PATH"
    return 1
  fi

  kill "$pid"

  for _ in {1..30}; do
    if ! kill -0 "$pid" 2>/dev/null; then
      rm -f "$PID_PATH"
      echo "MongoDB stopped"
      return 0
    fi
    sleep 0.2
  done

  echo "MongoDB did not stop in time. You can force stop with: kill -9 $pid" >&2
  return 1
}

status_mongo() {
  if is_running; then
    echo "MongoDB is running"
    echo "  pid: $(cat "$PID_PATH")"
    echo "  db:  $DB_PATH"
    echo "  log: $LOG_PATH"
    echo "  uri: mongodb://$BIND_IP:$PORT"
  else
    echo "MongoDB is not running"
    echo "  expected pid file: $PID_PATH"
  fi
}

cmd="${1:-start}"

case "$cmd" in
  start)
    start_bg
    ;;
  foreground)
    start_fg
    ;;
  stop)
    stop_mongo
    ;;
  status)
    status_mongo
    ;;
  restart)
    stop_mongo || true
    start_bg
    ;;
  -h|--help|help)
    usage
    ;;
  *)
    echo "Unknown command: $cmd" >&2
    usage
    exit 1
    ;;
esac
