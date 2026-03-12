export default function Navbar(){

return(

<header className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center">

<div className="flex items-center gap-3">

<div className="text-2xl">🛡️</div>

<div>

<h1 className="font-semibold text-lg">
Crime & Case Management System
</h1>

<p className="text-xs text-gray-300">
Government Law Enforcement Portal
</p>

</div>

</div>

<div className="flex items-center gap-3">

<div className="text-right">

<p className="text-sm font-medium">
Officer J. Anderson
</p>

<p className="text-xs text-gray-400">
Badge #5847
</p>

</div>

<div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
JA
</div>

</div>

</header>

)

}