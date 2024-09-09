import { ReactNode, useState } from "react";
import _operators from "./operators_wordle.json";
import _teamtable from "./handbook_team_table.json";

const operators: Operators = _operators;
const teamTable: HandbookTeam = _teamtable;
const headers = [
  "Name",
  "Gender",
  "Race",
  "Allegiance",
  "Infected",
  "Profession",
  "Rarity",
  "DP Cost (E2)",
];

function App() {
  const [guessStack, setGuessStack] = useState<Guess[]>([
    {
      false: {
        race: new Set(),
        gender: new Set(),
        profession: new Set(),
        infection: new Set(),
        rarity: {},
        cost: {},
        allegiance: new Set(),
      },
      true: {},
    },
  ]);
  const guess = guessStack.at(-1)!;
  const [genderButton, setGenderButton] = useState<ThreeState>(undefined);
  const [raceButton, setRaceButton] = useState<ThreeState>(undefined);
  const [professionButton, setProfessionButton] =
    useState<ThreeState>(undefined);
  const [infectedButton, setInfectedButton] = useState<ThreeState>(undefined);
  const [rarityButton, setRarityButton] =
    useState<FourStateNotAllegiance>(undefined);
  const [costButton, setCostButton] =
    useState<FourStateNotAllegiance>(undefined);
  const [allegianceButton, setAllegianceButton] =
    useState<FourStateAllegiance>(undefined);
  const [selectedOperator, setSelectedOperator] = useState<string | undefined>(
    Object.keys(operators)[0],
  );
  const [history, setHistory] = useState<
    {
      id: string;
      gender: ThreeState;
      race: ThreeState;
      infected: ThreeState;
      profession: ThreeState;
      rarity: FourStateNotAllegiance;
      cost: FourStateNotAllegiance;
      allegiance: FourStateAllegiance;
    }[]
  >([]);
  const [tempOperators, setTempOperators] = useState<Set<string>>(
    new Set(Object.keys(operators)),
  );
  const [addButtonState, setAddButtonState] = useState<boolean>(false);
  const lastOperator = selectedOperator
    ? operators[selectedOperator]
    : undefined;
  const [page, setPage] = useState<number>(0);
  const pages = 10;
  const [search, setSearch] = useState<string>("");
  const [sortCost, setSortCost] = useState<SortState>("dis");
  const [sortRarity, setSortRarity] = useState<SortState>("dis");
  const tableOperators = Array.from(tempOperators.values()).filter(
    (id) =>
      operators[id].name.toLowerCase().includes(search) ||
      id.toLowerCase().includes(search),
  );
  if (sortCost !== "dis") {
    tableOperators.sort((a, b) => {
      const diff = operators[a].cost[1] - operators[b].cost[1];
      return sortCost === "asc" ? diff : -diff;
    });
  }
  if (sortRarity !== "dis") {
    tableOperators.sort((a, b) => {
      const diff = operators[a].rarity - operators[b].rarity;
      return sortRarity === "asc" ? diff : -diff;
    });
  }
  return (
    <div className="w-full min-h-screen flex-col flex container">
      <h1 className="justify-center flex">AK WORDLE SOLVER</h1>
      <div className="flex flex-row justify-center items-center gap-x-3">
        <button
          className="p-2 items-center rounded-md bg-white text-black hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opasity-50 disabled:pointer-events-none border"
          type="button"
          disabled={
            addButtonState ||
            genderButton === undefined ||
            raceButton === undefined ||
            allegianceButton === undefined ||
            professionButton === undefined ||
            costButton === undefined ||
            rarityButton === undefined ||
            infectedButton === undefined
          }
          onClick={() => {
            const newGuess: Guess = {
              false: {
                race: raceButton
                  ? guess.false.race
                  : new Set(guess.false.race).add(lastOperator!.race),
                gender: genderButton
                  ? guess.false.gender
                  : new Set(guess.false.gender).add(lastOperator!.gender),
                profession: professionButton
                  ? guess.false.profession
                  : new Set(guess.false.profession).add(
                      lastOperator!.profession,
                    ),
                infection: infectedButton
                  ? guess.false.infection
                  : new Set(guess.false.infection).add(lastOperator!.infection),
                cost: {
                  lower:
                    costButton === "Lower"
                      ? Math.min(
                          guess.false.cost.lower ?? 100,
                          lastOperator!.cost[1],
                        )
                      : guess.false.cost.lower,
                  higher:
                    costButton === "Higher"
                      ? Math.max(
                          guess.false.cost.higher ?? 0,
                          lastOperator!.cost[1],
                        )
                      : guess.false.cost.higher,
                },
                rarity: {
                  lower:
                    rarityButton === "Lower"
                      ? Math.min(
                          guess.false.rarity.lower ?? 100,
                          lastOperator!.rarity,
                        )
                      : guess.false.rarity.lower,
                  higher:
                    rarityButton === "Higher"
                      ? Math.max(
                          guess.false.rarity.higher ?? 0,
                          lastOperator!.rarity,
                        )
                      : guess.false.rarity.higher,
                },
                allegiance:
                  allegianceButton === "Wrong"
                    ? new Set(guess.false.allegiance).add(
                        lastOperator!.allegiance.nationId!,
                      )
                    : allegianceButton === "Partially"
                    ? new Set(guess.false.allegiance).add(
                        lastOperator?.allegiance.teamId ??
                          lastOperator!.allegiance.groupId!,
                      )
                    : guess.false.allegiance,
              },
              true: {
                gender: genderButton ? lastOperator?.gender : undefined,
                race: raceButton ? lastOperator?.race : undefined,
                profession: professionButton
                  ? lastOperator?.profession
                  : undefined,
                infection: infectedButton ? lastOperator?.infection : undefined,
                cost:
                  costButton === "Correct" ? lastOperator?.cost[1] : undefined,
                rarity:
                  rarityButton === "Correct" ? lastOperator?.rarity : undefined,
                allegiance:
                  allegianceButton === "Correct"
                    ? lastOperator?.allegiance.teamId ??
                      lastOperator?.allegiance.groupId ??
                      lastOperator!.allegiance.nationId!
                    : allegianceButton === "Partially"
                    ? lastOperator?.allegiance.nationId ??
                      lastOperator?.allegiance.groupId ??
                      lastOperator!.allegiance.teamId!
                    : undefined,
              },
            };
            const newGuessStack = guessStack.slice();
            newGuessStack.push(newGuess);
            setGuessStack(newGuessStack);
            const newSet = new Set(tempOperators);
            newSet.delete(selectedOperator!);
            filterSet(newSet, newGuess);
            setTempOperators(newSet);
            setHistory([
              {
                id: selectedOperator!,
                gender: genderButton!,
                race: raceButton!,
                allegiance: allegianceButton!,
                cost: costButton!,
                rarity: rarityButton!,
                profession: professionButton!,
                infected: infectedButton!,
              },
              ...history,
            ]);
            const { value, done } = newSet.values().next();
            if (!done) {
              setSelectedOperator(value);
            } else {
              setAddButtonState(true);
            }
            setSearch("");
          }}
        >
          Add
        </button>
        <button
          className="p-2 items-center rounded-md bg-red-500 text-white hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opasity-50 disabled:pointer-events-none"
          onClick={() => {
            setHistory([]);
            setTempOperators(new Set(Object.keys(operators)));
            setAddButtonState(false);
            setGuessStack([
              {
                false: {
                  race: new Set(),
                  gender: new Set(),
                  profession: new Set(),
                  infection: new Set(),
                  rarity: {},
                  cost: {},
                  allegiance: new Set(),
                },
                true: {},
              },
            ]);
            setSearch("");
          }}
        >
          Reset
        </button>
        <button
          className="inline-flex justify-center py-2 px-4 items-center rounded-md bg-red-500 text-white hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opasity-50 disabled:pointer-events-none"
          onClick={() => {
            const newHistory = history.slice();
            newHistory.pop();
            setHistory(newHistory);
            const newGuessStack = guessStack.slice();
            newGuessStack.pop();
            setGuessStack(newGuessStack);
            const newSet = new Set(Object.keys(operators));
            filterSet(newSet, newGuessStack.at(-1)!);
            setTempOperators(newSet);
          }}
        >
          Remove Last Entry
        </button>
      </div>
      <div className="flex flex-row">
        <table className="table-fixed border-separate border-spacing-3">
          <thead>
            <tr>
              {headers.map((h) => (
                <SquareContainer className="bg-black font-bold" key={h}>
                  {h}
                </SquareContainer>
              ))}
            </tr>
          </thead>
          <tbody>
            {lastOperator && tempOperators.size > 0 && (
              <tr>
                <SquareContainer className="bg-black font-bold">
                  {lastOperator.name}
                </SquareContainer>
                <SquareContainer
                  className={threeStateButtonColor(genderButton)}
                >
                  <button
                    className="w-full h-full"
                    type="button"
                    onClick={() => {
                      if (genderButton === undefined) {
                        setGenderButton(false);
                      } else {
                        setGenderButton(!genderButton);
                      }
                    }}
                  >
                    {lastOperator.gender}
                  </button>
                </SquareContainer>
                <SquareContainer className={threeStateButtonColor(raceButton)}>
                  <button
                    className="w-full h-full"
                    onClick={() => {
                      if (raceButton === undefined) {
                        setRaceButton(false);
                      } else {
                        setRaceButton(!raceButton);
                      }
                    }}
                  >
                    {lastOperator.race}
                  </button>
                </SquareContainer>
                <SquareContainer
                  className={fourStateButtonColor(allegianceButton, true)}
                >
                  <button
                    className="w-full h-full"
                    onClick={() => {
                      if (allegianceButton === undefined) {
                        setAllegianceButton("Wrong");
                      } else if (allegianceButton === "Wrong") {
                        setAllegianceButton("Partially");
                      } else if (allegianceButton === "Partially") {
                        setAllegianceButton("Correct");
                      } else {
                        setAllegianceButton("Wrong");
                      }
                    }}
                  >
                    {
                      teamTable[
                        lastOperator.allegiance.teamId
                          ? lastOperator.allegiance.teamId
                          : lastOperator.allegiance.groupId
                          ? lastOperator.allegiance.groupId
                          : lastOperator.allegiance.nationId!
                      ].powerName
                    }
                  </button>
                </SquareContainer>
                <SquareContainer
                  className={threeStateButtonColor(infectedButton)}
                >
                  <button
                    className="w-full h-full"
                    onClick={() => {
                      if (infectedButton === undefined) {
                        setInfectedButton(false);
                      } else {
                        setInfectedButton(!infectedButton);
                      }
                    }}
                  >
                    {lastOperator.infection ? "Yes" : "No"}
                  </button>
                </SquareContainer>
                <SquareContainer
                  className={threeStateButtonColor(professionButton)}
                >
                  <button
                    className="w-full h-full"
                    onClick={() => {
                      if (professionButton === undefined) {
                        setProfessionButton(false);
                      } else {
                        setProfessionButton(!professionButton);
                      }
                    }}
                  >
                    {professions[lastOperator.profession]}
                  </button>
                </SquareContainer>
                <SquareContainer className={fourStateButtonColor(rarityButton)}>
                  <button
                    className="w-full h-full"
                    onClick={() => {
                      if (rarityButton === undefined) {
                        setRarityButton("Lower");
                      } else if (rarityButton === "Lower") {
                        setRarityButton("Higher");
                      } else if (rarityButton === "Higher") {
                        setRarityButton("Correct");
                      } else {
                        setRarityButton("Lower");
                      }
                    }}
                  >
                    {lastOperator.rarity}
                    <br />
                    {rarityButton}
                  </button>
                </SquareContainer>
                <SquareContainer className={fourStateButtonColor(costButton)}>
                  <button
                    className="w-full h-full"
                    onClick={() => {
                      if (costButton === undefined) {
                        setCostButton("Lower");
                      } else if (costButton === "Lower") {
                        setCostButton("Higher");
                      } else if (costButton === "Higher") {
                        setCostButton("Correct");
                      } else {
                        setCostButton("Lower");
                      }
                    }}
                  >
                    E0: {lastOperator.cost[0]}
                    <br />
                    <b>E2: {lastOperator.cost[1]}</b>
                    <br />
                    {costButton}
                  </button>
                </SquareContainer>
              </tr>
            )}
            {history.map((op) => {
              const operator = operators[op.id];
              return (
                <tr key={op.id}>
                  <SquareContainer className="bg-black font-bold">
                    {operator.name}
                  </SquareContainer>
                  <SquareContainer className={threeStateButtonColor(op.gender)}>
                    {operator.gender}
                  </SquareContainer>
                  <SquareContainer className={threeStateButtonColor(op.race)}>
                    {operator.race}
                  </SquareContainer>
                  <SquareContainer
                    className={fourStateButtonColor(op.allegiance, true)}
                  >
                    {
                      teamTable[
                        operator.allegiance.teamId
                          ? operator.allegiance.teamId
                          : operator.allegiance.groupId
                          ? operator.allegiance.groupId
                          : operator.allegiance.nationId!
                      ].powerName
                    }
                  </SquareContainer>
                  <SquareContainer
                    className={threeStateButtonColor(op.infected)}
                  >
                    {operator.infection ? "Yes" : "No"}
                  </SquareContainer>
                  <SquareContainer
                    className={threeStateButtonColor(op.profession)}
                  >
                    {professions[operator.profession]}
                  </SquareContainer>
                  <SquareContainer className={fourStateButtonColor(op.rarity)}>
                    {operator.rarity}
                    <br />
                    {op.rarity}
                  </SquareContainer>
                  <SquareContainer className={fourStateButtonColor(op.cost)}>
                    E0: {operator.cost[0]}
                    <br />
                    <b>E2: {operator.cost[1]}</b>
                    <br />
                    {op.cost}
                  </SquareContainer>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex flex-col gap-y-2">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="text"
            onChange={(e) => {
              setPage(
                Math.min(page, Math.floor(tableOperators.length / pages)),
              );
              setSearch(e.target.value);
            }}
            value={search}
          />
          <div className="flex flex-row gap-x-3">
            <button
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 px-4 py-2 bg-white text-black hover:bg-gray-300"
              type="button"
              onClick={() => setPage(Math.max(page - 1, 0))}
            >
              Previous Page
            </button>
            <button
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 px-4 py-2 bg-white text-black hover:bg-gray-300"
              type="button"
              onClick={() =>
                setPage(
                  Math.min(page + 1, Math.floor(tableOperators.length / pages)),
                )
              }
            >
              Next Page
            </button>
          </div>
          <table className="table-fixed">
            <thead>
              <tr className="">
                {headers.map((h) => (
                  <th
                    onClick={
                      h.includes("Cost")
                        ? () => {
                            setSortCost(getNextSortState(sortCost));
                          }
                        : h.includes("Rarity")
                        ? () => {
                            setSortRarity(getNextSortState(sortRarity));
                          }
                        : undefined
                    }
                    key={h}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableOperators
                .slice(pages * page, pages * page + pages)
                .map((id) => (
                  <tr
                    key={id}
                    onClick={() => setSelectedOperator(id)}
                    className=""
                  >
                    <td>{operators[id].name}</td>
                    <td>{operators[id].gender}</td>
                    <td>{operators[id].race}</td>
                    <td>
                      {
                        teamTable[
                          operators[id].allegiance.teamId ??
                            operators[id].allegiance.groupId ??
                            operators[id]!.allegiance.nationId!
                        ].powerCode
                      }
                    </td>
                    <td>
                      {operators[id].infection === false
                        ? "No"
                        : operators[id].infection === true
                        ? "Yes"
                        : "Unknown"}
                    </td>
                    <td>{professions[operators[id].profession]}</td>
                    <td>{operators[id].rarity}</td>
                    <td>{operators[id].cost[1]}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

type OperatorKey = keyof Operator;

function isValidOperatorValue<K extends OperatorKey>(
  key: OperatorKey,
  value: Operator[K],
): value is Operator[K] {
  switch (key) {
    case "gender":
    case "race":
    case "profession":
      return typeof value === "string";
    case "infection":
      return typeof value === "boolean" || value === null;
    default:
      return false;
  }
}

function filterSet(set: Set<string>, guess: Guess) {
  set.forEach((id) => {
    const op = operators[id]!;
    filterSetThreeState(set, guess, id, op, "gender");
    filterSetThreeState(set, guess, id, op, "race");
    filterSetThreeState(set, guess, id, op, "infection");
    filterSetThreeState(set, guess, id, op, "profession");
    filterSetFourStateNoAllegiance(set, guess, id, op, "rarity");
    filterSetFourStateNoAllegiance(set, guess, id, op, "cost");
    if (guess.true.allegiance) {
      const trueAllegiance = guess.true.allegiance;
      if (
        !(
          trueAllegiance === op.allegiance.teamId ||
          trueAllegiance === op.allegiance.groupId ||
          trueAllegiance === op.allegiance.nationId
        )
      ) {
        set.delete(id);
        return;
      }
    } else if (
      Object.values(op.allegiance).some((al) =>
        guess.false.allegiance.has(al ?? ""),
      )
    ) {
      set.delete(id);
      return;
    }
  });
}

function filterSetThreeState(
  set: Set<string>,
  guess: Guess,
  id: string,
  operator: Operator,
  key: "gender" | "race" | "profession" | "infection",
) {
  if (guess.true[key] !== undefined) {
    if (operator[key] !== guess.true[key]) {
      set.delete(id);
      return;
    }
  }
  const falseSet = guess.false[key];
  const operatorValue = operator[key];
  if (
    isValidOperatorValue(key, operatorValue) &&
    (falseSet as Set<Operator[typeof key]>).has(operatorValue)
  ) {
    set.delete(id);
    return;
  }
}

function filterSetFourStateNoAllegiance(
  set: Set<string>,
  guess: Guess,
  id: string,
  operator: Operator,
  key: "rarity" | "cost",
) {
  const value = key === "rarity" ? operator[key] : operator[key][1];
  if (guess.true[key]) {
    if (value !== guess.true[key]) {
      set.delete(id);
      return;
    }
  } else {
    if (guess.false[key].lower) {
      if (value >= guess.false[key].lower) {
        set.delete(id);
        return;
      }
    }
    if (guess.false[key].higher) {
      if (value <= guess.false[key].higher) {
        set.delete(id);
        return;
      }
    }
  }
}
type SortState = "asc" | "desc" | "dis";

function getNextSortState(state: SortState): SortState {
  return state === "dis" ? "asc" : state === "asc" ? "desc" : "dis";
}

type FourStateNotAllegiance = "Higher" | "Lower" | "Correct" | undefined;
type FourStateAllegiance = "Wrong" | "Partially" | "Correct" | undefined;
type ThreeState = boolean | undefined;

function threeStateButtonColor(state: boolean | undefined): string {
  return state === undefined
    ? "bg-wordle-grey"
    : state
    ? "bg-wordle-green"
    : "bg-wordle-red";
}

function fourStateButtonColor(
  state: string | undefined,
  allegiance: boolean = false,
): string {
  if (!allegiance) {
    return state === undefined
      ? "bg-wordle-grey"
      : state === "Lower"
      ? "bg-wordle-red"
      : state === "Higher"
      ? "bg-wordle-blue"
      : "bg-wordle-green";
  }
  return state === undefined
    ? "bg-wordle-grey"
    : state === "Wrong"
    ? "bg-wordle-red"
    : state === "Partially"
    ? "bg-wordle-yellow"
    : "bg-wordle-green";
}

interface SquareContainerProps {
  className?: string;
  children: ReactNode;
}

function SquareContainer({ className, children }: SquareContainerProps) {
  return <td className={"w-20 h-20 text-center " + className}>{children}</td>;
}

const professions: Record<string, string> = {
  MEDIC: "Medic",
  WARRIOR: "Guard",
  SUPPORT: "Supporter",
  CASTER: "Caster",
  SPECIAL: "Specialist",
  PIONEER: "Vanguard",
  TANK: "Defender",
  SNIPER: "Sniper",
};

type HandbookTeam = Record<string, Team>;

interface Team {
  powerId: string;
  orderNum: number;
  powerLevel: number;
  powerName: string;
  powerCode: string;
  color: string;
  isLimited: boolean;
  isRaw: boolean;
}

type Operators = Record<string, Operator>;

interface Operator {
  name: string;
  gender: string;
  race: string;
  infection: boolean | null;
  cost: number[];
  rarity: number;
  allegiance: {
    nationId: string | null;
    groupId: string | null;
    teamId: string | null;
  };
  profession: string;
}

interface Guess {
  false: {
    gender: Set<string>;
    race: Set<string>;
    infection: Set<boolean | null>;
    profession: Set<string>;
    allegiance: Set<string>;
    rarity: {
      lower?: number;
      higher?: number;
    };
    cost: {
      lower?: number;
      higher?: number;
    };
  };
  true: {
    gender?: string;
    race?: string;
    infection?: boolean | null;
    profession?: string;
    cost?: number;
    rarity?: number;
    allegiance?: string;
  };
}

export default App;
