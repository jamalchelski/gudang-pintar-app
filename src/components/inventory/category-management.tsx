
'use client';

import { useContext, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppContext } from '@/contexts/app-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CategoryManagement() {
    const { categories, addCategory, deleteCategory, loading } = useContext(AppContext);
    const [newCategory, setNewCategory] = useState('');
    const { toast } = useToast();

    const handleAddCategory = async () => {
        if (!newCategory.trim()) {
            toast({ title: 'Error', description: 'Category name cannot be empty.', variant: 'destructive' });
            return;
        }
        const success = await addCategory(newCategory);
        if (success) {
            setNewCategory('');
            toast({ title: 'Success', description: 'Category added.' });
        }
    };

    const handleDeleteCategory = async (id: string) => {
        // TODO: Check if category is in use
        const success = await deleteCategory(id);
        if (success) {
            toast({ title: 'Success', description: 'Category deleted.' });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Categories</CardTitle>
                <CardDescription>Add, or delete item categories.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2 mb-4">
                    <div className="flex-grow">
                        <Label htmlFor="new-category" className="sr-only">New Category</Label>
                        <Input
                            id="new-category"
                            placeholder="Enter new category name"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleAddCategory} disabled={loading}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                    </Button>
                </div>
                <div className="border rounded-md">
                    <ul className="divide-y">
                        {categories.map((cat) => (
                            <li key={cat.id} className="flex items-center justify-between p-3">
                                <span className="text-sm font-medium">{cat.name}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleDeleteCategory(cat.id)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                    <span className="sr-only">Delete {cat.name}</span>
                                </Button>
                            </li>
                        ))}
                         {categories.length === 0 && (
                            <li className="p-3 text-center text-sm text-muted-foreground">No categories found.</li>
                        )}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
