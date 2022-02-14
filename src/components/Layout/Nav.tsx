import React from 'react';
import { useGlobalContext } from '../../Hook/Store/Store';
import IdentifierLabelWithButtons from '../Buttons/IdentifierLabelWithButtons';
import LoginButton from '../Buttons/LoginButton';

const navigation = [
  { name: 'Demo', href: '/demo' },
  { name: 'Home', href: '/home' },
];

export default function Nav() {
  const {
    state: { principal },
  } = useGlobalContext();

  return (
    <div className="bg-gray-800 pt-6">
      <nav className="relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6" aria-label="Global">
        <div className="flex items-center flex-1">
          <div className="space-x-8 flex ml-10">
            {navigation.map(item => (
              <a key={item.name} href={item.href} className="text-base font-medium text-white hover:text-gray-300">
                {item.name}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center gap-4">
            {principal && !principal.isAnonymous() && (
              <div className="flex flex-col">
                <IdentifierLabelWithButtons className="text-white" type="Principal" id={principal} isShort={true} />
              </div>
            )}
            <LoginButton />
          </div>
        </div>
      </nav>
    </div>
  );
}
