import NavBar from "../navbar/navbar"
import ViewMyCampaigns from "./viewmycampaigns"
import CreateForm from "./createform"

export default function MyFundraisers() {

  return (
    <main>
      <NavBar />   
      <CreateForm />     
      <ViewMyCampaigns /> 
    </main>
  )
}
