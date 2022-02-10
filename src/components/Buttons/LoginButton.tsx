import dfinityLogo from '@/static/imgs/dfinity.png';
import stoicLogo from '@/static/imgs/stoic.png';
import { HttpAgent, Identity, SignIdentity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import PlugConnect from '@psychedelic/plug-connect';
import { StoicIdentity } from 'ic-stoic-identity';
import React, { useEffect, useState } from 'react';
import { useGlobalContext, useLoginModal, useSetAgent } from '../../Hook/Store/Store';
import { HOST, IDENTITY_PROVIDER } from '../../lib/canisters';
import { ONE_WEEK_NS } from '../../lib/constants';
import Modal from '../Layout/Modal';

declare global {
  interface Window {
    ic: {
      plug: {
        agent: any;
        isConnected: () => Promise<boolean>;
        requestConnect: (args?: { whitelist: string[]; host?: string }) => Promise<undefined>;
        createAgent: (args?: { whitelist: string[]; host?: string }) => Promise<undefined>;
        requestBalance: () => Promise<
          Array<{
            amount: number;
            canisterId: string | null;
            image: string;
            name: string;
            symbol: string;
            value: number | null;
          }>
        >;
        requestTransfer: (arg: {
          to: string;
          amount: number;
          opts?: {
            fee?: number;
            memo?: number;
            from_subaccount?: number;
            created_at_time?: {
              timestamp_nanos: number;
            };
          };
        }) => Promise<{ height: number }>;
      };
    };
  }
}

const WHITELIST = [].filter(Boolean);

const PLUG_ARGS = {
  whitelist: WHITELIST,
  host: HOST,
};

export default function LoginButton() {
  const [isOpen, setIsOpen] = useLoginModal();
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const {
    state: { isAuthed },
  } = useGlobalContext();
  const setAgent = useSetAgent();
  const [authClient, setAuthClient] = useState<AuthClient>(null);

  const handleAuthenticated = async (authClient: AuthClient) => {
    const identity: Identity = authClient.getIdentity();
    setAgent({
      agent: new HttpAgent({
        identity,
        host: HOST,
      }),
      isAuthed: true,
    });
    closeModal();
  };

  const [showIILogin, setShowIILogin] = useState(false);
  const handleIILogin = async () => {
    localStorage.setItem('loginType', 'II');
    authClient.login({
      identityProvider: IDENTITY_PROVIDER,
      maxTimeToLive: ONE_WEEK_NS,
      onSuccess: () => handleAuthenticated(authClient),
    });
  };
  const handleIILogout = async () => {
    await authClient.logout();
    setAgent({ agent: null, isAuthed: false });
  };

  const handlePlugLogin = async () => {
    const connected = await window.ic.plug.isConnected();
    localStorage.setItem('loginType', 'plug');
    if (!connected) {
      await window.ic.plug.requestConnect(PLUG_ARGS);
    }
    if (!window.ic.plug.agent) {
      await window.ic.plug.createAgent(PLUG_ARGS);
    }

    setAgent({
      agent: window.ic.plug.agent,
      isAuthed: true,
    });
    closeModal();
  };

  const [showStoicLogin, setShowStoicLogin] = useState(false);
  const handleStoicLogin = async () => {
    localStorage.setItem('loginType', 'stoic');
    StoicIdentity.load().then(async (identity: SignIdentity) => {
      identity = await StoicIdentity.connect();
      setAgent({
        agent: new HttpAgent({
          identity,
          host: HOST,
        }),
        isAuthed: true,
      });
      closeModal();
    });
  };

  const handleLogout = async () => {
    if (await window?.ic?.plug?.isConnected()) {
      window.ic.plug.agent = null;
      setAgent({ agent: null });
    } else {
      handleIILogout();
    }
    StoicIdentity.disconnect();
  };

  // Auth on refresh
  useEffect(() => {
    (async () => {
      const l = localStorage.getItem('loginType');

      if (l) {
        switch (l) {
          case 'II':
            // eslint-disable-next-line no-case-declarations
            const authClient = await AuthClient.create();
            // II
            setAuthClient(authClient);
            if (await authClient.isAuthenticated()) {
              handleAuthenticated(authClient);
            }
            break;
          case 'stoic':
            // stoic
            StoicIdentity.load().then(async identity => {
              if (identity !== false) {
                //ID is a already connected wallet!
                setAgent({
                  agent: new HttpAgent({
                    identity,
                    host: HOST,
                  }),
                  isAuthed: true,
                });
              }
            });
            break;
          case 'plug':
            // is plug
            if (await window?.ic?.plug?.isConnected()) {
              handlePlugLogin();
            }
            break;
        }
      }
    })();
  }, []);

  return (
    <>
      <button
        className="px-4 py-2 rounded-sm bg-theme-dark text-white opacity-70 hover:opacity-100 transition-opacity"
        onClick={isAuthed ? handleLogout : openModal}>
        {isAuthed ? 'Logout' : 'login'}
      </button>
      <Modal isOpen={isOpen} openModal={openModal} closeModal={closeModal} title="Login" className="max-w-xs w-full">
        <div className="flex flex-col items-stretch gap-4 py-4">
          {!showIILogin && !showStoicLogin && (
            <>
              <PlugConnect whitelist={WHITELIST} host={HOST} onConnectCallback={handlePlugLogin} />

              <button
                className="flex items-center px-3 py-2 rounded-lg bg-white border-gray-300 border-2 hover:ring-2 hover:ring-opacity-50 hover:ring-indigo-500 hover:border-indigo-500"
                onClick={() => handleStoicLogin()}>
                <img src={stoicLogo} className="w-4 mr-2" /> Stoic
              </button>

              <button
                className="flex items-center px-3 py-2 rounded-lg bg-white border-gray-300 border-2 hover:ring-2 hover:ring-opacity-50 hover:ring-indigo-500 hover:border-indigo-500"
                onClick={() => handleIILogin()}>
                <img src={dfinityLogo} className="w-4 mr-2" /> Internet Identity
              </button>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
