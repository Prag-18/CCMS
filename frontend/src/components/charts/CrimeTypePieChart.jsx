import { useEffect, useState } from "react";
import api from "../../services/api";

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";

import { Pie } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

export default function CrimeTypePieChart() {

    const [data, setData] = useState(null);

    useEffect(() => {

        fetchCrimes();

    }, []);

    const fetchCrimes = async () => {

        const res = await api.get("/crimes");

        const crimes = res.data.data.items;

        const counts = {};

        crimes.forEach(c => {

            counts[c.crime_type] = (counts[c.crime_type] || 0) + 1;

        });

        setData({

            labels: Object.keys(counts),

            datasets: [{

                data: Object.values(counts),

                backgroundColor: [

                    "#3b82f6",
                    "#ef4444",
                    "#f59e0b",
                    "#8b5cf6",
                    "#6b7280"

                ]

            }]

        });

    };

    if (!data) return <div>Loading...</div>;

    return (

        <div className="bg-white p-6 rounded-xl shadow-sm">

            <h3 className="font-semibold mb-4">
                Crime Type Distribution
            </h3>

            <Pie data={data} />

        </div>

    );

}