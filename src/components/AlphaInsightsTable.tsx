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

  const recentIds = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return insights
      .filter((insight) => {
        const insightDate = insight?.date ? new Date(insight.date) : null;
        if (!insightDate || Number.isNaN(insightDate.getTime())) {
          return false;
        }
        return insightDate >= sevenDaysAgo;
      })
      .map((insight) => insight.id);
  }, [insights]);

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

  const sortedInsights = useMemo(() => {
    return [...insights].sort((a, b) => {
      const dateA = a?.date ? new Date(a.date).getTime() : 0;
      const dateB = b?.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  }, [insights]);

  const recentCount = recentIds.length;

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
            {sortedInsights.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  Không có bài viết nào được hiển thị.
                </TableCell>
              </TableRow>
            ) : (
              sortedInsights.map((insight) => {
                const isRecent = recentIds.includes(insight.id);
                return (
                  <TableRow key={insight.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <a href={insight.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {insight.title}
                      </a>
                      {isRecent && recentCount > 0 && (
                        <Badge className="bg-[#be2ed6] text-white hover:bg-[#be2ed6]/90 border-transparent">
                          Mới
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
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
                  <TableCell className="align-middle">
                    <div className="flex items-center gap-2">
                      <TokenIcon token={insight.token} imageUrl={insight.imageUrl} className="self-center" />
                      <span className="leading-none">{insight.token}</span>
                    </div>
                  </TableCell>
                  <TableCell>{insight.platform}</TableCell>
                  <TableCell>{insight.raised}</TableCell>
                  <TableCell>{insight.description}</TableCell>
                  <TableCell>{insight.date}</TableCell>
                </TableRow>
              );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
