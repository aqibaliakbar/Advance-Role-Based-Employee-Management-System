// src/components/EmployeeInfoViewDialog.jsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  BadgeDollarSign,
  CreditCard,
  Download,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";
import { getSignedUrl } from "@/lib/utils";

const InfoItem = ({ icon: Icon, label, value, className = "" }) => (
  <div className="flex items-start space-x-3">
    <Icon className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={cn("text-base", className)}>{value}</p>
    </div>
  </div>
);

const CNICImageCard = ({ type, url, name }) => {
  const { toast } = useToast();
  const [imageState, setImageState] = useState({
    loading: true,
    error: false,
    signedUrl: url,
    downloading: false,
  });

  useEffect(() => {
    let mounted = true;

    const refreshUrl = async () => {
      if (!url) return;

      try {
        setImageState((prev) => ({ ...prev, loading: true, error: false }));
        const newSignedUrl = await getSignedUrl(url);

        if (mounted) {
          setImageState((prev) => ({
            ...prev,
            signedUrl: newSignedUrl,
            loading: false,
          }));
        }
      } catch (error) {
        console.error("Error refreshing URL:", error);
        if (mounted) {
          setImageState((prev) => ({
            ...prev,
            loading: false,
            error: true,
          }));
          toast({
            title: "Error",
            description: "Failed to load image",
            variant: "destructive",
          });
        }
      }
    };

    refreshUrl();

    return () => {
      mounted = false;
    };
  }, [url, toast]);

  const handleDownload = async () => {
    try {
      setImageState((prev) => ({ ...prev, downloading: true }));

      // Get fresh signed URL for download
      const downloadUrl = await getSignedUrl(url);

      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${name.replace(/\s+/g, "_")}_cnic_${type}.${
        blob.type.split("/")[1] || "png"
      }`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);

      toast({
        title: "Success",
        description: "Image downloaded successfully",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Error",
        description: "Failed to download image",
        variant: "destructive",
      });
    } finally {
      setImageState((prev) => ({ ...prev, downloading: false }));
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="aspect-[1.6/1] relative rounded-lg overflow-hidden border bg-gray-50">
            {imageState.loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            )}

            {imageState.signedUrl && !imageState.error ? (
              <img
                src={imageState.signedUrl}
                alt={`CNIC ${type}`}
                className={cn(
                  "w-full h-full object-contain transition-opacity duration-200",
                  imageState.loading ? "opacity-0" : "opacity-100"
                )}
                onLoad={() =>
                  setImageState((prev) => ({ ...prev, loading: false }))
                }
                onError={() =>
                  setImageState((prev) => ({ ...prev, error: true }))
                }
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 space-y-2">
                {imageState.error ? (
                  <>
                    <p className="text-red-500">Failed to load image</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setImageState((prev) => ({
                          ...prev,
                          loading: true,
                          error: false,
                        }))
                      }
                    >
                      Retry
                    </Button>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-10 w-10" />
                    <span className="text-sm">No image available</span>
                  </>
                )}
              </div>
            )}
          </div>

          {imageState.signedUrl && !imageState.error && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleDownload}
              disabled={imageState.downloading || imageState.loading}
            >
              {imageState.downloading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download {type.charAt(0).toUpperCase() + type.slice(1)}
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const EmployeeInfoViewDialog = ({ employee, onEdit, onDelete }) => {


  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex gap-2">
          <h2 className="text-2xl font-bold text-gray-900">
            {employee.full_name}
          </h2>
          <Badge
            variant={
              employee.role === "admin"
                ? "default"
                : employee.role === "manager"
                ? "secondary"
                : "outline"
            }
            className="mt-1"
          >
            {employee.role}
          </Badge>
        </div>
    
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <InfoItem
                icon={User}
                label="Full Name"
                value={employee.full_name}
              />
              <InfoItem icon={Mail} label="Email" value={employee.email} />
              <InfoItem
                icon={Phone}
                label="Phone"
                value={employee.phone || "Not provided"}
              />
              <InfoItem
                icon={MapPin}
                label="Address"
                value={employee.address || "Not provided"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Employment Information */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <InfoItem
                icon={Building2}
                label="Branch"
                value={employee.branch?.name || "Not assigned"}
              />
              <InfoItem
                icon={BadgeDollarSign}
                label="Salary"
                value={`$${Number(employee.salary).toLocaleString()}`}
                className="font-semibold text-green-600"
              />
              <InfoItem
                icon={CreditCard}
                label="CNIC Number"
                value={employee.cnic_number || "Not provided"}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CNIC Images */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">CNIC Images</h3>
        <div className="grid grid-cols-2 gap-6">
          {/* Front CNIC */}
          <CNICImageCard
            type="front"
            url={employee.cnic_front_url}
            name={employee.full_name}
          />

          {/* Back CNIC */}
          <CNICImageCard
            type="back"
            url={employee.cnic_back_url}
            name={employee.full_name}
          />
        </div>
      </div>

      {/* Created Date */}
      <div className="pt-4 text-sm text-gray-500 border-t">
        <p>
          Employee created on:{" "}
          {new Date(employee.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};

export default EmployeeInfoViewDialog;