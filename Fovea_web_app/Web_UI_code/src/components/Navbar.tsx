import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, FolderPlus, Book } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [tabs] = useState(['Ajout', 'Scan', 'Catalogue']);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);

  useEffect(() => {
    const currentTab = tabs.find((tab) =>
      location.pathname.toUpperCase().includes(tab.toUpperCase())
    );
    setSelectedTab(currentTab || null);
  }, [location.pathname, tabs]);

  const getTabClassName = (tabName: string) => {
    return `flex text-2xl space-x-1 items-center ${
      selectedTab === tabName ? 'selected-tab text-slate-800' : ''
    }`;
  };

  return (
    <div className='h-max w-full py-10 px-48 border-t flex justify-between items-center text-slate-400 bg-white'>
      <Link to='/ajout' className={getTabClassName('Ajout')}>
        <FolderPlus size={37} />
        <p>Ajout</p>
      </Link>

      <Link to='/scan' className={getTabClassName('Scan')}>
        <Camera size={37} />
        <p>Scan</p>
      </Link>

      <Link to='/catalogue' className={getTabClassName('Catalogue')}>
        <Book size={37} />
        <p>Catalogue</p>
      </Link>
    </div>
  );
};

export default Navbar;
