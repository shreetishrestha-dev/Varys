"use client";

import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Search, Filter, Loader2 } from "lucide-react";
import { fetchCompanyMentions } from "../api/appApi";

export default function DataView({ company }) {
  const [mentions, setMentions] = useState([]);
  const [selectedMention, setSelectedMention] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [keywordFilter, setKeywordFilter] = useState("all");

  // Load mentions when company changes
  useEffect(() => {
    if (company) {
      loadMentions();
    }
  }, [company]);

  const loadMentions = async () => {
    setLoading(true);
    try {
      const data = await fetchCompanyMentions(company, { limit: 100 });
      setMentions(data);
    } catch (error) {
      console.error("Failed to load mentions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMentions = useMemo(() => {
    return mentions.filter((mention) => {
      const matchesSearch =
        mention.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mention.source?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSentiment =
        sentimentFilter === "all" || mention.sentiment === sentimentFilter;
      const matchesType = typeFilter === "all" || mention.type === typeFilter;
      const matchesKeyword =
        keywordFilter === "all" ||
        (mention.keywords && mention.keywords.includes(keywordFilter));

      return matchesSearch && matchesSentiment && matchesType && matchesKeyword;
    });
  }, [mentions, searchTerm, sentimentFilter, typeFilter, keywordFilter]);

  const allKeywords = Array.from(
    new Set(mentions.flatMap((m) => m.keywords || []))
  );
  const allTypes = Array.from(
    new Set(mentions.map((m) => m.type).filter(Boolean))
  );

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "negative":
        return "bg-red-100 text-red-800";
      case "neutral":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading mentions...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Mentions - {company}</CardTitle>
        <CardDescription>
          View and filter all mentions and reviews for the selected company.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mentions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
            <SelectTrigger className="w-[150px] bg-white z-50">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50 border border-border shadow-lg animate-in fade-in opacity-100">
              <SelectItem value="all" className="text-black">
                All Sentiments
              </SelectItem>
              <SelectItem value="positive" className="text-black">
                Positive
              </SelectItem>
              <SelectItem value="negative" className="text-black">
                Negative
              </SelectItem>
              <SelectItem value="neutral" className="text-black">
                Neutral
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px] bg-white z-50">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50 border border-border shadow-lg animate-in fade-in opacity-100">
              <SelectItem value="all" className="text-black">
                All Types
              </SelectItem>
              {allTypes.map((type) => (
                <SelectItem key={type} value={type} className="text-black">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={keywordFilter} onValueChange={setKeywordFilter}>
            <SelectTrigger className="w-[150px] bg-white z-50">
              <SelectValue placeholder="Keyword" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50 border border-border shadow-lg animate-in fade-in opacity-100">
              <SelectItem value="all" className="text-black">
                All Keywords
              </SelectItem>
              {allKeywords.map((keyword) => (
                <SelectItem
                  key={keyword}
                  value={keyword}
                  className="text-black"
                >
                  {keyword}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredMentions.length} of {mentions.length} mentions
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Text</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Keywords</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMentions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No mentions found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredMentions.map((mention, index) => (
                  <TableRow
                    key={mention.id || index}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedMention(mention);
                      setShowModal(true);
                    }}
                  >
                    <TableCell className="max-w-md">
                      <div className="truncate" title={mention.text}>
                        {mention.text || "No text available"}
                      </div>
                    </TableCell>
                    <TableCell>{mention.type || "N/A"}</TableCell>
                    <TableCell>
                      <Badge className={getSentimentColor(mention.sentiment)}>
                        {mention.sentiment || "unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(mention.keywords || []).slice(0, 3).map((keyword) => (
                          <Badge
                            key={keyword}
                            variant="outline"
                            className="text-xs"
                          >
                            {keyword}
                          </Badge>
                        ))}
                        {(mention.keywords || []).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{mention.keywords.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    {/* Mention Details Modal */}
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="max-w-lg bg-white dark:bg-zinc-900">
        <DialogHeader>
          <DialogTitle>Mention Details</DialogTitle>
        </DialogHeader>
        {selectedMention && (
          <div className="space-y-4">
            <div>
              <span className="font-semibold">Text:</span>
              <div className="mt-1 p-2 bg-muted rounded text-sm whitespace-pre-line">
                {selectedMention.text || "No text available"}
              </div>
            </div>
            <div>
              <span className="font-semibold">Type:</span> {selectedMention.type || "N/A"}
            </div>
            <div>
              <span className="font-semibold">Sentiment:</span>{" "}
              <Badge className={getSentimentColor(selectedMention.sentiment)}>
                {selectedMention.sentiment || "unknown"}
              </Badge>
            </div>
            <div>
              <span className="font-semibold">Keywords:</span>{" "}
              {selectedMention.keywords && selectedMention.keywords.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedMention.keywords.map((keyword) => (
                    <Badge key={keyword} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">None</span>
              )}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button onClick={() => setShowModal(false)} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </Card>
  );
}
