import MyRoutes from "./components/Routes/routes"

import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';

import Web3BrowserCheck from "./components/Home/web3socket";

function App() {

  return (
    <Web3BrowserCheck>
      <ToastContainer />
      <MyRoutes />
    </Web3BrowserCheck>
  )
}

export default App
