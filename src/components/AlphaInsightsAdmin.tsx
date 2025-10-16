import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

export const AlphaInsightsAdmin = () => {
  const [insights, setInsights] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const data = await api.getAllAlphaInsights();
      setInsights(data);
    } catch (error) {
      toast.error('Failed to fetch insights');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.updateAlphaInsight(formData.id, formData);
        toast.success('Insight updated');
      } else {
        await api.createAlphaInsight(formData);
        toast.success('Insight created');
      }
      setFormData({});
      setIsEditing(false);
      fetchInsights();
    } catch (error) {
      toast.error('Failed to save insight');
    }
  };

  const handleEdit = (insight: any) => {
    setFormData(insight);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAlphaInsight(id);
      toast.success('Insight deleted');
      fetchInsights();
    } catch (error) {
      toast.error('Failed to delete insight');
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Manage Alpha Insights</h2>

      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <Input name="title" placeholder="Title" value={formData.title || ''} onChange={handleInputChange} required />
          <Select onValueChange={handleCategoryChange} value={formData.category || ''}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Dự án">Dự án</SelectItem>
              <SelectItem value="Tips">Tips</SelectItem>
            </SelectContent>
          </Select>
          <Input name="token" placeholder="Token" value={formData.token || ''} onChange={handleInputChange} />
          <Input name="sector" placeholder="Sector" value={formData.sector || ''} onChange={handleInputChange} />
          <Input name="raised" placeholder="Raised" value={formData.raised || ''} onChange={handleInputChange} />
          <Input name="date" type="date" value={formData.date || ''} onChange={handleInputChange} />
          <Input name="imageUrl" placeholder="Image URL" value={formData.imageUrl || ''} onChange={handleInputChange} />
          <Input name="url" placeholder="URL" value={formData.url || ''} onChange={handleInputChange} />
        </div>
        <Textarea name="description" placeholder="Description" value={formData.description || ''} onChange={handleInputChange} className="mt-4" />
        <Button type="submit" className="mt-4">{isEditing ? 'Update' : 'Create'}</Button>
        {isEditing && <Button variant="ghost" onClick={() => { setIsEditing(false); setFormData({}); }}>Cancel</Button>}
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Token</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {insights.map((insight) => (
            <TableRow key={insight.id}>
              <TableCell>{insight.title}</TableCell>
              <TableCell>{insight.category}</TableCell>
              <TableCell>{insight.token}</TableCell>
              <TableCell>{insight.sector}</TableCell>
              <TableCell>
                <Button variant="ghost" onClick={() => handleEdit(insight)}>Edit</Button>
                <Button variant="destructive" onClick={() => handleDelete(insight.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
