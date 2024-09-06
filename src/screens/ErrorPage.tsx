/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect } from 'react';
import { GlobalDataContext } from '../context/GlobalDataContext';
import { GlobalDataContextType } from '../@types';
import { CaminhantesIcon } from '../components/CaminhantesIcon';
import { Header } from '../components/Header';
import FooterContainer from '../components/FooterContainer';

export function ErrorPage() {
  // GET GLOBAL DATA
  const { onHeaderCustomize, onFooterCustomize } = useContext(
    GlobalDataContext
  ) as GlobalDataContextType;

  // CUSTOMIZE HEADER AND FOOTER
  useEffect(() => {
    onHeaderCustomize('Erro!', true, true);
    onFooterCustomize(true, true);
  }, []);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-5 px-6">
      <Header title="Erro!" />
      <CaminhantesIcon />
      <p className="text-center text-lg text-red-600">Algum erro aconteceu... ☹️</p>
      <FooterContainer />
    </div>
  );
}
