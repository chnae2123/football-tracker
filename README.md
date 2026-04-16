# FCG Football Tracker — data schema

2026 赛季球队数据。每场比赛一个 JSON 文件，累计数据由前端运行时聚合。

## Directory

```
data/
  roster.json                    # 花名册
  matches/
    _template.json               # 模板,不会被加载
    2026-03-22-vs-sp.json        # 一场真实比赛
    ...
```

## Roster schema (`roster.json`)

| Field | Type | Notes |
|---|---|---|
| `team.name` | string | 全称 |
| `team.shortName` | string | 3 letters, 用于球衣/徽章 |
| `team.season` | string | e.g. `"2025-26"` |
| `team.crest` | string \| null | 相对路径,e.g. `"assets/fcg.svg"` |
| `players[].id` | string | **slug**,永不改变,进球数据靠它归属 |
| `players[].number` | integer | 球衣号码,可能赛季间变化 |
| `players[].name` | string | 全名 |
| `players[].displayName` | string | 页面显示用的短名 |
| `players[].position` | enum | `"GK" \| "DEF" \| "MID" \| "FW"` |
| `players[].photo` | string \| null | 相对路径或 null |
| `players[].joined` | string \| null | `"YYYY-MM"` |

## Match schema (`matches/*.json`)

| Field | Type | Notes |
|---|---|---|
| `id` | string | 必须和文件名一致(不含 `.json`) |
| `date` | string | `"YYYY-MM-DD"` |
| `competition` | enum | `"league" \| "cup" \| "friendly"` |
| `matchday` | integer \| null | 联赛轮次,杯赛/友谊赛可 null |
| `venue` | enum | `"home" \| "away" \| "neutral"` |
| `opponent.name` / `.shortName` / `.crest` | | 同 team 结构 |
| `score.fcg` / `.opponent` | integer | 最终比分 |
| `formation` | string | e.g. `"2-3-1"`, `"3-2-1"`, `"2-2-2"` |
| `lineup` | array | 长度 7,顺序无所谓,`role` 决定阵型图位置 |
| `lineup[].playerId` | string | 必须存在于 roster |
| `lineup[].role` | enum | `"GK" \| "DEF" \| "MID" \| "FW"` |
| `goals` | array | 按发生顺序排列,用于比分推进显示 |
| `goals[].team` | enum | `"fcg" \| "opponent"` |
| `goals[].scorerId` | string \| null | opponent 进球可 null |
| `goals[].assistId` | string \| null | 没有助攻或不记得都填 null |
| `goals[].minute` | integer \| null | 不知道就 null,完全合法 |
| `notes` | string | 自由文本,写一两句当场的记忆 |

## File naming convention

`YYYY-MM-DD-vs-<opponent-slug>.json`

示例: `2026-03-22-vs-sp.json`

`id` 字段的值必须和文件名(去掉 `.json`)完全一致。

## Validation rules

- 所有 `playerId` 必须在 `roster.json` 存在
- `goals` 中 `fcg` team 的 `scorerId` 不能是 null
- `lineup` 长度必须是 7
- 以 `_` 开头的文件(如 `_template.json`)前端会忽略

## Adding a new match

1. 复制 `matches/_template.json`
2. 按 `YYYY-MM-DD-vs-opp.json` 命名
3. 填字段,`id` 改成和文件名一致
4. 把对手没参与的字段删掉(e.g. 如果某场没有对手进球,删掉 goals 数组里的 opponent 那条)
5. commit + push
