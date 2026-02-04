 "use client"
 
 import * as React from "react"
 
 export function MlbModeClient() {
   React.useEffect(() => {
     document.body.classList.add("mlb-mode")
     return () => {
       document.body.classList.remove("mlb-mode")
     }
   }, [])
 
   return null
 }
