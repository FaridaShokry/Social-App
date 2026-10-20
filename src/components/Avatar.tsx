type Props = { name?: string; photo?: string; size?: number };

export default function Avatar({ name = "?", photo, size = 44 }: Props) {
  const style = { width: size, height: size };
  if (photo) {
    return <img src={photo} alt={name} style={style} className="rounded-full object-cover" />;
  }
  return (
    <div style={style}
      className="rounded-full bg-brand text-white grid place-items-center font-bold shrink-0">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}