// src/pages/Branches.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBranches,
  addBranch,
  updateBranch,
  deleteBranch,
} from "../redux/features/brancheSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";


const BranchForm = ({ branch = null, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    ...branch,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Branch Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : branch ? (
            "Update Branch"
          ) : (
            "Add Branch"
          )}
        </Button>
      </div>
    </form>
  );
};

const Branches = () => {
  const dispatch = useDispatch();
  const {
    items: branches,
    loading,
    error,
  } = useSelector((state) => state.branches);
  const { user } = useSelector((state) => state.auth);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchBranches());
  }, [dispatch]);

  const handleSubmit = async (formData) => {
    try {
      if (selectedBranch) {
        await dispatch(
          updateBranch({ id: selectedBranch.id, ...formData })
        ).unwrap();
        toast({
          title: "Success",
          description: "Branch updated successfully",
        });
      } else {
        await dispatch(addBranch(formData)).unwrap();
        toast({
          title: "Success",
          description: "Branch added successfully",
        });
      }
      setShowDialog(false);
      setSelectedBranch(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
      try {
        await dispatch(deleteBranch(id)).unwrap();
        toast({
          title: "Success",
          description: "Branch deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-600 rounded-md">
        You don't have permission to access this page.
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md">
        Error loading branches: {error}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Branches</CardTitle>
        <Button
          onClick={() => {
            setSelectedBranch(null);
            setShowDialog(true);
          }}
        >
          Add Branch
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium">{branch.name}</TableCell>
                  <TableCell>{branch.location}</TableCell>
                  <TableCell>
                    {new Date(branch.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBranch(branch);
                          setShowDialog(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(branch.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedBranch ? "Edit Branch" : "Add New Branch"}
              </DialogTitle>
            </DialogHeader>
            <BranchForm
              branch={selectedBranch}
              onSubmit={handleSubmit}
              onCancel={() => setShowDialog(false)}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default Branches;
