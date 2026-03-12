import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import CasesByMonthChart from "../components/charts/CasesByMonthChart";
import CrimeTypePieChart from "../components/charts/CrimeTypePieChart";
import CaseStatusChart from "../components/charts/CaseStatusChart";

export default function Dashboard() {

    return (

        <Layout>

            <h2 className="text-2xl font-semibold mb-6">
                Dashboard Overview
            </h2>

            {/* Stat Cards */}

            <div className="grid grid-cols-4 gap-6 mb-8">

                <StatCard
                    title="Active Cases"
                    value="143"
                    subtitle="+12 from last month"
                    color="bg-blue-200"
                />

                <StatCard
                    title="Pending Review"
                    value="28"
                    subtitle="Requires attention"
                    color="bg-orange-200"
                />

                <StatCard
                    title="Resolved Cases"
                    value="892"
                    subtitle="88% resolution rate"
                    color="bg-green-200"
                />

                <StatCard
                    title="Critical Priority"
                    value="7"
                    subtitle="Immediate action needed"
                    color="bg-red-200"
                />

            </div>

            {/* Charts */}

            <div className="grid grid-cols-2 gap-6 mb-6">

                <CasesByMonthChart />

                <CrimeTypePieChart />

            </div>

            <div className="grid grid-cols-1">

                <CaseStatusChart />

            </div>

        </Layout>

    );

}