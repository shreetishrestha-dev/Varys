import { useState } from "react";
import Filters from "../components/Filters";
import MentionsTable from "../components/MentionsTable";

export default function Dashboard() {
  const [company, setCompany] = useState("Leapfrog");

  return (
    <main className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <header>
          <h1 className="text-4xl font-bold text-slate-800">Company Mentions Dashboard</h1>
          <p className="text-slate-500 mt-2">Track what people are saying across platforms.</p>
        </header>

        <section className="bg-white border rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Filters</h2>
          <Filters company={company} setCompany={setCompany} />
        </section>

        <section className="bg-white border rounded-xl shadow-sm p-6">
          <MentionsTable company={company} />
        </section>
      </div>
    </main>
  );
}