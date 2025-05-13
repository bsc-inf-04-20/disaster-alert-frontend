'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function UploadModuleCard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !title) {
      alert('Please provide a title and select a JSON file.');
      return;
    }

    const formData = new FormData();
    formData.append('json', selectedFile); // field name must match your backend
    formData.append('title', title);

    try {
      const response = await fetch('http://localhost:3000/modules/upload-json', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('JSON module uploaded successfully!');
        setSelectedFile(null);
        setTitle('');
      } else {
        alert('Failed to upload JSON module.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading module.');
    }
  };

  return (
    <Card className="bg-gray-100 m-6 w-fit">
      <CardContent className="flex flex-col items-center gap-4">
        <CardHeader>
          <CardTitle className="flex justify-center">Upload JSON Module</CardTitle>
          <CardDescription className="flex justify-center">
            Upload a .json file with a title.
          </CardDescription>
        </CardHeader>

        <div className="flex flex-col items-center gap-4">
          <Input
            type="text"
            placeholder="Enter module title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-64"
          />

          <Input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="w-64"
          />

          <Button onClick={handleUpload} disabled={!selectedFile || !title}>
            Upload JSON
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
