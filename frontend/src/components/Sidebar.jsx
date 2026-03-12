import {Link,useLocation} from "react-router-dom";

export default function Sidebar(){

const location = useLocation();

const menu = [
{ name:"Dashboard", path:"/" },
{ name:"Cases", path:"/cases" },
{ name:"Reports", path:"/reports" },
{ name:"Evidence", path:"/evidence" }
];

return(

<aside className="w-64 bg-white border-r">

<div className="p-4 space-y-2">

{menu.map(item => (

<Link
key={item.name}
to={item.path}
className={`block px-4 py-2 rounded-lg font-medium
${location.pathname === item.path
? "bg-blue-600 text-white"
: "text-gray-700 hover:bg-gray-100"
}`}
>

{item.name}

</Link>

))}

</div>

</aside>

)

}