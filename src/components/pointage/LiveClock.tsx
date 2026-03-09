'use client'

import { useState, useEffect } from 'react'

const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const MOIS = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']

function formatClock(d: Date) {
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const jour = JOURS[d.getDay()]
  const num = String(d.getDate()).padStart(2, '0')
  const mois = MOIS[d.getMonth()]
  return { time: `${hh}H${mm}`, date: `${jour} ${num} ${mois}` }
}

export function LiveClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const { time, date } = formatClock(now)

  return (
    <div className="flex items-baseline gap-2">
      <span className="font-display font-semibold text-xl text-ww-orange tracking-wide">
        {time}
      </span>
      <span className="font-display font-semibold text-sm text-ww-muted hidden sm:inline">
        {date}
      </span>
    </div>
  )
}
