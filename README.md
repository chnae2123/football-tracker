# FCG Football Tracker — data schema

Fettes College Guangzhou 7-a-side 球队赛季数据。每场比赛一个 JSON 文件,累计数据由前端运行时聚合。多个赛季互相独立,共用一个球员数据库和一个史册。

## Directory

```
data/
  players.json                       # 全队史稳定球员库(跨赛季)
  history.json                       # 跨赛季文章/周报/专栏
  seasons/
    2025-26/
      season.json                    # 本赛季 team + squad + coaches
      matches/
        2026-04-16-vs-aic.json       # 一场真实比赛
        ...
    2026-27/
      season.json
      matches/
        ...
```

- 每个赛季是 `seasons/<slug>/` 下的一个独立文件夹
- slug 格式 `YYYY-YY`(跨年赛季)或 `YYYY`(单年),字典序倒排后最大的为当前赛季
- `data/players.json` 是**跨赛季稳定球员库**,`id` 永不改变;进球数据靠它归属
- 每赛季的 `season.json#squad[]` 只记录这一季该球员的**号码/位置/队长**等可变信息
- 球员离队:下个赛季的 `season.json#squad[]` 不再包含他即可,历史比赛仍能正确显示
- 新加入:在 `players.json` 新增一条记录,在新赛季 `season.json#squad[]` 挂上

## `players.json` schema (跨赛季)

| Field | Type | Notes |
|---|---|---|
| `players[].id` | string | **slug**,永不改变 |
| `players[].name` | string | 全名(中文) |
| `players[].displayName` | string | 页面显示用的短名(英文昵称) |
| `players[].photo` | string \| null | 相对路径或 null |
| `players[].firstSeason` | string \| null | 首次出现的赛季 slug,仅信息用途 |

## `seasons/<slug>/season.json` schema (每赛季一份)

| Field | Type | Notes |
|---|---|---|
| `team.name` | string | 全称 |
| `team.shortName` | string | 3 letters,用于球衣/徽章 |
| `team.season` | string | e.g. `"2025-26"` |
| `team.crest` | string \| null | 相对路径,e.g. `"assets/fcg.svg"` |
| `squad[].playerId` | string | 必须在 `players.json` 存在 |
| `squad[].number` | integer \| null | 球衣号码,赛季间可变 |
| `squad[].position` | array of enum \| null | `["GK"]`, `["DEF", "MID"]` 等;不固定的填 `null` |
| `squad[].captain` | boolean | 当前队长标记 |
| `squad[].joined` | string \| null | `"YYYY-MM"` |
| `squad[].left` | string \| null | `"YYYY-MM"`,未离队填 `null` |
| `coaches[].name` | string | 教练全名 |
| `coaches[].displayName` | string | 显示名,如 `"Mr Wise"` |

## `seasons/<slug>/matches/*.json` schema

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
| `lineup` | array | 首发 7 人,`role` 决定阵型图位置 |
| `lineup[].playerId` | string | 必须在 `players.json` 存在 |
| `lineup[].role` | enum | `"GK" \| "DEF" \| "MID" \| "FW"` |
| `substitutes` | array of string | 登场替补的 playerId(无限换人,只看有没有上) |
| `goals` | array | 按发生顺序排列,用于比分推进显示 |
| `goals[].team` | enum | `"fcg" \| "opponent"` |
| `goals[].scorerId` | string \| null | opponent 进球可 null |
| `goals[].assistId` | string \| null | 没有助攻或不记得都填 null |
| `goals[].minute` | integer \| null | 不知道就 null,完全合法 |
| `notes` | string | 自由文本,写一两句当场的记忆 |
| `gallery` | array | 可选,赛后照片/视频/球员感想(见下) |

### Gallery item schema

| Field | Type | Notes |
|---|---|---|
| `type` | enum | `"photo" \| "video" \| "quote"` |
| `src` | string | `photo`/`video` 的相对路径 |
| `caption` | string \| null | `photo`/`video` 的说明 |
| `text` | string | `quote` 类型的正文 |
| `author` | string \| null | `quote` 的 playerId(必须在 `players.json`) |

## `history.json` schema (跨赛季)

History 页面是周报、专栏、赛后手记这类文字作品的集合。每条 entry 是一篇文章,不绑定具体赛季。

| Field | Type | Notes |
|---|---|---|
| `articles[].id` | string | slug,URL 用,必须唯一 |
| `articles[].date` | string | `"YYYY-MM-DD"` |
| `articles[].type` | enum | `"recap" \| "column" \| "weekly" \| "feature"` |
| `articles[].title` | string | 主标题 |
| `articles[].subtitle` | string \| null | 副标题,可选 |
| `articles[].author` | string \| null | 作者的 `playerId` |
| `articles[].matchId` | string \| null | 关联比赛,渲染为底部卡片 |
| `articles[].cover` | string \| null | 封面图路径,可选 |
| `articles[].paragraphs` | array of string | 段落,每条一段 |

## File naming convention

`YYYY-MM-DD-vs-<opponent-slug>.json`

示例: `2026-03-22-vs-sp.json`

`id` 字段的值必须和文件名(去掉 `.json`)完全一致。

## Validation rules

- 所有 `playerId` 必须在 `players.json` 存在
- 比赛文件里 `lineup` / `substitutes` / `goals` 中出现的 `playerId` 应在该赛季 `squad[]` 中
- `goals` 中 `fcg` team 的 `scorerId` 不能是 null
- `lineup` 长度必须是 7
- `substitutes` 里不能出现在 `lineup` 里的 playerId
- 以 `_` 开头的文件(如 `_template.json`)前端会忽略

## Adding a new match

1. 在当前赛季 `data/seasons/<slug>/matches/` 下参考已有比赛创建新文件
2. 按 `YYYY-MM-DD-vs-opp.json` 命名,`id` 改成和文件名一致
3. 新比赛 `gallery` 先留空数组 `[]`,后续补素材
4. commit + push

## Adding a new season

1. 创建 `data/seasons/<new-slug>/season.json`,抄上一季的 shape,调整 `team.season` 和 `squad[]`
   - 离队球员从 `squad[]` 移除(历史比赛仍引用他们,没问题)
   - 新球员先在 `data/players.json` 加一条 stable 记录,再在 `squad[]` 挂号码和位置
2. 创建 `data/seasons/<new-slug>/matches/` 目录
3. 前端自动把 slug 字典序最大的赛季当作"当前赛季"
