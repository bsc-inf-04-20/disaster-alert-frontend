'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      alert('Please provide a title and select a PDF file.');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', selectedFile);
    formData.append('title', title);

    try {
      const response = await fetch('/api/modules/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Module uploaded successfully!');
        setSelectedFile(null);
        setTitle('');
      } else {
        alert('Failed to upload module.');
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
          <CardTitle className="flex justify-center">Upload Educational Module</CardTitle>
          <CardDescription className="flex justify-center">
            Upload a PDF module with a title.
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
            accept=".pdf"
            onChange={handleFileChange}
            className="w-64"
          />

          <Button onClick={handleUpload} disabled={!selectedFile || !title}>
            Upload Module
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
