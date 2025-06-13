import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { useFileTreeStore } from "@/hooks/use-file-store";
import { postmanJSONImporter } from "@/lib/importer";
import { Alert, AlertDescription } from "@/components/ui/alert";

const COLLECTION_TEMPLATES = [
  { id: "spotify", name: "Spotify Collection" },
  { id: "tavus", name: "Tavus Collection" },
  { id: "github", name: "Paystack Collection" },
  { id: "twitter", name: "Flutterwave Collection" },
];

export function ImportCollectionDialog() {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string>("");
  const { setFiles } = useFileTreeStore();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          
          // Validate that it's a Postman collection
          if (!content.info || !content.item) {
            throw new Error("Invalid Postman collection format");
          }

          // Parse the collection using the importer
          const fileNodes = postmanJSONImporter(content);
          
          if (fileNodes.length === 0) {
            throw new Error("No requests found in the collection");
          }

          // Update the file tree
          setFiles(fileNodes);
          
          // Close dialog and reset state
          setOpen(false);
          setSelectedFile(null);
          setSelectedTemplate("");
          setError("");
          
          console.log(`Successfully imported ${fileNodes.length} items from collection`);
        } catch (parseError) {
          console.error("Error parsing collection:", parseError);
          setError(parseError instanceof Error ? parseError.message : "Failed to parse collection file");
        } finally {
          setIsImporting(false);
        }
      };

      reader.onerror = () => {
        setError("Failed to read file");
        setIsImporting(false);
      };

      reader.readAsText(selectedFile);
    } catch (error) {
      console.error("Error importing collection:", error);
      setError("Failed to import collection");
      setIsImporting(false);
    }
  };

  const handleTemplateImport = () => {
    if (!selectedTemplate) {
      setError("Please select a template");
      return;
    }
    
    // TODO: Implement template import logic
    console.log("Importing template:", selectedTemplate);
    setError("Template import not yet implemented");
  };

  const resetDialog = () => {
    setSelectedFile(null);
    setSelectedTemplate("");
    setError("");
    setIsImporting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        resetDialog();
      }
    }}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 hover:bg-muted-foreground/20 hover:dark:bg-muted-foreground/15"
        >
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
      </DialogTrigger>
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
            <Label>Choose a template</Label>
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
              disabled={isImporting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {COLLECTION_TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleTemplateImport}
              disabled={!selectedTemplate || isImporting}
              variant="outline"
              className="w-full"
            >
              Import Template
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Upload Postman collection</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="collection-file"
                  disabled={isImporting}
                />
                <label htmlFor="collection-file" className="flex-1">
                  <Button 
                    variant="outline" 
                    asChild 
                    className="w-full"
                    disabled={isImporting}
                  >
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File (.json)
                    </span>
                  </Button>
                </label>
              </div>
              
              {selectedFile && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground truncate">
                    {selectedFile.name}
                  </span>
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