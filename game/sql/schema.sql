-- Sổ đen v2.0 — mỗi lượt gọi /api/converse ghi MỘT dòng, mỗi cột mốc phía máy chơi ghi một dòng.
-- Ghi kiểu "gửi rồi đi" (waitUntil) nên không làm chậm lượt chơi.
CREATE TABLE IF NOT EXISTS turns (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ts            INTEGER NOT NULL,
  session       TEXT,
  run_id        TEXT,
  deploy        TEXT,
  mode          TEXT,
  lang          TEXT,
  npc           TEXT,
  night         INTEGER,
  turn          INTEGER,
  kind          TEXT,
  player_text   TEXT,
  npc_text      TEXT,
  brain         TEXT,
  tried         TEXT,
  scripted      INTEGER DEFAULT 0,
  latency_ms    INTEGER,
  tok_in        INTEGER,
  tok_out       INTEGER,
  verdict       TEXT,
  emotion       TEXT,
  trust         INTEGER,
  suspicion     INTEGER,
  interest      INTEGER,
  patience      INTEGER,
  friend        INTEGER,
  invite_intent INTEGER DEFAULT 0,
  final_test    INTEGER DEFAULT 0,
  contradiction INTEGER DEFAULT 0,
  corroboration INTEGER DEFAULT 0,
  shutdown      INTEGER DEFAULT 0,
  signal_raw    TEXT,
  signal_final  TEXT,
  gate_reason   TEXT,
  retried       INTEGER DEFAULT 0,
  reply_lang    TEXT,
  err           TEXT
);
CREATE INDEX IF NOT EXISTS idx_turns_ts      ON turns(ts);
CREATE INDEX IF NOT EXISTS idx_turns_session ON turns(session);
CREATE INDEX IF NOT EXISTS idx_turns_brain   ON turns(brain);

CREATE TABLE IF NOT EXISTS events (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  ts       INTEGER NOT NULL,
  session  TEXT,
  run_id   TEXT,
  deploy   TEXT,
  name     TEXT,
  mode     TEXT,
  lang     TEXT,
  npc      TEXT,
  night    INTEGER,
  detail   TEXT
);
CREATE INDEX IF NOT EXISTS idx_events_ts      ON events(ts);
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session);
CREATE INDEX IF NOT EXISTS idx_events_name    ON events(name);
