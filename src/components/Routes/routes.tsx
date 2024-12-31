import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '../Home/home';
import MyDonations from '../donations/mydonations';
import MyFundraisers from '../fundraisers/myfundraisers';
import Fundraisers from '../fundraisers/fundraisers';
import CampaignDetails from '../fundraisers/campaigndetails';


const AuthenticatedApp: React.FC = () => {

    return (
        <Routes>
            <Route
                path="/"
                element={<Home />}
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
            <Route
                path="/campaign-details"
                element={<CampaignDetails />}
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