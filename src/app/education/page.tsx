"use client"

import React, { useEffect } from 'react'
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import {Download, PlayCircleIcon, ArrowDownCircle, GraduationCap} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router'
 



function Education() {

  return (
    <div className="space-y-4 items-center items-col">
    <Card>
        <CardHeader className=' w-full flex justify-center bg-green-500'>
            <CardTitle className='flex text-3xl font-extrabold justify-center text-center'> Disaster Preparedness Education</CardTitle>
            <CardDescription className='flex font-extrabold justify-center text-center text-2xl text-white'> Knowledge. Safety. Resilience.</CardDescription>
        </CardHeader>
       
    </Card>
     <Button className= 'w-1/4  ml-96 items-center text-center text-1xl text-green-300 bg-white border-2 border-green'>
     See Modules
    </Button>
    </div>
  )
 
}

export default Education

