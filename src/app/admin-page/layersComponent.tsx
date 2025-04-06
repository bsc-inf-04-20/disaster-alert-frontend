'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, CheckCircle } from 'lucide-react'
import axios from 'axios'
import { DialogTitle } from '@radix-ui/react-dialog'
import { getIconUrl } from '../utils/ImageProgressing'
import { Commet } from 'react-loading-indicators';
import { toast } from 'sonner'


const SpatialLayerPicker = () => {
  const [selectedFiles, setSelectedFiles] = useState<any>(null)
  const [iconSearch, setIconSearch] = useState<string>('')
  const [selectedIconUrl, setSelectedIconUrl] = useState<string>('')
  const [openDialog, setOpenDialog] = useState(false)
  const [icons, setIcons] = useState<any[]>([])
  const [featureName, setFeatureName] = useState<string>('')
  const [uploadingNewfeature, setUploadingNewfeature] = useState<boolean>(false)

  const handleFileChange = (event: any) => {
    setSelectedFiles(event.target.files)
  }

  const handleIconSearch = async () => {
    try {
      const response = await axios.get(
        `https://api.iconify.design/search?query=${iconSearch}`
      )

      console.log(response.data.icons)
      setIcons(response.data.icons) // Store the icons found in the search
    } catch (error) {
      console.error('Error fetching icons:', error)
    }
  }

  const handleIconSelect = (iconUrl: string) => {
    setSelectedIconUrl(iconUrl)
    setOpenDialog(false)
  }

  const handleSubmit = async () => {

    setUploadingNewfeature(true)

    if (!selectedFiles || !selectedIconUrl) {
      alert('Please select a layer file and icon.')
      setUploadingNewfeature(false);
    }

    const formData = new FormData()
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('files', selectedFiles[i])
    }
    formData.append('featureIconURL', selectedIconUrl)

    formData.append('featureName', featureName)

    try {
        const response = await fetch('http://localhost:3000/features/upload', {
          method: 'POST',
          body: formData, 
        });
      
        if (!response.ok) {
          // Parse the error response JSON
          const errorResponse = await response.json();
          throw new Error(errorResponse.message || `HTTP error! status: ${response.status}`);
        }
      
        const result = await response.json();
        console.log('Data successfully uploaded', result);
        toast.success('Feature successfully uploaded');
        setUploadingNewfeature(false);
      } catch (error:any) {
        console.error('Error submitting form:', error);
        toast.error(error.message); // This will now show only the specific error message
        setUploadingNewfeature(false);
      }
  }

  return (
    <div>
      <Card className="bg-gray-100 m-6 w-fit">
        <CardContent className='flex flex-col items-center gap-4'>
          <CardHeader>
            <CardTitle className="flex justify-center">Spatial Layer Picker</CardTitle>
            <CardDescription className="flex justify-center">
              Select a spatial layer and an icon for your project (shp and dbf).
            </CardDescription>
          </CardHeader>
          <div className="flex flex-col items-center gap-4">
            <div className='flex flex-col gap-2'>
              <Input
                type="file"
                id="layer-files"
                multiple
                onChange={handleFileChange}
                accept=".shp,.dbf"
              />
              <Input
                type='text'
                placeholder='feature name'
                onChange={(e: any) => setFeatureName(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setOpenDialog(true)}
            >
              Select Icon {selectedIconUrl? <CheckCircle size={18} color='green' />:<X size={18} color='red' />}
            </Button>
            {selectedIconUrl? <img src={selectedIconUrl} className="w-8 h-8" /> : ""}    
            <Dialog open={openDialog} onOpenChange={(isOpen) => setOpenDialog(isOpen)}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Select an Icon
                        </DialogTitle>
                    </DialogHeader>
                    <div>

                    <div className='flex gap-2'>    
                        <Input
                            value={iconSearch}
                            onChange={(e: any) => setIconSearch(e.target.value)}
                            placeholder="Search for an icon"
                            className="mb-4"
                        />
                        <Button onClick={handleIconSearch}>Search</Button>
                    </div>
                    {icons.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 max-h-[60vh] overflow-y-auto">
                        {icons.map((icon: any, index:number) => (
                            <Card
                            key={index}
                            onClick={() => handleIconSelect(getIconUrl(icon).url)}
                            className="cursor-pointer p-2 text-center"
                            >
                            <img src={getIconUrl(icon).url} alt={icon.name} className="w-8 h-8" />
                            <div>{icon.name}</div>
                            </Card>
                        ))}
                        </div>
                    )}
                    </div>
                    <DialogFooter>
                    <Button variant="secondary" onClick={() => setOpenDialog(false)}>
                        <X size={16} /> Close
                    </Button>
                    </DialogFooter>
                </DialogContent>
                </Dialog>

                {
                    uploadingNewfeature ? (
                        <Commet color="#32cd32" size="small" />
                    ) : (
                        <Button variant="default" className="mt-4" onClick={handleSubmit}>
                            Submit
                        </Button>
                    )
                }
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




export default SpatialLayerPicker
