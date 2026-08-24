DROP TABLE IF EXISTS turns;
DROP TABLE IF EXISTS prompt_blobs;
CREATE TABLE IF NOT EXISTS prompt_blobs (
  hash TEXT PRIMARY KEY, body TEXT NOT NULL, first_seen INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS turns (
  turn_id TEXT PRIMARY KEY, run_id TEXT, ts INTEGER, npc_id TEXT, turn_no INTEGER, kind TEXT,
  player_text TEXT, system_hash TEXT, last_user TEXT, blocks TEXT, neo_giong TEXT, body_goc TEXT,
  brain TEXT, calls TEXT, retried INTEGER, ms INTEGER, tok_in INTEGER, tok_out INTEGER, err TEXT,
  raw_json TEXT, verdict TEXT, thought TEXT, dialogue TEXT, emotion TEXT, convo_state TEXT,
  flags TEXT, player_claim TEXT, signal_raw TEXT, signal_final TEXT, gate_reason TEXT,
  scripted INTEGER, ua TEXT, country TEXT,
  dT INTEGER, dS INTEGER, dI INTEGER, dP INTEGER, state_out TEXT, delta_notes TEXT,
  fb TEXT, fb_at INTEGER);
CREATE INDEX IF NOT EXISTS i_run ON turns(run_id, ts);
CREATE INDEX IF NOT EXISTS i_ts ON turns(ts);
CREATE INDEX IF NOT EXISTS i_brain ON turns(brain);
CREATE INDEX IF NOT EXISTS i_verdict ON turns(verdict);
