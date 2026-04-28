'use client'

import ExecomAvatar from './ExecomAvatar'

interface SubMember {
  name: string
  initials: string
  photo?: any
}

interface TeamCardProps {
  id: string
  name: string
  team: string
  delay?: string
  subs: SubMember[]
  photo?: any
}

export default function TeamCard({ id, name, team, delay, subs, photo }: TeamCardProps) {
  const toggleTeam = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const isOpen = card.classList.contains('open')
    document.querySelectorAll('.team-card.open').forEach(c => c.classList.remove('open'))
    if (!isOpen) card.classList.add('open')
  }

  return (
    <div className={`team-card reveal ${delay || ''}`} onClick={toggleTeam}>
      <div className="team-head">
        <div className="team-head-left">
          <ExecomAvatar photo={photo} initials={id} name={name} size="sm" />
          <div className="team-info">
            <div className="team-name">{name}</div>
            <div className="team-label">{team}</div>
          </div>
        </div>
        <div className="team-toggle">▾</div>
      </div>
      <div className="team-subs">
        {subs.map((sub, sIdx) => (
          <div key={sIdx} className="sub-member">
            <ExecomAvatar photo={sub.photo ?? null} initials={sub.initials} name={sub.name} size="sm" />
            <div>
              <div className="sub-name">{sub.name}</div>
              <div className="sub-role">Sub-head</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
