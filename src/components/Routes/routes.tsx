import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '../Home/home';
import Donate from '../donations/donate';
import MyDonations from '../donations/mydonations';
import MyFundraisers from '../fundraisers/myfundraisers';
import Fundraisers from '../fundraisers/fundraisers';


const AuthenticatedApp: React.FC = () => {

    return (
        <Routes>
            <Route
                path="/"
                element={<Home />}
            />
            <Route
                path="/donate"
                element={<Donate />}
            />
            <Route
                path="/my-donations"
                element={<MyDonations />}
            />
            <Route
                path="/fundraisers"
                element={<Fundraisers />}
            />
            <Route
                path="/my-fundraisers"
                element={<MyFundraisers />}
            />
        </Routes>
    );
  };

// Main Header component
export default function MyRoutes() {
    return (
        <Router>
            <AuthenticatedApp />
        </Router>
    );
}