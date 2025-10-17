import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TokenIcon } from "./TokenIcon";
import { toast } from 'sonner';

export const AlphaInsightsTable = () => {
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const data = await api.getAllAlphaInsights();
        setInsights(data);
      } catch (error) {
        toast.error('Failed to fetch insights');
      }
    };

    fetchInsights();
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Alpha Insights</h2>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Raise</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {insights.map((insight) => (
              <TableRow key={insight.id}>
                <TableCell className="font-medium">
                  <a href={insight.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {insight.title}
                  </a>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      insight.category === 'Dự án'
                        ? 'default'
                        : insight.category === 'Tips'
                        ? 'warning'
                        : 'secondary'
                    }
                  >
                    {insight.category}
                  </Badge>
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <TokenIcon token={insight.token} imageUrl={insight.imageUrl} />
                  {insight.token}
                </TableCell>
                <TableCell>{insight.platform}</TableCell>
                <TableCell>{insight.raised}</TableCell>
                <TableCell>{insight.description}</TableCell>
                <TableCell>{insight.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
