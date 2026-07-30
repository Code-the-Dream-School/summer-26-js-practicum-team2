const variants = {
  line: 'h-4 rounded-pill',
  rectangle: 'min-h-24 rounded-md',
}

export default function Skeleton({
  variant = 'rectangle',
  width,
  height,
  className = '',
  style,
  ...props
}) {
  const styles = variants[variant] || variants.rectangle

  return (
    <div
      {...props}
      aria-hidden="true"
      className={`motion-safe:animate-pulse bg-neutral-200 ${styles} ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
    />
  )
}

export function SkeletonLine(props) {
  return (
    <Skeleton
      variant="line"
      {...props}
    />
  )
}

export function SkeletonRectangle(props) {
  return (
    <Skeleton
      variant="rectangle"
      {...props}
    />
  )
}