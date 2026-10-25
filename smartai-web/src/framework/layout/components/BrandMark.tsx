export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9" fill="var(--sa-color-primary, #415fff)" />
      <path
        d="M9.2 22.6 15.1 9.4c.34-.77 1.44-.77 1.78 0l5.9 13.2c.26.58-.17 1.23-.8 1.23h-2.5a.9.9 0 0 1-.83-.56l-3.2-7.55-3.2 7.55a.9.9 0 0 1-.83.56h-2.5c-.63 0-1.06-.65-.8-1.23Z"
        fill="#fff"
      />
    </svg>
  )
}
