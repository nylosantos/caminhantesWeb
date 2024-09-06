import { useContext } from 'react';
import { GlobalDataContextType } from '../@types';
import { GlobalDataContext } from '../context/GlobalDataContext';
import CopyrightFooter from './CopyrightFooter';
import { FooterMenu } from './FooterMenu';

export default function FooterContainer() {
  // GET GLOBAL DATA
  const { showCopyright, showFooterMenu } = useContext(
    GlobalDataContext
  ) as GlobalDataContextType;
  return (
    <div className="fixed bottom-0 flex w-full flex-col items-center justify-center gap-1 bg-white pt-1">
      {showCopyright && <CopyrightFooter />}
      {showFooterMenu && <FooterMenu />}
    </div>
  );
}
