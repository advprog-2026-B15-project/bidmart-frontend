interface LogoProps {
  size?: number;
  inverse?: boolean;
}

export default function Logo({ size = 22, inverse = false }: Readonly<LogoProps>) {
  return (
    <span className="bm-logo" style={{ fontSize: size, color: inverse ? '#fff' : undefined }}>
      Bid<span>Mart</span>
    </span>
  );
}
