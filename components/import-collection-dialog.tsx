import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { useFileTr\eeStore } from "@/hooks/use-file-store";
import { postmanJSONImporter, importFromZip } from "@/lib/importer";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImportCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportCollectionDialog({ open, onOpenChange }: ImportCollectionDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string>("");
  const { mergeFiles } = useFileTreeStore();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const fileExtension = file.name.toLowerCase().split('.').pop();
      if (fileExtension !== 'json' && fileExtension !== 'zip') {
        setError("Please select a valid .json or .zip file");
        return;
      }
      
      setSelectedFile(file);
      setError("");
    }
  };

  const handleImportCollection = async () => {
    if (!selectedFile) {
      setError("Please select a file to import");
      return;
    }

    setIsImporting(true);
    setError("");

    try {
      const fileExtension = selectedFile.name.toLowerCase().split('.').pop();
      let fileNodes;

      if (fileExtension === 'json') {
        // Handle JSON import (Postman collection)
        const reader = new FileReader();
        
        const fileContent = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => {
            try {
              const content = e.target?.result as string;
              resolve(content);
            } catch (error) {
              reject(error);
            }
          };
          
          reader.onerror = () => {
            reject(new Error("Failed to read file"));
          };
          
          reader.readAsText(selectedFile);
        });

        try {
          const content = JSON.parse(fileContent);
          
          // Validate that it's a Postman collection
          if (!content.info || !content.item) {
            throw new Error("Invalid Postman collection format");
          }

          // Parse the collection using the importer
          fileNodes = postmanJSONImporter(content);
          
          if (fileNodes.length === 0) {
            throw new Error("No requests found in the collection");
          }
        } catch (parseError) {
          throw new Error(parseError instanceof Error ? parseError.message : "Failed to parse JSON file");
        }
      } else if (fileExtension === 'zip') {
        // Handle ZIP import
        try {
          fileNodes = await importFromZip(selectedFile);
          
          if (fileNodes.length === 0) {
            throw new Error("No files found in the ZIP archive");
          }
        } catch (zipError) {
          throw new Error(zipError instanceof Error ? zipError.message : "Failed to extract ZIP file");
        }
      } else {
        throw new Error("Unsupported file type. Please select a .json or .zip file");
      }

      // Merge with existing files
      mergeFiles(fileNodes);
      
      // Close dialog and reset state
      onOpenChange(false);
      setSelectedFile(null);
      setError("");
      
      console.log(`Successfully imported ${fileNodes.length} items from ${fileExtension.toUpperCase()} file`);
    } catch (error) {
      console.error("Error importing collection:", error);
      setError(error instanceof Error ? error.message : "Failed to import collection");
    } finally {
      setIsImporting(false);
    }
  };

  const resetDialog = () => {
    setSelectedFile(null);
    setError("");
    setIsImporting(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      resetDialog();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="font-geist max-w-md">
        <DialogHeader>
          <DialogTitle>Import Collection</DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Upload collection file</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".json,.zip"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="collection-file"
                  disabled={isImporting}
                />
                <label htmlFor="collection-file" className="flex-1">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:border-muted-foreground/50 transition-colors cursor-pointer">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Choose a collection file
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Supports .json (Postman) and .zip files
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
              
              {selectedFile && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleImportCollection}
                disabled={!selectedFile || isImporting}
                className="w-full"
              >
                {isImporting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Collection
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}