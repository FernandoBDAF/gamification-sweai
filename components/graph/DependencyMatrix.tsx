import React, { useState, useMemo } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { TopicNode } from "@/lib/utils/types";
import { clusterLabels } from "@/lib/ui/tokens";

interface DependencyMatrixProps {
  nodes: TopicNode[];
  topicsById: Record<string, TopicNode>;
}

export const DependencyMatrix: React.FC<DependencyMatrixProps> = ({
  nodes,
  topicsById,
}) => {
  const [sortBy, setSortBy] = useState<"id" | "cluster" | "dependencies">(
    "cluster"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredAndSortedNodes = useMemo(() => {
    let filtered = nodes.filter(
      (node) =>
        node.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "id":
          comparison = a.id.localeCompare(b.id);
          break;
        case "cluster":
          comparison =
            a.cluster.localeCompare(b.cluster) || a.id.localeCompare(b.id);
          break;
        case "dependencies":
          comparison = a.deps.length - b.deps.length;
          break;
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });
  }, [nodes, searchTerm, sortBy, sortOrder]);

  const headers = filteredAndSortedNodes.map((n) => n.id);
  const isDep = (a: string, b: string) => topicsById[a]?.deps?.includes(b);

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Controls */}
      <div className="p-4 border-b bg-white">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              className="input text-sm"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleSort("cluster")}
              className={`btn text-xs px-2 py-1 ${
                sortBy === "cluster" ? "btn-primary" : "btn-outline"
              }`}
            >
              <ArrowUpDown className="w-3 h-3 mr-1" />
              Cluster{" "}
              {sortBy === "cluster" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
            <button
              onClick={() => handleSort("dependencies")}
              className={`btn text-xs px-2 py-1 ${
                sortBy === "dependencies" ? "btn-primary" : "btn-outline"
              }`}
            >
              <ArrowUpDown className="w-3 h-3 mr-1" />
              Deps{" "}
              {sortBy === "dependencies" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
          </div>
        </div>

        <div className="mt-2 text-sm text-neutral-600">
          Dependency Table ({filteredAndSortedNodes.length} topics) - Rows
          depend on columns
        </div>
      </div>

      {/* Matrix */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full text-xs border-collapse">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="sticky left-0 bg-gray-50 border border-gray-200 px-2 py-2 text-left font-medium min-w-[200px]">
                <div className="flex flex-col">
                  <span className="font-semibold">Topic</span>
                  <span className="text-xs text-gray-500 font-normal">
                    Cluster
                  </span>
                </div>
              </th>
              {headers.map((h) => (
                <th
                  key={h}
                  className="border border-gray-200 px-1 py-2 text-center min-w-[60px]"
                >
                  <div className="transform -rotate-90 whitespace-nowrap text-xs">
                    {h}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedNodes.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="sticky left-0 bg-white hover:bg-gray-50 border border-gray-200 px-2 py-2 font-medium">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{row.label}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{row.id}</span>
                      <span className="badge text-xs">
                        {clusterLabels[row.cluster] || row.cluster}
                      </span>
                    </div>
                  </div>
                </td>
                {headers.map((col) => (
                  <td
                    key={col}
                    className="border border-gray-200 px-2 py-2 text-center"
                  >
                    {isDep(row.id, col) ? (
                      <span
                        className="inline-block w-4 h-4 bg-blue-500 rounded-full"
                        title={`${row.id} depends on ${col}`}
                      ></span>
                    ) : (
                      <span className="text-gray-300">•</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedNodes.length === 0 && searchTerm && (
        <div className="flex items-center justify-center h-32 text-gray-500">
          No topics found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
};
