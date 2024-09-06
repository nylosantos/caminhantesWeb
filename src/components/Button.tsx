import { useContext } from 'react';
import { GlobalDataContext } from '../context/GlobalDataContext';
import { GlobalDataContextType } from '../@types';
import { AiOutlineGoogle, AiOutlineSearch } from 'react-icons/ai';
import { FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import { BsTwitterX } from 'react-icons/bs';
import { FiLoader } from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';

type ButtonProps = {
  buttonFunction: () => void;
  type: 'twitter' | 'google' | 'search' | 'logout' | 'login' | 'ball';
  name: string;
};

export default function Button({ buttonFunction, type, name }: ButtonProps) {
  // GET GLOBAL DATA
  const { isSubmitting } = useContext(GlobalDataContext) as GlobalDataContextType;

  const renderIcon = () => {
    if (type === 'google') {
      return <AiOutlineGoogle size={36} color="#f3f4f6" className="-my-2 pr-4 active:opacity-50" />;
    } else if (type === 'login') {
      return <FaSignInAlt size={36} color="#f3f4f6" className="-my-2 pr-4 active:opacity-50" />;
    } else if (type === 'logout') {
      return <FaSignOutAlt size={36} color="#f3f4f6" className="-my-2 pr-4 active:opacity-50" />;
    } else if (type === 'twitter') {
      return <BsTwitterX size={36} color="#f3f4f6" className="-my-2 pr-4 active:opacity-50" />;
    } else if (type === 'search') {
      return <AiOutlineSearch size={36} color="#f3f4f6" className="-my-2 pr-4 active:opacity-50" />;
    } else if (type === 'ball') {
      return <GiSoccerBall size={36} color="#f3f4f6" className="-my-2 pr-4 active:opacity-50" />;
    }
  };

  return (
    <button
      className="mt-6 flex w-full max-w-md flex-row items-center justify-center rounded-lg bg-red-600 p-3 active:bg-red-500 disabled:bg-red-400"
      disabled={isSubmitting}
      onClick={() => buttonFunction()}>
      {isSubmitting ? (
        <FiLoader size={36} color="#f3f4f6" className="-my-2 pr-4 active:opacity-50" />
      ) : (
        renderIcon()
      )}
      <p className="text-center font-bold uppercase text-gray-100 w-3/4">
        {isSubmitting ? 'Aguarde...' : name}
      </p>
    </button>
  );
}
