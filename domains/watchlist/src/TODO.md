# TODO

Connect apps/next to nats - forward to sse

## Servies

- domains/system
  - events: `fbt.events.system.heartbeat`

## Events

- events: health (readiness, liveness)
  - subject: `fbt.<service>.rpc.healthz.live`
  - subject: `fbt.<service>.event.healthz.live`
  - subject: `fbt.<service>.rpc.healthz.live`
  - subject: `fbt.<service>.event.healthz.ready`
- events: metrics ()
  - subject: `fbt.<service>.event.metricz`

## Apps

- rename @fbt/web to @fbt/cli
- add @fbt/web as nextjs app
- add panel layout similar to vscode
  - services
    - table/tree with each service, version, health
    - list of operations it supports
  - accounts
    - list of accounts
  - market
    - instruments: search, list
  - watchlist
    - broker, symbol, name, description, bid, ask, spread, volume
