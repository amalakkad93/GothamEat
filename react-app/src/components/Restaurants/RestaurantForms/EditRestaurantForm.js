import { useParams } from "react-router-dom";
import RestaurantForm from './index';

export default function EditRestaurantForm() {
  const { restaurantId } = useParams();

  return (
      <RestaurantForm
          formType="Edit"
          restaurantId={restaurantId}
      />
  );
}
