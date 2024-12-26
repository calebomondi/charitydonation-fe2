import { connectWallet, listenForWalletEvents, checkIfWalletIsConnected } from "../../blockchain-services/useCharityDonation"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
    const [account, setAccount] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
      //listen for wallet events
      listenForWalletEvents();
      //redirect if or when connected
      const redirecteIfConnected = async () => {
        const connected = await checkIfWalletIsConnected();
        if (connected) {
          navigate('/fundraisers');
        }
      }
      redirecteIfConnected();
    }, [account]);

    const handleConnectWallet = async () => {
        const account = await connectWallet();
        setAccount(account);
    }

  return (
    <div>
      {
        account ? (
          <p>Connected account: {account}</p>
        ) : (
          <button className="btn btn-secondary" onClick={handleConnectWallet}>Connect</button>
        )
      }
    </div>
  )
}

export default Home
