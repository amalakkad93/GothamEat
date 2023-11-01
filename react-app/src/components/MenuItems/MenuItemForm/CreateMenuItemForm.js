import MenuItemForm from './index';

export default function CreateMenuItemForm({ restaurantId, setReloadPage }) {
  return (
    <MenuItemForm
      formType="Create"
      restaurantId={restaurantId}
      setReloadPage={setReloadPage} 
    />
  );
}
