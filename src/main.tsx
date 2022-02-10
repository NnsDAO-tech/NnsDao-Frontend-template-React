import 'normalize.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import App from './App';
import Store from './Hook/Store/Store';
import './index.css';
import { ONE_HOUR_MS, ONE_MINUTES_MS } from './lib/constants';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: ONE_MINUTES_MS,
      cacheTime: ONE_HOUR_MS,
      retry: false,
    },
  },
});

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <Store>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </Store>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>,
  document.getElementById('root')
);
