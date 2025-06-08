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
import { Upload } from "lucide-react";

const COLLECTION_TEMPLATES = [
  { id: "spotify", name: "Spotify Collection" },
  { id: "tavus", name: "Tavus Collection" },
  { id: "github", name: "Paystack Collection" },
  { id: "twitter", name: "Flutterwave Collection" },
];

export function ImportCollectionDialog() {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle file upload
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          console.log("Parsed collection:", content);
          // Handle the parsed collection
        } catch (error) {
          console.error("Error parsing collection:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
      <DialogContent className="font-geist">
        <DialogHeader className="sr-only">
          <DialogTitle>Import Collection</DialogTitle>
        </DialogHeader>
        <div className="space-y-8 py-4">
          <div className="space-y-2">
            <Label>Choose a template</Label>
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
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
          </div>
          <div className="space-y-2">
            <Label>Or upload postman collection</Label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                id="collection-file"
              />
              <label htmlFor="collection-file">
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File (.json)
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
