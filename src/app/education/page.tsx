"use client"

import React, { useEffect } from 'react'
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import {Download, PlayCircleIcon, ArrowDownCircle, GraduationCap} from 'lucide-react';
import { Button } from '@/components/ui/button';

function Education() {

  return (
    <Card>
        <CardHeader className='flex justify-center'>
            <CardTitle className='flex text-3xl font-extrabold justify-center text-center'> Disaster Preparedness Education</CardTitle>
            <CardDescription className='flex font-extrabold justify-center text-center text-2xl text-green-300'> Knowledge. Safety. Resilience.</CardDescription>
        </CardHeader>
 
    </Card>
  )
}

export default Education

