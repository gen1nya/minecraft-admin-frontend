# Minecraft Admin Plugin API

Плагин для Minecraft сервера (Bukkit/Spigot/Purpur), предоставляющий JSON API через RCON.

**Репозиторий:** https://github.com/gen1nya/minecraft-admin-bukkit-plugin

---

## Credentials

```
Server:   boris.local (192.168.129.18)
Port:     25575
Password: nahgheeZ2pheiv6Iu9aigheecha0eiChoh2ki9ceeholienoh8Ahbeideeb0oore
```

---

## Подключение

API доступно через RCON протокол.

### Пример подключения
```bash
mcrcon -H 127.0.0.1 -P 25575 -p 'PASSWORD' 'COMMAND'
```

---

## Команды API

### playerlist

Возвращает список всех игроков в whitelist.

**Команда:**
```
playerlist
```

**Ответ (JSON массив):**
```json
[
  {
    "name": "PlayerName",
    "uuid": "af31805e-fa71-4bfc-8108-424cae8d39e9",
    "isOp": false,
    "isOnline": false,
    "gameMode": "SURVIVAL"
  }
]
```

**Поля:**
| Поле | Тип | Описание |
|------|-----|----------|
| name | string | Имя игрока |
| uuid | string | UUID игрока |
| isOp | boolean | Является ли оператором |
| isOnline | boolean | Онлайн ли сейчас |
| gameMode | string | Игровой режим (SURVIVAL, CREATIVE, ADVENTURE, SPECTATOR, unknown) |

---

### serverstat

Возвращает статистику сервера.

**Команда:**
```
serverstat
```

**Ответ (JSON объект):**
```json
{
  "version": "1.21.10-2535-0a2dc04 (MC: 1.21.10)",
  "onlinePlayers": 0,
  "memoryUsedMB": 2753,
  "memoryAllocatedMB": 4096
}
```

**Поля:**
| Поле | Тип | Описание |
|------|-----|----------|
| version | string | Версия сервера (Purpur + MC) |
| onlinePlayers | int | Количество игроков онлайн |
| memoryUsedMB | int | Используемая память (MB) |
| memoryAllocatedMB | int | Выделенная память (MB) |

---

## Примеры использования

### Bash + mcrcon
```bash
# Получить список игроков
mcrcon -H 127.0.0.1 -P 25575 -p 'PASSWORD' 'playerlist'

# Получить статистику
mcrcon -H 127.0.0.1 -P 25575 -p 'PASSWORD' 'serverstat'
```

### Python + mcrcon
```python
from mcrcon import MCRcon

with MCRcon("127.0.0.1", "PASSWORD", port=25575) as mcr:
    players = mcr.command("playerlist")
    stats = mcr.command("serverstat")

    import json
    players_data = json.loads(players)
    stats_data = json.loads(stats)
```

### Node.js + rcon
```javascript
const Rcon = require('rcon');

const conn = new Rcon('127.0.0.1', 25575, 'PASSWORD');
conn.on('auth', () => {
  conn.send('playerlist');
  conn.send('serverstat');
});
conn.connect();
```

---

## Дополнительные порты сервера

| Порт | Протокол | Назначение |
|------|----------|------------|
| 25565 | TCP/UDP | Minecraft (игровой) |
| 25575 | TCP | RCON |
| 9940 | TCP | Prometheus метрики |
| 24454 | UDP | Simple Voice Chat |

## Prometheus метрики

Доступны на `http://127.0.0.1:9940/metrics`

Основные метрики:
- `mc_players_online_total` — игроки онлайн
- `mc_jvm_gc_collection_seconds` — GC статистика
- `mc_tps` — TPS сервера
