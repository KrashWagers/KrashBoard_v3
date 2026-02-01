"use client"

import { getNHLTeamLogo } from '../shared/utils'
import { CustomXAxisTickProps } from '../shared/types'

export const CustomXAxisTick = ({ x, y, payload, dataLength = 0 }: CustomXAxisTickProps) => {
  if (!payload || !payload.value || x === undefined || y === undefined) return null
  
  const [opponent, date] = payload.value.split('\n')
  const logoPath = getNHLTeamLogo(opponent)
  
  // Dynamic sizing based on number of data points
  let logoSize = 16
  let fontSize = 9
  let yOffset = 28
  
  if (dataLength > 50) {
    logoSize = 10
    fontSize = 7
    yOffset = 22
  } else if (dataLength > 30) {
    logoSize = 13
    fontSize = 8
    yOffset = 25
  }
  
  const halfSize = logoSize / 2
  
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Team Logo */}
      <image
        x={-halfSize}
        y={5}
        width={logoSize}
        height={logoSize}
        href={logoPath}
      />
      {/* Date */}
      <text 
        x={0} 
        y={yOffset + 3} 
        textAnchor="middle" 
        fill="hsl(var(--muted-foreground))" 
        fontSize={fontSize}
      >
        {date}
      </text>
    </g>
  )
}

