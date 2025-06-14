import axios from "axios";

export const fetchMentions = async (company) => {
  if (!company) return [];
  try {
    const res = await axios.get(`http://localhost:8000/mentions?company=${company}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching mentions:", err);
    return [];
  }
};
