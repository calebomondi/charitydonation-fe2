import { useSearchParams } from "react-router-dom"

import NavBar from "../navbar/navbar"

export default function CampaignDetails() {
    const [searchParams] = useSearchParams();
    //get individual params
    const address = searchParams.get('address');
    const id = searchParams.get('id');

  return (
    <>
      <NavBar />
      <div>
        {`address: ${address}, id: ${id}`}
      </div>
    </>
  )
}
