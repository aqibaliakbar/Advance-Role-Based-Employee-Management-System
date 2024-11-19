// src/pages/Employees.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "../redux/features/employeeSlice";
import { fetchBranches } from "../redux/features/brancheSlice";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy, ImageIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import EmployeeInfoViewDialog from "@/components/EmployeeInfoViewDialog";

const EmployeeForm = ({ employee = null, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    role: "employee",
    branch_id: "",
    salary: "",
    cnic_number: "",
    ...employee,
  });

  const [cnicImages, setCnicImages] = useState({
    front: null,
    back: null,
  });

  const [imagePreviews, setImagePreviews] = useState({
    front: employee?.cnic_front_url || null,
    back: employee?.cnic_back_url || null,
  });

  const [createdEmployee, setCreatedEmployee] = useState(null);

  const { items: branches } = useSelector((state) => state.branches);
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Set the file
    setCnicImages((prev) => ({
      ...prev,
      [type]: file,
    }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviews((prev) => ({
        ...prev,
        [type]: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      const result = await onSubmit({
        formData,
        cnicImages,
      });

      if (result?.temporaryPassword) {
        setCreatedEmployee({
          email: result.email,
          password: result.temporaryPassword,
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const canEditRole = user?.role === "admin";

  if (createdEmployee) {
    return (
      <div className="space-y-6">
        <Alert className="bg-green-50 border-green-200">
          <AlertTitle className="text-lg font-semibold text-green-800">
            Employee Created Successfully
          </AlertTitle>
          <AlertDescription>
            <div className="mt-4 space-y-4">
              <div className="bg-white p-4 rounded-md border border-green-200">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Email:</span>
                    <span>{createdEmployee.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Temporary Password:</span>
                    <span className="font-mono bg-gray-50 px-2 py-1 rounded">
                      {createdEmployee.password}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Email: ${createdEmployee.email}\nTemporary Password: ${createdEmployee.password}`
                    );
                    toast({
                      title: "Copied",
                      description: "Credentials have been copied to clipboard",
                    });
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Credentials
                </Button>
                <Button
                  onClick={() => {
                    setCreatedEmployee(null);
                    onCancel();
                  }}
                >
                  Done
                </Button>
              </div>

              <p className="text-sm text-green-700 bg-green-50 p-3 rounded-md">
                Please share these credentials securely with the employee. The
                employee should change their password after first login.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            name="role"
            value={formData.role}
            onValueChange={(value) => handleSelectChange("role", value)}
            disabled={!canEditRole}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              {canEditRole && <SelectItem value="admin">Admin</SelectItem>}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="branch">Branch</Label>
          <Select
            name="branch_id"
            value={formData.branch_id}
            onValueChange={(value) => handleSelectChange("branch_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="salary">Salary</Label>
          <Input
            id="salary"
            name="salary"
            type="number"
            value={formData.salary}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cnic_number">CNIC Number</Label>
          <Input
            id="cnic_number"
            name="cnic_number"
            value={formData.cnic_number}
            onChange={handleChange}
            placeholder="00000-0000000-0"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* CNIC Front */}
        <div className="space-y-2">
          <Label>CNIC Front</Label>
          <div className="border rounded-lg p-4 space-y-4">
            {imagePreviews.front ? (
              <div className="relative aspect-[1.6/1] bg-gray-50 rounded-lg overflow-hidden">
                <img
                  src={imagePreviews.front}
                  alt="CNIC Front Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="aspect-[1.6/1] bg-gray-50 rounded-lg flex items-center justify-center">
                <ImageIcon className="h-10 w-10 text-gray-400" />
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "front")}
              required={!employee?.cnic_front_url}
            />
          </div>
        </div>

        {/* CNIC Back */}
        <div className="space-y-2">
          <Label>CNIC Back</Label>
          <div className="border rounded-lg p-4 space-y-4">
            {imagePreviews.back ? (
              <div className="relative aspect-[1.6/1] bg-gray-50 rounded-lg overflow-hidden">
                <img
                  src={imagePreviews.back}
                  alt="CNIC Back Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="aspect-[1.6/1] bg-gray-50 rounded-lg flex items-center justify-center">
                <ImageIcon className="h-10 w-10 text-gray-400" />
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "back")}
              required={!employee?.cnic_back_url}
            />
          </div>
        </div>
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
              {employee ? "Updating..." : "Creating..."}
            </div>
          ) : employee ? (
            "Update Employee"
          ) : (
            "Add Employee"
          )}
        </Button>
      </div>
    </form>
  );
};

const Employees = () => {
  const dispatch = useDispatch();
  const {
    items: employees,
    loading,
    error,
  } = useSelector((state) => state.employees);
  const { user } = useSelector((state) => state.auth);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [viewEmployee, setViewEmployee] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchBranches());
  }, [dispatch]);

  const handleSubmit = async (data) => {
    try {
      if (selectedEmployee) {
        // Handle update
        const result = await dispatch(
          updateEmployee({
            id: selectedEmployee.id,
            formData: data.formData,
            cnicImages: data.cnicImages,
          })
        ).unwrap();

        toast({
          title: "Success",
          description: "Employee updated successfully",
        });

        setShowDialog(false); // Close dialog immediately for updates
        return result;
      } else {
        // Handle create
        const result = await dispatch(addEmployee(data)).unwrap();

        toast({
          title: "Success",
          description: "Employee added successfully",
        });

        // Don't close the dialog here - let the user see the credentials
        return result;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await dispatch(deleteEmployee(id)).unwrap();
        toast({
          title: "Success",
          description: "Employee deleted successfully",
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

  const canManageEmployees = user?.role === "admin" || user?.role === "manager";

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md">
        Error loading employees: {error}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Employees</CardTitle>
        {canManageEmployees && (
          <Button
            onClick={() => {
              setSelectedEmployee(null);
              setShowDialog(true);
            }}
          >
            Add Employee
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Salary</TableHead>
                  {canManageEmployees && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.full_name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell className="capitalize">
                      {employee.role}
                    </TableCell>
                    <TableCell>{employee.branch?.name}</TableCell>
                    <TableCell>${employee.salary}</TableCell>
                    {canManageEmployees && (
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setViewEmployee(employee);
                              setShowViewDialog(true);
                            }}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setShowDialog(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(employee.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedEmployee ? "Edit Employee" : "Add New Employee"}
              </DialogTitle>
            </DialogHeader>
            <EmployeeForm
              employee={selectedEmployee}
              onSubmit={handleSubmit}
              onCancel={() => setShowDialog(false)}
              loading={loading}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Employee Details</DialogTitle>
            </DialogHeader>
            {viewEmployee && (
              <EmployeeInfoViewDialog
                employee={viewEmployee}
                onEdit={(employee) => {
                  setShowViewDialog(false);
                  setSelectedEmployee(employee);
                  setShowDialog(true);
                }}
                onDelete={(id) => {
                  setShowViewDialog(false);
                  handleDelete(id);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default Employees;
