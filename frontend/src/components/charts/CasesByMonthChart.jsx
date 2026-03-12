import { useEffect, useState } from "react";
import api from "../../services/api";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
);

export default function CasesByMonthChart() {

    const [chartData, setChartData] = useState(null);

    useEffect(() => {

        fetchCases();

    }, []);

    const fetchCases = async () => {

        const res = await api.get("/cases");

        const cases = res.data.data.items;

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const monthCount = new Array(12).fill(0);

        cases.forEach(c => {

            const date = new Date(c.createdAt);

            const month = date.getMonth();

            monthCount[month]++;

        });

        setChartData({

            labels: months,

            datasets: [{

                label: "Cases",

                data: monthCount,

                backgroundColor: "#3b82f6",

                borderRadius: 6

            }]

        });

    };

    if (!chartData) return <div>Loading...</div>;

    return (

        <div className="bg-white p-6 rounded-xl shadow-sm">

            <h3 className="font-semibold mb-4">
                Cases by Month
            </h3>

            <Bar data={chartData} />

        </div>

    );

}