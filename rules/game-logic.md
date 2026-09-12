\# Game Logic Specification



\## Project: Modern Minesweeper



Build a premium, highly polished Minesweeper experience where the \*\*game logic is the foundation and interaction quality is the differentiator\*\*.



The goal is not to simply recreate classic Minesweeper. Build a modern puzzle game that preserves the intelligence and simplicity of Minesweeper while introducing multiple carefully designed modes, excellent game flow, tactile interaction, satisfying sound, thoughtful feedback, and extremely polished UX.



The game must feel fast, predictable, responsive, calm when appropriate, and highly satisfying to interact with.



The implementation must be production-grade, modular, deterministic where required, extensible, and free from fake or placeholder game logic.



\---



\# 1. Product Principles



The following principles are mandatory throughout the implementation.



\## 1.1 Gameplay First



The board and game interaction are always the primary focus.



Do not allow navigation, statistics, settings, decorative elements, or animations to interfere with gameplay.



Every interaction must feel intentional and immediate.



\## 1.2 No Account Required



The player must be able to open the application and immediately start playing.



No authentication.



No mandatory registration.



No backend-dependent gameplay.



No server requirement for core functionality.



All gameplay, settings, statistics, achievements, preferences, daily state, and history must work locally.



\## 1.3 Offline First



The complete playable experience must work without an internet connection.



PWA requirement: implement the application as an installable offline-capable PWA; the visual/design treatment is specified separately in `design.md`.



\## 1.4 Tactile Interaction



Every important interaction should have an appropriate response through some combination of:



\* visual feedback

\* animation

\* haptics where supported

\* sound where enabled

\* state change



Never add feedback simply because an effect is available. Feedback must communicate meaning.



\## 1.5 Fast Interaction



Input latency should feel effectively instantaneous.



Do not create artificial delays before:



\* revealing a cell

\* placing a flag

\* chording

\* restarting

\* changing modes

\* pausing



Animations may exist, but interaction must remain responsive.



\## 1.6 Respect the Player



Never interrupt gameplay with unnecessary dialogs.



Do not use confirmation dialogs for harmless reversible actions.



Use confirmation only when an action could cause meaningful loss of progress.



\---



\# 2. Core Game Model



The game must use a reusable Minesweeper engine rather than implementing each mode independently.



The engine should conceptually expose:



```text

GameEngine

├── Board

├── GridTopology

├── MineLayout

├── CellState

├── GameState

├── MoveHistory

├── Timer

├── Score

├── Difficulty

├── RNG / Seed

├── Solver

├── Validation

└── Statistics

```



The gameplay layer must be independent from the visual layer.



A UI component must never contain the core mine-generation or win-condition logic.



\---



\# 3. Cell States



Every cell needs explicit state.



Minimum states:



```text

Hidden

Revealed

Flagged

Questioned

Exploded

```



The implementation must prevent invalid combinations.



Examples:



\* A revealed cell cannot be flagged.

\* An exploded mine is no longer interactive.

\* A flagged cell cannot accidentally reveal through a normal reveal action.

\* Question-mark state is optional per mode and must be configurable.



\---



\# 4. Cell Data



Each cell should conceptually support:



```text

id

position

isMine

adjacentMineCount

state

revealedAt

flaggedAt

neighbors

```



Additional metadata can be added where useful for statistics, replay, or solver functionality.



Do not couple the cell structure to a specific visual representation.



A square, hexagonal, triangular, or future topology should use the same underlying conceptual cell model.



\---



\# 5. Board Generation



Board generation must be deterministic when a seed is supplied.



A seed must produce the same board every time.



This is required for:



\* Daily Puzzle

\* shared puzzles

\* replay

\* debugging

\* reproducibility

\* challenge boards

\* testing



The generator must support:



```text

width

height

mineCount

seed

firstClick

topology

difficulty

generationRules

```



\---



\# 6. First Click Safety



The first meaningful reveal must never result in an unavoidable immediate mine.



For Classic mode, the first click should be safe.



Preferably generate the board after the first click so that the initial area feels natural and useful.



The implementation should avoid intentionally producing terrible opening situations.



When a first-click-safe mode is enabled:



```text

Player clicks cell

&#x20;       ↓

Board generated

&#x20;       ↓

Clicked cell guaranteed safe

&#x20;       ↓

Reveal

&#x20;       ↓

Cascade if applicable

&#x20;       ↓

Start timer

```



Timer behavior must be defined consistently and must never start accidentally before the actual first action.



\---



\# 7. Neighbor Calculation



Neighbor relationships must be defined by the grid topology.



Classic square grid:



```text

NW  N  NE

&#x20;W  X   E

SW  S  SE

```



The engine must not hard-code eight-neighbor assumptions throughout the codebase.



Use a topology abstraction so future modes can define their own neighbors.



Example:



```text

GridTopology

├── Square

├── Hex

├── Triangle

├── Cylinder

└── Future custom topologies

```



\---



\# 8. Reveal Logic



When the player reveals a hidden safe cell:



\### Numbered cell



Reveal only that cell.



\### Zero cell



Reveal the zero and automatically cascade through connected zero cells and their bordering numbered cells.



The cascade must:



\* reveal all logically safe connected cells

\* never reveal mines

\* never overwrite flags

\* avoid unnecessary repeated work

\* animate naturally without making large boards slow



The implementation must remain performant on large boards.



\---



\# 9. Chording



Chording is a core mechanic and must be treated as a first-class interaction.



If a revealed numbered cell has a number equal to the count of adjacent flagged cells, reveal all remaining adjacent hidden cells.



Example:



```text

Number = 3

Adjacent flags = 3

Remaining hidden neighbors = safe

```



If the flag count does not match the number, chording should not reveal cells.



Wrong flags may therefore cause a mine explosion when the player chords incorrectly.



This behavior should remain consistent with classic Minesweeper logic.



\---



\# 10. Flagging



Desktop:



```text

Right click → Flag

```



Touch:



```text

Long press → Flag

```



Flagging should be fast and reversible.



Recommended cycle:



```text

Hidden → Flagged → Questioned → Hidden

```



The question-mark state must be optional through game/settings configuration.



Modes may disable question marks.



\---



\# 11. Input Model



Support platform-appropriate interactions.



\## Mouse



```text

Left click

Right click

Double click

Middle click where useful

```



\## Touch



```text

Tap

Long press

Double tap

Drag

Pinch

```



\## Keyboard



Provide sensible keyboard control.



Recommended mappings:



```text

Arrow keys      Navigate

Enter / Space   Reveal

F               Flag

Q               Question

R               Restart

Z               Undo where supported

P / Escape      Pause

```



Keyboard mappings must be discoverable in the controls/help interface.



Never trap keyboard focus unexpectedly.



\---



\# 12. Game Lifecycle



Every game should follow an explicit state machine.



Recommended states:



```text

Idle

Ready

Playing

Paused

Won

Lost

Abandoned

```



Transitions must be predictable.



Example:



```text

Idle

&#x20;↓

Start Game

&#x20;↓

Ready

&#x20;↓

First Reveal

&#x20;↓

Playing

&#x20;├── Pause → Paused → Resume → Playing

&#x20;├── Complete → Won

&#x20;├── Mine → Lost

&#x20;└── Restart → Ready

```



Do not mix temporary UI states with game states.



\---



\# 13. Winning



The standard win condition is:



> Every non-mine cell has been revealed.



Flagging every mine is not required.



This is important because players should be able to complete a board without placing flags.



When the last safe cell is revealed:



```text

Game → Won

Timer stops

Input locks

Score calculated

Statistics updated

Achievements checked

Result screen prepared

```



Do not require the player to flag every remaining mine.



\---



\# 14. Losing



When a mine is revealed:



```text

Game → Lost

```



The game should:



1\. Identify the triggered mine.

2\. Provide immediate tactile/audio feedback.

3\. Show the mine clearly.

4\. Reveal enough of the board to explain the result.

5\. Preserve the important context of the player's mistake.

6\. Stop the timer.

7\. Record the result.

8\. Offer immediate restart/retry.



Do not destroy the board with excessive animation.



The player should still be able to understand what happened.



\---



\# 15. Restart Flow



Restart should be extremely fast.



Recommended:



```text

Restart

&#x20;↓

Reset state

&#x20;↓

Preserve selected configuration

&#x20;↓

Generate fresh board or same seeded board according to mode

&#x20;↓

Ready for first interaction

```



For ordinary Classic mode, restart should normally generate a new board.



For deterministic challenge modes, the same seed may need to remain.



Do not unexpectedly reset the player's selected difficulty/settings.



\---



\# 16. Undo System



Undo is supported in practice-oriented modes.



Undo should restore:



```text

cell states

reveals

flags

question marks

timer-related state where appropriate

score state where appropriate

```



Do not allow undo to invalidate competitive records.



Recommended policy:



```text

Practice / Zen / Casual

&#x20;   Undo enabled



Competitive / Daily / Rush / Speed records

&#x20;   Undo disabled or marks run as non-competitive

```



The mode definition must explicitly decide whether undo is permitted.



\---



\# 17. Replay System



A completed run should optionally be reconstructible from recorded actions.



Store actions rather than snapshots where practical.



Example:



```text

Reveal(cell)

Flag(cell)

Question(cell)

Chord(cell)

```



Replay should be deterministic.



Replay data should allow:



```text

Play

Pause

Resume

Seek

0.5x

1x

2x

4x

Restart replay

```



Replay should never mutate the original result.



\---



\# 18. Classic Mode



Classic mode is the default experience.



Provide presets:



```text

Beginner

Intermediate

Expert

Custom

```



Classic should preserve recognizable Minesweeper rules.



Suggested preset examples:



\### Beginner



```text

9 × 9

10 mines

```



\### Intermediate



```text

16 × 16

40 mines

```



\### Expert



```text

30 × 16

99 mines

```



These may be configurable later, but the mode must remain familiar to players who know traditional Minesweeper.



\---



\# 19. No-Guess Mode



Create a dedicated logic-focused mode.



The defining rule:



> The generated board must be logically solvable without requiring a random guess.



Generation flow:



```text

Generate board

&#x20;↓

Run solver / validation

&#x20;↓

Evaluate solvability

&#x20;↓

If unsuitable:

&#x20;   reject board

&#x20;   generate another

&#x20;↓

Accept board

```



The solver should identify whether the board contains unavoidable guessing situations according to the game's supported logical rules.



The objective is to make the mode feel like a pure deduction puzzle.



This mode should have its own statistics.



\---



\# 20. Daily Puzzle



Create one deterministic puzzle per calendar day.



The same date must produce the same board for every player using the same game rules.



Conceptual flow:



```text

Current date

&#x20;↓

Create deterministic seed

&#x20;↓

Generate validated board

&#x20;↓

Play

&#x20;↓

Result saved locally

```



Daily puzzle should support:



```text

Completed today

Best time

Attempts

Win/loss

Personal streak

```



The Daily Puzzle must work offline.



No account or server is required.



The application may calculate the daily challenge entirely from the date and deterministic generation rules.



\---



\# 21. Rush Mode



A speed-focused mode.



The player receives a limited amount of time.



Possible configuration:



```text

60 seconds

```



Primary objective:



> Clear as much safe territory as possible before time expires.



Track:



```text

cells revealed

mines avoided

score

accuracy

streak

time survived

```



The mode should feel significantly faster than Classic.



UI feedback should emphasize speed without becoming distracting.



\---



\# 22. Zen Mode



A relaxed, pressure-free mode.



Rules:



\* No required timer.

\* No competitive score.

\* Calm interaction.

\* Optional hints.

\* Undo enabled.

\* Reduced pressure.

\* No aggressive failure presentation.



The purpose is to make Minesweeper enjoyable for players who care about solving rather than speed.



\---



\# 23. Infinite Mode



Create a future-ready mode where the player progresses through an effectively endless minefield.



The board should expand or generate additional territory as the player progresses.



Possible concepts:



```text

Distance

Depth

Cells cleared

Mines survived

```



Infinite mode should not be implemented as a giant pre-generated board if unnecessary.



Use controlled procedural expansion.



The architecture must prevent excessive memory usage.



This mode may use lives in its own ruleset, but lives must not affect Classic.



\---



\# 24. Hex Mode



Implement a hexagonal Minesweeper topology.



Each cell has six logical neighbors rather than eight.



The same fundamental rules should remain:



```text

Reveal

Flag

Question

Chord

Mine

Win

Loss

```



But all neighbor calculations must come from the topology engine.



Do not duplicate the entire game engine for hexagonal boards.



\---



\# 25. Cylinder / Wraparound Mode



Create a board where horizontal edges connect.



Conceptually:



```text

left edge ↔ right edge

```



A cell on the extreme left can therefore have neighbors on the extreme right.



This mode must use the topology abstraction.



Do not patch wraparound behavior directly into ordinary board logic.



\---



\# 26. Challenge Mode



Create handcrafted or deterministic puzzles with special objectives.



Examples:



```text

Clear under 30 seconds

No flags

No questions

Perfect run

Complete in a move limit

Clear a specific target area

```



Challenges should have explicit rules displayed before starting.



Never surprise the player with hidden modifiers.



\---



\# 27. No-Flag Mode



No flags may be placed.



The player must solve the board using reveals and deduction.



Win condition remains:



> Reveal all non-mine cells.



This creates a more mentally demanding variant while retaining the underlying rules.



\---



\# 28. Difficulty System



Do not define difficulty only by:



```text

more rows

more columns

more mines

```



Difficulty should consider board characteristics.



The engine should support metrics such as:



```text

Mine density

Board size

Opening size

Forced moves

Guess situations

Logical complexity

3BV

Move count

```



Use these metrics to classify generated boards.



Possible internal levels:



```text

Beginner

Easy

Medium

Hard

Expert

Brutal

Nightmare

```



Difficulty calculations should be data-driven and configurable.



\---



\# 29. 3BV / Board Complexity



Implement a board-complexity measurement suitable for comparing boards and speed runs.



3BV should be calculated independently of player performance.



Use it for:



\* board comparison

\* statistics

\* challenge balancing

\* speedrun analysis

\* difficulty generation



Never use 3BV as the only measure of difficulty.



\---



\# 30. Hint System



Hints should teach rather than simply reveal answers.



Recommended hierarchy:



\### Hint Level 1



Highlight a useful area.



\### Hint Level 2



Explain the relevant clue.



\### Hint Level 3



Explain the logical conclusion.



\### Hint Level 4



Reveal the recommended action.



Example:



```text

This 2 already has two confirmed mines nearby.



The remaining adjacent hidden cells are therefore safe.

```



Hints should be disabled or mark a run as non-competitive when appropriate.



\---



\# 31. Statistics



Store local statistics.



Minimum:



```text

Games played

Games won

Games lost

Win rate

Best time

Average time

Fastest win

Longest streak

Total cells revealed

Total mines found

Flags placed

Perfect games

```



Break statistics down by mode and difficulty.



Example:



```text

Classic

Expert

No Guess

Hex

Rush

Daily

```



Do not fabricate statistics for modes the player has never used.



\---



\# 32. Achievements



Achievements should reward meaningful mastery.



Examples:



```text

First Clear

Complete your first board.



Pure Logic

Complete 10 No-Guess boards.



No Flagger

Win a board without placing a flag.



Speed Demon

Complete an Expert board under a target time.



Hex Master

Complete 25 Hex boards.



Perfect Run

Complete a board without an incorrect flag.



Daily Habit

Complete multiple Daily Puzzles consecutively.



Survivor

Reach a major milestone in Infinite Mode.

```



Achievements should be stored locally.



\---



\# 33. Personal Records



Track mode-specific records.



Examples:



```text

Best Expert time

Best Rush score

Longest Infinite distance

Best Daily time

Highest Hex score

```



A record should only be saved if the run was eligible.



A run using:



```text

Undo

Hints

Non-standard modifiers

```



may be marked as non-competitive depending on the mode.



\---



\# 34. Local Persistence



Use local storage/indexed browser storage appropriate to the data size.



Persist:



```text

Settings

Theme preference

Sound preference

Haptics preference

Accessibility preferences

Statistics

Achievements

Records

Daily Puzzle history

Recent games

Replay metadata

```



Persist unfinished games where useful.



When the player returns to the application, offer:



> Continue game



rather than silently restoring a board.



\---



\# 35. Continue Game Flow



If an unfinished game exists:



```text

Open application

&#x20;↓

Detect unfinished game

&#x20;↓

Show Continue

&#x20;↓

Resume exact state

```



Also provide:



```text

New Game

```



Do not force restoration.



\---



\# 36. Pause Behavior



Pause must genuinely pause gameplay.



When paused:



\* Timer stops.

\* Board input stops.

\* Gameplay state remains intact.

\* Sensitive information should not accidentally become visible beyond intended pause behavior.



Resume must restore the game immediately.



On mobile, consider automatic pause when the page/app becomes unavailable if this improves fairness.



\---



\# 37. Visibility / App Switching



Handle browser visibility changes.



When the page becomes hidden during competitive timed modes, the game must follow a deterministic rule.



Preferred behavior:



```text

Competitive timed game

&#x20;   Pause or invalidate according to mode rules



Zen / Practice

&#x20;   Pause automatically

```



Do not allow backgrounding the application to create an unintended time advantage.



\---



\# 38. Game Result Flow



After Win:



```text

Board

&#x20;↓

Subtle completion feedback

&#x20;↓

Result

&#x20;↓

Time / Score

&#x20;↓

Comparison with personal record

&#x20;↓

Statistics update

&#x20;↓

Actions:

&#x20;   Play Again

&#x20;   Next Challenge / Daily

&#x20;   Review

&#x20;   Exit

```



After Loss:



```text

Board

&#x20;↓

Mine feedback

&#x20;↓

Result

&#x20;↓

Time / Progress

&#x20;↓

Optional Review

&#x20;↓

Retry

```



The player should be able to restart within one obvious action.



\---



\# 39. Result Presentation



Do not turn the result screen into a giant dashboard.



Prioritize:



```text

Result

Time / Score

Personal record status

Key statistic

Primary next action

```



Everything else should be secondary.



Example:



```text

CLEARED



48.72s



New Personal Best



Expert · 99 mines



\[ Play Again ]

\[ Review Board ]

```



\---



\# 40. Microinteraction Rules



Use animation to communicate state.



Examples:



\### Cell reveal



```text

Hidden

&#x20;↓

pressed state

&#x20;↓

revealed

```



\### Flag



```text

hidden

&#x20;↓

flag appears

&#x20;↓

small tactile response

```



\### Wrong mine



```text

mine revealed

&#x20;↓

impact

&#x20;↓

small board response

```



\### Win



```text

last safe cell

&#x20;↓

brief pause

&#x20;↓

completion response

```



Animations must never delay input unnecessarily.



\---



\# 41. Haptics



Haptics should be event-specific.



Recommended mapping:



```text

Reveal

Light impact



Flag

Light / medium impact



Question mark

Very light feedback



Chord

Short repeated pulse



Mine

Strong impact



Win

Short celebratory pattern



Invalid action

Very light warning feedback

```



Use haptics only where the platform supports them.



If unsupported, gameplay must remain fully functional.



Provide a global haptics setting.



Respect reduced-motion/accessibility preferences.



\---



\# 42. Sound



Sound should be similarly semantic.



Potential sound events:



```text

Cell reveal

Flag

Question

Chord

Mine

Win

Button interaction

Timer warning

New personal record

```



Sounds must be short and non-annoying.



Provide:



```text

Sound on/off

Master volume

Gameplay sounds

UI sounds

```



Do not autoplay unnecessary audio when browser restrictions prevent it.



The player should always be able to start the game silently.



\---



\# 43. Interaction Feedback Priority



When multiple feedback systems trigger simultaneously, maintain this priority:



```text

1\. Gameplay state

2\. Visual feedback

3\. Haptic feedback

4\. Audio feedback

5\. Secondary animation

```



Gameplay must never depend on sound or haptics.



\---



\# 44. Accessibility



The game must remain playable without:



\* sound

\* haptics

\* animation

\* color alone



Provide support for:



```text

Reduced motion

High contrast

Keyboard navigation

Focus visibility

Screen-reader friendly controls

Non-color mine/flag identification

Adjustable text sizing

```



Do not communicate a mine state using color alone.



\---



\# 45. Mobile Board Behavior



Large boards must remain usable on smaller screens.



Support:



```text

Pan

Pinch zoom

Automatic board fitting

Viewport-safe interaction

```



The board should never become so small that cells are difficult to interact with.



Do not prioritize fitting the entire board on screen over touch accuracy.



\---



\# 46. Desktop Board Behavior



On desktop:



\* Keep the board visually centered.

\* Avoid unnecessary scrolling for normal presets.

\* Use mouse interactions naturally.

\* Preserve keyboard focus.

\* Support right-click flagging without triggering an unwanted browser context menu over the board.



Large/custom boards may use controlled scrolling or zooming.



\---



\# 47. Touch Safety



Avoid accidental reveals while scrolling or interacting with the page.



Touch gestures must have clearly separated purposes.



Long press should not accidentally cause a normal tap plus a flag unless intentionally designed and consistently implemented.



Double tap should not cause an unexpected pair of reveals.



Gesture behavior must be deterministic.



\---



\# 48. Custom Game



Custom mode should allow players to define:



```text

Width

Height

Mine count

First-click safety

Question marks

Difficulty behavior

```



Validate impossible configurations.



Examples:



```text

Mine count >= total cells

```



must be rejected.



Extremely large boards must be constrained to protect browser performance.



The interface should explain limits rather than failing silently.



\---



\# 49. Mode Metadata



Every mode should define its rules declaratively.



Conceptually:



```text

ModeDefinition

├── id

├── name

├── description

├── topology

├── boardGenerator

├── timer

├── score

├── lives

├── undoAllowed

├── hintsAllowed

├── flagsAllowed

├── questionMarksAllowed

├── replayAllowed

├── competitive

└── winCondition

```



This makes adding future modes substantially easier.



Do not create mode-specific conditionals throughout the application.



\---



\# 50. Scoring



Classic Minesweeper should primarily focus on time.



Other modes may use score.



Score can consider:



```text

cells cleared

time

accuracy

streaks

difficulty

board complexity

mistakes

```



Avoid overly complicated scoring formulas.



Players should understand why they received a score.



\---



\# 51. Competitive Eligibility



A run can be marked:



```text

Competitive

Non-competitive

```



Possible reasons for non-competitive:



```text

Hint used

Undo used

Custom modifiers

Practice-only mode

Special assist enabled

```



The game should make this state visible before the player spends time on the run.



Never surprise the player by silently rejecting a record.



\---



\# 52. Daily Puzzle Integrity



Daily boards should be reproducible locally.



The board seed must depend on:



```text

date

mode

difficulty

generation version

```



Include a generation version so future algorithm changes do not accidentally change historical puzzle identities.



Conceptually:



```text

DailySeed =

hash(

&#x20;   date +

&#x20;   mode +

&#x20;   difficulty +

&#x20;   generatorVersion

)

```



\---



\# 53. Shareable Puzzle Identity



Every deterministic puzzle should have a compact identifier.



Example:



```text

MS-7F92KQ

```



The application must be able to reconstruct the same puzzle from the identifier where supported.



This allows future sharing of:



```text

Daily Puzzle

Challenge

Custom seeded board

```



without requiring a backend.



\---



\# 54. Error Handling



Never allow malformed game state to crash the entire application.



Validate:



```text

board dimensions

mine count

cell state

seed

mode definition

saved game data

replay data

```



If corrupted local state is detected:



```text

attempt recovery

&#x20;↓

if recovery fails:

&#x20;   discard only corrupted state

&#x20;   preserve unrelated settings/statistics

```



Do not wipe all player data because one game record is corrupted.



\---



\# 55. Performance



The game must remain responsive for:



\* rapid clicking

\* large boards

\* cascading reveals

\* repeated restarts

\* zooming/panning

\* replay

\* statistics updates



Avoid unnecessary rendering of the entire board when only a few cells change.



Separate:



```text

game state

derived state

UI state

animation state

```



where appropriate.



\---



\# 56. Deterministic Testing



The game engine must be testable without the UI.



Write tests for:



```text

mine generation

neighbor calculation

first-click safety

reveal

cascade

flagging

question state

chording

win detection

loss detection

undo

seed reproducibility

daily puzzle reproducibility

hex topology

wraparound topology

custom boards

score calculation

```



Use deterministic seeds in tests.



The engine should be capable of running completely headless.



\---



\# 57. Game Flow: New Player



A first-time player should experience:



```text

Open app

&#x20;↓

Immediately understand what the board is

&#x20;↓

Start playing

&#x20;↓

Learn controls naturally

&#x20;↓

Finish game

&#x20;↓

See simple result

&#x20;↓

Discover additional modes

```



Do not force a multi-step onboarding tutorial before allowing play.



Teach through contextual information where appropriate.



\---



\# 58. Game Flow: Returning Player



Returning player flow:



```text

Open app

&#x20;↓

Continue unfinished game OR start new game

&#x20;↓

Play

&#x20;↓

Result

&#x20;↓

Personal record / progress

&#x20;↓

Optional next game

```



The application should remember the player's preferred mode and settings.



\---



\# 59. Game Flow: Daily Player



```text

Open app

&#x20;↓

Daily Puzzle available

&#x20;↓

Play

&#x20;↓

Result

&#x20;↓

Record saved locally

&#x20;↓

Streak updated

&#x20;↓

Return tomorrow

```



Never make the Daily Puzzle dependent on login.



\---



\# 60. Navigation Philosophy



Gameplay should always be accessible in one primary action.



Prefer:



```text

Play

```



as the dominant entry point.



Other areas can include:



```text

Modes

Daily

Statistics

Achievements

Settings

```



The design should make the game feel like an experience rather than an administration panel.



\---



\# 61. Settings



Settings must affect actual behavior.



Potential settings:



```text

Sound

Haptics

Reduced motion

Confirm restart

Question marks

Tap behavior

Long-press behavior

Theme preference

Board zoom

Keyboard shortcuts

```



Do not expose settings that have no actual implementation.



\---



\# 62. No Fake Features



Do not create:



\* fake leaderboards

\* fake online players

\* fake cloud sync

\* fake multiplayer

\* fake notifications

\* placeholder challenges presented as completed features

\* meaningless achievements

\* decorative buttons with no functionality



Every visible control must perform a real action.



\---



\# 63. Architecture Goal



Design the system so the following can be added later without rewriting the core:



```text

More grid geometries

More challenge types

More difficulty systems

More replay functionality

Online leaderboard

Puzzle sharing

Multiplayer

Cloud sync

Additional statistics

```



These features are not required now.



The current implementation must simply avoid preventing them later.



\---



\# 64. Recommended V1 Modes



Prioritize quality over quantity.



V1 should include:



```text

Classic

&#x20;   Beginner

&#x20;   Intermediate

&#x20;   Expert

&#x20;   Custom



No Guess



Daily Puzzle



Rush



Zen

```



Build these exceptionally well before adding experimental variants.



\---



\# 65. Future Modes



Design the architecture to support:



```text

Hex

Cylinder

Infinite

No Flag

Challenge

Triangle

Other topology experiments

```



Future modes should be additions to the existing engine rather than rewrites.



\---



\# 66. V1 Priority Order



Implementation priority:



\### Tier 1



```text

Core Minesweeper engine

Classic mode

First-click safety

Reveal/cascade

Flags

Questions

Chording

Win/loss

Timer

Restart

Touch controls

Mouse controls

Keyboard controls

```



\### Tier 2



```text

No Guess

Daily Puzzle

Zen

Rush

Statistics

Local persistence

```



\### Tier 3



```text

Replay

Undo

Achievements

Advanced difficulty scoring

3BV

```



\### Tier 4



```text

Hex

Infinite

Cylinder

Challenge system

Puzzle sharing

```



Do not sacrifice the quality of Tier 1 to ship more modes.



\---



\# 67. UX Quality Bar



The final product should feel:



```text

Instant

Tactile

Quiet

Precise

Responsive

Premium

Logical

Addictive without being manipulative

```



It should never feel:



```text

Cluttered

Gamey for the sake of being gamey

Over-animated

Slow

Generic

Like a copied Windows Minesweeper clone

Like a dashboard pretending to be a game

```



The core loop must be extraordinarily satisfying:



```text

Think

&#x20;↓

Tap

&#x20;↓

Feel

&#x20;↓

See

&#x20;↓

Understand

&#x20;↓

Continue

```



Every reveal should feel good.



Every flag should feel deliberate.



Every correct deduction should feel rewarding.



Every mistake should be understandable.



Every win should feel earned.



\---



\# 68. Final Product Principle



Do not judge the project by the number of features implemented.



Judge it by this question:



> \*\*Does opening a cell, placing a flag, chording a number, making a deduction, and finally clearing the board feel exceptionally good?\*\*



The answer must be yes.



The game logic should remain mathematically correct, deterministic where required, highly testable, extensible, and independent from presentation.



The UX layer should then make those mechanics feel exceptionally responsive through carefully chosen visual feedback, haptics, sound, animation, gesture behavior, and flow.



`design.md` will define the detailed visual design system, iOS Human Interface Guidelines direction, components, layouts, typography, themes, animation language, and visual treatment.



