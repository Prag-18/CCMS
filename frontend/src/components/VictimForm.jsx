import {useState} from "react";
import api from "../services/api";

export default function VictimForm(){

const [name,setName]=useState("");

const submit= async(e)=>{

e.preventDefault();

await api.post("/victims",{fullName:name});

};

return(

<form onSubmit={submit}>

<input
placeholder="Victim Name"
className="border p-2"
onChange={(e)=>setName(e.target.value)}/>

<button className="bg-green-500 text-white p-2">
Add Victim
</button>

</form>

)
}