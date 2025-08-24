
'use client';

import { useContext, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppContext } from '@/contexts/app-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function UnitManagement() {
    const { units, addUnit, deleteUnit, loading } = useContext(AppContext);
    const [newUnit, setNewUnit] = useState('');
    const { toast } = useToast();

    const handleAddUnit = async () => {
        if (!newUnit.trim()) {
            toast({ title: 'Error', description: 'Unit name cannot be empty.', variant: 'destructive' });
            return;
        }
        const success = await addUnit(newUnit);
        if (success) {
            setNewUnit('');
            toast({ title: 'Success', description: 'Unit added.' });
        }
    };

    const handleDeleteUnit = async (id: string) => {
        // TODO: Check if unit is in use before deleting
        const success = await deleteUnit(id);
        if (success) {
            toast({ title: 'Success', description: 'Unit deleted.' });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Units</CardTitle>
                <CardDescription>Add or delete item units of measurement.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2 mb-4">
                    <div className="flex-grow">
                        <Label htmlFor="new-unit" className="sr-only">New Unit</Label>
                        <Input
                            id="new-unit"
                            placeholder="Enter new unit name"
                            value={newUnit}
                            onChange={(e) => setNewUnit(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleAddUnit} disabled={loading}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Unit
                    </Button>
                </div>
                <div className="border rounded-md">
                     <ul className="divide-y">
                        {units.map((unit) => (
                            <li key={unit.id} className="flex items-center justify-between p-3">
                                <span className="text-sm font-medium">{unit.name}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleDeleteUnit(unit.id)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                     <span className="sr-only">Delete {unit.name}</span>
                                </Button>
                            </li>
                        ))}
                        {units.length === 0 && (
                            <li className="p-3 text-center text-sm text-muted-foreground">No units found.</li>
                        )}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
