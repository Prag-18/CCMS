import { useState } from "react";
import api from "../services/api";

export default function CrimeForm(){

const [crimeType,setCrimeType] = useState("");
const [description,setDescription] = useState("");
const [location,setLocation] = useState("");

const submit = async (e)=>{

e.preventDefault();

await api.post("/crimes",{

crime_type:crimeType,
description,
location_id:location

});

alert("Crime registered");

};

return(

<form onSubmit={submit} className="space-y-3">

<input placeholder="Crime Type"
className="border p-2"
onChange={(e)=>setCrimeType(e.target.value)}/>

<textarea placeholder="Description"
className="border p-2"
onChange={(e)=>setDescription(e.target.value)}/>

<input placeholder="Location ID"
className="border p-2"
onChange={(e)=>setLocation(e.target.value)}/>

<button className="bg-blue-500 text-white p-2">
Register Crime
</button>

</form>

)
}