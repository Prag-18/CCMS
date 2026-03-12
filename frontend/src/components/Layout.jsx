import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({children}){

return(

<div className="h-screen flex flex-col">

<Navbar/>

<div className="flex flex-1">

<Sidebar/>

<main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
{children}
</main>

</div>

</div>

)
}