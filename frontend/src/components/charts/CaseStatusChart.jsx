import { useEffect, useState } from "react";
import api from "../../services/api";

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

export default function CaseStatusChart() {

    const [data, setData] = useState(null);

    useEffect(() => {

        fetchCases();

    }, []);

    const fetchCases = async () => {

        const res = await api.get("/cases");

        const cases = res.data.data.items;

        let open = 0;
        let closed = 0;

        cases.forEach(c => {

            if (c.status === "OPEN") open++;
            else closed++;

        });

        setData({

            labels: ["Open", "Closed"],

            datasets: [{

                data: [open, closed],

                backgroundColor: ["#3b82f6", "#10b981"]

            }]

        });

    };

    if (!data) return <div>Loading...</div>;

    return (

        <div className="bg-white p-6 rounded-xl shadow-sm">

            <h3 className="font-semibold mb-4">
                Case Status Distribution
            </h3>

            <Doughnut data={data} />

        </div>

    );

}