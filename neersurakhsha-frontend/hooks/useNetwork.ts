import { useState, useEffect } from 'react';
import * as Network from 'expo-network';

export function useNetwork() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const checkNetwork = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        if (isMounted) {
          // isInternetReachable can be null on some platforms initially
          setIsOnline(Boolean(networkState.isConnected) && networkState.isInternetReachable !== false);
        }
      } catch (error) {
        console.warn('Network check failed', error);
      }
    };

    checkNetwork();
    
    // Poll every 10 seconds for prototype since expo-network lacks a listener.
    const interval = setInterval(checkNetwork, 10000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return isOnline;
}
