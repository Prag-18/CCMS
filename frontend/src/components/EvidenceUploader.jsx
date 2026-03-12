import {useState} from "react";
import api from "../services/api";

export default function EvidenceUploader(){

const[file,setFile]=useState(null);

const upload=async()=>{

const data=new FormData();
data.append("file",file);

await api.post("/evidence",data);

};

return(

<div>

<input type="file" onChange={(e)=>setFile(e.target.files[0])}/>

<button onClick={upload} className="bg-purple-500 text-white p-2">
Upload Evidence
</button>

</div>

)
}