import Layout from "../components/Layout";
import VictimForm from "../components/VictimForm";

function Victims() {
  return (
    <Layout>
      <h2 className="mb-4 text-2xl font-bold text-slate-900">Victims</h2>
      <VictimForm />
    </Layout>
  );
}

export default Victims;
