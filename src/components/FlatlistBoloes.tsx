import { Participants } from "./Participants";
import { v4 as uuidV4 } from "uuid";
import { GlobalDataContextType } from "../@types";
import { useContext } from "react";
import { GlobalDataContext } from "../context/GlobalDataContext";
import { Doc } from "../../convex/_generated/dataModel";

type FlatlistBoloesProps = {
  leagues: Doc<"leagues">[] | undefined | null;
  chooseTextCompetitionColor: (name: string) => void;
  chooseBorderBgCompetitionColor: (name: string) => void;
};

export function FlatlistBoloes({
  leagues,
  chooseTextCompetitionColor,
  chooseBorderBgCompetitionColor,
}: FlatlistBoloesProps) {
  // GET GLOBAL DATA
  const { page, setCompetition, setPage } = useContext(
    GlobalDataContext
  ) as GlobalDataContextType;

  if (leagues && leagues !== null && leagues.length > 0) {
    return (
      <ul className="w-full max-w-md">
        {leagues
          .sort((a, b) => a._creationTime - b._creationTime)
          .map((league) => (
            <li key={uuidV4()}>
              <button
                className="w-full"
                key={league.slug}
                onClick={() => {
                  setCompetition(league);
                  setPage({ show: "poolPage", prev: page.show });
                }}
              >
                <div
                  className={`mb-3 flex w-full flex-row items-center justify-between rounded-md border-b-2 bg-gray-200/50 ${chooseBorderBgCompetitionColor(
                    league.name
                  )} p-4`}
                >
                  <div className="flex flex-row items-center gap-3">
                    <img src={league.logoUrl} className="h-10" />
                    <div>
                      <p
                        className={`${chooseTextCompetitionColor(
                          league.name
                        )} text-left text-sm font-bold leading-relaxed`}
                      >
                        {league.name}
                      </p>
                      <p
                        className={`${chooseTextCompetitionColor(
                          league.name
                        )} text-left text-xs font-medium leading-relaxed`}
                      >
                        Criado por {league.createdBy}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Participants league={league} />
                  </div>
                </div>
              </button>
            </li>
          ))}
      </ul>
    );
  } else {
    return;
  }
}
