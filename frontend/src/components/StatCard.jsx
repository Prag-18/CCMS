export default function StatCard({title,value,subtitle,color}){

return(

<div className="bg-white rounded-xl shadow-sm p-5 flex justify-between items-center">

<div>

<p className="text-gray-500 text-sm">{title}</p>

<p className="text-2xl font-bold">{value}</p>

<p className="text-xs text-gray-400">{subtitle}</p>

</div>

<div className={`w-10 h-10 rounded-lg ${color}`}></div>

</div>

)

}