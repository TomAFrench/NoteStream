import React, { createContext, Reducer, useContext, useReducer, useMemo, useCallback, ReactElement } from 'react';
import Onboard from 'bnc-onboard';
// import { Initialization } from 'bnc-onboard/dist/src/interfaces';

const SET_WALLET = 'SET_WALLET';
const RESET_WALLET = 'RESET_WALLET';

interface OnboardState {
  wallet?: any;
  onboard: any;
}

interface Action {
  type: string;
  payload: any;
}

type InitContextProps = Array<any>;

export const OnboardContext = createContext({} as InitContextProps);

export function useOnboardContext() {
  return useContext(OnboardContext);
}

const reducer: Reducer<OnboardState, Action> = (state, { type, payload }) => {
  switch (type) {
    case SET_WALLET: {
      const { wallet } = payload;
      return {
        ...state,
        wallet,
      };
    }
    case RESET_WALLET: {
      return {
        ...state,
        wallet: null,
      };
    }
    default: {
      throw Error(`Unexpected action type in OnboardContext reducer: '${type}'.`);
    }
  }
};

const OnboardProvider = ({ children, initialisation }: { children: any; initialisation: any }): ReactElement => {
  const onboard = Onboard(initialisation);

  const [state, dispatch] = useReducer(reducer, { onboard });

  const setWallet = useCallback((wallet) => {
    dispatch({ type: SET_WALLET, payload: { wallet } });
  }, []);

  const resetWallet = useCallback(() => dispatch({ type: RESET_WALLET, payload: {} }), []);

  const setConfig = (config: any): void => state.onboard.config(config);

  return (
    <OnboardContext.Provider
      value={useMemo(() => [state, { setWallet, resetWallet, setConfig }], [state, setWallet, resetWallet, setConfig])}
    >
      {children}
    </OnboardContext.Provider>
  );
};

export const useOnboard = () => {
  const [{ onboard }] = useOnboardContext();
  return onboard;
};

export const useGetState = () => {
  const [{ onboard }] = useOnboardContext();
  return onboard.getState();
};

export const useWallet = () => {
  const [{ wallet }] = useOnboardContext();
  return wallet;
};

export default OnboardProvider;
