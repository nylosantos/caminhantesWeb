/* eslint-disable react-hooks/exhaustive-deps */
import { Container } from '../components/Container';
import { AiOutlineSearch } from 'react-icons/ai';
import { Separator } from '../components/Separator';
import { FlatlistBoloes } from '../components/FlatlistBoloes';
import { useContext, useEffect } from 'react';
import { GlobalDataContext } from '../context/GlobalDataContext';
import { GlobalDataContextType } from '../@types';
import { RingLoader } from 'react-spinners';
import { Doc } from '../../convex/_generated/dataModel';
import { PageProps } from '../LandingPage';

interface HomePageProps extends PageProps {
  userPools: Doc<'leagues'>[] | undefined | null;
}

export default function Home({ userData, userPools }: HomePageProps) {
  // GET GLOBAL DATA
  const {
    loading,
    page,
    setRoundSelected,
    onHeaderCustomize,
    onFooterCustomize,
    setCompetition,
    setPage,
    setLoading,
  } = useContext(GlobalDataContext) as GlobalDataContextType;

  // CUSTOMIZE HEADER AND FOOTER
  useEffect(() => {
    onHeaderCustomize('Meus Bolões', false, true);
    onFooterCustomize(false, true);
    setRoundSelected(undefined);
    setCompetition(null);
  }, []);

  // CUSTOMIZING BACKGROUND AND BORDER COLOR ACCORDING TO THE COMPETITION
  const chooseBorderBgCompetitionColor = (name: string) => {
    if (name === 'Premier League') {
      return 'border-purple-800';
    }
    if (name === 'Champions League') {
      return 'border-blue-900';
    }
    if (name === 'FA Cup') {
      return 'border-red-600';
    }
    if (name === 'Carabao Cup') {
      return 'border-green-700';
    }
    if (name === 'Nations League') {
      return 'border-amber-500';
    }
    if (
      name !== 'premierLeague2425' &&
      name !== 'ucl2425' &&
      name !== 'faCup2425' &&
      name !== 'carabaoCup2425'
    ) {
      return 'border-gray-500 bg-gray-200/50';
    }
  };

  // CUSTOMIZING TEXT COLOR ACCORDING TO THE COMPETITION
  const chooseTextCompetitionColor = (name: string) => {
    if (name === 'Premier League') {
      return 'text-purple-900';
    }
    if (name === 'Champions League') {
      return 'text-blue-900';
    }
    if (name === 'FA Cup') {
      return 'text-red-900';
    }
    if (name === 'Carabao Cup') {
      return 'text-green-900';
    }
    if (name === 'Nations League') {
      return 'text-amber-900';
    }
    if (
      name !== 'premierLeague2425' &&
      name !== 'ucl2425' &&
      name !== 'faCup2425' &&
      name !== 'carabaoCup2425'
    ) {
      return 'text-gray-950';
    }
  };

  useEffect(() => {
    if (userData) {
      // console.log(userPools);
      setLoading(false);
    } else setLoading(true);
  }, [userData]);

  return (
    <Container>
      {/* GO TO SEARCH POOL BUTTON */}
      <button
        className="mt-6 flex w-full flex-row items-center justify-center rounded-lg bg-red-600 p-3 active:bg-red-500 disabled:bg-red-400"
        onClick={() => setPage({ show: 'searchPool', prev: page.show })}>
        <AiOutlineSearch size={36} color="#f3f4f6" className="-my-2 pr-4 active:opacity-50" />
        <p className="text-center font-bold uppercase text-gray-100">Buscar bolão por código</p>
      </button>

      <Separator />
      {/* POOLS LIST */}
      {loading ? (
        <div className="mt-20 flex w-full items-center justify-center">
          <RingLoader color="#dc2626" size={150} />
        </div>
      ) : (
        <FlatlistBoloes
          leagues={userPools}
          chooseBorderBgCompetitionColor={chooseBorderBgCompetitionColor}
          chooseTextCompetitionColor={chooseTextCompetitionColor}
        />
      )}
    </Container>
  );
}
