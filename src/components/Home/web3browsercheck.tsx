import React, { useEffect, useState, ReactNode } from 'react';

interface Web3BrowserCheckProps {
  children: ReactNode;
  customMessage?: string;
}

const Web3BrowserCheck: React.FC<Web3BrowserCheckProps> = ({ 
  children, 
  customMessage 
}) => {
  const [isWeb3Available, setIsWeb3Available] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkEnvironment = () => {
      // Check if running on mobile device
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
      
      // Check if ethereum object is available
      setIsWeb3Available(typeof window !== 'undefined' && (window as any).ethereum !== undefined);
    };
    
    checkEnvironment();
  }, []);

  const handleInstallMetaMask = () => {
    window.open('https://metamask.io/download/', '_blank');
  };

  const handleOpenInMetaMask = () => {
    // Get current URL
    const currentUrl = window.location.href;
    
    // MetaMask deep link
    window.location.href = `https://metamask.app.link/dapp/${currentUrl}`;
  };

  if (!isWeb3Available) {
    return (
      <div className="max-w-md mx-auto my-4">
        <div>
          {customMessage || "Web3 Wallet Not Detected"}
        </div>
        <div className="mt-2">
          {isMobile ? (
            <div className="space-y-4">
              <p>Please use one of these Web3-enabled browsers:</p>
              <ul className="list-disc pl-4 space-y-2">
                <li>MetaMask Mobile Browser</li>
                <li>Trust Wallet Browser</li>
                <li>Coinbase Wallet</li>
              </ul>
              <button 
                onClick={handleOpenInMetaMask}
                className="w-full mt-4"
              >
                Open in MetaMask
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p>
                To use this application, please install a Web3 wallet like MetaMask.
              </p>
              <button 
                onClick={handleInstallMetaMask}
                className="w-full mt-2"
              >
                Install MetaMask
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default Web3BrowserCheck;