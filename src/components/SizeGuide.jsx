import { X } from 'lucide-react'

const APPAREL = [
  ['XS', '42–44', '88–92', '72–76'],
  ['S', '46–48', '92–96', '76–80'],
  ['M', '50–52', '96–100', '80–84'],
  ['L', '54–56', '100–106', '84–90'],
  ['XL', '58–60', '106–112', '90–96'],
  ['XXL', '62–64', '112–118', '96–102'],
]

const FOOT = [
  ['38', '24', '6'],
  ['39', '24.7', '6.5'],
  ['40', '25.3', '7.5'],
  ['41', '26', '8'],
  ['42', '26.7', '9'],
  ['43', '27.3', '10'],
  ['44', '28', '11'],
]

const th = {
  textAlign: 'left',
  fontSize: 11,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  color: 'var(--faint)',
  padding: '10px 12px',
  borderBottom: '1px solid var(--line-2)',
}
const td = { padding: '10px 12px', fontSize: 14, borderBottom: '1px solid var(--line)' }

export default function SizeGuide({ open, onClose, category }) {
  if (!open) return null
  const footwear = category === 'Zapatillas'

  return (
    <div
      className="overlay"
      style={{ zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{ width: 540, maxWidth: '100%', maxHeight: '86vh', overflowY: 'auto', background: 'var(--bg-2)' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 22px',
            borderBottom: '1px solid var(--line)',
            position: 'sticky',
            top: 0,
            background: 'var(--bg-2)',
          }}
        >
          <div className="anton" style={{ fontSize: 24 }}>Guía de talles</div>
          <button className="icon-btn" aria-label="Cerrar" onClick={onClose} style={{ border: 'none' }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ padding: '20px 22px' }}>
          {footwear ? (
            <>
              <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 14 }}>
                Medí tu pie del talón a la punta y buscá el largo en la tabla.
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>AR</th>
                    <th style={th}>Largo (cm)</th>
                    <th style={th}>US</th>
                  </tr>
                </thead>
                <tbody>
                  {FOOT.map((r) => (
                    <tr key={r[0]}>
                      <td style={{ ...td, fontWeight: 700 }}>{r[0]}</td>
                      <td style={td}>{r[1]}</td>
                      <td style={td}>{r[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <>
              <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 14 }}>
                Medidas en centímetros. Si estás entre dos talles, elegí el más grande para un calce holgado.
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Talle</th>
                    <th style={th}>Equiv.</th>
                    <th style={th}>Pecho</th>
                    <th style={th}>Cintura</th>
                  </tr>
                </thead>
                <tbody>
                  {APPAREL.map((r) => (
                    <tr key={r[0]}>
                      <td style={{ ...td, fontWeight: 700 }}>{r[0]}</td>
                      <td style={td}>{r[1]}</td>
                      <td style={td}>{r[2]}</td>
                      <td style={td}>{r[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          <p style={{ color: 'var(--faint)', fontSize: 12, marginTop: 16 }}>
            ¿Dudas con el talle? Escribinos por WhatsApp y te ayudamos.
          </p>
        </div>
      </div>
    </div>
  )
}
