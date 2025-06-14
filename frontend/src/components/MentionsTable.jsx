import { useEffect, useState } from "react";
import { fetchMentions } from "../api/api";

export default function MentionsTable({ company }) {
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company) return;

    setLoading(true);
    fetchMentions(company)
      .then((data) => {
        setMentions(data);
      })
      .catch((err) => {
        console.error("Error fetching mentions:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [company]);

  return (
    <div>
      {loading ? (
        <p className="text-muted-foreground text-sm">Loading mentions...</p>
      ) : (
        <ul className="text-sm space-y-3">
          {mentions.length === 0 ? (
            <p className="text-muted-foreground">No mentions found.</p>
          ) : (
            mentions.map((mention, idx) => (
              <li key={idx} className="border-b py-2">
                <strong>{mention.type}</strong> — {mention.text.slice(0, 100)}...
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}