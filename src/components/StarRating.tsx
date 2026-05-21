import { StarFill } from './icons';

interface StarRatingProps {
  rating: number;
  count?: number;
}

export default function StarRating({ rating, count }: Readonly<StarRatingProps>) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.25 && rating - full < 0.75;
  return (
    <div className="bm-stars">
      {[0, 1, 2, 3, 4].map(i => (
        <StarFill
          key={i}
          width={13}
          height={13}
          style={{ color: i < full ? '#F5A623' : i === full && half ? '#F5A623' : 'var(--ink-4)' }}
        />
      ))}
      <b>{rating.toFixed(2)}</b>
      {count != null && <span className="ct">({count.toLocaleString('id-ID')} ulasan)</span>}
    </div>
  );
}
