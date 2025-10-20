import { useState, useEffect, useMemo } from 'react';
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
import { cn } from '@/lib/utils';

interface AlphaInsightsTableProps {
  introText?: string;
  className?: string;
}

export const AlphaInsightsTable = ({ introText, className }: AlphaInsightsTableProps) => {
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

  const filteredInsights = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sanitized = insights
      .filter((insight) => {
        const insightDate = insight?.date ? new Date(insight.date) : null;
        if (!insightDate || Number.isNaN(insightDate.getTime())) {
          return false;
        }
        return insightDate >= sevenDaysAgo;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });

    return sanitized;
  }, [insights]);

  const displayInsights = filteredInsights.length > 0 ? filteredInsights : [];

  return (
    <div className={cn("mt-8", className)}>
      <div className="mb-4">
        <h2 className="text-xl font-bold">Alpha Insights</h2>
        {introText && (
          <p className="text-sm text-muted-foreground mt-1">{introText}</p>
        )}
      </div>
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
            {displayInsights.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  Chưa có bài viết nào trong 7 ngày gần đây.
                </TableCell>
              </TableRow>
            ) : (
              displayInsights.map((insight) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
