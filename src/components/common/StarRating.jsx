import { Star } from "lucide-react";

const StarIcon = ({ selected }) => (
    <span>
        {selected ? <Star size={16} fill="#FFC107" stroke="#FFC107" /> : <Star size={16} className="text-gray-300" />}
    </span>
);

const StarRating = ({ rating }) => {
    let stars = [];
    for (let i = 0; i < 5; i++) {
        stars.push(<StarIcon key={i} selected={i < rating} />);
    }
    return (
        <div className="rating-stars">
            {stars}
        </div>
    );
};

export default StarRating;
