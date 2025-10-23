import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const basePayload = {
      ...formData,
      platform: formData.platform || "DeFi", // Default to DeFi if not provided
      imageUrl: formData.imageUrl || null,
      url: formData.url || null,
    };
    try {
      if (isEditing) {
        const payload = { ...basePayload, log: `Updated insight: ${formData.title}` };
        await api.updateAlphaInsight(formData.id, payload);
        toast.success('Insight updated');
      } else {
        const payload = { ...basePayload, log: `Created insight: ${formData.title}` };
        await api.createAlphaInsight(payload);
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

      <div className="flex space-x-2 mb-4">
        <Button onClick={() => setFormData({ ...formData, category: 'Dự án' })}>Dự án</Button>
        <Button onClick={() => setFormData({ ...formData, category: 'Tips' })}>Tips</Button>
      </div>
      
      <div className="flex space-x-2 mb-4">
        <Button onClick={() => setFormData({ ...formData, platform: 'DeFi' })}>Platform: DeFi</Button>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <Input name="title" placeholder="Title" value={formData.title || ''} onChange={handleInputChange} required />
          <Input name="category" placeholder="Category" value={formData.category || ''} onChange={handleInputChange} />
          <Input name="token" placeholder="Token" value={formData.token || ''} onChange={handleInputChange} />
          <Input name="platform" placeholder="Platform" value={formData.platform || ''} onChange={handleInputChange} />
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
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {insights.map((insight) => (
            <TableRow key={insight.id}>
              <TableCell>{insight.title}</TableCell>
              <TableCell>{insight.category}</TableCell>
              <TableCell>{insight.token}</TableCell>
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
