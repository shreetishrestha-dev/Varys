import React from "react";
import MentionTable from "../components/MentionTable";
import Filters from "../components/Filters";

const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <Filters />
      <MentionTable />
    </div>
  );
};

export default Dashboard;
