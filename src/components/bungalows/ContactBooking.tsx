export function ContactBooking({
  email,
  telephone,
}: {
  email?: string | null
  telephone?: string | null
}) {
  const linkClass =
    'text-sm font-body text-ww-text hover:text-ww-orange hover:underline transition-colors duration-150 cursor-pointer'

  return (
    <>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-base leading-none">📧</span>
        {email ? (
          <a href={`mailto:${email}`} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {email}
          </a>
        ) : (
          <span className="text-ww-muted">—</span>
        )}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-base leading-none">📞</span>
        {telephone ? (
          <a href={`tel:${telephone}`} className={linkClass}>
            {telephone}
          </a>
        ) : (
          <span className="text-ww-muted">—</span>
        )}
      </div>
    </>
  )
}
