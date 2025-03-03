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
        <CardContent  className='flex justify-center'>
            <Card className='w-full'>
                <CardHeader className='flex justify-center'>
                    <CardDescription className='flex flex-col md:flex-row  justify-evenly gap-3'>
                        <span className=' flex  justify-center items-center flex-col text-center border border-3 border-gray-200 rounded-xl p-4 hover:bg-blue-100'>
                            <PlayCircleIcon className='text-green-400'/> 
                            <div>
                                Click enroll to begin a course. <br /> 
                                Progress is saved automatically
                            </div>
                        </span> 
                        <span className=' flex justify-center items-center flex-col text-center border border-3 border-gray-200 rounded-xl p-4 hover:bg-blue-100'>
                            <Download className='text-green-400'/>
                            <div>
                                Any module is downloadable as a PDF. <br />
                                Download by clicking the download button 
                            </div>
                        </span>
                    </CardDescription>                   
                </CardHeader>
                <div className='flex flex-col items-center m-3'>
                    <span className='text-center text-2xl font-extrabold m-5'>Check out our courses</span>
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <ArrowDownCircle className='text-green-400' />
                    </motion.div>
                </div>
                <CardContent className="md:grid md:grid-cols-3 gap-4 sm:flex sm:flex-col">
                    <Card className='w-full hover:bg-blue-100'>
                        <CardHeader>
                            <CardTitle className='flex justify-center text-xl font-extrabold text-center'> <span className='text-green-300'>1</span> Safety during Earth quake </CardTitle>
                            <CardDescription className='flex justify-center text-lg text-gray-600 text-center'> Learn how to stay safe and respond effectively when an earthquake strikes.</CardDescription>
                        </CardHeader>
                        <CardContent className='flex justify-between'>
                            <Button className='bg-green-300 text-black hover:text-white'><GraduationCap className='text-black hover:text-white'/> Enroll</Button>
                            <Button variant="outline" className='hover:bg-black hover:text-white'> <Download className='text-green-400'/> Download</Button>
                        </CardContent>
                    </Card>
                    <Card className='w-full hover:bg-blue-100'>
                        <CardHeader>
                            <CardTitle className='flex justify-center text-xl font-extrabold text-center'> <span className='text-green-300'>2</span> Safety during Storms and Cyclones </CardTitle>
                            <CardDescription className='flex justify-center text-lg text-gray-600 text-center'> Learn how to stay safe and respond effectively when facing a storm and cyclones.</CardDescription>
                        </CardHeader>
                        <CardContent className='flex justify-between'>
                            <Button className='bg-green-300 text-black hover:text-white'><GraduationCap className='text-black hover:text-white'/> Enroll</Button>
                            <Button variant="outline" className='hover:bg-black hover:text-white'> <Download className='text-green-400'/> Download</Button>
                        </CardContent>
                    </Card>
                    <Card className='w-full hover:bg-blue-100'>
                        <CardHeader>
                            <CardTitle className='flex justify-center text-xl font-extrabold text-center'> <span className='text-green-300'>3</span> Safety during Storms and Cyclones </CardTitle>
                            <CardDescription className='flex justify-center text-lg text-gray-600 text-center'> Learn how to stay safe and respond effectively when facing a storm and cyclones.</CardDescription>
                        </CardHeader>
                        <CardContent className='flex justify-between'>
                            <Button className='bg-green-300 text-black hover:text-white'><GraduationCap className='text-black hover:text-white'/> Enroll</Button>
                            <Button variant="outline" className='hover:bg-black hover:text-white'> <Download className='text-green-400'/> Download</Button>
                        </CardContent>
                    </Card>
                    <Card className='w-full hover:bg-blue-100'>
                        <CardHeader>
                            <CardTitle className='flex justify-center text-xl font-extrabold text-center'> <span className='text-green-300'>4</span> Safety during Earth quake </CardTitle>
                            <CardDescription className='flex justify-center text-lg text-gray-600 text-center'> Learn how to stay safe and respond effectively when an earthquake strikes.</CardDescription>
                        </CardHeader>
                        <CardContent className='flex justify-between'>
                            <Button className='bg-green-300 text-black hover:text-white'><GraduationCap className='text-black hover:text-white'/> Enroll</Button>
                            <Button variant="outline" className='hover:bg-black hover:text-white'> <Download className='text-green-400'/> Download</Button>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </CardContent>
    </Card>
  )
}

export default Education