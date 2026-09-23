import Galaxy from '../../../components/Galaxy'

function Starfield() {
  return (
    <div className="starfield" aria-hidden="true">
      <Galaxy
        density={1.08}
        glowIntensity={0.18}
        hueShift={220}
        mouseInteraction
        mouseRepulsion={false}
        rotation={[0.86, -0.5]}
        rotationSpeed={0.018}
        saturation={0.36}
        speed={0.72}
        starSpeed={0.34}
        transparent
        twinkleIntensity={0.42}
      />
    </div>
  )
}

export default Starfield
