import React from 'react'
import Scan4CallContact from './component/AskingNumber'
import Calling from './component/Calling'

export default function page() {
  return (
    <div className="min-h-screen h-screen bg-[#07132C] overflow-hidden p-0 m-0">
      <Scan4CallContact />
      <Calling></Calling>
    </div>
  )
}

