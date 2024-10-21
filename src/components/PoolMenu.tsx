import { useContext } from 'react';
import { GlobalDataContext } from '../context/GlobalDataContext';
import { GlobalDataContextType } from '../@types';

type Props = {
  listToShow: 'guesses' | 'results' | 'ranking';
  toggleGuessesResultsRanking: (option: 'guesses' | 'results' | 'ranking') => void;
};

export function PoolMenu({ listToShow, toggleGuessesResultsRanking }: Props) {
  // GET GLOBAL DATA
  const { competition } = useContext(GlobalDataContext) as GlobalDataContextType;

  // CUSTOMIZING ACTIVE MENU BACKGROUND COLOR ACCORDING TO THE COMPETITION
  const chooseActiveBgCompetitionColor = () => {
    if (competition!.name === 'Premier League') {
      return 'bg-purple-800';
    }
    if (competition!.name === 'Champions League') {
      return 'bg-blue-900';
    }
    if (competition!.name === 'FA Cup') {
      return 'bg-red-600';
    }
    if (competition!.name === 'Carabao Cup') {
      return 'bg-green-700';
    }
    if (competition!.name === 'Nations League') {
      return 'bg-amber-900';
    }
    if (competition!.name === "WSL") {
      return "bg-[#1e1034]";
    }
    if (
      competition!.name !== "Premier League" &&
      competition!.name !== "Champions League" &&
      competition!.name !== "FA Cup" &&
      competition!.name !== "Carabao Cup" &&
      competition!.name !== "WSL"
    ) {
      return 'bg-red-600';
    }
  };

  // CUSTOMIZING INACTIVE MENU BACKGROUND COLOR ACCORDING TO THE COMPETITION
  const chooseInactiveBgCompetitionColor = () => {
    if (competition!.name === 'Premier League') {
      return 'bg-purple-800/30';
    }
    if (competition!.name === 'Champions League') {
      return 'bg-blue-900/30';
    }
    if (competition!.name === 'FA Cup') {
      return 'bg-red-600';
    }
    if (competition!.name === 'Carabao Cup') {
      return 'bg-green-700/30';
    }
    if (competition!.name === 'Nations League') {
      return 'bg-amber-900/30';
    }
    if (competition!.name === "WSL") {
      return "bg-[#1e10344D]";
    }
    if (
      competition!.name !== "Premier League" &&
      competition!.name !== "Champions League" &&
      competition!.name !== "FA Cup" &&
      competition!.name !== "Carabao Cup" &&
      competition!.name !== "WSL"
    ) {
      return 'bg-red-300';
    }
  };

  // CUSTOMIZING INACTIVE TEXT COLOR ACCORDING TO THE COMPETITION
  const chooseInactiveTextCompetitionColor = () => {
    if (competition!.name === 'Premier League') {
      return 'text-purple-800';
    }
    if (competition!.name === 'Champions League') {
      return 'text-blue-900';
    }
    if (competition!.name === 'FA Cup') {
      return 'text-red-600';
    }
    if (competition!.name === 'Carabao Cup') {
      return 'text-green-700';
    }
    if (competition!.name === 'Nations League') {
      return 'text-amber-900';
    }
    if (competition!.name === "WSL") {
      return "text-[#1e1034]";
    }
    if (
      competition!.name !== "Premier League" &&
      competition!.name !== "Champions League" &&
      competition!.name !== "FA Cup" &&
      competition!.name !== "Carabao Cup" &&
      competition!.name !== "WSL"
    ) {
      return 'text-red-600';
    }
  };

  return (
    <div className="flex w-full flex-row">
      <div
        className={`flex h-10 w-full flex-row items-center rounded-md ${chooseInactiveBgCompetitionColor()} p-1`}>
        <button
          className={`flex h-full w-1/3 items-center justify-center rounded-md ${
            listToShow === 'guesses' ? chooseActiveBgCompetitionColor() : ''
          }`}
          onClick={() => toggleGuessesResultsRanking('guesses')}>
          <p
            className={`font-bold ${listToShow === 'guesses' ? 'text-gray-100' : chooseInactiveTextCompetitionColor()}`}>
            Seus Palpites
          </p>
        </button>
        <button
          className={`flex h-full w-1/3 items-center justify-center rounded-md ${
            listToShow === 'results' ? chooseActiveBgCompetitionColor() : ''
          }`}
          onClick={() => toggleGuessesResultsRanking('results')}>
          <p
            className={`font-bold ${listToShow === 'results' ? 'text-gray-100' : chooseInactiveTextCompetitionColor()}`}>
            Resultados
          </p>
        </button>
        <button
          className={`flex h-full w-1/3 items-center justify-center rounded-md ${
            listToShow === 'ranking' ? chooseActiveBgCompetitionColor() : ''
          }`}
          onClick={() => toggleGuessesResultsRanking('ranking')}>
          <p
            className={`font-bold ${listToShow === 'ranking' ? 'text-gray-100' : chooseInactiveTextCompetitionColor()}`}>
            Ranking
          </p>
        </button>
      </div>
    </div>
  );
}
