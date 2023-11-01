import { useParams } from "react-router-dom";
import MenuItemForm from './index';

export default function EditMenuItemForm() {
    const { restaurantId, menuItemId } = useParams();

    return (
        <MenuItemForm
            formType="Edit"
            restaurantId={restaurantId}
            menuItemId={menuItemId}
        />
    );
}
